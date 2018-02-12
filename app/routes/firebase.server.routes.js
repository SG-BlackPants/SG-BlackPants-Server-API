const fb = require('../../app/controllers/firebase.server.controller'),
      users = require('../../app/controllers/users.server.controller');

module.exports = app => {
  app.route('/firebase/test')
    .post(fb.pushTest);

  app.route('/firebase/new')
    .post(fb.findKeywordsForPush, fb.findUserByKeywordAndPush);

  app.route('/firebase/get')
    .post(users.isValidToken, fb.getPushHistory);


  app.route('/firebase/:userId/email/request')
    .post(fb.sendEmailForVerified);
  app.route('/firebase/:userId/email/verify')
    .get(fb.verifyEmail);
  app.route('/firebase/:userId/email/check')
    .get(fb.checkEmailVarified);
}
