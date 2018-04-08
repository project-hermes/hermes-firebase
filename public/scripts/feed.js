'use strict';

window.hermesApp = window.hermesApp || {};

/**
 * Handles the Home and Feed UI.
 */
hermesApp.Feed = class {

  /**
   * Initializes the Friendly Pix feeds.
   * @constructor
   */
  constructor() {
    // List of all dives on the page.
    this.dives = [];
    // Map of dives that can be displayed.
    this.newDives = {};

    // Firebase SDK.
    this.auth = firebase.auth();

    $(document).ready(() => {
      // Pointers to DOM elements.
      this.pageFeed = $('#page-feed');
      this.feedImageContainer = $('.hm-image-container', this.pageFeed);
      this.noDivesMessage = $('.hm-no-dives', this.pageFeed);
      this.nextPageButton = $('.hm-next-page-button button');
      this.newDivesButton = $('.hm-new-dives-button button');

      // Event bindings.
      this.newDivesButton.click(() => this.showNewDives());
    });
  }

  /**
   * Appends the given list of `dives`.
   */
  addDives(dives) {
    // Displays the list of dives
    const diveIds = Object.keys(dives);
    for (let i = diveIds.length - 1; i >= 0; i--) {
      this.noDivesMessage.hide();
      const diveData = dives[diveIds[i]];
      const dive = new hermesApp.Dive(diveIds[i]);
      this.dives.push(dive);
      const diveElement = dive.diveElement;
      // If a dive with similar ID is already in the feed we replace it instead of appending.
      const existingDiveElement = $(`.hm-dive-${diveIds[i]}`, this.feedImageContainer);
      if (existingDiveElement.length) {
        existingDiveElement.replaceWith(diveElement);
      } else {
        this.feedImageContainer.append(diveElement.addClass(`hm-dive-${diveIds[i]}`));
      }
      dive.fillDiveData(diveIds[i], diveData.thumb_url || diveData.url,
        diveData.text, diveData.author, diveData.timestamp, diveData.thumb_storage_uri,
        diveData.full_storage_uri, diveData.full_url);
    }
  }

  /**
   * Shows the "load next page" button and binds it the `nextPage` callback. If `nextPage` is `null`
   * then the button is hidden.
   */
  toggleNextPageButton(nextPage) {
    this.nextPageButton.unbind('click');
    if (nextPage) {
      const loadMoreDives = () => {
        this.nextPageButton.prop('disabled', true);
        console.log('Loading next page of dives.');
        nextPage().then(data => {
          this.addDives(data.entries);
          this.toggleNextPageButton(data.nextPage);
        });
      };
      this.nextPageButton.show();
      // Enable infinite Scroll.
      hermesApp.MaterialUtils.onEndScroll(100).then(loadMoreDives);
      this.nextPageButton.prop('disabled', false);
      this.nextPageButton.click(loadMoreDives);
    } else {
      this.nextPageButton.hide();
    }
  }

  /**
   * Prepends the list of new dives stored in `this.newDives`. This happens when the user clicks on
   * the "Show new dives" button.
   */
  showNewDives() {
    const newDives = this.newDives;
    this.newDives = {};
    this.newDivesButton.hide();
    const diveKeys = Object.keys(newDives);

    for (let i = 0; i < diveKeys.length; i++) {
      this.noDivesMessage.hide();
      const dive = newDives[diveKeys[i]];
      const diveElement = new hermesApp.Dive(diveKeys[i]);
      this.dives.push(diveElement);
      this.feedImageContainer.prepend(diveElement.diveElement);
      diveElement.fillDiveData(diveKeys[i], dive.thumb_url ||
          dive.url, dive.text, dive.author, dive.timestamp, null, null, dive.full_url);
    }
  }

  /**
   * Displays the general dives feed.
   */
  showGeneralFeed() {
    // Clear previously displayed dives if any.
    this.clear();

    // Load initial batch of dives.
    hermesApp.firebase.getDives().then(data => {
      // Listen for new dives.
      const latestDiveId = Object.keys(data.entries)[Object.keys(data.entries).length - 1];
      hermesApp.firebase.subscribeToGeneralFeed(
          (diveId, diveValue) => this.addNewDive(diveId, diveValue), latestDiveId);

      // Adds fetched dives and next page button if necessary.
      this.addDives(data.entries);
      this.toggleNextPageButton(data.nextPage);
    });

    // Listen for dives deletions.
    hermesApp.firebase.registerForDivesDeletion(diveId => this.onDiveDeleted(diveId));
  }

  /**
   * Shows the feed showing all followed users.
   */
  showHomeFeed() {
    // Clear previously displayed dives if any.
    this.clear();

    if (this.auth.currentUser) {
      // Make sure the home feed is updated with followed users's new dives.
      hermesApp.firebase.updateHomeFeeds().then(() => {
        // Load initial batch of dives.
        hermesApp.firebase.getHomeFeedDives().then(data => {
          const diveIds = Object.keys(data.entries);
          if (diveIds.length === 0) {
            this.noDivesMessage.fadeIn();
          }
          // Listen for new dives.
          const latestDiveId = diveIds[diveIds.length - 1];
          hermesApp.firebase.subscribeToHomeFeed(
              (diveId, diveValue) => {
                this.addNewDive(diveId, diveValue);
              }, latestDiveId);

          // Adds fetched dives and next page button if necessary.
          this.addDives(data.entries);
          this.toggleNextPageButton(data.nextPage);
        });

        // Add new dives from followers live.
        hermesApp.firebase.startHomeFeedLiveUpdaters();

        // Listen for dives deletions.
        hermesApp.firebase.registerForDivesDeletion(diveId => this.onDiveDeleted(diveId));
      });
    }
  }

  /**
   * Triggered when a dive has been deleted.
   */
  onDiveDeleted(diveId) {
    // Potentially remove dive from in-memory new dive list.
    if (this.newDives[diveId]) {
      delete this.newDives[diveId];
      const nbNewDives = Object.keys(this.newDives).length;
      this.newDivesButton.text(`Display ${nbNewDives} new dives`);
      if (nbNewDives === 0) {
        this.newDivesButton.hide();
      }
    }

    // Potentially delete from the UI.
    $(`.hm-dive-${diveId}`, this.pageFeed).remove();
  }

  /**
   * Adds a new dive to display in the queue.
   */
  addNewDive(diveId, diveValue) {
    this.newDives[diveId] = diveValue;
    this.newDivesButton.text(`Display ${Object.keys(this.newDives).length} new dives`);
    this.newDivesButton.show();
  }

  /**
   * Clears the UI.
   */
  clear() {
    // Delete the existing dives if any.
    $('.hm-dive', this.feedImageContainer).remove();

    // Hides the "next page" and "new dives" buttons.
    this.nextPageButton.hide();
    this.newDivesButton.hide();

    // Remove any click listener on the next page button.
    this.nextPageButton.unbind('click');

    // Stops then infinite scrolling listeners.
    hermesApp.MaterialUtils.stopOnEndScrolls();

    // Clears the list of upcoming dives to display.
    this.newDives = {};

    // Displays the help message for empty feeds.
    this.noDivesMessage.hide();

    // Remove Firebase listeners.
    hermesApp.firebase.cancelAllSubscriptions();

    // Stops all timers if any.
    this.dives.forEach(dive => dive.clear());
    this.dives = [];
  }
};

hermesApp.feed = new hermesApp.Feed();
