var app, express, routes;

express = require('express');

routes = require('./routes');

app = module.exports = express.createServer();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({
    secret: 'urahtxtanoeuhrcaceu'
  }));
  app.use(app.router);
  return app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  return app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  return app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/signin', routes.signin);

app.get('/signout', routes.signout);

app.get('/get_user', routes.get_user);

app.get('/user_style', routes.user_style);

app.get(/^\/api\/(.+)/, routes.twitter);

app.get('/picplz/:id', routes.picplz);

app.get('/flickr/:id', routes.flickr);

app.listen(8080);

console.log("Express server listening on port " + (app.address().port) + " in " + app.settings.env + " mode");
