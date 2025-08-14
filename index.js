require('dotenv').config();
const express = require('express');
const app = express();
const { ImgurClient } = require('imgur');
const thumbnails = require('imgur-thumbnails');
const exphbs = require('express-handlebars');
const utils = require('./lib/utils');

const images = utils.db.get('images');
const semesters = utils.semesters;
const contactMessages = utils.db.get('contactMessages');

const hbs = exphbs.create({
  defaultLayout: 'main',
  partialsDir: ['views/partials/'],
  helpers: {
    ifGroupEveryOpen: function (index, every, options) {
      if (index % every === 0) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    ifGroupEveryClose: function (index, every, options) {
      if (options.data.last || (index + 1) % every === 0) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    getLocaleTimestampFromObjectId: function (id) {
      return id.getTimestamp().toLocaleString();
    },
    getDateFromObjectId: function (id) {
      return id.getTimestamp().toISOString().slice(0, 10);
    },
    last6FromMD5: function (md5) {
      return md5.substr(md5.length - 6);
    },
  },
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use('/public', express.static('public'));
app.use('/analytics', require('./lib/routes/analytics'));

const imgur = new ImgurClient({ clientId: process.env.IMGUR_CLIENTID });

app.locals.GA_TRACK_ID = process.env.GA_TRACK_ID;
app.locals.RECAPTCHA_KEY = process.env.RECAPTCHA_KEY;
app.locals.PAYPAL_DONATE_ID = process.env.PAYPAL_DONATE_ID;
app.locals.useCaptchaOnUploads = utils.settings.useCaptchaOnUploads;
app.locals.serverStarted = new Date().toGMTString();

app.get('/', async function (req, res) {
  try {
    const docs = await semesters.find({}, { sort: { _id: 1 } });
    res.render('home', { semesters: docs });
  } catch (err) {
    utils.sendToErrorPage(err, req, res);
  }
});

app.get('/all', async function (req, res) {
  try {
    const docs = await images.find({ active: true }, { sort: { _id: -1 } });
    const metadata = {
      courseName: 'Όλα τα μαθήματα',
      courseKey: '',
      year: 'Όλα',
      count: docs.length,
    };

    res.render('gallery', { meta: metadata, images: docs });
  } catch (err) {
    utils.sendToErrorPage(err, req, res);
  }
});

app.get('/about', function (req, res) {
  res.render('about');
});

app
  .route('/contact')
  .get(function (req, res) {
    res.render('contact');
  })
  .post(
    utils.multerUpload.fields([]),
    utils.verifyReCaptchaForContact,
    async function (req, res) {
      const data = {
        name: req.body.name,
        email: req.body.email,
        msg: req.body.msg,
      };

      try {
        await contactMessages.insert(data);
        res.render('contact', {
          error: false,
          resultMessage: 'Το μήνυμα αποθηκεύτηκε',
        });
      } catch (err) {
        console.log(
          'Error while saving contact message: ',
          data,
          'error: ',
          err
        );
        res.render('contact', {
          error: true,
          resultMessage:
            'Πρόβλημα κατά την αποθήκευση του μηνύματος, δοκιμάστε ξανά αργότερα',
        });
      }
    }
  );

app.get('/course/:course/year/:year', async function (req, res, next) {
  if (
    (utils.courses.keyExists(req.params.course) && req.params.year === 'all') ||
    utils.isValidYear(req.params.year)
  ) {
    let filter = { courseKey: req.params.course, active: true };
    if (req.params.year !== 'all') {
      filter.year = req.params.year;
    }

    try {
      const docs = await images.find(filter, { sort: { year: -1 } });
      const metadata = {
        courseName: utils.courses.getNameFromKey(req.params.course),
        courseKey: req.params.course,
        year: req.params.year !== 'all' ? req.params.year : 'Όλα',
        count: docs.length,
      };

      res.render('gallery', { meta: metadata, images: docs });
    } catch (err) {
      utils.sendToErrorPage(err, req, res);
    }
  } else {
    next(); //default 404
  }
});

app.get('/course/:course/exam/:id', async function (req, res, next) {
  if (
    utils.courses.keyExists(req.params.course) &&
    utils.isValidMongoID(req.params.id)
  ) {
    try {
      const doc = await images.findOne({
        courseKey: req.params.course,
        _id: req.params.id,
        active: true,
      });

      if (doc) {
        const metadata = {
          courseName: utils.courses.getNameFromKey(doc.courseKey),
        };
        res.render('exam', { meta: metadata, image: doc });
      } else {
        next(); //default 404
      }
    } catch {
      next(); //default 404
    }
  } else {
    next(); //default 404
  }
});

app
  .route('/upload')
  .get(function (req, res) {
    res.render('upload', {
      courses: utils.courses.all,
      startingYear: utils.settings.startingYear,
      currentYear: new Date().getFullYear(),
    });
  })
  .post(
    utils.checkUploadedFile,
    utils.verifyReCaptchaForUpload,
    utils.checkRequiredInputs,
    utils.checkPhotoContent,
    async function (req, res) {
      const albumId = process.env.IMGUR_ALBUM_DELETE_HASH; //delete hash because the album is anonymous
      const courseKey = utils.courses.getKeyFromName(req.body.courseName);

      try {
        const imgurRes = await imgur.upload({
          image: req.file.buffer.toString('base64'),
          type: 'base64',
          album: albumId,
        });

        const httpsUrl = utils.httpsUrl(imgurRes.data.link);

        await images.insert({
          url: httpsUrl,
          thumbnailUrl: thumbnails.medium(httpsUrl),
          deleteHash: imgurRes.data.deletehash,
          courseKey: courseKey,
          year: req.body.year,
          period: req.body.period,
          active: utils.settings.defaultImageActive,
          uploader: utils.settings.defaultUploaderName,
        });

        utils.courseItemIncrease(courseKey, req.body.year);
        res.render('upload', {
          error: false,
          resultMessage: 'Το θέμα αποθηκεύτηκε!',
          courses: utils.courses.all,
          startingYear: utils.settings.startingYear,
          currentYear: new Date().getFullYear(),
        });
      } catch (err) {
        if (utils.settings.log500) {
          await utils.log500(err, req);
        }
        res.render('upload', {
          error: true,
          resultMessage: 'Κάτι πήγε στραβά, παρακαλώ δοκιμάστε ξανά.',
          courses: utils.courses.all,
          startingYear: utils.settings.startingYear,
          currentYear: new Date().getFullYear(),
        });
      }
    }
  );

app.use(async function (req, res) {
  //default 404
  if (utils.settings.log404 && req.originalUrl != '/favicon.ico') {
    await utils.log404(req);
  }

  res.status(404).render('404');
});

const port = process.env.PORT || utils.settings.defaultPort;
app.listen(port, function () {
  console.log('App listening on port ' + port + '!');
});
