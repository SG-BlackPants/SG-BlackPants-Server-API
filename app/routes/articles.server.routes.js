const articles = require('../../app/controllers/articles.server.controller'),
      users = require('../../app/controllers/users.server.controller');

module.exports = app => {
  app.route('/articles')
  .post(articles.create)
  .get(articles.list)
  .delete(articles.deleteAll);

  app.route('/articletest/:keyword')
    .post(articles.searchArticlesByKeyword);

  app.route('/articles/:keyword')
    .post(users.isValidToken, users.addSearchHistoryAndNext, articles.searchArticlesByKeyword);

  app.route('/articles/:community/:boardAddr')
  .get(articles.read)
  .put(articles.update)
  .delete(articles.delete);
};
