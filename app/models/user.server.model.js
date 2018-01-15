const mongoose = require('mongoose'),
      crypto= require('crypto'),
      algorithm = 'aes-256-cbc',
      key = 'thisissecretkey',
      Schema = mongoose.Schema;

function StringLengthValidator(val){
  if(val.length > 10) return null;
  return val;
};

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
    validate : [{validator:StringLengthValidator, msg:'name length should be less than 10'}]
  },
  university : {
    type : String
  },
  joinDate : {
    type : Date,
    default : Date.now
  },
  keywords : [{
    type : Schema.Types.ObjectId,
    ref : 'Keyword'
  }],
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
}, {versionKey: false});

UserSchema.pre('save', function(next){
  if(this.community.loginPW){
    console.log('this at encrypt: ' + this);
    this.community.loginPW = this.encrypt(this.community.loginPW);
  }
  next();
});

UserSchema.methods.encrypt = function(password){
    const cipher = crypto.createCipher(algorithm, key);
    let result = cipher.update(password, 'utf8', 'base64');
    result += cipher.final('base64');

    return result;
};

UserSchema.methods.decrypt = function(password){
    const decipher = crypto.createDecipher(algorithm, key);
    let result = decipher.update(password, 'base64', 'utf8');
    result += decipher.final('utf8');

    return result;
};

mongoose.model('User', UserSchema);
