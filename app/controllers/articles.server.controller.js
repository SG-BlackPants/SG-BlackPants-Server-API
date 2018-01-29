const Article = require('mongoose').model('Article');

exports.create = (req, res, next) => {
  const article = new Article(req.body);

  article.save(err => {
    if(err) next(err);
    res.json(article);
  });
};

exports.list = (req, res, next) => {
  Article.find((err,articles) => {
    if(err) return next(err);
    res.json(articles);
  });
};

exports.read = (req, res, next) => {
  Article.findOne({community : req.params.community, boardAddr : req.params.boardAddr}, (err, article) => {
    if(err) return next(err);
    res.json(article);
  });
};

exports.update = (req, res, next) => { // only community, boardAddr
  Article.findOne({community : req.params.community, boardAddr : req.params.boardAddr}, (err, article) => {
    if(err) return next(err);
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

exports.delete = (req, res, next) => {
  Article.findOne({community : req.params.community, boardAddr : req.params.boardAddr}, (err, article) => {
    if(err) next(err);
    if(!article) {
      res.json({
        "result" : "ERROR",
        "code" : 3010,
        "message" : "article not exist"
      });
      return;
    }
    article.remove(err => {
      if(err) next(err);
      res.json(article);
    });
  });
};

exports.deleteAll = (req, res, next) => {
  Article.remove({}, err => {
    if(err) next(err);
    res.json('Success to delete articles all');
  });
};
