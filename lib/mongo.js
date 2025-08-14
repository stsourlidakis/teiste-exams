const DB_NAME =
  process.env.ENVIROMENT === 'production'
    ? process.env.DB_NAME
    : process.env.DB_NAME_DEV;

const mongoUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;

module.exports = require('monk')(mongoUrl);
