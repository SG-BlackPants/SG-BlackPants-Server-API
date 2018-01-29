module.exports = (app) => {
  app.use((req, res, next) => {
    res.status(404).json({
      "result" : "ERROR",
      "code" : 404,
      "message" : "It has no match url"
    });
  });

  app.use((err, req, res, next) => {
    console.log("I'm error function");
    console.log(err.stack);
    res.status(500).json({
      "result" : "ERROR",
      "code" : err.code,
      "message" : err.message
    });
  });
}
