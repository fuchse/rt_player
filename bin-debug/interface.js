(function() {

	var rtPlayer = {
		execOnReady:	[],
		ready:			false,
		movieName: 		'main',
		movieCallback: 	'rtAudioEvent',
		eventHandlers: 	{}
	};
	
	rtPlayer.init = function(options) {
	  	window[rtPlayer.movieCallback] = function(event, data) {
	  		if (!rtPlayer.ready && event === 'ready') {
	  			rtPlayer.ready = true;
				rtPlayer.interface = rtPlayer.getFlashMovie(rtPlayer.movieName);
	  		}
	  		
	  		/*
	  		if ('console' in window) {
			    if (data && data.error) {
					console.error("%s: %s  %s (%o)", event, data.error, data ? data.id : '', data);
				} else {
					console.log("%s: %s (%o)", event, data ? data.id : '', data);
				}
			}
			*/
			
			for (var i = 0; i < rtPlayer.eventHandlers[event].length; i++) {
				rtPlayer.eventHandlers[event][i](data);
			}
	  	}
	  	
	  	if (!rtPlayer.interface && swfobject) {
		    var swfVersionStr = options.swfVersionStr;
		    var xiSwfUrlStr = options.expressInstallSwf;
		    
		    var flashvars = {};
		    flashvars.eiCallback = rtPlayer.movieCallback;
		    flashvars.stopOnMultiShot = options.stopOnMultiShot;
		    flashvars.debug = options.debug;
		    
		    var params = {};
		    params.quality = "high";
		    params.bgcolor = options.bgColor;
		    params.allowscriptaccess = "always";
		    params.allowfullscreen = "true";
		    
		    var attributes = {};
		    attributes.id = options.movieName;
		    attributes.name = options.movieName;
		    attributes.align = "middle";
		    
		    swfobject.embedSWF(
		    	options.swf+".swf",
		    	options.containerId, 
		        options.width,
		        options.height,
		        swfVersionStr,
		        xiSwfUrlStr, 
		        flashvars,
		        params,
		        attributes
		    );
		    
		    swfobject.createCSS('#'+options.containerId, "display:block;text-align:left;");
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
  	
	
	rtPlayer.load = function(media) {
		rtPlayer.interface.load(media);
	};
	
	rtPlayer.unload = function(idOrIds) {
		rtPlayer.interface.unload(idOrIds);
	};
	
	rtPlayer.unloadAll = function() {
		rtPlayer.interface.unloadAll();
	};
	
	
	rtPlayer.play = function(idOrIds) {
		rtPlayer.interface.play(idOrIds);
	};
	
	rtPlayer.stop = function(idOrIds) {
		rtPlayer.interface.stop(idOrIds);
	};
	
	rtPlayer.stopAll = function() {
		rtPlayer.interface.stopAll();
	};
	
	
	window.rtPlayer = rtPlayer;

})();
