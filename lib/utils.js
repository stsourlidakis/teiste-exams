const settings = require('./settings'),
	db = require('./mongo'),
	courses = require('./courses'),
	multer = require('multer'),
	Clarifai = require('clarifai'),
	imgur = require('imgur'),
	recaptcha = require('express-recaptcha'),
	httpsUrl = require('https-url');

const upload = multer({ 
		storage: multer.memoryStorage({}),
		limits: {fileSize: settings.uploadFileSizeLimit},
	}),
	clar = new Clarifai.App(
	  process.env.CLARIFAI_CLIENTID,
	  process.env.CLARIFAI_SECRET
	),
	semesters = db.get('semesters');

recaptcha.init(process.env.RECAPTCHA_KEY, process.env.RECAPTCHA_SECRET);

module.exports.settings = settings;
module.exports.db = db;
module.exports.courses = courses;
module.exports.semesters = semesters;
module.exports.multerUpload = upload;
module.exports.httpsUrl = httpsUrl;

module.exports.verifyReCaptchaForContact = function (req, res, next){
	recaptcha.verify(req, function(error){
		if(!error){
			next();
		}
		else{
			console.log(error);
			res.render('contact', {error: true, resultMessage: 'Incorrect captcha!'});
		}
	});
};

module.exports.verifyReCaptchaForUpload = function (req, res, next){
	if(settings.useCaptchaOnUploads){
		recaptcha.verify(req, function(error){
			if(!error){
				next();
			}
			else{
				res.render('upload', {error: true, resultMessage: 'Incorrect captcha!', courses: courses.all, years: settings.years});
			}
		});
	} else {
		next();
	}
};

module.exports.checkRequiredInputs = function (req, res, next){
	if(
		req.body.courseName && 
		courses.nameExists(req.body.courseName) && 
		req.body.year && 
		module.exports.yearExists(req.body.year) && 
		req.body.period && 
		module.exports.periodExists(req.body.period)
	){
		next();
	} else {
		res.render('upload', {error: true, resultMessage: 'Please fill out all required fields', courses: courses.all, years: settings.years});
	}
};

module.exports.checkUploadedFile = function (req, res, next){	//also parses the form
	upload.single('image')(req, res, function (err) {
		let errorMsg;
		if(err){
			if(err.code == 'LIMIT_FILE_SIZE'){
				errorMsg = 'File too big. Max filesize: '+(settings.uploadFileSizeLimit/1000000)+'MB';
			} else {
				errorMsg = 'Something went wrong';
			}
		} else if(!req.file){
			errorMsg = 'Image not found';
		} else if(req.file.mimetype.indexOf('image') == -1){
			errorMsg = 'The file is not an image';
		}

		if(errorMsg != undefined){
			res.render('upload', {error: true, resultMessage: errorMsg, courses: courses.all, years: settings.years});
		} else {
			next();
		}
	});
}

module.exports.checkPhotoContent = function (req, res, next){
	if(settings.checkPhotoContent===false){
		const logData = {
			checkedPhotoContent: false,
			accepted: true,
			originalName: req.file.originalname,
			tags: [],
			missingTags: [],
			url: '',
			ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
		};
		logUploadResults(logData);

		return next();
	}

	clar.models.predict(Clarifai.GENERAL_MODEL, {base64: req.file.buffer.toString('base64')})
	.then(
		function(response) {
			const tags = response.outputs[0].data.concepts.map(function(concept){
				return concept.name;
			});

			const missingTags = getMissingTags(tags),
				accepted = missingTags.length===0,
				logData = {
					accepted: accepted,
					originalName: req.file.originalname,
					tags: tags,
					missingTags: missingTags,
					url: response.outputs[0].input.data.image.url,
					ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
				};

			logUploadResults(logData);

			if(!accepted){
				res.render('upload', {error: true, resultMessage: "Image rejected", courses: courses.all, years: settings.years});
			} else {
				next();
			}
		},
		function(err) {
			console.error(err);
			res.render('upload', {error: true, resultMessage: "Image validation failed", courses: courses.all, years: settings.years});
		}
	)
	.catch(function(err){
		console.log(err);
		res.render('upload', {error: true, resultMessage: "Server error while validating the photo", courses: courses.all, years: settings.years});
	});
}

module.exports.courseItemDecrease = function(courseKey, year){
	module.exports.updateItemCountForCourse(courseKey, year, false);
}

module.exports.courseItemIncrease = function(courseKey, year){
	module.exports.updateItemCountForCourse(courseKey, year, true);
}

module.exports.updateItemCountForCourse = function(courseKey, year, incremenet){
	semesters.findOne({"courses.key": courseKey})
	.then(function(doc) {
		if(doc==null){
			throw 'item not found';
		} else {
			doc.courses.forEach(function(course){
				if(course.key===courseKey){
					if(incremenet){
						course.items++;
						if(course.itemsForYear[year]){
							course.itemsForYear[year]++;
						} else {
							course.itemsForYear[year] = 1;
						}
					} else {
						course.items--;
						if(course.itemsForYear[year]>0){
							course.itemsForYear[year]--;
						}
					}
				}
			});
			return semesters.update({"_id": doc._id}, {$set:{courses: doc.courses}});
		}
	})
	.catch(function(err) {
		console.error(err);
	});
}

module.exports.deleteImage = function(id, callback){
	const images = db.get('images');
	images.findOne({"_id": id})
	.then(function(docs) {
		if(docs==null){
			throw 'item not found';
		} else {
			return imgur.deleteImage(docs.deleteHash);
		}
	})
	.then(function(status) {
		return images.findOneAndDelete({"_id": id});
	})
	.then(function(doc) {
		module.exports.courseItemDecrease(doc.courseKey, doc.year);
		console.log('Image '+id+' deleted');
		callback();
	})
	.catch(function(err) {
		console.error(err);
	});
}

module.exports.periodExists = function(period){
	return settings.periods.indexOf(period) !== -1;
}

module.exports.yearExists = function(year){
	return settings.years.indexOf(year) !== -1;
}

module.exports.isValidMongoID = function(id){
	return new RegExp("^[0-9a-fA-F]{24}$").test(id);
}

module.exports.log404 = function(url, referer, ip){
	const errors = db.get('errors'),
		data = {
			type: '404',
			url: url,
			referer: referer,
			ip: ip
		};
		
	errors.insert(data)
	.then((docs)=>{})
	.catch(function (err) {
		console.log('Error while loggin error: ', data);
		console.log(err);
	});
}

function logUploadResults(data){
	const uploadLog = db.get('uploadLog');
	uploadLog.insert(data)
	.then((docs)=>{})
	.catch(function (err) {
		console.log('Error while loggin image upload with data: ', data);
		console.log(err);
	});
}

function getMissingTags(photoTags){
	return settings.uploadRequiredTags.filter(function(tag){
		return photoTags.indexOf(tag) === -1;
	});
}

function deleteNextImage(callback){
	const images = db.get('images');
	images.findOne({})
	.then(function(doc) {
		if(doc){
			module.exports.deleteImage(doc._id, callback);
		} else {
			console.log('No image to delete');
		}
	})
	.catch(function(err){
		console.log(err);
	});
}

function deleteImages(n){
	if(n<1){
		console.log('Finished image deletion');
		return;
	} else {
		deleteNextImage(function(){
			n--;
			if(n>0){
				deleteImages(n);
			}
		});	
	}
}
