const express = require('express'),
	app = express(),
	monk = require('monk');

const  url = 'localhost:27017/teilam-themata',
	db = monk(url);

const images = db.get('images');

app.get('/',function(req, res){
	images.find({})
		.then((docs)=>{
			res.json(docs);
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

app.listen(2095, function () {
	console.log('Api listening on port 2095!');
});