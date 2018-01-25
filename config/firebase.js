const admin = require("firebase-admin"),
      serviceAccount = require("../serviceAccountKey.json"),
      config = require("./config");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebase
});

exports.verifyIdToken = idToken => {
  admin.auth().verifyIdToken(idToken)
     .then(decodedToken => decodedToken)
     .catch(err => err);
};
