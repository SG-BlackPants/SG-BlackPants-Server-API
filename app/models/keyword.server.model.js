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
  }]
}, {
  versionKey: false,
  usePushEach : true
});

mongoose.model('Keyword', KeywordSchema);
