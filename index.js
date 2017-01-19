require('dotenv').config();
const express = require('express'),
	app = express(),
	imgur = require('imgur'),
	thumbnails = require('imgur-thumbnails'),
	exphbs = require('express-handlebars'),
	utils = require('./lib/utils');

const images = utils.db.get('images'),
	semesters = utils.semesters;

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

imgur.setClientId(process.env.IMGUR_CLIENTID);

app.get('/',function(req, res){
	semesters.find({})
	.then((docs)=>{
		res.render('home', {semesters: docs});
	})
	.catch((err)=>{
		res.send(err);
	});
});

app.get('/about',function(req, res){
	res.render('about');
});

app.get('/contact',function(req, res){
	res.render('contact');
});

app.get('/course/:course/year/:year',function(req, res, next){
	if(utils.courses.keyExists(req.params.course) && utils.yearExists(req.params.year)){
		images.find({"courseKey": req.params.course, "year": req.params.year, active: true})
		.then((docs)=>{
			const metadata = {
				courseName: utils.courses.getNameFromKey(req.params.course),
				courseKey: req.params.course,
				year: req.params.year?req.params.year:false,
				count: docs.length
			};

			res.render('gallery', {meta: metadata, images: docs});
		})
		.catch((err)=>{
			res.send(err);
		});
	} else {
		next();	//default 404
	}
});

app.route('/upload')
	.get(function(req, res){
		res.render('upload', {courses: utils.courses.all, years: utils.settings.years});
	})
	.post(utils.checkUploadedFile, utils.checkRequiredInputs, utils.checkPhotoContent, function(req, res){
		const albumId = process.env.IMGUR_ALBUM_DELETE_HASH, //delete hash because the album is anonymous
			courseKey = utils.courses.getKeyFromName(req.body.courseName);

		imgur.uploadBase64(req.file.buffer.toString('base64'), albumId )
		.then(function (imgurRes) {
			return images.insert({
				'url': imgurRes.data.link,
				'thumbnailUrl': thumbnails.medium(imgurRes.data.link),
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
			res.render('upload', {error: false, resultMessage: 'Uploaded!', courses: utils.courses.all, years: utils.settings.years});
		})
		.catch(function (err) {
			console.log(err);
			res.render('upload', {error: true, resultMessage: 'Failed!', courses: utils.courses.all, years: utils.settings.years});
		});
	});

app.use(function (req, res, next) {	//default 404
	if(utils.settings.log404){
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		utils.log404(req.originalUrl, ip);
	}

	res.status(404).render("404");
});

const port = process.env.PORT || utils.settings.defaultPort;
app.listen(port, function () {
	console.log('App listening on port '+port+'!');
});
