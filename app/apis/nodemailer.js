const nodemailer = require('nodemailer'),
      account = require('../../serviceAccountKey');

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
    subject : "test",
    text : "링크를 클릭하시면 인증이 완료됩니다. http://ec2-52-23-164-26.compute-1.amazonaws.com:3000/firebase/" + user._id + "/email/"
  };
};
