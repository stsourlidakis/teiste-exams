module.exports = {
	defaultPort: 80,	//user when process.env.PORT is missing
	uploadFileSizeLimit: 5000000,	//fileSize in bytes
	checkPhotoContent: true,	//flag for concept check for uploads
	uploadRequiredTags: ['paper', 'text', 'no person'],	//required tags when checking concepts for uploads
	periods: ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος'],	//required tags when checking concepts for uploads
	defaultUploaderName: 'anon',
	defaultImageActive: true,
}
