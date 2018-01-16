const keywords = require('../../app/controllers/keywords.server.controller');

module.exports = function(app) {
  app.route('/keywords')
  .post(keywords.create)
  .get(keywords.list)
  .delete(keywords.deleteAll);

  app.route('/keywords/:name/:community')
  .get(keywords.read)
  .put(keywords.update)
  .delete(keywords.delete);
};
