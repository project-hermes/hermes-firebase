'use strict';

window.hermesApp = window.hermesApp || {};

/**
 * Handles notifications.
 */
hermesApp.Messaging = class {

  /**
   * Inititializes the notifications utility.
   * @constructor
   */
  constructor() {
    // Firebase SDK
    this.database = firebase.database();
    this.auth = firebase.auth();
    this.storage = firebase.storage();
    this.messaging = firebase.messaging();

    $(document).ready(() => {
      // DOM Elements
      this.enableNotificationsContainer = $('.hm-notifications');
      this.enableNotificationsCheckbox = $('#notifications');
      this.enableNotificationsLabel = $('.mdl-switch__label', this.enableNotificationsContainer);

      this.toast = $('.mdl-js-snackbar');

      // Event bindings
      this.enableNotificationsCheckbox.change(() => this.onEnableNotificationsChange());
      this.auth.onAuthStateChanged(() => this.trackNotificationsEnabledStatus());
      this.messaging.onTokenRefresh(() => this.saveToken());
      this.messaging.onMessage(payload => this.onMessage(payload));
    });
  }

  /**
   * Saves the token to the database if available. If not request permissions.
   */
  saveToken() {
    this.messaging.getToken().then(currentToken => {
      if (currentToken) {
        hermesApp.firebase.saveNotificationToken(currentToken).then(() => {
          console.log('Notification Token saved to database');
        });
      } else {
        this.requestPermission();
      }
    }).catch(err => {
      console.error('Unable to get messaging token.', err);
    });
  }

  /**
   * Requests permission to send notifications on this browser.
   */
  requestPermission() {
    console.log('Requesting permission...');
    this.messaging.requestPermission().then(() => {
      console.log('Notification permission granted.');
      this.saveToken();
    }).catch(err => {
      console.error('Unable to get permission to notify.', err);
    });
  }

  /**
   * Called when the app is in focus.
   */
  onMessage(payload) {
    console.log('Notifications received.', payload);

    // If we get a notification while focus on the app
    if (payload.notification) {
      const userId = payload.notification.click_action.split('/user/')[1];

      let data = {
        message: payload.notification.body,
        actionHandler: () => page(`/user/${userId}`),
        actionText: 'Profile',
        timeout: 10000
      };
      this.toast[0].MaterialSnackbar.showSnackbar(data);
    }
  }

  /**
   * Triggered when the user changes the "Notifications Enabled" checkbox.
   */
  onEnableNotificationsChange() {
    const checked = this.enableNotificationsCheckbox.prop('checked');
    this.enableNotificationsCheckbox.prop('disabled', true);

    return hermesApp.firebase.toggleNotificationEnabled(checked);
  }

  /**
   * Starts tracking the "Notifications Enabled" checkbox status.
   */
  trackNotificationsEnabledStatus() {
    if (this.auth.currentUser) {
      hermesApp.firebase.registerToNotificationEnabledStatusUpdate(data => {
        this.enableNotificationsCheckbox.prop('checked', data.val() !== null);
        this.enableNotificationsCheckbox.prop('disabled', false);
        this.enableNotificationsLabel.text(data.val() ? 'Notifications Enabled' : 'Enable Notifications');
        hermesApp.MaterialUtils.refreshSwitchState(this.enableNotificationsContainer);

        if (data.val()) {
          this.saveToken();
        }
      });
    }
  }
};

hermesApp.messaging = new hermesApp.Messaging();
