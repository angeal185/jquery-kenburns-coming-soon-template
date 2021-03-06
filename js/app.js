"use strict";

  $(document).ready(function (){

    $(".app-background").backstretch("img/bg.jpg");
    $('.rotate').textillate({ 
      minDisplayTime: 3000,
      in: { effect: 'fadeInUp',
            shuffle: true },
      out: { effect: 'fadeOutUp',
            shuffle: true },
      loop: true
    });

    $('.grid').masonry({
      itemSelector: '.grid-item',
      gutter: 30
    });
    $('.grid-item').magnificPopup({
      type: 'image',
      mainClass: 'mfp-with-zoom',
      zoom: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out',
      }
    });


    $('nav').hover(
      function() {
      if($(window).outerWidth() >= 767) {
        $('header > .container, footer').velocity({ left: '100px' }, 150);
        $('nav').addClass('active').velocity({ width: '250px' }, 150);
		$('.fa-chevron-right').css('opacity','1');
      }
    }, function() {
      $('header > .container, footer').velocity({ left: '0px' }, 150);
      $('nav').removeClass('active').velocity({ width: '50px' }, 150);
	  $('.fa-chevron-right').css('opacity','0');
    });

    $('nav a').on('click', function(event) {
      var changer = $('.app-changer');
      event.preventDefault();

      var slide = $(this).attr('href');
      var activeSlide = $('.app-changer > .active');

      if(!changer.hasClass('animating') && !$(slide).is($(activeSlide))) {
        $(changer).addClass('animating');
        $(this).addClass('active').siblings().removeClass('active');

        $(activeSlide).velocity({
          opacity: 0,
          left: '30px'
        }, 350, 'easeInQuint', function() {
          $(slide).css({ opacity: '0', left: '-30px' }).addClass('active').siblings().removeClass('active');
          if(slide == '#gallery') { $('.grid').masonry('layout'); }
          $(slide).velocity({
            opacity: 1,
            left: '0px'
          }, 350, 'easeOutQuint', function() {
            $(changer).removeClass('animating');
          });
        });

      }

    });
      
    $(window).on('beforeunload', function() {
      $(this).scrollTop(0);
    });

    $(window).load(function() {

      $('header').css({ height: 'auto' }).delay(1200).velocity({
        top: 0
      }, 1000, 'easeInOutQuint',
        function() {
          $('.app-background').css({ position: 'fixed' });
      })
      
      $('footer').css({ bottom: '-100px' }).delay(1600).velocity({
        bottom: 0
      }, 1000, 'easeInOutQuint',
        function() {
          $(this).css({ bottom: 'auto' });
          $('body').css({ overflowY: 'auto' });
      })
      
      $('nav').delay(2200).velocity({
        left: 0
      }, 1500, 'easeInOutQuint')

      var filler = $('.app-progress-bar .filler');
      var fillerWidth = filler.width() / filler.parent().width() * 100;
      filler.css({ width: '0%' }).delay(1800).animate({
        width: fillerWidth + '%'
      }, 3000, 'easeInOutQuint');

    });

  });
  
  ;(function ( $, window, document, undefined ) {
    var pluginName = 'kenburns',
        defaults = {
          fullscreen: false,
          duration: 9000,
          fadeInDuration: 1500,
          height: null
        };

    var _transitions = {
        zoomOut: function (slide, duration) {
          $(slide)
            .velocity({
              rotateZ: '3deg',
              scale: '1.1'
            }, 0)
            .velocity({
              translateZ: 0,
              rotateZ: '0deg',
              scale: '1'
            }, duration);
        },
        zoomIn: function (slide, duration) {
          $(slide)
            .velocity({
              rotateZ: '0deg',
              scale: '1'
            }, 0)
            .velocity({
              translateZ: 0,
              rotateZ: '3deg',
              scale: '1.1'
            }, duration);
        }
      };

    var $preloadImage = function (url) {
      var loader = function (deferred) {
        var image = new Image();
     
        image.onload = loaded;
        image.onerror = errored;
        image.onabort = errored;
     
        image.src = url;
     
        function loaded() {
          unbindEvents();
          setTimeout(function () {
            deferred.resolve(image);
          });
        }
        function errored() {
          unbindEvents();
          deferred.rejectWith(image);
        }
        function unbindEvents() {
          image.onload = null;
          image.onerror = null;
          image.onabort = null;
        }
      };

      return $.Deferred(loader).promise();
    };

    if (!Object.keys) {
      Object.keys = function(o) {
        if (o !== Object(o)) {
          throw new TypeError('Object.keys called on a non-object');
        }
        var k = [], p;
        for (p in o) {
          if (Object.prototype.hasOwnProperty.call(o,p)) {
            k.push(p);
          }
        }
        return k;
      };
    }

    function Plugin (element, options) {
      this.el = element;
      this.$el = $(element);
      this.settings = $.extend({}, defaults, options);
      this._defaults = defaults;
      this._name = pluginName;
      this._slides = [];
      this.currentIndex = 0;
      this.init();
    }

    $.extend(Plugin.prototype, {

      init: function () {
        var settings = this.settings,
            _this = this,
            urls;

        urls = this.$el.children().map(function (index, imageElement) { return imageElement.src; });

        this.$el.addClass(function () {
          var classes = [pluginName];

          if (settings.fullscreen) { classes.push('fullscreen'); }

          return classes.join(' ');
        });

        $.when.apply($, $.map(urls, $preloadImage)).done(function() {
          var images = Array.prototype.slice.call(arguments);
          _this.buildScene(images);
        });
      },

      reveal: function (index) {
        var slide = this._slides[index],
            $el = this.$el;

        $(slide).velocity({ opacity: 0 }, 0, function () {
          $(this).appendTo($el);
        }).velocity({ opacity: 1, translateZ: 0 }, { duration: this.settings.fadeInDuration, queue: false });
      },

      animate: function (index) {
        var keys = Object.keys(_transitions),
            transition = _transitions[keys[Math.floor(keys.length * Math.random())]],
            duration = this.settings.duration,
            slide = this._slides[index];

        transition(slide, duration);
      },

      show: function (index) {
        this.reveal(index);
        this.animate(index);
      },

      next: function () {
        this.currentIndex = this.currentIndex === 0 ? this._slides.length - 1 : this.currentIndex - 1;
        this.show(this.currentIndex);
      },

      addSlides: function (images) {
        var el = this.el;

        return $.map(images.reverse(), function (url) {
          var slide = document.createElement('div');
          slide.style.backgroundImage = 'url(' + url.src + ')';
          slide.className = 'slide';

          el.appendChild(slide);

          return slide;
        });
      },

      buildScene: function (images) {
        var _this = this,
            settings = this.settings;

        this.el.innerHTML = '';

        this._slides = this.addSlides(images);

        this.currentIndex = images.length - 1;

        if (!settings.fullscreen) {
          this.el.style.height = this.settings.height || (images[this.currentIndex].height + 'px');
        }

        this.animate(this.currentIndex);
        setInterval(function () {
          _this.next();
        }, (settings.duration - settings.fadeInDuration) );
      }
    });

    $.fn[ pluginName ] = function ( options ) {
      this.each(function() {
        if ( !$.data( this, 'plugin_' + pluginName ) ) {
          $.data( this, 'plugin_' + pluginName, new Plugin( this, options ) );
        }
      });

      return this;
    };

})( jQuery, window, document );

$(document).ready(function(){
$(function() {
	$("#element").kenburns({
	  fullscreen: true
	});
  });
$('.loriem').html('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');
$('.ipsum').html('Consectetur elit.');
});