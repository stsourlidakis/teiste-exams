let mongoUrl;
if(process.env.ENVIROMENT==='production'){
	mongoUrl = 'mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@'+process.env.DB_HOST+'/'+process.env.DB_NAME;
} else {
	mongoUrl = 'mongodb://'+process.env.DB_USER_DEV+':'+process.env.DB_PASS_DEV+'@'+process.env.DB_HOST_DEV+'/'+process.env.DB_NAME_DEV;
}

module.exports = require('monk')(mongoUrl);
