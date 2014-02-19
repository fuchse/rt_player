package
{
	import com.IndabaSound;
	import com.Utils;
	
	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.external.ExternalInterface;
	import flash.media.SoundChannel;
	import flash.media.SoundTransform;
	import flash.net.URLRequest;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFormat;
	import flash.utils.getQualifiedClassName;
	import flash.utils.setTimeout;

	
	public class main extends Sprite
	{
		public var sounds:Object = new Object();
		public var channels:Object = new Object();
		
		private var initCount:Number = 5;
		
		private var statusTF:TextField;
		private var statusTextFormat:TextFormat;
		
		private var eiCallback:String = stage.loaderInfo.parameters.eiCallback || 'rtAudioEvent';
		private var stopOnMultiShot:Boolean = stage.loaderInfo.parameters.stopOnMultiShot === 'true';
		private var debug:Boolean = stage.loaderInfo.parameters.debug === 'true';
		
		
		public function main()
		{
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.align = StageAlign.TOP_LEFT;
			
			if (this.debug) {
				statusTextFormat = new TextFormat("left", 48);
			
				statusTF = new TextField();
				statusTF.setTextFormat(statusTextFormat);
				statusTF.autoSize = TextFieldAutoSize.NONE;
				statusTF.multiline = true;
				statusTF.mouseWheelEnabled = true;
				statusTF.x = 0;
				statusTF.y = 0;
				statusTF.width = stage.stageWidth;
				statusTF.height = stage.stageHeight;
				statusTF.text = "Status:\n" +
					"- - - - - - - - - - - - - - - - - - - - - -\n" +
					" eiCallback :       '" + this.eiCallback + "'\n" +
					" stopOnMultiShot :   " + this.stopOnMultiShot + "\n" +
					"- - - - - - - - - - - - - - - - - - - - - -\n";
				
				stage.addChild(statusTF);
			}
			
			stage.addEventListener(Event.ENTER_FRAME, loop);
			initExternalInterface();
		}
		
		private function loop(event:Event):void
		{
			for each(var sound:IndabaSound in this.sounds)
			{
				if (sound.playing)
				{
					sound.position = this.channels[sound.id].position;
					eiEvent("playing", sound.forEvent());
					if (Math.ceil(this.channels[sound.id].position) >= Math.ceil(sound.length))
					{
						sound.playing = false;
						eiEvent("finished", sound.forEvent());
					}
				}
			}
		}
		
		
		private function initExternalInterface():void
		{
			if (initCount > 0) {
				if (ExternalInterface.available) {
					try {
						buildExternalInterface();
					} catch(err:Error) {
						setTimeout(initExternalInterface, 250);
						initCount++;
					}
				} else {
					setTimeout(initExternalInterface, 250);
					initCount++;
				}
			}
		}
		
		
		private function buildExternalInterface():void
		{
			ExternalInterface.addCallback('load',		load);
			ExternalInterface.addCallback('unload',		unload);
			ExternalInterface.addCallback('unloadAll',	unloadAll);
			
			ExternalInterface.addCallback('play',		play);
			ExternalInterface.addCallback('stop',		stop);
			ExternalInterface.addCallback('stopAll',	stopAll);
			
			ExternalInterface.addCallback('setVolume',  setVolume);
			
			eiEvent('ready', { methods: ['load','unload','unloadAll','play','stop','stopAll','setVolume'] });
		}
		
		
		private function load(fileOrFiles:*, options:Object = null):Number
		{
			var files:Array = getQualifiedClassName(fileOrFiles) === "Object" ? new Array(fileOrFiles) : fileOrFiles;
			
			for (var i:Number = 0; i < files.length; i++)
			{
				var file:Object = files[i];
				
				var sound:IndabaSound = new IndabaSound(file._id);
				
				sound.addEventListener(Event.COMPLETE, soundLoadComplete);
				sound.addEventListener(ProgressEvent.PROGRESS, soundLoadProgress);
				sound.addEventListener(SecurityErrorEvent.SECURITY_ERROR, soundSecurityError);
				sound.addEventListener(IOErrorEvent.IO_ERROR, soundIOError);
				
				sound.load(new URLRequest(file.media_url));
				
				if (options && options.volume) sound.volume = options.volume;
				
				this.sounds[sound.id]	= sound;
				this.channels[sound.id] = new SoundChannel();
				
				eiEvent("load", this.sounds[sound.id].forEvent());
			}
			
			return files.length;
		}
		
		private function unload(fileIdOrIds:*):void
		{
			var fileIds:Array = getQualifiedClassName(fileIdOrIds) === "String" ? new Array(fileIdOrIds) : fileIdOrIds;
			
			for (var i:Number = 0; i < fileIds.length; i++)
			{
				if (this.sounds[fileIds[i]])
				{
				
					eiEvent("unload", this.sounds[fileIds[i]].forEvent());
					
					if (!this.sounds[fileIds[i]].loaded())
					{
						try {
							this.sounds[fileIds[i]].close();
						} catch(err:Error) {
							eiEvent("unload_error", { error: "could not close sound", id: fileIds[i] });
						}
					}
					if (this.sounds[fileIds[i]].playing)
					{
						try {
							this.channels[fileIds[i]].stop();
						} catch(err:Error) {
							eiEvent("unload_error", { error: "could not stop channel", id: fileIds[i] });
						}
					}
					
					try {
						delete this.channels[fileIds[i]];
						delete this.sounds[fileIds[i]];
					} catch(err:Error) {
						eiEvent("unload_error", { error: "could not delete objects", id: fileIds[i] });
					}
				
				} else {
					eiEvent("unload_error", { error: "no sound with specified id", id: fileIds[i] });
				}
			}
		}
		
		private function unloadAll():void
		{
			this.unload( Utils.getKeys(this.sounds) );
		}
		
		
		private function play(fileIdOrIds:*, options:Object = null):void
		{
			var fileIds:Array = getQualifiedClassName(fileIdOrIds) === "String" ? new Array(fileIdOrIds) : fileIdOrIds;
			
			for (var i:Number = 0; i < fileIds.length; i++)
			{
				if (this.sounds[fileIds[i]]) {
					if (this.stopOnMultiShot && this.channels[fileIds[i]])
					{
						this.channels[fileIds[i]].stop();
					}
					this.channels[fileIds[i]] = this.sounds[fileIds[i]].play(0);
					if (options && options.volume) this.setVolume(options.volume, fileIds[i])
					eiEvent("play", this.sounds[fileIds[i]].forEvent());
				} else {
					eiEvent("play_error", { error: "no sound with specified id", id: fileIds[i] });
				}
			}
		}
		
		private function stop(fileIdOrIds:*):void
		{
			var fileIds:Array = getQualifiedClassName(fileIdOrIds) === "String" ? new Array(fileIdOrIds) : fileIdOrIds;
			
			for (var i:Number = 0; i < fileIds.length; i++)
			{
				if (this.sounds[fileIds[i]]) {
					this.channels[fileIds[i]].stop();
					this.sounds[fileIds[i]].playing = false;
					eiEvent("stop", this.sounds[fileIds[i]].forEvent());
				} else {
					eiEvent("stop_error", { error: "no sound with specified id", id: fileIds[i] });
				}
			}
		}
		
		private function stopAll():void
		{
			this.stop( Utils.getKeys(this.channels) );
		}
		
		private function setVolume(volume:Number, fileIdOrIds:* = null):void
		{
			if (fileIdOrIds == null) {
				for (var fileId:String in this.channels)
				{
					this.sounds[fileId].volume = volume;
					if (this.channels[fileId]) this.channels[fileId].soundTransform = new SoundTransform(this.sounds[fileId].volume);
					eiEvent("volume_set", this.sounds[fileId].forEvent());
				}
			} else {
				var fileIds:Array = getQualifiedClassName(fileIdOrIds) === "String" ? new Array(fileIdOrIds) : fileIdOrIds;
				for (var j:Number = 0; j < fileIds.length; j++)
				{
					this.sounds[fileIds[j]].volume = volume;
					if (this.channels[fileIds[j]]) this.channels[fileIds[j]].soundTransform = new SoundTransform(this.sounds[fileIds[j]].volume);
					eiEvent("volume_set", this.sounds[fileIds[j]].forEvent());
				}
			}
		}
		
		                
		private function soundLoadComplete(event:Event):void
		{
			event.target.removeEventListener(Event.COMPLETE, soundLoadComplete);
			eiEvent('loaded', this.sounds[event.target.id].forEvent());
		}
		
		private function soundLoadProgress(event:ProgressEvent):void
		{
			eiEvent('load_progress', this.sounds[event.target.id].forEvent());
		}
		
		private function soundSecurityError(event:SecurityErrorEvent):void
		{
			this.sounds[event.target.id].error = event.text;
			eiEvent('security_error', this.sounds[event.target.id].forEvent());
		}
		
		private function soundIOError(event:IOErrorEvent):void
		{
			this.sounds[event.target.id].error = event.text;
			eiEvent('io_error', this.sounds[event.target.id].forEvent());
		}
		
		
		// Send Events to the External Interface - and debugging

		private function eiEvent(event:String, data:* = null):Boolean
		{
			trace("eiEvent", event, data);
			
			if (this.debug) {
				var eventStr:String = "\n" + event;
				
				if (getQualifiedClassName(data) === "Object")
				{
					if (data.id)
					{
						eventStr = eventStr + ": " + data.id;
						if (event === "load_progress")
						{
							eventStr = eventStr + " (" + Math.ceil(data.loadProgress) + "%)";
						}
						else if (event === "playing") {
							eventStr = eventStr + " (" + Math.ceil(data.position) + " / " + Math.ceil(data.length) + ")";
						}
					}
				}
				else if (getQualifiedClassName(data) === "String") {
					eventStr = eventStr + ": " + data;
				}
				
				statusTF.text = statusTF.text + eventStr;
				statusTF.scrollV = statusTF.maxScrollV;
			}
			
			if (ExternalInterface.available) {
			 	return ExternalInterface.call(this.eiCallback, event, data);
			} else {
				return false;
			}
		}
		
	}
	
}