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

//TEST필요
exports.addKeyword = (university, keyword) => {
  return new Promise((resolve, reject) => {
    keyword = keyword.trim();
    const key = university+':autocomplete:'+keyword.charAt(0)+':'+keyword.length;
    client.zadd(key, 0, keyword+'*', (err, reply) => {
      if(err) console.log(err);
      else{
          for(let index = 1 ; index < keyword.length ; index++){
            const prefix = keyword.substring(0, index);
            client.zadd(key, 0, prefix, (err, reply) => {
              if(err) reject(err);

              if(index === keyword.length-1)
                resolve(true);
            });
          }
      }
    });
  });
};

//TEST필요
exports.suggestKeyword = (university, prefix) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const prefixLength = prefix.length;
    let jobCount = 0;

    if(prefix === null || prefixLength === 0) return resolve(results);

    for(let len = prefixLength ; len <= 30 ; len++){
      const key = university+':autocomplete:'+prefix.charAt(0)+':'+len;
      client.zrank(key, prefix, (err, start) => {
        if(start === null) {
          jobCount++;
          if(jobCount === 31-prefixLength) return resolve(results);
          return;
        }
         client.zrange(key, start, -1, (err, words) => {
          if(err) {
            jobCount++;
            return reject(err);
          }
          if(words === null) {
            jobCount++;
            if(jobCount === 31-prefixLength) return resolve(results);
            return;
          }

          for(let index = 0; index < words.length ; index++){
            const value = words[index];
            const minLength = value.length < prefixLength ? value.length : prefixLength;
            if(value.charAt(value.length-1) === '*' && value.indexOf(prefix.substring(0, minLength)) === 0){
              results.push(value.replace('*',''));
            }
            if(index === words.length-1) jobCount++;
            if(jobCount === 31-prefixLength) return resolve(results);
          }
        });
      });
    }
  });
};

exports.list = board => {
  return new Promise((resolve, reject) => {
    client.zrange(board, 0, -1, "WITHSCORES", (err, reply) => {
      if(err) return reject(err);
      return resolve(reply);
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

exports.deleteAll = () => {
  return new Promise((resolve, reject) => {
    client.flushdb((err, succeeded) => {
      if(err) reject(err);
      resolve(succeeded);
    });
  });
};
