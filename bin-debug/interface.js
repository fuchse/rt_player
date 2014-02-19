(function() {

	var rtPlayer = {
		execOnReady:	[],
    debug:        false,
  
		ready:			false,
		movieName: 		'main',
		movieCallbackName: 	'rtAudioEvent',
		eventHandlers: 	{}
	};
	
	rtPlayer.init = function(options) {
	  	window[rtPlayer.movieCallbackName] = function(event, data) {
	  		if (!rtPlayer.ready && event === 'ready') {
	  			rtPlayer.ready = true;
				  rtPlayer.interface = rtPlayer.getFlashMovie(rtPlayer.movieName);
	  		}
	  		
	  		
	  		if ('console' in window) {
			    if (data && data.error) {
					  console.error("%s: %s  %s (%o)", event, data.error, data ? data.id : '', data);
				  } else {
					  console.log("%s: %s (%o)", event, data ? data.id : '', data);
				  }
			  }
			  
			
			  for (var i = 0; i < rtPlayer.eventHandlers[event].length; i++) {
				  rtPlayer.eventHandlers[event][i](data);
		  	}
	  	};
	  	
	  	if (!rtPlayer.interface && swfobject) {
		    var swfVersionStr = options.swfobject.swfVersionStr;
		    var xiSwfUrlStr = options.swfobject.expressInstallSwf;
		    
		    var flashvars = {};
		    flashvars.eiCallback = options.moveCallbackName || rtPlayer.movieCallbackName;
		    flashvars.stopOnMultiShot = options.stopOnMultiShot || rtPlayer.stopOnMultiShot;
		    flashvars.debug = options.debug || rtPlayer.debug;
		    
		    var params = {};
		    params.quality = "high";
		    params.bgcolor = options.swfobject.bgColor;
		    params.allowscriptaccess = "always";
		    params.allowfullscreen = "true";
		    
		    var attributes = {};
		    attributes.id = options.swfobject.movieName;
		    attributes.name = options.swfobject.movieName;
		    attributes.align = "middle";
		    
		    swfobject.embedSWF(
		    	options.swfobject.swf,
		    	options.swfobject.containerId, 
          options.swfobject.width,
          options.swfobject.height,
          swfVersionStr,
          xiSwfUrlStr, 
          flashvars,
          params,
          attributes
		    );
		    
		    swfobject.createCSS('#'+options.swfobject.containerId, "display:block;text-align:left;");
	    }
	}
	
	rtPlayer.getFlashMovie = function(movieName) {
		var isIE = navigator.appName.indexOf("Microsoft") != -1;
		return (isIE) ? window[movieName] : document[movieName];
	};
	
	
	/* on - add event handler
	
		valid events:
			'ready'
			'load'
			'unload'
			'unload_error'
			'play'
			'stop'
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
  	
	
	rtPlayer.load = function(media, options) {
		rtPlayer.interface.load(media, options);
	};
	
	rtPlayer.unload = function(idOrIds) {
		rtPlayer.interface.unload(idOrIds);
	};
	
	rtPlayer.unloadAll = function() {
		rtPlayer.interface.unloadAll();
	};
	
	
	rtPlayer.play = function(idOrIds, options) {
		rtPlayer.interface.play(idOrIds, options);
	};
	
	rtPlayer.stop = function(idOrIds) {
		rtPlayer.interface.stop(idOrIds);
	};
	
	rtPlayer.stopAll = function() {
		rtPlayer.interface.stopAll();
	};


  rtPlayer.setVolume = function(volume) {
    rtPlayer.interface.setVolume(volume);
  };
	
	
	window.rtPlayer = rtPlayer;

})();
