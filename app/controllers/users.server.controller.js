const User = require('mongoose').model('User');

const getErrorMessage = function(err){
  let message = '';
  if(err.code){
    switch(err.code){
      case 11000:
      case 11001:
        message = 'UserID already exists';
        break;
      default:
        message = 'Something went Wrong';
    }
  }else{
    for(let errName in err.errors){
      if(err.errors[errName].message){
        message = err.errors[errName].message;
      }
    }
  }
  return message;
};

exports.signup = function(req, res){
  const user = new User(req.body);

  let message = null;

  user.save(function(err){
    if(err){
      message = getErrorMessage(err);

      req.flash('error', message);
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
