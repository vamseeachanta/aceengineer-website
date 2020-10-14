YUI.Ux.LavaLamp = function(el, config){
	/* ---------------------------------------------------
	Private Properties
	----------------------------------------------------*/
	var that = this;
	var defaults = {
		"setup": {
			callback: (function(){
				lamp = this.element.getElementsByTagName("ul")[0];
				YUI.D.addClass(lamp, "lavaLamp");
				back = document.createElement("li");
				left = document.createElement("span");
				YUI.D.addClass(back, "back");
				YUI.D.addClass(left, "left");
				back.appendChild(left);
				lamp.appendChild(back);
				current = YUI.D.getElementsByClassName("current", "li", lamp)[0] || YUI.D.getChildren(lamp)[0];
				for (var idx = 0; idx < this.getItems().length; idx++){
					this.getItems()[idx].subscribe("mouseover", menuItemOver);
					this.getItems()[idx].subscribe("click", function(type, args){
						setCurrent(this.element);	
					});
				}
				setCurrent(current);
			}),
			fire: true
		}
	}; // end defaults
	var back, left, current;
	/* ---------------------------------------------------
	Private Methods
	----------------------------------------------------*/
	function menuItemOver(type, args){
		var backAnim = new YUI.A(back, {width: {to: this.element.offsetWidth}, left: {to: this.element.offsetLeft}}, that.animSpeed, that.animFx);
		backAnim.animate();
		backAnim.onComplete.subscribe(function(fn, obj, scope){
			setCurrent(scope);
		}, this.element);
	}; // end menuItemOver
	function setCurrent(el){
		YUI.D.setStyle(back, "width", el.offsetWidth + "px");
		YUI.D.setStyle(back, "left", el.offsetLeft + "px");
		current = el;
	}; // end setCurrent
	/* ---------------------------------------------------
	Public Properties
	----------------------------------------------------*/
	this.listeners = config.listeners || {};
	/* ---------------------------------------------------
	Public Methods
	----------------------------------------------------*/
	/* ---------------------------------------------------
	Constructor Code
	----------------------------------------------------*/
	config.clicktohide = config.clicktohide || false;
	config.keepopen = config.keepopen || true;
	config.position = config.position || "static";
	
	YUI.Y.lang.augmentObject(this, config);
	YUI.Ux.LavaLamp.superclass.constructor.call(this, el, config);
	YUI.Y.lang.augmentObject(this.listeners, defaults);
	YUI.Ux.listener.init(this, this.listeners);
}; // end YUI.Ux.PhotoViewer
YUI.Y.lang.extend(YUI.Ux.LavaLamp, YUI.W.Menu); // class extension