const Keyword = require('mongoose').model('Keyword');

exports.create = (req, res, next) => {
  const keyword = new Keyword(req.body);

  keyword.save(err => {
    if(err) return next(err);
    res.json(keyword);
  });
};

exports.list = (req, res, next) => {
  Keyword.find((err,keywords) => {
    if(err) return next(err);
    res.json(keywords);
  });
};

exports.read = (req, res, next) => {
  Keyword.findOne({name : req.params.name, community : req.params.community}, (err, keyword) => {
    if(err) return next(err);
    if(!keyword){
      const err = new Error('keyword not exists');
      err.code = 'KeywordNotExists';
      return next(err);
    }
    res.json(keyword);
  });
};

exports.update = (req, res, next) => { // only name, community
  req.params.name = '맥북'
  Keyword.findOne({name : req.params.name, community : req.params.community}, (err, keyword) => {
    if(err) return next(err);
    if(!keyword){
      const err = new Error('keyword not exists')
      err.code = 'KeywordNotExists'
      return next(err);
    }

    if(req.body.name) keyword.name = req.body.name;
    if(req.body.community) keyword.community = req.body.community;

    keyword.save(err => {
      if(err) return next(err);
      res.json(keyword);
    });
  });
};

exports.delete = (req, res, next) => {
  Keyword.findOne({name : req.params.name, community : req.params.community}, (err, keyword) => {
    if(err) return next(err);
    if(!keyword){
      const err = new Error('keyword not exists');
      err.code = 'KeywordNotExists'
      return next(err);
    }
    keyword.remove(err => {
      if(err) next(err);
      res.json(keyword);
    });
  });
};

exports.deleteAll = (req, res, next) => {
  Keyword.remove({}, err => {
    if(err) return next(err);
    res.json({
      "result" : "SUCCESS",
      "code" : "DeleteAll",
      "message" : "Success to delete users all"
    });
  });
};
