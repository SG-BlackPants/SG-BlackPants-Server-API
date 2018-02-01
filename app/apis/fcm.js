const FCM = require('fcm-push'),
      serverKey = 'AAAAzk2Hfk8:APA91bFUQTlq_YxftWDeQmY7NGvvt8KI5TaLxPwpy8DIzm7mzs4FMYTYWd2CL_N5Q7V9U2tfEs6xgoymYGVNj1JqXgypEuDoKr5Hc0E01o8kg8cfNe4Yzhhzo1s-DBpzC7e_jnoHgggQ',
      fcm = new FCM(serverKey);

exports.sendMessageToClient(data){
  console.log(data);
  const message = {
    to: data.dest,
    collapse_key: data.type,
    data: {
      "keyword" : data.keyword,
      "community" : data.community,
      "boardAddr" : data.boardAddr
    },
    notification: {
      title: "키워드 알림",
      body: data.keyword
    }
  }
}

fcm.send(message, function(err, res){
  if(err) return next(err);
  console.log('Success to send push: ' + res);
});
