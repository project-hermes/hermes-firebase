'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

window.hermesApp = window.hermesApp || {};

/**
                                            * Handles the user auth flows and updating the UI depending on the auth state.
                                            */
hermesApp.Auth = function () {_createClass(_class, [{ key: 'waitForAuth',

    /**
                                                                           * Returns a Promise that completes when auth is ready.
                                                                           * @return Promise
                                                                           */get: function get()
    {
      return this._waitForAuthPromiseResolver.promise();
    }

    /**
       * Initializes Friendly Pix's auth.
       * Binds the auth related UI components and handles the auth flow.
       * @constructor
       */ }]);
  function _class() {var _this = this;_classCallCheck(this, _class);
    // Firebase SDK
    this.database = firebase.database();
    this.auth = firebase.auth();
    this._waitForAuthPromiseResolver = new $.Deferred();

    $(document).ready(function () {
      // Pointers to DOM Elements
      var signedInUserContainer = $('.hm-signed-in-user-container');
      _this.signedInUserAvatar = $('.hm-avatar', signedInUserContainer);
      _this.signedInUsername = $('.hm-username', signedInUserContainer);
      _this.signOutButton = $('.hm-sign-out');
      _this.deleteAccountButton = $('.hm-delete-account');
      _this.usernameLink = $('.hm-usernamelink');
      _this.updateAll = $('.hm-update-all');

      // Event bindings
      _this.signOutButton.click(function () {return _this.auth.signOut();});
      _this.deleteAccountButton.click(function () {return _this.deleteAccount();});
      _this.updateAll.click(function () {return _this.updateAllAccounts();});
    });

    this.auth.onAuthStateChanged(function (user) {return _this.onAuthStateChanged(user);});
  }

  /**
     * Displays the signed-in user information in the UI or hides it and displays the
     * "Sign-In" button if the user isn't signed-in.
     */_createClass(_class, [{ key: 'onAuthStateChanged', value: function onAuthStateChanged(
    user) {var _this2 = this;
      if (window.hermesApp.router) {
        window.hermesApp.router.reloadPage();
      }
      this._waitForAuthPromiseResolver.resolve();
      $(document).ready(function () {
        document.body.classList.remove('hm-auth-state-unknown');
        if (!user) {
          _this2.userId = null;
          _this2.signedInUserAvatar.css('background-image', '');
          firebaseUi.start('#firebaseui-auth-container', uiConfig);
          document.body.classList.remove('hm-signed-in');
          document.body.classList.add('hm-signed-out');
        } else {
          document.body.classList.remove('hm-signed-out');
          document.body.classList.add('hm-signed-in');
          _this2.userId = user.uid;
          _this2.signedInUserAvatar.css('background-image', 'url("' + (
          user.photoURL || '/images/silhouette.jpg') + '")');
          _this2.signedInUsername.text(user.displayName || 'Anonymous');
          _this2.usernameLink.attr('href', '/user/' + user.uid);
          hermesApp.firebase.saveUserData(user.photoURL, user.displayName);
        }
      });
    } }, { key: 'deleteAccount', value: function deleteAccount()

    {var _this3 = this;
      this.auth.currentUser.delete().then(function () {
        window.alert('Account deleted');
      }).catch(function (error) {
        if (error.code === 'auth/requires-recent-login') {
          window.alert(
          'You need to have recently signed-in to delete your account.\n' +
          'Please sign-in and try again.');
          _this3.auth.signOut();
        }
      });
    } }, { key: 'updateAllAccounts', value: function updateAllAccounts()

    {
      var updateAllProfiles = firebase.functions().httpsCallable('updateAllProfiles');
      updateAllProfiles().then(function () {
        window.alert('Profiles update Finished successfully.');
      }).catch(function (error) {
        console.error('Error updating user profiles.', error);
        window.alert('Error updating user profiles: ' + error.message);
      });
    } }]);return _class;}();


hermesApp.auth = new hermesApp.Auth();
//# sourceMappingURL=auth.js.map