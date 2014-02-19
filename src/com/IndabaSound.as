package com
{
	
	import flash.media.Sound;
	import flash.media.SoundChannel;
	import flash.media.SoundLoaderContext;
	import flash.media.SoundTransform;
	import flash.net.URLRequest;
	
	public class IndabaSound extends Sound
	{
		
		public var id:String;
		public var key:String;
		
		public var playing:Boolean;
		
		public var position:Number;
		public var duration:Number;
		public var loadProgress:Number;
		public var _volume:Number = 1;
		
		public var error:String;
		
		public function IndabaSound(id:String, stream:URLRequest = null, context:SoundLoaderContext = null)
		{
			this.id = id;
			this.playing = false;
			
			super(stream, context);
		}
		
		override public function play(startTime:Number = 0, loops:int = 0, sndTransform:SoundTransform = null):SoundChannel
		{
			this.playing = true;
			return super.play(startTime, loops, sndTransform);
		}
		
		public function set volume(vol:Number):void
		{
			// keep it between 0 and 1
			this._volume = vol > 1 ? 1 : (vol < 0 ? 0 : vol);
		}
		
		public function get volume():Number
		{
			return this._volume;
		}
		
		
		public function loaded():Boolean
		{
			return this.bytesLoaded >= this.bytesTotal;
		}
		
		public function forEvent():Object
		{
			return {
				id: 	 		this.id,
				playing: 		this.playing || false,
				loaded: 		this.loaded(),
				position:		this.position || 0,
				loadProgress: 	this.bytesLoaded / this.bytesTotal * 100,
				error:			this.error || false,
				length:			this.length,
				volume:			this.volume
			}
		}
		
	}
	
}