const fb = require('../../app/controllers/firebase.server.controller');

module.exports = app => {
  app.route('/firebase/test')
    .post(fb.pushTest);

  app.route('/firebase/new')
    .post(fb.findKeywordsForPush, fb.findUserByKeywordAndPush);
}
