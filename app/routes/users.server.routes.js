const users = require('../../app/controllers/users.server.controller');

module.exports = app => {
  app.route('/users')
  .post(users.signup)
  .get(users.list_elasticsearch)
  .delete(users.deleteAll);

  app.route('/users/:userId')
  .get(users.read)
  .put(users.update)
  .delete(users.delete);

  app.param('userId', users.userByID);  //app.route보다 먼저 실행됨
};
