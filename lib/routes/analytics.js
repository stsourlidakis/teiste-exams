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

router.get('/list/uptime', function(req, res) {
	res.render('analytics/uptime');
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

router.get('/list/search/stats', function(req, res) {
	analytics.find({type: "courseSearch"}, {sort: {_id: -1}})
	.then(function(docs){
		let searches = 0;
		let durations = [];
		const n = docs.length;
		for(let i=0; i<n; i++){
			durations.push( Number(docs[i].duration) );
			if(docs[i].str){
				searches++;
			}
		}

		durations = durations.sort(function(a, b){
			return a - b;
		});

		const averageStay = ~~(durations.reduce(function(pv, cv) { return pv + cv; }, 0)/durations.length);
		const medianStay = durations[~~(durations.length/2)];
		const searchPerc = (searches*100/n).toFixed(2);

		const result = {
			type: 'analytics',
			description: 'What the user did before navigating to a course',
			period: {
				start: docs[n-1]._id.getTimestamp().toISOString(),
				stop: docs[0]._id.getTimestamp().toISOString()
			},
			total: n,
			userSearched: searches,
			userScrolled: n-searches,
			percentages: {
				search: Number(searchPerc),
				scroll: Number(100-searchPerc)
			},
			stayDuration: {
				average: averageStay,
				median: medianStay
			}
		};

		res.json(result);
	})
	.catch(function(err){
		console.log(err);
		if(utils.settings.log500){
			utils.log500(err, req);
		}
		utils.sendToErrorPage(err, req, res);
	})
});

router.get('/list/rejectedImage', function(req, res) {
	analytics.find({type: "rejectedImage"}, {sort: {_id: -1}, limit: 150})
	.then(function(docs){
		res.render('analytics/rejectedImage', {rejectedImages: docs});
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
