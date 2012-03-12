$ -> new App

base58 = encdec()

class App
    
    constructor: ->
        
        @container = new Container
        @signinbox = new SignInBox
        @more = new More
        # @more.onclick = => @getHomeTimeline null, @min_id

        $(window).smartresize @onResize
        @onResize()
        
        $.get '/get_user', (data, textStatus, jqXHR) =>
            console.log data
            if data.instagram?
                @instagram = new Instagram @container, data.instagram
            if data.facebook?
                @facebook = new Facebook @container, data.facebook
            if data.twitter?
                @twitter = new Twitter @container, data.twitter
                link = $ '<link>'
                link.attr type: 'text/css', rel: 'stylesheet', href: '/user_style'
                $('head').append link
            @signinbox.setup data
            if not data.instagram? and not data.facebook? and not data.twitter?
                @twitter = new Twitter @container
                @twitter.search 'pic.twitter.com OR instagr.am OR twitpic.com OR yfrog.com OR p.twipple.jp OR movapic.com OR flic.kr'
    
    onResize: (e = null) =>
        win = $(window).width()
        n = Math.floor((win - 300 - 40) / (300 + 10)) + 1
        w = (300 + 10) * n - 10
        $('#signin-box').css right: (win - w) / 2 - 10 + 'px'
        w += 'px'
        $('#header-inner').width w
        @more.el.width w
        $('#footer-inner').width w
        if e is null
            @container.el.width w


class SignInBox
    
    constructor: ->
        @timer = 0
        @signin = $ '#signin'
        @signin.mouseenter @_show
        @signin.mouseleave @_hide
        @signbox = $ '#signin-box'
        @signbox.mouseenter @_show
        @signbox.mouseleave @_hide
        @user = $ '#user'
        @user.mouseenter @_show
        @user.mouseleave @_hide
    
    setup: (data) ->
        if data.instagram?
            screen_name = data.instagram.user.username
            profile_image_url = data.instagram.user.profile_picture
            $('#instagram-signin').html "<img src='/images/switch-on.png'/> <img src='/images/instagram.png'/> Instagram"
            $('#instagram-signin').click -> location.href = '/instagram/signout'
        else
            $('#instagram-signin').html "<img src='/images/switch-off.png'/> <img src='/images/instagram.png'/> Instagram"
            $('#instagram-signin').click -> location.href = '/instagram/signin'
        if data.facebook?
            screen_name = data.facebook.user.name
            profile_image_url = data.facebook.user.pic_square
            $('#facebook-signin').html "<img src='/images/switch-on.png'/> <img src='/images/facebook.png'/> Facebook"
            $('#facebook-signin').click -> location.href = '/facebook/signout'
        else
            $('#facebook-signin').html "<img src='/images/switch-off.png'/> <img src='/images/facebook.png'/> Facebook"
            $('#facebook-signin').click -> location.href = '/facebook/signin'
        if data.twitter?
            screen_name = data.twitter.user.screen_name
            profile_image_url = data.twitter.user.profile_image_url
            $('#twitter-signin').html "<img src='/images/switch-on.png'/> <img src='/images/twitter-2.png'/> Twitter"
            $('#twitter-signin').click -> location.href = '/twitter/signout'
        else
            $('#twitter-signin').html "<img src='/images/switch-off.png'/> <img src='/images/twitter-2.png'/> Twitter"
            $('#twitter-signin').click -> location.href = '/twitter/signin'
        if screen_name?
            @signin.hide()
            @user.show()
            $('#user-icon').attr src: profile_image_url
            $('#user-name').text screen_name
        
    _show: =>
        clearTimeout @timer
        @signbox.show()
        
    _hide: =>
        @timer = setTimeout (=> @signbox.fadeOut 300), 300

        

class Twitter
    
    constructor: (@container, @info = null) ->
        @min_id = null
        @getHomeTimeline() if @info?

    search: (query) =>
        params = q: query, include_entities: true, rpp: 30, result_type: 'recent'
        $.getJSON 'http://search.twitter.com/search.json?callback=?', params, (results) =>
            console.log results
            @addItems results.results

    getHomeTimeline: (since_id = null, max_id = null) =>
        console.log since_id, max_id
        params = count: 200, include_entities: true
        params.since_id = since_id if since_id?
        params.max_id = max_id if max_id?
        $.get '/twitter/api/statuses/home_timeline', params, (tweets) =>
            # console.log tweets
            if max_id and tweets.length then tweets.shift()
            if tweets.length == 0
                @setNextTimer since_id if since_id?
                # @more.hide() if max_id?
                return

            @addItems tweets, if since_id? then false else true
            
            if since_id is null then @min_id = tweets[tweets.length - 1].id_str
            if max_id is null
                # if since_id is null then @more.show()
                @setNextTimer tweets[0].id_str
            else
                # @more.show()

    addItems: (tweets) =>
        for t in tweets
            image_urls = []
            if t.retweeted_status? then t = t.retweeted_status
            if t.entities?.media?
                for m in t.entities?.media
                    image_urls.push m.media_url
                    t.text = t.text.replace m.url, ''
            if t.entities?.urls?.length > 0
                for u in t.entities.urls
                    if not u.expanded_url? then continue
                    image_url = @getImageUrl u.expanded_url
                    image_urls.push image_url if image_url?
                    t.text = t.text.replace u.url, ''
            if image_urls.length > 0
                @container.addItem 'twitter', image_urls, t

    setNextTimer: (since_id, secs = 60) =>
        setTimeout @getHomeTimeline, secs * 1000, since_id

    getImageUrl: (url) ->
        image_url = null
        u = url.split '/'
        switch u[2]
            when 'twitpic.com'
                image_url = 'http://twitpic.com/show/large/' + u.pop()
            when 'instagr.am'
                image_url = url + 'media/?size=l'
            when 'lockerz.com'
                image_url = "http://api.plixi.com/api/tpapi.svc/imagefromurl?url=#{url}&size=medium"
            when 'yfrog.com'
                image_url = url + ':iphone'
            when 'p.twipple.jp'
                image_url = "http://p.twipple.jp/show/large/" + u.pop()
            when 'miil.me'
                image_url = url + '.jpeg'
            when 'picplz.com'
                image_url = '/picplz/' + u.pop()
            when 'moby.to'
                image_url = url + ':medium'
            when 'img.ly'
                image_url = 'http://img.ly/show/medium/' + u.pop()
            when 'photozou.jp'
                image_url = 'http://photozou.jp/p/img/' + u.pop()
            when 'mypict.me'
                image_url = 'http://mypict.me/getthumb.php?size=620&id=' + u.pop()
            when 'flic.kr'
                image_url = '/flickr/' + base58.decode(u.pop())
            when 'movapic.com'
                image_url = "http://image.movapic.com/pic/m_#{u.pop()}.jpeg"
            when '4u.cotto.jp'
                image_url = "https://cottoapi.appspot.com/api/image/content/entry/#{u.pop()}_entry.jpg"
            when 'pk.gd'
                image_url = "http://img.pikchur.com/pic_#{u.pop()}_m.jpg"
            # when 'f.hatena.ne.jp'
            #     id = u.pop()
            #     user = u.pop()
            #     image_url = "http://img.f.hatena.ne.jp/images/fotolife/#{user.charAt(0)}/#{user}/#{id.substr(0,8)}/#{id}.png"
            else
                image_url = url if url.match /\.(png|jpg|jpeg|gif)$/i
        return image_url


class Facebook

    constructor: (@container, @info) ->
        @min_time = null
        @getStream()
    
    getStream: (min_time = null) =>
        fql = "SELECT created_time, actor_id, message, attachment, permalink FROM stream WHERE filter_key in (SELECT filter_key FROM stream_filter WHERE uid=me() AND type='newsfeed') AND type = 247 AND is_hidden = 0"
        if min_time? then fql += " AND created_time > #{min_time}"
        $.getJSON "https://graph.facebook.com/fql?q=#{encodeURIComponent(fql)}&access_token=#{@info.access_token}&callback=?", (result) =>
            console.log result
            uids = []
            pids = []
            for item in result.data
                uids.push item.actor_id
                pids.push media.photo.pid for media in item.attachment.media
            if pids.length is 0
                @setNextTimer()
                return
            pids = '"' + pids.join('", "') + '"'
            fql = JSON.stringify
                users: "SELECT id, name, pic_square, url FROM profile WHERE id in (#{uids.join ','})"
                photos: "SELECT pid, src_big FROM photo WHERE pid in (#{pids})"
            $.getJSON "https://graph.facebook.com/fql?q=#{encodeURIComponent(fql)}&access_token=#{@info.access_token}&callback=?", (result2) =>
                user = {}
                src = {}
                for data in result2.data
                    switch data.name
                        when 'users'
                            user[u.id] = u for u in data.fql_result_set
                        when 'photos'
                            src[p.pid] = p.src_big for p in data.fql_result_set
                for item in result.data
                    item.user = user[item.actor_id]
                    urls = []
                    urls.push src[media.photo.pid] for media in item.attachment.media
                    @container.addItem 'facebook', urls, item
                @min_time = result.data[0].created_time
                @setNextTimer()
    
    setNextTimer: (secs = 60) =>
        setTimeout @getStream, secs * 1000, @min_time


class Instagram
    
    constructor: (@container, @info) ->
        @min_id = ''
        @getFeed()
    
    getFeed: =>
        $.getJSON "https://api.instagram.com/v1/users/self/feed?access_token=#{@info.access_token}&min_id=#{@min_id}&count=30&callback=?", (result) =>
            for item in result.data
                @container.addItem 'instagram', [item.images.low_resolution.url], item
            if result.data.length
                @min_id = result.data[0].id
            setTimeout @getFeed, 60 * 1000


class Container
    
    constructor: ->
        @el = $ '#items'
        @el.masonry itemSelector: '.item', columnWidth: 300, gutterWidth: 10, isFitWidth: true
        @queue = []
        @all = []
        setInterval @_append, 2000
    
    addItem: (type, urls, tweet) =>
        item = new Cell type, urls, tweet
        item.loaded = =>
            @queue.push item
    
    _append: =>
        if @queue.length
            attr =
                position: 'absolute'
                left: ($('#items').width() - 300) / 2 + 'px'
                top: $(window).height() + $(window).scrollTop() + 'px'
            for item in @queue
                index = 0
                n = @all.length
                # searching linearly insertion point
                # TODO: should be used binary search for better performance...
                while index < n
                    if @all[index].time <= item.time
                        item.el.css attr
                        @all[index].el.before item.el
                        @all.splice index, 0, item
                        break
                    index++
                if index is n
                    item.el.css attr
                    @el.append item.el
                    @all.push item
            @el.masonry 'reload'
            @queue = []


class Cell
    
    constructor: (@type, urls, data) ->
        # console.log urls
        switch @type
            when 'twitter'
                h = ''
                h += "<img src='#{url}' width='300'/>" for url in urls
                img = $ h
                # img.click (e) => window.open "http://twitter.com/#{screen_name}/status/#{data.id_str}"

                if data.user?
                    screen_name = data.user.screen_name
                    profile_image_url = data.user.profile_image_url
                else
                    screen_name = data.from_user
                    profile_image_url = data.profile_image_url
                profile_url = 'http://twitter.com/' + screen_name
        
                text = data.text
                if data.entities?.media?
                    for m in data.entities.media
                        text = text.replace m.url, "<a href='#{m.expanded_url}' target='_blank'>#{m.display_url}</a>"
                if data.entities?.urls?
                    for u in data.entities.urls
                        text = text.replace u.url, "<a href='#{u.expanded_url}' target='_blank'>#{u.display_url}</a>"
                if data.entities?.user_mentions?
                    for u in data.entities.user_mentions
                        text = text.replace u.screen_name, "<a href='http://twitter.com/#{u.screen_name}' target='_blank'>#{u.screen_name}</a>"
                if data.entities?.hashtags?
                    for t in data.entities.hashtags
                        text = text.replace '#' + t.text, "<a href='http://twitter.com/search?q=%23#{t.text}' target='_blank'>\##{t.text}</a>"
                
                date = new Date data.created_at
                @time = date.getTime()
            
            when 'facebook'
                h = ''
                h += "<img src='#{url}' width='300'/>" for url in urls
                img = $ h
                
                screen_name = data.user.name
                profile_image_url = data.user.pic_square
                profile_url = data.user.url
                text = data.message
                date = new Date data.created_time * 1000
                @time = date.getTime()

            when 'instagram'
                h = ''
                h += "<img src='#{url}' width='300'/>" for url in urls
                img = $ h
                
                screen_name = data.user.username
                profile_image_url = data.user.profile_picture
                profile_url = 'javascript:;'
                if data.caption?.text? then text = data.caption?.text else text = ''
                date = new Date data.created_time * 1000
                @time = date.getTime()

        item = $ """
            <div class='item item-#{@type}'>
                <div class='info'>
                    <a href='#{profile_url}' target='_blank'><img src='#{profile_image_url}' class='profile-image'></img></a>
                    <div class='text'>
                        <p><a href='#{profile_url}' target='_blank' class='screen-name'>#{screen_name}</a> #{text}</p>
                        <span class='date'>#{date.toLocaleString()}</span></div>
                    <div style='clear:both'></div>
                </div>
            </div>
        """
        item.prepend img
        
        n = urls.length
        img.load =>
            if --n is 0 then @loaded?()

        @el = item


class More
    
    constructor: ->
        @el = $ '#more'
        @inner = $ '#more-inner'

    on: =>
        @el.css cursor: 'pointer'
        @inner.text 'more'
        @el.on 'click', @_onclick
        
    off: =>
        @el.off 'click', @_onclick
    
    _onclick: (e) =>
        @off()
        @el.css cursor: 'wait'
        @inner.text 'loading...'
        @onclick?()

    show: =>
        @on()
        @el.show()

    hide: =>
        @el.hide()


