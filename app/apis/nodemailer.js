const nodemailer = require('nodemailer'),
      account = require('../../serviceAccountKey'),
      redis = require('./redis');

const transporter = nodemailer.createTransport({
  service: "google",
  auth: {
    user: account.google_email,
    pass: account.google_password
  }
});

module.exports = user => {
  const mailOption = {
    from : account.google_email,
    to : user.email,
    subject : "UnivScanner 가입 인증메일입니다",
    text : "링크를 클릭하시면 인증이 완료됩니다. http://ec2-52-23-164-26.compute-1.amazonaws.com:3000/firebase/" + user._id + "/email/verify"
  };



  transporter.sendMail(mailOption, (err, info) => {
    if(err) return next(err);



    res.json({
      "result" : "SUCCESS",
      "code" : "SEND_MAIL",
      "message" : "success to send mail (" + user.email + ")"
    })
  });
};
