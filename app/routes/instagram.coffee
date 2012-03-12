request = require 'request'
querystring = require 'querystring'
Cookies = require 'cookies'


exports.signin = (options) ->
    (req, res) ->
        res.redirect "https://api.instagram.com/oauth/authorize/?client_id=#{options.client_id}&redirect_uri=#{options.redirect_uri}&response_type=code"


exports.signined = (options) ->
    (req, res) ->
        q = querystring.stringify
            client_id: options.client_id
            client_secret: options.client_secret
            grant_type: 'authorization_code'
            redirect_uri: options.redirect_uri
            code: req.query.code
        request.post 'https://api.instagram.com/oauth/access_token', body: q, (err, res2, body) ->
            data = JSON.parse body
            if data.access_token?
                req.session.instagram = data
            res.redirect '/'


exports.signout = (req, res) ->
    delete req.session.instagram
    res.redirect '/'


