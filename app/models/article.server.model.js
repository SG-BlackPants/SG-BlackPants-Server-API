const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  community : {
    type : String,
    required : 'community is required'
  },
  boardAddr : {
    type : String,
    required : 'boardAddr is required'
  },
  title : {
    type : String
  },
  author : {
    type : String
  },
  content : {
    type : String
  },
  images : [{
    type : String
  }],
  createdDate : {
    type : Date,
    default : Date.now
  }
}, {
  versionKey: false,
  usePushEach : true
});

ArticleSchema.virtual('communityBoardAddr').get(() => this.community + '_' + this.boardAddr);
ArticleSchema.set('toJSON', {virtuals : true});

mongoose.model('Article', ArticleSchema);
