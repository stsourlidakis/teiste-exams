const express = require('express'),
	router = express.Router(),
	bodyParser = require('body-parser'),
	utils = require('../utils'),
	crypto = require('crypto');

const analytics = utils.db.get('analytics'),
	jsonParser = bodyParser.urlencoded({
	  extended: true
	});

router.post('/index/search', jsonParser, function (req, res) {
	if(req.body.str && req.body.course){
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		const fingerprint = crypto.createHash('md5').update(ip+req.headers['user-agent']).digest('hex');

		analytics.insert({
			page: 'index',
			type: 'courseSearch',
			str: req.body.str,
			course: req.body.course,
			fingerprint: fingerprint
		})
		.then(function(){
			res.sendStatus(201);
		}).catch(function(err){
			if(utils.settings.log500){
				utils.log500(err, req.originalUrl, req.header('Referer'), ip);
			}
			res.sendStatus(500);
		})
	} else {
		//todo log error
		res.sendStatus(400);
	}
});

module.exports = router;
