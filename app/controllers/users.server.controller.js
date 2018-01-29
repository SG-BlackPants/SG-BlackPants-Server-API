const User = require('mongoose').model('User'),
      elasticsearch = require('../../config/elasticsearch'),
      Keyword = require('mongoose').model('Keyword'),
      crypto= require('crypto'),
      config = require('../../config/config.js'),
      firebase = require('../../config/firebase');

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
  elasticsearch.search(req, res, 'univscanner', 'users', {
    query : {
      match : {
        "_id" : id
      }
    }
  });
  User.findById(id, (err, user) => {
    if(err) return next(err);
    req.user = user;
    next();
  });
};

// To Do : 분할해야됨
exports.update = (req, res, next) => {
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
      if(err) next(err);

      if(!keyword){
        keyword = new Keyword();
        keyword.name = req.body.keyword;
        keyword.community = req.body.keyword_community;
        keyword.count = 0;
      }

      if(req.user.keywords.length === 5){   //keyword 5개 제한
        res.json({
          "result" : "ERROR",
          "code" : 3032,
          "message" : "keywords exceeds the limit of 5"
        });
        return;
      }

      const keywordUsersIndex = keyword.users.indexOf(req.user._id);  //keyword 중복 등록
      if(keywordUsersIndex > -1){
        res.json({
          "result" : "ERROR",
          "code" : 11001,
          "message" : "Keyword is duplicated"
        });
        return;
      }

      keyword.count = keyword.count + 1;
      keyword.users.push(req.user._id);

      keyword.save((err, data) => {
        if(err) next(err);
        req.user.keywords.push(data._id);
        req.user.save(err => {    //user update function with keywords push
          if(err) next(err);
          res.json(req.user);
        });
      });
    });
  }else{
    req.user.save(err => {      //user update function without keywords push
      if(err) next(err);
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
      "code" : 200,
      "message" : "Success to delete users all"
    });
  });
};

exports.isValidToken = (req, res, next) => {
  firebase.verifyIdToken(req.body.userToken).then(decodedToken => {
    if(!decodedToken.uid){
      let errCode = decodedToken.errorInfo.message.split(' ')[4].replace('.','').toUpperCase();
      res.json({
        "result" : "ERROR",
        "code" : errCode,
        "message" : decodedToken.errorInfo.message
      });
      console.log('invalid token')
      return;
    }

    req.body._id = decodedToken.uid;
    req.body.email = decodedToken.email;
    console.log('valid token');
    next();
  });
};

exports.refreshToken = (req, res, next) => {
  firebase.verifyIdToken(req.body.userToken).then(decodedToken => {
    console.log('Refresh Token');
    if(!decodedToken.uid){
      let errCode = decodedToken.errorInfo.message.split(' ')[4].replace('.','').toUpperCase();
      res.json({
        "result" : "ERROR",
        "code" : errCode,
        "message" : decodedToken.errorInfo.message
      });
      console.log('invalid token')
      return;
    }

    req.body._id = decodedToken.uid;
    req.body.email = decodedToken.email;
    console.log('valid token');
    next();
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
