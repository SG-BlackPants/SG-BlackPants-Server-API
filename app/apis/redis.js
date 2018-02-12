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

exports.addKeyword = (university, keyword) => {
  client.zincrby(university+'AutoComplete', 0, keyword+'*', (err, reply) => {
    if(err) console.log(err);
    else{
        console.log('saved: ' + keyword+'*');
        for(let index = 1 ; index < keyword.length ; index++){
          const prefix = keyword.substring(0, index-1);
          client.zadd(university+'AutoComplete', 0, prefix, (err, reply) => {
            if(err) console.log(err);
            console.log('saved: ' + prefix);
          });
        }
    }
  });
};

exports.suggestKeyword = (university, prefix) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const prefixLength = prefix.length;
    if(null === prefix || prefixLength === 0) resolve(results);

    const start = redis.zrank(university+'AutoComplete', prefix);
    if(start < 0) resolve(results);

    client.zrevrange(university+'AutoComplete', start, -1, (err, words) => {
      if(err) reject(err);
      if(!words[0]) resolve(results);

      for(let index = 0; index < words.length ; index += 2){
        const value = words[index];
        const minLength = value.length < prefixLength ? value.length : prefixLength;
        if(value.charAt(value.length-1) === '*' && value.indexOf(prefix.substring(0, minLength)) === 0){
          results.push({
            "keyword" : value.replace('*',''),
            "score" : words[index+1]
          });
        }
      }

      resolve(results);
    });
  });
};

exports.getRank = board => {
  return new Promise((resolve, reject) => {
    client.zrevrange(board, 0, 9, (err, reply) => {
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
