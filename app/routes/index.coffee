twitter = new (require 'ntwitter') consumer_key: 'kDaoenTjmz0lXMsQ2J1RfA', consumer_secret: 'AKbuxc4MAuaVsoXaXiCLOQAQ1H4VLtW0jPNY4oNyVzc'
request = require 'request'

exports.index = (req, res) ->
    res.render 'index'

exports.signin = (req, res) ->
    (twitter.login '/signin') req, res, ->
        console.log 'hoge'

exports.signout = (req, res) ->
    res.clearCookie 'twauth'
    res.redirect '/'

exports.get_user = (req, res) ->
    cookie = twitter.cookie req
    if cookie?.access_token_key?
        twitter.options.access_token_key = cookie.access_token_key
        twitter.options.access_token_secret = cookie.access_token_secret
        twitter.get "/account/verify_credentials.json", (error, data) ->
            req.session.user = data
            res.send data
    else
        res.send {}

exports.user_style = (req, res) ->
    if req.session.user?
        user = req.session.user
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

exports.search = (req, res) ->
    twitter.search req.params.query, (error, data) ->
        res.send data

exports.twitter = (req, res) ->
    console.log req.params[0], req.query
    cookie = twitter.cookie req
    twitter.options.access_token_key = cookie.access_token_key
    twitter.options.access_token_secret = cookie.access_token_secret
    twitter.get "/#{req.params[0]}.json", req.query, (error, data) ->
        res.send data

exports.picplz = (req, res) ->
    request.get "http://api.picplz.com/api/v2/pic.json?shorturl_id=#{req.params.id}", (err, res2, body) ->
        data = JSON.parse body
        res.redirect data.value.pics[0].pic_files['640r'].img_url

exports.flickr = (req, res) ->
    request.get "http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=e4a366a322cd11902c7a6d71581dd6e5&photo_id=#{req.params.id}&format=json&nojsoncallback=1", (err, res2, body) ->
            data = JSON.parse body
            console.log data
            res.redirect "http://farm#{data.photo.farm}.staticflickr.com/#{data.photo.server}/#{data.photo.id}_#{data.photo.secret}.jpg"
