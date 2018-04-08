'use strict';

window.hermesApp = window.hermesApp || {};

/**
 * Handles the user auth flows and updating the UI depending on the auth state.
 */
hermesApp.Auth = class {

  /**
   * Returns a Promise that completes when auth is ready.
   * @return Promise
   */
  get waitForAuth() {
    return this._waitForAuthPromiseResolver.promise();
  }

  /**
   * Initializes Friendly Pix's auth.
   * Binds the auth related UI components and handles the auth flow.
   * @constructor
   */
  constructor() {
    // Firebase SDK
    this.database = firebase.database();
    this.auth = firebase.auth();
    this._waitForAuthPromiseResolver = new $.Deferred();

    $(document).ready(() => {
      // Pointers to DOM Elements
      const signedInUserContainer = $('.hm-signed-in-user-container');
      this.signedInUserAvatar = $('.hm-avatar', signedInUserContainer);
      this.signedInUsername = $('.hm-username', signedInUserContainer);
      this.signOutButton = $('.hm-sign-out');
      this.deleteAccountButton = $('.hm-delete-account');
      this.usernameLink = $('.hm-usernamelink');
      this.updateAll = $('.hm-update-all');

      // Event bindings
      this.signOutButton.click(() => this.auth.signOut());
      this.deleteAccountButton.click(() => this.deleteAccount());
      this.updateAll.click(() => this.updateAllAccounts());
    });

    this.auth.onAuthStateChanged(user => this.onAuthStateChanged(user));
  }

  /**
   * Displays the signed-in user information in the UI or hides it and displays the
   * "Sign-In" button if the user isn't signed-in.
   */
  onAuthStateChanged(user) {
    if (window.hermesApp.router) {
      window.hermesApp.router.reloadPage();
    }
    this._waitForAuthPromiseResolver.resolve();
    $(document).ready(() => {
      document.body.classList.remove('hm-auth-state-unknown');
      if (!user) {
        this.userId = null;
        this.signedInUserAvatar.css('background-image', '');
        firebaseUi.start('#firebaseui-auth-container', uiConfig);
        document.body.classList.remove('hm-signed-in');
        document.body.classList.add('hm-signed-out');
      } else {
        document.body.classList.remove('hm-signed-out');
        document.body.classList.add('hm-signed-in');
        this.userId = user.uid;
        this.signedInUserAvatar.css('background-image',
            `url("${user.photoURL || '/images/silhouette.jpg'}")`);
        this.signedInUsername.text(user.displayName || 'Anonymous');
        this.usernameLink.attr('href', `/user/${user.uid}`);
        hermesApp.firebase.saveUserData(user.photoURL, user.displayName);
      }
    });
  }

  deleteAccount() {
    this.auth.currentUser.delete().then(() => {
      window.alert('Account deleted');
    }).catch(error => {
      if (error.code === 'auth/requires-recent-login') {
        window.alert(
          'You need to have recently signed-in to delete your account.\n' +
            'Please sign-in and try again.');
        this.auth.signOut();
      }
    });
  }

  updateAllAccounts() {
    const updateAllProfiles = firebase.functions().httpsCallable('updateAllProfiles');
    updateAllProfiles().then(() => {
      window.alert('Profiles update Finished successfully.');
    }).catch(error => {
      console.error('Error updating user profiles.', error);
      window.alert('Error updating user profiles: ' + error.message);
    });
  }
};

hermesApp.auth = new hermesApp.Auth();
