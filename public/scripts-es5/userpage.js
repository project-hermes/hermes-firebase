'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

window.hermesApp = window.hermesApp || {};

/**
                                            * Handles the User Profile UI.
                                            */
hermesApp.UserPage = function () {

  /**
                                   * Initializes the user's profile UI.
                                   * @constructor
                                   */
  function _class() {var _this = this;_classCallCheck(this, _class);
    // Firebase SDK.
    this.database = firebase.database();
    this.auth = firebase.auth();

    $(document).ready(function () {
      // DOM Elements.
      _this.userPage = $('#page-user-info');
      _this.userAvatar = $('.hm-user-avatar');
      _this.toast = $('.mdl-js-snackbar');
      _this.userUsername = $('.hm-user-username');
      _this.userInfoContainer = $('.hm-user-container');
      _this.followContainer = $('.hm-follow');
      _this.noPosts = $('.hm-no-posts', _this.userPage);
      _this.followLabel = $('.mdl-switch__label', _this.followContainer);
      _this.followCheckbox = $('#follow');
      _this.blockContainer = $('.hm-block');
      _this.blockLabel = $('.mdl-switch__label', _this.blockContainer);
      _this.blockCheckbox = $('#block');
      _this.nbPostsContainer = $('.hm-user-nbposts', _this.userPage);
      _this.nbFollowers = $('.hm-user-nbfollowers', _this.userPage);
      _this.nbFollowing = $('.hm-user-nbfollowing', _this.userPage);
      _this.nbFollowingContainer = $('.hm-user-nbfollowing-container', _this.userPage);
      _this.followingContainer = $('.hm-user-following', _this.userPage);
      _this.nextPageButton = $('.hm-next-page-button button');
      _this.closeFollowingButton = $('.hm-close-following', _this.userPage);
      _this.userInfoPageImageContainer = $('.hm-image-container', _this.userPage);

      // Event bindings.
      _this.followCheckbox.change(function () {return _this.onFollowChange();});
      _this.blockCheckbox.change(function () {return _this.onBlockChange();});
      _this.auth.onAuthStateChanged(function () {return _this.trackFollowStatus();});
      _this.auth.onAuthStateChanged(function () {return _this.trackBlockStatus();});
      _this.nbFollowingContainer.click(function () {return _this.displayFollowing();});
      _this.closeFollowingButton.click(function () {
        _this.followingContainer.hide();
        _this.nbFollowingContainer.removeClass('is-active');
      });
    });
  }

  /**
     * Triggered when the user changes the "Follow" checkbox.
     */_createClass(_class, [{ key: 'onFollowChange', value: function onFollowChange()
    {
      var checked = this.followCheckbox.prop('checked');
      this.followCheckbox.prop('disabled', true);

      hermesApp.firebase.toggleFollowUser(this.userId, checked);
    }

    /**
       * Triggered when the user changes the "Block" checkbox.
       */ }, { key: 'onBlockChange', value: function onBlockChange()
    {
      var checked = this.blockCheckbox.prop('checked');
      this.blockCheckbox.prop('disabled', true);

      hermesApp.firebase.toggleBlockUser(this.userId, checked);
    }

    /**
       * Starts tracking the "Follow" checkbox status.
       */ }, { key: 'trackFollowStatus', value: function trackFollowStatus()
    {var _this2 = this;
      if (this.auth.currentUser) {
        hermesApp.firebase.registerToFollowStatusUpdate(this.userId, function (data) {
          _this2.followCheckbox.prop('checked', data.val() !== null);
          _this2.followCheckbox.prop('disabled', false);
          _this2.followLabel.text(data.val() ? 'Following' : 'Follow');
          hermesApp.MaterialUtils.refreshSwitchState(_this2.followContainer);
        });
      }
    }

    /**
       * Starts tracking the "Blocked" checkbox status.
       */ }, { key: 'trackBlockStatus', value: function trackBlockStatus()
    {var _this3 = this;
      if (this.auth.currentUser) {
        hermesApp.firebase.registerToBlockedStatusUpdate(this.userId, function (data) {
          _this3.blockCheckbox.prop('checked', data.val() !== null);
          _this3.blockCheckbox.prop('disabled', false);
          _this3.blockLabel.text(data.val() ? 'Blocked' : 'Block');
          hermesApp.MaterialUtils.refreshSwitchState(_this3.blockContainer);
        });
      }
    }

    /**
       * Adds the list of posts to the UI.
       */ }, { key: 'addPosts', value: function addPosts(
    posts) {
      var postIds = Object.keys(posts);
      for (var i = postIds.length - 1; i >= 0; i--) {
        this.userInfoPageImageContainer.append(
        hermesApp.UserPage.createImageCard(postIds[i],
        posts[postIds[i]].thumb_url || posts[postIds[i]].url, posts[postIds[i]].text));
        this.noPosts.hide();
      }
    }

    /**
       * Shows the "load next page" button and binds it the `nextPage` callback. If `nextPage` is `null`
       * then the button is hidden.
       */ }, { key: 'toggleNextPageButton', value: function toggleNextPageButton(
    nextPage) {var _this4 = this;
      if (nextPage) {
        this.nextPageButton.show();
        this.nextPageButton.unbind('click');
        this.nextPageButton.prop('disabled', false);
        this.nextPageButton.click(function () {
          _this4.nextPageButton.prop('disabled', true);
          nextPage().then(function (data) {
            _this4.addPosts(data.entries);
            _this4.toggleNextPageButton(data.nextPage);
          });
        });
      } else {
        this.nextPageButton.hide();
      }
    }

    /**
       * Displays the given user information in the UI.
       */ }, { key: 'loadUser', value: function loadUser(
    userId) {var _this5 = this;
      this.userId = userId;

      // Reset the UI.
      this.clear();

      // If users is the currently signed-in user we hide the "Follow" checkbox and the opposite for
      // the "Notifications" checkbox.
      if (this.auth.currentUser && userId === this.auth.currentUser.uid) {
        this.followContainer.hide();
        this.blockContainer.hide();
        hermesApp.messaging.enableNotificationsContainer.show();
        hermesApp.messaging.enableNotificationsCheckbox.prop('disabled', true);
        hermesApp.MaterialUtils.refreshSwitchState(hermesApp.messaging.enableNotificationsContainer);
        hermesApp.messaging.trackNotificationsEnabledStatus();
      } else {
        hermesApp.messaging.enableNotificationsContainer.hide();
        this.followContainer.show();
        this.followCheckbox.prop('disabled', true);
        this.blockContainer.show();
        this.blockContainer.prop('disabled', true);
        hermesApp.MaterialUtils.refreshSwitchState(this.followContainer);
        // Start live tracking the state of the "Follow" Checkbox.
        this.trackFollowStatus();
        // Start live tracking the state of the "Block" Checkbox.
        this.trackBlockStatus();
      }

      // Load user's profile.
      hermesApp.firebase.loadUserProfile(userId).then(function (snapshot) {
        var userInfo = snapshot.val();
        if (userInfo) {
          _this5.userAvatar.css('background-image', 'url("' + (
          userInfo.profile_picture || '/images/silhouette.jpg') + '")');
          _this5.userUsername.text(userInfo.full_name || 'Anonymous');
          _this5.userInfoContainer.show();
        } else {
          var data = {
            message: 'This user does not exists.',
            timeout: 5000 };

          _this5.toast[0].MaterialSnackbar.showSnackbar(data);
          page('/feed');
        }
      });

      // Lod user's number of followers.
      hermesApp.firebase.registerForFollowersCount(userId,
      function (nbFollowers) {return _this5.nbFollowers.text(nbFollowers);});

      // Lod user's number of followed users.
      hermesApp.firebase.registerForFollowingCount(userId,
      function (nbFollowed) {return _this5.nbFollowing.text(nbFollowed);});

      // Lod user's number of posts.
      hermesApp.firebase.registerForPostsCount(userId,
      function (nbPosts) {return _this5.nbPostsContainer.text(nbPosts);});

      // Display user's posts.
      hermesApp.firebase.getUserFeedPosts(userId).then(function (data) {
        var postIds = Object.keys(data.entries);
        if (postIds.length === 0) {
          _this5.noPosts.show();
        }
        hermesApp.firebase.subscribeToUserFeed(userId,
        function (postId, postValue) {
          _this5.userInfoPageImageContainer.prepend(
          hermesApp.UserPage.createImageCard(postId,
          postValue.thumb_url || postValue.url, postValue.text));
          _this5.noPosts.hide();
        }, postIds[postIds.length - 1]);

        // Adds fetched posts and next page button if necessary.
        _this5.addPosts(data.entries);
        _this5.toggleNextPageButton(data.nextPage);
      });

      // Listen for posts deletions.
      hermesApp.firebase.registerForPostsDeletion(function (postId) {return (
          $('.hm-post-' + postId, _this5.userPage).remove());});
    }

    /**
       * Displays the list of followed people.
       */ }, { key: 'displayFollowing', value: function displayFollowing()
    {var _this6 = this;
      hermesApp.firebase.getFollowingProfiles(this.userId).then(function (profiles) {
        // Clear previous following list.
        $('.hm-usernamelink', _this6.followingContainer).remove();
        // Display all following profile cards.
        Object.keys(profiles).forEach(function (uid) {return _this6.followingContainer.prepend(
          hermesApp.UserPage.createProfileCardHtml(
          uid, profiles[uid].profile_picture, profiles[uid].full_name));});
        if (Object.keys(profiles).length > 0) {
          _this6.followingContainer.show();
          // Mark submenu as active.
          _this6.nbFollowingContainer.addClass('is-active');
        }
      });
    }

    /**
       * Clears the UI and listeners.
       */ }, { key: 'clear', value: function clear()
    {
      // Removes all pics.
      $('.hm-image', this.userInfoPageImageContainer).remove();

      // Remove active states of sub menu selectors (like "Following").
      $('.is-active', this.userInfoPageImageContainer).removeClass('is-active');

      // Cancel all Firebase listeners.
      hermesApp.firebase.cancelAllSubscriptions();

      // Hides the "Load Next Page" button.
      this.nextPageButton.hide();

      // Hides the user info box.
      this.userInfoContainer.hide();

      // Hide and empty the list of Followed people.
      this.followingContainer.hide();
      $('.hm-usernamelink', this.followingContainer).remove();

      // Stops then infinite scrolling listeners.
      hermesApp.MaterialUtils.stopOnEndScrolls();

      // Hide the "No posts" message.
      this.noPosts.hide();
    }

    /**
       * Returns an image Card element for the image with the given URL.
       */ }], [{ key: 'createImageCard', value: function createImageCard(
    postId, thumbUrl, text) {
      var element = $('\n          <a href="/post/' +
      postId + '" class="hm-post-' + postId + ' hm-image mdl-cell mdl-cell--12-col mdl-cell--4-col-tablet\n                                            mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">\n              <div class="hm-overlay">\n                  <i class="material-icons">favorite</i><span class="likes">0</span>\n                  <i class="material-icons">mode_comment</i><span class="comments">0</span>\n                  <div class="hm-pic-text">' +




      text + '</div>\n              </div>\n              <div class="mdl-card mdl-shadow--2dp mdl-cell\n                          mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop"></div>\n          </a>');




      // Display the thumbnail.
      $('.mdl-card', element).css('background-image', 'url("' + thumbUrl.replace(/"/g, '\\"') + '")');
      // Start listening for comments and likes counts.
      hermesApp.firebase.registerForLikesCount(postId,
      function (nbLikes) {return $('.likes', element).text(nbLikes);});
      hermesApp.firebase.registerForCommentsCount(postId,
      function (nbComments) {return $('.comments', element).text(nbComments);});

      return element;
    }

    /**
       * Returns an image Card element for the image with the given URL.
       */ }, { key: 'createProfileCardHtml', value: function createProfileCardHtml(
    uid) {var profilePic = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/images/silhouette.jpg';var fullName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Anonymous';
      return '\n        <a class="hm-usernamelink mdl-button mdl-js-button" href="/user/' +
      uid + '">\n            <div class="hm-avatar" style="background-image: url(\'' +
      profilePic + '\')"></div>\n            <div class="hm-username mdl-color-text--black">' +
      fullName + '</div>\n        </a>';

    } }]);return _class;}();


hermesApp.userPage = new hermesApp.UserPage();
//# sourceMappingURL=userpage.js.map