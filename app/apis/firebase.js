const admin = require("firebase-admin"),
      serviceAccount = require("../../serviceAccountKey.json"),
      config = require("../../config/config"),
      Promise = require("bluebird"),
      serverKey = config.firebaseServerKey;

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

exports.sendMessageToClient = (data, res, next) => {
  const message = {
    "data" : {
      "keyword" : data.keyword,
      "university" : data.university,
      "community" : data.community,
      "boardAddr" : data.boardAddr
    }
  };

  admin.messaging().sendToDevice(data.dest, message)
      .then(result => {
        console.log('Successfully sent message: ' + result);
        res.json(result);
      })
      .catch(err => {
        console.log('Error sending message: ' + err);
        next(err);
      });

};
