require('dotenv').config();
const express = require('express'),
	app = express(),
	imgur = require('imgur'),
	exphbs = require('express-handlebars'),
	utils = require('./lib/utils');

const images = utils.db.get('images'),
	semesters = utils.db.get('semesters');

var hbs = exphbs.create({
	defaultLayout: 'main',
	partialsDir: ['views/partials/']
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

app.get('/insert/sample',function(req, res){
	images.insert({
			'url':'http://i.imgur.com/2GZMNDS.jpg',
			'deleteUrl':'http://imgur.com/some/delete/url',
			'tags':['one', 'two', 'three'],
			'reports': 0,
			'active': true,
			'uploader': 'anon'
		})
		.then((docs)=>{
			res.json(docs);
		})
		.catch((err) => {
			res.send(err);
		});
});

app.route('/upload')
	.get(function(req, res){
		res.render('upload', {courses: utils.courses.all});
	})
	.post(utils.checkUploadedFile, utils.checkRequiredInputs, utils.checkPhotoContent, function(req, res){
		const albumId = process.env.IMGUR_ALBUM_DELETE_HASH; //delete hash because the album is anonymous
		imgur.uploadBase64(req.file.buffer.toString('base64'), albumId )
		.then(function (imgurRes) {
			return images.insert({
				'url': imgurRes.data.link,
				'deleteUrl': imgurRes.data.deletehash,
				'courseKey': utils.courses.getKeyFromName(req.body.courseName),
				'year': req.body.year,
				'reports': 0,
				'active': true,
				'uploader': utils.settings.defaultUploaderName,
			});
		})
		.then((docs)=>{
			res.render('upload', {error: false, resultMessage: 'Uploaded!', courses: utils.courses.all});
		})
		.catch(function (err) {
			console.log(err);
			res.render('upload', {error: true, resultMessage: 'Failed!', courses: utils.courses.all});
		});
	});

const port = process.env.PORT || utils.settings.defaultPort;
app.listen(port, function () {
	console.log('App listening on port '+port+'!');
});
