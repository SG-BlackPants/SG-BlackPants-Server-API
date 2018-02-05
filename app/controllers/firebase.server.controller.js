const fcmPush = require('../apis/firebase'),
      elasticsearch = require('../apis/elasticsearch'),
      Keyword = require('mongoose').model('Keyword'),
      User = require('mongoose').model('User'),
      Promise = require('bluebird');

exports.pushTest = (req, res, next) => {
  const result = fcmPush.sendMessageTest(req.body, res, next);
};

exports.findKeywordsForPush = (req, res, next) => {
  elasticsearch.searchAndReturn('univscanner', 'keywords', {  //해당 community의 count가 0이 아닌 keywords 전부
    "query" : {
      "bool" : {
        "must" : [
          { "match" : { "community" : req.body.community } }
        ],
        "must_not" : [
          { "match" : { "count" : 0 } }
        ]
      }
    }
  }).then(keywords => {
    let result = [];

    if(keywords.result === 'SUCCESS'){
      if(!keywords.message) return;
      let index = 0;
      keywords.message.forEach((keyword) => {
        hasNewArticleByKeyword(req.body.community, keyword._source.name)
          .then(isContained => {
            if(isContained){
              const node = {
                "keyword" : keyword._source.name,
                "boardAddr" : isContained
              };
              result.push(node);
            }

            if(keywords.message.length === ++index){
              req.body.keywords = result;
              return next();
            }
          }).error(err => {
            console.log("unhandled error in hasNewArticleByKeyword");
          });
      });
    }else if(keywords.result === 'ERROR'){
      return res.json(keywords);
    }
  }).error(err => {
    console.log("I'm unhandled error in findKeywords: " + err);
    return res.json(err);
  });
};

function hasNewArticleByKeyword(community, keyword){
  return new Promise((resolve, reject) => {
    elasticsearch.searchAndReturn('univscanner', 'article', {
      "query" : {
        "bool" : {
          "must" : [
            { "match" : { "community" : community } },
            { "match" : { "content" : keyword } }
          ]
        }
      }
    }, ["boardAddr"]).then(result => {
      const articles = result.message;
      if(articles[0]) {
        resolve(articles[0]._source.boardAddr);
      }
      else {
        resolve(false);
      }
    }).error(err => {
      console.log("I'm unhandled error in hasNewArticleByKeyword: " + err);
      reject(err);
    });
  });
};

exports.findUserByKeywordAndPush = (req, res, next) => {
  console.log('req.body.keywords: ' + JSON.stringify(req.body.keywords));
  let index = 0;
  req.body.keywords.forEach((node) => {
    const data = {
      "keyword" : node.keyword,
      "community" : req.body.community,
      "boardAddr" : node.boardAddr
    };

    Keyword.findOne({name : node.keyword, community : req.body.community}, (err, keyword) => {
      if(err) console.log(err);
      else{
        if(keyword){
          keyword.users.forEach(user => {
            User.findById(user, (err, _user) => {
              data.dest = _user.registrationToken;
              fcmPush.sendMessageToClient(data);
            });
          });
        }
      }
    });

    if(req.body.keywords.length === ++index){
      return res.json({
        "result" : "SUCCESS",
        "code" : "PushDone",
        "message" : "Success to push messages"
      });
    }
  });
};
