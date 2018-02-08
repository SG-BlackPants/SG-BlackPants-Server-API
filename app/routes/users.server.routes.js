const users = require('../../app/controllers/users.server.controller');

module.exports = app => {
  app.route('/users')
    .post(users.isValidToken, users.signup)
    .get(users.list_elasticsearch)
    .delete(users.deleteAll);

  app.route('/users/:userId')
    .get(users.read)
    .delete(users.delete);

  app.route('/users/:userId/search')
    .put(users.addSearchHistoryToUser);

  app.route('/users/:userId/keyword/push')
    .put(users.pushKeywordToUser)

  app.route('/users/:userId/keyword/pop')
    .put(users.popKeyword);

  app.route('/users/:userId/recently')
    .get(users.getRecentlySearch);

  app.route('/users/:userId/refreshToken')
    .put(users.isValidToken, users.refreshToken);

  app.route('/fbToken')
    .post(users.decodingToken);

  app.param('userId', users.userByID);  //app.route보다 먼저 실행됨
};
