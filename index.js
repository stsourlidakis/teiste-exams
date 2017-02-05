require('dotenv').config();
const express = require('express'),
	app = express(),
	imgur = require('imgur'),
	thumbnails = require('imgur-thumbnails'),
	exphbs = require('express-handlebars'),
	utils = require('./lib/utils');

const images = utils.db.get('images'),
	semesters = utils.semesters,
	contactMessages = utils.db.get('contactMessages');

var hbs = exphbs.create({
	defaultLayout: 'main',
	partialsDir: ['views/partials/'],
	helpers: {
		ifGroupEveryOpen: function (index, every, options) {
			if( index%every === 0 ){
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		},
		ifGroupEveryClose: function (index, every, options) {
			if( options.data.last || (index + 1)%every === 0 ){
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		}
	}
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use('/public', express.static('public'));
app.use('/analytics', require('./lib/routes/analytics'));

imgur.setClientId(process.env.IMGUR_CLIENTID);

app.locals.GA_TRACK_ID = process.env.GA_TRACK_ID;
app.locals.RECAPTCHA_KEY = process.env.RECAPTCHA_KEY;
app.locals.PAYPAL_DONATE_ID = process.env.PAYPAL_DONATE_ID;
app.locals.useCaptchaOnUploads = utils.settings.useCaptchaOnUploads;

app.get('/',function(req, res){
	semesters.find({})
	.then((docs)=>{
		res.render('home', {semesters: docs});
	})
	.catch((err)=>{
		utils.sendToErrorPage(err, req, res);
	});
});

app.get('/all',function(req, res){
	images.find({active: true}, {sort: {_id: -1}})
	.then((docs)=>{
		const metadata = {
			courseName: "Όλα τα μαθήματα",
			courseKey: '',
			year: 'Όλα',
			count: docs.length
		};

		res.render('gallery', {meta: metadata, images: docs});
	})
	.catch((err)=>{
		utils.sendToErrorPage(err, req, res);
	});
});

app.get('/about',function(req, res){
	res.render('about');
});

app.route('/contact')
	.get(function(req, res){
		res.render('contact');
	})
	.post(utils.multerUpload.fields([]), utils.verifyReCaptchaForContact, function(req, res){
		const data = {
			name: req.body.name,
			email: req.body.email,
			msg: req.body.msg
		}

		contactMessages.insert(data)
		.then((docs) => {
			res.render('contact', {error: false, resultMessage: 'Το μήνυμα αποθηκεύτηκε'});
		})
		.catch((err) => {
			console.log('Error while saving contact message: ', data, 'error: ', err);
			res.render('contact', {error: true, resultMessage: 'Πρόβλημα κατά την αποθήκευση του μηνύματος, δοκιμάστε ξανά αργότερα'});
		});
		
	});

app.get('/course/:course/year/:year', function(req, res, next){
	if(utils.courses.keyExists(req.params.course) && (req.params.year==='all') || utils.yearExists(req.params.year)){
		let filter = {"courseKey": req.params.course, active: true};
		if(req.params.year!=='all'){
			filter.year = req.params.year;
		}

		images.find(filter, {sort: {year: -1}})
		.then((docs)=>{
			const metadata = {
				courseName: utils.courses.getNameFromKey(req.params.course),
				courseKey: req.params.course,
				year: req.params.year!=='all'?req.params.year:'Όλα',
				count: docs.length
			};

			res.render('gallery', {meta: metadata, images: docs});
		})
		.catch((err)=>{
			utils.sendToErrorPage(err, req, res);
		});
	} else {
		next();	//default 404
	}
});

app.get('/course/:course/exam/:id', function(req, res, next){
	if(utils.courses.keyExists(req.params.course) && utils.isValidMongoID(req.params.id)){
		images.findOne({"courseKey": req.params.course, "_id": req.params.id, active: true})
		.then((doc)=>{
			if(doc){
				const metadata = {
					courseName: utils.courses.getNameFromKey(doc.courseKey)
				};
				res.render('exam', {meta: metadata, image: doc});
			} else {
				next();	//default 404
			}
		})
		.catch((err)=>{
			next();	//default 404
		});
	} else {
		next();	//default 404
	}
});

app.route('/upload')
	.get(function(req, res){
		res.render('upload', {courses: utils.courses.all, years: utils.settings.years});
	})
	.post(utils.checkUploadedFile, utils.verifyReCaptchaForUpload, utils.checkRequiredInputs, utils.checkPhotoContent, function(req, res){
		const albumId = process.env.IMGUR_ALBUM_DELETE_HASH, //delete hash because the album is anonymous
			courseKey = utils.courses.getKeyFromName(req.body.courseName);

		imgur.uploadBase64(req.file.buffer.toString('base64'), albumId )
		.then(function (imgurRes) {
			const httpsUrl = utils.httpsUrl(imgurRes.data.link);
			
			return images.insert({
				'url': httpsUrl,
				'thumbnailUrl': thumbnails.medium(httpsUrl),
				'deleteHash': imgurRes.data.deletehash,
				'courseKey': courseKey,
				'year': req.body.year,
				'period': req.body.period,
				'active': utils.settings.defaultImageActive,
				'uploader': utils.settings.defaultUploaderName,
			});
		})
		.then((docs)=>{
			utils.courseItemIncrease(courseKey, req.body.year);
			res.render('upload', {error: false, resultMessage: 'Το θέμα αποθηκεύτηκε!', courses: utils.courses.all, years: utils.settings.years});
		})
		.catch(function (err) {
			console.log(err);
			const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			utils.log500(err, req.originalUrl, req.header('Referer'), ip);
			res.render('upload', {error: true, resultMessage: 'Κάτι πήγε στραβά, παρακαλώ δοκιμάστε ξανά.', courses: utils.courses.all, years: utils.settings.years});
		});
	});

app.use(function (req, res, next) {	//default 404
	if(utils.settings.log404 && req.originalUrl != '/favicon.ico'){
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		utils.log404(req.originalUrl, req.header('Referer'), ip);
	}

	res.status(404).render("404");
});

const port = process.env.PORT || utils.settings.defaultPort;
app.listen(port, function () {
	console.log('App listening on port '+port+'!');
});
