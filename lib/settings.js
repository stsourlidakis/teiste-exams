module.exports = {
	defaultPort: 80,	//user when process.env.PORT is missing
	uploadFileSizeLimit: 10000000,	//fileSize in bytes
	checkPhotoContent: !true,	//flag for concept check for uploads
	uploadRequiredTags: ['paper', 'text', 'no person'],	//required tags when checking concepts for uploads
	defaultUploaderName: 'anon',
	defaultImageActive: true,
}
