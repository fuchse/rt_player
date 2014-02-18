package com
{

	public class Utils
	{
	
		public static function getKeys(object:Object):Array
		{
			var keys:Array = new Array();
			for(var property:String in object)
			{
				if(object.hasOwnProperty(property))
				{
					keys.push(property);
				}				
			}
			return keys;
		}
	
	}

}