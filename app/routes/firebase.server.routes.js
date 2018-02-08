const fb = require('../../app/controllers/firebase.server.controller');

module.exports = app => {
  app.route('/firebase/test')
    .post(fb.pushTest);

  app.route('/firebase/new')
    .post(fb.findKeywordsForPush, fb.findUserByKeywordAndPush);

  app.route('/firebase/:userId/email/request')
    .get(firebase.sendEmailForAuth);

  app.route('/firebase/:userId/email/verify')
    .get(firebase.verifyEmail);

  app.route('/firebase/:userId/email/checkauth')
    .get(firebase.checkEmailAuth);
}
