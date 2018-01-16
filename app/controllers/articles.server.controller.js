const Article = require('mongoose').model('Article');

exports.create = function(req, res){
  const article = new Article(req.body);

  article.save(function(err){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    res.json(article);
  });
};

exports.list = function(req,res){
  Article.find(function(err,articles){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    res.json(articles);
  });
};

exports.read = function(req,res){
  Article.findOne({community : req.params.community, boardAddr : req.params.boardAddr}, function(err, article){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    res.json(article);
  });
};

exports.update = function(req,res){ // only community, boardAddr
  Article.findOne({community : req.params.community, boardAddr : req.params.boardAddr}, function(err, article){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    if(!article){
      res.json({
        "result" : "ERROR",
        "code" : 3010,
        "message" : "article not exist"
      });
      return;
    }

    if(req.body.community) article.community = req.body.community;
    if(req.body.boardAddr) article.boardAddr = req.body.boardAddr;


    article.save(function(err){
      if(err){
        res.json({
          "result" : "ERROR",
          "code" : 3030,
          "message" : "article update error"
        });
        return;
      }
      res.json(article);
    });
  });
};

exports.delete = function(req,res){
  Article.findOne({community : req.params.community, boardAddr : req.params.boardAddr}, function(err, article){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    if(!article){
      res.json({
        "result" : "ERROR",
        "code" : 3010,
        "message" : "article not exist"
      });
      return;
    }
    article.remove(function(err){
      if(err){
        res.json({
          "result" : "ERROR",
          "code" : err.code,
          "message" : err
        });
        return;
      }
      res.json(article);
    });
  });
};

exports.deleteAll = function(req,res){
  Article.remove({},function(err){
    if(err){
      res.json({
        "result" : "ERROR",
        "code" : err.code,
        "message" : err
      });
      return;
    }
    res.json('Success to delete articles all');
  });
};
