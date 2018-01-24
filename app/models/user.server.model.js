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
    //validate : [{validator:userNameLimit, msg:'name length should be less than 8'}]
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
  //  validate : [{validator: keywordsLimit, msg: 'keywords exceeds the limit of 5'}]
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

UserSchema.path('email').validate(function(email){
  var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailRegex.test(email.text); // Assuming email has a text attribute
}, 'Please fill a valid email address');

UserSchema.path('_id').validate(function(id){
  return id.length <= 8;
}, 'id length exceeds the limit of 8');

UserSchema.path('keywords').validate(function(keywords){
  return keywords.length <= 5;
}, 'keywords exceeds the limit of 5');

mongoose.model('User', UserSchema);
