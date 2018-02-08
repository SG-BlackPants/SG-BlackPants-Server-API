const fb = require('../../app/controllers/firebase.server.controller');

module.exports = app => {
  app.route('/firebase/test')
    .post(fb.pushTest);

  app.route('/firebase/new')
    .post(fb.findKeywordsForPush, fb.findUserByKeywordAndPush);

  app.route('/firebase/:userId/email/request')
    .post(firebase.sendEmailForVerified);

  app.route('/firebase/:userId/email/verify')
    .put(firebase.verifyEmail);

  app.route('/firebase/:userId/email/check')
    .get(firebase.checkEmailVarified);
}
