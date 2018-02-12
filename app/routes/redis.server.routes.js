const redis = require('../../app/controllers/redis.server.controller');

module.exports = app => {
  app.route('/redis/update/keywords')
    .post(redis.updateKeywordRank);

  app.route('/redis/rank/keywords/:university')
    .get(redis.getKeywordRank);
}
