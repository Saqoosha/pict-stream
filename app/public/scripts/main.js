var App, Cell, More, base58,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$(function() {
  return new App;
});

base58 = encdec();

App = (function() {

  function App() {
    this.setNextTimer = __bind(this.setNextTimer, this);
    this.addItems = __bind(this.addItems, this);
    this.search = __bind(this.search, this);
    this.getHomeTimeline = __bind(this.getHomeTimeline, this);
    this.onResize = __bind(this.onResize, this);
    var _this = this;
    this.container = $('#items');
    this.container.masonry({
      itemSelector: '.item',
      columnWidth: 300,
      gutterWidth: 10,
      isFitWidth: true
    });
    this.min_id = null;
    this.more = new More;
    this.more.onclick = function() {
      return _this.getHomeTimeline(null, _this.min_id);
    };
    $(window).smartresize(this.onResize);
    this.onResize();
    $.get('/get_user', function(data, textStatus, jqXHR) {
      var link;
      if ((data != null ? data.screen_name : void 0) != null) {
        console.log(data);
        link = $('<link>');
        link.attr({
          type: 'text/css',
          rel: 'stylesheet',
          href: '/user_style'
        });
        $('head').append(link);
        $('#login').text('Logout');
        $('#login').click(function() {
          return location.href = '/signout';
        });
        $('#user').show();
        $('#user-icon').attr({
          src: data.profile_image_url
        });
        $('#user-name').text(data.screen_name);
        return _this.getHomeTimeline();
      } else {
        $('#login').click(function() {
          return location.href = '/signin';
        });
        return _this.search('pic.twitter.com OR twitpic OR yfrog OR instagr.am OR lockerz OR p.twipple.jp OR flic.kr');
      }
    });
  }

  App.prototype.onResize = function(e) {
    var n, w;
    if (e == null) e = null;
    n = Math.floor(($(window).width() - 300) / (300 + 10)) + 1;
    w = (300 + 10) * n - 10 + 'px';
    $('#header-inner').width(w);
    this.more.setWidth(w);
    $('#footer-inner').width(w);
    if (e === null) return this.container.width(w);
  };

  App.prototype.getHomeTimeline = function(since_id, max_id) {
    var params,
      _this = this;
    if (since_id == null) since_id = null;
    if (max_id == null) max_id = null;
    console.log(since_id, max_id);
    params = {
      count: 200,
      include_entities: true
    };
    if (since_id != null) params.since_id = since_id;
    if (max_id != null) params.max_id = max_id;
    return $.get('/api/statuses/home_timeline', params, function(tweets) {
      if (max_id) tweets.shift();
      console.log(tweets);
      if (tweets.length === 0) {
        if (since_id != null) _this.setNextTimer(since_id);
        if (max_id != null) _this.more.hide();
        return;
      }
      _this.addItems(tweets, since_id != null ? false : true);
      if (since_id === null) _this.min_id = tweets[tweets.length - 1].id_str;
      if (max_id === null) {
        if (since_id === null) _this.more.show();
        return _this.setNextTimer(tweets[0].id_str);
      } else {
        return _this.more.show();
      }
    });
  };

  App.prototype.search = function(query) {
    var params,
      _this = this;
    params = {
      q: query,
      include_entities: true,
      rpp: 50,
      result_type: 'recent'
    };
    return $.getJSON('http://search.twitter.com/search.json?callback=?', params, function(results) {
      console.log(results);
      return _this.addItems(results.results);
    });
  };

  App.prototype.addItems = function(tweets, append) {
    var image_url, image_urls, item, items, m, t, u, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _results,
      _this = this;
    if (append == null) append = true;
    items = [];
    for (_i = 0, _len = tweets.length; _i < _len; _i++) {
      t = tweets[_i];
      image_urls = [];
      if (t.retweeted_status != null) t = t.retweeted_status;
      if (((_ref = t.entities) != null ? _ref.media : void 0) != null) {
        _ref3 = (_ref2 = t.entities) != null ? _ref2.media : void 0;
        for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
          m = _ref3[_j];
          image_urls.push(m.media_url);
          t.text = t.text.replace(m.url, '');
        }
      }
      if (((_ref4 = t.entities) != null ? (_ref5 = _ref4.urls) != null ? _ref5.length : void 0 : void 0) > 0) {
        _ref6 = t.entities.urls;
        for (_k = 0, _len3 = _ref6.length; _k < _len3; _k++) {
          u = _ref6[_k];
          if (!(u.expanded_url != null)) continue;
          image_url = this.getImageUrl(u.expanded_url);
          if (image_url != null) image_urls.push(image_url);
          t.text = t.text.replace(u.url, '');
        }
      }
      if (image_urls.length > 0) items.push(new Cell(image_urls, t));
    }
    if (!append) item.reverse();
    _results = [];
    for (_l = 0, _len4 = items.length; _l < _len4; _l++) {
      item = items[_l];
      item.loaded = function() {
        return _this.container.masonry('reload');
      };
      if (append) {
        _results.push(this.container.append(item.el));
      } else {
        _results.push(this.container.prepend(item.el));
      }
    }
    return _results;
  };

  App.prototype.setNextTimer = function(since_id, secs) {
    if (secs == null) secs = 60;
    return setTimeout(this.getHomeTimeline, secs * 1000, since_id);
  };

  App.prototype.getImageUrl = function(url) {
    var image_url, u;
    image_url = null;
    u = url.split('/');
    switch (u[2]) {
      case 'twitpic.com':
        image_url = 'http://twitpic.com/show/full/' + u.pop();
        break;
      case 'instagr.am':
        image_url = url + 'media/?size=l';
        break;
      case 'lockerz.com':
        image_url = "http://api.plixi.com/api/tpapi.svc/imagefromurl?url=" + url + "&size=medium";
        break;
      case 'yfrog.com':
        image_url = url + ':iphone';
        break;
      case 'p.twipple.jp':
        image_url = "http://p.twipple.jp/show/large/" + u.pop();
        break;
      case 'miil.me':
        image_url = url + '.jpeg';
        break;
      case 'picplz.com':
        image_url = '/picplz/' + u.pop();
        break;
      case 'moby.to':
        image_url = url + ':medium';
        break;
      case 'img.ly':
        image_url = 'http://img.ly/show/medium/' + u.pop();
        break;
      case 'photozou.jp':
        image_url = 'http://photozou.jp/p/img/' + u.pop();
        break;
      case 'mypict.me':
        image_url = 'http://mypict.me/getthumb.php?size=620&id=' + u.pop();
        break;
      case 'flic.kr':
        image_url = '/flickr/' + base58.decode(u.pop());
        break;
      case 'movapic.com':
        image_url = "http://image.movapic.com/pic/m_" + (u.pop()) + ".jpeg";
        break;
      default:
        if (url.match(/\.(png|jpg|jpeg|gif)$/)) image_url = url;
    }
    return image_url;
  };

  return App;

})();

Cell = (function() {

  function Cell(urls, tweet) {
    var date, h, img, item, loading, m, profile_image_url, screen_name, t, text, u, url, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8,
      _this = this;
    console.log(urls);
    h = '';
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      h += "<img src='" + url + "' width='300'/>";
    }
    img = $(h);
    img.click(function(e) {
      return window.open("http://twitter.com/" + screen_name + "/status/" + tweet.id_str);
    });
    loading = $("<div class='loading'></div>");
    if (tweet.user != null) {
      screen_name = tweet.user.screen_name;
      profile_image_url = tweet.user.profile_image_url;
    } else {
      screen_name = tweet.from_user;
      profile_image_url = tweet.profile_image_url;
    }
    text = tweet.text;
    if (((_ref = tweet.entities) != null ? _ref.media : void 0) != null) {
      _ref2 = tweet.entities.media;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        m = _ref2[_j];
        text = text.replace(m.url, "<a href='" + m.expanded_url + "' target='_blank'>" + m.display_url + "</a>");
      }
    }
    if (((_ref3 = tweet.entities) != null ? _ref3.urls : void 0) != null) {
      _ref4 = tweet.entities.urls;
      for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
        u = _ref4[_k];
        text = text.replace(u.url, "<a href='" + u.expanded_url + "' target='_blank'>" + u.display_url + "</a>");
      }
    }
    if (((_ref5 = tweet.entities) != null ? _ref5.user_mentions : void 0) != null) {
      _ref6 = tweet.entities.user_mentions;
      for (_l = 0, _len4 = _ref6.length; _l < _len4; _l++) {
        u = _ref6[_l];
        text = text.replace(u.screen_name, "<a href='http://twitter.com/" + u.screen_name + "' target='_blank'>" + u.screen_name + "</a>");
      }
    }
    if (((_ref7 = tweet.entities) != null ? _ref7.hashtags : void 0) != null) {
      _ref8 = tweet.entities.hashtags;
      for (_m = 0, _len5 = _ref8.length; _m < _len5; _m++) {
        t = _ref8[_m];
        text = text.replace('#' + t.text, "<a href='http://twitter.com/search?q=%23" + t.text + "' target='_blank'>\#" + t.text + "</a>");
      }
    }
    date = new Date(tweet.created_at);
    item = $("<div class='item'>\n    <div class='info'>\n        <a href='http://twitter.com/" + screen_name + "' target='_blank'><img src='" + profile_image_url + "' class='profile-image'></img></a>\n        <div class='text'>\n            <p><a href='http://twitter.com/" + screen_name + "' target='_blank' class='screen-name'>" + screen_name + "</a> " + text + "</p>\n            <span class='date'>" + (date.toLocaleString()) + "</span></div>\n        <div style='clear:both'></div>\n    </div>\n</div>");
    item.prepend(loading);
    img.load(function() {
      loading.remove();
      item.prepend(img);
      return typeof _this.loaded === "function" ? _this.loaded() : void 0;
    });
    this.el = item;
  }

  return Cell;

})();

More = (function() {

  function More() {
    this.hide = __bind(this.hide, this);
    this.show = __bind(this.show, this);
    this._onclick = __bind(this._onclick, this);
    this.off = __bind(this.off, this);
    this.on = __bind(this.on, this);
    this.setWidth = __bind(this.setWidth, this);    this.more = $('#more');
    this.inner = $('#more-inner');
  }

  More.prototype.setWidth = function(width) {
    return this.more.width(width);
  };

  More.prototype.on = function() {
    this.more.css({
      cursor: 'pointer'
    });
    this.inner.text('more');
    return this.more.on('click', this._onclick);
  };

  More.prototype.off = function() {
    return this.more.off('click', this._onclick);
  };

  More.prototype._onclick = function(e) {
    this.off();
    this.more.css({
      cursor: 'wait'
    });
    this.inner.text('loading...');
    return typeof this.onclick === "function" ? this.onclick() : void 0;
  };

  More.prototype.show = function() {
    this.on();
    return this.more.show();
  };

  More.prototype.hide = function() {
    return this.more.hide();
  };

  return More;

})();
