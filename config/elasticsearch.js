const config = require('./config'),
      elasticsearch = require('elasticsearch');

  module.exports = function(){
    const db = new elasticsearch.Client({
      host : config.elasticsearch,
      log : 'error'
    });

    console.log('ElasticSearch connected')
    return db;
  }
