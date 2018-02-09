const config = require("../../config/config"),
      redisClient = require('redis').createClient(config.host);

module.exports = prefix => {
  const Autocomplete = {};

  Autocomplete.prefix = prefix;
  Autocomplete.terminal = "+";

  Autocomplete.add = (word, next) => {
    function add(letters, key, last, x) {
      const letter = last ? Autocomplete.terminal : letters[x];
      const score = last ? 0 : letter.charCodeAt(0);
      redisClient.zadd(key, score, letter, reply => {
        x++;
        if (x < letters.length) {
          add(letters, key+letter, false, x);
        } else {
          if (x == letters.length) {
            add(letters, key+letter, true, x);
          } else {
            if (typeof(next) == "function") next();
          }
        }
      });
    };
    const letters = word.split("");
    const key = Autocomplete.prefix+letters[0];
    add(letters, key, false, 1);
  }

  Autocomplete.suggest = (query, limit, next) => {
    let more = 1;
    const suggestions = [];
    function suggest(query) {
      const key = Autocomplete.prefix+query;
      redisClient.zrange(key, 0, -1, (err, reply) => {
        more--;
        reply.forEach(c => {
          if (c == Autocomplete.terminal) {
            suggestions.push(query);
          } else {
            if (suggestions.length < limit) {
              more++;
              suggest(query + c);
            }
          }
        })
        if (more <= 0) next(suggestions);
      })
    };
    suggest(query);
  }

  return Autocomplete;
};
