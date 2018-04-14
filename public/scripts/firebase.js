
window.hermesApp = window.hermesApp || {};

/**
 * Handles all Firebase interactions.
 */
hermesApp.Firebase = class {
  /**
   * Number of dives loaded initially and per page for the feeds.
   * @return {number}
   */
  static get DIVES_PAGE_SIZE() {
    return 5;
  }

  /**
   * Number of dives loaded initially and per page for the User Profile page.
   * @return {number}
   */
  static get USER_PAGE_DIVES_PAGE_SIZE() {
    return 6;
  }

  /**
   * Number of dives comments loaded initially and per page.
   * @return {number}
   */
  static get COMMENTS_PAGE_SIZE() {
    return 3;
  }

  /**
   * Initializes this Firebase facade.
   * @constructor
   */
  constructor() {
    // Firebase SDK.
    this.database = firebase.database();
    this.storage = firebase.storage();
    this.auth = firebase.auth();

    // Firebase references that are listened to.
    this.firebaseRefs = [];
  }

  /**
   * Turns off all Firebase listeners.
   */
  cancelAllSubscriptions() {
    this.firebaseRefs.forEach(ref => ref.off());
    this.firebaseRefs = [];
  }

  /**
   * Subscribes to receive updates from a dive's comments. The given `callback` function gets
   * called for each new comment to the dive with ID `diveId`.
   *
   * If provided we'll only listen to comments that were diveed after `latestCommentId`.
   */
  subscribeToComments(diveId, callback, latestCommentId) {
    return this._subscribeToFeed(`/comments/${diveId}`, callback, latestCommentId, false);
  }

  /**
   * Paginates comments from the dive with ID `diveId`.
   *
   * Fetches a page of `COMMENTS_PAGE_SIZE` comments from the dive.
   *
   * We return a `Promise` which resolves with an Map of comments and a function to the next page or
   * `null` if there is no next page.
   */
  getComments(diveId) {
    return this._getPaginatedFeed(`/comments/${diveId}`,
        hermesApp.Firebase.COMMENTS_PAGE_SIZE, null, false);
  }

  /**
   * Subscribes to receive updates to the general dives feed. The given `callback` function gets
   * called for each new dive to the general dive feed.
   *
   * If provided we'll only listen to dives that were diveed after `latestDiveId`.
   */
  subscribeToGeneralFeed(callback, latestDiveId) {
    return this._subscribeToFeed('/dives/', callback, latestDiveId);
  }

  /**
   * Paginates dives from the global dive feed.
   *
   * Fetches a page of `DIVES_PAGE_SIZE` dives from the global feed.
   *
   * We return a `Promise` which resolves with an Map of dives and a function to the next page or
   * `null` if there is no next page.
   */
  getDives() {
    return this._getPaginatedFeed('/dives/', hermesApp.Firebase.DIVES_PAGE_SIZE);
  }

  /**
   * Subscribes to receive updates to the home feed. The given `callback` function gets called for
   * each new dive to the general dive feed.
   *
   * If provided we'll only listen to dives that were diveed after `latestDiveId`.
   */
  subscribeToHomeFeed(callback, latestDiveId) {
    return this._subscribeToFeed(`/feed/${this.auth.currentUser.uid}`, callback, latestDiveId,
        true);
  }

  /**
   * Paginates dives from the user's home feed.
   *
   * Fetches a page of `DIVES_PAGE_SIZE` dives from the user's home feed.
   *
   * We return a `Promise` which resolves with an Map of dives and a function to the next page or
   * `null` if there is no next page.
   */
  getHomeFeedDives() {
    return this._getPaginatedFeed(`/feed/${this.auth.currentUser.uid}`,
        hermesApp.Firebase.DIVES_PAGE_SIZE, null, true);
  }

  /**
   * Subscribes to receive updates to the home feed. The given `callback` function gets called for
   * each new dive to the general dive feed.
   *
   * If provided we'll only listen to dives that were diveed after `latestDiveId`.
   */
  subscribeToUserFeed(uid, callback, latestDiveId) {
    return this._subscribeToFeed(`/people/${uid}/dives`, callback,
        latestDiveId, true);
  }

  /**
   * Paginates dives from the user's dives feed.
   *
   * Fetches a page of `USER_PAGE_DIVES_PAGE_SIZE` dives from the user's dives feed.
   *
   * We return a `Promise` which resolves with an Map of dives and a function to the next page or
   * `null` if there is no next page.
   */
  getUserFeedDives(uid) {
    return this._getPaginatedFeed(`/people/${uid}/dives`,
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
   */
  _subscribeToFeed(uri, callback, latestEntryId = null, fetchDiveDetails = false) {
    // Load all dives information.
    let feedRef = this.database.ref(uri);
    if (latestEntryId) {
      feedRef = feedRef.orderByKey().startAt(latestEntryId);
    }
    feedRef.on('child_added', feedData => {
      if (feedData.key !== latestEntryId) {
        if (!fetchDiveDetails) {
          callback(feedData.key, feedData.val());
        } else {
          this.database.ref(`/dives/${feedData.key}`).once('value').then(
              diveData => callback(diveData.key, diveData.val()));
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
   */
  _getPaginatedFeed(uri, pageSize, earliestEntryId = null, fetchDiveDetails = false) {
    console.log('Fetching entries from', uri, 'start at', earliestEntryId, 'page size', pageSize);
    let ref = this.database.ref(uri);
    if (earliestEntryId) {
      ref = ref.orderByKey().endAt(earliestEntryId);
    }
    // We're fetching an additional item as a cheap way to test if there is a next page.
    return ref.limitToLast(pageSize + 1).once('value').then(data => {
      const entries = data.val() || {};

      // Figure out if there is a next page.
      let nextPage = null;
      const entryIds = Object.keys(entries);
      if (entryIds.length > pageSize) {
        delete entries[entryIds[0]];
        const nextPageStartingId = entryIds.shift();
        nextPage = () => this._getPaginatedFeed(
            uri, pageSize, nextPageStartingId, fetchDiveDetails);
      }
      if (fetchDiveDetails) {
        // Fetch details of all dives.
        const queries = entryIds.map(diveId => this.getDiveData(diveId));
        // Since all the requests are being done one the same feed it's unlikely that a single one
        // would fail and not the others so using Promise.all() is not so risky.
        return Promise.all(queries).then(results => {
          const deleteOps = [];
          results.forEach(result => {
            if (result.val()) {
              entries[result.key] = result.val();
            } else {
              // We encountered a deleted dive. Removing permanently from the feed.
              delete entries[result.key];
              deleteOps.push(this.deleteFromFeed(uri, result.key));
            }
          });
          if (deleteOps.length > 0) {
            // We had to remove some deleted dives from the feed. Lets run the query again to get
            // the correct number of dives.
            return this._getPaginatedFeed(uri, pageSize, earliestEntryId, fetchDiveDetails);
          }
          return {entries: entries, nextPage: nextPage};
        });
      }
      return {entries: entries, nextPage: nextPage};
    });
  }

  /**
   * Keeps the home feed populated with latest followed users' dives live.
   */
  startHomeFeedLiveUpdaters() {
    // Make sure we listen on each followed people's dives.
    const followingRef = this.database.ref(`/people/${this.auth.currentUser.uid}/following`);
    this.firebaseRefs.push(followingRef);
    followingRef.on('child_added', followingData => {
      // Start listening the followed user's dives to populate the home feed.
      const followedUid = followingData.key;
      let followedUserDivesRef = this.database.ref(`/people/${followedUid}/dives`);
      if (followingData.val() instanceof String) {
        followedUserDivesRef = followedUserDivesRef.orderByKey().startAt(followingData.val());
      }
      this.firebaseRefs.push(followedUserDivesRef);
      followedUserDivesRef.on('child_added', diveData => {
        if (diveData.key !== followingData.val()) {
          const updates = {};
          updates[`/feed/${this.auth.currentUser.uid}/${diveData.key}`] = true;
          updates[`/people/${this.auth.currentUser.uid}/following/${followedUid}`] = diveData.key;
          this.database.ref().update(updates);
        }
      });
    });
    // Stop listening to users we unfollow.
    followingRef.on('child_removed', followingData => {
      // Stop listening the followed user's dives to populate the home feed.
      const followedUserId = followingData.key;
      this.database.ref(`/people/${followedUserId}/dives`).off();
    });
  }

  /**
   * Updates the home feed with new followed users' dives and returns a promise once that's done.
   */
  updateHomeFeeds() {
    // Make sure we listen on each followed people's dives.
    const followingRef = this.database.ref(`/people/${this.auth.currentUser.uid}/following`);
    return followingRef.once('value', followingData => {
      // Start listening the followed user's dives to populate the home feed.
      const following = followingData.val();
      if (!following) {
        return;
      }
      const updateOperations = Object.keys(following).map(followedUid => {
        let followedUserDivesRef = this.database.ref(`/people/${followedUid}/dives`);
        const lastSyncedDiveId = following[followedUid];
        if (lastSyncedDiveId instanceof String) {
          followedUserDivesRef = followedUserDivesRef.orderByKey().startAt(lastSyncedDiveId);
        }
        return followedUserDivesRef.once('value', diveData => {
          const updates = {};
          if (!diveData.val()) {
            return;
          }
          Object.keys(diveData.val()).forEach(diveId => {
            if (diveId !== lastSyncedDiveId) {
              updates[`/feed/${this.auth.currentUser.uid}/${diveId}`] = true;
              updates[`/people/${this.auth.currentUser.uid}/following/${followedUid}`] = diveId;
            }
          });
          return this.database.ref().update(updates);
        });
      });
      return Promise.all(updateOperations);
    });
  }

  /**
   * Returns the users which name match the given search query as a Promise.
   */
  searchUsers(searchString, maxResults) {
    searchString = latinize(searchString).toLowerCase();
    const query = this.database.ref('/people')
        .orderByChild('_search_index/full_name').startAt(searchString)
        .limitToFirst(maxResults).once('value');
    const reversedQuery = this.database.ref('/people')
        .orderByChild('_search_index/reversed_full_name').startAt(searchString)
        .limitToFirst(maxResults).once('value');
    return Promise.all([query, reversedQuery]).then(results => {
      const people = {};
      // construct people from the two search queries results.
      results.forEach(result => result.forEach(data => {
        people[data.key] = data.val();
      }));

      // Remove results that do not start with the search query.
      const userIds = Object.keys(people);
      userIds.forEach(userId => {
        const name = people[userId]._search_index.full_name;
        const reversedName = people[userId]._search_index.reversed_full_name;
        if (!name.startsWith(searchString) && !reversedName.startsWith(searchString)) {
          delete people[userId];
        }
      });
      return people;
    });
  }

  /**
   * Saves or updates public user data in Firebase (such as image URL, display name...).
   */
  saveUserData(imageUrl, displayName) {
    if (!displayName) {
      displayName = 'Anonymous';
    }
    let searchFullName = displayName.toLowerCase();
    let searchReversedFullName = searchFullName.split(' ').reverse().join(' ');
    try {
      searchFullName = latinize(searchFullName);
      searchReversedFullName = latinize(searchReversedFullName);
    } catch (e) {
      console.error(e);
    }

    const updateData = {
      profile_picture: imageUrl || null,
      full_name: displayName,
      _search_index: {
        full_name: searchFullName,
        reversed_full_name: searchReversedFullName
      }
    };
    return this.database.ref(`people/${this.auth.currentUser.uid}`).update(updateData);
  }

  /**
   * Fetches a single dive data.
   */
  getDiveData(diveId) {
    return this.database.ref(`/dives/${diveId}`).once('value');
  }

  /**
   * Subscribe to receive updates on a user's dive like status.
   */
  registerToUserLike(diveId, callback) {
    // Load and listen to new Likes.
    const likesRef = this.database.ref(`likes/${diveId}/${this.auth.currentUser.uid}`);
    likesRef.on('value', data => callback(!!data.val()));
    this.firebaseRefs.push(likesRef);
  }

  /**
   * Updates the like status of a dive from the current user.
   */
  updateLike(diveId, value) {
    return this.database.ref(`likes/${diveId}/${this.auth.currentUser.uid}`)
        .set(value ? firebase.database.ServerValue.TIMESTAMP : null);
  }

  /**
   * Adds a comment to a dive.
   */
  addComment(diveId, commentText) {
    const commentObject = {
      text: commentText,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      author: {
        uid: this.auth.currentUser.uid,
        full_name: this.auth.currentUser.displayName || 'Anonymous',
        profile_picture: this.auth.currentUser.photoURL || null
      }
    };
    return this.database.ref(`comments/${diveId}`).push(commentObject);
  }

  /**
   * Deletes a comment.
   */
  deleteComment(diveId, commentId) {
    return this.database.ref(`/comments/${diveId}/${commentId}`).remove();
  }

  /**
   * Edit a comment.
   */
  editComment(diveId, commentId, commentText) {
    return this.database.ref(`/comments/${diveId}/${commentId}`).update({
      text: commentText,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  }

  /**
   * Subscribe to a comment update.
   */
  subscribeToComment(diveId, commentId, callback) {
    const commentRef = this.database.ref(`/comments/${diveId}/${commentId}`);
    commentRef.on('value', callback);
    this.firebaseRefs.push(commentRef);
  }

  /**
   * Uploads a new Picture to Cloud Storage and adds a new dive referencing it.
   * This returns a Promise which completes with the new Dive ID.
   */
  uploadNewPic(pic, thumb, fileName, text) {
    // Get a reference to where the dive will be created.
    const newDiveKey = this.database.ref('/dives').push().key;

    // Start the pic file upload to Cloud Storage.
    const picRef = this.storage.ref(`${this.auth.currentUser.uid}/full/${newDiveKey}/${fileName}`);
    const metadata = {
      contentType: pic.type
    };
    const picUploadTask = picRef.put(pic, metadata).then(snapshot => {
      console.log('New pic uploaded. Size:', snapshot.totalBytes, 'bytes.');
      const url = snapshot.metadata.downloadURLs[0];
      console.log('File available at', url);
      return url;
    }).catch(error => {
      console.error('Error while uploading new pic', error);
    });

    // Start the thumb file upload to Cloud Storage.
    const thumbRef = this.storage.ref(`${this.auth.currentUser.uid}/thumb/${newDiveKey}/${fileName}`);
    const tumbUploadTask = thumbRef.put(thumb, metadata).then(snapshot => {
      console.log('New thumb uploaded. Size:', snapshot.totalBytes, 'bytes.');
      const url = snapshot.metadata.downloadURLs[0];
      console.log('File available at', url);
      return url;
    }).catch(error => {
      console.error('Error while uploading new thumb', error);
    });

    return Promise.all([picUploadTask, tumbUploadTask]).then(urls => {
      // Once both pics and thumbnails has been uploaded add a new dive in the Firebase Database and
      // to its fanned out dives lists (user's dives and home dive).
      const update = {};
      update[`/dives/${newDiveKey}`] = {
        full_url: urls[0],
        thumb_url: urls[1],
        text: text,
        client: 'web',
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        full_storage_uri: picRef.toString(),
        thumb_storage_uri: thumbRef.toString(),
        author: {
          uid: this.auth.currentUser.uid,
          full_name: this.auth.currentUser.displayName || 'Anonymous',
          profile_picture: this.auth.currentUser.photoURL || null
        }
      };
      update[`/people/${this.auth.currentUser.uid}/dives/${newDiveKey}`] = true;
      update[`/feed/${this.auth.currentUser.uid}/${newDiveKey}`] = true;
      return this.database.ref().update(update).then(() => newDiveKey);
    });
  }

  /**
   * Follow/Unfollow a user and return a promise once that's done.
   *
   * If the user is now followed we'll add all his dives to the home feed of the follower.
   * If the user is now not followed anymore all his dives are removed from the follower home feed.
   */
  toggleFollowUser(followedUserId, follow) {
    // Add or remove dives to the user's home feed.
    return this.database.ref(`/people/${followedUserId}/dives`).once('value').then(
        data => {
          const updateData = {};
          let lastDiveId = true;

          // Add/remove followed user's dives to the home feed.
          data.forEach(dive => {
            updateData[`/feed/${this.auth.currentUser.uid}/${dive.key}`] = follow ? !!follow : null;
            lastDiveId = dive.key;
          });

          // Add/remove followed user to the 'following' list.
          updateData[`/people/${this.auth.currentUser.uid}/following/${followedUserId}`] =
              follow ? lastDiveId : null;

          // Add/remove signed-in user to the list of followers.
          updateData[`/followers/${followedUserId}/${this.auth.currentUser.uid}`] =
              follow ? !!follow : null;
          return this.database.ref().update(updateData);
        });
  }

  /**
   * Blocks/Unblocks a user and return a promise once that's done.
   */
  toggleBlockUser(followedUserId, block) {
    // Add or remove dives to the user's home feed.
    const update = {};
    update[`/blocking/${this.auth.currentUser.uid}/${followedUserId}`] = block ? !!block : null;
    update[`/blocked/${followedUserId}/${this.auth.currentUser.uid}`] = block ? !!block : null;

    return this.database.ref().update(update);
  }

  /**
   * Listens to updates on the followed status of the given user.
   */
  registerToFollowStatusUpdate(userId, callback) {
    const followStatusRef =
        this.database.ref(`/people/${this.auth.currentUser.uid}/following/${userId}`);
    followStatusRef.on('value', callback);
    this.firebaseRefs.push(followStatusRef);
  }

  /**
   * Listens to updates on the blocked status of the given user.
   */
  registerToBlockedStatusUpdate(userId, callback) {
    const blockStatusRef =
        this.database.ref(`/blocking/${this.auth.currentUser.uid}/${userId}`);
    blockStatusRef.on('value', callback);
    this.firebaseRefs.push(blockStatusRef);
  }

  /**
   * Enables or disables the notifications for that user.
   */
  toggleNotificationEnabled(checked) {
    return this.database.ref(`/people/${this.auth.currentUser.uid}/notificationEnabled`)
        .set(checked ? checked : null);
  }

  /**
   * Saves the given notification token.
   */
  saveNotificationToken(token) {
    return this.database.ref(`/people/${this.auth.currentUser.uid}/notificationTokens/${token}`)
        .set(true);
  }

  /**
   * Listens to updates on the Enable notifications status of the current user.
   */
  registerToNotificationEnabledStatusUpdate(callback) {
    const followStatusRef =
        this.database.ref(`/people/${this.auth.currentUser.uid}/notificationEnabled`);
    followStatusRef.on('value', callback);
    this.firebaseRefs.push(followStatusRef);
  }

  /**
   * Load a single user profile information
   */
  loadUserProfile(uid) {
    return this.database.ref(`/people/${uid}`).once('value');
  }

  /**
   * Listens to updates on the likes of a dive and calls the callback with likes counts.
   * TODO: This won't scale if a user has a huge amount of likes. We need to keep track of a
   *       likes count instead.
   */
  registerForLikesCount(diveId, likesCallback) {
    const likesRef = this.database.ref(`/likes/${diveId}`);
    likesRef.on('value', data => likesCallback(data.numChildren()));
    this.firebaseRefs.push(likesRef);
  }

  /**
   * Listens to updates on the comments of a dive and calls the callback with comments counts.
   */
  registerForCommentsCount(diveId, commentsCallback) {
    const commentsRef = this.database.ref(`/comments/${diveId}`);
    commentsRef.on('value', data => commentsCallback(data.numChildren()));
    this.firebaseRefs.push(commentsRef);
  }

  /**
   * Listens to updates on the followers of a person and calls the callback with followers counts.
   * TODO: This won't scale if a user has a huge amount of followers. We need to keep track of a
   *       follower count instead.
   */
  registerForFollowersCount(uid, followersCallback) {
    const followersRef = this.database.ref(`/followers/${uid}`);
    followersRef.on('value', data => followersCallback(data.numChildren()));
    this.firebaseRefs.push(followersRef);
  }

  /**
   * Listens to updates on the followed people of a person and calls the callback with its count.
   */
  registerForFollowingCount(uid, followingCallback) {
    const followingRef = this.database.ref(`/people/${uid}/following`);
    followingRef.on('value', data => followingCallback(data.numChildren()));
    this.firebaseRefs.push(followingRef);
  }

  /**
   * Listens for changes of the thumbnail URL of a given dive.
   */
  registerForThumbChanges(diveId, callback) {
    const thumbRef = this.database.ref(`/dives/${diveId}/thumb_url`);
    thumbRef.on('value', data => callback(data.val()));
    this.firebaseRefs.push(thumbRef);
  }

  /**
   * Fetch the list of followed people's profile.
   */
  getFollowingProfiles(uid) {
    return this.database.ref(`/people/${uid}/following`).once('value').then(data => {
      if (data.val()) {
        const followingUids = Object.keys(data.val());
        const fetchProfileDetailsOperations = followingUids.map(
          followingUid => this.loadUserProfile(followingUid));
        return Promise.all(fetchProfileDetailsOperations).then(results => {
          const profiles = {};
          results.forEach(result => {
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
   */
  registerForDivesCount(uid, divesCallback) {
    const userDivesRef = this.database.ref(`/people/${uid}/dives`);
    userDivesRef.on('value', data => divesCallback(data.numChildren()));
    this.firebaseRefs.push(userDivesRef);
  }

  /**
   * Deletes the given dive from the global dive feed and the user's dive feed. Also deletes
   * comments, likes and the file on Cloud Storage.
   */
  deleteDive(diveId, picStorageUri, thumbStorageUri) {
    console.log(`Deleting ${diveId}`);
    const updateObj = {};
    updateObj[`/people/${this.auth.currentUser.uid}/dives/${diveId}`] = null;
    updateObj[`/comments/${diveId}`] = null;
    updateObj[`/likes/${diveId}`] = null;
    updateObj[`/dives/${diveId}`] = null;
    updateObj[`/feed/${this.auth.currentUser.uid}/${diveId}`] = null;
    const deleteFromDatabase = this.database.ref().update(updateObj);
    if (picStorageUri) {
      const deletePicFromStorage = this.storage.refFromURL(picStorageUri).delete();
      const deleteThumbFromStorage = this.storage.refFromURL(thumbStorageUri).delete();
      return Promise.all([deleteFromDatabase, deletePicFromStorage, deleteThumbFromStorage]);
    }
    return deleteFromDatabase;
  }

  /**
   * Flags the dives for inappropriate content.
   */
  reportDive(diveId) {
    return this.database.ref(`/diveFlags/${diveId}/${this.auth.currentUser.uid}`).set(true);
  }

  /**
   * Flags the comment for inappropriate content.
   */
  reportComment(diveId, commentId) {
    return this.database.ref(`/commentFlags/${diveId}/${commentId}/${this.auth.currentUser.uid}`).set(true);
  }

  /**
   * Deletes the given diveId entry from the user's home feed.
   */
  deleteFromFeed(uri, diveId) {
    return this.database.ref(`${uri}/${diveId}`).remove();
  }

  /**
   * Listens to deletions on dives from the global feed.
   */
  registerForDivesDeletion(deletionCallback) {
    const divesRef = this.database.ref(`/dives`);
    divesRef.on('child_removed', data => deletionCallback(data.key));
    this.firebaseRefs.push(divesRef);
  }
};

hermesApp.firebase = new hermesApp.Firebase();
