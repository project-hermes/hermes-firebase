'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

window.hermesApp = window.hermesApp || {};

/**
                                            * Handles the pages/routing.
                                            */
hermesApp.Router = function () {

  /**
                                 * Initializes controller/router.
                                 * @constructor
                                 */
  function _class() {var _this = this;_classCallCheck(this, _class);
    $(document).ready(function () {
      // Dom elements.
      _this.pagesElements = $('[id^=page-]');
      _this.splashLogin = $('#login', '#page-splash');

      // Make sure /add is never opened on website load.
      if (window.location.pathname === '/add') {
        page('/');
      }

      // Configuring routes.
      var pipe = hermesApp.Router.pipe;
      var displayPage = _this.displayPage.bind(_this);
      var loadUser = function loadUser(userId) {return hermesApp.userPage.loadUser(userId);};
      var showHomeFeed = function showHomeFeed() {return hermesApp.feed.showHomeFeed();};
      var showGeneralFeed = function showGeneralFeed() {return hermesApp.feed.showGeneralFeed();};
      var clearFeed = function clearFeed() {return hermesApp.feed.clear();};
      var showDive = function showDive(diveId) {return hermesApp.dive.loadDive(diveId);};

      page('/', pipe(showHomeFeed, null, true),
      pipe(displayPage, { pageId: 'feed', onlyAuthed: true }));
      page('/feed', pipe(showGeneralFeed, null, true), pipe(displayPage, { pageId: 'feed' }));
      page('/dive/:diveId', pipe(showDive, null, true), pipe(displayPage, { pageId: 'dive' }));
      page('/dive/:diveId/admin', pipe(showDive, null, true), pipe(displayPage, { pageId: 'dive', admin: true }));
      page('/user/:userId', pipe(loadUser, null, true), pipe(displayPage, { pageId: 'user-info' }));
      page('/about', pipe(clearFeed, null, true), pipe(displayPage, { pageId: 'about' }));
      page('/help', pipe(clearFeed, null, true), pipe(displayPage, { pageId: 'help' }));
      page('/add', pipe(displayPage, { pageId: 'add', onlyAuthed: true }));
      page('*', function () {return page('/');});

      // Start routing.
      page();
    });
  }

  /**
     * Returns a function that displays the given page and hides the other ones.
     * if `onlyAuthed` is set to true then the splash page will be displayed instead of the page if
     * the user is not signed-in.
     */_createClass(_class, [{ key: 'displayPage', value: function displayPage(
    attributes, context) {var _this2 = this;
      var onlyAuthed = attributes.onlyAuthed;
      var admin = attributes.admin;
      if (admin) {
        hermesApp.Router.enableAdminMode();
      } else {
        hermesApp.Router.disableAdminMode();
      }

      if (onlyAuthed) {
        // If the pge can only be displayed if the user is authenticated then we wait or the auth state.
        hermesApp.auth.waitForAuth.then(function () {
          _this2._displayPage(attributes, context);
        });
      } else {
        this._displayPage(attributes, context);
      }
    } }, { key: '_displayPage', value: function _displayPage(

    attributes, context) {
      var onlyAuthed = attributes.onlyAuthed;
      var pageId = attributes.pageId;

      if (onlyAuthed && !firebase.auth().currentUser) {
        pageId = 'splash';
        this.splashLogin.show();
      }
      hermesApp.Router.setLinkAsActive(context.canonicalPath);
      this.pagesElements.each(function (index, element) {
        if (element.id === 'page-' + pageId) {
          $(element).show();
        } else if (element.id === 'page-splash' && onlyAuthed) {
          $(element).fadeOut(1000);
        } else {
          $(element).hide();
        }
      });
      hermesApp.MaterialUtils.closeDrawer();
      hermesApp.Router.scrollToTop();
    }

    /**
       * Reloads the current page.
       */ }, { key: 'reloadPage', value: function reloadPage()
    {
      var path = window.location.pathname;
      if (path === '') {
        path = '/';
      }
      page(path);
    }

    /**
       * Turn the UI into admin mode.
       */ }], [{ key: 'enableAdminMode', value: function enableAdminMode()
    {
      document.body.classList.add('hm-admin');
    }

    /**
       * Switch off admin mode in the UI.
       */ }, { key: 'disableAdminMode', value: function disableAdminMode()
    {
      document.body.classList.remove('hm-admin');
    }

    /**
       * Scrolls the page to top.
       */ }, { key: 'scrollToTop', value: function scrollToTop()
    {
      $('html,body').animate({ scrollTop: 0 }, 0);
    }

    /**
       * Pipes the given function and passes the given attribute and Page.js context.
       * Set 'optContinue' to true if there are further functions to call.
       */ }, { key: 'pipe', value: function pipe(
    funct, attribute, optContinue) {
      return function (context, next) {
        if (funct) {
          var params = Object.keys(context.params);
          if (!attribute && params.length > 0) {
            funct(context.params[params[0]], context);
          } else {
            funct(attribute, context);
          }
        }
        if (optContinue) {
          next();
        }
      };
    }

    /**
       * Highlights the correct menu item/link.
       */ }, { key: 'setLinkAsActive', value: function setLinkAsActive(
    canonicalPath) {
      if (canonicalPath === '') {
        canonicalPath = '/';
      }
      $('.is-active').removeClass('is-active');
      $('[href="' + canonicalPath + '"]').addClass('is-active');
    } }]);return _class;}();


hermesApp.router = new hermesApp.Router();
//# sourceMappingURL=routing.js.map