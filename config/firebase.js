const admin = require("firebase-admin"),
      serviceAccount = require("../serviceAccountKey.json"),
      config = require("./config"),
      Promise = require("bluebird");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebase
});

exports.verifyIdToken = idToken => {
  return new Promise((resolve, reject) => {
    admin.auth().verifyIdToken(idToken)
       .then(decodedToken => resolve(decodedToken))
       .catch(err => resolve(err));
  });
};
