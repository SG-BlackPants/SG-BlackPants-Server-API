const config = require('./config'),
      elasticsearch = require('elasticsearch'),
      elasticClient = new elasticsearch.Client({
        host : config.elasticsearch,
        log : 'error'
      });

  module.exports = {
    ping: function(){
      elasticClient.ping({
        requestTimeout: 30000
      }, function(err){
        if(err) return console.log('Elasticsearch cluster is down!');
        console.log("Elasticsearch cluster is up!");
      });
    },

    // Create index
    initIndex: function(req, res, indexName){
      elasticClient.indices.create({
        index: indexName
      }).then(function(resp){
        res.status(200);
        return res.json(resp);
      }, function(err){
        res.status(500);
        return res.json(err);
      });
    },

    // Check if index exists
    indexExists: function(req, res, indexName){
      elasticClient.indices.exists({
        index: indexName
      }).then(function(resp){
        res.status(200);
        return res.json(resp);
      }, function(err){
        res.status(500);
        return res.json(err);
      });
    },

    // Preparing index and its mapping
    initMapping: function(req, res, indexName, docType, payload){
      elasticClient.indices.putMapping({
        index: indexName,
        type: docType,
        body: payload
      }).then(function(resp){
        res.status(200);
        return res.json(resp);
      }, function(err){
        res.status(500);
        return res.json(err);
      });
    },

    // Add/Update a document
    addDocument: function(req, res, indexName, _id, docType, payload){
      elasticClient.index({
        index: indexName,
        type: docType,
        id: _id,
        body: payload
      }).then(function(resp){
        res.status(200);
        return res.json(resp);
      }, function(err){
        res.status(500);
        return res.json(err);
      });
    },

    // Update a document
    updateDocument: function(req, res, index, _id, docType, payload){
      elasticClient.update({
        index: index,
        type: docType,
        id: _id,
        body: payload
      },function(err, resp){
        if(err) return res.json(err);
        return res.json(resp);
      });
    },

    // Search
    search: function(req, res, indexName, docType, payload){
      elasticClient.search({
        index: indexName,
        type: docType,
        body: payload
      }).then(function(resp){
        return res.json(resp);
      }, function(err){
        return res.json(err);
      });
    },

    // Delete a document from an index
    deleteDocument: function(req, res, index, _id, docType){
      elasticClient.delete({
        index: index,
        type: docType,
        id: _id
      }, function(err, resp){
        if(err) return res.json(err);
        return res.json(resp);
      });
    },

    // Delete all
    deleteAll: function(req, res){
      elasticClient.indices.delete({
        index: '_all'
      }, function(err, resp){
        if(err) return res.json(err);
        return  res.json(resp);
      });
    }
  };
