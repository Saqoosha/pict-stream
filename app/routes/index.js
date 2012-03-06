var request, twitter;

twitter = new (require('ntwitter'))({
  consumer_key: 'kDaoenTjmz0lXMsQ2J1RfA',
  consumer_secret: 'AKbuxc4MAuaVsoXaXiCLOQAQ1H4VLtW0jPNY4oNyVzc'
});

request = require('request');

exports.index = function(req, res) {
  return res.render('index');
};

exports.signin = function(req, res) {
  return (twitter.login('/signin'))(req, res, function() {
    return console.log('hoge');
  });
};

exports.signout = function(req, res) {
  res.clearCookie('twauth');
  return res.redirect('/');
};

exports.get_user = function(req, res) {
  var cookie;
  cookie = twitter.cookie(req);
  if ((cookie != null ? cookie.access_token_key : void 0) != null) {
    twitter.options.access_token_key = cookie.access_token_key;
    twitter.options.access_token_secret = cookie.access_token_secret;
    return twitter.get("/account/verify_credentials.json", function(error, data) {
      req.session.user = data;
      return res.send(data);
    });
  } else {
    return res.send({});
  }
};

exports.user_style = function(req, res) {
  var user;
  if (req.session.user != null) {
    user = req.session.user;
    res.contentType('text/css');
    return res.send("body {\n    background-color: \#" + user.profile_background_color + ";\n    background-image: url(" + user.profile_background_image_url + ");\n    background-attachment: fixed;\n    background-position: 0 40px;\n    background-repeat: " + (user.profile_background_tile ? 'repeat' : 'no-repeat') + ";\n    color: \#" + user.profile_text_color + ";\n}\na {\n    color: \#" + user.profile_link_color + ";\n}");
  } else {
    return res.end();
  }
};

exports.search = function(req, res) {
  return twitter.search(req.params.query, function(error, data) {
    return res.send(data);
  });
};

exports.twitter = function(req, res) {
  var cookie;
  console.log(req.params[0], req.query);
  cookie = twitter.cookie(req);
  twitter.options.access_token_key = cookie.access_token_key;
  twitter.options.access_token_secret = cookie.access_token_secret;
  return twitter.get("/" + req.params[0] + ".json", req.query, function(error, data) {
    return res.send(data);
  });
};

exports.picplz = function(req, res) {
  return request.get("http://api.picplz.com/api/v2/pic.json?shorturl_id=" + req.params.id, function(err, res2, body) {
    var data;
    data = JSON.parse(body);
    return res.redirect(data.value.pics[0].pic_files['640r'].img_url);
  });
};

exports.flickr = function(req, res) {
  return request.get("http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=e4a366a322cd11902c7a6d71581dd6e5&photo_id=" + req.params.id + "&format=json&nojsoncallback=1", function(err, res2, body) {
    var data;
    data = JSON.parse(body);
    console.log(data);
    return res.redirect("http://farm" + data.photo.farm + ".staticflickr.com/" + data.photo.server + "/" + data.photo.id + "_" + data.photo.secret + ".jpg");
  });
};
