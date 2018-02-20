const redis = require('../apis/redis');

exports.updateKeywordRank = (req, res, next) => {
const key = req.body.university+":keywords";
  redis.updateItem(key, req.body.keyword, req.body.count).then(reply => {
    res.json({
      "result" : "SUCCESS",
      "code" : "UPDATE_KEYWORD_RANK",
      "message" : reply
    });
  }).error(err => {
    next(err);
  });
};

exports.getKeywordRank = (req, res, next) => {
  const key = req.params.university+":keywords";
  redis.getRank(key).then(reply => {
    res.json({
      "result" : "SUCCESS",
      "code" : "GET_KEYWORD_RANK",
      "message" : reply
    });
  }).error(err => {
    next(err);
  });
};

//TEST필요
exports.getPushHistory = (req, res, next) => {
  redis.getRankForTest(req.body._id+':push').then(histories => {
    const results = [];

    if(histories[0]){
      let jobCount = 0;

      for(let index = 0; index < histories.length; index += 2){
        const strArr = histories[index].split('=');
        const createdDate = new Date(histories[index+1]*1.0);

        results.push({
          "keyword" : strArr[0],
          "community" : strArr[1],
          "boardAddr" : strArr[2],
          "createdDate" : createdDate
        });

        if(index === histories.length-2){
          return res.json({
            "result" : "SUCCESS",
            "code" : "PUSH_HISTORY",
            "message" : results
          })
        }
      }
      // histories.forEach(history => {
      //   const strArr = history.split('=');
      //   results.push({
      //     "keyword" : strArr[0],
      //     "community" : strArr[1],
      //     "boardAddr" : strArr[2],
      //     "createdDate" : strArr[3]
      //   });
      //
      //   if(histories.length === ++jobCount){
      //     return res.json({
      //       "result" : "SUCCESS",
      //       "code" : "PUSH_HISTORY",
      //       "message" : results
      //     });
      //   }
      // });
    }else{
      return res.json({
        "result" : "FAILURE",
        "code" : "PUSH_HISTORY",
        "message" : []
      });
    }
  });
};

exports.getAutocompleteKeyword = (req, res, next) => {
  redis.suggestKeyword(req.params.university, req.params.prefix)
    .then(result => {
      console.log('result: ' + result + ' in getAutocompleteKeyword');
      return res.json(result);
    }).error(err => {
      return next(err);
    });
};

exports.addKeywordForAutoComplete = (req, res, next) => {
  redis.addKeyword(req.body.university, req.body.keyword)
    .then(reply => {
      if(!reply){
        return res.json({
          "result" : "FAILURE",
          "code" : "ADD_AUTOCOMPLETE",
          "message" : "empty"
        });
      }
      return res.json({
        "result" : "SUCCESS",
        "code" : "ADD_AUTOCOMPLETE",
        "message" : req.body.university + ' : ' + req.body.keyword
      });
    }).error(err => {
      next(err);
    });
};

exports.deleteAll = (req, res, next) => {
  redis.deleteAll()
    .then(result => {
      res.json({
        "result" : "SUCCESS",
        "code" : "DELETE_ALL",
        "message" : "redis initialize"
      });
    }).error(err => {
      next(err);
    });
};

exports.list = (req, res, next) => {
  redis.list(req.params.board).then(results => {
    return res.json(results);
  }).error(err => {
      return next(err);
});
};
