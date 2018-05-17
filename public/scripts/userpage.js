'use strict';

window.hermesApp = window.hermesApp || {};

/**
 * Handles the User Profile UI.
 */
hermesApp.UserPage = class {

  /**
   * Initializes the user's profile UI.
   * @constructor
   */
  constructor() {
    // Firebase SDK.
    this.database = firebase.database();
    this.auth = firebase.auth();

    $(document).ready(() => {
      // DOM Elements.
      this.userPage = $('#page-user-info');
      this.userAvatar = $('.hm-user-avatar');
      this.toast = $('.mdl-js-snackbar');
      this.userUsername = $('.hm-user-username');
      this.userInfoContainer = $('.hm-user-container');
      this.followContainer = $('.hm-follow');
      this.noPosts = $('.hm-no-posts', this.userPage);
      this.followLabel = $('.mdl-switch__label', this.followContainer);
      this.followCheckbox = $('#follow');
      this.blockContainer = $('.hm-block');
      this.blockLabel = $('.mdl-switch__label', this.blockContainer);
      this.blockCheckbox = $('#block');
      this.nbPostsContainer = $('.hm-user-nbposts', this.userPage);
      this.nbFollowers = $('.hm-user-nbfollowers', this.userPage);
      this.nbFollowing = $('.hm-user-nbfollowing', this.userPage);
      this.nbFollowingContainer = $('.hm-user-nbfollowing-container', this.userPage);
      this.followingContainer = $('.hm-user-following', this.userPage);
      this.nextPageButton = $('.hm-next-page-button button');
      this.closeFollowingButton = $('.hm-close-following', this.userPage);
      this.userInfoPageImageContainer = $('.hm-image-container', this.userPage);

      // Event bindings.
      this.followCheckbox.change(() => this.onFollowChange());
      this.blockCheckbox.change(() => this.onBlockChange());
      this.auth.onAuthStateChanged(() => this.trackFollowStatus());
      this.auth.onAuthStateChanged(() => this.trackBlockStatus());
      this.nbFollowingContainer.click(() => this.displayFollowing());
      this.closeFollowingButton.click(() => {
        this.followingContainer.hide();
        this.nbFollowingContainer.removeClass('is-active');
      });
    });
  }

  /**
   * Triggered when the user changes the "Follow" checkbox.
   */
  onFollowChange() {
    const checked = this.followCheckbox.prop('checked');
    this.followCheckbox.prop('disabled', true);

    hermesApp.firebase.toggleFollowUser(this.userId, checked);
  }

  /**
   * Triggered when the user changes the "Block" checkbox.
   */
  onBlockChange() {
    const checked = this.blockCheckbox.prop('checked');
    this.blockCheckbox.prop('disabled', true);

    hermesApp.firebase.toggleBlockUser(this.userId, checked);
  }

  /**
   * Starts tracking the "Follow" checkbox status.
   */
  trackFollowStatus() {
    if (this.auth.currentUser) {
      hermesApp.firebase.registerToFollowStatusUpdate(this.userId, data => {
        this.followCheckbox.prop('checked', data.val() !== null);
        this.followCheckbox.prop('disabled', false);
        this.followLabel.text(data.val() ? 'Following' : 'Follow');
        hermesApp.MaterialUtils.refreshSwitchState(this.followContainer);
      });
    }
  }

  /**
   * Starts tracking the "Blocked" checkbox status.
   */
  trackBlockStatus() {
    if (this.auth.currentUser) {
      hermesApp.firebase.registerToBlockedStatusUpdate(this.userId, data => {
        this.blockCheckbox.prop('checked', data.val() !== null);
        this.blockCheckbox.prop('disabled', false);
        this.blockLabel.text(data.val() ? 'Blocked' : 'Block');
        hermesApp.MaterialUtils.refreshSwitchState(this.blockContainer);
      });
    }
  }

  /**
   * Adds the list of posts to the UI.
   */
  addPosts(posts) {
    const postIds = Object.keys(posts);
    for (let i = postIds.length - 1; i >= 0; i--) {
      this.userInfoPageImageContainer.append(
          hermesApp.UserPage.createImageCard(postIds[i],
              posts[postIds[i]].thumb_url || posts[postIds[i]].url, posts[postIds[i]].text));
      this.noPosts.hide();
    }
  }

  /**
   * Shows the "load next page" button and binds it the `nextPage` callback. If `nextPage` is `null`
   * then the button is hidden.
   */
  toggleNextPageButton(nextPage) {
    if (nextPage) {
      this.nextPageButton.show();
      this.nextPageButton.unbind('click');
      this.nextPageButton.prop('disabled', false);
      this.nextPageButton.click(() => {
        this.nextPageButton.prop('disabled', true);
        nextPage().then(data => {
          this.addPosts(data.entries);
          this.toggleNextPageButton(data.nextPage);
        });
      });
    } else {
      this.nextPageButton.hide();
    }
  }

  /**
   * Displays the given user information in the UI.
   */
  loadUser(userId) {
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
    hermesApp.firebase.loadUserProfile(userId).then(snapshot => {
      const userInfo = snapshot.val();
      if (userInfo) {
        this.userAvatar.css('background-image',
            `url("${userInfo.profile_picture || '/images/silhouette.jpg'}")`);
        this.userUsername.text(userInfo.full_name || 'Anonymous');
        this.userInfoContainer.show();
      } else {
        var data = {
          message: 'This user does not exists.',
          timeout: 5000
        };
        this.toast[0].MaterialSnackbar.showSnackbar(data);
        page(`/feed`);
      }
    });

    // Lod user's number of followers.
    hermesApp.firebase.registerForFollowersCount(userId,
        nbFollowers => this.nbFollowers.text(nbFollowers));

    // Lod user's number of followed users.
    hermesApp.firebase.registerForFollowingCount(userId,
        nbFollowed => this.nbFollowing.text(nbFollowed));

    // Lod user's number of posts.
    hermesApp.firebase.registerForPostsCount(userId,
        nbPosts => this.nbPostsContainer.text(nbPosts));

    // Display user's posts.
    hermesApp.firebase.getUserFeedPosts(userId).then(data => {
      const postIds = Object.keys(data.entries);
      if (postIds.length === 0) {
        this.noPosts.show();
      }
      hermesApp.firebase.subscribeToUserFeed(userId,
        (postId, postValue) => {
          this.userInfoPageImageContainer.prepend(
              hermesApp.UserPage.createImageCard(postId,
                  postValue.thumb_url || postValue.url, postValue.text));
          this.noPosts.hide();
        }, postIds[postIds.length - 1]);

      // Adds fetched posts and next page button if necessary.
      this.addPosts(data.entries);
      this.toggleNextPageButton(data.nextPage);
    });

    // Listen for posts deletions.
    hermesApp.firebase.registerForPostsDeletion(postId =>
        $(`.hm-post-${postId}`, this.userPage).remove());
  }

  /**
   * Displays the list of followed people.
   */
  displayFollowing() {
    hermesApp.firebase.getFollowingProfiles(this.userId).then(profiles => {
      // Clear previous following list.
      $('.hm-usernamelink', this.followingContainer).remove();
      // Display all following profile cards.
      Object.keys(profiles).forEach(uid => this.followingContainer.prepend(
          hermesApp.UserPage.createProfileCardHtml(
              uid, profiles[uid].profile_picture, profiles[uid].full_name)));
      if (Object.keys(profiles).length > 0) {
        this.followingContainer.show();
        // Mark submenu as active.
        this.nbFollowingContainer.addClass('is-active');
      }
    });
  }

  /**
   * Clears the UI and listeners.
   */
  clear() {
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
   */
  static createImageCard(postId, thumbUrl, text) {
    const element = $(`
          <a href="/post/${postId}" class="hm-post-${postId} hm-image mdl-cell mdl-cell--12-col mdl-cell--4-col-tablet
                                            mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">
              <div class="hm-overlay">
                  <i class="material-icons">favorite</i><span class="likes">0</span>
                  <i class="material-icons">mode_comment</i><span class="comments">0</span>
                  <div class="hm-pic-text">${text}</div>
              </div>
              <div class="mdl-card mdl-shadow--2dp mdl-cell
                          mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop"></div>
          </a>`);
    // Display the thumbnail.
    $('.mdl-card', element).css('background-image', `url("${thumbUrl.replace(/"/g, '\\"')}")`);
    // Start listening for comments and likes counts.
    hermesApp.firebase.registerForLikesCount(postId,
        nbLikes => $('.likes', element).text(nbLikes));
    hermesApp.firebase.registerForCommentsCount(postId,
        nbComments => $('.comments', element).text(nbComments));

    return element;
  }

  /**
   * Returns an image Card element for the image with the given URL.
   */
  static createProfileCardHtml(uid, profilePic = '/images/silhouette.jpg', fullName = 'Anonymous') {
    return `
        <a class="hm-usernamelink mdl-button mdl-js-button" href="/user/${uid}">
            <div class="hm-avatar" style="background-image: url('${profilePic}')"></div>
            <div class="hm-username mdl-color-text--black">${fullName}</div>
        </a>`;
  }
};

hermesApp.userPage = new hermesApp.UserPage();
