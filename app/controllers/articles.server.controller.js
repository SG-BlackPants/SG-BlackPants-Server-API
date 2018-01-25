const Article = require('mongoose').model('Article');

exports.create = (req, res) => {
  const article = new Article(req.body);

  article.save(err => {
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

exports.list = (req,res) => {
  Article.find((err,articles) => {
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

exports.read = (req,res) => {
  Article.findOne({community : req.params.community, boardAddr : req.params.boardAddr}, (err, article) => {
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

exports.update = (req,res) => { // only community, boardAddr
  Article.findOne({community : req.params.community, boardAddr : req.params.boardAddr}, (err, article) => {
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


    article.save(err => {
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

exports.delete = (req,res) => {
  Article.findOne({community : req.params.community, boardAddr : req.params.boardAddr}, (err, article) => {
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
    article.remove(err => {
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

exports.deleteAll = (req,res) => {
  Article.remove({}, err => {
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
