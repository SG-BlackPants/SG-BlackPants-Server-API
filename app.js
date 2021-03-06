process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const express = require('./config/express_config'),
      mongoose = require('./config/mongoose'),
      elasticsearch = require('./app/apis/elasticsearch'),
      redis = require('./app/apis/redis');

mongoose();
elasticsearch.ping();
redis.isConnected();

const app = express();
app.listen(3000);
module.exports = app;

console.log('Server running at localhost');
