const fcmPush = require('../apis/firebase'),
      elasticsearch = require('../apis/elasticsearch'),
      Keyword = require('mongoose').model('Keyword'),
      User = require('mongoose').model('User'),
      Promise = require('bluebird'),
      nodemailer = require('../apis/nodemailer');

exports.pushTest = (req, res, next) => {
  const result = fcmPush.sendMessageTest(req.body, res, next);
};

exports.findKeywordsForPush = (req, res, next) => {
  const query = {
    "index" : "univscanner",
    "type" : "keywords",
    "body" : { "query" : {
                  "bool" : {
                    "must" : [
                      { "match" : { "community" : req.body.community } }
                    ],
                    "must_not" : [
                      { "match" : { "count" : 0 } }
                    ]
                  }
                }
            }
    };

  elasticsearch.searchAndReturn(query).then(keywords => {
    let result = [];

    if(keywords.result === 'SUCCESS'){
      if(!keywords.message) return;
      let jobCount = 0;
      keywords.message.forEach((keyword) => {
        hasNewArticleByKeyword(req.body.community, keyword._source.name, req.body.createdDate)
          .then(isContained => {
            if(isContained){
              const node = {
                "keyword" : keyword._source.name,
                "boardAddr" : isContained
              };
              result.push(node);
            }

            if(keywords.message.length === ++jobCount){
              req.body.keywords = result;
              return next();
            }
          }).error(err => {
            console.log("unhandled error in hasNewArticleByKeyword: " + err);
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

function hasNewArticleByKeyword(community, keyword, createdDate){
  return new Promise((resolve, reject) => {
    const query = {
      "index" : "univscanner",
      "type": "article",
      "body": {
                "query" : {
                  "bool" : {
                    "must" : [
                      { "match" : { "community" : community } },
                      { "match" : { "content" : keyword } },
                      { "range" : { "createdDate" : {
                                              "gte" : createdDate,
                                              "lte" : "now",
                                              "time_zone" : "+09:00"
                                            }
                                          }
                                        }
                    ]
                  }
                },
                "_source": ["boardAddr", "createdDate"],
                "sort" : [
                  { "createdDate" : { "order" : "desc" } }
                ]
              }
    };

    elasticsearch.searchAndReturn(query).then(result => {
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
  let jobCount = 0;
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

    if(req.body.keywords.length === ++jobCount){
      return res.json({
        "result" : "SUCCESS",
        "code" : "PushDone",
        "message" : "Success to push messages"
      });
    }
  });
};

exports.sendEmailForVerified = (req, res, next) => {
  nodemailer({
    "_id" : req.params.userId,
    "email" : req.body.email
  }).then(result => {
    res.json({
      "result" : "SUCCESS",
      "code" : "SEND_EMAIL",
      "message" : result
    });
    return;
  }).error(err => {
    return next(err);
  })
};

exports.verifyEmail = (req, res, next) => {
  User.findById(req.params.userId)
    .exec((err, user) => {
        user.isRegistered = true;
        user.save(err => {
          if(err) next(err);
          res.render('emailCheck', {
            "name" : user.name,
            "university" : user.university
          });
          return;
        });
    });
};

exports.checkEmailVarified = (req, res, next) => {
  User.findById(req.params.userId)
    .exec((err, user) => {
      if(err) next(err);
      res.json({
        "result" : "SUCCESS",
        "code" : "CHECK_VERIFIED",
        "message" : user.isRegistered
      });
    });
};
