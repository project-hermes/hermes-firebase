'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

window.hermesApp = window.hermesApp || {};

/**
                                            * Handles the Friendly Pix search feature.
                                            */
hermesApp.Search = function () {_createClass(_class, null, [{ key: 'MIN_CHARACTERS',

    /**
                                                                                      * The minimum number of characters to trigger a search.
                                                                                      * @return {number}
                                                                                      */get: function get()
    {
      return 3;
    }

    /**
       * The maximum number of search results to be displayed.
       * @return {number}
       */ }, { key: 'NB_RESULTS_LIMIT', get: function get()
    {
      return 10;
    }

    /**
       * Initializes the Friendly Pix search bar.
       */ }]);
  function _class() {var _this = this;_classCallCheck(this, _class);
    // Firebase SDK.
    this.database = firebase.database();

    $(document).ready(function () {
      // DOM Elements pointers.
      _this.searchField = $('#searchQuery');
      _this.searchResults = $('#hm-searchResults');

      // Event bindings.
      _this.searchField.keyup(function () {return _this.displaySearchResults();});
      _this.searchField.focus(function () {return _this.displaySearchResults();});
      _this.searchField.click(function () {return _this.displaySearchResults();});
    });
  }

  /**
     * Display search results.
     */_createClass(_class, [{ key: 'displaySearchResults', value: function displaySearchResults()
    {var _this2 = this;
      var searchString = this.searchField.val().toLowerCase().trim();
      if (searchString.length >= hermesApp.Search.MIN_CHARACTERS) {
        hermesApp.firebase.searchUsers(searchString, hermesApp.Search.NB_RESULTS_LIMIT).then(
        function (results) {
          _this2.searchResults.empty();
          var peopleIds = Object.keys(results);
          if (peopleIds.length > 0) {
            _this2.searchResults.fadeIn();
            $('html').click(function () {
              $('html').unbind('click');
              _this2.searchResults.fadeOut();
            });
            peopleIds.forEach(function (peopleId) {
              var profile = results[peopleId];
              _this2.searchResults.append(
              hermesApp.Search.createSearchResultHtml(peopleId, profile));
            });
          } else {
            _this2.searchResults.fadeOut();
          }
        });
      } else {
        this.searchResults.empty();
        this.searchResults.fadeOut();
      }
    }

    /**
       * Returns the HTML for a single search result
       */ }], [{ key: 'createSearchResultHtml', value: function createSearchResultHtml(
    peopleId, peopleProfile) {
      return '\n        <a class="hm-searchResultItem hm-usernamelink mdl-button mdl-js-button" href="/user/' +
      peopleId + '">\n            <div class="hm-avatar"style="background-image: url(' + (
      peopleProfile.profile_picture ||
      '/images/silhouette.jpg') + ')"></div>\n            <div class="hm-username mdl-color-text--black">' +
      peopleProfile.full_name + '</div>\n        </a>';

    } }]);return _class;}();


hermesApp.search = new hermesApp.Search();
//# sourceMappingURL=search.js.map