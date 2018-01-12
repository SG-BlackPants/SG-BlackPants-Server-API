const User = require('mongoose').model('User');

exports.signup = function(req, res){
  const user = new User(req.body);


  user.save(function(err){
    if(err){
      res.json(err);
    }else{
      console.log('save');
      req.login(user, function(err){
        if(err){
            res.json({
              "result" : "ERROR",
              "code" : err.code,
              "message" : err
            });
        }
        res.json(user);
      });
    }
  });
};
