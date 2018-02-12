const redis = require('../apis/redis');

exports.updateKeywordRank = (req, res, next) => {
  redis.updateItem(req.body.university+'Keywords', req.body.keyword, req.body.count).then(reply => {
    res.json({
      "result" : "SUCCESS",
      "code" : "UPDATE_KEYWORD_RANK",
      "message" : reply
    });
  }).error(err => {
    next(err);
  });
};

exports.getKeywordRank = (req, res, next) => {
  redis.getRankForTest(req.params.university+'Keywords').then(reply => {
    res.json({
      "result" : "SUCCESS",
      "code" : "GET_KEYWORD_RANK",
      "message" : reply
    });
  }).error(err => {
    next(err);
  });
};
