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
				length:			this.length
			}
		}
		
	}
	
}