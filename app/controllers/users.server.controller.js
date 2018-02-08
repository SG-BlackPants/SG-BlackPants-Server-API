const User = require('mongoose').model('User'),
      elasticsearch = require('../apis/elasticsearch'),
      Keyword = require('mongoose').model('Keyword'),
      crypto= require('crypto'),
      config = require('../../config/config.js'),
      firebase = require('../apis/firebase');

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

// To Do : 분할해야됨
exports.update = (req, res, next) => {
  if(req.body.registrationToken) req.user.registrationToken = req.body.registrationToken;

  if(req.body.name) req.user.name = req.body.name;

  if(req.body.university) req.user.university = req.body.university;

  if(req.body.community) {
    req.body.community.loginPW = encrypt(req.body.community.loginPW);
    req.user.community.push(req.body.community);
  }

  if(req.body.search) {
    const searchIndex = req.user.search.indexOf(req.body.search);
    if(searchIndex > -1){ //중복이 존재한다면 갱신
      req.user.search.splice(searchIndex, 1);
    }
    if(req.user.search.length === 10){ //10개 이상시 마지막 원소 제거
      req.user.search.pop();
    }
    req.user.search.unshift(req.body.search);
  }

  if(req.body.keyword){
    Keyword.findOne({name : req.body.keyword, community : req.body.keyword_community}, (err, keyword) => {
      if(err) return next(err);

      if(!keyword){
        keyword = new Keyword();
        keyword.name = req.body.keyword;
        keyword.community = req.body.keyword_community;
        keyword.university = req.body.keyword_university;
        keyword.count = 0;
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

      keyword.count = keyword.count + 1;
      keyword.users.push(req.user._id);

      keyword.save((err, data) => {
        if(err) return next(err);
        req.user.keywords.push(data._id);
        req.user.save(err => {    //user update function with keywords push
          if(err) return next(err);
          res.json(req.user);
        });
      });
    });
  }else{
    req.user.save(err => {      //user update function without keywords push
      if(err) return next(err);
      res.json(req.user);
    });
  }
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
        keyword.count = keyword.count - 1;
        keyword.save(err => {
          if(err) return next(err);
        });
        User.findById(req.params.userId)
          .exec((err, user) => {
            if(err) return next(err);
            const keywordIndex = user.keywords.indexOf(keyword._id);
            user.keywords.splice(keywordIndex, 1);
            user.save(err => {
              if(err) return next(err);
              res.json({
                "result" : "SUCCESS",
                "code" : "DELETE_KEYWORD",
                "message" : "success to delete keyword from user"
              });
            });
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
