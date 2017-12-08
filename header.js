header = function() {

  var namespace = 'header';

  var $win = $(window);
  var $doc = $(document);
  var $body = $('body');
  var $hdr = $('.hdr-global');
  var $hdrBot;
  var $hdrBotInner;
  var $navMain = $hdr.find('.nav-main');
  var $btnsSearch = $hdr.find('.btn-hdr-search');

  var screenSize = null;
  var screenSmallToInit = true;
  var screenLargeToInit = true;

  var searchActive = false;

  var $btnNavMain;
  var smallScreenMenuActive = false;
  var $activePane = null;
  var winPos = 0;

  var toNavEnter;
  var toNavLeave;
  var navHoverActive = false;
  var navHoverOpen = false;
  var $navItemActive = null;

  var $stickyNav;
  var stickyNavVisible = false;
  var stickyNavActive = false;
  var stickyNavOpenPos = 0;


  //accessibility state toggle
  var btnToggle = function ($btn, expanded) {
    if (expanded) {
      $btn.attr('aria-expanded', 'true').find('span').text('Hide');
    } else {
      $btn.attr('aria-expanded', 'false').find('span').text('Display');
    }
  };

  // close search
  var searchClose = function () {
    $hdr.removeClass('search-open');
    btnToggle($btnsSearch, false);
    searchActive = false;
  }

  //search display
  var searchBtnEvent = function () {
    $btnsSearch.on('click', function () {
      if (searchActive) {
        searchClose();
      }
      else {
        if (smallScreenMenuActive) {
          smallScreenMenuReset();
        }
        btnToggle($btnsSearch, true);
        $hdr.addClass('search-open');
        $('#hdr-search').focus();
        searchActive = true;
      }
    });
  };

  //DOM manipulation for small screen navigation
  /*clone 2nd level nav items and make them siblings of the nav for slide transition
  link top level buttons to new cloned nav items (panes) via data
  insert new button into pane for clicking back to top level*/
  var mobileMenuSetUp = function () {
    $hdrBot = $hdr.find('div.hdr-global-bottom');
    $hdrBotInner = $hdrBot.find('div.hdr-global-bottom-inner');
    $navMain.find('> ul > li').each(function (i) {
      var $li = $(this);
      var $pane = $('<nav class="pane"></nav>');
      var $paneTopLevel = $('<div class="pane-top-level"></div>');
      $paneTopLevel.append('<button type="button">Back to top level menu</button>');
      $li.find('> a').clone().appendTo($paneTopLevel);
      $paneTopLevel.appendTo($pane);
      $li.find('.inner > ul').clone().appendTo($pane);
      $pane.data('pane', i ).appendTo($hdrBot);
      $li.find('.btn-submenu').data('pane', i );
    });
    $hdr.on('click', '.pane-top-level button', function () {
      var $thisPane = $(this).closest('.pane');
      $hdrBotInner.scrollTop(0);
      $hdrBot.removeClass('slide');
      $hdrBotInner[0].inert = false;
      $thisPane[0].inert = true;
      $hdr.find('.btn-submenu').filter(function () {
        return $(this).data('pane') == $thisPane.data('pane');
      }).focus();
    });
  };

  //hamburger
  var navBtnEvent = function () {
    $btnNavMain = $hdr.find('.btn-nav-main');
    $btnNavMain.on('click', function () {
      if (smallScreenMenuActive) {
        smallScreenMenuReset();
      } else {
        if (searchActive) {
          searchClose();
        }
        $body.addClass('menu-open');
        $hdrBotInner.scrollTop(0);
        winPos = $win.scrollTop();
        btnToggle($btnNavMain, true);
        $hdr.siblings().each(function () {
          $(this)[0].inert = true;
        });

        // escape key close
        $doc.on('keyup.' + namespace, function (e) {
          if (e.keyCode === 27) {
            if (smallScreenMenuActive) {
              smallScreenMenuReset();
              $btnNavMain.focus();
            }
          }
        });
        smallScreenMenuActive = true;
      }
    });
  };

  // close and reset small screen navigation
  var smallScreenMenuReset = function () {
    $win.scrollTop(winPos);
    $body.removeClass('menu-open');
    btnToggle($btnNavMain, false);

    $hdr.siblings().each(function () {
      $(this)[0].inert = false;
    });

    $doc.off('keyup.' + namespace);
    $hdrBot.removeClass('slide');

    if ($activePane !== null) {
      $activePane.removeClass('is-active');
      $activePane[0].inert = false;
      $activePane = null;
    }

    $hdrBotInner[0].inert = false;
    smallScreenMenuActive = false;
  };

  //small screen main nav top level button events
  btnSubmenuSmallScreenEvent = function () {
    $navMain.on('click.smallscreen', '.btn-submenu', function () {
      var $btn = $(this);
      var $thisPane = $hdr.find('.pane').filter(function () {
        return $(this).data('pane') == $btn.data('pane');
      });

      $thisPane.find('> ul').scrollTop(0);

      if ($activePane !== null) {
        $activePane.removeClass('is-active');
      }

      $activePane = $thisPane;
      $activePane.addClass('is-active');
      $hdrBot.addClass('slide');
      $activePane[0].inert = false;
      $hdrBotInner[0].inert = true;
      $activePane.find('.pane-top-level button').focus();
    });
  }

  var dropdownOpen = function () {
    $navItemActive.addClass('is-open').find('.submenu').stop().slideDown('normal', function() {
      $(this).addClass('fully-open');
    });
  };

  var dropdownClose = function () {
    if ($navItemActive !== null) {
      $navItemActive.removeClass('is-open');
      $navItemActive.find('.submenu').removeClass('fully-open').stop().slideUp('fast');
    }
  };

  var dropdownReset = function () {
    if (Modernizr.touchevents) {
      $doc.off('.' + namespace);
    } else {
      clearTimeout(toNavEnter);
      clearTimeout(toNavLeave);
      navHoverActive = false;
      navHoverOpen = false;
    }

    $navItemActive = null;
    $navMain.find('.submenu').removeClass('fully-open').removeAttr('style');
    $navMain.find('.is-open').removeClass('is-open');
  };

  //large screen hover event binding
  var bindHoverEvents = function () {

    $navMain.on('mouseenter.largescreen', function () {
      clearTimeout(toNavLeave);
      toNavEnter = window.setTimeout(function () {
        navHoverActive = true;
        if (!navHoverOpen && $navItemActive !== null) {
          dropdownOpen();
          navHoverOpen = true;
        }
      }, 200);
    });

    $navMain.on('mouseleave.largescreen', function () {
      clearTimeout(toNavEnter);
      if (navHoverOpen) {
        toNavLeave = window.setTimeout(function () {
          dropdownClose();
          $navItemActive = null;
          navHoverOpen = false;
          navHoverActive = false;
        }, 500);
      }
      else {
        $navItemActive = null;
      }
    });

    $navMain.on('mouseenter.largescreen', '> ul > li', function () {
      var $li = $(this);
      if ($navItemActive !== null && !$li.hasClass('is-open')) {
        dropdownClose();
      }
      $navItemActive = $li;
      if (navHoverActive && !$li.hasClass('is-open')) {
        dropdownOpen();
        navHoverOpen = true;
      }
    });

  };

  //large screen touch event binding
  var bindTouchEvents = function () {
    $navMain.on('click.largescreen touchstart.largescreen', '> ul > li > a', function (e) {
      e.stopPropagation();
      var $li = $(this).parent('li');
      if (!$li.hasClass('is-open')) {
        e.preventDefault();

        if (searchActive) {
          searchClose();
        }

        if ($navItemActive == null) {
          $doc.on('click.' + namespace + ' touchstart.' + namespace, function () {
            dropdownClose();
            $navItemActive = null;
            $doc.off('.' + namespace);
          });
        } else {
          dropdownClose();
        }

        $navItemActive = $li;
        dropdownOpen();
      }
    });
  };

  //large screen keyboard event binding
  var bindKeyboardEvents = function () {
    $navMain.on('click.largescreen', '.btn-submenu', function () {
      var $btn = $(this);
      var $li = $btn.parent('li');
      if ($li.hasClass('is-open')) {
        dropdownClose();
        $navItemActive = null;
        btnToggle($btn, false);
      } else {
        dropdownClose();
        $navItemActive = $li;
        dropdownOpen();
        btnToggle($btn, true);
      }
    });
  };

  //scroll event for sticky nav display
  var stickyNavScroll = function () {
    var main = $('#main')[0];
    var hdrOff = $hdr.innerHeight() * -1;
    var stickyNavOff = $stickyNav.css('top');
    var posPrevious = null;
    var posCurrent = 0;
    var movement = 150; // distance to scroll down to close header

    $win.on('scroll.' + namespace, function () {

      //offset of main element
      var rect = main.getBoundingClientRect();

      // if top of main is offscreen, display sticky nav
      if (rect.top < 0  && !stickyNavVisible) {
        $body.addClass('sticky-nav-stick');
        $stickyNav.show().animate({
          top: 0
        }, 'fast', function() {
          $hdr.hide();
        });
        dropdownReset();
        searchClose();
        $hdr.css('top', hdrOff);
        stickyNavVisible = true;
      }

      // if top of main is visible, hide sticky nav
      else if (rect.top > 0  && stickyNavVisible) {
        $body.removeClass('sticky-nav-stick');
        $stickyNav.animate({
          top: stickyNavOff
        }, 'fast', function() {
           $stickyNav.hide();
        });
        $hdr.removeAttr('style');
        dropdownReset();
        stickyNavVisible = false;
        stickyNavActive = false;
      }

      // is sticky nav active (header visible)
      if (stickyNavActive) {
        posCurrent = $win.scrollTop();
        if (posPrevious !== null && posPrevious > posCurrent) {
          /* page has scrolled up
          update the window position when sticky nav was activated to current position */
          stickyNavOpenPos = posCurrent;
        }
        else {
          /* page has scrolled down
          check to see if page has scrolled more than threshold (movement)
          if so, hide the header */
          if (posPrevious !== null && (posCurrent - stickyNavOpenPos) >= movement) {
            stickyNavActive = false;
            dropdownReset();
            searchClose();
            $stickyNav.show();
            $hdr.animate({
              top: hdrOff
            }, 'fast', function() {
              $hdr.hide();
            });
            posPrevious = null;
          }
        }
        posPrevious = posCurrent;
      }
    });
  };

  //sticky nav hamburger
  var stickyNavBtnEvent = function () {
    $stickyNav.find('.btn-hdr').on('click', function () {
      stickyNavOpenPos = $win.scrollTop();
      stickyNavActive = true;
      $hdr.show().animate({
        top: 0
      }, 'fast', function() {
        $stickyNav.hide();
      });
    });
  };

  init = function () {

    searchBtnEvent();

    $.fsMediaquery('bind', 'mq-' + namespace, '(max-width: 959px)', {
      enter: function () {
        screenSmall = true;

        //resized from large screen
        if (screenSize === 'large') {
          $navMain.off('.largescreen');
          dropdownReset();
          $win.off('scroll.' + namespace);
          $body.removeClass('sticky-nav-stick');
          $hdr.removeAttr('style');
          $stickyNav.removeAttr('style');
          stickyNavVisible = false;
          stickyNavActive = false;
        }

        screenSize = 'small';

        // only do once
        if (screenSmallToInit) {
          mobileMenuSetUp();
          navBtnEvent();
          screenSmallToInit = false;
        }

        // do every time
        btnSubmenuSmallScreenEvent();
      },

      leave: function () {

        //resized from small screen
        if (screenSize === 'small') {
          $navMain.off('click.smallscreen');

          if (smallScreenMenuActive) {
            smallScreenMenuReset();
          }
        }

        screenSize = 'large';

        // only do once
        if (screenLargeToInit) {
          $stickyNav = $('.sticky-nav');
          stickyNavBtnEvent();
          screenLargeToInit = false;
        }

        // do every time
        if (Modernizr.touchevents) {
          bindTouchEvents();
        } else {
          bindHoverEvents();
          bindKeyboardEvents();
        }

        stickyNavScroll();
      }
    });
  };

  self.init();

}(jQuery);
