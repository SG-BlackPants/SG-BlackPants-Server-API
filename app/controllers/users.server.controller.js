const User = require('mongoose').model('User'),
      Keyword = require('mongoose').model('Keyword');

exports.signup = function(req, res){
  const user = new User(req.body);

  user.save(function(err){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    res.json(user);
  });
};

exports.list = function(req,res){
  User.find(function(err,users){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    res.json(users);
  });
};

exports.read = function(req,res){
  res.json(req.user);
};

exports.userByID = function(req,res,next,id){
  User.findById(id, function(err, user){
    if(err){
      return next(err);
    }
    req.user = user;
    next();
  });
};

exports.update = function(req,res){
  if(!req.body){
    if(!req.body.name) req.user.name = req.body.name;
    if(!req.body.university) req.user.university = req.body.university;
    if(!req.body.keyword){
      const keyword = new Keyword(req.body.keyword);
      req.user.keywords.push(keyword._id);
    }
    if(!req.body.community) req.user.community.push(req.body.community);
    if(!req.body.search) req.user.search.push(req.body.search);

    req.user.save(function(err){
      if(err){
        res.json({
          "result" : "ERROR",
          "code" : err.code,
          "message" : err
        });
        return;
      }
      res.json(req.user);
    });
  }
};

exports.delete = function(req,res){
  req.user.remove(function(err){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    res.json(req.user);
  });
};

exports.deleteAll = function(req,res){
  User.remove({},function(err){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    res.json('Success to delete all');
  });
};
