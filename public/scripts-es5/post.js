'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

window.hermesApp = window.hermesApp || {};

/**
                                            * Handles the single post UI.
                                            */
hermesApp.Post = function () {
  /**
                               * Initializes the single post's UI.
                               * @constructor
                               */
  function _class(postId) {var _this = this;_classCallCheck(this, _class);
    // List of all times running on the page.
    this.timers = [];

    // Firebase SDK.
    this.database = firebase.database();
    this.storage = firebase.storage();
    this.auth = firebase.auth();

    $(document).ready(function () {
      _this.postPage = $('#page-post');
      // Pointers to DOM elements.
      _this.postElement = $(hermesApp.Post.createPostHtml(postId));
      hermesApp.MaterialUtils.upgradeTextFields(_this.postElement);
      _this.toast = $('.mdl-js-snackbar');
      _this.theatre = $('.hm-theatre');
    });
  }

  /**
     * Loads the given post's details.
     */_createClass(_class, [{ key: 'loadPost', value: function loadPost(
    postId) {var _this2 = this;
      // Load the posts information.
      hermesApp.firebase.getPostData(postId).then(function (snapshot) {
        var post = snapshot.val();
        // Clear listeners and previous post data.
        _this2.clear();
        if (!post) {
          var data = {
            message: 'This post does not exists.',
            timeout: 5000 };

          _this2.toast[0].MaterialSnackbar.showSnackbar(data);
          if (_this2.auth.currentUser) {
            page('/user/' + _this2.auth.currentUser.uid);
          } else {
            page('/feed');
          }
        } else {
          _this2.fillPostData(snapshot.key, post.thumb_url || post.url, post.text, post.author,
          post.timestamp, post.thumb_storage_uri, post.full_storage_uri, post.full_url);
        }
      });
    }

    /**
       * Clears all listeners and timers in the given element.
       */ }, { key: 'clear', value: function clear()
    {
      // Stops all timers if any.
      this.timers.forEach(function (timer) {return clearInterval(timer);});
      this.timers = [];

      // Remove Firebase listeners.
      hermesApp.firebase.cancelAllSubscriptions();
    }

    /**
       * Displays the given list of `comments` in the post.
       */ }, { key: 'displayComments', value: function displayComments(
    postId, comments) {
      var commentsIds = Object.keys(comments);
      for (var i = commentsIds.length - 1; i >= 0; i--) {
        this.displayComment(comments[commentsIds[i]], postId, commentsIds[i]);
      }
    }

    /**
       * Displays a single comment or replace the existing one with new content.
       */ }, { key: 'displayComment', value: function displayComment(
    comment, postId, commentId) {var _this3 = this;var prepend = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var newElement = this.createComment(comment.author, comment.text, postId,
      commentId, comment.author.uid === hermesApp.auth.userId);
      if (prepend) {
        $('.hm-comments', this.postElement).prepend(newElement);
      } else {
        $('.hm-comments', this.postElement).append(newElement);
      }
      hermesApp.MaterialUtils.upgradeDropdowns(this.postElement);

      // Subscribe to updates of the comment.
      hermesApp.firebase.subscribeToComment(postId, commentId, function (snap) {
        var updatedComment = snap.val();
        if (updatedComment) {
          var updatedElement = _this3.createComment(updatedComment.author,
          updatedComment.text, postId, commentId,
          updatedComment.author.uid === hermesApp.auth.userId);
          var element = $('#comment-' + commentId);
          element.replaceWith(updatedElement);
        } else {
          $('#comment-' + commentId).remove();
        }
        hermesApp.MaterialUtils.upgradeDropdowns(_this3.postElement);
      });
    }

    /**
       * Shows the "show more comments" button and binds it the `nextPage` callback. If `nextPage` is
       * `null` then the button is hidden.
       */ }, { key: 'displayNextPageButton', value: function displayNextPageButton(
    postId, nextPage) {var _this4 = this;
      var nextPageButton = $('.hm-morecomments', this.postElement);
      if (nextPage) {
        nextPageButton.show();
        nextPageButton.unbind('click');
        nextPageButton.prop('disabled', false);
        nextPageButton.click(function () {return nextPage().then(function (data) {
            nextPageButton.prop('disabled', true);
            _this4.displayComments(postId, data.entries);
            _this4.displayNextPageButton(postId, data.nextPage);
          });});
      } else {
        nextPageButton.hide();
      }
    }

    /**
       * Fills the post's Card with the given details.
       * Also sets all auto updates and listeners on the UI elements of the post.
       */ }, { key: 'fillPostData', value: function fillPostData(
    postId, thumbUrl, imageText) {var author = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};var timestamp = arguments[4];var thumbStorageUri = arguments[5];var _this5 = this;var picStorageUri = arguments[6];var picUrl = arguments[7];
      var post = this.postElement;

      hermesApp.MaterialUtils.upgradeDropdowns(this.postElement);

      // Fills element's author profile.
      $('.hm-usernamelink', post).attr('href', '/user/' + author.uid);
      $('.hm-avatar', post).css('background-image', 'url(' + (
      author.profile_picture || '/images/silhouette.jpg') + ')');
      $('.hm-username', post).text(author.full_name || 'Anonymous');

      // Shows the pic's thumbnail.
      this._setupThumb(thumbUrl, picUrl);

      // Make sure we update if the thumb or pic URL changes.
      hermesApp.firebase.registerForThumbChanges(postId, function (thumbUrl) {
        _this5._setupThumb(thumbUrl, picUrl);
      });

      this._setupDate(postId, timestamp);
      this._setupDeleteButton(postId, author, picStorageUri, thumbStorageUri);
      this._setupReportButton(postId);
      this._setupLikeCountAndStatus(postId);
      this._setupComments(postId, author, imageText);
      return post;
    }

    /**
       * Leaves the theatre mode.
       */ }, { key: 'leaveTheatreMode', value: function leaveTheatreMode()
    {
      this.theatre.hide();
      this.theatre.off('click');
      $(document).off('keydown');
    }

    /**
       * Leaves the theatre mode.
       */ }, { key: 'enterTheatreMode', value: function enterTheatreMode(
    picUrl) {var _this6 = this;
      $('.hm-fullpic', this.theatre).prop('src', picUrl);
      this.theatre.css('display', 'flex');
      // Leave theatre mode if click or ESC key down.
      this.theatre.off('click');
      this.theatre.click(function () {return _this6.leaveTheatreMode();});
      $(document).off('keydown');
      $(document).keydown(function (e) {
        if (e.which === 27) {
          _this6.leaveTheatreMode();
        }
      });
    }

    /**
       * Shows the thumbnail and sets up the click to see the full size image.
       * @private
       */ }, { key: '_setupThumb', value: function _setupThumb(
    thumbUrl, picUrl) {var _this7 = this;
      var post = this.postElement;

      $('.hm-image', post).css('background-image', 'url("' + (thumbUrl ? thumbUrl.replace(/"/g, '\\"') : '') + '")');
      $('.hm-image', post).unbind('click');
      $('.hm-image', post).click(function () {return _this7.enterTheatreMode(picUrl || thumbUrl);});
    }

    /**
       * Shows the publishing date of the post and updates this date live.
       * @private
       */ }, { key: '_setupDate', value: function _setupDate(
    postId, timestamp) {
      var post = this.postElement;

      $('.hm-time', post).attr('href', '/post/' + postId);
      $('.hm-time', post).text(hermesApp.Post.getTimeText(timestamp));
      // Update the time counter every minutes.
      this.timers.push(setInterval(
      function () {return $('.hm-time', post).text(hermesApp.Post.getTimeText(timestamp));}, 60000));
    }

    /**
       * Shows comments and binds actions to the comments form.
       * @private
       */ }, { key: '_setupComments', value: function _setupComments(
    postId, author, imageText) {var _this8 = this;
      var post = this.postElement;

      // Creates the initial comment with the post's text.
      $('.hm-first-comment', post).empty();
      $('.hm-first-comment', post).append(this.createComment(author, imageText));

      // Load first page of comments and listen to new comments.
      hermesApp.firebase.getComments(postId).then(function (data) {
        $('.hm-comments', post).empty();
        _this8.displayComments(postId, data.entries);
        _this8.displayNextPageButton(postId, data.nextPage);

        // Display any new comments.
        var commentIds = Object.keys(data.entries);
        hermesApp.firebase.subscribeToComments(postId, function (commentId, commentData) {
          _this8.displayComment(commentData, postId, commentId, false);
        }, commentIds ? commentIds[commentIds.length - 1] : 0);
      });

      if (this.auth.currentUser) {
        // Bind comments form posting.
        $('.hm-add-comment', post).off('submit');
        $('.hm-add-comment', post).submit(function (e) {
          e.preventDefault();
          var commentText = $('.mdl-textfield__input', post).val();
          if (!commentText || commentText.length === 0) {
            return;
          }
          hermesApp.firebase.addComment(postId, commentText);
          $('.mdl-textfield__input', post).val('');
        });
        var ran = Math.floor(Math.random() * 10000000);
        $('.mdl-textfield__input', post).attr('id', postId + '-' + ran + '-comment');
        $('.mdl-textfield__label', post).attr('for', postId + '-' + ran + '-comment');
        // Show comments form.
        $('.hm-action', post).css('display', 'flex');
      }
    }

    /**
       * Binds the action to the report button.
       * @private
       */ }, { key: '_setupReportButton', value: function _setupReportButton(
    postId) {var _this9 = this;
      var post = this.postElement;

      if (this.auth.currentUser) {
        $('.hm-report-post', post).show();
        $('.hm-report-post', post).off('click');
        $('.hm-report-post', post).click(function () {
          swal({
            title: 'Are you sure?',
            text: 'You are about to flag this post for inappropriate content! An administrator will review your claim.',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, report this post!',
            closeOnConfirm: true,
            showLoaderOnConfirm: true,
            allowEscapeKey: true },
          function () {
            $('.hm-report-post', post).prop('disabled', true);
            hermesApp.firebase.reportPost(postId).then(function () {
              swal({
                title: 'Reported!',
                text: 'This post has been reported. Please allow some time before an admin reviews it.',
                type: 'success',
                timer: 2000 });

              $('.hm-report-post', post).prop('disabled', false);
            }).catch(function (error) {
              swal.close();
              $('.hm-report-post', post).prop('disabled', false);
              var data = {
                message: 'There was an error reporting your post: ' + error,
                timeout: 5000 };

              _this9.toast[0].MaterialSnackbar.showSnackbar(data);
            });
          });
        });
      }
    }

    /**
       * Shows/Hide and binds actions to the Delete button.
       * @private
       */ }, { key: '_setupDeleteButton', value: function _setupDeleteButton(
    postId) {var author = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};var _this10 = this;var picStorageUri = arguments[2];var thumbStorageUri = arguments[3];
      var post = this.postElement;

      if (this.auth.currentUser && this.auth.currentUser.uid === author.uid) {
        post.addClass('hm-owned-post');
      } else {
        post.removeClass('hm-owned-post');
      }

      $('.hm-delete-post', post).off('click');
      $('.hm-delete-post', post).click(function () {
        swal({
          title: 'Are you sure?',
          text: 'You are about to delete this post. Once deleted, you will not be able to recover it!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: 'Yes, delete it!',
          closeOnConfirm: false,
          showLoaderOnConfirm: true,
          allowEscapeKey: true },
        function () {
          $('.hm-delete-post', post).prop('disabled', true);
          hermesApp.firebase.deletePost(postId, picStorageUri, thumbStorageUri).then(function () {
            swal({
              title: 'Deleted!',
              text: 'Your post has been deleted.',
              type: 'success',
              timer: 2000 });

            $('.hm-delete-post', post).prop('disabled', false);
            page('/user/' + _this10.auth.currentUser.uid);
          }).catch(function (error) {
            swal.close();
            $('.hm-delete-post', post).prop('disabled', false);
            var data = {
              message: 'There was an error deleting your post: ' + error,
              timeout: 5000 };

            _this10.toast[0].MaterialSnackbar.showSnackbar(data);
          });
        });
      });
    }

    /**
       * Starts Likes count listener and on/off like status.
       * @private
       */ }, { key: '_setupLikeCountAndStatus', value: function _setupLikeCountAndStatus(
    postId) {
      var post = this.postElement;

      if (this.auth.currentUser) {
        // Listen to like status.
        hermesApp.firebase.registerToUserLike(postId, function (isliked) {
          if (isliked) {
            $('.hm-liked', post).show();
            $('.hm-not-liked', post).hide();
          } else {
            $('.hm-liked', post).hide();
            $('.hm-not-liked', post).show();
          }
        });

        // Add event listeners.
        $('.hm-liked', post).off('click');
        $('.hm-liked', post).click(function () {return hermesApp.firebase.updateLike(postId, false);});
        $('.hm-not-liked', post).off('click');
        $('.hm-not-liked', post).click(function () {return hermesApp.firebase.updateLike(postId, true);});
      } else {
        $('.hm-liked', post).hide();
        $('.hm-not-liked', post).hide();
        $('.hm-action', post).hide();
      }

      // Listen to number of Likes.
      hermesApp.firebase.registerForLikesCount(postId, function (nbLikes) {
        if (nbLikes > 0) {
          $('.hm-likes', post).show();
          $('.hm-likes', post).text(nbLikes + ' like' + (nbLikes === 1 ? '' : 's'));
        } else {
          $('.hm-likes', post).hide();
        }
      });
    }

    /**
       * Returns the HTML for a post's comment.
       */ }, { key: 'createComment',










































    /**
                                      * Returns the HTML for a post's comment.
                                      */value: function createComment()
    {var author = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};var text = arguments[1];var postId = arguments[2];var commentId = arguments[3];var isOwner = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      try {
        var element = $('\n        <div id="comment-' +
        commentId + '" class="hm-comment' + (isOwner ? ' hm-comment-owned' : '') + '">\n          <a class="hm-author" href="/user/' +
        author.uid + '">' + $('<div>').text(author.full_name || 'Anonymous').html() + '</a>:\n          <span class="hm-text">' +
        $('<div>').text(text).html() + '</span>\n          <!-- Drop Down Menu -->\n          <button class="hm-edit-delete-comment-container hm-signed-in-only mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon" id="hm-comment-menu-' +

        commentId + '">\n            <i class="material-icons">more_vert</i>\n          </button>\n          <ul class="hm-menu-list mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--top-right" for="hm-comment-menu-' +


        commentId + '">\n            <li class="mdl-menu__item hm-report-comment"><i class="material-icons">report</i> Report</li>\n            <li class="mdl-menu__item hm-edit-comment"><i class="material-icons">mode_edit</i> Edit</li>\n            <li class="mdl-menu__item hm-delete-comment"><i class="material-icons">delete</i> Delete comment</li>\n          </ul>\n        </div>');





        $('.hm-delete-comment', element).click(function () {
          if (window.confirm('Delete the comment?')) {
            hermesApp.firebase.deleteComment(postId, commentId).then(function () {
              element.text('this comment has been deleted');
              element.addClass('hm-comment-deleted');
            });
          }
        });
        $('.hm-report-comment', element).click(function () {
          if (window.confirm('Report this comment for inappropriate content?')) {
            hermesApp.firebase.reportComment(postId, commentId).then(function () {
              element.text('this comment has been flagged for review.');
              element.addClass('hm-comment-deleted');
            });
          }
        });
        $('.hm-edit-comment', element).click(function () {
          var newComment = window.prompt('Edit the comment?', text);
          if (newComment !== null && newComment !== '') {
            hermesApp.firebase.editComment(postId, commentId, newComment).then(function () {
              $('.hm-text', element).text(newComment);
            });
          }
        });
        return element;
      } catch (e) {
        console.error('Error while displaying comment', e);
      }
      return $('<div/>');
    }

    /**
       * Given the time of creation of a post returns how long since the creation of the post in text
       * format. e.g. 5d, 10h, now...
       */ }], [{ key: 'createPostHtml', value: function createPostHtml() {var postId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;return '\n        <div class="hm-post mdl-cell mdl-cell--12-col mdl-cell--8-col-tablet\n                    mdl-cell--8-col-desktop mdl-grid mdl-grid--no-spacing">\n          <div class="mdl-card mdl-shadow--2dp mdl-cell\n                        mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">\n            <div class="hm-header">\n              <a class="hm-usernamelink mdl-button mdl-js-button" href="/user/">\n                <div class="hm-avatar"></div>\n                <div class="hm-username mdl-color-text--black"></div>\n              </a>\n              <a href="/post/" class="hm-time">now</a>\n              <!-- Drop Down Menu -->\n              <button class="hm-signed-in-only mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon" id="hm-post-menu-' + postId + '">\n                <i class="material-icons">more_vert</i>\n              </button>\n              <ul class="hm-menu-list mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--bottom-right" for="hm-post-menu-' + postId + '">\n                <li class="mdl-menu__item hm-report-post"><i class="material-icons">report</i> Report</li>\n                <li class="mdl-menu__item hm-delete-post"><i class="material-icons">delete</i> Delete post</li>\n              </ul>\n            </div>\n            <div class="hm-image"></div>\n            <div class="hm-likes">0 likes</div>\n            <div class="hm-first-comment"></div>\n            <div class="hm-morecomments">View more comments...</div>\n            <div class="hm-comments"></div>\n            <div class="hm-action">\n              <span class="hm-like">\n                <div class="hm-not-liked material-icons">favorite_border</div>\n                <div class="hm-liked material-icons">favorite</div>\n              </span>\n              <form class="hm-add-comment" action="#">\n                <div class="mdl-textfield mdl-js-textfield">\n                  <input class="mdl-textfield__input">\n                  <label class="mdl-textfield__label">Comment...</label>\n                </div>\n              </form>\n            </div>\n          </div>\n        </div>';} }, { key: 'getTimeText', value: function getTimeText(
    postCreationTimestamp) {
      var millis = Date.now() - postCreationTimestamp;
      var ms = millis % 1000;
      millis = (millis - ms) / 1000;
      var secs = millis % 60;
      millis = (millis - secs) / 60;
      var mins = millis % 60;
      millis = (millis - mins) / 60;
      var hrs = millis % 24;
      var days = (millis - hrs) / 24;
      var timeSinceCreation = [days, hrs, mins, secs, ms];

      var timeText = 'Now';
      if (timeSinceCreation[0] !== 0) {
        timeText = timeSinceCreation[0] + 'd';
      } else if (timeSinceCreation[1] !== 0) {
        timeText = timeSinceCreation[1] + 'h';
      } else if (timeSinceCreation[2] !== 0) {
        timeText = timeSinceCreation[2] + 'm';
      }
      return timeText;
    } }]);return _class;}();


hermesApp.post = new hermesApp.Post();

$(document).ready(function () {
  // We add the Post element to the single post page.
  $('.hm-image-container', hermesApp.post.postPage).append(hermesApp.post.postElement);
});
//# sourceMappingURL=dive.js.map
