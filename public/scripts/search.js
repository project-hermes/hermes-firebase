'use strict';

window.hermesApp = window.hermesApp || {};

/**
 * Handles the Friendly Pix search feature.
 */
hermesApp.Search = class {

  /**
   * The minimum number of characters to trigger a search.
   * @return {number}
   */
  static get MIN_CHARACTERS() {
    return 3;
  }

  /**
   * The maximum number of search results to be displayed.
   * @return {number}
   */
  static get NB_RESULTS_LIMIT() {
    return 10;
  }

  /**
   * Initializes the Friendly Pix search bar.
   */
  constructor() {
    // Firebase SDK.
    this.database = firebase.database();

    $(document).ready(() => {
      // DOM Elements pointers.
      this.searchField = $('#searchQuery');
      this.searchResults = $('#hm-searchResults');

      // Event bindings.
      this.searchField.keyup(() => this.displaySearchResults());
      this.searchField.focus(() => this.displaySearchResults());
      this.searchField.click(() => this.displaySearchResults());
    });
  }

  /**
   * Display search results.
   */
  displaySearchResults() {
    const searchString = this.searchField.val().toLowerCase().trim();
    if (searchString.length >= hermesApp.Search.MIN_CHARACTERS) {
      hermesApp.firebase.searchUsers(searchString, hermesApp.Search.NB_RESULTS_LIMIT).then(
          results => {
            this.searchResults.empty();
            const peopleIds = Object.keys(results);
            if (peopleIds.length > 0) {
              this.searchResults.fadeIn();
              $('html').click(() => {
                $('html').unbind('click');
                this.searchResults.fadeOut();
              });
              peopleIds.forEach(peopleId => {
                const profile = results[peopleId];
                this.searchResults.append(
                    hermesApp.Search.createSearchResultHtml(peopleId, profile));
              });
            } else {
              this.searchResults.fadeOut();
            }
          });
    } else {
      this.searchResults.empty();
      this.searchResults.fadeOut();
    }
  }

  /**
   * Returns the HTML for a single search result
   */
  static createSearchResultHtml(peopleId, peopleProfile) {
    return `
        <a class="hm-searchResultItem hm-usernamelink mdl-button mdl-js-button" href="/user/${peopleId}">
            <div class="hm-avatar"style="background-image: url(${peopleProfile.profile_picture ||
                '/images/silhouette.jpg'})"></div>
            <div class="hm-username mdl-color-text--black">${peopleProfile.full_name}</div>
        </a>`;
  }
};

hermesApp.search = new hermesApp.Search();
