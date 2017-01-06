const express = require('express'),
	app = express(),
	monk = require('monk'),
	multer = require('multer'),
	bodyParser = require('body-parser'),
	imgur = require('imgur'),
	exphbs = require('express-handlebars'),
	courses = require('./lib/courses');

require('dotenv').config();

const
	db = monk('mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@'+process.env.DB_HOST+'/'+process.env.DB_NAME),
	images = db.get('images'),
	
	upload = multer({ 
		storage: multer.memoryStorage({}),
		limits: {fileSize: 10000000}, //fileSize in bytes
	}).single('image');

app.use(bodyParser.urlencoded({
	extended: true
}));

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
	.post(function(req, res){
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
				res.render('upload', {error: true, resultMessage: errorMsg});
			} else {
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
			}
		})
	});

const port = process.env.PORT || 80;
app.listen(port, function () {
	console.log('App listening on port '+port+'!');
});
