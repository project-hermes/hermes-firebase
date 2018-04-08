'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}
window.hermesApp = window.hermesApp || {};

/**
                                            * Handles all Firebase interactions.
                                            */
hermesApp.Firebase = function () {_createClass(_class, null, [{ key: 'DIVES_PAGE_SIZE',
    /**
                                                                                         * Number of dives loaded initially and per page for the feeds.
                                                                                         * @return {number}
                                                                                         */get: function get()
    {
      return 5;
    }

    /**
       * Number of dives loaded initially and per page for the User Profile page.
       * @return {number}
       */ }, { key: 'USER_PAGE_DIVES_PAGE_SIZE', get: function get()
    {
      return 6;
    }

    /**
       * Number of dives comments loaded initially and per page.
       * @return {number}
       */ }, { key: 'COMMENTS_PAGE_SIZE', get: function get()
    {
      return 3;
    }

    /**
       * Initializes this Firebase facade.
       * @constructor
       */ }]);
  function _class() {_classCallCheck(this, _class);
    // Firebase SDK.
    this.database = firebase.database();
    this.storage = firebase.storage();
    this.auth = firebase.auth();

    // Firebase references that are listened to.
    this.firebaseRefs = [];
  }

  /**
     * Turns off all Firebase listeners.
     */_createClass(_class, [{ key: 'cancelAllSubscriptions', value: function cancelAllSubscriptions()
    {
      this.firebaseRefs.forEach(function (ref) {return ref.off();});
      this.firebaseRefs = [];
    }

    /**
       * Subscribes to receive updates from a dive's comments. The given `callback` function gets
       * called for each new comment to the dive with ID `diveId`.
       *
       * If provided we'll only listen to comments that were diveed after `latestCommentId`.
       */ }, { key: 'subscribeToComments', value: function subscribeToComments(
    diveId, callback, latestCommentId) {
      return this._subscribeToFeed('/comments/' + diveId, callback, latestCommentId, false);
    }

    /**
       * Paginates comments from the dive with ID `diveId`.
       *
       * Fetches a page of `COMMENTS_PAGE_SIZE` comments from the dive.
       *
       * We return a `Promise` which resolves with an Map of comments and a function to the next page or
       * `null` if there is no next page.
       */ }, { key: 'getComments', value: function getComments(
    diveId) {
      return this._getPaginatedFeed('/comments/' + diveId,
      hermesApp.Firebase.COMMENTS_PAGE_SIZE, null, false);
    }

    /**
       * Subscribes to receive updates to the general dives feed. The given `callback` function gets
       * called for each new dive to the general dive feed.
       *
       * If provided we'll only listen to dives that were diveed after `latestDiveId`.
       */ }, { key: 'subscribeToGeneralFeed', value: function subscribeToGeneralFeed(
    callback, latestDiveId) {
      return this._subscribeToFeed('/dives/', callback, latestDiveId);
    }

    /**
       * Paginates dives from the global dive feed.
       *
       * Fetches a page of `DIVES_PAGE_SIZE` dives from the global feed.
       *
       * We return a `Promise` which resolves with an Map of dives and a function to the next page or
       * `null` if there is no next page.
       */ }, { key: 'getDives', value: function getDives()
    {
      return this._getPaginatedFeed('/dives/', hermesApp.Firebase.DIVES_PAGE_SIZE);
    }

    /**
       * Subscribes to receive updates to the home feed. The given `callback` function gets called for
       * each new dive to the general dive feed.
       *
       * If provided we'll only listen to dives that were diveed after `latestDiveId`.
       */ }, { key: 'subscribeToHomeFeed', value: function subscribeToHomeFeed(
    callback, latestDiveId) {
      return this._subscribeToFeed('/feed/' + this.auth.currentUser.uid, callback, latestDiveId,
      true);
    }

    /**
       * Paginates dives from the user's home feed.
       *
       * Fetches a page of `DIVES_PAGE_SIZE` dives from the user's home feed.
       *
       * We return a `Promise` which resolves with an Map of dives and a function to the next page or
       * `null` if there is no next page.
       */ }, { key: 'getHomeFeedDives', value: function getHomeFeedDives()
    {
      return this._getPaginatedFeed('/feed/' + this.auth.currentUser.uid,
      hermesApp.Firebase.DIVES_PAGE_SIZE, null, true);
    }

    /**
       * Subscribes to receive updates to the home feed. The given `callback` function gets called for
       * each new dive to the general dive feed.
       *
       * If provided we'll only listen to dives that were diveed after `latestDiveId`.
       */ }, { key: 'subscribeToUserFeed', value: function subscribeToUserFeed(
    uid, callback, latestDiveId) {
      return this._subscribeToFeed('/people/' + uid + '/dives', callback,
      latestDiveId, true);
    }

    /**
       * Paginates dives from the user's dives feed.
       *
       * Fetches a page of `USER_PAGE_DIVES_PAGE_SIZE` dives from the user's dives feed.
       *
       * We return a `Promise` which resolves with an Map of dives and a function to the next page or
       * `null` if there is no next page.
       */ }, { key: 'getUserFeedDives', value: function getUserFeedDives(
    uid) {
      return this._getPaginatedFeed('/people/' + uid + '/dives',
      hermesApp.Firebase.USER_PAGE_DIVES_PAGE_SIZE, null, true);
    }

    /**
       * Subscribes to receive updates to the given feed. The given `callback` function gets called
       * for each new entry on the given feed.
       *
       * If provided we'll only listen to entries that were diveed after `latestEntryId`. This allows to
       * listen only for new feed entries after fetching existing entries using `_getPaginatedFeed()`.
       *
       * If needed the dives details can be fetched. This is useful for shallow dive feeds.
       * @private
       */ }, { key: '_subscribeToFeed', value: function _subscribeToFeed(
    uri, callback) {var _this = this;var latestEntryId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;var fetchDiveDetails = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      // Load all dives information.
      var feedRef = this.database.ref(uri);
      if (latestEntryId) {
        feedRef = feedRef.orderByKey().startAt(latestEntryId);
      }
      feedRef.on('child_added', function (feedData) {
        if (feedData.key !== latestEntryId) {
          if (!fetchDiveDetails) {
            callback(feedData.key, feedData.val());
          } else {
            _this.database.ref('/dives/' + feedData.key).once('value').then(
            function (diveData) {return callback(diveData.key, diveData.val());});
          }
        }
      });
      this.firebaseRefs.push(feedRef);
    }

    /**
       * Paginates entries from the given feed.
       *
       * Fetches a page of `pageSize` entries from the given feed.
       *
       * If provided we'll return entries that were diveed before (and including) `earliestEntryId`.
       *
       * We return a `Promise` which resolves with an Map of entries and a function to the next page or
       * `null` if there is no next page.
       *
       * If needed the dives details can be fetched. This is useful for shallow dive feeds like the user
       * home feed and the user dive feed.
       * @private
       */ }, { key: '_getPaginatedFeed', value: function _getPaginatedFeed(
    uri, pageSize) {var _this2 = this;var earliestEntryId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;var fetchDiveDetails = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      console.log('Fetching entries from', uri, 'start at', earliestEntryId, 'page size', pageSize);
      var ref = this.database.ref(uri);
      if (earliestEntryId) {
        ref = ref.orderByKey().endAt(earliestEntryId);
      }
      // We're fetching an additional item as a cheap way to test if there is a next page.
      return ref.limitToLast(pageSize + 1).once('value').then(function (data) {
        var entries = data.val() || {};

        // Figure out if there is a next page.
        var nextPage = null;
        var entryIds = Object.keys(entries);
        if (entryIds.length > pageSize) {
          delete entries[entryIds[0]];
          var nextPageStartingId = entryIds.shift();
          nextPage = function nextPage() {return _this2._getPaginatedFeed(
            uri, pageSize, nextPageStartingId, fetchDiveDetails);};
        }
        if (fetchDiveDetails) {
          // Fetch details of all dives.
          var queries = entryIds.map(function (diveId) {return _this2.getDiveData(diveId);});
          // Since all the requests are being done one the same feed it's unlikely that a single one
          // would fail and not the others so using Promise.all() is not so risky.
          return Promise.all(queries).then(function (results) {
            var deleteOps = [];
            results.forEach(function (result) {
              if (result.val()) {
                entries[result.key] = result.val();
              } else {
                // We encountered a deleted dive. Removing permanently from the feed.
                delete entries[result.key];
                deleteOps.push(_this2.deleteFromFeed(uri, result.key));
              }
            });
            if (deleteOps.length > 0) {
              // We had to remove some deleted dives from the feed. Lets run the query again to get
              // the correct number of dives.
              return _this2._getPaginatedFeed(uri, pageSize, earliestEntryId, fetchDiveDetails);
            }
            return { entries: entries, nextPage: nextPage };
          });
        }
        return { entries: entries, nextPage: nextPage };
      });
    }

    /**
       * Keeps the home feed populated with latest followed users' dives live.
       */ }, { key: 'startHomeFeedLiveUpdaters', value: function startHomeFeedLiveUpdaters()
    {var _this3 = this;
      // Make sure we listen on each followed people's dives.
      var followingRef = this.database.ref('/people/' + this.auth.currentUser.uid + '/following');
      this.firebaseRefs.push(followingRef);
      followingRef.on('child_added', function (followingData) {
        // Start listening the followed user's dives to populate the home feed.
        var followedUid = followingData.key;
        var followedUserDivesRef = _this3.database.ref('/people/' + followedUid + '/dives');
        if (followingData.val() instanceof String) {
          followedUserDivesRef = followedUserDivesRef.orderByKey().startAt(followingData.val());
        }
        _this3.firebaseRefs.push(followedUserDivesRef);
        followedUserDivesRef.on('child_added', function (diveData) {
          if (diveData.key !== followingData.val()) {
            var updates = {};
            updates['/feed/' + _this3.auth.currentUser.uid + '/' + diveData.key] = true;
            updates['/people/' + _this3.auth.currentUser.uid + '/following/' + followedUid] = diveData.key;
            _this3.database.ref().update(updates);
          }
        });
      });
      // Stop listening to users we unfollow.
      followingRef.on('child_removed', function (followingData) {
        // Stop listening the followed user's dives to populate the home feed.
        var followedUserId = followingData.key;
        _this3.database.ref('/people/' + followedUserId + '/dives').off();
      });
    }

    /**
       * Updates the home feed with new followed users' dives and returns a promise once that's done.
       */ }, { key: 'updateHomeFeeds', value: function updateHomeFeeds()
    {var _this4 = this;
      // Make sure we listen on each followed people's dives.
      var followingRef = this.database.ref('/people/' + this.auth.currentUser.uid + '/following');
      return followingRef.once('value', function (followingData) {
        // Start listening the followed user's dives to populate the home feed.
        var following = followingData.val();
        if (!following) {
          return;
        }
        var updateOperations = Object.keys(following).map(function (followedUid) {
          var followedUserDivesRef = _this4.database.ref('/people/' + followedUid + '/dives');
          var lastSyncedDiveId = following[followedUid];
          if (lastSyncedDiveId instanceof String) {
            followedUserDivesRef = followedUserDivesRef.orderByKey().startAt(lastSyncedDiveId);
          }
          return followedUserDivesRef.once('value', function (diveData) {
            var updates = {};
            if (!diveData.val()) {
              return;
            }
            Object.keys(diveData.val()).forEach(function (diveId) {
              if (diveId !== lastSyncedDiveId) {
                updates['/feed/' + _this4.auth.currentUser.uid + '/' + diveId] = true;
                updates['/people/' + _this4.auth.currentUser.uid + '/following/' + followedUid] = diveId;
              }
            });
            return _this4.database.ref().update(updates);
          });
        });
        return Promise.all(updateOperations);
      });
    }

    /**
       * Returns the users which name match the given search query as a Promise.
       */ }, { key: 'searchUsers', value: function searchUsers(
    searchString, maxResults) {
      searchString = latinize(searchString).toLowerCase();
      var query = this.database.ref('/people').
      orderByChild('_search_index/full_name').startAt(searchString).
      limitToFirst(maxResults).once('value');
      var reversedQuery = this.database.ref('/people').
      orderByChild('_search_index/reversed_full_name').startAt(searchString).
      limitToFirst(maxResults).once('value');
      return Promise.all([query, reversedQuery]).then(function (results) {
        var people = {};
        // construct people from the two search queries results.
        results.forEach(function (result) {return result.forEach(function (data) {
            people[data.key] = data.val();
          });});

        // Remove results that do not start with the search query.
        var userIds = Object.keys(people);
        userIds.forEach(function (userId) {
          var name = people[userId]._search_index.full_name;
          var reversedName = people[userId]._search_index.reversed_full_name;
          if (!name.startsWith(searchString) && !reversedName.startsWith(searchString)) {
            delete people[userId];
          }
        });
        return people;
      });
    }

    /**
       * Saves or updates public user data in Firebase (such as image URL, display name...).
       */ }, { key: 'saveUserData', value: function saveUserData(
    imageUrl, displayName) {
      if (!displayName) {
        displayName = 'Anonymous';
      }
      var searchFullName = displayName.toLowerCase();
      var searchReversedFullName = searchFullName.split(' ').reverse().join(' ');
      try {
        searchFullName = latinize(searchFullName);
        searchReversedFullName = latinize(searchReversedFullName);
      } catch (e) {
        console.error(e);
      }

      var updateData = {
        profile_picture: imageUrl || null,
        full_name: displayName,
        _search_index: {
          full_name: searchFullName,
          reversed_full_name: searchReversedFullName } };


      return this.database.ref('people/' + this.auth.currentUser.uid).update(updateData);
    }

    /**
       * Fetches a single dive data.
       */ }, { key: 'getDiveData', value: function getDiveData(
    diveId) {
      return this.database.ref('/dives/' + diveId).once('value');
    }

    /**
       * Subscribe to receive updates on a user's dive like status.
       */ }, { key: 'registerToUserLike', value: function registerToUserLike(
    diveId, callback) {
      // Load and listen to new Likes.
      var likesRef = this.database.ref('likes/' + diveId + '/' + this.auth.currentUser.uid);
      likesRef.on('value', function (data) {return callback(!!data.val());});
      this.firebaseRefs.push(likesRef);
    }

    /**
       * Updates the like status of a dive from the current user.
       */ }, { key: 'updateLike', value: function updateLike(
    diveId, value) {
      return this.database.ref('likes/' + diveId + '/' + this.auth.currentUser.uid).
      set(value ? firebase.database.ServerValue.TIMESTAMP : null);
    }

    /**
       * Adds a comment to a dive.
       */ }, { key: 'addComment', value: function addComment(
    diveId, commentText) {
      var commentObject = {
        text: commentText,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        author: {
          uid: this.auth.currentUser.uid,
          full_name: this.auth.currentUser.displayName || 'Anonymous',
          profile_picture: this.auth.currentUser.photoURL || null } };


      return this.database.ref('comments/' + diveId).push(commentObject);
    }

    /**
       * Deletes a comment.
       */ }, { key: 'deleteComment', value: function deleteComment(
    diveId, commentId) {
      return this.database.ref('/comments/' + diveId + '/' + commentId).remove();
    }

    /**
       * Edit a comment.
       */ }, { key: 'editComment', value: function editComment(
    diveId, commentId, commentText) {
      return this.database.ref('/comments/' + diveId + '/' + commentId).update({
        text: commentText,
        timestamp: firebase.database.ServerValue.TIMESTAMP });

    }

    /**
       * Subscribe to a comment update.
       */ }, { key: 'subscribeToComment', value: function subscribeToComment(
    diveId, commentId, callback) {
      var commentRef = this.database.ref('/comments/' + diveId + '/' + commentId);
      commentRef.on('value', callback);
      this.firebaseRefs.push(commentRef);
    }

    /**
       * Uploads a new Picture to Cloud Storage and adds a new dive referencing it.
       * This returns a Promise which completes with the new Dive ID.
       */ }, { key: 'uploadNewPic', value: function uploadNewPic(
    pic, thumb, fileName, text) {var _this5 = this;
      // Get a reference to where the dive will be created.
      var newDiveKey = this.database.ref('/dives').push().key;

      // Start the pic file upload to Cloud Storage.
      var picRef = this.storage.ref(this.auth.currentUser.uid + '/full/' + newDiveKey + '/' + fileName);
      var metadata = {
        contentType: pic.type };

      var picUploadTask = picRef.put(pic, metadata).then(function (snapshot) {
        console.log('New pic uploaded. Size:', snapshot.totalBytes, 'bytes.');
        var url = snapshot.metadata.downloadURLs[0];
        console.log('File available at', url);
        return url;
      }).catch(function (error) {
        console.error('Error while uploading new pic', error);
      });

      // Start the thumb file upload to Cloud Storage.
      var thumbRef = this.storage.ref(this.auth.currentUser.uid + '/thumb/' + newDiveKey + '/' + fileName);
      var tumbUploadTask = thumbRef.put(thumb, metadata).then(function (snapshot) {
        console.log('New thumb uploaded. Size:', snapshot.totalBytes, 'bytes.');
        var url = snapshot.metadata.downloadURLs[0];
        console.log('File available at', url);
        return url;
      }).catch(function (error) {
        console.error('Error while uploading new thumb', error);
      });

      return Promise.all([picUploadTask, tumbUploadTask]).then(function (urls) {
        // Once both pics and thumbnails has been uploaded add a new dive in the Firebase Database and
        // to its fanned out dives lists (user's dives and home dive).
        var update = {};
        update['/dives/' + newDiveKey] = {
          full_url: urls[0],
          thumb_url: urls[1],
          text: text,
          client: 'web',
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          full_storage_uri: picRef.toString(),
          thumb_storage_uri: thumbRef.toString(),
          author: {
            uid: _this5.auth.currentUser.uid,
            full_name: _this5.auth.currentUser.displayName || 'Anonymous',
            profile_picture: _this5.auth.currentUser.photoURL || null } };


        update['/people/' + _this5.auth.currentUser.uid + '/dives/' + newDiveKey] = true;
        update['/feed/' + _this5.auth.currentUser.uid + '/' + newDiveKey] = true;
        return _this5.database.ref().update(update).then(function () {return newDiveKey;});
      });
    }

    /**
       * Follow/Unfollow a user and return a promise once that's done.
       *
       * If the user is now followed we'll add all his dives to the home feed of the follower.
       * If the user is now not followed anymore all his dives are removed from the follower home feed.
       */ }, { key: 'toggleFollowUser', value: function toggleFollowUser(
    followedUserId, follow) {var _this6 = this;
      // Add or remove dives to the user's home feed.
      return this.database.ref('/people/' + followedUserId + '/dives').once('value').then(
      function (data) {
        var updateData = {};
        var lastDiveId = true;

        // Add/remove followed user's dives to the home feed.
        data.forEach(function (dive) {
          updateData['/feed/' + _this6.auth.currentUser.uid + '/' + dive.key] = follow ? !!follow : null;
          lastDiveId = dive.key;
        });

        // Add/remove followed user to the 'following' list.
        updateData['/people/' + _this6.auth.currentUser.uid + '/following/' + followedUserId] =
        follow ? lastDiveId : null;

        // Add/remove signed-in user to the list of followers.
        updateData['/followers/' + followedUserId + '/' + _this6.auth.currentUser.uid] =
        follow ? !!follow : null;
        return _this6.database.ref().update(updateData);
      });
    }

    /**
       * Blocks/Unblocks a user and return a promise once that's done.
       */ }, { key: 'toggleBlockUser', value: function toggleBlockUser(
    followedUserId, block) {
      // Add or remove dives to the user's home feed.
      var update = {};
      update['/blocking/' + this.auth.currentUser.uid + '/' + followedUserId] = block ? !!block : null;
      update['/blocked/' + followedUserId + '/' + this.auth.currentUser.uid] = block ? !!block : null;

      return this.database.ref().update(update);
    }

    /**
       * Listens to updates on the followed status of the given user.
       */ }, { key: 'registerToFollowStatusUpdate', value: function registerToFollowStatusUpdate(
    userId, callback) {
      var followStatusRef =
      this.database.ref('/people/' + this.auth.currentUser.uid + '/following/' + userId);
      followStatusRef.on('value', callback);
      this.firebaseRefs.push(followStatusRef);
    }

    /**
       * Listens to updates on the blocked status of the given user.
       */ }, { key: 'registerToBlockedStatusUpdate', value: function registerToBlockedStatusUpdate(
    userId, callback) {
      var blockStatusRef =
      this.database.ref('/blocking/' + this.auth.currentUser.uid + '/' + userId);
      blockStatusRef.on('value', callback);
      this.firebaseRefs.push(blockStatusRef);
    }

    /**
       * Enables or disables the notifications for that user.
       */ }, { key: 'toggleNotificationEnabled', value: function toggleNotificationEnabled(
    checked) {
      return this.database.ref('/people/' + this.auth.currentUser.uid + '/notificationEnabled').
      set(checked ? checked : null);
    }

    /**
       * Saves the given notification token.
       */ }, { key: 'saveNotificationToken', value: function saveNotificationToken(
    token) {
      return this.database.ref('/people/' + this.auth.currentUser.uid + '/notificationTokens/' + token).
      set(true);
    }

    /**
       * Listens to updates on the Enable notifications status of the current user.
       */ }, { key: 'registerToNotificationEnabledStatusUpdate', value: function registerToNotificationEnabledStatusUpdate(
    callback) {
      var followStatusRef =
      this.database.ref('/people/' + this.auth.currentUser.uid + '/notificationEnabled');
      followStatusRef.on('value', callback);
      this.firebaseRefs.push(followStatusRef);
    }

    /**
       * Load a single user profile information
       */ }, { key: 'loadUserProfile', value: function loadUserProfile(
    uid) {
      return this.database.ref('/people/' + uid).once('value');
    }

    /**
       * Listens to updates on the likes of a dive and calls the callback with likes counts.
       * TODO: This won't scale if a user has a huge amount of likes. We need to keep track of a
       *       likes count instead.
       */ }, { key: 'registerForLikesCount', value: function registerForLikesCount(
    diveId, likesCallback) {
      var likesRef = this.database.ref('/likes/' + diveId);
      likesRef.on('value', function (data) {return likesCallback(data.numChildren());});
      this.firebaseRefs.push(likesRef);
    }

    /**
       * Listens to updates on the comments of a dive and calls the callback with comments counts.
       */ }, { key: 'registerForCommentsCount', value: function registerForCommentsCount(
    diveId, commentsCallback) {
      var commentsRef = this.database.ref('/comments/' + diveId);
      commentsRef.on('value', function (data) {return commentsCallback(data.numChildren());});
      this.firebaseRefs.push(commentsRef);
    }

    /**
       * Listens to updates on the followers of a person and calls the callback with followers counts.
       * TODO: This won't scale if a user has a huge amount of followers. We need to keep track of a
       *       follower count instead.
       */ }, { key: 'registerForFollowersCount', value: function registerForFollowersCount(
    uid, followersCallback) {
      var followersRef = this.database.ref('/followers/' + uid);
      followersRef.on('value', function (data) {return followersCallback(data.numChildren());});
      this.firebaseRefs.push(followersRef);
    }

    /**
       * Listens to updates on the followed people of a person and calls the callback with its count.
       */ }, { key: 'registerForFollowingCount', value: function registerForFollowingCount(
    uid, followingCallback) {
      var followingRef = this.database.ref('/people/' + uid + '/following');
      followingRef.on('value', function (data) {return followingCallback(data.numChildren());});
      this.firebaseRefs.push(followingRef);
    }

    /**
       * Listens for changes of the thumbnail URL of a given dive.
       */ }, { key: 'registerForThumbChanges', value: function registerForThumbChanges(
    diveId, callback) {
      var thumbRef = this.database.ref('/dives/' + diveId + '/thumb_url');
      thumbRef.on('value', function (data) {return callback(data.val());});
      this.firebaseRefs.push(thumbRef);
    }

    /**
       * Fetch the list of followed people's profile.
       */ }, { key: 'getFollowingProfiles', value: function getFollowingProfiles(
    uid) {var _this7 = this;
      return this.database.ref('/people/' + uid + '/following').once('value').then(function (data) {
        if (data.val()) {
          var followingUids = Object.keys(data.val());
          var fetchProfileDetailsOperations = followingUids.map(
          function (followingUid) {return _this7.loadUserProfile(followingUid);});
          return Promise.all(fetchProfileDetailsOperations).then(function (results) {
            var profiles = {};
            results.forEach(function (result) {
              if (result.val()) {
                profiles[result.key] = result.val();
              }
            });
            return profiles;
          });
        }
        return {};
      });
    }

    /**
       * Listens to updates on the user's dives and calls the callback with user dives counts.
       */ }, { key: 'registerForDivesCount', value: function registerForDivesCount(
    uid, divesCallback) {
      var userDivesRef = this.database.ref('/people/' + uid + '/dives');
      userDivesRef.on('value', function (data) {return divesCallback(data.numChildren());});
      this.firebaseRefs.push(userDivesRef);
    }

    /**
       * Deletes the given dive from the global dive feed and the user's dive feed. Also deletes
       * comments, likes and the file on Cloud Storage.
       */ }, { key: 'deleteDive', value: function deleteDive(
    diveId, picStorageUri, thumbStorageUri) {
      console.log('Deleting ' + diveId);
      var updateObj = {};
      updateObj['/people/' + this.auth.currentUser.uid + '/dives/' + diveId] = null;
      updateObj['/comments/' + diveId] = null;
      updateObj['/likes/' + diveId] = null;
      updateObj['/dives/' + diveId] = null;
      updateObj['/feed/' + this.auth.currentUser.uid + '/' + diveId] = null;
      var deleteFromDatabase = this.database.ref().update(updateObj);
      if (picStorageUri) {
        var deletePicFromStorage = this.storage.refFromURL(picStorageUri).delete();
        var deleteThumbFromStorage = this.storage.refFromURL(thumbStorageUri).delete();
        return Promise.all([deleteFromDatabase, deletePicFromStorage, deleteThumbFromStorage]);
      }
      return deleteFromDatabase;
    }

    /**
       * Flags the dives for inappropriate content.
       */ }, { key: 'reportDive', value: function reportDive(
    diveId) {
      return this.database.ref('/diveFlags/' + diveId + '/' + this.auth.currentUser.uid).set(true);
    }

    /**
       * Flags the comment for inappropriate content.
       */ }, { key: 'reportComment', value: function reportComment(
    diveId, commentId) {
      return this.database.ref('/commentFlags/' + diveId + '/' + commentId + '/' + this.auth.currentUser.uid).set(true);
    }

    /**
       * Deletes the given diveId entry from the user's home feed.
       */ }, { key: 'deleteFromFeed', value: function deleteFromFeed(
    uri, diveId) {
      return this.database.ref(uri + '/' + diveId).remove();
    }

    /**
       * Listens to deletions on dives from the global feed.
       */ }, { key: 'registerForDivesDeletion', value: function registerForDivesDeletion(
    deletionCallback) {
      var divesRef = this.database.ref('/dives');
      divesRef.on('child_removed', function (data) {return deletionCallback(data.key);});
      this.firebaseRefs.push(divesRef);
    } }]);return _class;}();


hermesApp.firebase = new hermesApp.Firebase();
//# sourceMappingURL=firebase.js.map