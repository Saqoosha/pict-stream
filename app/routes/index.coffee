request = require 'request'


exports.index = (req, res) ->
    res.render 'index'


exports.get_user = (req, res) ->
    # console.log req.session
    user = {}
    user.twitter = req.session.twitter if req.session.twitter?
    user.facebook = req.session.facebook if req.session.facebook?
    user.instagram = req.session.instagram if req.session.instagram?
    res.send user


exports.picplz = (req, res) ->
    request.get "http://api.picplz.com/api/v2/pic.json?shorturl_id=#{req.params.id}", (err, res2, body) ->
        data = JSON.parse body
        res.redirect data.value.pics[0].pic_files['640r'].img_url


exports.flickr = (req, res) ->
    request.get "http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=e4a366a322cd11902c7a6d71581dd6e5&photo_id=#{req.params.id}&format=json&nojsoncallback=1", (err, res2, body) ->
            data = JSON.parse body
            res.redirect "http://farm#{data.photo.farm}.staticflickr.com/#{data.photo.server}/#{data.photo.id}_#{data.photo.secret}.jpg"


exports.twitter = require './twitter.js'
exports.facebook = require './facebook.js'
exports.instagram = require './instagram.js'
