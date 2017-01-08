const settings = require('./settings'),
	db = require('./mongo'),
	courses = require('./courses'),
	multer = require('multer'),
	Clarifai = require('clarifai');

const upload = multer({ 
		storage: multer.memoryStorage({}),
		limits: {fileSize: settings.uploadFileSizeLimit},
	}).single('image'),
	clar = new Clarifai.App(
	  process.env.CLARIFAI_CLIENTID,
	  process.env.CLARIFAI_SECRET
	);

module.exports.settings = settings;
module.exports.db = db;
module.exports.courses = courses;

module.exports.checkRequiredInputs = function (req, res, next){
	if(req.body.courseName && courses.nameExists(req.body.courseName) && req.body.year){
		next();
	} else {
		res.render('upload', {error: true, resultMessage: 'Please fill out all required fields', courses: courses.all});
	}
};

module.exports.checkUploadedFile = function (req, res, next){	//also parses the form
	upload(req, res, function (err) {
		let errorMsg;
		if(err){
			if(err.code == 'LIMIT_FILE_SIZE'){
				errorMsg = 'File too big. Max filesize: 10MB';
			} else {
				errorMsg = 'Something went wrong';
			}
		} else if(!req.file){
			errorMsg = 'Image not found';
		} else if(req.file.mimetype.indexOf('image') == -1){
			errorMsg = 'The file is not an image';
		}

		if(errorMsg != undefined){
			res.render('upload', {error: true, resultMessage: errorMsg, courses: utils.courses.all});
		} else {
			next();
		}
	});
}

module.exports.checkPhotoContent = function (req, res, next){
	if(settings.checkPhotoContent===false){
		return next();
	}
	clar.models.predict(Clarifai.GENERAL_MODEL, {base64: req.file.buffer.toString('base64')})
	.then(
		function(response) {
			const tags = response.outputs[0].data.concepts.map(function(concept){
				return concept.name;
			});
			const missingTags = getMissingTags(tags);
			if(missingTags.length!==0){
				console.log(response.outputs[0].input.data.image.url + ' '+missingTags.join(', '));
				res.render('upload', {error: true, resultMessage: "Image rejected", courses: utils.courses.all});
			} else {
				next();
			}
		},
		function(err) {
			console.error(err);
			res.render('upload', {error: true, resultMessage: "Image validation failed", courses: utils.courses.all});
		}
	)
	.catch(function(err){
		console.log(err);
		res.render('upload', {error: true, resultMessage: "Server error while validating the photo", courses: utils.courses.all});
	});
}

function getMissingTags(photoTags){
	return settings.uploadRequiredTags.filter(function(tag){
		return photoTags.indexOf(tag) === -1;
	});
}
