const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const KeywordSchema = new Schema({
  name : {
    type : String,
    required : 'keyword is required'
  },
  university : {
    type : String,
    required : 'university is required'
  },
  users : [{
    type : String,
    ref : 'User'
  }],
  count : {
    type : Number,
    default : 0
  }
}, {
  versionKey: false,
  usePushEach : true
});

KeywordSchema.virtual('nameCommunity').get(() => this.name + '_' + this.community);
KeywordSchema.set('toJSON', {virtuals : true});

mongoose.model('Keyword', KeywordSchema);
