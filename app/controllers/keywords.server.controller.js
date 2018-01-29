const Keyword = require('mongoose').model('Keyword');

exports.create = (req, res, next) => {
  const keyword = new Keyword(req.body);

  keyword.save(err => {
    if(err) next(err);
    res.json(keyword);
  });
};

exports.list = (req,res) => {
  Keyword.find((err,keywords) => {
    if(err) next(err);
    res.json(keywords);
  });
};

exports.read = (req,res) => {
  Keyword.findOne({name : req.params.name, community : req.params.community}, (err, keyword) => {
    if(err) next(err);
    res.json(keyword);
  });
};

exports.update = (req,res) => { // only name, community
  Keyword.findOne({name : req.params.name, community : req.params.community}, (err, keyword) => {
    if(err) next(err);
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

    keyword.save(err => {
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

exports.delete = (req,res) => {
  Keyword.findOne({name : req.params.name, community : req.params.community}, (err, keyword) => {
    if(err) next(err);
    if(!keyword){
      res.json({
        "result" : "ERROR",
        "code" : 3010,
        "message" : "keyword not exist"
      });
      return;
    }
    keyword.remove(err => {
      if(err) next(err);
      res.json(keyword);
    });
  });
};

exports.deleteAll = (req,res) => {
  Keyword.remove({}, err => {
    if(err) next(err);
    res.json('Success to delete keywords all');
  });
};
