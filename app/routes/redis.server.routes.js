const redis = require('../../app/controllers/redis.server.controller'),
      users = require('../../app/controllers/users.server.controller');

module.exports = app => {
  app.route('/redis/update/keywords')
    .post(redis.updateKeywordRank);

  app.route('/redis/rank/keywords/:university')
    .get(redis.getKeywordRank);

  app.route('/redis/rank/push')
    .post(users.isValidToken, redis.getPushHistory);

  app.route('/redis/rank/search/:university/:prefix')
    .get(redis.getAutocompleteKeyword);

  app.route('/redis/update/search')
    .post(redis.addKeywordForAutoComplete);

  app.route('/redis/delete/all')
    .delete(redis.deleteAll);
};
