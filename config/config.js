const _ = require('lodash');
const defaults = require('./env/defaults.js');
const config = require('./env/' + process.env.NODE_ENV+'.js');

module.exports = _.merge({}, defaults, config);
