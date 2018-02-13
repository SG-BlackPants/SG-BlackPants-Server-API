const User = require('mongoose').model('User'),
      elasticsearch = require('../apis/elasticsearch'),
      Keyword = require('mongoose').model('Keyword'),
      crypto= require('crypto'),
      config = require('../../config/config'),
      firebase = require('../apis/firebase'),
      redis = require('../apis/redis');

exports.signup = (req, res, next) => {
  const user = new User(req.body);
  user.save(err => {
    if(err) next(err);
    res.json(user);
  });
};

exports.list_mongoDB = (req, res, next) => {
  User.find((err,users) => {
    if(err) next(err);
    res.json(users);
  });
};

exports.list_elasticsearch = (req, res, next) => {
  elasticsearch.search(req, res, 'univscanner', 'users', {
    query : { match_all : {}}
  });
};

exports.read = (req, res, next) => {
  res.json(req.user);
};

exports.userByID = (req, res, next, id) => {
  User.findById(id, (err, user) => {
    if(err) return next(err);
    req.user = user;
    next();
  });
};

exports.addSearchHistory = (req, res, next) => {
  const search = req.body.search.trim();
  const searchIndex = req.user.search.indexOf(search);
  if(searchIndex > -1){ //중복이 존재한다면 갱신
    req.user.search.splice(searchIndex, 1);
  }
  if(req.user.search.length === 10){ //10개 이상시 마지막 원소 제거
    req.user.search.pop();
  }
  req.user.search.unshift(search);

  req.user.save(err => {
    if(err) return next(err);
    res.json({
      "result" : "SUCCESS",
      "code" : "ADD_SEARCH_HISTORY",
      "message" : req.user.search
    });
  })
};

exports.addSearchHistoryAndNext = (req, res, next) => {
  User.findById(req.body._id, (err, user) => {
    req.body.university = user.university;
    const searchIndex = user.search.indexOf(req.params.keyword);
    if(searchIndex > -1){ //중복이 존재한다면 갱신
      user.search.splice(searchIndex, 1);
    }
    if(user.search.length === 10){ //10개 이상시 마지막 원소 제거
      user.search.pop();
    }
    user.search.unshift(req.params.keyword);

    user.save(err => {
      if(err) return next(err);
      next();
    });
  });
};

exports.pushKeywordToUser = (req, res, next) => {
  req.body.keyword = req.body.keyword.trim();
  Keyword.findOne({name : req.body.keyword, university : req.body.university}, (err, keyword) => {
    if(err) return next(err);

    if(!keyword){
      keyword = new Keyword();
      keyword.name = req.body.keyword;
      keyword.university = req.body.university;
    }

    if(req.user.keywords.length === 5) {
      const err = new Error('keywords exceeds the limit of 5');
      err.code = 'KeywordExceeded'
      return next(err);
    }else console.log('no exceeded 5')

    const keywordUsersIndex = keyword.users.indexOf(req.user._id);  //keyword 중복 등록
    if(keywordUsersIndex > -1){
      const err = new Error('keyword is duplicated');
      err.code = 'KeywordDuplicated'
      return next(err);
    }else console.log('no duplicated keyword')
    keyword.users.push(req.user._id);

    let community = null,
        startDate = null,
        endDate = null,
        secondWord = null;

    if(req.body.community) community = req.body.community;
    if(req.body.startDate){
      startDate = req.body.startDate;
      endDate = req.body.endDate;
    }
    if(req.body.secondWord) secondWord = req.body.secondWord;

    req.user.keywords.push({
      "keyword" : req.body.keyword,
      "university" : req.body.university,
      "community" : community,
      "startDate" : startDate,
      "endDate" : endDate,
      "secondWord" : secondWord
    });

    let isSucceeded = true;

    req.user.save(err => {    //user update function with keywords push
      if(err) {
        isSucceeded = false;
        return next(err);
      }
      console.log('user updated');
      if(isSucceeded){
        res.json({
              "result" : "SUCCESS",
              "code" : "PUSH_KEYWORD",
              "message" : "success to push keyword and updated all"
            });
      }else{
        res.json({
            "result" : "FAILURE",
            "code" : "PUSH_KEYWORD",
            "message" : "something is wrong"
          });
      }
    });

    keyword.save((err, data) => {
      if(err) {
        isSucceeded = false;
        return next(err);
      }
      console.log('keyword updated');
    });

    const key = req.body.university+":keywords";
    redis.updateItem(key, req.body.keyword, 1)
      .then(reply => {
        console.log('redis updated');
      }).error(err => {
        isSucceeded = false;
        next(err);
      });
  });
};

exports.delete = (req, res, next) => {
  req.user.remove(err => {
    if(err) next(err);
    res.json(req.user);
  });
};

exports.deleteAll = (req, res, next) => {
  User.remove({}, err => {
    if(err) next(err);
    res.json({
      "result" : "SUCCESS",
      "code" : "DeleteAll",
      "message" : "Success to delete users all"
    });
  });
};

exports.isValidToken = (req, res, next) => {
  firebase.verifyIdToken(req.body.userToken).then(decodedToken => {
    if(!decodedToken.uid){
      console.log('invalid token')
      const err = new Error(decodedToken.errorInfo.message);
      err.code = decodedToken.errorInfo.message.split(' ')[4].replace('.','').toUpperCase();
      return next(err);
    }

    console.log('valid token');
    req.body._id = decodedToken.uid;
    req.body.email = decodedToken.email;
    next();
  });
};

exports.decodingToken = (req, res, next) => {
  firebase.verifyIdToken(req.body.userToken).then(decodedToken => {
    if(!decodedToken.uid){
      console.log('invalid token')
      const err = new Error(decodedToken.errorInfo.message);
      err.code = decodedToken.errorInfo.message.split(' ')[4].replace('.','').toUpperCase();
      return next(err);
    }

    console.log('valid token');
    res.json(decodedToken);
  });
};

exports.refreshToken = (req, res, next) => {
  req.user.registrationToken = req.body.registrationToken;
  req.user.save(err => {
    if(err) return next(err);
    res.json({
      "result" : "SUCCESS",
      "code" : "REFRESH_TOKEN",
      "message" : req.user
    });
  });
};

exports.getRecentlySearch = (req, res, next) => {
  return res.json(req.user.search);
};

exports.popKeyword = (req, res, next) => {
  Keyword.findOne({ name : req.body.keyword, community : req.body.community })
      .exec((err, keyword) => {
        const userIndex = keyword.users.indexOf(req.params.userId);
        keyword.users.splice(userIndex, 1);

        const saveCount = 0;

        keyword.save(err => {
          if(err) return next(err);
          console.log('keyword updated');
          saveCount++;
        });

        redis.updateItem(keyword.university+"Keywords", keyword,name, -1)
          .then(reply => {
            console.log('redis updated');
            saveCount++;
          }).error(err => {
            next(err);
          });

        User.findByIdAndUpdate(req.params.userId,
          { $pull : { keywords : { keyword : req.body.keyword, university : req.body.university } } },
          {safe : true, upsert: true},
          (err, user) => {
              if(err) return next(err);
              console.log('user updated');
              saveCount++;
          });

          for(let wait=0 ; wait < 10000000 ; wait++){
            if(saveCount === 3){
              return res.json({
                "result" : "SUCCESS",
                "code" : "DELETE_KEYWORD",
                "message" : "success to delete keyword from user"
              });
            }
          }

          res.json({
            "result" : "FAILURE",
            "code" : "DELETE_KEYWORD",
            "message" : (3-saveCount) + "개가 저장에 실패했습니다."
          });
      });
};

function encrypt(password){
    const cipher = crypto.createCipher(config.algorithm, config.key);
    let result = cipher.update(password, 'utf8', 'base64');
    result += cipher.final('base64');

    return result;
};

function decrypt(password){
    const decipher = crypto.createDecipher(config.algorithm, config.key);
    let result = decipher.update(password, 'base64', 'utf8');
    result += decipher.final('utf8');

    return result;
};
