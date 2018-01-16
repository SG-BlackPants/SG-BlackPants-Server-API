const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const KeywordSchema = new Schema({
  name : {
    type : String
  },
  community : {
    type : String
  },
  users : [{
    type : String,
    ref : 'User'
  }],
  count : {
    type : Number
  }
}, {
  versionKey: false,
  usePushEach : true
});


mongoose.model('Keyword', KeywordSchema);
