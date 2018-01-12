const User = require('mongoose').model('User');

exports.create = function(req,res){
  const user = new User(req.body);

  user.save(function(err){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
    }else{
      res.json(user);
    }
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
    }else{
      res.json(users);
    }
  });
};

exports.read = function(req,res){
  res.json(req.user);
};

exports.userByID = function(req,res,next,id){
  User.findById(id, function(err, user){
    if(err){
      return next(err);
    }else{
      req.user = user;
      next();
    }
  });
};

exports.update = function(req,res){
  User.findByIdAndUpdate(req.user.id, req.body, function(err,user){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
    }else{
      res.json(user);
    }
  });
};

exports.delete = function(req,res){
  req.user.remove(function(err){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
    }else{
      res.json(req.user);
    }
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
    }else{
      res.json('deleteAll success');
    }
  });
};
