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