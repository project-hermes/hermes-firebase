'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

window.hermesApp = window.hermesApp || {};

/**
                                            * Set of utilities to handle Material Design Lite elements.
                                            */
hermesApp.MaterialUtils = function () {function _class() {_classCallCheck(this, _class);}_createClass(_class, null, [{ key: 'refreshSwitchState',

    /**
                                                                                                                                                   * Refreshes the UI state of the given Material Design Checkbox / Switch element.
                                                                                                                                                   */value: function refreshSwitchState(
    element) {
      if (element instanceof jQuery) {
        element = element[0];
      }
      if (element.MaterialSwitch) {
        element.MaterialSwitch.checkDisabled();
        element.MaterialSwitch.checkToggleState();
      }
    }

    /**
       * Closes the drawer if it is open.
       */ }, { key: 'closeDrawer', value: function closeDrawer()
    {
      var drawerObfuscator = $('.mdl-layout__obfuscator');
      if (drawerObfuscator.hasClass('is-visible')) {
        drawerObfuscator.click();
      }
    }

    /**
       * Clears the given Material Text Field.
       */ }, { key: 'clearTextField', value: function clearTextField(
    element) {
      element.value = '';
      element.parentElement.MaterialTextfield.boundUpdateClassesHandler();
    }

    /**
       * Upgrades the text fields in the element.
       */ }, { key: 'upgradeTextFields', value: function upgradeTextFields(
    element) {
      componentHandler.upgradeElements($('.mdl-textfield', element).get());
    }

    /**
       * Upgrades the dropdowns in the element.
       */ }, { key: 'upgradeDropdowns', value: function upgradeDropdowns(
    element) {
      if (element) {
        componentHandler.upgradeElements($('.mdl-js-button', element).get());
        componentHandler.upgradeElements($('.mdl-js-menu', element).get());
      } else {
        componentHandler.upgradeDom();
      }
    }

    /**
       * Returns a Promise which resolves when the user has reached the bottom of the page while
       * scrolling.
       * If an `offset` is specified the promise will resolve before reaching the bottom of
       * the page by the given amount offset in pixels.
       */ }, { key: 'onEndScroll', value: function onEndScroll()
    {var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var resolver = new $.Deferred();
      var mdlLayoutElement = $('.mdl-layout');
      mdlLayoutElement.scroll(function () {
        if (window.innerHeight + mdlLayoutElement.scrollTop() + offset >=
        mdlLayoutElement.prop('scrollHeight')) {
          console.log('Scroll End Reached!');
          mdlLayoutElement.unbind('scroll');
          resolver.resolve();
        }
      });
      console.log('Now watching for Scroll End.');
      return resolver.promise();
    }

    /**
       * Stops scroll listeners.
       */ }, { key: 'stopOnEndScrolls', value: function stopOnEndScrolls()
    {
      var mdlLayoutElement = $('.mdl-layout');
      mdlLayoutElement.unbind('scroll');
    } }]);return _class;}();
//# sourceMappingURL=utils.js.map