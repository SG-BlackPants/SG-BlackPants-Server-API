const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const KeywordSchema = new Schema({
  _id : {
    type : Schema.Types.ObjectId
  },
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
}, {versionKey: false});


mongoose.model('Keyword', KeywordSchema);
