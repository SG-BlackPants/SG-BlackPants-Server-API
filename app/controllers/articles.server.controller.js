const Article = require('mongoose').model('Article'),
      User = require('mongoose').model('User'),
      elasticsearch = require('../apis/elasticsearch'),
      redis = require('../apis/redis');

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
    "type" : "articles",
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
    "type" : "articles",
    "body" : { "query" : {
                  "bool" : {
                    "must" : {
                      "bool" : [{
                        "should" : [
                          { "match" : { "content" : req.params.keyword } },
                          { "match" : { "title" : req.params.keyword } }
                        ]
                      }]
                    }
                  }
                },
                "sort" : [
                  { "createdDate" : { "order" : "desc" } }
                ]
            }
    };

    if(req.body.community){
      let communityIndex = 0;
      const communityQuery = {
          "should" : [
            { "match" : { "content" : req.body.community[communityIndex] } }
          ]
        };

        while(req.body.community[++communityIndex]){
          communityQuery.should.push({
            "match" : { "content" : req.body.community[communityIndex] }
          });
        }
        query.body.query.bool.must.bool.push(communityQuery);
    }

    if(req.body.startDate){
      query.body.query.bool.must.bool.push({
        "must" : {
          "range" : {
            "createdDate" : {
                                "gte" : req.body.startDate,
                                "lte" : req.body.endDate,
                                "time_zone" : "+09:00"
                              }
                            }
        }
      });
    }

    if(req.body.secondWord){
      query.body.query.bool.must.bool.push({
        "should" : [
          { "match" : { "content" : req.body.secondWord } },
          { "match" : { "title" : req.body.secondWord } }
        ]
      });
    }

    return res.json(query);

  elasticsearch.searchAndReturn(query)
      .then(result => {
        if(result.message[0]){
          addKeywordForAutoComplete(req.body.university, req.params.keyword);

          res.json({
            "result" : "SUCCESS",
            "code" : "Search",
            "message" : result.message
          });
        }else{
          res.json({
            "result" : "FAILURE",
            "code" : "Search",
            "message" : "empty"
          });
        }
      }).error(err => {
        console.log('error from searchArticlesByKeyword: ' + err);
        next(err);
      });
};

function addKeywordForAutoComplete(university, keyword){
  redis.addKeyword(university, keyword)
    .then(reply => {
      if(!reply){
        console.log("empty");
      }
      console.log(university + ' : ' + keyword);
    }).error(err => {
      next(err);
    });
};
