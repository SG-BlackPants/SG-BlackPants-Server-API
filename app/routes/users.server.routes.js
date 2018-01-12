const users = require('../../app/controllers/users.server.controller');

module.exports = function(app) {
  app.route('/signup')
    .post(users.signup);
};
