const FCM = require('fcm-node'),
      config = require('../../config/config');
      serverKey = config.firebaseServerKey,
      fcm = new FCM(serverKey);

exports.sendMessageToClient = (data) => {
  console.log(data);
  const message = {
    "to": data.dest,
    "priority" : "high",
    "collapse_key": "push",
    data: {
      "keyword" : data.keyword,
      "community" : data.community,
      "boardAddr" : data.boardAddr
    },
    "notification": {
      "title": "키워드 알림",
      "body": data.keyword
    }
  }

  fcm.send(message, function(err, res){
    if(err) return console.log('Fail to send push message: ' + err);
    console.log('Success to send push: ' + res);
  });
}
