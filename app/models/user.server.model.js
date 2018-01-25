const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const UserSchema = new Schema({
  _id : {
    type : String,
    trim : true,
    required : 'User ID is required'
  },
  email : {
    type : String,
    trim : true,
    required : 'Email is required'
  },
  userToken : {
    type : String
  },
  name : {
    type : String
  },
  university : {
    type : String
  },
  joinDate : {
    type : Date,
    default : Date.now
  },
  keywords : {
    type : [{
      type : Schema.Types.ObjectId,
      ref : 'Keyword'
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
UserSchema.path('_id').validate(id => id.length <= 8, 'id length exceeds the limit of 8');
UserSchema.path('keywords').validate(keywords => keywords.length <= 5, 'keywords exceeds the limit of 5');

mongoose.model('User', UserSchema);
