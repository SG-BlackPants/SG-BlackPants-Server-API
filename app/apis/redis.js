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
  return new Promise((resolve, reject) => {
    keyword = keyword.trim();
    client.zincrby(university+'AutoComplete', 1, keyword+'*', (err, reply) => {
      if(err) console.log(err);
      else{
          console.log('saved: ' + keyword+'*');
          for(let index = 1 ; index < keyword.length ; index++){
            const prefix = keyword.substring(0, index);
            client.zadd(university+'AutoComplete', 0, prefix, (err, reply) => {
              if(err) reject(err);
              console.log('saved: ' + prefix);

              if(index === keyword.length-1)
                resolve(true);
            });
          }
      }
    });
  });
};

exports.suggestKeyword = (university, prefix) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const prefixLength = prefix.length;
    if(null === prefix || prefixLength === 0) resolve(results);

    client.zrank(university+'AutoComplete', prefix, (err, start) => {
      if(!start) return resolve(false);

       client.zrange(university+'AutoComplete', start, -1, 'WITHSCORES', (err, words) => {
        if(err) reject(err);
        if(!words) return resolve(false);

        for(let index = 0; index < words.length ; index += 2){
          const value = words[index];
          const minLength = value.length < prefixLength ? value.length : prefixLength;
          if(value.charAt(value.length-1) === '*' && value.indexOf(prefix.substring(0, minLength)) === 0){
            results.push(value.replace('*',''));
          }
          if(index === words.length-1) resolve(results);
        }
      });
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
