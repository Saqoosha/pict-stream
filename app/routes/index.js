var request;

request = require('request');

exports.index = function(req, res) {
  return res.render('index');
};

exports.get_user = function(req, res) {
  var user;
  user = {};
  if (req.session.twitter != null) user.twitter = req.session.twitter;
  if (req.session.facebook != null) user.facebook = req.session.facebook;
  if (req.session.instagram != null) user.instagram = req.session.instagram;
  return res.send(user);
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
    return res.redirect("http://farm" + data.photo.farm + ".staticflickr.com/" + data.photo.server + "/" + data.photo.id + "_" + data.photo.secret + ".jpg");
  });
};

exports.twitter = require('./twitter.js');

exports.facebook = require('./facebook.js');

exports.instagram = require('./instagram.js');
