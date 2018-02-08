const fb = require('../../app/controllers/firebase.server.controller');

module.exports = app => {
  app.route('/firebase/test')
    .post(fb.pushTest);

  app.route('/firebase/new')
    .post(fb.findKeywordsForPush, fb.findUserByKeywordAndPush);

  app.route('/firebase/:userId/email/request')
    .post(fb.sendEmailForVerified);

  app.route('/firebase/:userId/email/verify')
    .put(fb.verifyEmail);

  app.route('/firebase/:userId/email/check')
    .get(fb.checkEmailVarified);
}
