const User = require('mongoose').model('User'),
      Keyword = require('mongoose').model('Keyword');

exports.create = function(req, res){
  const keyword = new Keyword(req.body);

  keyword.save(function(err){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    res.json(keyword);
  });
};

exports.list = function(req,res){
  Keyword.find(function(err,keywords){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    res.json(keywords);
  });
};

exports.read = function(req,res){
  Keyword.findOne({name : req.params.name, community : req.params.community}, function(err, keyword){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    res.json(keyword);
  });
};

exports.update = function(req,res){ // only name, community
  Keyword.findOne({name : req.params.name, community : req.params.community}, function(err, keyword){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    if(!keyword){
      res.json({
        "result" : "ERROR",
        "code" : 3010,
        "message" : "keyword not exist"
      });
      return;
    }

    if(req.body.name) keyword.name = req.body.name;
    if(req.body.community) keyword.community = req.body.community;

    keyword.save(function(err){
      if(err){
        res.json({
          "result" : "ERROR",
          "code" : 3030,
          "message" : "keyword update error"
        });
        return;
      }
      res.json(keyword);
    });
  });
};

exports.delete = function(req,res){
  Keyword.findOne({name : req.params.name, community : req.params.community}, function(err, keyword){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    if(!keyword){
      res.json({
        "result" : "ERROR",
        "code" : 3010,
        "message" : "keyword not exist"
      });
      return;
    }
    keyword.remove(function(err){
      if(err){
        res.json({
          "result" : "ERROR",
          "code" : err.code,
          "message" : err
        });
        return;
      }
      res.json(keyword);
    });
  });
};

exports.deleteAll = function(req,res){
  Keyword.remove({},function(err){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    res.json('Success to delete keywords all');
  });
};
