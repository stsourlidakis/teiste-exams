const express = require('express'),
	app = express(),
	monk = require('monk'),
	multer = require('multer'),
	bodyParser = require('body-parser'),
	imgur = require('imgur'),
	exphbs  = require('express-handlebars');

require('dotenv').config();

const
	db = monk('mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@'+process.env.DB_HOST+'/'+process.env.DB_NAME),
	images = db.get('images'),
	
	upload = multer({ storage: multer.memoryStorage({}) });

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
	images.find({}, {fields: {url: 1, tags: 1, _id: 0}})
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

app.post('/upload', upload.single('image'), function(req, res){
	const albumId = 'mnVUvevYnrhvxq0';	//inf
	imgur.uploadBase64(req.file.buffer.toString('base64'), albumId )
    .then(function (imgurRes) {
        images.insert({
			'url': imgurRes.data.link,
			'deleteUrl': imgurRes.data.deletehash,
			'tags': req.body.tags.split(','),
			'reports': 0,
			'active': true,
			'uploader': 'anon',
		})
		.then((docs)=>{
			res.json(docs);
		})
		.catch((err) => {
			res.send(err);
		});
    })
    .catch(function (err) {
		res.send ( err.message );
    });
});
app.get('/upload',function(req, res){
	res.render('upload');
});

app.listen(2095, function () {
	console.log('Api listening on port 2095!');
});