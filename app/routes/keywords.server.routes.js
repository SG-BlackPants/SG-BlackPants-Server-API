const keywords = require('../../app/controllers/keywords.server.controller');

module.exports = app => {
  app.route('/keywords')
  .post(keywords.create)
  .get(keywords.list)
  .delete(keywords.deleteAll);

  app.route('/keywords/popular')
    .get(keywords.getPopularKeywords);

  app.route('/keywords/:community/:name')
  .get(keywords.read)
  .put(keywords.update)
  .delete(keywords.delete);
};
