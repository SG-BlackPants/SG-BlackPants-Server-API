const fcmPush = require('../apis/firebase'),
      elasticsearch = require('../apis/elasticsearch');

exports.pushTest = (req, res, next) => {
  const result = fcmPush.sendMessageToClient(req.body, res, next);
};

exports.findKeywords = (req, res, next) => {
  const keywords = elasticsearch.searchAndReturn('univscanner', 'keywords', {
    "query" : {
      "match" : {
        "community" : req.body.community
      }
    }
  });
  console.log('findKeywords' + keywords);
  res.json({
    "result" : "SUCCESS",
    "code" : "okokokokdokokoko",
    "messaage" : JSON.stringify(keywords)
  });
};

exports.pushMessagesToClients = (req, res, next) => {

};
