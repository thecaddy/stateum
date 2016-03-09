
require('babel-register')({
  "plugins": [],
  "presets": ["es2015", "stage-0"]
});
module.exports = require('./lib/stateum');