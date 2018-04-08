'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

window.hermesApp = window.hermesApp || {};

/**
                                            * Handles uploads of new pics.
                                            */
hermesApp.Uploader = function () {_createClass(_class, null, [{ key: 'FULL_IMAGE_SPECS',

    /**
                                                                                          * @return {number}
                                                                                          */get: function get()
    {
      return {
        maxDimension: 1280,
        quality: 0.9 };

    }

    /**
       * @return {number}
       */ }, { key: 'THUMB_IMAGE_SPECS', get: function get()
    {
      return {
        maxDimension: 640,
        quality: 0.7 };

    }

    /**
       * Inititializes the pics uploader/post creator.
       * @constructor
       */ }]);
  function _class() {var _this = this;_classCallCheck(this, _class);
    // Firebase SDK
    this.database = firebase.database();
    this.auth = firebase.auth();
    this.storage = firebase.storage();

    this.addPolyfills();

    $(document).ready(function () {
      // DOM Elements
      _this.addButton = $('#add');
      _this.addButtonFloating = $('#add-floating');
      _this.imageInput = $('#hm-mediacapture');
      _this.overlay = $('.hm-overlay', '#page-add');
      _this.newPictureContainer = $('#newPictureContainer');
      _this.uploadButton = $('.hm-upload');
      _this.imageCaptionInput = $('#imageCaptionInput');
      _this.uploadPicForm = $('#uploadPicForm');
      _this.toast = $('.mdl-js-snackbar');

      // Event bindings
      _this.addButton.click(function () {return _this.initiatePictureCapture();});
      _this.addButtonFloating.click(function () {return _this.initiatePictureCapture();});
      _this.imageInput.change(function (e) {return _this.readPicture(e);});
      _this.uploadPicForm.submit(function (e) {return _this.uploadPic(e);});
      _this.imageCaptionInput.keyup(function () {return _this.uploadButton.prop('disabled', !_this.imageCaptionInput.val());});
    });
  }

  // Adds polyfills required for the Uploader.
  _createClass(_class, [{ key: 'addPolyfills', value: function addPolyfills() {
      // Polyfill for canvas.toBlob().
      if (!HTMLCanvasElement.prototype.toBlob) {
        Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
          value: function value(callback, type, quality) {
            var binStr = atob(this.toDataURL(type, quality).split(',')[1]);
            var len = binStr.length;
            var arr = new Uint8Array(len);

            for (var i = 0; i < len; i++) {
              arr[i] = binStr.charCodeAt(i);
            }

            callback(new Blob([arr], { type: type || 'image/png' }));
          } });

      }
    }

    /**
       * Start taking a picture.
       */ }, { key: 'initiatePictureCapture', value: function initiatePictureCapture()
    {
      this.imageInput.trigger('click');
    }

    /**
       * Displays the given pic in the New Pic Upload dialog.
       */ }, { key: 'displayPicture', value: function displayPicture(
    url) {
      this.newPictureContainer.attr('src', url);
      page('/add');
      this.imageCaptionInput.focus();
      this.uploadButton.prop('disabled', true);
    }

    /**
       * Enables or disables the UI. Typically while the image is uploading.
       */ }, { key: 'disableUploadUi', value: function disableUploadUi(
    disabled) {
      this.uploadButton.prop('disabled', disabled);
      this.addButton.prop('disabled', disabled);
      this.addButtonFloating.prop('disabled', disabled);
      this.imageCaptionInput.prop('disabled', disabled);
      this.overlay.toggle(disabled);
    }

    /**
       * Reads the picture the has been selected by the file picker.
       */ }, { key: 'readPicture', value: function readPicture(
    event) {var _this2 = this;
      this.clear();

      var file = event.target.files[0]; // FileList object
      this.currentFile = file;

      // Clear the selection in the file picker input.
      this.imageInput.wrap('<form>').closest('form').get(0).reset();
      this.imageInput.unwrap();

      // Only process image files.
      if (file.type.match('image.*')) {
        var reader = new FileReader();
        reader.onload = function (e) {return _this2.displayPicture(e.target.result);};
        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
        this.disableUploadUi(false);
      }
    }

    /**
       * Returns a Canvas containing the given image scaled down to the given max dimension.
       * @private
       * @static
       */ }, { key: 'generateImages',




















    /**
                                       * Generates the full size image and image thumb using canvas and returns them in a promise.
                                       */value: function generateImages()
    {
      var fullDeferred = new $.Deferred();
      var thumbDeferred = new $.Deferred();

      var resolveFullBlob = function resolveFullBlob(blob) {return fullDeferred.resolve(blob);};
      var resolveThumbBlob = function resolveThumbBlob(blob) {return thumbDeferred.resolve(blob);};

      var displayPicture = function displayPicture(url) {
        var image = new Image();
        image.src = url;

        // Generate thumb.
        var maxThumbDimension = hermesApp.Uploader.THUMB_IMAGE_SPECS.maxDimension;
        var thumbCanvas = hermesApp.Uploader._getScaledCanvas(image, maxThumbDimension);
        thumbCanvas.toBlob(resolveThumbBlob, 'image/jpeg', hermesApp.Uploader.THUMB_IMAGE_SPECS.quality);

        // Generate full sized image.
        var maxFullDimension = hermesApp.Uploader.FULL_IMAGE_SPECS.maxDimension;
        var fullCanvas = hermesApp.Uploader._getScaledCanvas(image, maxFullDimension);
        fullCanvas.toBlob(resolveFullBlob, 'image/jpeg', hermesApp.Uploader.FULL_IMAGE_SPECS.quality);
      };

      var reader = new FileReader();
      reader.onload = function (e) {return displayPicture(e.target.result);};
      reader.readAsDataURL(this.currentFile);

      return Promise.all([fullDeferred.promise(), thumbDeferred.promise()]).then(function (results) {
        return {
          full: results[0],
          thumb: results[1] };

      });
    }

    /**
       * Uploads the pic to Cloud Storage and add a new post into the Firebase Database.
       */ }, { key: 'uploadPic', value: function uploadPic(
    e) {var _this3 = this;
      e.preventDefault();
      this.disableUploadUi(true);
      var imageCaption = this.imageCaptionInput.val();

      this.generateImages().then(function (pics) {
        // Upload the File upload to Cloud Storage and create new post.
        hermesApp.firebase.uploadNewPic(pics.full, pics.thumb, _this3.currentFile.name, imageCaption).
        then(function (postId) {
          page('/user/' + _this3.auth.currentUser.uid);
          var data = {
            message: 'New pic has been posted!',
            actionHandler: function actionHandler() {return page('/post/' + postId);},
            actionText: 'View',
            timeout: 10000 };

          _this3.toast[0].MaterialSnackbar.showSnackbar(data);
          _this3.disableUploadUi(false);
        }, function (error) {
          console.error(error);
          var data = {
            message: 'There was an error while posting your pic. Sorry!',
            timeout: 5000 };

          _this3.toast[0].MaterialSnackbar.showSnackbar(data);
          _this3.disableUploadUi(false);
        });
      });
    }

    /**
       * Clear the uploader.
       */ }, { key: 'clear', value: function clear()
    {
      this.currentFile = null;

      // Cancel all Firebase listeners.
      hermesApp.firebase.cancelAllSubscriptions();

      // Clear previously displayed pic.
      this.newPictureContainer.attr('src', '');

      // Clear the text field.
      hermesApp.MaterialUtils.clearTextField(this.imageCaptionInput[0]);

      // Make sure UI is not disabled.
      this.disableUploadUi(false);
    } }], [{ key: '_getScaledCanvas', value: function _getScaledCanvas(image, maxDimension) {var thumbCanvas = document.createElement('canvas');if (image.width > maxDimension || image.height > maxDimension) {if (image.width > image.height) {thumbCanvas.width = maxDimension;thumbCanvas.height = maxDimension * image.height / image.width;} else {thumbCanvas.width = maxDimension * image.width / image.height;thumbCanvas.height = maxDimension;}} else {thumbCanvas.width = image.width;thumbCanvas.height = image.height;}thumbCanvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height, 0, 0, thumbCanvas.width, thumbCanvas.height);return thumbCanvas;} }]);return _class;}();


hermesApp.uploader = new hermesApp.Uploader();
//# sourceMappingURL=uploader.js.map