var App, Cell, Container, Facebook, Instagram, More, SignInBox, Twitter, base58,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$(function() {
  return new App;
});

base58 = encdec();

App = (function() {

  function App() {
    this.onResize = __bind(this.onResize, this);
    var _this = this;
    this.container = new Container;
    this.signinbox = new SignInBox;
    this.more = new More;
    $(window).smartresize(this.onResize);
    this.onResize();
    $.get('/get_user', function(data, textStatus, jqXHR) {
      var link;
      console.log(data);
      if (data.instagram != null) {
        _this.instagram = new Instagram(_this.container, data.instagram);
      }
      if (data.facebook != null) {
        _this.facebook = new Facebook(_this.container, data.facebook);
      }
      if (data.twitter != null) {
        _this.twitter = new Twitter(_this.container, data.twitter);
        link = $('<link>');
        link.attr({
          type: 'text/css',
          rel: 'stylesheet',
          href: '/user_style'
        });
        $('head').append(link);
      }
      _this.signinbox.setup(data);
      if (!(data.instagram != null) && !(data.facebook != null) && !(data.twitter != null)) {
        _this.twitter = new Twitter(_this.container);
        return _this.twitter.search('pic.twitter.com OR instagr.am OR twitpic.com OR yfrog.com OR p.twipple.jp OR movapic.com OR flic.kr');
      }
    });
  }

  App.prototype.onResize = function(e) {
    var n, w, win;
    if (e == null) e = null;
    win = $(window).width();
    n = Math.floor((win - 300 - 40) / (300 + 10)) + 1;
    w = (300 + 10) * n - 10;
    $('#signin-box').css({
      right: (win - w) / 2 - 10 + 'px'
    });
    w += 'px';
    $('#header-inner').width(w);
    this.more.el.width(w);
    $('#footer-inner').width(w);
    if (e === null) return this.container.el.width(w);
  };

  return App;

})();

SignInBox = (function() {

  function SignInBox() {
    this._hide = __bind(this._hide, this);
    this._show = __bind(this._show, this);    this.timer = 0;
    this.signin = $('#signin');
    this.signin.mouseenter(this._show);
    this.signin.mouseleave(this._hide);
    this.signbox = $('#signin-box');
    this.signbox.mouseenter(this._show);
    this.signbox.mouseleave(this._hide);
    this.user = $('#user');
    this.user.mouseenter(this._show);
    this.user.mouseleave(this._hide);
  }

  SignInBox.prototype.setup = function(data) {
    var profile_image_url, screen_name;
    if (data.instagram != null) {
      screen_name = data.instagram.user.username;
      profile_image_url = data.instagram.user.profile_picture;
      $('#instagram-signin').html("<img src='/images/switch-on.png'/> <img src='/images/instagram.png'/> Instagram");
      $('#instagram-signin').click(function() {
        return location.href = '/instagram/signout';
      });
    } else {
      $('#instagram-signin').html("<img src='/images/switch-off.png'/> <img src='/images/instagram.png'/> Instagram");
      $('#instagram-signin').click(function() {
        return location.href = '/instagram/signin';
      });
    }
    if (data.facebook != null) {
      screen_name = data.facebook.user.name;
      profile_image_url = data.facebook.user.pic_square;
      $('#facebook-signin').html("<img src='/images/switch-on.png'/> <img src='/images/facebook.png'/> Facebook");
      $('#facebook-signin').click(function() {
        return location.href = '/facebook/signout';
      });
    } else {
      $('#facebook-signin').html("<img src='/images/switch-off.png'/> <img src='/images/facebook.png'/> Facebook");
      $('#facebook-signin').click(function() {
        return location.href = '/facebook/signin';
      });
    }
    if (data.twitter != null) {
      screen_name = data.twitter.user.screen_name;
      profile_image_url = data.twitter.user.profile_image_url;
      $('#twitter-signin').html("<img src='/images/switch-on.png'/> <img src='/images/twitter-2.png'/> Twitter");
      $('#twitter-signin').click(function() {
        return location.href = '/twitter/signout';
      });
    } else {
      $('#twitter-signin').html("<img src='/images/switch-off.png'/> <img src='/images/twitter-2.png'/> Twitter");
      $('#twitter-signin').click(function() {
        return location.href = '/twitter/signin';
      });
    }
    if (screen_name != null) {
      this.signin.hide();
      this.user.show();
      $('#user-icon').attr({
        src: profile_image_url
      });
      return $('#user-name').text(screen_name);
    }
  };

  SignInBox.prototype._show = function() {
    clearTimeout(this.timer);
    return this.signbox.show();
  };

  SignInBox.prototype._hide = function() {
    var _this = this;
    return this.timer = setTimeout((function() {
      return _this.signbox.fadeOut(300);
    }), 300);
  };

  return SignInBox;

})();

Twitter = (function() {

  function Twitter(container, info) {
    this.container = container;
    this.info = info != null ? info : null;
    this.setNextTimer = __bind(this.setNextTimer, this);
    this.addItems = __bind(this.addItems, this);
    this.getHomeTimeline = __bind(this.getHomeTimeline, this);
    this.search = __bind(this.search, this);
    this.min_id = null;
    if (this.info != null) this.getHomeTimeline();
  }

  Twitter.prototype.search = function(query) {
    var params,
      _this = this;
    params = {
      q: query,
      include_entities: true,
      rpp: 30,
      result_type: 'recent'
    };
    return $.getJSON('http://search.twitter.com/search.json?callback=?', params, function(results) {
      console.log(results);
      return _this.addItems(results.results);
    });
  };

  Twitter.prototype.getHomeTimeline = function(since_id, max_id) {
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
    return $.get('/twitter/api/statuses/home_timeline', params, function(tweets) {
      if (max_id && tweets.length) tweets.shift();
      if (tweets.length === 0) {
        if (since_id != null) _this.setNextTimer(since_id);
        return;
      }
      _this.addItems(tweets, since_id != null ? false : true);
      if (since_id === null) _this.min_id = tweets[tweets.length - 1].id_str;
      if (max_id === null) {
        return _this.setNextTimer(tweets[0].id_str);
      } else {

      }
    });
  };

  Twitter.prototype.addItems = function(tweets) {
    var image_url, image_urls, m, t, u, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
    _results = [];
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
      if (image_urls.length > 0) {
        _results.push(this.container.addItem('twitter', image_urls, t));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Twitter.prototype.setNextTimer = function(since_id, secs) {
    if (secs == null) secs = 60;
    return setTimeout(this.getHomeTimeline, secs * 1000, since_id);
  };

  Twitter.prototype.getImageUrl = function(url) {
    var image_url, u;
    image_url = null;
    u = url.split('/');
    switch (u[2]) {
      case 'twitpic.com':
        image_url = 'http://twitpic.com/show/large/' + u.pop();
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
      case '4u.cotto.jp':
        image_url = "https://cottoapi.appspot.com/api/image/content/entry/" + (u.pop()) + "_entry.jpg";
        break;
      case 'pk.gd':
        image_url = "http://img.pikchur.com/pic_" + (u.pop()) + "_m.jpg";
        break;
      default:
        if (url.match(/\.(png|jpg|jpeg|gif)$/i)) image_url = url;
    }
    return image_url;
  };

  return Twitter;

})();

Facebook = (function() {

  function Facebook(container, info) {
    this.container = container;
    this.info = info;
    this.setNextTimer = __bind(this.setNextTimer, this);
    this.getStream = __bind(this.getStream, this);
    this.min_time = null;
    this.getStream();
  }

  Facebook.prototype.getStream = function(min_time) {
    var fql,
      _this = this;
    if (min_time == null) min_time = null;
    fql = "SELECT created_time, actor_id, message, attachment, permalink FROM stream WHERE filter_key in (SELECT filter_key FROM stream_filter WHERE uid=me() AND type='newsfeed') AND type = 247 AND is_hidden = 0";
    if (min_time != null) fql += " AND created_time > " + min_time;
    return $.getJSON("https://graph.facebook.com/fql?q=" + (encodeURIComponent(fql)) + "&access_token=" + this.info.access_token + "&callback=?", function(result) {
      var item, media, pids, uids, _i, _j, _len, _len2, _ref, _ref2;
      console.log(result);
      uids = [];
      pids = [];
      _ref = result.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        uids.push(item.actor_id);
        _ref2 = item.attachment.media;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          media = _ref2[_j];
          pids.push(media.photo.pid);
        }
      }
      if (pids.length === 0) {
        _this.setNextTimer();
        return;
      }
      pids = '"' + pids.join('", "') + '"';
      fql = JSON.stringify({
        users: "SELECT id, name, pic_square, url FROM profile WHERE id in (" + (uids.join(',')) + ")",
        photos: "SELECT pid, src_big FROM photo WHERE pid in (" + pids + ")"
      });
      return $.getJSON("https://graph.facebook.com/fql?q=" + (encodeURIComponent(fql)) + "&access_token=" + _this.info.access_token + "&callback=?", function(result2) {
        var data, item, media, p, src, u, urls, user, _k, _l, _len3, _len4, _len5, _len6, _len7, _m, _n, _o, _ref3, _ref4, _ref5, _ref6, _ref7;
        user = {};
        src = {};
        _ref3 = result2.data;
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          data = _ref3[_k];
          switch (data.name) {
            case 'users':
              _ref4 = data.fql_result_set;
              for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
                u = _ref4[_l];
                user[u.id] = u;
              }
              break;
            case 'photos':
              _ref5 = data.fql_result_set;
              for (_m = 0, _len5 = _ref5.length; _m < _len5; _m++) {
                p = _ref5[_m];
                src[p.pid] = p.src_big;
              }
          }
        }
        _ref6 = result.data;
        for (_n = 0, _len6 = _ref6.length; _n < _len6; _n++) {
          item = _ref6[_n];
          item.user = user[item.actor_id];
          urls = [];
          _ref7 = item.attachment.media;
          for (_o = 0, _len7 = _ref7.length; _o < _len7; _o++) {
            media = _ref7[_o];
            urls.push(src[media.photo.pid]);
          }
          _this.container.addItem('facebook', urls, item);
        }
        _this.min_time = result.data[0].created_time;
        return _this.setNextTimer();
      });
    });
  };

  Facebook.prototype.setNextTimer = function(secs) {
    if (secs == null) secs = 60;
    return setTimeout(this.getStream, secs * 1000, this.min_time);
  };

  return Facebook;

})();

Instagram = (function() {

  function Instagram(container, info) {
    this.container = container;
    this.info = info;
    this.getFeed = __bind(this.getFeed, this);
    this.min_id = '';
    this.getFeed();
  }

  Instagram.prototype.getFeed = function() {
    var _this = this;
    return $.getJSON("https://api.instagram.com/v1/users/self/feed?access_token=" + this.info.access_token + "&min_id=" + this.min_id + "&count=30&callback=?", function(result) {
      var item, _i, _len, _ref;
      _ref = result.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _this.container.addItem('instagram', [item.images.low_resolution.url], item);
      }
      if (result.data.length) _this.min_id = result.data[0].id;
      return setTimeout(_this.getFeed, 60 * 1000);
    });
  };

  return Instagram;

})();

Container = (function() {

  function Container() {
    this._append = __bind(this._append, this);
    this.addItem = __bind(this.addItem, this);    this.el = $('#items');
    this.el.masonry({
      itemSelector: '.item',
      columnWidth: 300,
      gutterWidth: 10,
      isFitWidth: true
    });
    this.queue = [];
    this.all = [];
    setInterval(this._append, 2000);
  }

  Container.prototype.addItem = function(type, urls, tweet) {
    var item,
      _this = this;
    item = new Cell(type, urls, tweet);
    return item.loaded = function() {
      return _this.queue.push(item);
    };
  };

  Container.prototype._append = function() {
    var attr, index, item, n, _i, _len, _ref;
    if (this.queue.length) {
      attr = {
        position: 'absolute',
        left: ($('#items').width() - 300) / 2 + 'px',
        top: $(window).height() + $(window).scrollTop() + 'px'
      };
      _ref = this.queue;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        index = 0;
        n = this.all.length;
        while (index < n) {
          if (this.all[index].time <= item.time) {
            item.el.css(attr);
            this.all[index].el.before(item.el);
            this.all.splice(index, 0, item);
            break;
          }
          index++;
        }
        if (index === n) {
          item.el.css(attr);
          this.el.append(item.el);
          this.all.push(item);
        }
      }
      this.el.masonry('reload');
      return this.queue = [];
    }
  };

  return Container;

})();

Cell = (function() {

  function Cell(type, urls, data) {
    var date, h, img, item, m, n, profile_image_url, profile_url, screen_name, t, text, u, url, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _len7, _m, _n, _o, _ref, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
      _this = this;
    this.type = type;
    switch (this.type) {
      case 'twitter':
        h = '';
        for (_i = 0, _len = urls.length; _i < _len; _i++) {
          url = urls[_i];
          h += "<img src='" + url + "' width='300'/>";
        }
        img = $(h);
        if (data.user != null) {
          screen_name = data.user.screen_name;
          profile_image_url = data.user.profile_image_url;
        } else {
          screen_name = data.from_user;
          profile_image_url = data.profile_image_url;
        }
        profile_url = 'http://twitter.com/' + screen_name;
        text = data.text;
        if (((_ref = data.entities) != null ? _ref.media : void 0) != null) {
          _ref2 = data.entities.media;
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            m = _ref2[_j];
            text = text.replace(m.url, "<a href='" + m.expanded_url + "' target='_blank'>" + m.display_url + "</a>");
          }
        }
        if (((_ref3 = data.entities) != null ? _ref3.urls : void 0) != null) {
          _ref4 = data.entities.urls;
          for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
            u = _ref4[_k];
            text = text.replace(u.url, "<a href='" + u.expanded_url + "' target='_blank'>" + u.display_url + "</a>");
          }
        }
        if (((_ref5 = data.entities) != null ? _ref5.user_mentions : void 0) != null) {
          _ref6 = data.entities.user_mentions;
          for (_l = 0, _len4 = _ref6.length; _l < _len4; _l++) {
            u = _ref6[_l];
            text = text.replace(u.screen_name, "<a href='http://twitter.com/" + u.screen_name + "' target='_blank'>" + u.screen_name + "</a>");
          }
        }
        if (((_ref7 = data.entities) != null ? _ref7.hashtags : void 0) != null) {
          _ref8 = data.entities.hashtags;
          for (_m = 0, _len5 = _ref8.length; _m < _len5; _m++) {
            t = _ref8[_m];
            text = text.replace('#' + t.text, "<a href='http://twitter.com/search?q=%23" + t.text + "' target='_blank'>\#" + t.text + "</a>");
          }
        }
        date = new Date(data.created_at);
        this.time = date.getTime();
        break;
      case 'facebook':
        h = '';
        for (_n = 0, _len6 = urls.length; _n < _len6; _n++) {
          url = urls[_n];
          h += "<img src='" + url + "' width='300'/>";
        }
        img = $(h);
        screen_name = data.user.name;
        profile_image_url = data.user.pic_square;
        profile_url = data.user.url;
        text = data.message;
        date = new Date(data.created_time * 1000);
        this.time = date.getTime();
        break;
      case 'instagram':
        h = '';
        for (_o = 0, _len7 = urls.length; _o < _len7; _o++) {
          url = urls[_o];
          h += "<img src='" + url + "' width='300'/>";
        }
        img = $(h);
        screen_name = data.user.username;
        profile_image_url = data.user.profile_picture;
        profile_url = 'javascript:;';
        if (((_ref9 = data.caption) != null ? _ref9.text : void 0) != null) {
          text = (_ref10 = data.caption) != null ? _ref10.text : void 0;
        } else {
          text = '';
        }
        date = new Date(data.created_time * 1000);
        this.time = date.getTime();
    }
    item = $("<div class='item item-" + this.type + "'>\n    <div class='info'>\n        <a href='" + profile_url + "' target='_blank'><img src='" + profile_image_url + "' class='profile-image'></img></a>\n        <div class='text'>\n            <p><a href='" + profile_url + "' target='_blank' class='screen-name'>" + screen_name + "</a> " + text + "</p>\n            <span class='date'>" + (date.toLocaleString()) + "</span></div>\n        <div style='clear:both'></div>\n    </div>\n</div>");
    item.prepend(img);
    n = urls.length;
    img.load(function() {
      if (--n === 0) {
        return typeof _this.loaded === "function" ? _this.loaded() : void 0;
      }
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
    this.on = __bind(this.on, this);    this.el = $('#more');
    this.inner = $('#more-inner');
  }

  More.prototype.on = function() {
    this.el.css({
      cursor: 'pointer'
    });
    this.inner.text('more');
    return this.el.on('click', this._onclick);
  };

  More.prototype.off = function() {
    return this.el.off('click', this._onclick);
  };

  More.prototype._onclick = function(e) {
    this.off();
    this.el.css({
      cursor: 'wait'
    });
    this.inner.text('loading...');
    return typeof this.onclick === "function" ? this.onclick() : void 0;
  };

  More.prototype.show = function() {
    this.on();
    return this.el.show();
  };

  More.prototype.hide = function() {
    return this.el.hide();
  };

  return More;

})();
