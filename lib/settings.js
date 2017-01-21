module.exports = {
	defaultPort: 80,	//used when process.env.PORT is missing
	uploadFileSizeLimit: 5000000,	//fileSize in bytes
	checkPhotoContent: true,	//flag for concept check for uploads
	uploadRequiredTags: [['paper', 'page'], 'text', 'no person'],	//required tags when checking concepts for uploads
	periods: ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος'],	//allowed exam periods
	years: ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017'],	//allowed exam years
	defaultUploaderName: 'anon',
	defaultImageActive: true,	//flag for default image visibility
	log404: true,
	useCaptchaOnUploads: true,	//reCaptcha usage flag
}
