'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

window.hermesApp = window.hermesApp || {};

/**
                                            * Handles the Home and Feed UI.
                                            */
hermesApp.Feed = function () {

  /**
                               * Initializes the Friendly Pix feeds.
                               * @constructor
                               */
  function _class() {var _this = this;_classCallCheck(this, _class);
    // List of all dives on the page.
    this.dives = [];
    // Map of dives that can be displayed.
    this.newDives = {};

    // Firebase SDK.
    this.auth = firebase.auth();

    $(document).ready(function () {
      // Pointers to DOM elements.
      _this.pageFeed = $('#page-feed');
      _this.feedImageContainer = $('.hm-image-container', _this.pageFeed);
      _this.noDivesMessage = $('.hm-no-dives', _this.pageFeed);
      _this.nextPageButton = $('.hm-next-page-button button');
      _this.newDivesButton = $('.hm-new-dives-button button');

      // Event bindings.
      _this.newDivesButton.click(function () {return _this.showNewDives();});
    });
  }

  /**
     * Appends the given list of `dives`.
     */_createClass(_class, [{ key: 'addDives', value: function addDives(
    dives) {
      // Displays the list of dives
      var diveIds = Object.keys(dives);
      for (var i = diveIds.length - 1; i >= 0; i--) {
        this.noDivesMessage.hide();
        var diveData = dives[diveIds[i]];
        var dive = new hermesApp.Dive(diveIds[i]);
        this.dives.push(dive);
        var diveElement = dive.diveElement;
        // If a dive with similar ID is already in the feed we replace it instead of appending.
        var existingDiveElement = $('.hm-dive-' + diveIds[i], this.feedImageContainer);
        if (existingDiveElement.length) {
          existingDiveElement.replaceWith(diveElement);
        } else {
          this.feedImageContainer.append(diveElement.addClass('hm-dive-' + diveIds[i]));
        }
        dive.fillDiveData(diveIds[i], diveData.thumb_url || diveData.url,
        diveData.text, diveData.author, diveData.timestamp, diveData.thumb_storage_uri,
        diveData.full_storage_uri, diveData.full_url);
      }
    }

    /**
       * Shows the "load next page" button and binds it the `nextPage` callback. If `nextPage` is `null`
       * then the button is hidden.
       */ }, { key: 'toggleNextPageButton', value: function toggleNextPageButton(
    nextPage) {var _this2 = this;
      this.nextPageButton.unbind('click');
      if (nextPage) {
        var loadMoreDives = function loadMoreDives() {
          _this2.nextPageButton.prop('disabled', true);
          console.log('Loading next page of dives.');
          nextPage().then(function (data) {
            _this2.addDives(data.entries);
            _this2.toggleNextPageButton(data.nextPage);
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
       */ }, { key: 'showNewDives', value: function showNewDives()
    {
      var newDives = this.newDives;
      this.newDives = {};
      this.newDivesButton.hide();
      var diveKeys = Object.keys(newDives);

      for (var i = 0; i < diveKeys.length; i++) {
        this.noDivesMessage.hide();
        var dive = newDives[diveKeys[i]];
        var diveElement = new hermesApp.Dive(diveKeys[i]);
        this.dives.push(diveElement);
        this.feedImageContainer.prepend(diveElement.diveElement);
        diveElement.fillDiveData(diveKeys[i], dive.thumb_url ||
        dive.url, dive.text, dive.author, dive.timestamp, null, null, dive.full_url);
      }
    }

    /**
       * Displays the general dives feed.
       */ }, { key: 'showGeneralFeed', value: function showGeneralFeed()
    {var _this3 = this;
      // Clear previously displayed dives if any.
      this.clear();

      // Load initial batch of dives.
      hermesApp.firebase.getDives().then(function (data) {
        // Listen for new dives.
        var latestDiveId = Object.keys(data.entries)[Object.keys(data.entries).length - 1];
        hermesApp.firebase.subscribeToGeneralFeed(
        function (diveId, diveValue) {return _this3.addNewDive(diveId, diveValue);}, latestDiveId);

        // Adds fetched dives and next page button if necessary.
        _this3.addDives(data.entries);
        _this3.toggleNextPageButton(data.nextPage);
      });

      // Listen for dives deletions.
      hermesApp.firebase.registerForDivesDeletion(function (diveId) {return _this3.onDiveDeleted(diveId);});
    }

    /**
       * Shows the feed showing all followed users.
       */ }, { key: 'showHomeFeed', value: function showHomeFeed()
    {var _this4 = this;
      // Clear previously displayed dives if any.
      this.clear();

      if (this.auth.currentUser) {
        // Make sure the home feed is updated with followed users's new dives.
        hermesApp.firebase.updateHomeFeeds().then(function () {
          // Load initial batch of dives.
          hermesApp.firebase.getHomeFeedDives().then(function (data) {
            var diveIds = Object.keys(data.entries);
            if (diveIds.length === 0) {
              _this4.noDivesMessage.fadeIn();
            }
            // Listen for new dives.
            var latestDiveId = diveIds[diveIds.length - 1];
            hermesApp.firebase.subscribeToHomeFeed(
            function (diveId, diveValue) {
              _this4.addNewDive(diveId, diveValue);
            }, latestDiveId);

            // Adds fetched dives and next page button if necessary.
            _this4.addDives(data.entries);
            _this4.toggleNextPageButton(data.nextPage);
          });

          // Add new dives from followers live.
          hermesApp.firebase.startHomeFeedLiveUpdaters();

          // Listen for dives deletions.
          hermesApp.firebase.registerForDivesDeletion(function (diveId) {return _this4.onDiveDeleted(diveId);});
        });
      }
    }

    /**
       * Triggered when a dive has been deleted.
       */ }, { key: 'onDiveDeleted', value: function onDiveDeleted(
    diveId) {
      // Potentially remove dive from in-memory new dive list.
      if (this.newDives[diveId]) {
        delete this.newDives[diveId];
        var nbNewDives = Object.keys(this.newDives).length;
        this.newDivesButton.text('Display ' + nbNewDives + ' new dives');
        if (nbNewDives === 0) {
          this.newDivesButton.hide();
        }
      }

      // Potentially delete from the UI.
      $('.hm-dive-' + diveId, this.pageFeed).remove();
    }

    /**
       * Adds a new dive to display in the queue.
       */ }, { key: 'addNewDive', value: function addNewDive(
    diveId, diveValue) {
      this.newDives[diveId] = diveValue;
      this.newDivesButton.text('Display ' + Object.keys(this.newDives).length + ' new dives');
      this.newDivesButton.show();
    }

    /**
       * Clears the UI.
       */ }, { key: 'clear', value: function clear()
    {
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
      this.dives.forEach(function (dive) {return dive.clear();});
      this.dives = [];
    } }]);return _class;}();


hermesApp.feed = new hermesApp.Feed();
//# sourceMappingURL=feed.js.map