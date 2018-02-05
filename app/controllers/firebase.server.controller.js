const fcmPush = require('../apis/firebase'),
      elasticsearch = require('../apis/elasticsearch'),
      Keyword = require('mongoose').model('Keyword'),
      User = require('mongoose').model('User');

exports.pushTest = (req, res, next) => {
  const result = fcmPush.sendMessageTest(req.body, res, next);
};

exports.findKeywords = (req, res, next) => {
  const community = req.body.community;
  elasticsearch.searchAndReturn('univscanner', 'keywords', {  //해당 community의 count가 0이 아닌 keywords 전부
    "query" : {
      "bool" : {
        "must" : [
          { "match" : { "community" : community } }
        ],
        "must_not" : [
          { "match" : { "count" : 0 } }
        ]
      }
    }
  }, ["name"]).then(keywords => {
    let result = [];
    if(keywords.result === 'SUCCESS'){
      if(!keywords.message) return;
      keywords.message.forEach((keyword, index) => {
        result.push(keyword._source.name);
        if(index === keywords.message.length-1) {
          req.body.keywords = result;
          return next();
        }
      });
    }else if(keywords.result === 'ERROR'){
      return res.json(keywords);
    }
  }).error(err => {
    console.log("I'm unhandled error in findKeywords: " + err);
    res.json(err);
  });
};

exports.isContainedKeyword = (req, res, next) => {
  
};

exports.pushMessagesToClients = (req, res, next) => {
  req.body.keywords.forEach((keyword, index) => {
    let data = {
      "boardAddr" : "BLANK",
      "community" : req.body.community,
      "keyword" : keyword
    };

    findUserByKeyword(data);

    if(index === req.body.keywords.length-1){
      res.json({
        "result" : "SUCCESS",
        "code" : "PushSuccess",
        "message" : "Done to push messages"
      });
    }
  });
};

function findUserByKeyword(data){
  Keyword.find({name : data.keyword, community : data.community}, (err, keyword) => {
    if(err) console.log(err);
    else{
      if(keyword[0]){
        keyword[0].users.forEach(rUser => {
          User.findById(rUser)
            .exec((err, user) => {
              data.dest = user.registrationToken;
              fcmPush.sendMessageToClient(data);
            });
        });
      }
    }
  });
};
