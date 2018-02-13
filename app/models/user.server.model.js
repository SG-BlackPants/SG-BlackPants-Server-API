const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const UserSchema = new Schema({
  _id : {
    type : String,
    trim : true,
    required : 'User ID is required'
  },
  registrationToken : {
    type : String,
    required : 'Token ID is required'
  },
  email : {
    type : String,
    trim : true,
    required : 'Email is required'
  },
  name : {
    type : String,
    required : 'Name is required'
  },
  university : {
    type : String,
    required : 'University is required'
  },
  isRegistered : {
    type : Boolean,
    default : false
  },
  joinDate : {
    type : Date,
    default : Date.now
  },
  keywords : {
    type : [{
      keyword : String,
      university : String,
      community : String,
      startDate : Date,
      endDate : Date,
      secondWord : String
    }]
  },
  community : [{
      name : String,
      uid : String,
      loginID : String,
      loginPW : String,
      url : String
  }],
  search : [{
    type : String
  }]
}, {
  versionKey : false,
  usePushEach : true
});

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

UserSchema.path('email').validate(email => emailRegex.test(email), 'Please fill a valid email address');
UserSchema.path('_id').validate(id => id.length === 28, 'uid length must be 28');
UserSchema.path('keywords').validate(keywords => keywords.length <= 5, 'keywords exceeds the limit of 5');

mongoose.model('User', UserSchema);
