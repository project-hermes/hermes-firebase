'use strict';

window.hermesApp = window.hermesApp || {};

/**
 * Set of utilities to handle Material Design Lite elements.
 */
hermesApp.MaterialUtils = class {

  /**
   * Refreshes the UI state of the given Material Design Checkbox / Switch element.
   */
  static refreshSwitchState(element) {
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
   */
  static closeDrawer() {
    const drawerObfuscator = $('.mdl-layout__obfuscator');
    if (drawerObfuscator.hasClass('is-visible')) {
      drawerObfuscator.click();
    }
  }

  /**
   * Clears the given Material Text Field.
   */
  static clearTextField(element) {
    element.value = '';
    element.parentElement.MaterialTextfield.boundUpdateClassesHandler();
  }

  /**
   * Upgrades the text fields in the element.
   */
  static upgradeTextFields(element) {
    componentHandler.upgradeElements($('.mdl-textfield', element).get());
  }

  /**
   * Upgrades the dropdowns in the element.
   */
  static upgradeDropdowns(element) {
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
   */
  static onEndScroll(offset = 0) {
    const resolver = new $.Deferred();
    const mdlLayoutElement = $('.mdl-layout');
    mdlLayoutElement.scroll(() => {
      if ((window.innerHeight + mdlLayoutElement.scrollTop() + offset) >=
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
   */
  static stopOnEndScrolls() {
    const mdlLayoutElement = $('.mdl-layout');
    mdlLayoutElement.unbind('scroll');
  }
};
