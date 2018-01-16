const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

function userNameLimit(val){
  return val.length <= 8;
};

function keywordsLimit(val){
  return val.length <= 5;
}

const UserSchema = new Schema({
  _id : {
    type : String,
    trim : true,
    required : 'User ID is required'
  },
  userToken : {
    type : String
  },
  name : {
    type : String,
    validate : [{validator:userNameLimit, msg:'name length should be less than 8'}]
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
    }],
    validate : [{validator: keywordsLimit, msg: 'keywords exceeds the limit of 5'}]
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

mongoose.model('User', UserSchema);
