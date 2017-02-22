const express = require('express'),
	router = express.Router(),
	bodyParser = require('body-parser'),
	utils = require('../utils');

const analytics = utils.db.get('analytics'),
	jsonParser = bodyParser.urlencoded({
	  extended: true
	});

router.get('/list', function(req, res) {
	res.render('analytics/list');
});

router.get('/list/search', function(req, res) {
	analytics.find({type: "courseSearch"}, {sort: {_id: -1}, limit: 150})
	.then(function(docs){
		res.render('analytics/search', {courseSearches: docs});
	})
	.catch(function(err){
		if(utils.settings.log500){
			utils.log500(err, req);
		}
		utils.sendToErrorPage(err, req, res);
	})
});

router.post('/index/search', jsonParser, function (req, res) {
	if(req.body.str && req.body.courseKey && utils.courses.keyExists(req.body.courseKey) && req.body.duration){
		const searchedString = req.body.str=='null'?'':req.body.str;

		analytics.insert({
			page: 'index',
			type: 'courseSearch',
			str: searchedString,	//the string the user typed before navigating go the course, empty in case of no search
			courseKey: req.body.courseKey,
			courseName: utils.courses.getNameFromKey(req.body.courseKey),
			duration: req.body.duration,	//sec
			fingerprint: utils.getUserFingerprint(req)
		})
		.then(function(){
			res.sendStatus(201);
		}).catch(function(err){
			if(utils.settings.log500){
				utils.log500(err, req);
			}
			res.sendStatus(500);
		})
	} else {
		//todo log error
		res.sendStatus(400);
	}
});

module.exports = router;
