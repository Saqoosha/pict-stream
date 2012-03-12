Twitter = require 'ntwitter'
Cookies = require 'cookies'
request = require 'request'


twitter = (options = {}) ->
    # options.consumer_key = 'kDaoenTjmz0lXMsQ2J1RfA'
    # options.consumer_secret = 'AKbuxc4MAuaVsoXaXiCLOQAQ1H4VLtW0jPNY4oNyVzc'
    options.cookie_options = expires: new Date(Date.now() + 3600 * 24 * 365 * 1000)
    new Twitter options


exports.signin = (options) ->
    twitter(options).login '/twitter/signin', '/twitter/signined'


exports.signined = (options) ->
    (req, res) ->
        cookie = twitter(options).cookie req
        if cookie?.access_token_key?
            options.access_token_key = cookie.access_token_key
            options.access_token_secret = cookie.access_token_secret
            tw = twitter options
            tw.get "/account/verify_credentials.json", (error, data) ->
                req.session._twitter = options
                req.session.twitter = user: data
                res.redirect '/'
        else
            res.redirect '/'


exports.signout = (req, res) ->
    delete req.session.twitter
    delete req.session._twitter
    res.clearCookie 'twauth'
    res.redirect '/'


exports.search = (req, res) ->
    tw = twitter req.session._twitter
    tw.search req.params.query, (error, data) -> res.send data


exports.api = (req, res) ->
    tw = twitter req.session._twitter
    tw.get "/#{req.params[0]}.json", req.query, (error, data) -> res.send data


exports.user_style = (req, res) ->
    if req.session.twitter?.user?
        user = req.session.twitter.user
        res.contentType 'text/css'
        res.send """
        body {
            background-color: \##{user.profile_background_color};
            background-image: url(#{user.profile_background_image_url});
            background-attachment: fixed;
            background-position: 0 40px;
            background-repeat: #{if user.profile_background_tile then 'repeat' else 'no-repeat'};
            color: \##{user.profile_text_color};
        }
        a {
            color: \##{user.profile_link_color};
        }
        """
    else
        res.end()


