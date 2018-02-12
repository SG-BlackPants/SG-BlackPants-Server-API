const config = require("../../config/config"),
      Promise = require('bluebird'),
      client = require('redis').createClient(config.redis_port, config.redis_host);

exports.isConnected = () => {
  client.on('connect', () => {
    console.log('Redis connected');
  }, err => {
    console.log('Redis connection fail');
  });
};

exports.updateItem = (board, keyword, count) => {
  return new Promise((resolve, reject) => {
    client.zincrby(board, count, keyword, (err, reply) => {
      if(err) reject(err);
      resolve(reply);
    });
  });
};

exports.getRank = board => {
  return new Promise((resolve, reject) => {
    client.zrevrange(board, 0, 9 , (err, reply) => {
      if(err) reject(err);
      resolve(reply);
    });
  });
};

exports.getRankForTest = board => {
  return new Promise((resolve, reject) => {
    client.zrevrange(board, 0, 9 , "WITHSCORES", (err, reply) => {
      if(err) reject(err);
      resolve(reply);
    });
  });
};
