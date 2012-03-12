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
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
  app.set('twitter', {
    consumer_key: 'kDaoenTjmz0lXMsQ2J1RfA',
    consumer_secret: 'AKbuxc4MAuaVsoXaXiCLOQAQ1H4VLtW0jPNY4oNyVzc'
  });
  app.set('facebook', {
    client_id: '129594067167016',
    client_secret: 'af2e2ae847a3b6868ae0901b40428231',
    redirect_uri: 'http://localhost:8080/facebook/signined'
  });
  return app.set('instagram', {
    client_id: '6db25edc78e24893b4c0e6969873d22a',
    client_secret: 'cac0bfa38dfa478db4970774eec3daf1',
    redirect_uri: 'http://localhost:8080/instagram/signined'
  });
});

app.configure('production', function() {
  app.use(express.errorHandler());
  app.set('twitter', {
    consumer_key: 'kDaoenTjmz0lXMsQ2J1RfA',
    consumer_secret: 'AKbuxc4MAuaVsoXaXiCLOQAQ1H4VLtW0jPNY4oNyVzc'
  });
  app.set('facebook', {
    client_id: '123341804461323',
    client_secret: 'f174f987d2c33ed3908c0214f6469835',
    redirect_uri: 'http://pictstream-saqoosha.dotcloud.com/facebook/signined'
  });
  return app.set('instagram', {
    client_id: '3c292040fc7b42a58f4f05a49e37a24d',
    client_secret: '00d63eef7a9140a4a83a9767bc196034',
    redirect_uri: 'http://pictstream-saqoosha.dotcloud.com/instagram/signined'
  });
});

app.get('/', routes.index);

app.get('/get_user', routes.get_user);

app.get('/twitter/signin', routes.twitter.signin(app.settings.twitter));

app.get('/twitter/signined', routes.twitter.signined(app.settings.twitter));

app.get('/twitter/signout', routes.twitter.signout);

app.get(/^\/twitter\/api\/(.+)/, routes.twitter.api);

app.get('/user_style', routes.twitter.user_style);

app.get('/facebook/signin', routes.facebook.signin(app.settings.facebook));

app.get('/facebook/signined', routes.facebook.signined(app.settings.facebook));

app.get('/facebook/signout', routes.facebook.signout);

app.get('/instagram/signin', routes.instagram.signin(app.settings.instagram));

app.get('/instagram/signined', routes.instagram.signined(app.settings.instagram));

app.get('/instagram/signout', routes.instagram.signout);

app.get('/picplz/:id', routes.picplz);

app.get('/flickr/:id', routes.flickr);

app.listen(8080);

console.log("Express server listening on port " + (app.address().port) + " in " + app.settings.env + " mode");
