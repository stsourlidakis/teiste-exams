module.exports = {
  defaultPort: 80, //used when process.env.PORT is missing
  uploadFileSizeLimit: 5000000, //fileSize in bytes
  checkPhotoContent: true, //flag for concept check for uploads
  uploadRequiredTags: [['paper', 'page'], 'text', 'no person'], //required tags when checking concepts for uploads
  periods: ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος'], //allowed exam periods
  startingYear: 2010, //starting year for exams
  defaultUploaderName: 'anon',
  defaultImageActive: true, //flag for default image visibility
  log404: false,
  log500: true,
  useCaptchaOnUploads: true, //reCaptcha usage flag
};
