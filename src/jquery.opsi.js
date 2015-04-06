/*
  * jQuery Slot Machine v1.0.0
  * https://github.com/josex2r/jQuery-SlotMachine
  *
  * Copyright 2014 Jose Luis Represa
  * Released under the MIT license
*/
;(function($, window, document, undefined){
	
	var pluginName = "slotMachine",
        defaults = {
			active	: 0, //Active element [int]
			delay	: 200, //Animation time [int]
			auto	: false, //Repeat delay [false||int]
			randomize : null, //Randomize function, must return an integer with the selected position
			complete : null, //Callback function(result)
			//stopHidden : true //Stops animations if the element isn´t visible on the screen
		};
	
	var FX_FAST = 'slotMachineBlurFast',
		FX_NORMAL = 'slotMachineBlurMedium',
		FX_SLOW = 'slotMachineBlurSlow',
		FX_GRADIENT = 'slotMachineGradient',
		FX_STOP = FX_GRADIENT;
			
	//Set required styles, filters and masks
	$(document).ready(function(){
		
		var slotMachineBlurFilterFastString = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0">'+
								'<filter id="slotMachineBlurFilterFast">'+
									'<feGaussianBlur stdDeviation="5" />'+
								'</filter>'+
							'</svg>#slotMachineBlurFilterFast';
							
		var slotMachineBlurFilterMediumString = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0">'+
								'<filter id="slotMachineBlurFilterMedium">'+
									'<feGaussianBlur stdDeviation="3" />'+
								'</filter>'+
							'</svg>#slotMachineBlurFilterMedium';
		
		var slotMachineBlurFilterSlowString = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0">'+
								'<filter id="slotMachineBlurFilterSlow">'+
									'<feGaussianBlur stdDeviation="1" />'+
								'</filter>'+
							'</svg>#slotMachineBlurFilterSlow';
							
		var slotMachineFadeMaskString = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0">'+
								'<mask id="slotMachineFadeMask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">'+
									'<linearGradient id="slotMachineFadeGradient" gradientUnits="objectBoundingBox" x="0" y="0">'+
										'<stop stop-color="white" stop-opacity="0" offset="0"></stop>'+
										'<stop stop-color="white" stop-opacity="1" offset="0.25"></stop>'+
										'<stop stop-color="white" stop-opacity="1" offset="0.75"></stop>'+
										'<stop stop-color="white" stop-opacity="0" offset="1"></stop>'+
									'</linearGradient>'+
									'<rect x="0" y="-1" width="1" height="1" transform="rotate(90)" fill="url(#slotMachineFadeGradient)"></rect>'+
								'</mask>'+
							'</svg>#slotMachineFadeMask';
		
		/*//CSS classes
		$('body').append('<style>' +
								'.' + FX_FAST + '{-webkit-filter: blur(5px);-moz-filter: blur(5px);-o-filter: blur(5px);-ms-filter: blur(5px);filter: blur(5px);filter: url("data:image/svg+xml;utf8,'+slotMachineBlurFilterFastString+'");filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius="5")}' +
								'.' + FX_NORMAL + '{-webkit-filter: blur(3px);-moz-filter: blur(3px);-o-filter: blur(3px);-ms-filter: blur(3px);filter: blur(3px);filter: url("data:image/svg+xml;utf8,'+slotMachineBlurFilterMediumString+'");filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius="3")}' +
								'.' + FX_SLOW + '{-webkit-filter: blur(1px);-moz-filter: blur(1px);-o-filter: blur(1px);-ms-filter: blur(1px);filter: blur(1px);filter: url("data:image/svg+xml;utf8,'+slotMachineBlurFilterSlowString+'");filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius="1")}' +
								'.' + FX_GRADIENT + '{' +
									'' +
									'mask: url("data:image/svg+xml;utf8,'+slotMachineFadeMaskString+'");' +
								'}'+
							'</style>');
		*/
	});
	
	//Required easing functions
	if(typeof $.easing.easeOutBounce !== 'function'){
		//From jQuery easing, extend jQuery animations functions
		$.extend( $.easing, {
			easeOutBounce: function (x, t, b, c, d) {
				if ((t/=d) < (1/2.75)) {
					return c*(7.5625*t*t) + b;
				} else if (t < (2/2.75)) {
					return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
				} else if (t < (2.5/2.75)) {
					return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
				} else {
					return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
				}
			},
		});
	}
	
	
	function Timer(fn, delay){
		var startTime,
			self = this,
			timer,
			_fn = fn,
			_args = arguments,
			_delay = delay;
		
		this.running = false;
		
		this.onpause	= function(){};
		this.onresume	= function(){};
		
		this.cancel = function(){
			this.running = false;
	        clearTimeout(timer);
	   };
	
	    this.pause = function(){
			if( this.running ){
				delay -= new Date().getTime() - startTime;
				this.cancel();
				this.onpause();
			}
		};
	
	    this.resume = function(){
			if( !this.running ){
				this.running = true;
				startTime = new Date().getTime();
				
				timer = setTimeout(function(){
					_fn.apply(self, Array.prototype.slice.call(_args, 2, _args.length)); //Execute function with initial arguments, removing (fn & delay)
				}, delay);
				
				this.onresume();
			}
	    };
	    
	    this.reset = function(){
			this.cancel();
			this.running = true;
			delay = _delay;
			timer = setTimeout(function(){
				_fn.apply(self, Array.prototype.slice.call(_args, 2, _args.length)); //Execute function with initial arguments, removing (fn & delay)
			}, _delay);
	    };
	    
	    this.add = function(extraDelay){
			this.pause();
			delay += extraDelay;
			this.resume();
	    };
	    
	    this.resume();
	}
	
	
	/**
	  * @desc PUBLIC - Makes Slot Machine animation effect
	  * @param DOM element - Html element
	  * @param object settings - Plugin configuration params
	  * @return jQuery node - Returns jQuery selector with some new functions (shuffle, stop, next, auto, active)
	*/
	function SlotMachine(element, options){
		this.element = element;
		this.settings = $.extend( {}, defaults, options);
		this.defaults = defaults;
		this.name = pluginName;
		
		//jQuery selector
		this.$slot = $(element);
		//Slot Machine elements
		this.$tiles = this.$slot.children();
		//Container to wrap $tiles
		this.$container = null;
		 //Min marginTop offset
		this._minTop = null;
		//Max marginTop offset
		this._maxTop = null;
		//First element (the last of the html container)
		this._$fakeFirstTile = null;
		//Last element (the first of the html container)
		this._$fakeLastTile = null;
		//Timeout recursive function to handle auto (settings.auto)
		this._timer = null;
		 //Callback function
		this._oncompleteStack = [ this.settings.complete ];
		//Number of spins left before stop
		this._spinsLeft = null;
		 //Future result
		this.futureActive = null;
		//Machine is running?
		this.isRunning = false;
		//Current active element
		this.active = this.settings.active;
		
		this.$slot.css("overflow", "hidden");
		
		//Validate active index
		if(this.settings.active < 0 || this.settings.active >= this.$tiles.length ){
			this.settings.active = 0;
			this.active = 0;
		}
		
		//Wrap elements inside $container
		this.$tiles.wrapAll("<div class='slotMachineContainer' />");
		this.$container = this.$slot.find(".slotMachineContainer");
		
		//Set max top offset
		this._maxTop = - this.$container.height();
		
		//Add the last element behind the first to prevent the jump effect
		this._$fakeFirstTile = this.$tiles.last().clone();
		this._$fakeLastTile = this.$tiles.first().clone();
		
		this.$container.prepend( this._$fakeFirstTile );
		this.$container.append( this._$fakeLastTile );
		
		//Set min top offset
		this._minTop = - this._$fakeFirstTile.outerHeight();
		
		//Show active element
		this.$container.css('margin-top', this.getTileOffset(this.active));
		
		//Start auto animation
		if(this.settings.auto !== false){
			if(this.settings.auto === true){
				this.shuffle();
			}else{
				this.auto();
			}
		}
	}
	/**
	  * @desc PRIVATE - Get element offset top
	  * @param int index - Element position
	  * @return int - Negative offset in px
	*/
	SlotMachine.prototype.getTileOffset = function(index){
		var offset = 0;
		for(var i=0; i<index; i++){
			offset += $( this.$tiles.get(i) ).outerHeight();
		}
		return - offset + this._minTop;
	};
	/**
	  * @desc PRIVATE - Get current showing element index
	  * @return int - Element index
	*/
	SlotMachine.prototype.getVisibleTile = function(){
		var firstTileHeight = this.$tiles.first().height(),
			containerMarginTop = parseInt( this.$container.css('margin-top').replace(/px/, ''), 10);
		
		return Math.abs( Math.round( containerMarginTop / firstTileHeight ) ) - 1;
	};
	/**
	  * @desc PUBLIC - Changes randomize function
	  * @param function|int - Set new randomize function
	*/
	SlotMachine.prototype.setRandomize = function(rnd){
		if(typeof rnd === 'number'){
			var _fn = function(){
				return rnd;
			};
			this.settings.randomize = _fn;
		}else{
			this.settings.randomize = rnd;
		}
	};
	/**
	  * @desc PRIVATE - Get random element different than last shown
	  * @param boolean cantBeTheCurrent - true||undefined if cant be choosen the current element, prevents repeat
	  * @return int - Element index
	*/
	 SlotMachine.prototype.getRandom = function(cantBeTheCurrent){
		var rnd,
			removePrevious = cantBeTheCurrent || false;
		do{
			rnd = Math.floor( Math.random() * this.$tiles.length);
		}while((removePrevious && rnd === this.active) && rnd >= 0);
		
		return rnd;
	};
	/**
	  * @desc PRIVATE - Get random element based on the custom randomize function
	  * @return int - Element index
	*/ 
	SlotMachine.prototype.getCustom = function(){
		var choosen;
		if(this.settings.randomize !== null && typeof this.settings.randomize === 'function'){
			var index = this.settings.randomize.apply(this, [this.active]);
			if(index < 0 || index >= this.$tiles.length){
				index = 0;
			}
			choosen = index;
		}else{
			choosen = this.getRandom();
		}
		return choosen;
	};
	/**
	  * @desc PRIVATE - Get the previous element
	  * @return int - Element index
	*/ 
	SlotMachine.prototype.getPrev = function(){
		var prevIndex = (this.active-1 < 0) ? (this.$tiles.length - 1) : (this.active - 1);
		return prevIndex;
	};
	/**
	  * @desc PRIVATE - Get the next element
	  * @return int - Element index
	*/ 
	SlotMachine.prototype.getNext = function(){
		var nextIndex = (this.active + 1 < this.$tiles.length) ? (this.active + 1) : 0;
		return nextIndex;
	};
	/**
	  * @desc PRIVATE - Set CSS classes to make speed effect
	  * @param string FX_SPEED - Element speed [FX_FAST_BLUR||FX_NORMAL_BLUR||FX_SLOW_BLUR||FX_STOP]
	  * @param string||boolean fade - Set fade gradient effect
	*/
	SlotMachine.prototype._setAnimationFX = function(FX_SPEED, fade){
		var self = this;
		
		setTimeout(function(){
			self.$tiles.removeClass(FX_FAST).removeClass(FX_NORMAL).removeClass(FX_SLOW).addClass(FX_SPEED);
			
			if(fade !== true || FX_SPEED === FX_STOP){
				self.$slot.add(self.$tiles).removeClass(FX_GRADIENT);
			}else{
				self.$slot.add(self.$tiles).addClass(FX_GRADIENT);
			}
		}, this.settings.delay / 4);
	};
	/**
	  * @desc PRIVATE - Reset active element position
	*/
	SlotMachine.prototype._resetPosition = function(){
		this.$container.css("margin-top", this.getTileOffset(this.active));
	};
	/**
	  * @desc PRIVATE - Checks if the machine is on the screen
	  * @return int - Returns true if machine is on the screen
	*/
	SlotMachine.prototype.isVisible = function(){
		//Stop animation if element is [above||below] screen, best for performance
		var above = this.$slot.offset().top > $(window).scrollTop() + $(window).height(),
			below = $(window).scrollTop() > this.$slot.height() + this.$slot.offset().top;
		
		return !above && !below;
	};
	/**
	  * @desc PUBLIC - SELECT previous element relative to the current active element
	  * @return int - Returns result index
	*/
	SlotMachine.prototype.prev = function(){
		this.futureActive = this.getPrev();
		this.isRunning = true;
		this.stop(false);
		return this.futureActive;
	};	
	/**
	  * @desc PUBLIC - SELECT next element relative to the current active element
	  * @return int - Returns result index
	*/
	SlotMachine.prototype.next = function(){
		this.futureActive = this.getNext();
		this.isRunning = true;
		this.stop(false);
		return this.futureActive;
	};
	/**
	  * @desc PRIVATE - Starts shuffling the elements
	  * @param int repeations - Number of shuffles (undefined to make infinite animation
	  * @return int - Returns result index
	*/
	SlotMachine.prototype.shuffle = function( spins, onComplete ){		
		var self = this;
		/*
		if(!this.isVisible() && this.settings.stopHidden === true){
			return this.stop();
		}
		*/
		if(onComplete !== undefined){
			//this._oncompleteStack.push(onComplete);
			this._oncompleteStack[1] = onComplete;
		}
		
		this.isRunning = true;
		var delay = this.settings.delay;
		
		if(this.futureActive === null){
			//Get random or custom element
			var rnd = this.getCustom();
			this.futureActive = rnd;
		}
		
		/*if(this.$slot.attr("id")==="machine1")
		console.log(this.futureActive)*/
		//Decreasing spin
		if(typeof spins === 'number'){
			//Change delay and speed
			switch( spins){
				case 1:
				case 2:
					//this._setAnimationFX(FX_SLOW, true);
					break;
				case 3:
				case 4:
				//	this._setAnimationFX(FX_NORMAL, true);
					//delay /= 1.5;
					break;
				default:
				//	this._setAnimationFX(FX_FAST, true);
					delay /= 2;
			}
		//Infinite spin
		}else{
			//Set animation effects
			//this._setAnimationFX(FX_FAST, true);
			delay /= 2;
		}
		
		//Perform animation
		this.$container.animate({
			marginTop : this._maxTop
		}, delay, 'linear', function(){
			//Reset top position
			self.$container.css('margin-top', 0);
			
			if(spins - 1 <= 0){
				self.stop();
			}else{
				//Repeat animation
				self.shuffle(spins - 1);
			}
		});
		
		return this.futureActive;
	};
	/**
	  * @desc PRIVATE - Stop shuffling the elements
	  * @return int - Returns result index
	*/
	SlotMachine.prototype.stop = function( showGradient ){
		if(!this.isRunning){
			return;
		}
		var self = this;
		
		//Stop animation NOW!!!!!!!
		this.$container.clearQueue().stop(true, false);
		
		this._setAnimationFX(FX_SLOW, showGradient === undefined ? true : showGradient);
		
		this.isRunning = true;
		
		//Set current active element
		this.active = this.getVisibleTile();
		
		//Check direction to prevent jumping
		if(this.futureActive > this.active){
			//We are moving to the prev (first to last)
			if(this.active === 0 && this.futureActive === this.$tiles.length-1){
				this.$container.css('margin-top', this.getTileOffset(this.$tiles.length) );
			}
		}else{
			//We are moving to the next (last to first)
			if(this.active === this.$tiles.length - 1 && this.futureActive === 0){
				this.$container.css('margin-top', 0);
			}
		}
		
		//Update last choosen element index
		this.active = this.futureActive;
		this.futureActive = null;
		
		//Get delay
		var delay = this.settings.delay * 3;
		
		//Perform animation
		this.$container.animate({
			marginTop :  this.getTileOffset(this.active)
		}, delay, 'easeOutBounce', function (){
		
			self.isRunning = false;
			
			//Filter callbacks
			/*
			self._oncompleteStack = Array.prototype.filter.call(self._oncompleteStack, function(fn){
				return typeof fn === 'function';
			});
			//Ececute callbacks
			Array.prototype.map.call(self._oncompleteStack, function(fn, index){
				if(typeof fn === 'function'){
					fn.apply(self, [self.active]);
					self._oncompleteStack[index] = null;
				}
			});
			*/
			if(typeof self._oncompleteStack[0] === 'function'){
				self._oncompleteStack[0].apply(self, [self.active]);
			}
			if(typeof self._oncompleteStack[1] === 'function'){
				self._oncompleteStack[1].apply(self, [self.active]);
			}
		});
		
		//Disable blur
		setTimeout(function(){
			self._setAnimationFX(FX_STOP, false);
		}, delay / 1.75);
		
		return this.active;
	};
	/**
	  * @desc PRIVATE - Start auto shufflings, animation stops each 3 repeations. Then restart animation recursively
	*/
	SlotMachine.prototype.auto = function(){
		var self = this;
		
		this._timer = new Timer(function(){
			if(typeof self.settings.randomize !== 'function'){
				self.futureActive = self.getNext();
			}
			self.isRunning = true;
			self.shuffle(5, function(){
				self._timer.reset();
			});
			
		}, this.settings.auto);		
	};
	
	
    
    /*
     * Create new plugin instance if needed and return it
     */
	function _getInstance(element, options){
		var machine;
		if ( !$.data(element[0], 'plugin_' + pluginName) ){
			machine = new SlotMachine(element, options);
			$.data(element[0], 'plugin_' + pluginName, machine);
		}else{
			machine = $.data(element[0], 'plugin_' + pluginName);
		}
		return machine;
	}
	
	/*
	 * Chainable instance
	 */
	$.fn[pluginName] = function(options){
		if( this.length===1 ){
			return _getInstance(this, options);
		}else{
			return this.each(function(){
				if( !$.data(this, 'plugin_' + pluginName) ){
					_getInstance(this, options);
				}
			});
		}
	};

})( jQuery, window, document );


/*! jQuery Color v@2.1.2 http://github.com/jquery/jquery-color | jquery.org/license */
(function(a,b){function m(a,b,c){var d=h[b.type]||{};return a==null?c||!b.def?null:b.def:(a=d.floor?~~a:parseFloat(a),isNaN(a)?b.def:d.mod?(a+d.mod)%d.mod:0>a?0:d.max<a?d.max:a)}function n(b){var c=f(),d=c._rgba=[];return b=b.toLowerCase(),l(e,function(a,e){var f,h=e.re.exec(b),i=h&&e.parse(h),j=e.space||"rgba";if(i)return f=c[j](i),c[g[j].cache]=f[g[j].cache],d=c._rgba=f._rgba,!1}),d.length?(d.join()==="0,0,0,0"&&a.extend(d,k.transparent),c):k[b]}function o(a,b,c){return c=(c+1)%1,c*6<1?a+(b-a)*c*6:c*2<1?b:c*3<2?a+(b-a)*(2/3-c)*6:a}var c="backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",d=/^([\-+])=\s*(\d+\.?\d*)/,e=[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(a){return[a[1],a[2],a[3],a[4]]}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(a){return[a[1]*2.55,a[2]*2.55,a[3]*2.55,a[4]]}},{re:/#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,parse:function(a){return[parseInt(a[1],16),parseInt(a[2],16),parseInt(a[3],16)]}},{re:/#([a-f0-9])([a-f0-9])([a-f0-9])/,parse:function(a){return[parseInt(a[1]+a[1],16),parseInt(a[2]+a[2],16),parseInt(a[3]+a[3],16)]}},{re:/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,space:"hsla",parse:function(a){return[a[1],a[2]/100,a[3]/100,a[4]]}}],f=a.Color=function(b,c,d,e){return new a.Color.fn.parse(b,c,d,e)},g={rgba:{props:{red:{idx:0,type:"byte"},green:{idx:1,type:"byte"},blue:{idx:2,type:"byte"}}},hsla:{props:{hue:{idx:0,type:"degrees"},saturation:{idx:1,type:"percent"},lightness:{idx:2,type:"percent"}}}},h={"byte":{floor:!0,max:255},percent:{max:1},degrees:{mod:360,floor:!0}},i=f.support={},j=a("<p>")[0],k,l=a.each;j.style.cssText="background-color:rgba(1,1,1,.5)",i.rgba=j.style.backgroundColor.indexOf("rgba")>-1,l(g,function(a,b){b.cache="_"+a,b.props.alpha={idx:3,type:"percent",def:1}}),f.fn=a.extend(f.prototype,{parse:function(c,d,e,h){if(c===b)return this._rgba=[null,null,null,null],this;if(c.jquery||c.nodeType)c=a(c).css(d),d=b;var i=this,j=a.type(c),o=this._rgba=[];d!==b&&(c=[c,d,e,h],j="array");if(j==="string")return this.parse(n(c)||k._default);if(j==="array")return l(g.rgba.props,function(a,b){o[b.idx]=m(c[b.idx],b)}),this;if(j==="object")return c instanceof f?l(g,function(a,b){c[b.cache]&&(i[b.cache]=c[b.cache].slice())}):l(g,function(b,d){var e=d.cache;l(d.props,function(a,b){if(!i[e]&&d.to){if(a==="alpha"||c[a]==null)return;i[e]=d.to(i._rgba)}i[e][b.idx]=m(c[a],b,!0)}),i[e]&&a.inArray(null,i[e].slice(0,3))<0&&(i[e][3]=1,d.from&&(i._rgba=d.from(i[e])))}),this},is:function(a){var b=f(a),c=!0,d=this;return l(g,function(a,e){var f,g=b[e.cache];return g&&(f=d[e.cache]||e.to&&e.to(d._rgba)||[],l(e.props,function(a,b){if(g[b.idx]!=null)return c=g[b.idx]===f[b.idx],c})),c}),c},_space:function(){var a=[],b=this;return l(g,function(c,d){b[d.cache]&&a.push(c)}),a.pop()},transition:function(a,b){var c=f(a),d=c._space(),e=g[d],i=this.alpha()===0?f("transparent"):this,j=i[e.cache]||e.to(i._rgba),k=j.slice();return c=c[e.cache],l(e.props,function(a,d){var e=d.idx,f=j[e],g=c[e],i=h[d.type]||{};if(g===null)return;f===null?k[e]=g:(i.mod&&(g-f>i.mod/2?f+=i.mod:f-g>i.mod/2&&(f-=i.mod)),k[e]=m((g-f)*b+f,d))}),this[d](k)},blend:function(b){if(this._rgba[3]===1)return this;var c=this._rgba.slice(),d=c.pop(),e=f(b)._rgba;return f(a.map(c,function(a,b){return(1-d)*e[b]+d*a}))},toRgbaString:function(){var b="rgba(",c=a.map(this._rgba,function(a,b){return a==null?b>2?1:0:a});return c[3]===1&&(c.pop(),b="rgb("),b+c.join()+")"},toHslaString:function(){var b="hsla(",c=a.map(this.hsla(),function(a,b){return a==null&&(a=b>2?1:0),b&&b<3&&(a=Math.round(a*100)+"%"),a});return c[3]===1&&(c.pop(),b="hsl("),b+c.join()+")"},toHexString:function(b){var c=this._rgba.slice(),d=c.pop();return b&&c.push(~~(d*255)),"#"+a.map(c,function(a){return a=(a||0).toString(16),a.length===1?"0"+a:a}).join("")},toString:function(){return this._rgba[3]===0?"transparent":this.toRgbaString()}}),f.fn.parse.prototype=f.fn,g.hsla.to=function(a){if(a[0]==null||a[1]==null||a[2]==null)return[null,null,null,a[3]];var b=a[0]/255,c=a[1]/255,d=a[2]/255,e=a[3],f=Math.max(b,c,d),g=Math.min(b,c,d),h=f-g,i=f+g,j=i*.5,k,l;return g===f?k=0:b===f?k=60*(c-d)/h+360:c===f?k=60*(d-b)/h+120:k=60*(b-c)/h+240,h===0?l=0:j<=.5?l=h/i:l=h/(2-i),[Math.round(k)%360,l,j,e==null?1:e]},g.hsla.from=function(a){if(a[0]==null||a[1]==null||a[2]==null)return[null,null,null,a[3]];var b=a[0]/360,c=a[1],d=a[2],e=a[3],f=d<=.5?d*(1+c):d+c-d*c,g=2*d-f;return[Math.round(o(g,f,b+1/3)*255),Math.round(o(g,f,b)*255),Math.round(o(g,f,b-1/3)*255),e]},l(g,function(c,e){var g=e.props,h=e.cache,i=e.to,j=e.from;f.fn[c]=function(c){i&&!this[h]&&(this[h]=i(this._rgba));if(c===b)return this[h].slice();var d,e=a.type(c),k=e==="array"||e==="object"?c:arguments,n=this[h].slice();return l(g,function(a,b){var c=k[e==="object"?a:b.idx];c==null&&(c=n[b.idx]),n[b.idx]=m(c,b)}),j?(d=f(j(n)),d[h]=n,d):f(n)},l(g,function(b,e){if(f.fn[b])return;f.fn[b]=function(f){var g=a.type(f),h=b==="alpha"?this._hsla?"hsla":"rgba":c,i=this[h](),j=i[e.idx],k;return g==="undefined"?j:(g==="function"&&(f=f.call(this,j),g=a.type(f)),f==null&&e.empty?this:(g==="string"&&(k=d.exec(f),k&&(f=j+parseFloat(k[2])*(k[1]==="+"?1:-1))),i[e.idx]=f,this[h](i)))}})}),f.hook=function(b){var c=b.split(" ");l(c,function(b,c){a.cssHooks[c]={set:function(b,d){var e,g,h="";if(d!=="transparent"&&(a.type(d)!=="string"||(e=n(d)))){d=f(e||d);if(!i.rgba&&d._rgba[3]!==1){g=c==="backgroundColor"?b.parentNode:b;while((h===""||h==="transparent")&&g&&g.style)try{h=a.css(g,"backgroundColor"),g=g.parentNode}catch(j){}d=d.blend(h&&h!=="transparent"?h:"_default")}d=d.toRgbaString()}try{b.style[c]=d}catch(j){}}},a.fx.step[c]=function(b){b.colorInit||(b.start=f(b.elem,c),b.end=f(b.end),b.colorInit=!0),a.cssHooks[c].set(b.elem,b.start.transition(b.end,b.pos))}})},f.hook(c),a.cssHooks.borderColor={expand:function(a){var b={};return l(["Top","Right","Bottom","Left"],function(c,d){b["border"+d+"Color"]=a}),b}},k=a.Color.names={aqua:"#00ffff",black:"#000000",blue:"#0000ff",fuchsia:"#ff00ff",gray:"#808080",green:"#008000",lime:"#00ff00",maroon:"#800000",navy:"#000080",olive:"#808000",purple:"#800080",red:"#ff0000",silver:"#c0c0c0",teal:"#008080",white:"#ffffff",yellow:"#ffff00",transparent:[null,null,null,0],_default:"#ffffff"}})(jQuery);

/**
 * jQuery.Preload
 * https://github.com/htmlhero/jQuery.preload
 *
 * Created by Andrew Motoshin
 * http://htmlhero.ru
 *
 * Version: 1.5.0
 * Requires: jQuery 1.6+
 *
 */

!function(a){a.preload=function(){var b=[],c=function(a){for(var c=0;c<b.length;c++)if(b[c].src===a.src)return b[c];return b.push(a),a},d=function(a,b,c){"function"==typeof b&&b.call(a,c)};return function(b,e,f){if("undefined"!=typeof b){"string"==typeof b&&(b=[b]),2===arguments.length&&"function"==typeof e&&(f=e,e=0);var g,h=b.length;if(e>0&&h>e&&(g=b.slice(e,h),b=b.slice(0,e),h=b.length),!h)return d(b,f,!0),void 0;for(var i,j=arguments.callee,k=0,l=function(){k++,k===h&&(d(b,f,!g),j(g,e,f))},m=0;m<b.length;m++)i=new Image,i.src=b[m],i=c(i),i.complete?l():a(i).on("load error",l)}}}();var b=function(b,c){var d,e,f,g,h,i=[],j=new RegExp("url\\(['\"]?([^\"')]*)['\"]?\\)","i");return c.recursive&&(b=b.find("*").add(b)),b.each(function(){for(d=a(this),e=d.css("background-image")+","+d.css("border-image-source"),e=e.split(","),h=0;h<e.length;h++)f=e[h],-1===f.indexOf("about:blank")&&-1===f.indexOf("data:image")&&(g=j.exec(f),g&&i.push(g[1]));"IMG"===this.nodeName&&i.push(this.src)}),i};a.fn.preload=function(){var c,d;1===arguments.length?"object"==typeof arguments[0]?c=arguments[0]:d=arguments[0]:arguments.length>1&&(c=arguments[0],d=arguments[1]),c=a.extend({recursive:!0,part:0},c);var e=this,f=b(e,c);return a.preload(f,c.part,function(a){a&&"function"==typeof d&&d.call(e.get())}),this}}(jQuery);

/*
 * Author: Alex Gibson
 * https://github.com/alexgibson/shake.js
 * License: MIT license
 */

(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return factory(global, global.document);
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(global, global.document);
    } else {
        global.Shake = factory(global, global.document);
    }
} (typeof window !== 'undefined' ? window : this, function (window, document) {

    'use strict';

    function Shake(options) {
        //feature detect
        this.hasDeviceMotion = 'ondevicemotion' in window;

        this.options = {
            threshold: 15, //default velocity threshold for shake to register
            timeout: 1000 //default interval between events
        };

        if (typeof options === 'object') {
            for (var i in options) {
                if (options.hasOwnProperty(i)) {
                    this.options[i] = options[i];
                }
            }
        }

        //use date to prevent multiple shakes firing
        this.lastTime = new Date();

        //accelerometer values
        this.lastX = null;
        this.lastY = null;
        this.lastZ = null;

        //create custom event
        if (typeof document.CustomEvent === 'function') {
            this.event = new document.CustomEvent('shake', {
                bubbles: true,
                cancelable: true
            });
        } else if (typeof document.createEvent === 'function') {
            this.event = document.createEvent('Event');
            this.event.initEvent('shake', true, true);
        } else {
            return false;
        }
    }

    //reset timer values
    Shake.prototype.reset = function () {
        this.lastTime = new Date();
        this.lastX = null;
        this.lastY = null;
        this.lastZ = null;
    };

    //start listening for devicemotion
    Shake.prototype.start = function () {
        this.reset();
        if (this.hasDeviceMotion) {
            window.addEventListener('devicemotion', this, false);
        }
    };

    //stop listening for devicemotion
    Shake.prototype.stop = function () {
        if (this.hasDeviceMotion) {
            window.removeEventListener('devicemotion', this, false);
        }
        this.reset();
    };

    //calculates if shake did occur
    Shake.prototype.devicemotion = function (e) {
        var current = e.accelerationIncludingGravity;
        var currentTime;
        var timeDifference;
        var deltaX = 0;
        var deltaY = 0;
        var deltaZ = 0;

        if ((this.lastX === null) && (this.lastY === null) && (this.lastZ === null)) {
            this.lastX = current.x;
            this.lastY = current.y;
            this.lastZ = current.z;
            return;
        }

        deltaX = Math.abs(this.lastX - current.x);
        deltaY = Math.abs(this.lastY - current.y);
        deltaZ = Math.abs(this.lastZ - current.z);

        if (((deltaX > this.options.threshold) && (deltaY > this.options.threshold)) || ((deltaX > this.options.threshold) && (deltaZ > this.options.threshold)) || ((deltaY > this.options.threshold) && (deltaZ > this.options.threshold))) {
            //calculate time in milliseconds since last shake registered
            currentTime = new Date();
            timeDifference = currentTime.getTime() - this.lastTime.getTime();

            if (timeDifference > this.options.timeout) {
                window.dispatchEvent(this.event);
                this.lastTime = new Date();
            }
        }

        this.lastX = current.x;
        this.lastY = current.y;
        this.lastZ = current.z;

    };

    //event handler
    Shake.prototype.handleEvent = function (e) {
        if (typeof (this[e.type]) === 'function') {
            return this[e.type](e);
        }
    };

    return Shake;
}));


