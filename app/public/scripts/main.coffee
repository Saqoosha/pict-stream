$ -> new App

base58 = encdec()

class App
    
    constructor: ->
        
        @container = $ '#items'
        @container.masonry itemSelector: '.item', columnWidth: 300, gutterWidth: 10, isFitWidth: true
        
        @min_id = null
        @more = new More
        @more.onclick = => @getHomeTimeline null, @min_id

        $(window).smartresize @onResize
        @onResize()

        $.get '/get_user', (data, textStatus, jqXHR) =>
            if data?.screen_name?
                console.log data
                link = $ '<link>'
                link.attr type: 'text/css', rel: 'stylesheet', href: '/user_style'
                $('head').append link
                $('#login').text 'Logout'
                $('#login').click -> location.href = '/signout'
                $('#user').show()
                $('#user-icon').attr src: data.profile_image_url
                $('#user-name').text data.screen_name
                @getHomeTimeline()
            else
                $('#login').click -> location.href = '/signin'
                @search('pic.twitter.com OR twitpic OR yfrog OR instagr.am OR lockerz OR p.twipple.jp OR flic.kr')
    
    onResize: (e = null) =>
        n = Math.floor(($(window).width() - 300) / (300 + 10)) + 1
        w = (300 + 10) * n - 10 + 'px'
        $('#header-inner').width w
        @more.setWidth w
        $('#footer-inner').width w
        if e is null
            @container.width w

    getHomeTimeline: (since_id = null, max_id = null) =>
        console.log since_id, max_id
        params = count: 200, include_entities: true
        params.since_id = since_id if since_id?
        params.max_id = max_id if max_id?
        $.get '/api/statuses/home_timeline', params, (tweets) =>
            if max_id then tweets.shift()
            console.log tweets
            if tweets.length == 0
                @setNextTimer since_id if since_id?
                @more.hide() if max_id?
                return
            
            @addItems tweets, if since_id? then false else true
            
            if since_id is null then @min_id = tweets[tweets.length - 1].id_str
            if max_id is null
                if since_id is null then @more.show()
                @setNextTimer tweets[0].id_str
            else
                @more.show()
    
    search: (query) =>
        params = q: query, include_entities: true, rpp: 50, result_type: 'recent'
        $.getJSON 'http://search.twitter.com/search.json?callback=?', params, (results) =>
            console.log results
            @addItems results.results
    
    addItems: (tweets, append = true) =>
        items = []
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
                items.push new Cell image_urls, t
        items.reverse() if not append
        for item in items
            item.loaded = => @container.masonry 'reload'
            if append
                @container.append item.el
            else
                @container.prepend item.el

    setNextTimer: (since_id, secs = 60) =>
        setTimeout @getHomeTimeline, secs * 1000, since_id
    
    getImageUrl: (url) ->
        image_url = null
        u = url.split '/'
        switch u[2]
            when 'twitpic.com'
                image_url = 'http://twitpic.com/show/full/' + u.pop()
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
            # when 'f.hatena.ne.jp'
            #     id = u.pop()
            #     user = u.pop()
            #     image_url = "http://img.f.hatena.ne.jp/images/fotolife/#{user.charAt(0)}/#{user}/#{id.substr(0,8)}/#{id}.png"
            else
                image_url = url if url.match /\.(png|jpg|jpeg|gif)$/
        return image_url


class Cell
    
    constructor: (urls, tweet) ->
        console.log urls
        h = ''
        h += "<img src='#{url}' width='300'/>" for url in urls
        img = $ h
        img.click (e) => window.open "http://twitter.com/#{screen_name}/status/#{tweet.id_str}"

        loading = $ "<div class='loading'></div>"

        if tweet.user?
            screen_name = tweet.user.screen_name
            profile_image_url = tweet.user.profile_image_url
        else
            screen_name = tweet.from_user
            profile_image_url = tweet.profile_image_url
        
        text = tweet.text
        if tweet.entities?.media?
            for m in tweet.entities.media
                text = text.replace m.url, "<a href='#{m.expanded_url}' target='_blank'>#{m.display_url}</a>"
        if tweet.entities?.urls?
            for u in tweet.entities.urls
                text = text.replace u.url, "<a href='#{u.expanded_url}' target='_blank'>#{u.display_url}</a>"
        if tweet.entities?.user_mentions?
            for u in tweet.entities.user_mentions
                text = text.replace u.screen_name, "<a href='http://twitter.com/#{u.screen_name}' target='_blank'>#{u.screen_name}</a>"
        if tweet.entities?.hashtags?
            for t in tweet.entities.hashtags
                text = text.replace '#' + t.text, "<a href='http://twitter.com/search?q=%23#{t.text}' target='_blank'>\##{t.text}</a>"
                
        date = new Date tweet.created_at

        item = $ """
            <div class='item'>
                <div class='info'>
                    <a href='http://twitter.com/#{screen_name}' target='_blank'><img src='#{profile_image_url}' class='profile-image'></img></a>
                    <div class='text'>
                        <p><a href='http://twitter.com/#{screen_name}' target='_blank' class='screen-name'>#{screen_name}</a> #{text}</p>
                        <span class='date'>#{date.toLocaleString()}</span></div>
                    <div style='clear:both'></div>
                </div>
            </div>
        """
        item.prepend loading

        img.load =>
            loading.remove()
            item.prepend img
            @loaded?()

        @el = item


class More
    
    constructor: ->
        @more = $ '#more'
        @inner = $ '#more-inner'
    
    setWidth: (width) =>
        @more.width width

    on: =>
        @more.css cursor: 'pointer'
        @inner.text 'more'
        @more.on 'click', @_onclick
        
    off: =>
        @more.off 'click', @_onclick
    
    _onclick: (e) =>
        @off()
        @more.css cursor: 'wait'
        @inner.text 'loading...'
        @onclick?()

    show: =>
        @on()
        @more.show()

    hide: =>
        @more.hide()
