const FCM = require('fcm-node'),
      config = require('../../config/config');
      serverKey = config.firebaseServerKey,
      fcm = new FCM(serverKey);

exports.sendMessageToClient = (data, next) => {
  const message = {
    "to": data.dest,
    "priority" : "high",
    "collapse_key": data.community+'_'+data.boardAddr,
    data: {
      "keyword" : data.keyword,
      "university" : data.university,
      "community" : data.community,
      "boardAddr" : data.boardAddr
    },
    "notification": {
      "title": "키워드 알림",
      "body": data.keyword
    }
  }

  fcm.send(message, function(err, res){
    if(err) return next(err);
    console.log('Success to send push: ' + res);
  });
}
