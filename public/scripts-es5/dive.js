'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

window.hermesApp = window.hermesApp || {};

/**
                                            * Handles the single dive UI.
                                            */
hermesApp.Dive = function () {
  /**
                               * Initializes the single dive's UI.
                               * @constructor
                               */
  function _class(diveId) {var _this = this;_classCallCheck(this, _class);
    // List of all times running on the page.
    this.timers = [];

    // Firebase SDK.
    this.database = firebase.database();
    this.storage = firebase.storage();
    this.auth = firebase.auth();

    $(document).ready(function () {
      _this.divePage = $('#page-dive');
      // Pointers to DOM elements.
      _this.diveElement = $(hermesApp.Dive.createDiveHtml(diveId));
      hermesApp.MaterialUtils.upgradeTextFields(_this.diveElement);
      _this.toast = $('.mdl-js-snackbar');
      _this.theatre = $('.hm-theatre');
    });
  }

  /**
     * Loads the given dive's details.
     */_createClass(_class, [{ key: 'loadDive', value: function loadDive(
    diveId) {
      /*    // Load the dives information.
                 hermesApp.firebase.getDiveData(diveId).then(snapshot => {
                   const dive = snapshot.val();
                   // Clear listeners and previous dive data.
                   this.clear();
                   if (!dive) {
                     const data = {
                       message: 'This dive does not exists.',
                       timeout: 5000
                     };
                     this.toast[0].MaterialSnackbar.showSnackbar(data);
                     if (this.auth.currentUser) {
                       page(`/user/${this.auth.currentUser.uid}`);
                     } else {
                       page(`/feed`);
                     }
                   } else {
                     this.fillDiveData(snapshot.key, dive.thumb_url || dive.url, dive.text, dive.author,
                         dive.timestamp, dive.thumb_storage_uri, dive.full_storage_uri, dive.full_url);
                   }
                 });*/
      hermesApp.firebase.getDiveData(diveId).get().then(function (doc) {
        if (doc.exists) {
          this.fillDiveData(diveId);
        } else {
          console.error('Dive ' + diveId + ' does not exist');
          if (this.auth.currentUser) {
            page('/usr/' + this.auth.currentUser.uid);
          } else {
            page('/feed');
          }
        }
      }).catch(function (error) {
        console.log("Error getting dive:", error);
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
       * Displays the given list of `comments` in the dive.
       */ }, { key: 'displayComments', value: function displayComments(
    diveId, comments) {
      var commentsIds = Object.keys(comments);
      for (var i = commentsIds.length - 1; i >= 0; i--) {
        this.displayComment(comments[commentsIds[i]], diveId, commentsIds[i]);
      }
    }

    /**
       * Displays a single comment or replace the existing one with new content.
       */ }, { key: 'displayComment', value: function displayComment(
    comment, diveId, commentId) {var _this2 = this;var prepend = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var newElement = this.createComment(comment.author, comment.text, diveId,
      commentId, comment.author.uid === hermesApp.auth.userId);
      if (prepend) {
        $('.hm-comments', this.diveElement).prepend(newElement);
      } else {
        $('.hm-comments', this.diveElement).append(newElement);
      }
      hermesApp.MaterialUtils.upgradeDropdowns(this.diveElement);

      // Subscribe to updates of the comment.
      hermesApp.firebase.subscribeToComment(diveId, commentId, function (snap) {
        var updatedComment = snap.val();
        if (updatedComment) {
          var updatedElement = _this2.createComment(updatedComment.author,
          updatedComment.text, diveId, commentId,
          updatedComment.author.uid === hermesApp.auth.userId);
          var element = $('#comment-' + commentId);
          element.replaceWith(updatedElement);
        } else {
          $('#comment-' + commentId).remove();
        }
        hermesApp.MaterialUtils.upgradeDropdowns(_this2.diveElement);
      });
    }

    /**
       * Shows the "show more comments" button and binds it the `nextPage` callback. If `nextPage` is
       * `null` then the button is hidden.
       */ }, { key: 'displayNextPageButton', value: function displayNextPageButton(
    diveId, nextPage) {var _this3 = this;
      var nextPageButton = $('.hm-morecomments', this.diveElement);
      if (nextPage) {
        nextPageButton.show();
        nextPageButton.unbind('click');
        nextPageButton.prop('disabled', false);
        nextPageButton.click(function () {return nextPage().then(function (data) {
            nextPageButton.prop('disabled', true);
            _this3.displayComments(diveId, data.entries);
            _this3.displayNextPageButton(diveId, data.nextPage);
          });});
      } else {
        nextPageButton.hide();
      }
    }

    /**
       * Fills the dive's Card with the given details.
       * Also sets all auto updates and listeners on the UI elements of the dive.
       */ }, { key: 'fillDiveData', value: function fillDiveData(
    diveId, thumbUrl, imageText) {var author = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};var timestamp = arguments[4];var thumbStorageUri = arguments[5];var _this4 = this;var picStorageUri = arguments[6];var picUrl = arguments[7];
      var dive = this.diveElement;

      hermesApp.MaterialUtils.upgradeDropdowns(this.diveElement);

      // Fills element's author profile.
      $('.hm-usernamelink', dive).attr('href', '/user/' + author.uid);
      $('.hm-avatar', dive).css('background-image', 'url(' + (
      author.profile_picture || '/images/silhouette.jpg') + ')');
      $('.hm-username', dive).text(author.full_name || 'Anonymous');

      // Shows the pic's thumbnail.
      this._setupThumb(thumbUrl, picUrl);

      // Make sure we update if the thumb or pic URL changes.
      hermesApp.firebase.registerForThumbChanges(diveId, function (thumbUrl) {
        _this4._setupThumb(thumbUrl, picUrl);
      });

      this._setupDate(diveId, timestamp);
      this._setupDeleteButton(diveId, author, picStorageUri, thumbStorageUri);
      this._setupReportButton(diveId);
      this._setupLikeCountAndStatus(diveId);
      this._setupComments(diveId, author, imageText);
      return dive;
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
    picUrl) {var _this5 = this;
      $('.hm-fullpic', this.theatre).prop('src', picUrl);
      this.theatre.css('display', 'flex');
      // Leave theatre mode if click or ESC key down.
      this.theatre.off('click');
      this.theatre.click(function () {return _this5.leaveTheatreMode();});
      $(document).off('keydown');
      $(document).keydown(function (e) {
        if (e.which === 27) {
          _this5.leaveTheatreMode();
        }
      });
    }

    /**
       * Shows the thumbnail and sets up the click to see the full size image.
       * @private
       */ }, { key: '_setupThumb', value: function _setupThumb(
    thumbUrl, picUrl) {var _this6 = this;
      var dive = this.diveElement;

      $('.hm-image', dive).css('background-image', 'url("' + (thumbUrl ? thumbUrl.replace(/"/g, '\\"') : '') + '")');
      $('.hm-image', dive).unbind('click');
      $('.hm-image', dive).click(function () {return _this6.enterTheatreMode(picUrl || thumbUrl);});
    }

    /**
       * Shows the publishing date of the dive and updates this date live.
       * @private
       */ }, { key: '_setupDate', value: function _setupDate(
    diveId, timestamp) {
      var dive = this.diveElement;

      $('.hm-time', dive).attr('href', '/dive/' + diveId);
      $('.hm-time', dive).text(hermesApp.Dive.getTimeText(timestamp));
      // Update the time counter every minutes.
      this.timers.push(setInterval(
      function () {return $('.hm-time', dive).text(hermesApp.Dive.getTimeText(timestamp));}, 60000));
    }

    /**
       * Shows comments and binds actions to the comments form.
       * @private
       */ }, { key: '_setupComments', value: function _setupComments(
    diveId, author, imageText) {var _this7 = this;
      var dive = this.diveElement;

      // Creates the initial comment with the dive's text.
      $('.hm-first-comment', dive).empty();
      $('.hm-first-comment', dive).append(this.createComment(author, imageText));

      // Load first page of comments and listen to new comments.
      hermesApp.firebase.getComments(diveId).then(function (data) {
        $('.hm-comments', dive).empty();
        _this7.displayComments(diveId, data.entries);
        _this7.displayNextPageButton(diveId, data.nextPage);

        // Display any new comments.
        var commentIds = Object.keys(data.entries);
        hermesApp.firebase.subscribeToComments(diveId, function (commentId, commentData) {
          _this7.displayComment(commentData, diveId, commentId, false);
        }, commentIds ? commentIds[commentIds.length - 1] : 0);
      });

      if (this.auth.currentUser) {
        // Bind comments form diveing.
        $('.hm-add-comment', dive).off('submit');
        $('.hm-add-comment', dive).submit(function (e) {
          e.preventDefault();
          var commentText = $('.mdl-textfield__input', dive).val();
          if (!commentText || commentText.length === 0) {
            return;
          }
          hermesApp.firebase.addComment(diveId, commentText);
          $('.mdl-textfield__input', dive).val('');
        });
        var ran = Math.floor(Math.random() * 10000000);
        $('.mdl-textfield__input', dive).attr('id', diveId + '-' + ran + '-comment');
        $('.mdl-textfield__label', dive).attr('for', diveId + '-' + ran + '-comment');
        // Show comments form.
        $('.hm-action', dive).css('display', 'flex');
      }
    }

    /**
       * Binds the action to the report button.
       * @private
       */ }, { key: '_setupReportButton', value: function _setupReportButton(
    diveId) {var _this8 = this;
      var dive = this.diveElement;

      if (this.auth.currentUser) {
        $('.hm-report-dive', dive).show();
        $('.hm-report-dive', dive).off('click');
        $('.hm-report-dive', dive).click(function () {
          swal({
            title: 'Are you sure?',
            text: 'You are about to flag this dive for inappropriate content! An administrator will review your claim.',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, report this dive!',
            closeOnConfirm: true,
            showLoaderOnConfirm: true,
            allowEscapeKey: true },
          function () {
            $('.hm-report-dive', dive).prop('disabled', true);
            hermesApp.firebase.reportDive(diveId).then(function () {
              swal({
                title: 'Reported!',
                text: 'This dive has been reported. Please allow some time before an admin reviews it.',
                type: 'success',
                timer: 2000 });

              $('.hm-report-dive', dive).prop('disabled', false);
            }).catch(function (error) {
              swal.close();
              $('.hm-report-dive', dive).prop('disabled', false);
              var data = {
                message: 'There was an error reporting your dive: ' + error,
                timeout: 5000 };

              _this8.toast[0].MaterialSnackbar.showSnackbar(data);
            });
          });
        });
      }
    }

    /**
       * Shows/Hide and binds actions to the Delete button.
       * @private
       */ }, { key: '_setupDeleteButton', value: function _setupDeleteButton(
    diveId) {var author = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};var _this9 = this;var picStorageUri = arguments[2];var thumbStorageUri = arguments[3];
      var dive = this.diveElement;

      if (this.auth.currentUser && this.auth.currentUser.uid === author.uid) {
        dive.addClass('hm-owned-dive');
      } else {
        dive.removeClass('hm-owned-dive');
      }

      $('.hm-delete-dive', dive).off('click');
      $('.hm-delete-dive', dive).click(function () {
        swal({
          title: 'Are you sure?',
          text: 'You are about to delete this dive. Once deleted, you will not be able to recover it!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: 'Yes, delete it!',
          closeOnConfirm: false,
          showLoaderOnConfirm: true,
          allowEscapeKey: true },
        function () {
          $('.hm-delete-dive', dive).prop('disabled', true);
          hermesApp.firebase.deleteDive(diveId, picStorageUri, thumbStorageUri).then(function () {
            swal({
              title: 'Deleted!',
              text: 'Your dive has been deleted.',
              type: 'success',
              timer: 2000 });

            $('.hm-delete-dive', dive).prop('disabled', false);
            page('/user/' + _this9.auth.currentUser.uid);
          }).catch(function (error) {
            swal.close();
            $('.hm-delete-dive', dive).prop('disabled', false);
            var data = {
              message: 'There was an error deleting your dive: ' + error,
              timeout: 5000 };

            _this9.toast[0].MaterialSnackbar.showSnackbar(data);
          });
        });
      });
    }

    /**
       * Starts Likes count listener and on/off like status.
       * @private
       */ }, { key: '_setupLikeCountAndStatus', value: function _setupLikeCountAndStatus(
    diveId) {
      var dive = this.diveElement;

      if (this.auth.currentUser) {
        // Listen to like status.
        hermesApp.firebase.registerToUserLike(diveId, function (isliked) {
          if (isliked) {
            $('.hm-liked', dive).show();
            $('.hm-not-liked', dive).hide();
          } else {
            $('.hm-liked', dive).hide();
            $('.hm-not-liked', dive).show();
          }
        });

        // Add event listeners.
        $('.hm-liked', dive).off('click');
        $('.hm-liked', dive).click(function () {return hermesApp.firebase.updateLike(diveId, false);});
        $('.hm-not-liked', dive).off('click');
        $('.hm-not-liked', dive).click(function () {return hermesApp.firebase.updateLike(diveId, true);});
      } else {
        $('.hm-liked', dive).hide();
        $('.hm-not-liked', dive).hide();
        $('.hm-action', dive).hide();
      }

      // Listen to number of Likes.
      hermesApp.firebase.registerForLikesCount(diveId, function (nbLikes) {
        if (nbLikes > 0) {
          $('.hm-likes', dive).show();
          $('.hm-likes', dive).text(nbLikes + ' like' + (nbLikes === 1 ? '' : 's'));
        } else {
          $('.hm-likes', dive).hide();
        }
      });
    }

    /**
       * Returns the HTML for a dive's comment.
       */ }, { key: 'createComment',










































    /**
                                      * Returns the HTML for a dive's comment.
                                      */value: function createComment()
    {var author = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};var text = arguments[1];var diveId = arguments[2];var commentId = arguments[3];var isOwner = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      try {
        var element = $('\n        <div id="comment-' +
        commentId + '" class="hm-comment' + (isOwner ? ' hm-comment-owned' : '') + '">\n          <a class="hm-author" href="/user/' +
        author.uid + '">' + $('<div>').text(author.full_name || 'Anonymous').html() + '</a>:\n          <span class="hm-text">' +
        $('<div>').text(text).html() + '</span>\n          <!-- Drop Down Menu -->\n          <button class="hm-edit-delete-comment-container hm-signed-in-only mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon" id="hm-comment-menu-' +

        commentId + '">\n            <i class="material-icons">more_vert</i>\n          </button>\n          <ul class="hm-menu-list mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--top-right" for="hm-comment-menu-' +


        commentId + '">\n            <li class="mdl-menu__item hm-report-comment"><i class="material-icons">report</i> Report</li>\n            <li class="mdl-menu__item hm-edit-comment"><i class="material-icons">mode_edit</i> Edit</li>\n            <li class="mdl-menu__item hm-delete-comment"><i class="material-icons">delete</i> Delete comment</li>\n          </ul>\n        </div>');





        $('.hm-delete-comment', element).click(function () {
          if (window.confirm('Delete the comment?')) {
            hermesApp.firebase.deleteComment(diveId, commentId).then(function () {
              element.text('this comment has been deleted');
              element.addClass('hm-comment-deleted');
            });
          }
        });
        $('.hm-report-comment', element).click(function () {
          if (window.confirm('Report this comment for inappropriate content?')) {
            hermesApp.firebase.reportComment(diveId, commentId).then(function () {
              element.text('this comment has been flagged for review.');
              element.addClass('hm-comment-deleted');
            });
          }
        });
        $('.hm-edit-comment', element).click(function () {
          var newComment = window.prompt('Edit the comment?', text);
          if (newComment !== null && newComment !== '') {
            hermesApp.firebase.editComment(diveId, commentId, newComment).then(function () {
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
       * Given the time of creation of a dive returns how long since the creation of the dive in text
       * format. e.g. 5d, 10h, now...
       */ }], [{ key: 'createDiveHtml', value: function createDiveHtml() {var diveId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;return '\n        <div class="hm-dive mdl-cell mdl-cell--12-col mdl-cell--8-col-tablet\n                    mdl-cell--8-col-desktop mdl-grid mdl-grid--no-spacing">\n          <div class="mdl-card mdl-shadow--2dp mdl-cell\n                        mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">\n            <div class="hm-header">\n              <a class="hm-usernamelink mdl-button mdl-js-button" href="/user/">\n                <div class="hm-avatar"></div>\n                <div class="hm-username mdl-color-text--black"></div>\n              </a>\n              <a href="/dive/" class="hm-time">now</a>\n              <!-- Drop Down Menu -->\n              <button class="hm-signed-in-only mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon" id="hm-dive-menu-' + diveId + '">\n                <i class="material-icons">more_vert</i>\n              </button>\n              <ul class="hm-menu-list mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--bottom-right" for="hm-dive-menu-' + diveId + '">\n                <li class="mdl-menu__item hm-report-dive"><i class="material-icons">report</i> Report</li>\n                <li class="mdl-menu__item hm-delete-dive"><i class="material-icons">delete</i> Delete dive</li>\n              </ul>\n            </div>\n            <div class="hm-image"></div>\n            <div class="hm-likes">0 likes</div>\n            <div class="hm-first-comment"></div>\n            <div class="hm-morecomments">View more comments...</div>\n            <div class="hm-comments"></div>\n            <div class="hm-action">\n              <span class="hm-like">\n                <div class="hm-not-liked material-icons">favorite_border</div>\n                <div class="hm-liked material-icons">favorite</div>\n              </span>\n              <form class="hm-add-comment" action="#">\n                <div class="mdl-textfield mdl-js-textfield">\n                  <input class="mdl-textfield__input">\n                  <label class="mdl-textfield__label">Comment...</label>\n                </div>\n              </form>\n            </div>\n          </div>\n        </div>';} }, { key: 'getTimeText', value: function getTimeText(
    diveCreationTimestamp) {
      var millis = Date.now() - diveCreationTimestamp;
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


hermesApp.dive = new hermesApp.Dive();

$(document).ready(function () {
  // We add the Dive element to the single dive page.
  $('.hm-image-container', hermesApp.dive.divePage).append(hermesApp.dive.diveElement);
});
//# sourceMappingURL=dive.js.map