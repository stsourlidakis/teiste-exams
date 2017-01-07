require('dotenv').config();
const express = require('express'),
	app = express(),
	monk = require('monk'),
	imgur = require('imgur'),
	exphbs = require('express-handlebars'),
	utils = require('./lib/utils');
	courses = require('./lib/courses');

const
	db = monk('mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@'+process.env.DB_HOST+'/'+process.env.DB_NAME),
	images = db.get('images');

var hbs = exphbs.create({
	defaultLayout: 'main',
	partialsDir: ['views/partials/']
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use('/public', express.static('public'));

imgur.setClientId(process.env.IMGUR_CLIENTID);

app.get('/',function(req, res){
	images.find({}, {fields: {url: 1, tags: 1, _id: 0}, sort: {_id: -1}})
		.then((docs)=>{
			res.render('home', {data: docs});
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
		res.render('upload', {courses: courses.all});
	})
	.post(utils.checkUploadedFile, utils.checkRequiredInputs, utils.checkPhotoContent, function(req, res){

		const albumId = 'mnVUvevYnrhvxq0';	//inf
		imgur.uploadBase64(req.file.buffer.toString('base64'), albumId )
		.then(function (imgurRes) {
			return images.insert({
				'url': imgurRes.data.link,
				'deleteUrl': imgurRes.data.deletehash,
				'course': req.body.course,
				'year': req.body.year,
				'reports': 0,
				'active': true,
				'uploader': 'anon',
			});
		})
		.then((docs)=>{
			res.render('upload', {error: false, resultMessage: 'Uploaded!'});
		})
		.catch(function (err) {
			res.render('upload', {error: true, resultMessage: 'Failed!'});
		});
	});

const port = process.env.PORT || 80;
app.listen(port, function () {
	console.log('App listening on port '+port+'!');
});
