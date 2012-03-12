var Cookies, querystring, request;

request = require('request');

querystring = require('querystring');

Cookies = require('cookies');

exports.signin = function(options) {
  return function(req, res) {
    return res.redirect("https://api.instagram.com/oauth/authorize/?client_id=" + options.client_id + "&redirect_uri=" + options.redirect_uri + "&response_type=code");
  };
};

exports.signined = function(options) {
  return function(req, res) {
    var q;
    q = querystring.stringify({
      client_id: options.client_id,
      client_secret: options.client_secret,
      grant_type: 'authorization_code',
      redirect_uri: options.redirect_uri,
      code: req.query.code
    });
    return request.post('https://api.instagram.com/oauth/access_token', {
      body: q
    }, function(err, res2, body) {
      var data;
      data = JSON.parse(body);
      if (data.access_token != null) req.session.instagram = data;
      return res.redirect('/');
    });
  };
};

exports.signout = function(req, res) {
  delete req.session.instagram;
  return res.redirect('/');
};
