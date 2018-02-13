const fcmPush = require('../apis/firebase'),
      elasticsearch = require('../apis/elasticsearch'),
      mongoose = require('mongoose'),
      Keyword = mongoose.model('Keyword'),
      User = mongoose.model('User'),
      Promise = require('bluebird'),
      nodemailer = require('../apis/nodemailer'),
      redis = require('../apis/redis');

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
                      { "match" : { "university" : req.body.university } }
                    ]
                  }
                }
            }
    };

  elasticsearch.searchAndReturn(query).then(keywords => {
    let result = [];
    
    if(keywords.result === 'SUCCESS'){
      if(keywords.code === "NotFound"){
        return res.json({
          "result" : keywords.result,
          "code" : keywords.code,
          "message" : "It has no keyword push for users"
        });
      }

      let jobCount = 0;

      keywords.message.forEach(keyword => {
        hasNewArticleByKeyword(req.body.university, keyword._source.name, req.body.createdDate)
          .then(isContained => {
            if(isContained){
              const node = {
                "keyword" : keyword._source.name,
                "community" : isContained.community ? isContained.community : null,
                "boardAddr" : isContained.boardAddr ? isContained.boardAddr : null,
                "createdDate" : isContained.createdDate ? isContained.createdDate : null
              };
              result.push(node);
            }

            if(keywords.message.length === ++jobCount){
              req.body.keywords = result;
              return next();
            }
          }).error(err => {
            console.log("unhandled error in hasNewArticleByKeyword: " + err);
            next(err);
          });
      });
    }else if(keywords.result === 'ERROR'){
      console.log('empty keyword');
      return res.json({
        "result" : "ERROR",
        "code" : "SEARCH_ES",
        "message" : "elasticsearch search query has errors"
      });
    }
  }).error(err => {
    console.log("I'm unhandled error in findKeywords: " + err);
    return res.json(err);
  });
};

function hasNewArticleByKeyword(university, keyword, createdDate){
  return new Promise((resolve, reject) => {
    const query = {
      "index" : "univscanner",
      "type": "articles",
      "body": {
                "query" : {
                  "bool" : {
                    "must" : [
                      { "match" : { "university" : university } },
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
                "_source": ["community", "boardAddr", "createdDate"],
                "sort" : [
                  { "createdDate" : { "order" : "desc" } }
                ]
              }
    };

    elasticsearch.searchAndReturn(query).then(result => {
      return resolve(result.message);
      const articles = result.message;
      if(articles[0]) {
        return resolve(articles[0]._source);
      }
      else {
        return resolve(false);
      }
    }).error(err => {
      console.log("I'm unhandled error in hasNewArticleByKeyword: " + err);
      reject(err);
    });
  });
};

exports.findUserByKeywordAndPush = (req, res, next) => {
  let jobCount = 0;
  let pushCount = 0;

  req.body.keywords.forEach((node) => {
    const data = {
      "keyword" : node.keyword,
      "community" : node.community,
      "boardAddr" : node.boardAddr,
      "createdDate" : node.createdDate
    };

    Keyword.findOne({name : node.keyword, university : req.body.university}, (err, keyword) => {
      if(err) console.log(err);
      else{
        if(keyword){
          keyword.users.forEach(user => {
            User.findById(user, (err, _user) => {
              data.dest = _user.registrationToken;
              fcmPush.sendMessageToClient(data);
              pushCount++;
              redis.updateItem(user + ':push', data.keyword+'='+data.community+'='+data.boardAddr+'='+data.createdDate, Date.now());
            });
          });
        }
      }
    });

    if(req.body.keywords.length === ++jobCount){
      return res.json({
        "result" : "SUCCESS",
        "code" : "PUSH_DONE",
        "message" : "success to push messages("+pushCount+")"
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
