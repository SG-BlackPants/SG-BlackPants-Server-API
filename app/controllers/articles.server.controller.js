const Article = require('mongoose').model('Article'),
      elasticsearch = require('../apis/elasticsearch');

exports.create = (req, res, next) => {
  const article = new Article(req.body);

  article.save(err => {
    if(err) return next(err);
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
  const query = {
    "index" : "univscanner",
    "type" : "article",
    "body" : { "query" : {
                  "bool" : {
                    "must" : [
                      { "match" : { "community" : req.params.community } },
                      { "match" : { "boardAddr" : req.params.boardAddr } }
                    ]
                  }
                }
            }
    };

    elasticsearch.searchAndReturn(query)
        .then(result => {
          return res.json({
            "result" : "SUCCESS",
            "code" : "readArticle",
            "message" : result._source
          })
        }).error(err => {
          console.log('error from read: ' + err)
          next(err);
        });
  Article.findOne({community : req.params.community, boardAddr : req.params.boardAddr}, (err, article) => {
    if(err) return next(err);
    if(!article){
      const err = new Error('article not exist');
      err.code = 'ArticleNotExists'
      return next(err);
    }
    res.json(article);
  });
};

exports.update = (req, res, next) => { // only community, boardAddr
  Article.findOne({community : req.params.community, boardAddr : req.params.boardAddr}, (err, article) => {
    if(err) return next(err);
    if(!article){
      const err = new Error('article not exist');
      err.code = 'ArticleNotExists'
      return next(err);
    }

    if(req.body.community) article.community = req.body.community;
    if(req.body.boardAddr) article.boardAddr = req.body.boardAddr;


    article.save(err => {
      if(err) return next(err);
      res.json(article);
    });
  });
};

exports.delete = (req, res, next) => {
  Article.findOne({community : req.params.community, boardAddr : req.params.boardAddr}, (err, article) => {
    if(err) return next(err);
    if(!article) {
      const err = new Error('article not exist');
      err.code = 'ArticleNotExists'
      return next(err);
    }
    article.remove(err => {
      if(err) return next(err);
      res.json(article);
    });
  });
};

exports.deleteAll = (req, res, next) => {
  Article.remove({}, err => {
    if(err) return next(err);
    res.json({
      "result" : "SUCCESS",
      "code" : "DeleteAll",
      "message" : "Success to delete users all"
    });
  });
};

exports.searchArticlesByKeyword = (req, res, next) => {
  const query = {
    "index" : "univscanner",
    "type" : "article",
    "body" : { "query" : {
                  "bool" : {
                    "should" : [
                      { "match" : { "content" : req.params.keyword } },
                      { "match" : { "title" : req.params.keyword } }
                    ]
                  }
                },
                "sort" : [
                  { "createdDate" : { "order" : "desc" } }
                ]
            }
    };

  elasticsearch.searchAndReturn(query)
      .then(result => {
        res.json({
          "result" : "SUCCESS",
          "code" : "Search",
          "message" : result._source
        });
      }).error(err => {
        console.log('error from searchArticlesByKeyword: ' + err);
        next(err);
      });
};
