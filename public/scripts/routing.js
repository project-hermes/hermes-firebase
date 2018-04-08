'use strict';

window.hermesApp = window.hermesApp || {};

/**
 * Handles the pages/routing.
 */
hermesApp.Router = class {

  /**
   * Initializes controller/router.
   * @constructor
   */
  constructor() {
    $(document).ready(() => {
      // Dom elements.
      this.pagesElements = $('[id^=page-]');
      this.splashLogin = $('#login', '#page-splash');

      // Make sure /add is never opened on website load.
      if (window.location.pathname === '/add') {
        page('/');
      }

      // Configuring routes.
      const pipe = hermesApp.Router.pipe;
      const displayPage = this.displayPage.bind(this);
      const loadUser = userId => hermesApp.userPage.loadUser(userId);
      const showHomeFeed = () => hermesApp.feed.showHomeFeed();
      const showGeneralFeed = () => hermesApp.feed.showGeneralFeed();
      const clearFeed = () => hermesApp.feed.clear();
      const showDive = diveId => hermesApp.dive.loadDive(diveId);

      page('/', pipe(showHomeFeed, null, true),
          pipe(displayPage, {pageId: 'feed', onlyAuthed: true}));
      page('/feed', pipe(showGeneralFeed, null, true), pipe(displayPage, {pageId: 'feed'}));
      page('/dive/:diveId', pipe(showDive, null, true), pipe(displayPage, {pageId: 'dive'}));
      page('/dive/:diveId/admin', pipe(showDive, null, true), pipe(displayPage, {pageId: 'dive', admin: true}));
      page('/user/:userId', pipe(loadUser, null, true), pipe(displayPage, {pageId: 'user-info'}));
      page('/about', pipe(clearFeed, null, true), pipe(displayPage, {pageId: 'about'}));
      page('/help', pipe(clearFeed, null, true), pipe(displayPage, {pageId: 'help'}));
      page('/add', pipe(displayPage, {pageId: 'add', onlyAuthed: true}));
      page('*', () => page('/'));

      // Start routing.
      page();
    });
  }

  /**
   * Returns a function that displays the given page and hides the other ones.
   * if `onlyAuthed` is set to true then the splash page will be displayed instead of the page if
   * the user is not signed-in.
   */
  displayPage(attributes, context) {
    const onlyAuthed = attributes.onlyAuthed;
    const admin = attributes.admin;
    if (admin) {
      hermesApp.Router.enableAdminMode();
    } else {
      hermesApp.Router.disableAdminMode();
    }

    if (onlyAuthed) {
      // If the pge can only be displayed if the user is authenticated then we wait or the auth state.
      hermesApp.auth.waitForAuth.then(() => {
        this._displayPage(attributes, context);
      });
    } else {
      this._displayPage(attributes, context);
    }
  }

  _displayPage(attributes, context) {
    const onlyAuthed = attributes.onlyAuthed;
    let pageId = attributes.pageId;

    if (onlyAuthed && !firebase.auth().currentUser) {
      pageId = 'splash';
      this.splashLogin.show();
    }
    hermesApp.Router.setLinkAsActive(context.canonicalPath);
    this.pagesElements.each(function(index, element) {
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
   */
  reloadPage() {
    let path = window.location.pathname;
    if (path === '') {
      path = '/';
    }
    page(path);
  }

  /**
   * Turn the UI into admin mode.
   */
  static enableAdminMode() {
    document.body.classList.add('hm-admin');
  }

  /**
   * Switch off admin mode in the UI.
   */
  static disableAdminMode() {
    document.body.classList.remove('hm-admin');
  }

  /**
   * Scrolls the page to top.
   */
  static scrollToTop() {
    $('html,body').animate({scrollTop: 0}, 0);
  }

  /**
   * Pipes the given function and passes the given attribute and Page.js context.
   * Set 'optContinue' to true if there are further functions to call.
   */
  static pipe(funct, attribute, optContinue) {
    return (context, next) => {
      if (funct) {
        const params = Object.keys(context.params);
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
   */
  static setLinkAsActive(canonicalPath) {
    if (canonicalPath === '') {
      canonicalPath = '/';
    }
    $('.is-active').removeClass('is-active');
    $(`[href="${canonicalPath}"]`).addClass('is-active');
  }
};

hermesApp.router = new hermesApp.Router();
