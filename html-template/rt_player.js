var rtPlayer = (function(swfobject) {

  var extend = (function(){
    var own = {}.hasOwnProperty;
    function extend(obj, src){
      for (var key in src) if (own.call(src, key)) obj[key] = src[key];
      return obj;
    }
    return extend;
  }());


	var rtPlayer = {
    ready         : false,
		execOnReady   : [],
    sounds        : {},
		eventHandlers : {}
	};
	
	rtPlayer.init = function(options) {

      rtPlayer.options = extend({
        debug     : false,
        console   : false,
        swfobject : null
      }, options);

      rtPlayer.swfOptions = extend({
        movieName         : 'main',
        movieCallbackName : 'rtAudioEvent',
        swf               : 'bin-debug/main.swf',
        swfVersionStr     : '11.4.0',
        expressInstallSwf : 'bin-debug/playerProductInstall.swf',
        containerId       : 'rtPlayerFlashContent',
        height            : '100%',
        width             : '100%',
        bgColor           : '#FFFFFF'
      }, options ? (options.swfobject || {}) : {});

      
      rtPlayer.log('rtPlayer initializing');

	  	window[rtPlayer.swfOptions.movieCallbackName] = function(event, data) {
	  		if (!rtPlayer.ready && event === 'ready') {
          rtPlayer.ready      = true;
				  rtPlayer.movie  = (function(){
		        var isIE = navigator.appName.indexOf("Microsoft") != -1;
      	  	return (isIE) ? window[rtPlayer.swfOptions.movieName] : document[rtPlayer.swfOptions.movieName];
          }());
	  		}

        if (data && data.error) {
          rtPlayer.error("%s: %s  %s (%o)", event, data.error, data ? data.id : '', data);
        } else {
          rtPlayer.log("%s: %s (%o)", event, data ? data.id : '', data);
        }

        if (rtPlayer.eventHandlers[event]) {
  			  for (var i = 0; i < rtPlayer.eventHandlers[event].length; i++) {
	  			  if (typeof(rtPlayer.eventHandlers[event][i]) === 'function') rtPlayer.eventHandlers[event][i](data);
		    	}
        }

        if (data && data.id) {
          var sound = rtPlayer.sounds[data.id];
          if (sound.eventHandlers[event]) {
            for (var j = 0; j < sound.eventHandlers[event].length; j++) {
              if (typeof(sound.eventHandlers[event][j])) sound.eventHandlers[event][j](data);
            }
          }
        }
	  	};

      if (document.getElementById(rtPlayer.swfOptions.containerId)) {
        embed();
      } else {
        window.onload = function() {
          var container = document.createElement('div');
              container.id = rtPlayer.swfOptions.containerId;
          document.body.appendChild(container);
          embed();
        };
      }

      function embed() {
        if (!rtPlayer.movie && swfobject) {

          rtPlayer.swfOptions.flashvars = {
            eiCallback      : rtPlayer.swfOptions.movieCallbackName,
            stopOnMultiShot : rtPlayer.options.stopOnMultiShot,
            debug           : rtPlayer.options.debug
          };
          
          rtPlayer.swfOptions.params = {
            bgcolor            : rtPlayer.swfOptions.bgColor,
            quality            : "high",
            allowscriptaccess  : "always",
            allowfullscreen    : "true",
          };

          rtPlayer.swfOptions.attributes = {
            id     : rtPlayer.swfOptions.movieName,
            name   : rtPlayer.swfOptions.movieName,
            align  : "middle"
          };
          
          swfobject.embedSWF(
            rtPlayer.swfOptions.swf,
            rtPlayer.swfOptions.containerId, 
            rtPlayer.swfOptions.width,
            rtPlayer.swfOptions.height,
            rtPlayer.swfOptions.swfVersionStr,
            rtPlayer.swfOptions.expressInstallSwf, 
            rtPlayer.swfOptions.flashvars,
            rtPlayer.swfOptions.params,
            rtPlayer.swfOptions.attributes,
            function(event) {
              if (event.success) {
                rtPlayer.log('rtPlayer SWF embedded %o', event);
              } else {
                rtPlayer.error('rtPlayer SWF not embedded %o', event);
              }
            } 
          );
          
          swfobject.createCSS('#'+rtPlayer.swfOptions.containerId, "display:block;text-align:left;");
        }
      }
	  	
	};

  rtPlayer.log = function() {
    if (rtPlayer.options.debug && rtPlayer.options.console && ('console' in window)) {
      console.log.apply(console, arguments);
    }
  };

  rtPlayer.error = function() {
    if (rtPlayer.options.debug && rtPlayer.options.console && ('console' in window)) {
      console.error.apply(console, arguments);
    }
  };
	
	
	/* on - add event handler
	
		valid events:
			'ready'
			'load'
      'load_start'
			'unload'
			'play'
			'stop'
      'volume_set'
			'unload_error'
      'play_error'
			'stop_error'
			'load_progress'
			'security_error'
			'io_error'
	*/
	
	rtPlayer.on = function(event, cb) {
		if (rtPlayer.eventHandlers[event] && rtPlayer.eventHandlers[event] === cb) return;
		if (!rtPlayer.eventHandlers[event]) rtPlayer.eventHandlers[event] = [];
		
		rtPlayer.eventHandlers[event].push(cb);
	};
	
	rtPlayer.off = function(event, cb) {
		var index = rtPlayer.eventHandlers[event].indexOf(cb);
		if (index !== -1) {
			rtPlayer.eventHandlers[event].splice(index, 1);
		}
	};

  rtPlayer.addEventListener = rtPlayer.on;
  rtPlayer.removeEventListener = rtPlayer.off;
  	
	
	rtPlayer.load = function(url, options) {
    options.autoLoad = true;
    return new RtPlayerSound(url, options);
	};
	
	rtPlayer.unload = function(idOrIds) {
		rtPlayer.movie.unload(idOrIds);
	};
	
	rtPlayer.unloadAll = function() {
		rtPlayer.movie.unloadAll();
	};
	
	
	rtPlayer.play = function(idOrIds, options) {
		rtPlayer.movie.play(idOrIds, options);
	};
	
	rtPlayer.stop = function(idOrIds) {
		rtPlayer.movie.stop(idOrIds);
	};
	
	rtPlayer.stopAll = function() {
		rtPlayer.movie.stopAll();
	};


  rtPlayer.setVolume = function(volume) {
    rtPlayer.movie.setVolume(volume);
  };
	


  var RtPlayerSound = function(url, options) {
    options = extend({
      autoLoad: false
    }, options);

    this.url = url;
    this.id = options.id || options._id || this.url;
    
    if (rtPlayer.sounds[this.id]) return rtPlayer.sounds[this.id];

    this.options = options;
    this.eventHandlers = {};

    rtPlayer.sounds[this.id] = this;

    if (options.autoLoad) this.load();

    return this;
  };

	RtPlayerSound.prototype.on = function(event, cb) {
		if (this.eventHandlers[event] && this.eventHandlers[event] === cb) return;
		if (!this.eventHandlers[event]) this.eventHandlers[event] = [];
		
		this.eventHandlers[event].push(cb);
	};
	
	RtPlayerSound.prototype.off = function(event, cb) {
		var index = this.eventHandlers[event].indexOf(cb);
		if (index !== -1) {
			this.eventHandlers[event].splice(index, 1);
		}
	};


  RtPlayerSound.prototype.toFlash = function() {
    return {
      _id: this.id,
      media_url: this.url
    }
  };

  RtPlayerSound.prototype.load = function(options) {
    rtPlayer.movie.load(this.toFlash());
  };

  RtPlayerSound.prototype.play = function(options) {
    rtPlayer.play(this.id, options)
  };

  RtPlayerSound.prototype.stop = function() {
    rtPlayer.stop(this.id);
  };


  if (typeof(module) != 'undefined') module.exports = rtPlayer;

	return rtPlayer;

}(swfobject));
