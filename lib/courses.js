const semesters = require('./mongo').get('semesters');

semesters
  .find({}, { fields: { _id: 0, 'courses.name': 1, 'courses.key': 1 } })
  .then((docs) => {
    docs = docs.map(function (obj) {
      return obj.courses;
    });
    module.exports.all = [].concat(...docs);
  })
  .catch((err) => {
    console.log(err);
  });

module.exports.keyExists = function (key) {
  const hits = module.exports.all.filter(function (course) {
    return course.key === key;
  });
  return hits.length > 0;
};

module.exports.nameExists = function (name) {
  const hits = module.exports.all.filter(function (course) {
    return course.name === name;
  });
  return hits.length > 0;
};

module.exports.getKeyFromName = function (name) {
  const item = module.exports.all.filter(function (course) {
    return course.name === name;
  })[0];
  return item ? item.key : null;
};

module.exports.getNameFromKey = function (key) {
  const item = module.exports.all.filter(function (course) {
    return course.key === key;
  })[0];
  return item ? item.name : null;
};
