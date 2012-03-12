var Cookies, Twitter, request, twitter;

Twitter = require('ntwitter');

Cookies = require('cookies');

request = require('request');

twitter = function(options) {
  if (options == null) options = {};
  options.cookie_options = {
    expires: new Date(Date.now() + 3600 * 24 * 365 * 1000)
  };
  return new Twitter(options);
};

exports.signin = function(options) {
  return twitter(options).login('/twitter/signin', '/twitter/signined');
};

exports.signined = function(options) {
  return function(req, res) {
    var cookie, tw;
    cookie = twitter(options).cookie(req);
    if ((cookie != null ? cookie.access_token_key : void 0) != null) {
      options.access_token_key = cookie.access_token_key;
      options.access_token_secret = cookie.access_token_secret;
      tw = twitter(options);
      return tw.get("/account/verify_credentials.json", function(error, data) {
        req.session._twitter = options;
        req.session.twitter = {
          user: data
        };
        return res.redirect('/');
      });
    } else {
      return res.redirect('/');
    }
  };
};

exports.signout = function(req, res) {
  delete req.session.twitter;
  delete req.session._twitter;
  res.clearCookie('twauth');
  return res.redirect('/');
};

exports.search = function(req, res) {
  var tw;
  tw = twitter(req.session._twitter);
  return tw.search(req.params.query, function(error, data) {
    return res.send(data);
  });
};

exports.api = function(req, res) {
  var tw;
  tw = twitter(req.session._twitter);
  return tw.get("/" + req.params[0] + ".json", req.query, function(error, data) {
    return res.send(data);
  });
};

exports.user_style = function(req, res) {
  var user, _ref;
  if (((_ref = req.session.twitter) != null ? _ref.user : void 0) != null) {
    user = req.session.twitter.user;
    res.contentType('text/css');
    return res.send("body {\n    background-color: \#" + user.profile_background_color + ";\n    background-image: url(" + user.profile_background_image_url + ");\n    background-attachment: fixed;\n    background-position: 0 40px;\n    background-repeat: " + (user.profile_background_tile ? 'repeat' : 'no-repeat') + ";\n    color: \#" + user.profile_text_color + ";\n}\na {\n    color: \#" + user.profile_link_color + ";\n}");
  } else {
    return res.end();
  }
};
