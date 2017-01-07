const multer = require('multer'),
	upload = multer({ 
		storage: multer.memoryStorage({}),
		limits: {fileSize: 10000000}, //fileSize in bytes
	}).single('image');

module.exports.checkUploadedFile = function (req, res, next){
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
			next();
		}
	});
}
