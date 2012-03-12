request = require 'request'
querystring = require 'querystring'
Cookies = require 'cookies'


exports.signin = (options) ->
    (req, res) ->
        res.redirect "https://www.facebook.com/dialog/oauth?client_id=#{options.client_id}&redirect_uri=#{options.redirect_uri}&scope=user_photos,friends_photos,read_stream"


exports.signined = (options) ->
    (req, res) ->
        q = querystring.stringify
            client_id: options.client_id
            client_secret: options.client_secret
            redirect_uri: options.redirect_uri
            code: req.query.code
        request.post 'https://graph.facebook.com/oauth/access_token?', body: q, (err, res2, body) ->
            req.session.facebook = querystring.parse body
            fql = "SELECT id, name, url, pic_square FROM profile WHERE id = me()"
            request.get "https://graph.facebook.com/fql?q=#{encodeURIComponent(fql)}&access_token=#{req.session.facebook.access_token}", (err, res3, body) ->
                data = JSON.parse body
                req.session.facebook.user = data.data[0]
                res.redirect '/'


exports.signout = (req, res) ->
    delete req.session.facebook
    res.redirect '/'


