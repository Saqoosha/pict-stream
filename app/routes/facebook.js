var Cookies, querystring, request;

request = require('request');

querystring = require('querystring');

Cookies = require('cookies');

exports.signin = function(options) {
  return function(req, res) {
    return res.redirect("https://www.facebook.com/dialog/oauth?client_id=" + options.client_id + "&redirect_uri=" + options.redirect_uri + "&scope=user_photos,friends_photos,read_stream");
  };
};

exports.signined = function(options) {
  return function(req, res) {
    var q;
    q = querystring.stringify({
      client_id: options.client_id,
      client_secret: options.client_secret,
      redirect_uri: options.redirect_uri,
      code: req.query.code
    });
    return request.post('https://graph.facebook.com/oauth/access_token?', {
      body: q
    }, function(err, res2, body) {
      var fql;
      req.session.facebook = querystring.parse(body);
      fql = "SELECT id, name, url, pic_square FROM profile WHERE id = me()";
      return request.get("https://graph.facebook.com/fql?q=" + (encodeURIComponent(fql)) + "&access_token=" + req.session.facebook.access_token, function(err, res3, body) {
        var data;
        data = JSON.parse(body);
        req.session.facebook.user = data.data[0];
        return res.redirect('/');
      });
    });
  };
};

exports.signout = function(req, res) {
  delete req.session.facebook;
  return res.redirect('/');
};
