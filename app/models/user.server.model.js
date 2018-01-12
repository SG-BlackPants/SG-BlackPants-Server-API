const mongoose = require('mongoose'),
      crypto= require('crypto'),
      Schema = mongoose.Schema;

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
    type : String
  },
  university : {
    type : String
  },
  joinDate : {
    type : Date
  },
  keywords : {
    type : Object
  },
  community : {
      name : String,
      uid : String,
      loginID : String,
      loginPW : String,
      salt : String,
      url : String
  },
  search : {
    type : String
  }
}, {versionKey: false});

UserSchema.pre('save', function(next){
  if(this.community.loginPW){
    this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    this.community.loginPW = this.hashPassword(this.community.loginPW);
  }
  next();
});

UserSchema.methods.hashPassword = function(password){
  return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
};

UserSchema.methods.authenticate = function(password){
  return this.password === this.hashPassword(password);
};

mongoose.model('User', UserSchema);
