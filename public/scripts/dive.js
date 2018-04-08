'use strict';

window.hermesApp = window.hermesApp || {};

/**
 * Handles the single dive UI.
 */
hermesApp.Dive = class {
  /**
   * Initializes the single dive's UI.
   * @constructor
   */
  constructor(diveId) {
    // List of all times running on the page.
    this.timers = [];

    // Firebase SDK.
    this.database = firebase.database();
    this.storage = firebase.storage();
    this.auth = firebase.auth();

    $(document).ready(() => {
      this.divePage = $('#page-dive');
      // Pointers to DOM elements.
      this.diveElement = $(hermesApp.Dive.createDiveHtml(diveId));
      hermesApp.MaterialUtils.upgradeTextFields(this.diveElement);
      this.toast = $('.mdl-js-snackbar');
      this.theatre = $('.hm-theatre');
    });
  }

  /**
   * Loads the given dive's details.
   */
  loadDive(diveId) {
    // Load the dives information.
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
    });
  }

  /**
   * Clears all listeners and timers in the given element.
   */
  clear() {
    // Stops all timers if any.
    this.timers.forEach(timer => clearInterval(timer));
    this.timers = [];

    // Remove Firebase listeners.
    hermesApp.firebase.cancelAllSubscriptions();
  }

  /**
   * Displays the given list of `comments` in the dive.
   */
  displayComments(diveId, comments) {
    const commentsIds = Object.keys(comments);
    for (let i = commentsIds.length - 1; i >= 0; i--) {
      this.displayComment(comments[commentsIds[i]], diveId, commentsIds[i]);
    }
  }

  /**
   * Displays a single comment or replace the existing one with new content.
   */
  displayComment(comment, diveId, commentId, prepend = true) {
    const newElement = this.createComment(comment.author, comment.text, diveId,
        commentId, comment.author.uid === hermesApp.auth.userId);
    if (prepend) {
      $('.hm-comments', this.diveElement).prepend(newElement);
    } else {
      $('.hm-comments', this.diveElement).append(newElement);
    }
    hermesApp.MaterialUtils.upgradeDropdowns(this.diveElement);

    // Subscribe to updates of the comment.
    hermesApp.firebase.subscribeToComment(diveId, commentId, snap => {
      const updatedComment = snap.val();
      if (updatedComment) {
        const updatedElement = this.createComment(updatedComment.author,
          updatedComment.text, diveId, commentId,
          updatedComment.author.uid === hermesApp.auth.userId);
        const element = $('#comment-' + commentId);
        element.replaceWith(updatedElement);
      } else {
        $('#comment-' + commentId).remove();
      }
      hermesApp.MaterialUtils.upgradeDropdowns(this.diveElement);
    });
  }

  /**
   * Shows the "show more comments" button and binds it the `nextPage` callback. If `nextPage` is
   * `null` then the button is hidden.
   */
  displayNextPageButton(diveId, nextPage) {
    const nextPageButton = $('.hm-morecomments', this.diveElement);
    if (nextPage) {
      nextPageButton.show();
      nextPageButton.unbind('click');
      nextPageButton.prop('disabled', false);
      nextPageButton.click(() => nextPage().then(data => {
        nextPageButton.prop('disabled', true);
        this.displayComments(diveId, data.entries);
        this.displayNextPageButton(diveId, data.nextPage);
      }));
    } else {
      nextPageButton.hide();
    }
  }

  /**
   * Fills the dive's Card with the given details.
   * Also sets all auto updates and listeners on the UI elements of the dive.
   */
  fillDiveData(diveId, thumbUrl, imageText, author = {}, timestamp, thumbStorageUri, picStorageUri, picUrl) {
    const dive = this.diveElement;

    hermesApp.MaterialUtils.upgradeDropdowns(this.diveElement);

    // Fills element's author profile.
    $('.hm-usernamelink', dive).attr('href', `/user/${author.uid}`);
    $('.hm-avatar', dive).css('background-image',
        `url(${author.profile_picture || '/images/silhouette.jpg'})`);
    $('.hm-username', dive).text(author.full_name || 'Anonymous');

    // Shows the pic's thumbnail.
    this._setupThumb(thumbUrl, picUrl);

    // Make sure we update if the thumb or pic URL changes.
    hermesApp.firebase.registerForThumbChanges(diveId, thumbUrl => {
      this._setupThumb(thumbUrl, picUrl);
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
   */
  leaveTheatreMode() {
    this.theatre.hide();
    this.theatre.off('click');
    $(document).off('keydown');
  }

  /**
   * Leaves the theatre mode.
   */
  enterTheatreMode(picUrl) {
    $('.hm-fullpic', this.theatre).prop('src', picUrl);
    this.theatre.css('display', 'flex');
    // Leave theatre mode if click or ESC key down.
    this.theatre.off('click');
    this.theatre.click(() => this.leaveTheatreMode());
    $(document).off('keydown');
    $(document).keydown(e => {
      if (e.which === 27) {
        this.leaveTheatreMode();
      }
    });
  }

  /**
   * Shows the thumbnail and sets up the click to see the full size image.
   * @private
   */
  _setupThumb(thumbUrl, picUrl) {
    const dive = this.diveElement;

    $('.hm-image', dive).css('background-image', `url("${thumbUrl ? thumbUrl.replace(/"/g, '\\"') : ''}")`);
    $('.hm-image', dive).unbind('click');
    $('.hm-image', dive).click(() => this.enterTheatreMode(picUrl || thumbUrl));
  }

  /**
   * Shows the publishing date of the dive and updates this date live.
   * @private
   */
  _setupDate(diveId, timestamp) {
    const dive = this.diveElement;

    $('.hm-time', dive).attr('href', `/dive/${diveId}`);
    $('.hm-time', dive).text(hermesApp.Dive.getTimeText(timestamp));
    // Update the time counter every minutes.
    this.timers.push(setInterval(
        () => $('.hm-time', dive).text(hermesApp.Dive.getTimeText(timestamp)), 60000));
  }

  /**
   * Shows comments and binds actions to the comments form.
   * @private
   */
  _setupComments(diveId, author, imageText) {
    const dive = this.diveElement;

    // Creates the initial comment with the dive's text.
    $('.hm-first-comment', dive).empty();
    $('.hm-first-comment', dive).append(this.createComment(author, imageText));

    // Load first page of comments and listen to new comments.
    hermesApp.firebase.getComments(diveId).then(data => {
      $('.hm-comments', dive).empty();
      this.displayComments(diveId, data.entries);
      this.displayNextPageButton(diveId, data.nextPage);

      // Display any new comments.
      const commentIds = Object.keys(data.entries);
      hermesApp.firebase.subscribeToComments(diveId, (commentId, commentData) => {
        this.displayComment(commentData, diveId, commentId, false);
      }, commentIds ? commentIds[commentIds.length - 1] : 0);
    });

    if (this.auth.currentUser) {
      // Bind comments form diveing.
      $('.hm-add-comment', dive).off('submit');
      $('.hm-add-comment', dive).submit(e => {
        e.preventDefault();
        const commentText = $(`.mdl-textfield__input`, dive).val();
        if (!commentText || commentText.length === 0) {
          return;
        }
        hermesApp.firebase.addComment(diveId, commentText);
        $(`.mdl-textfield__input`, dive).val('');
      });
      const ran = Math.floor(Math.random() * 10000000);
      $('.mdl-textfield__input', dive).attr('id', `${diveId}-${ran}-comment`);
      $('.mdl-textfield__label', dive).attr('for', `${diveId}-${ran}-comment`);
      // Show comments form.
      $('.hm-action', dive).css('display', 'flex');
    }
  }

  /**
   * Binds the action to the report button.
   * @private
   */
  _setupReportButton(diveId) {
    const dive = this.diveElement;

    if (this.auth.currentUser) {
      $('.hm-report-dive', dive).show();
      $('.hm-report-dive', dive).off('click');
      $('.hm-report-dive', dive).click(() => {
        swal({
          title: 'Are you sure?',
          text: 'You are about to flag this dive for inappropriate content! An administrator will review your claim.',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: 'Yes, report this dive!',
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          allowEscapeKey: true
        }, () => {
          $('.hm-report-dive', dive).prop('disabled', true);
          hermesApp.firebase.reportDive(diveId).then(() => {
            swal({
              title: 'Reported!',
              text: 'This dive has been reported. Please allow some time before an admin reviews it.',
              type: 'success',
              timer: 2000
            });
            $('.hm-report-dive', dive).prop('disabled', false);
          }).catch(error => {
            swal.close();
            $('.hm-report-dive', dive).prop('disabled', false);
            const data = {
              message: `There was an error reporting your dive: ${error}`,
              timeout: 5000
            };
            this.toast[0].MaterialSnackbar.showSnackbar(data);
          });
        });
      });
    }
  }

  /**
   * Shows/Hide and binds actions to the Delete button.
   * @private
   */
  _setupDeleteButton(diveId, author = {}, picStorageUri, thumbStorageUri) {
    const dive = this.diveElement;

    if (this.auth.currentUser && this.auth.currentUser.uid === author.uid) {
      dive.addClass('hm-owned-dive');
    } else {
      dive.removeClass('hm-owned-dive');
    }

    $('.hm-delete-dive', dive).off('click');
    $('.hm-delete-dive', dive).click(() => {
      swal({
        title: 'Are you sure?',
        text: 'You are about to delete this dive. Once deleted, you will not be able to recover it!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes, delete it!',
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        allowEscapeKey: true
      }, () => {
        $('.hm-delete-dive', dive).prop('disabled', true);
        hermesApp.firebase.deleteDive(diveId, picStorageUri, thumbStorageUri).then(() => {
          swal({
            title: 'Deleted!',
            text: 'Your dive has been deleted.',
            type: 'success',
            timer: 2000
          });
          $('.hm-delete-dive', dive).prop('disabled', false);
          page(`/user/${this.auth.currentUser.uid}`);
        }).catch(error => {
          swal.close();
          $('.hm-delete-dive', dive).prop('disabled', false);
          const data = {
            message: `There was an error deleting your dive: ${error}`,
            timeout: 5000
          };
          this.toast[0].MaterialSnackbar.showSnackbar(data);
        });
      });
    });
  }

  /**
   * Starts Likes count listener and on/off like status.
   * @private
   */
  _setupLikeCountAndStatus(diveId) {
    const dive = this.diveElement;

    if (this.auth.currentUser) {
      // Listen to like status.
      hermesApp.firebase.registerToUserLike(diveId, isliked => {
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
      $('.hm-liked', dive).click(() => hermesApp.firebase.updateLike(diveId, false));
      $('.hm-not-liked', dive).off('click');
      $('.hm-not-liked', dive).click(() => hermesApp.firebase.updateLike(diveId, true));
    } else {
      $('.hm-liked', dive).hide();
      $('.hm-not-liked', dive).hide();
      $('.hm-action', dive).hide();
    }

    // Listen to number of Likes.
    hermesApp.firebase.registerForLikesCount(diveId, nbLikes => {
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
   */
  static createDiveHtml(diveId = 0) {
    return `
        <div class="hm-dive mdl-cell mdl-cell--12-col mdl-cell--8-col-tablet
                    mdl-cell--8-col-desktop mdl-grid mdl-grid--no-spacing">
          <div class="mdl-card mdl-shadow--2dp mdl-cell
                        mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">
            <div class="hm-header">
              <a class="hm-usernamelink mdl-button mdl-js-button" href="/user/">
                <div class="hm-avatar"></div>
                <div class="hm-username mdl-color-text--black"></div>
              </a>
              <a href="/dive/" class="hm-time">now</a>
              <!-- Drop Down Menu -->
              <button class="hm-signed-in-only mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon" id="hm-dive-menu-${diveId}">
                <i class="material-icons">more_vert</i>
              </button>
              <ul class="hm-menu-list mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--bottom-right" for="hm-dive-menu-${diveId}">
                <li class="mdl-menu__item hm-report-dive"><i class="material-icons">report</i> Report</li>
                <li class="mdl-menu__item hm-delete-dive"><i class="material-icons">delete</i> Delete dive</li>
              </ul>
            </div>
            <div class="hm-image"></div>
            <div class="hm-likes">0 likes</div>
            <div class="hm-first-comment"></div>
            <div class="hm-morecomments">View more comments...</div>
            <div class="hm-comments"></div>
            <div class="hm-action">
              <span class="hm-like">
                <div class="hm-not-liked material-icons">favorite_border</div>
                <div class="hm-liked material-icons">favorite</div>
              </span>
              <form class="hm-add-comment" action="#">
                <div class="mdl-textfield mdl-js-textfield">
                  <input class="mdl-textfield__input">
                  <label class="mdl-textfield__label">Comment...</label>
                </div>
              </form>
            </div>
          </div>
        </div>`;
  }

  /**
   * Returns the HTML for a dive's comment.
   */
  createComment(author = {}, text, diveId, commentId, isOwner = false) {
    try {
      const element = $(`
        <div id="comment-${commentId}" class="hm-comment${isOwner ? ' hm-comment-owned' : ''}">
          <a class="hm-author" href="/user/${author.uid}">${$('<div>').text(author.full_name || 'Anonymous').html()}</a>:
          <span class="hm-text">${$('<div>').text(text).html()}</span>
          <!-- Drop Down Menu -->
          <button class="hm-edit-delete-comment-container hm-signed-in-only mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon" id="hm-comment-menu-${commentId}">
            <i class="material-icons">more_vert</i>
          </button>
          <ul class="hm-menu-list mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--top-right" for="hm-comment-menu-${commentId}">
            <li class="mdl-menu__item hm-report-comment"><i class="material-icons">report</i> Report</li>
            <li class="mdl-menu__item hm-edit-comment"><i class="material-icons">mode_edit</i> Edit</li>
            <li class="mdl-menu__item hm-delete-comment"><i class="material-icons">delete</i> Delete comment</li>
          </ul>
        </div>`);
      $('.hm-delete-comment', element).click(() => {
        if (window.confirm('Delete the comment?')) {
          hermesApp.firebase.deleteComment(diveId, commentId).then(() => {
            element.text('this comment has been deleted');
            element.addClass('hm-comment-deleted');
          });
        }
      });
      $('.hm-report-comment', element).click(() => {
        if (window.confirm('Report this comment for inappropriate content?')) {
          hermesApp.firebase.reportComment(diveId, commentId).then(() => {
            element.text('this comment has been flagged for review.');
            element.addClass('hm-comment-deleted');
          });
        }
      });
      $('.hm-edit-comment', element).click(() => {
        const newComment = window.prompt('Edit the comment?', text);
        if (newComment !== null && newComment !== '') {
          hermesApp.firebase.editComment(diveId, commentId, newComment).then(() => {
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
   */
  static getTimeText(diveCreationTimestamp) {
    let millis = Date.now() - diveCreationTimestamp;
    const ms = millis % 1000;
    millis = (millis - ms) / 1000;
    const secs = millis % 60;
    millis = (millis - secs) / 60;
    const mins = millis % 60;
    millis = (millis - mins) / 60;
    const hrs = millis % 24;
    const days = (millis - hrs) / 24;
    const timeSinceCreation = [days, hrs, mins, secs, ms];

    let timeText = 'Now';
    if (timeSinceCreation[0] !== 0) {
      timeText = timeSinceCreation[0] + 'd';
    } else if (timeSinceCreation[1] !== 0) {
      timeText = timeSinceCreation[1] + 'h';
    } else if (timeSinceCreation[2] !== 0) {
      timeText = timeSinceCreation[2] + 'm';
    }
    return timeText;
  }
};

hermesApp.dive = new hermesApp.Dive();

$(document).ready(() => {
  // We add the Dive element to the single dive page.
  $('.hm-image-container', hermesApp.dive.divePage).append(hermesApp.dive.diveElement);
});
