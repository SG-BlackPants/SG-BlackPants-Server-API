const config = require('./config'),
      mongoose = require('mongoose');

  module.exports = function(){
    //mongoose.Promise = global.Promise;
    const db = mongoose.connect(config.db,
    err => console.log(err ? err : 'MongoDB connected')
  );

    require('../app/models/user.server.model.js');
    return db;
  }
