const { AssertionError } = require('assert');
const { MongoError } = require('mongodb');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.status(404).json({
      "result" : "ERROR",
      "code" : "NotFound",
      "message" : req.url + " not found"
    });
  });

  app.use(function handleAssertionError(err, req, res, next){
    if(err instanceof AssertionError){
      console.log(err.stack);
      res.status(400).json({
        "result" : "ERROR",
        "code" : "AssertionError",
        "message" : err.message
      });
    }else next(err);
  });

  app.use(function handleDatabaseError(err, req, res, next){
    if(err instanceof MongoError){
      console.log(err.stack);
      res.status(503).json({
        "result" : "ERROR",
        "code" : "MongoError",
        "message" : err.message
      });
    }else next(err);
  });

  app.use(function handleDefaultError(err, req, res, next){
    console.log("I'm default error handler");
    console.log(err);
    res.status(500).json({
      "result" : "ERROR",
      "code" : err.code,
      "message" : err.message
    });
  });
}
