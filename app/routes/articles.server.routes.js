const articles = require('../../app/controllers/articles.server.controller');

module.exports = app => {
  app.route('/articles')
  .post(articles.create)
  .get(articles.list)
  .delete(articles.deleteAll);

  app.route('/articles/:keyword')
    .get(articles.searchArticlesByKeyword);

  app.route('/articles/:community/:boardAddr')
  .get(articles.read)
  .put(articles.update)
  .delete(articles.delete);
};
