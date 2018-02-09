const express = require('express'),
      morgan = require('morgan'),
      compress = require('compression'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      path = require('path');

module.exports = () => {
  const app = express();

  if(process.env.NODE_ENV === 'development') {
      console.log('Development Mode');
      app.use(morgan('dev'));
   } else if (process.env.NODE_ENV === 'production') {
      app.use(compress());
   }

  app.use(bodyParser.urlencoded({
    extended:true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  app.set('views', './app/views');
  app.set('view engine', 'ejs');

  require('../app/routes/users.server.routes.js')(app);
  require('../app/routes/keywords.server.routes.js')(app);
  require('../app/routes/articles.server.routes.js')(app);
  require('../app/routes/firebase.server.routes.js')(app);
  require('./error_handler.js')(app);

  app.use(express.static(path.join(__dirname, 'public')));

  return app;
}
