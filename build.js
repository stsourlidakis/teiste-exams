/**
 * Static site generator for teiste-exams.
 *
 * Connects to MongoDB at build time, fetches all data, renders every
 * read-only page with Handlebars, and writes plain HTML to dist/.
 *
 * Output structure mirrors the Express routes:
 *   dist/index.html
 *   dist/all/index.html
 *   dist/about/index.html
 *   dist/course/<courseKey>/year/all/index.html
 *   dist/course/<courseKey>/year/<year>/index.html
 *   dist/course/<courseKey>/exam/<id>/index.html
 *   dist/public/  (copied from public/)
 *
 * Usage: node build.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const monk = require('monk');

const OUTPUT_DIR = path.join(__dirname, 'dist');

// ── MongoDB connection ─────────────────────────────────────────────────────────

const DB_NAME =
  process.env.ENVIROMENT === 'production'
    ? process.env.DB_NAME
    : process.env.DB_NAME_DEV;

const mongoUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;

// ── Handlebars setup ──────────────────────────────────────────────────────────

function registerPartials() {
  const partialsDir = path.join(__dirname, 'views/partials');
  for (const file of fs.readdirSync(partialsDir)) {
    const name = path.basename(file, '.handlebars');
    const content = fs.readFileSync(path.join(partialsDir, file), 'utf8');
    handlebars.registerPartial(name, content);
  }
}

function registerHelpers() {
  handlebars.registerHelper(
    'ifGroupEveryOpen',
    function (index, every, options) {
      return index % every === 0 ? options.fn(this) : options.inverse(this);
    }
  );

  handlebars.registerHelper(
    'ifGroupEveryClose',
    function (index, every, options) {
      return options.data.last || (index + 1) % every === 0
        ? options.fn(this)
        : options.inverse(this);
    }
  );

  // These helpers are registered for completeness but are only used in
  // analytics views (which remain server-rendered).
  handlebars.registerHelper('getLocaleTimestampFromObjectId', function (id) {
    return typeof id.getTimestamp === 'function'
      ? id.getTimestamp().toLocaleString()
      : '';
  });

  handlebars.registerHelper('getDateFromObjectId', function (id) {
    return typeof id.getTimestamp === 'function'
      ? id.getTimestamp().toISOString().slice(0, 10)
      : '';
  });

  handlebars.registerHelper('last6FromMD5', function (md5) {
    return md5.substr(md5.length - 6);
  });
}

// Compile the main layout once and reuse it across all pages.
let _layoutTemplate;
function layoutTemplate() {
  if (!_layoutTemplate) {
    const src = fs.readFileSync(
      path.join(__dirname, 'views/layouts/main.handlebars'),
      'utf8'
    );
    _layoutTemplate = handlebars.compile(src);
  }
  return _layoutTemplate;
}

/**
 * Render a Handlebars view inside the main layout.
 *
 * @param {string} viewName  Filename without extension under views/.
 * @param {object} data      Template data (page-specific).
 * @returns {string} Full HTML document.
 */
function renderPage(viewName, data = {}) {
  const viewSrc = fs.readFileSync(
    path.join(__dirname, `views/${viewName}.handlebars`),
    'utf8'
  );
  const body = handlebars.compile(viewSrc)(data);

  return layoutTemplate()({
    ...data,
    GA_TRACK_ID: process.env.GA_TRACK_ID,
    PAYPAL_DONATE_ID: process.env.PAYPAL_DONATE_ID,
    body: new handlebars.SafeString(body),
  });
}

// ── File-system helpers ───────────────────────────────────────────────────────

function writeHtml(outputPath, html) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log('  ' + path.relative(OUTPUT_DIR, outputPath));
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ── Build ─────────────────────────────────────────────────────────────────────

async function build() {
  const db = monk(mongoUrl);

  try {
    console.log('Setting up Handlebars...');
    registerPartials();
    registerHelpers();

    console.log('Cleaning dist/...');
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    fs.mkdirSync(OUTPUT_DIR);

    console.log('Copying public assets...');
    copyDir(path.join(__dirname, 'public'), path.join(OUTPUT_DIR, 'public'));

    console.log('Fetching data from MongoDB...');
    const imagesCol = db.get('images');
    const semestersCol = db.get('semesters');

    const [allImages, allSemesters] = await Promise.all([
      imagesCol.find({ active: true }, { sort: { _id: -1 } }),
      semestersCol.find({}, { sort: { _id: 1 } }),
    ]);

    // Build courseKey → courseName lookup from the semesters data.
    const courseNameMap = {};
    for (const sem of allSemesters) {
      for (const course of sem.courses) {
        courseNameMap[course.key] = course.name;
      }
    }

    console.log(
      `Fetched ${allImages.length} images across ` +
        `${Object.keys(courseNameMap).length} courses.\n`
    );
    console.log('Generating pages...');

    // ── Home page
    writeHtml(
      path.join(OUTPUT_DIR, 'index.html'),
      renderPage('home', { semesters: allSemesters })
    );

    // ── All-courses gallery
    writeHtml(
      path.join(OUTPUT_DIR, 'all', 'index.html'),
      renderPage('gallery', {
        meta: {
          courseName: 'Όλα τα μαθήματα',
          courseKey: '',
          year: 'Όλα',
          count: allImages.length,
        },
        images: allImages,
      })
    );

    // ── About page
    writeHtml(
      path.join(OUTPUT_DIR, 'about', 'index.html'),
      renderPage('about')
    );

    // ── Per-course and per-exam pages
    // Group images by courseKey, then by year.
    const byCourse = {};
    for (const img of allImages) {
      const key = img.courseKey;
      if (!byCourse[key]) byCourse[key] = { all: [], byYear: {} };
      byCourse[key].all.push(img);

      const year = String(img.year);
      if (!byCourse[key].byYear[year]) byCourse[key].byYear[year] = [];
      byCourse[key].byYear[year].push(img);
    }

    for (const [courseKey, { all: courseImages, byYear }] of Object.entries(
      byCourse
    )) {
      const courseName = courseNameMap[courseKey] || courseKey;

      // /course/:course/year/all
      const sortedAll = courseImages.slice().sort((a, b) => b.year - a.year);
      writeHtml(
        path.join(
          OUTPUT_DIR,
          'course',
          courseKey,
          'year',
          'all',
          'index.html'
        ),
        renderPage('gallery', {
          meta: { courseName, courseKey, year: 'Όλα', count: sortedAll.length },
          images: sortedAll,
        })
      );

      // /course/:course/year/:year
      for (const [year, yearImages] of Object.entries(byYear)) {
        writeHtml(
          path.join(
            OUTPUT_DIR,
            'course',
            courseKey,
            'year',
            year,
            'index.html'
          ),
          renderPage('gallery', {
            meta: { courseName, courseKey, year, count: yearImages.length },
            images: yearImages,
          })
        );
      }

      // /course/:course/exam/:id
      for (const img of courseImages) {
        const id = String(img._id);
        writeHtml(
          path.join(OUTPUT_DIR, 'course', courseKey, 'exam', id, 'index.html'),
          renderPage('exam', {
            meta: { courseName },
            image: img,
          })
        );
      }
    }

    console.log('\nBuild complete! Output written to dist/');
  } finally {
    await db.close();
  }
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
