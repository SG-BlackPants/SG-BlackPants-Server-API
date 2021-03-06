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
  const community = req.params.community,
        boardAddr = req.params.boardAddr.replace(/-/g,'/');
  const query = {
    "index" : "univscanner",
    "type" : "articles",
    "body" : { "query" : {
                  "bool" : {
                    "must" : [
                      { "match" : { "community" : community } },
                      { "match" : { "boardAddr" : boardAddr } }
                    ]
                  }
                }
            }
    };

    elasticsearch.searchAndReturn(query)
        .then(result => {
          if(result.code === "Found" && result.message[0]._source.boardAddr === boardAddr){
            return res.json({
              "result" : "SUCCESS",
              "code" : "readArticle",
              "message" : result.message[0]._source
            });
          }else{
            return res.json({
              "result" : "FAILURE",
              "code" : "readArticle",
              "message" : "empty"
            });
          }
        }).error(err => {
          console.log('error from read: ' + err)
          next(err);
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
    const defaultQuery = {
      "bool" : {}
    };
    let communityQuery = defaultQuery,
        dateQuery = defaultQuery,
        wordQuery = defaultQuery;

    if(req.body.community){
      console.log(req.body.community);
      let communityIndex = 0;
      communityQuery = {
        "bool" : {
          "should" : [
            { "match" : { "community" : req.body.community[communityIndex] } }
          ]
        }
        };

        while(req.body.community[++communityIndex]){
          communityQuery.bool.should.push({
            "match" : { "community" : req.body.community[communityIndex] }
          });
        }
    }

    if(req.body.startDate){
      dateQuery = {
        "bool" : {
          "must" : [{
            "range" : {
              "createdDate" : {
                                  "gte" : req.body.startDate,
                                  "lte" : req.body.endDate,
                                  "time_zone" : "+09:00"
                                }
                              }
          }]
        }
      };
    }

    if(req.body.secondWord){
      wordQuery = {
        "bool" : {
          "should" : [
            { "match" : { "content" : { "query" : req.body.secondWord, "fuzziness" : "AUTO" } } },
            { "match" : { "title" : { "query" : req.body.secondWord, "fuzziness" : "AUTO" } } }
          ]
        }
      };
    }

    /* 대학교 조건 걸어야함
    {
      "bool" : {
        "must" : [
          { "match" : { "university" : req.body.university } }
        ]
      }
    },
    */
    const query = {
      "index" : "univscanner",
      "type" : "articles",
      "body" : {
                "from" : 0, "size" : 10,
                "query" : {
                    "bool" : {
                      "must" : [
                        {
                          "bool" : {
                            "should" : [
                              {
                                "match" : {
                                  "content" : {
                                    "query" : req.params.keyword,
                                    "fuzziness" : "AUTO"
                                  }
                                }
                              },
                              {
                                "match" : {
                                  "title" : {
                                    "query" : req.params.keyword,
                                    "fuzziness" : "AUTO"
                                  }
                              }
                            }
                            ]
                          }
                        },
                        { "bool" : communityQuery.bool},
                        { "bool" : dateQuery.bool},
                        { "bool" : wordQuery.bool}
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
        if(result.message[0]){
          addKeywordForAutoComplete(req.body.university, req.params.keyword, result.count);
          res.json({
            "result" : "SUCCESS",
            "code" : "Search",
            "count" : result.count,
            "message" : result.message
          });
        }else{
          res.json({
            "result" : "FAILURE",
            "code" : "Search",
            "count" : result.count,
            "message" : []
          });
        }
      }).error(err => {
        console.log('error from searchArticlesByKeyword: ' + err);
        next(err);
      });
};

function addKeywordForAutoComplete(university, keyword, count){
  redis.addKeyword(university, keyword, count)
    .then(reply => {
      if(!reply){
        console.log("empty");
      }
      console.log(university + ' : ' + keyword);
      return;
    }).error(err => {
      console.log('addKeywordForAutoComplete Error: ' + err);
      return;
    });
};
