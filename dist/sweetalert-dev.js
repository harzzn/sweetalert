;(function(window, document, undefined) {
  "use strict";
  
  (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// SweetAlert
// 2014-2015 (c) - Tristan Edwards
// github.com/t4t5/sweetalert

/*
 * jQuery-like functions for manipulating the DOM
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modulesHandleDom = require('./modules/handle-dom');

/*
 * Handy utilities
 */

var _modulesUtils = require('./modules/utils');

/*
 *  Handle sweetAlert's DOM elements
 */

var _modulesHandleSwalDom = require('./modules/handle-swal-dom');

// Handle button events and keyboard events

var _modulesHandleClick = require('./modules/handle-click');

var _modulesHandleKey = require('./modules/handle-key');

var _modulesHandleKey2 = _interopRequireDefault(_modulesHandleKey);

// Default values

var _modulesDefaultParams = require('./modules/default-params');

var _modulesDefaultParams2 = _interopRequireDefault(_modulesDefaultParams);

var _modulesSetParams = require('./modules/set-params');

var _modulesSetParams2 = _interopRequireDefault(_modulesSetParams);

/*
 * Remember state in cases where opening and handling a modal will fiddle with it.
 * (We also use window.previousActiveElement as a global variable)
 */
var previousWindowKeyDown;
var lastFocusedButton;

/*
 * Global sweetAlert function
 * (this is what the user calls)
 */
var sweetAlert, swal;

exports['default'] = sweetAlert = swal = function () {
  var customizations = arguments[0];

  (0, _modulesHandleDom.addClass)(document.body, 'stop-scrolling');
  (0, _modulesHandleSwalDom.resetInput)();

  /*
   * Use argument if defined or default value from params object otherwise.
   * Supports the case where a default value is boolean true and should be
   * overridden by a corresponding explicit argument which is boolean false.
   */
  function argumentOrDefault(key) {
    var args = customizations;
    return args[key] === undefined ? _modulesDefaultParams2['default'][key] : args[key];
  }

  if (customizations === undefined) {
    (0, _modulesUtils.logStr)('SweetAlert expects at least 1 attribute!');
    return false;
  }

  var params = (0, _modulesUtils.extend)({}, _modulesDefaultParams2['default']);

  switch (typeof customizations) {

    // Ex: swal("Hello", "Just testing", "info");
    case 'string':
      params.title = customizations;
      params.text = arguments[1] || '';
      params.type = arguments[2] || '';
      break;

    // Ex: swal({ title:"Hello", text: "Just testing", type: "info" });
    case 'object':
      if (customizations.title === undefined) {
        (0, _modulesUtils.logStr)('Missing "title" argument!');
        return false;
      }

      params.title = customizations.title;

      for (var customName in _modulesDefaultParams2['default']) {
        params[customName] = argumentOrDefault(customName);
      }

      // Show "Confirm" instead of "OK" if cancel button is visible
      params.confirmButtonText = params.showCancelButton ? 'Confirm' : _modulesDefaultParams2['default'].confirmButtonText;
      params.confirmButtonText = argumentOrDefault('confirmButtonText');

      // Callback function when clicking on "OK"/"Cancel"
      params.doneFunction = arguments[1] || null;

      break;

    default:
      (0, _modulesUtils.logStr)('Unexpected type of argument! Expected "string" or "object", got ' + typeof customizations);
      return false;

  }

  (0, _modulesSetParams2['default'])(params);
  (0, _modulesHandleSwalDom.fixVerticalPosition)();
  (0, _modulesHandleSwalDom.openModal)(arguments[1]);

  // Modal interactions
  var modal = (0, _modulesHandleSwalDom.getModal)();

  /*
   * Make sure all modal buttons respond to all events
   */
  var $buttons = modal.querySelectorAll('button');
  var buttonEvents = ['onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onfocus'];
  var onButtonEvent = function onButtonEvent(e) {
    return (0, _modulesHandleClick.handleButton)(e, params, modal);
  };

  for (var btnIndex = 0; btnIndex < $buttons.length; btnIndex++) {
    for (var evtIndex = 0; evtIndex < buttonEvents.length; evtIndex++) {
      var btnEvt = buttonEvents[evtIndex];
      $buttons[btnIndex][btnEvt] = onButtonEvent;
    }
  }

  // Clicking outside the modal dismisses it (if allowed by user)
  (0, _modulesHandleSwalDom.getOverlay)().onclick = onButtonEvent;

  previousWindowKeyDown = window.onkeydown;

  var onKeyEvent = function onKeyEvent(e) {
    return (0, _modulesHandleKey2['default'])(e, params, modal);
  };
  window.onkeydown = onKeyEvent;

  // Handle keyup callback if it has been set
  if (params.handleKeyUp) {
    var onKeyUpEvent = function onKeyUpEvent(e) {
      return params.handleKeyUp(e, params, modal);
    };
    window.onkeyup = onKeyUpEvent;
  }

  window.onfocus = function () {
    // When the user has focused away and focused back from the whole window.
    setTimeout(function () {
      // Put in a timeout to jump out of the event sequence.
      // Calling focus() in the event sequence confuses things.
      if (lastFocusedButton !== undefined) {
        lastFocusedButton.focus();
        lastFocusedButton = undefined;
      }
    }, 0);
  };

  // Show alert with enabled buttons always
  swal.enableButtons();
};

/*
 * Set default params for each popup
 * @param {Object} userParams
 */
sweetAlert.setDefaults = swal.setDefaults = function (userParams) {
  if (!userParams) {
    throw new Error('userParams is required');
  }
  if (typeof userParams !== 'object') {
    throw new Error('userParams has to be a object');
  }

  (0, _modulesUtils.extend)(_modulesDefaultParams2['default'], userParams);
};

/*
 * Animation when closing modal
 */
sweetAlert.close = swal.close = function () {
  var modal = (0, _modulesHandleSwalDom.getModal)();

  (0, _modulesHandleDom.fadeOut)((0, _modulesHandleSwalDom.getOverlay)(), 5);
  (0, _modulesHandleDom.fadeOut)(modal, 5);
  (0, _modulesHandleDom.removeClass)(modal, 'showSweetAlert');
  (0, _modulesHandleDom.addClass)(modal, 'hideSweetAlert');
  (0, _modulesHandleDom.removeClass)(modal, 'visible');

  /*
   * Reset icon animations
   */
  var $successIcon = modal.querySelector('.sa-icon.sa-success');
  (0, _modulesHandleDom.removeClass)($successIcon, 'animate');
  (0, _modulesHandleDom.removeClass)($successIcon.querySelector('.sa-tip'), 'animateSuccessTip');
  (0, _modulesHandleDom.removeClass)($successIcon.querySelector('.sa-long'), 'animateSuccessLong');

  var $errorIcon = modal.querySelector('.sa-icon.sa-error');
  (0, _modulesHandleDom.removeClass)($errorIcon, 'animateErrorIcon');
  (0, _modulesHandleDom.removeClass)($errorIcon.querySelector('.sa-x-mark'), 'animateXMark');

  var $warningIcon = modal.querySelector('.sa-icon.sa-warning');
  (0, _modulesHandleDom.removeClass)($warningIcon, 'pulseWarning');
  (0, _modulesHandleDom.removeClass)($warningIcon.querySelector('.sa-body'), 'pulseWarningIns');
  (0, _modulesHandleDom.removeClass)($warningIcon.querySelector('.sa-dot'), 'pulseWarningIns');

  // Reset custom class (delay so that UI changes aren't visible)
  setTimeout(function () {
    var customClass = modal.getAttribute('data-custom-class');
    (0, _modulesHandleDom.removeClass)(modal, customClass);
  }, 300);

  // Make page scrollable again
  (0, _modulesHandleDom.removeClass)(document.body, 'stop-scrolling');

  // Reset the page to its previous state
  window.onkeydown = previousWindowKeyDown;
  if (window.previousActiveElement) {
    window.previousActiveElement.focus();
  }
  lastFocusedButton = undefined;
  clearTimeout(modal.timeout);

  return true;
};

/*
 * Validation of the input field is done by user
 * If something is wrong => call showInputError with errorMessage
 */
sweetAlert.showInputError = swal.showInputError = function (errorMessage) {
  var modal = (0, _modulesHandleSwalDom.getModal)();

  var $errorIcon = modal.querySelector('.sa-input-error');
  (0, _modulesHandleDom.addClass)($errorIcon, 'show');

  var $errorContainer = modal.querySelector('.sa-error-container');
  (0, _modulesHandleDom.addClass)($errorContainer, 'show');

  $errorContainer.querySelector('p').innerHTML = errorMessage;

  setTimeout(function () {
    sweetAlert.enableButtons();
  }, 1);

  modal.querySelector('input').focus();
};

/*
 * Reset input error DOM elements
 */
sweetAlert.resetInputError = swal.resetInputError = function (event) {
  // If press enter => ignore
  if (event && event.keyCode === 13) {
    return false;
  }

  var $modal = (0, _modulesHandleSwalDom.getModal)();

  var $errorIcon = $modal.querySelector('.sa-input-error');
  (0, _modulesHandleDom.removeClass)($errorIcon, 'show');

  var $errorContainer = $modal.querySelector('.sa-error-container');
  (0, _modulesHandleDom.removeClass)($errorContainer, 'show');
};

/*
 * Disable confirm and cancel buttons
 */
sweetAlert.disableButtons = swal.disableButtons = function (event) {
  var modal = (0, _modulesHandleSwalDom.getModal)();
  var $confirmButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  $confirmButton.disabled = true;
  $cancelButton.disabled = true;
};

/*
 * Enable confirm and cancel buttons
 */
sweetAlert.enableButtons = swal.enableButtons = function (event) {
  var modal = (0, _modulesHandleSwalDom.getModal)();
  var $confirmButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  $confirmButton.disabled = false;
  $cancelButton.disabled = false;
};

if (typeof window !== 'undefined') {
  // The 'handle-click' module requires
  // that 'sweetAlert' was set as global.
  window.sweetAlert = window.swal = sweetAlert;
} else {
  (0, _modulesUtils.logStr)('SweetAlert is a frontend module!');
}
module.exports = exports['default'];

},{"./modules/default-params":2,"./modules/handle-click":3,"./modules/handle-dom":4,"./modules/handle-key":5,"./modules/handle-swal-dom":6,"./modules/set-params":8,"./modules/utils":9}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var defaultParams = {
  title: '',
  text: '',
  type: null,
  allowOutsideClick: false,
  showConfirmButton: true,
  showCancelButton: false,
  closeOnConfirm: true,
  closeOnCancel: true,
  confirmButtonText: 'OK',
  confirmButtonColor: '#8CD4F5',
  cancelButtonText: 'Cancel',
  imageUrl: null,
  imageSize: null,
  timer: null,
  customClass: '',
  html: false,
  animation: true,
  allowEscapeKey: true,
  showLoaderOnConfirm: false,
  handleKeyUp: null,
  inputs: null
};

exports['default'] = defaultParams;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('./utils');

var _handleSwalDom = require('./handle-swal-dom');

var _handleDom = require('./handle-dom');

/*
 * User clicked on "Confirm"/"OK" or "Cancel"
 */
var handleButton = function handleButton(event, params, modal) {
  var e = event || window.event;
  var target = e.target || e.srcElement;

  var targetedConfirm = target.className.indexOf('confirm') !== -1;
  var targetedOverlay = target.className.indexOf('sweet-overlay') !== -1;
  var modalIsVisible = (0, _handleDom.hasClass)(modal, 'visible');
  var doneFunctionExists = params.doneFunction && modal.getAttribute('data-has-done-function') === 'true';

  // Since the user can change the background-color of the confirm button programmatically,
  // we must calculate what the color should be on hover/active
  var normalColor, hoverColor, activeColor;
  if (targetedConfirm && params.confirmButtonColor) {
    normalColor = params.confirmButtonColor;
    hoverColor = (0, _utils.colorLuminance)(normalColor, -0.04);
    activeColor = (0, _utils.colorLuminance)(normalColor, -0.14);
  }

  function shouldSetConfirmButtonColor(color) {
    if (targetedConfirm && params.confirmButtonColor) {
      target.style.backgroundColor = color;
    }
  }

  switch (e.type) {
    case 'mouseover':
      shouldSetConfirmButtonColor(hoverColor);
      break;

    case 'mouseout':
      shouldSetConfirmButtonColor(normalColor);
      break;

    case 'mousedown':
      shouldSetConfirmButtonColor(activeColor);
      break;

    case 'mouseup':
      shouldSetConfirmButtonColor(hoverColor);
      break;

    case 'focus':
      var $confirmButton = modal.querySelector('button.confirm');
      var $cancelButton = modal.querySelector('button.cancel');

      if (targetedConfirm) {
        $cancelButton.style.boxShadow = 'none';
      } else {
        $confirmButton.style.boxShadow = 'none';
      }
      break;

    case 'click':
      var clickedOnModal = modal === target;
      var clickedOnModalChild = (0, _handleDom.isDescendant)(modal, target);

      // Ignore click outside if allowOutsideClick is false
      if (!clickedOnModal && !clickedOnModalChild && modalIsVisible && !params.allowOutsideClick) {
        break;
      }

      if (targetedConfirm && doneFunctionExists && modalIsVisible) {
        handleConfirm(modal, params);
      } else if (doneFunctionExists && modalIsVisible || targetedOverlay) {
        handleCancel(modal, params);
      } else if ((0, _handleDom.isDescendant)(modal, target) && target.tagName === 'BUTTON') {
        sweetAlert.close();
      }
      break;
  }
};

/*
 *  User clicked on "Confirm"/"OK"
 */
var handleConfirm = function handleConfirm(modal, params) {
  var callbackValue = true;

  if ((0, _handleDom.hasClass)(modal, 'show-input')) {
    callbackValue = modal.querySelector('input').value;

    if (!callbackValue) {
      callbackValue = '';
    }
  }

  params.doneFunction(callbackValue);

  if (params.closeOnConfirm) {
    sweetAlert.close();
  }
  // Disable cancel and confirm button if the parameter is true
  if (params.showLoaderOnConfirm) {
    sweetAlert.disableButtons();
  }
};

/*
 *  User clicked on "Cancel"
 */
var handleCancel = function handleCancel(modal, params) {
  // Check if callback function expects a parameter (to track cancel actions)
  var functionAsStr = String(params.doneFunction).replace(/\s/g, '');
  var functionHandlesCancel = functionAsStr.substring(0, 9) === 'function(' && functionAsStr.substring(9, 10) !== ')';

  if (functionHandlesCancel) {
    params.doneFunction(false);
  }

  if (params.closeOnCancel) {
    sweetAlert.close();
  }
};

exports['default'] = {
  handleButton: handleButton,
  handleConfirm: handleConfirm,
  handleCancel: handleCancel
};
module.exports = exports['default'];

},{"./handle-dom":4,"./handle-swal-dom":6,"./utils":9}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var hasClass = function hasClass(elem, className) {
  return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
};

var addClass = function addClass(elem, className) {
  if (!hasClass(elem, className)) {
    elem.className += ' ' + className;
  }
};

var removeClass = function removeClass(elem, className) {
  var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
  if (hasClass(elem, className)) {
    while (newClass.indexOf(' ' + className + ' ') >= 0) {
      newClass = newClass.replace(' ' + className + ' ', ' ');
    }
    elem.className = newClass.replace(/^\s+|\s+$/g, '');
  }
};

var escapeHtml = function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

var _show = function _show(elem) {
  elem.style.opacity = '';
  elem.style.display = 'block';
};

var show = function show(elems) {
  if (elems && !elems.length) {
    return _show(elems);
  }
  for (var i = 0; i < elems.length; ++i) {
    _show(elems[i]);
  }
};

var _hide = function _hide(elem) {
  elem.style.opacity = '';
  elem.style.display = 'none';
};

var hide = function hide(elems) {
  if (elems && !elems.length) {
    return _hide(elems);
  }
  for (var i = 0; i < elems.length; ++i) {
    _hide(elems[i]);
  }
};

var isDescendant = function isDescendant(parent, child) {
  var node = child.parentNode;
  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

var getTopMargin = function getTopMargin(elem) {
  elem.style.left = '-9999px';
  elem.style.display = 'block';

  var height = elem.clientHeight,
      padding;
  if (typeof getComputedStyle !== "undefined") {
    // IE 8
    padding = parseInt(getComputedStyle(elem).getPropertyValue('padding-top'), 10);
  } else {
    padding = parseInt(elem.currentStyle.padding);
  }

  elem.style.left = '';
  elem.style.display = 'none';
  return '-' + parseInt((height + padding) / 2) + 'px';
};

var fadeIn = function fadeIn(elem, interval) {
  if (+elem.style.opacity < 1) {
    interval = interval || 16;
    elem.style.opacity = 0;
    elem.style.display = 'block';
    var last = +new Date();
    var tick = function tick() {
      elem.style.opacity = +elem.style.opacity + (new Date() - last) / 100;
      last = +new Date();

      if (+elem.style.opacity < 1) {
        setTimeout(tick, interval);
      }
    };
    tick();
  }
  elem.style.display = 'block'; //fallback IE8
};

var fadeOut = function fadeOut(elem, interval) {
  interval = interval || 16;
  elem.style.opacity = 1;
  var last = +new Date();
  var tick = function tick() {
    elem.style.opacity = +elem.style.opacity - (new Date() - last) / 100;
    last = +new Date();

    if (+elem.style.opacity > 0) {
      setTimeout(tick, interval);
    } else {
      elem.style.display = 'none';
    }
  };
  tick();
};

var fireClick = function fireClick(node) {
  // Taken from http://www.nonobtrusive.com/2011/11/29/programatically-fire-crossbrowser-click-event-with-javascript/
  // Then fixed for today's Chrome browser.
  if (typeof MouseEvent === 'function') {
    // Up-to-date approach
    var mevt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    });
    node.dispatchEvent(mevt);
  } else if (document.createEvent) {
    // Fallback
    var evt = document.createEvent('MouseEvents');
    evt.initEvent('click', false, false);
    node.dispatchEvent(evt);
  } else if (document.createEventObject) {
    node.fireEvent('onclick');
  } else if (typeof node.onclick === 'function') {
    node.onclick();
  }
};

var stopEventPropagation = function stopEventPropagation(e) {
  // In particular, make sure the space bar doesn't scroll the main window.
  if (typeof e.stopPropagation === 'function') {
    e.stopPropagation();
    e.preventDefault();
  } else if (window.event && window.event.hasOwnProperty('cancelBubble')) {
    window.event.cancelBubble = true;
  }
};

exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.escapeHtml = escapeHtml;
exports._show = _show;
exports.show = show;
exports._hide = _hide;
exports.hide = hide;
exports.isDescendant = isDescendant;
exports.getTopMargin = getTopMargin;
exports.fadeIn = fadeIn;
exports.fadeOut = fadeOut;
exports.fireClick = fireClick;
exports.stopEventPropagation = stopEventPropagation;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _handleDom = require('./handle-dom');

var _handleSwalDom = require('./handle-swal-dom');

var handleKeyDown = function handleKeyDown(event, params, modal) {
  var e = event || window.event;
  var keyCode = e.keyCode || e.which;

  var $okButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  var $modalButtons = modal.querySelectorAll('button[tabindex]');

  if ([9, 13, 32, 27].indexOf(keyCode) === -1) {
    // Don't do work on keys we don't care about.
    return;
  }

  var $targetElement = e.target || e.srcElement;

  var btnIndex = -1; // Find the button - note, this is a nodelist, not an array.
  for (var i = 0; i < $modalButtons.length; i++) {
    if ($targetElement === $modalButtons[i]) {
      btnIndex = i;
      break;
    }
  }

  if (keyCode === 9) {
    // TAB
    if (btnIndex === -1) {
      // No button focused. Jump to the confirm button.
      $targetElement = $okButton;
    } else {
      // Cycle to the next button
      if (btnIndex === $modalButtons.length - 1) {
        $targetElement = $modalButtons[0];
      } else {
        $targetElement = $modalButtons[btnIndex + 1];
      }
    }

    (0, _handleDom.stopEventPropagation)(e);
    $targetElement.focus();

    if (params.confirmButtonColor) {
      (0, _handleSwalDom.setFocusStyle)($targetElement, params.confirmButtonColor);
    }
  } else {
    if (keyCode === 13) {
      if ($targetElement.tagName === 'INPUT') {
        $targetElement = $okButton;
        $okButton.focus();
      }

      if (btnIndex === -1) {
        // ENTER/SPACE clicked outside of a button.
        $targetElement = $okButton;
      } else {
        // Do nothing - let the browser handle it.
        $targetElement = undefined;
      }
    } else if (keyCode === 27 && params.allowEscapeKey === true) {
      $targetElement = $cancelButton;
      (0, _handleDom.fireClick)($targetElement, e);
    } else {
      // Fallback - let the browser handle it.
      $targetElement = undefined;
    }
  }
};

exports['default'] = handleKeyDown;
module.exports = exports['default'];

},{"./handle-dom":4,"./handle-swal-dom":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('./utils');

var _handleDom = require('./handle-dom');

var _defaultParams = require('./default-params');

var _defaultParams2 = _interopRequireDefault(_defaultParams);

/*
 * Add modal + overlay to DOM
 */

var _injectedHtml = require('./injected-html');

var _injectedHtml2 = _interopRequireDefault(_injectedHtml);

var modalClass = '.sweet-alert';
var overlayClass = '.sweet-overlay';

var sweetAlertInitialize = function sweetAlertInitialize() {
  var sweetWrap = document.createElement('div');
  sweetWrap.innerHTML = _injectedHtml2['default'];

  // Append elements to body
  while (sweetWrap.firstChild) {
    document.body.appendChild(sweetWrap.firstChild);
  }
};

/*
 * Get DOM element of modal
 */
var getModal = function getModal() {
  var $modal = document.querySelector(modalClass);

  if (!$modal) {
    sweetAlertInitialize();
    $modal = getModal();
  }

  return $modal;
};

/*
 * Get DOM element of input (in modal)
 */
var getInputs = function getInputs() {
  var $modal = getModal();
  if ($modal) {
    var div_list = $modal.querySelectorAll('input');
    return Array.prototype.slice.call(div_list); // converts NodeList to Array
  }
};

/*
 * Get DOM element of overlay
 */
var getOverlay = function getOverlay() {
  return document.querySelector(overlayClass);
};

/*
 * Add box-shadow style to button (depending on its chosen bg-color)
 */
var setFocusStyle = function setFocusStyle($button, bgColor) {
  var rgbColor = (0, _utils.hexToRgb)(bgColor);
  $button.style.boxShadow = '0 0 2px rgba(' + rgbColor + ', 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.05)';
};

/*
 * Animation when opening modal
 */
var openModal = function openModal(callback) {
  var $modal = getModal();
  (0, _handleDom.fadeIn)(getOverlay(), 10);
  (0, _handleDom.show)($modal);
  (0, _handleDom.addClass)($modal, 'showSweetAlert');
  (0, _handleDom.removeClass)($modal, 'hideSweetAlert');

  window.previousActiveElement = document.activeElement;
  var $okButton = $modal.querySelector('button.confirm');
  $okButton.focus();

  setTimeout(function () {
    (0, _handleDom.addClass)($modal, 'visible');
  }, 500);

  var timer = $modal.getAttribute('data-timer');

  if (timer !== 'null' && timer !== '') {
    var timerCallback = callback;
    $modal.timeout = setTimeout(function () {
      var doneFunctionExists = (timerCallback || null) && $modal.getAttribute('data-has-done-function') === 'true';
      if (doneFunctionExists) {
        timerCallback(null);
      } else {
        sweetAlert.close();
      }
    }, timer);
  }
};

/*
 * Reset the styling of the input
 * (for example if errors have been shown)
 */
var resetInput = function resetInput() {
  var $modal = getModal();
  var $inputs = getInputs();

  (0, _handleDom.removeClass)($modal, 'show-input'); /*
                                                     $input.value = defaultParams.inputValue;
                                                     $input.setAttribute('type', defaultParams.inputType);
                                                     $input.setAttribute('placeholder', defaultParams.inputPlaceholder);
                                                     */
  resetInputError();
};

var resetInputError = function resetInputError(event) {
  // If press enter => ignore
  if (event && event.keyCode === 13) {
    return false;
  }

  var $modal = getModal();

  var $errorIcon = $modal.querySelector('.sa-input-error');
  (0, _handleDom.removeClass)($errorIcon, 'show');

  var $errorContainer = $modal.querySelector('.sa-error-container');
  (0, _handleDom.removeClass)($errorContainer, 'show');
};

/*
 * Set "margin-top"-property on modal based on its computed height
 */
var fixVerticalPosition = function fixVerticalPosition() {
  var $modal = getModal();
  $modal.style.marginTop = (0, _handleDom.getTopMargin)(getModal());
};

exports.sweetAlertInitialize = sweetAlertInitialize;
exports.getModal = getModal;
exports.getOverlay = getOverlay;
exports.getInputs = getInputs;
exports.setFocusStyle = setFocusStyle;
exports.openModal = openModal;
exports.resetInput = resetInput;
exports.resetInputError = resetInputError;
exports.fixVerticalPosition = fixVerticalPosition;

},{"./default-params":2,"./handle-dom":4,"./injected-html":7,"./utils":9}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var injectedHTML =

// Dark overlay
"<div class=\"sweet-overlay\" tabIndex=\"-1\"></div>" +

// Modal
"<div class=\"sweet-alert\">" +

// Error icon
"<div class=\"sa-icon sa-error\">\n      <span class=\"sa-x-mark\">\n        <span class=\"sa-line sa-left\"></span>\n        <span class=\"sa-line sa-right\"></span>\n      </span>\n    </div>" +

// Warning icon
"<div class=\"sa-icon sa-warning\">\n      <span class=\"sa-body\"></span>\n      <span class=\"sa-dot\"></span>\n    </div>" +

// Info icon
"<div class=\"sa-icon sa-info\"></div>" +

// Success icon
"<div class=\"sa-icon sa-success\">\n      <span class=\"sa-line sa-tip\"></span>\n      <span class=\"sa-line sa-long\"></span>\n\n      <div class=\"sa-placeholder\"></div>\n      <div class=\"sa-fix\"></div>\n    </div>" + "<div class=\"sa-icon sa-custom\"></div>" +

// Title, text and input
"<h2>Title</h2>\n    <p>Text</p>\n    <div class=\"sa-inputs\">\n      <fieldset>\n        <input type=\"text\" tabIndex=\"3\" />\n        <div class=\"sa-input-error\"></div>\n      </fieldset>\n    </div>" +

// Input errors
"<div class=\"sa-error-container\">\n      <div class=\"icon\">!</div>\n      <p>Not valid!</p>\n    </div>" +

// Cancel and confirm buttons
"<div class=\"sa-button-container\">\n      <button class=\"cancel\" tabIndex=\"2\">Cancel</button>\n      <div class=\"sa-confirm-button-container\">\n        <button class=\"confirm\" tabIndex=\"1\">OK</button>" +

// Loading animation
"<div class=\"la-ball-fall\">\n          <div></div>\n          <div></div>\n          <div></div>\n        </div>\n      </div>\n    </div>" +

// End of modal
"</div>";

exports["default"] = injectedHTML;
module.exports = exports["default"];

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('./utils');

var _handleSwalDom = require('./handle-swal-dom');

var _handleDom = require('./handle-dom');

/*
 * Set type, text and actions on modal
 */
var alertTypes = ['error', 'warning', 'info', 'success', 'input', 'prompt'];

var setParameters = function setParameters(params) {
  var modal = (0, _handleSwalDom.getModal)();

  var $title = modal.querySelector('h2');
  var $text = modal.querySelector('p');
  var $cancelBtn = modal.querySelector('button.cancel');
  var $confirmBtn = modal.querySelector('button.confirm');

  /*
   * Title
   */
  $title.innerHTML = params.html ? params.title : (0, _handleDom.escapeHtml)(params.title).split('\n').join('<br>');

  /*
   * Text
   */
  $text.innerHTML = params.html ? params.text : (0, _handleDom.escapeHtml)(params.text || '').split('\n').join('<br>');
  if (params.text) (0, _handleDom.show)($text);

  /*
   * Custom class
   */
  if (params.customClass) {
    (0, _handleDom.addClass)(modal, params.customClass);
    modal.setAttribute('data-custom-class', params.customClass);
  } else {
    // Find previously set classes and remove them
    var customClass = modal.getAttribute('data-custom-class');
    (0, _handleDom.removeClass)(modal, customClass);
    modal.setAttribute('data-custom-class', '');
  }

  /*
   * Icon
   */
  (0, _handleDom.hide)(modal.querySelectorAll('.sa-icon'));

  if (params.type && !(0, _utils.isIE8)()) {
    var inputHTML;

    var _ret = (function () {

      var validType = false;

      for (var i = 0; i < alertTypes.length; i++) {
        if (params.type === alertTypes[i]) {
          validType = true;
          break;
        }
      }

      if (!validType) {
        logStr('Unknown alert type: ' + params.type);
        return {
          v: false
        };
      }

      var typesWithIcons = ['success', 'error', 'warning', 'info'];
      var $icon = undefined;

      if (typesWithIcons.indexOf(params.type) !== -1) {
        $icon = modal.querySelector('.sa-icon.' + 'sa-' + params.type);
        (0, _handleDom.show)($icon);
      }

      var $inputs = (0, _handleSwalDom.getInputs)();

      // Animate icon
      switch (params.type) {

        case 'success':
          (0, _handleDom.addClass)($icon, 'animate');
          (0, _handleDom.addClass)($icon.querySelector('.sa-tip'), 'animateSuccessTip');
          (0, _handleDom.addClass)($icon.querySelector('.sa-long'), 'animateSuccessLong');
          break;

        case 'error':
          (0, _handleDom.addClass)($icon, 'animateErrorIcon');
          (0, _handleDom.addClass)($icon.querySelector('.sa-x-mark'), 'animateXMark');
          break;

        case 'warning':
          (0, _handleDom.addClass)($icon, 'pulseWarning');
          (0, _handleDom.addClass)($icon.querySelector('.sa-body'), 'pulseWarningIns');
          (0, _handleDom.addClass)($icon.querySelector('.sa-dot'), 'pulseWarningIns');
          break;

        case 'input':
        case 'prompt':
          inputHTML = '';

          params.inputs.forEach(function (value, index) {

            var tabIndex = 3 + index;

            if (params.inputs[index].inputType === 'text') inputHTML += '<fieldset>\n                <label>' + params.inputs[index].inputLabel + '</label>\n                <br><span>' + params.inputs[index].inputDescription + '</span>\n                <input type="' + params.inputs[index].inputType + '" tabIndex="' + tabIndex + '" value="' + params.inputs[index].inputValue + '" placeholder="' + params.inputs[index].inputPlaceholder + '" />\n                <div class="sa-input-error"></div>\n              </fieldset>';else if (params.inputs[index].inputType === 'radio') inputHTML += '<fieldset>\n                <label>' + params.inputs[index].inputLabel + '</label>\n                <br><span>' + params.inputs[index].inputDescription + '</span>\n                <input type="' + params.inputs[index].inputType + '" name="' + index + '" tabIndex="' + tabIndex + '" value="true" checked="checked" /> ' + params.inputs[index].inputPlaceholder[0] + '\n                <input type="' + params.inputs[index].inputType + '" name="' + index + '" value="false"> ' + params.inputs[index].inputPlaceholder[1] + '\n                <div class="sa-input-error"></div>\n              </fieldset>';
          });

          modal.querySelector('.sa-inputs').innerHTML = inputHTML;

          (0, _handleDom.addClass)(modal, 'show-input');
          setTimeout(function () {
            $inputs[0].focus();
            $inputs[0].addEventListener('keyup', swal.resetInputError);
          }, 400);
          break;
      }
    })();

    if (typeof _ret === 'object') return _ret.v;
  }

  /*
   * Custom image
   */
  if (params.imageUrl) {
    var $customIcon = modal.querySelector('.sa-icon.sa-custom');

    $customIcon.style.backgroundImage = 'url(' + params.imageUrl + ')';
    (0, _handleDom.show)($customIcon);

    var _imgWidth = 80;
    var _imgHeight = 80;

    if (params.imageSize) {
      var dimensions = params.imageSize.toString().split('x');
      var imgWidth = dimensions[0];
      var imgHeight = dimensions[1];

      if (!imgWidth || !imgHeight) {
        logStr('Parameter imageSize expects value with format WIDTHxHEIGHT, got ' + params.imageSize);
      } else {
        _imgWidth = imgWidth;
        _imgHeight = imgHeight;
      }
    }

    $customIcon.setAttribute('style', $customIcon.getAttribute('style') + 'width:' + _imgWidth + 'px; height:' + _imgHeight + 'px');
  }

  /*
   * Show cancel button?
   */
  modal.setAttribute('data-has-cancel-button', params.showCancelButton);
  if (params.showCancelButton) {
    $cancelBtn.style.display = 'inline-block';
  } else {
    (0, _handleDom.hide)($cancelBtn);
  }

  /*
   * Show confirm button?
   */
  modal.setAttribute('data-has-confirm-button', params.showConfirmButton);
  if (params.showConfirmButton) {
    $confirmBtn.style.display = 'inline-block';
  } else {
    (0, _handleDom.hide)($confirmBtn);
  }

  /*
   * Custom text on cancel/confirm buttons
   */
  if (params.cancelButtonText) {
    $cancelBtn.innerHTML = (0, _handleDom.escapeHtml)(params.cancelButtonText);
  }
  if (params.confirmButtonText) {
    $confirmBtn.innerHTML = (0, _handleDom.escapeHtml)(params.confirmButtonText);
  }

  /*
   * Custom color on confirm button
   */
  if (params.confirmButtonColor) {
    // Set confirm button to selected background color
    $confirmBtn.style.backgroundColor = params.confirmButtonColor;

    // Set the confirm button color to the loading ring
    $confirmBtn.style.borderLeftColor = params.confirmLoadingButtonColor;
    $confirmBtn.style.borderRightColor = params.confirmLoadingButtonColor;

    // Set box-shadow to default focused button
    (0, _handleSwalDom.setFocusStyle)($confirmBtn, params.confirmButtonColor);
  }

  /*
   * Allow outside click
   */
  modal.setAttribute('data-allow-outside-click', params.allowOutsideClick);

  /*
   * Callback function
   */
  var hasDoneFunction = params.doneFunction ? true : false;
  modal.setAttribute('data-has-done-function', hasDoneFunction);

  /*
   * Animation
   */
  if (!params.animation) {
    modal.setAttribute('data-animation', 'none');
  } else if (typeof params.animation === 'string') {
    modal.setAttribute('data-animation', params.animation); // Custom animation
  } else {
      modal.setAttribute('data-animation', 'pop');
    }

  /*
   * Timer
   */
  modal.setAttribute('data-timer', params.timer);
};

exports['default'] = setParameters;
module.exports = exports['default'];

},{"./handle-dom":4,"./handle-swal-dom":6,"./utils":9}],9:[function(require,module,exports){
/*
 * Allow user to pass their own params
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var extend = function extend(a, b) {
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/*
 * Convert HEX codes to RGB values (#000000 -> rgb(0,0,0))
 */
var hexToRgb = function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) : null;
};

/*
 * Check if the user is using Internet Explorer 8 (for fallbacks)
 */
var isIE8 = function isIE8() {
  return window.attachEvent && !window.addEventListener;
};

/*
 * IE compatible logging for developers
 */
var logStr = function logStr(string) {
  if (window.console) {
    // IE...
    window.console.log('SweetAlert: ' + string);
  }
};

/*
 * Set hover, active and focus-states for buttons 
 * (source: http://www.sitepoint.com/javascript-generate-lighter-darker-color)
 */
var colorLuminance = function colorLuminance(hex, lum) {
  // Validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;

  // Convert to decimal and change luminosity
  var rgb = '#';
  var c;
  var i;

  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ('00' + c).substr(c.length);
  }

  return rgb;
};

exports.extend = extend;
exports.hexToRgb = hexToRgb;
exports.isIE8 = isIE8;
exports.logStr = logStr;
exports.colorLuminance = colorLuminance;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvaGFycmkvRGV2ZWxvcG1lbnQvc3dlZXRhbGVydC9kZXYvc3dlZXRhbGVydC5lczYuanMiLCIvVXNlcnMvaGFycmkvRGV2ZWxvcG1lbnQvc3dlZXRhbGVydC9kZXYvbW9kdWxlcy9kZWZhdWx0LXBhcmFtcy5qcyIsIi9Vc2Vycy9oYXJyaS9EZXZlbG9wbWVudC9zd2VldGFsZXJ0L2Rldi9tb2R1bGVzL2hhbmRsZS1jbGljay5qcyIsIi9Vc2Vycy9oYXJyaS9EZXZlbG9wbWVudC9zd2VldGFsZXJ0L2Rldi9tb2R1bGVzL2hhbmRsZS1kb20uanMiLCIvVXNlcnMvaGFycmkvRGV2ZWxvcG1lbnQvc3dlZXRhbGVydC9kZXYvbW9kdWxlcy9oYW5kbGUta2V5LmpzIiwiL1VzZXJzL2hhcnJpL0RldmVsb3BtZW50L3N3ZWV0YWxlcnQvZGV2L21vZHVsZXMvaGFuZGxlLXN3YWwtZG9tLmpzIiwiL1VzZXJzL2hhcnJpL0RldmVsb3BtZW50L3N3ZWV0YWxlcnQvZGV2L21vZHVsZXMvaW5qZWN0ZWQtaHRtbC5qcyIsIi9Vc2Vycy9oYXJyaS9EZXZlbG9wbWVudC9zd2VldGFsZXJ0L2Rldi9tb2R1bGVzL3NldC1wYXJhbXMuanMiLCIvVXNlcnMvaGFycmkvRGV2ZWxvcG1lbnQvc3dlZXRhbGVydC9kZXYvbW9kdWxlcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztnQ0NnQk8sc0JBQXNCOzs7Ozs7NEJBV3RCLGlCQUFpQjs7Ozs7O29DQWNqQiwyQkFBMkI7Ozs7a0NBSXdCLHdCQUF3Qjs7Z0NBQ3hELHNCQUFzQjs7Ozs7O29DQUl0QiwwQkFBMEI7Ozs7Z0NBQzFCLHNCQUFzQjs7Ozs7Ozs7QUFNaEQsSUFBSSxxQkFBcUIsQ0FBQztBQUMxQixJQUFJLGlCQUFpQixDQUFDOzs7Ozs7QUFPdEIsSUFB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QUFHLElBQUksQ0FBQyxDQUFDOzs7QUFHZixNQUFJLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDZCxNQUFJLENBQUMsQ0FBQztBQUNOLE1BQUksQ0FBQyxDQUFDOztBQUVOLE9BQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3RCLEtBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZDLEtBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNyRSxPQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBLENBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUNwQzs7QUFFRCxTQUFPLEdBQUcsQ0FBQztDQUNaLENBQUM7O1FBSUEsTUFBTSxHQUFOLE1BQU07UUFDTixRQUFRLEdBQVIsUUFBUTtRQUNSLEtBQUssR0FBTCxLQUFLO1FBQ0wsTUFBTSxHQUFOLE1BQU07UUFDTixjQUFjLEdBQWQsY0FBYyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBTd2VldEFsZXJ0XG4vLyAyMDE0LTIwMTUgKGMpIC0gVHJpc3RhbiBFZHdhcmRzXG4vLyBnaXRodWIuY29tL3Q0dDUvc3dlZXRhbGVydFxuXG4vKlxuICogalF1ZXJ5LWxpa2UgZnVuY3Rpb25zIGZvciBtYW5pcHVsYXRpbmcgdGhlIERPTVxuICovXG5pbXBvcnQge1xuICBoYXNDbGFzcywgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzLFxuICBlc2NhcGVIdG1sLFxuICBfc2hvdywgc2hvdywgX2hpZGUsIGhpZGUsXG4gIGlzRGVzY2VuZGFudCxcbiAgZ2V0VG9wTWFyZ2luLFxuICBmYWRlSW4sIGZhZGVPdXQsXG4gIGZpcmVDbGljayxcbiAgc3RvcEV2ZW50UHJvcGFnYXRpb25cbn0gZnJvbSAnLi9tb2R1bGVzL2hhbmRsZS1kb20nO1xuXG4vKlxuICogSGFuZHkgdXRpbGl0aWVzXG4gKi9cbmltcG9ydCB7XG4gIGV4dGVuZCxcbiAgaGV4VG9SZ2IsXG4gIGlzSUU4LFxuICBsb2dTdHIsXG4gIGNvbG9yTHVtaW5hbmNlXG59IGZyb20gJy4vbW9kdWxlcy91dGlscyc7XG5cbi8qXG4gKiAgSGFuZGxlIHN3ZWV0QWxlcnQncyBET00gZWxlbWVudHNcbiAqL1xuaW1wb3J0IHtcbiAgc3dlZXRBbGVydEluaXRpYWxpemUsXG4gIGdldE1vZGFsLFxuICBnZXRPdmVybGF5LFxuICBnZXRJbnB1dHMsXG4gIHNldEZvY3VzU3R5bGUsXG4gIG9wZW5Nb2RhbCxcbiAgcmVzZXRJbnB1dCxcbiAgZml4VmVydGljYWxQb3NpdGlvblxufSBmcm9tICcuL21vZHVsZXMvaGFuZGxlLXN3YWwtZG9tJztcblxuXG4vLyBIYW5kbGUgYnV0dG9uIGV2ZW50cyBhbmQga2V5Ym9hcmQgZXZlbnRzXG5pbXBvcnQgeyBoYW5kbGVCdXR0b24sIGhhbmRsZUNvbmZpcm0sIGhhbmRsZUNhbmNlbCB9IGZyb20gJy4vbW9kdWxlcy9oYW5kbGUtY2xpY2snO1xuaW1wb3J0IGhhbmRsZUtleURvd24gZnJvbSAnLi9tb2R1bGVzL2hhbmRsZS1rZXknO1xuXG5cbi8vIERlZmF1bHQgdmFsdWVzXG5pbXBvcnQgZGVmYXVsdFBhcmFtcyBmcm9tICcuL21vZHVsZXMvZGVmYXVsdC1wYXJhbXMnO1xuaW1wb3J0IHNldFBhcmFtZXRlcnMgZnJvbSAnLi9tb2R1bGVzL3NldC1wYXJhbXMnO1xuXG4vKlxuICogUmVtZW1iZXIgc3RhdGUgaW4gY2FzZXMgd2hlcmUgb3BlbmluZyBhbmQgaGFuZGxpbmcgYSBtb2RhbCB3aWxsIGZpZGRsZSB3aXRoIGl0LlxuICogKFdlIGFsc28gdXNlIHdpbmRvdy5wcmV2aW91c0FjdGl2ZUVsZW1lbnQgYXMgYSBnbG9iYWwgdmFyaWFibGUpXG4gKi9cbnZhciBwcmV2aW91c1dpbmRvd0tleURvd247XG52YXIgbGFzdEZvY3VzZWRCdXR0b247XG5cblxuLypcbiAqIEdsb2JhbCBzd2VldEFsZXJ0IGZ1bmN0aW9uXG4gKiAodGhpcyBpcyB3aGF0IHRoZSB1c2VyIGNhbGxzKVxuICovXG52YXIgc3dlZXRBbGVydCwgc3dhbDtcblxuZXhwb3J0IGRlZmF1bHQgc3dlZXRBbGVydCA9IHN3YWwgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGN1c3RvbWl6YXRpb25zID0gYXJndW1lbnRzWzBdO1xuXG4gIGFkZENsYXNzKGRvY3VtZW50LmJvZHksICdzdG9wLXNjcm9sbGluZycpO1xuICByZXNldElucHV0KCk7XG5cbiAgLypcbiAgICogVXNlIGFyZ3VtZW50IGlmIGRlZmluZWQgb3IgZGVmYXVsdCB2YWx1ZSBmcm9tIHBhcmFtcyBvYmplY3Qgb3RoZXJ3aXNlLlxuICAgKiBTdXBwb3J0cyB0aGUgY2FzZSB3aGVyZSBhIGRlZmF1bHQgdmFsdWUgaXMgYm9vbGVhbiB0cnVlIGFuZCBzaG91bGQgYmVcbiAgICogb3ZlcnJpZGRlbiBieSBhIGNvcnJlc3BvbmRpbmcgZXhwbGljaXQgYXJndW1lbnQgd2hpY2ggaXMgYm9vbGVhbiBmYWxzZS5cbiAgICovXG4gIGZ1bmN0aW9uIGFyZ3VtZW50T3JEZWZhdWx0KGtleSkge1xuICAgIHZhciBhcmdzID0gY3VzdG9taXphdGlvbnM7XG4gICAgcmV0dXJuIChhcmdzW2tleV0gPT09IHVuZGVmaW5lZCkgPyAgZGVmYXVsdFBhcmFtc1trZXldIDogYXJnc1trZXldO1xuICB9XG5cbiAgaWYgKGN1c3RvbWl6YXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICBsb2dTdHIoJ1N3ZWV0QWxlcnQgZXhwZWN0cyBhdCBsZWFzdCAxIGF0dHJpYnV0ZSEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcGFyYW1zID0gZXh0ZW5kKHt9LCBkZWZhdWx0UGFyYW1zKTtcblxuICBzd2l0Y2ggKHR5cGVvZiBjdXN0b21pemF0aW9ucykge1xuXG4gICAgLy8gRXg6IHN3YWwoXCJIZWxsb1wiLCBcIkp1c3QgdGVzdGluZ1wiLCBcImluZm9cIik7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHBhcmFtcy50aXRsZSA9IGN1c3RvbWl6YXRpb25zO1xuICAgICAgcGFyYW1zLnRleHQgID0gYXJndW1lbnRzWzFdIHx8ICcnO1xuICAgICAgcGFyYW1zLnR5cGUgID0gYXJndW1lbnRzWzJdIHx8ICcnO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBFeDogc3dhbCh7IHRpdGxlOlwiSGVsbG9cIiwgdGV4dDogXCJKdXN0IHRlc3RpbmdcIiwgdHlwZTogXCJpbmZvXCIgfSk7XG4gICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgIGlmIChjdXN0b21pemF0aW9ucy50aXRsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxvZ1N0cignTWlzc2luZyBcInRpdGxlXCIgYXJndW1lbnQhJyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcGFyYW1zLnRpdGxlID0gY3VzdG9taXphdGlvbnMudGl0bGU7XG5cbiAgICAgIGZvciAobGV0IGN1c3RvbU5hbWUgaW4gZGVmYXVsdFBhcmFtcykge1xuICAgICAgICBwYXJhbXNbY3VzdG9tTmFtZV0gPSBhcmd1bWVudE9yRGVmYXVsdChjdXN0b21OYW1lKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2hvdyBcIkNvbmZpcm1cIiBpbnN0ZWFkIG9mIFwiT0tcIiBpZiBjYW5jZWwgYnV0dG9uIGlzIHZpc2libGVcbiAgICAgIHBhcmFtcy5jb25maXJtQnV0dG9uVGV4dCA9IHBhcmFtcy5zaG93Q2FuY2VsQnV0dG9uID8gJ0NvbmZpcm0nIDogZGVmYXVsdFBhcmFtcy5jb25maXJtQnV0dG9uVGV4dDtcbiAgICAgIHBhcmFtcy5jb25maXJtQnV0dG9uVGV4dCA9IGFyZ3VtZW50T3JEZWZhdWx0KCdjb25maXJtQnV0dG9uVGV4dCcpO1xuXG4gICAgICAvLyBDYWxsYmFjayBmdW5jdGlvbiB3aGVuIGNsaWNraW5nIG9uIFwiT0tcIi9cIkNhbmNlbFwiXG4gICAgICBwYXJhbXMuZG9uZUZ1bmN0aW9uID0gYXJndW1lbnRzWzFdIHx8IG51bGw7XG5cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGxvZ1N0cignVW5leHBlY3RlZCB0eXBlIG9mIGFyZ3VtZW50ISBFeHBlY3RlZCBcInN0cmluZ1wiIG9yIFwib2JqZWN0XCIsIGdvdCAnICsgdHlwZW9mIGN1c3RvbWl6YXRpb25zKTtcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICB9XG5cbiAgc2V0UGFyYW1ldGVycyhwYXJhbXMpO1xuICBmaXhWZXJ0aWNhbFBvc2l0aW9uKCk7XG4gIG9wZW5Nb2RhbChhcmd1bWVudHNbMV0pO1xuXG4gIC8vIE1vZGFsIGludGVyYWN0aW9uc1xuICB2YXIgbW9kYWwgPSBnZXRNb2RhbCgpO1xuXG5cbiAgLypcbiAgICogTWFrZSBzdXJlIGFsbCBtb2RhbCBidXR0b25zIHJlc3BvbmQgdG8gYWxsIGV2ZW50c1xuICAgKi9cbiAgdmFyICRidXR0b25zID0gbW9kYWwucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJyk7XG4gIHZhciBidXR0b25FdmVudHMgPSBbJ29uY2xpY2snLCAnb25tb3VzZW92ZXInLCAnb25tb3VzZW91dCcsICdvbm1vdXNlZG93bicsICdvbm1vdXNldXAnLCAnb25mb2N1cyddO1xuICB2YXIgb25CdXR0b25FdmVudCA9IChlKSA9PiBoYW5kbGVCdXR0b24oZSwgcGFyYW1zLCBtb2RhbCk7XG5cbiAgZm9yIChsZXQgYnRuSW5kZXggPSAwOyBidG5JbmRleCA8ICRidXR0b25zLmxlbmd0aDsgYnRuSW5kZXgrKykge1xuICAgIGZvciAobGV0IGV2dEluZGV4ID0gMDsgZXZ0SW5kZXggPCBidXR0b25FdmVudHMubGVuZ3RoOyBldnRJbmRleCsrKSB7XG4gICAgICBsZXQgYnRuRXZ0ID0gYnV0dG9uRXZlbnRzW2V2dEluZGV4XTtcbiAgICAgICRidXR0b25zW2J0bkluZGV4XVtidG5FdnRdID0gb25CdXR0b25FdmVudDtcbiAgICB9XG4gIH1cblxuICAvLyBDbGlja2luZyBvdXRzaWRlIHRoZSBtb2RhbCBkaXNtaXNzZXMgaXQgKGlmIGFsbG93ZWQgYnkgdXNlcilcbiAgZ2V0T3ZlcmxheSgpLm9uY2xpY2sgPSBvbkJ1dHRvbkV2ZW50O1xuXG4gIHByZXZpb3VzV2luZG93S2V5RG93biA9IHdpbmRvdy5vbmtleWRvd247XG5cbiAgdmFyIG9uS2V5RXZlbnQgPSAoZSkgPT4gaGFuZGxlS2V5RG93bihlLCBwYXJhbXMsIG1vZGFsKTtcbiAgd2luZG93Lm9ua2V5ZG93biA9IG9uS2V5RXZlbnQ7XG5cbiAgLy8gSGFuZGxlIGtleXVwIGNhbGxiYWNrIGlmIGl0IGhhcyBiZWVuIHNldCBcbiAgaWYgKCBwYXJhbXMuaGFuZGxlS2V5VXAgKSB7XG4gICAgdmFyIG9uS2V5VXBFdmVudCA9IChlKSA9PiBwYXJhbXMuaGFuZGxlS2V5VXAoZSwgcGFyYW1zLCBtb2RhbCk7XG4gICAgd2luZG93Lm9ua2V5dXAgPSBvbktleVVwRXZlbnQ7XG4gIH1cblxuICB3aW5kb3cub25mb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBXaGVuIHRoZSB1c2VyIGhhcyBmb2N1c2VkIGF3YXkgYW5kIGZvY3VzZWQgYmFjayBmcm9tIHRoZSB3aG9sZSB3aW5kb3cuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBQdXQgaW4gYSB0aW1lb3V0IHRvIGp1bXAgb3V0IG9mIHRoZSBldmVudCBzZXF1ZW5jZS5cbiAgICAgIC8vIENhbGxpbmcgZm9jdXMoKSBpbiB0aGUgZXZlbnQgc2VxdWVuY2UgY29uZnVzZXMgdGhpbmdzLlxuICAgICAgaWYgKGxhc3RGb2N1c2VkQnV0dG9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGFzdEZvY3VzZWRCdXR0b24uZm9jdXMoKTtcbiAgICAgICAgbGFzdEZvY3VzZWRCdXR0b24gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSwgMCk7XG4gIH07XG4gIFxuICAvLyBTaG93IGFsZXJ0IHdpdGggZW5hYmxlZCBidXR0b25zIGFsd2F5c1xuICBzd2FsLmVuYWJsZUJ1dHRvbnMoKTtcbn07XG5cblxuXG4vKlxuICogU2V0IGRlZmF1bHQgcGFyYW1zIGZvciBlYWNoIHBvcHVwXG4gKiBAcGFyYW0ge09iamVjdH0gdXNlclBhcmFtc1xuICovXG5zd2VldEFsZXJ0LnNldERlZmF1bHRzID0gc3dhbC5zZXREZWZhdWx0cyA9IGZ1bmN0aW9uKHVzZXJQYXJhbXMpIHtcbiAgaWYgKCF1c2VyUGFyYW1zKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VyUGFyYW1zIGlzIHJlcXVpcmVkJyk7XG4gIH1cbiAgaWYgKHR5cGVvZiB1c2VyUGFyYW1zICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBFcnJvcigndXNlclBhcmFtcyBoYXMgdG8gYmUgYSBvYmplY3QnKTtcbiAgfVxuXG4gIGV4dGVuZChkZWZhdWx0UGFyYW1zLCB1c2VyUGFyYW1zKTtcbn07XG5cblxuLypcbiAqIEFuaW1hdGlvbiB3aGVuIGNsb3NpbmcgbW9kYWxcbiAqL1xuc3dlZXRBbGVydC5jbG9zZSA9IHN3YWwuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG1vZGFsID0gZ2V0TW9kYWwoKTtcblxuICBmYWRlT3V0KGdldE92ZXJsYXkoKSwgNSk7XG4gIGZhZGVPdXQobW9kYWwsIDUpO1xuICByZW1vdmVDbGFzcyhtb2RhbCwgJ3Nob3dTd2VldEFsZXJ0Jyk7XG4gIGFkZENsYXNzKG1vZGFsLCAnaGlkZVN3ZWV0QWxlcnQnKTtcbiAgcmVtb3ZlQ2xhc3MobW9kYWwsICd2aXNpYmxlJyk7XG5cbiAgLypcbiAgICogUmVzZXQgaWNvbiBhbmltYXRpb25zXG4gICAqL1xuICB2YXIgJHN1Y2Nlc3NJY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWljb24uc2Etc3VjY2VzcycpO1xuICByZW1vdmVDbGFzcygkc3VjY2Vzc0ljb24sICdhbmltYXRlJyk7XG4gIHJlbW92ZUNsYXNzKCRzdWNjZXNzSWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EtdGlwJyksICdhbmltYXRlU3VjY2Vzc1RpcCcpO1xuICByZW1vdmVDbGFzcygkc3VjY2Vzc0ljb24ucXVlcnlTZWxlY3RvcignLnNhLWxvbmcnKSwgJ2FuaW1hdGVTdWNjZXNzTG9uZycpO1xuXG4gIHZhciAkZXJyb3JJY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWljb24uc2EtZXJyb3InKTtcbiAgcmVtb3ZlQ2xhc3MoJGVycm9ySWNvbiwgJ2FuaW1hdGVFcnJvckljb24nKTtcbiAgcmVtb3ZlQ2xhc3MoJGVycm9ySWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EteC1tYXJrJyksICdhbmltYXRlWE1hcmsnKTtcblxuICB2YXIgJHdhcm5pbmdJY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWljb24uc2Etd2FybmluZycpO1xuICByZW1vdmVDbGFzcygkd2FybmluZ0ljb24sICdwdWxzZVdhcm5pbmcnKTtcbiAgcmVtb3ZlQ2xhc3MoJHdhcm5pbmdJY29uLnF1ZXJ5U2VsZWN0b3IoJy5zYS1ib2R5JyksICdwdWxzZVdhcm5pbmdJbnMnKTtcbiAgcmVtb3ZlQ2xhc3MoJHdhcm5pbmdJY29uLnF1ZXJ5U2VsZWN0b3IoJy5zYS1kb3QnKSwgJ3B1bHNlV2FybmluZ0lucycpO1xuXG4gIC8vIFJlc2V0IGN1c3RvbSBjbGFzcyAoZGVsYXkgc28gdGhhdCBVSSBjaGFuZ2VzIGFyZW4ndCB2aXNpYmxlKVxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIHZhciBjdXN0b21DbGFzcyA9IG1vZGFsLmdldEF0dHJpYnV0ZSgnZGF0YS1jdXN0b20tY2xhc3MnKTtcbiAgICByZW1vdmVDbGFzcyhtb2RhbCwgY3VzdG9tQ2xhc3MpO1xuICB9LCAzMDApO1xuXG4gIC8vIE1ha2UgcGFnZSBzY3JvbGxhYmxlIGFnYWluXG4gIHJlbW92ZUNsYXNzKGRvY3VtZW50LmJvZHksICdzdG9wLXNjcm9sbGluZycpO1xuXG4gIC8vIFJlc2V0IHRoZSBwYWdlIHRvIGl0cyBwcmV2aW91cyBzdGF0ZVxuICB3aW5kb3cub25rZXlkb3duID0gcHJldmlvdXNXaW5kb3dLZXlEb3duO1xuICBpZiAod2luZG93LnByZXZpb3VzQWN0aXZlRWxlbWVudCkge1xuICAgIHdpbmRvdy5wcmV2aW91c0FjdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuICBsYXN0Rm9jdXNlZEJ1dHRvbiA9IHVuZGVmaW5lZDtcbiAgY2xlYXJUaW1lb3V0KG1vZGFsLnRpbWVvdXQpO1xuXG4gIHJldHVybiB0cnVlO1xufTtcblxuXG4vKlxuICogVmFsaWRhdGlvbiBvZiB0aGUgaW5wdXQgZmllbGQgaXMgZG9uZSBieSB1c2VyXG4gKiBJZiBzb21ldGhpbmcgaXMgd3JvbmcgPT4gY2FsbCBzaG93SW5wdXRFcnJvciB3aXRoIGVycm9yTWVzc2FnZVxuICovXG5zd2VldEFsZXJ0LnNob3dJbnB1dEVycm9yID0gc3dhbC5zaG93SW5wdXRFcnJvciA9IGZ1bmN0aW9uKGVycm9yTWVzc2FnZSkge1xuICB2YXIgbW9kYWwgPSBnZXRNb2RhbCgpO1xuXG4gIHZhciAkZXJyb3JJY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWlucHV0LWVycm9yJyk7XG4gIGFkZENsYXNzKCRlcnJvckljb24sICdzaG93Jyk7XG5cbiAgdmFyICRlcnJvckNvbnRhaW5lciA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5zYS1lcnJvci1jb250YWluZXInKTtcbiAgYWRkQ2xhc3MoJGVycm9yQ29udGFpbmVyLCAnc2hvdycpO1xuXG4gICRlcnJvckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdwJykuaW5uZXJIVE1MID0gZXJyb3JNZXNzYWdlO1xuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgc3dlZXRBbGVydC5lbmFibGVCdXR0b25zKCk7XG4gIH0sIDEpO1xuXG4gIG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykuZm9jdXMoKTtcbn07XG5cblxuLypcbiAqIFJlc2V0IGlucHV0IGVycm9yIERPTSBlbGVtZW50c1xuICovXG5zd2VldEFsZXJ0LnJlc2V0SW5wdXRFcnJvciA9IHN3YWwucmVzZXRJbnB1dEVycm9yID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgLy8gSWYgcHJlc3MgZW50ZXIgPT4gaWdub3JlXG4gIGlmIChldmVudCAmJiBldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciAkbW9kYWwgPSBnZXRNb2RhbCgpO1xuXG4gIHZhciAkZXJyb3JJY29uID0gJG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5zYS1pbnB1dC1lcnJvcicpO1xuICByZW1vdmVDbGFzcygkZXJyb3JJY29uLCAnc2hvdycpO1xuXG4gIHZhciAkZXJyb3JDb250YWluZXIgPSAkbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWVycm9yLWNvbnRhaW5lcicpO1xuICByZW1vdmVDbGFzcygkZXJyb3JDb250YWluZXIsICdzaG93Jyk7XG59O1xuXG4vKlxuICogRGlzYWJsZSBjb25maXJtIGFuZCBjYW5jZWwgYnV0dG9uc1xuICovXG5zd2VldEFsZXJ0LmRpc2FibGVCdXR0b25zID0gc3dhbC5kaXNhYmxlQnV0dG9ucyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIHZhciBtb2RhbCA9IGdldE1vZGFsKCk7XG4gIHZhciAkY29uZmlybUJ1dHRvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jb25maXJtJyk7XG4gIHZhciAkY2FuY2VsQnV0dG9uID0gbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNhbmNlbCcpO1xuICAkY29uZmlybUJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICRjYW5jZWxCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xufTtcblxuLypcbiAqIEVuYWJsZSBjb25maXJtIGFuZCBjYW5jZWwgYnV0dG9uc1xuICovXG5zd2VldEFsZXJ0LmVuYWJsZUJ1dHRvbnMgPSBzd2FsLmVuYWJsZUJ1dHRvbnMgPSBmdW5jdGlvbihldmVudCkge1xuICB2YXIgbW9kYWwgPSBnZXRNb2RhbCgpO1xuICB2YXIgJGNvbmZpcm1CdXR0b24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY29uZmlybScpO1xuICB2YXIgJGNhbmNlbEJ1dHRvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jYW5jZWwnKTtcbiAgJGNvbmZpcm1CdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgJGNhbmNlbEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xufTtcblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIFRoZSAnaGFuZGxlLWNsaWNrJyBtb2R1bGUgcmVxdWlyZXNcbiAgLy8gdGhhdCAnc3dlZXRBbGVydCcgd2FzIHNldCBhcyBnbG9iYWwuXG4gIHdpbmRvdy5zd2VldEFsZXJ0ID0gd2luZG93LnN3YWwgPSBzd2VldEFsZXJ0O1xufSBlbHNlIHtcbiAgbG9nU3RyKCdTd2VldEFsZXJ0IGlzIGEgZnJvbnRlbmQgbW9kdWxlIScpO1xufVxuIiwidmFyIGRlZmF1bHRQYXJhbXMgPSB7XG4gIHRpdGxlOiAnJyxcbiAgdGV4dDogJycsXG4gIHR5cGU6IG51bGwsXG4gIGFsbG93T3V0c2lkZUNsaWNrOiBmYWxzZSxcbiAgc2hvd0NvbmZpcm1CdXR0b246IHRydWUsXG4gIHNob3dDYW5jZWxCdXR0b246IGZhbHNlLFxuICBjbG9zZU9uQ29uZmlybTogdHJ1ZSxcbiAgY2xvc2VPbkNhbmNlbDogdHJ1ZSxcbiAgY29uZmlybUJ1dHRvblRleHQ6ICdPSycsXG4gIGNvbmZpcm1CdXR0b25Db2xvcjogJyM4Q0Q0RjUnLFxuICBjYW5jZWxCdXR0b25UZXh0OiAnQ2FuY2VsJyxcbiAgaW1hZ2VVcmw6IG51bGwsXG4gIGltYWdlU2l6ZTogbnVsbCxcbiAgdGltZXI6IG51bGwsXG4gIGN1c3RvbUNsYXNzOiAnJyxcbiAgaHRtbDogZmFsc2UsXG4gIGFuaW1hdGlvbjogdHJ1ZSxcbiAgYWxsb3dFc2NhcGVLZXk6IHRydWUsXG4gIHNob3dMb2FkZXJPbkNvbmZpcm06IGZhbHNlLFxuICBoYW5kbGVLZXlVcDogbnVsbCxcbiAgaW5wdXRzOiBudWxsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0UGFyYW1zO1xuIiwiaW1wb3J0IHsgY29sb3JMdW1pbmFuY2UgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IGdldE1vZGFsIH0gZnJvbSAnLi9oYW5kbGUtc3dhbC1kb20nO1xuaW1wb3J0IHsgaGFzQ2xhc3MsIGlzRGVzY2VuZGFudCB9IGZyb20gJy4vaGFuZGxlLWRvbSc7XG5cblxuLypcbiAqIFVzZXIgY2xpY2tlZCBvbiBcIkNvbmZpcm1cIi9cIk9LXCIgb3IgXCJDYW5jZWxcIlxuICovXG52YXIgaGFuZGxlQnV0dG9uID0gZnVuY3Rpb24oZXZlbnQsIHBhcmFtcywgbW9kYWwpIHtcbiAgdmFyIGUgPSBldmVudCB8fCB3aW5kb3cuZXZlbnQ7XG4gIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG5cbiAgdmFyIHRhcmdldGVkQ29uZmlybSA9IHRhcmdldC5jbGFzc05hbWUuaW5kZXhPZignY29uZmlybScpICE9PSAtMTtcbiAgdmFyIHRhcmdldGVkT3ZlcmxheSA9IHRhcmdldC5jbGFzc05hbWUuaW5kZXhPZignc3dlZXQtb3ZlcmxheScpICE9PSAtMTtcbiAgdmFyIG1vZGFsSXNWaXNpYmxlICA9IGhhc0NsYXNzKG1vZGFsLCAndmlzaWJsZScpO1xuICB2YXIgZG9uZUZ1bmN0aW9uRXhpc3RzID0gKHBhcmFtcy5kb25lRnVuY3Rpb24gJiYgbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWhhcy1kb25lLWZ1bmN0aW9uJykgPT09ICd0cnVlJyk7XG5cbiAgLy8gU2luY2UgdGhlIHVzZXIgY2FuIGNoYW5nZSB0aGUgYmFja2dyb3VuZC1jb2xvciBvZiB0aGUgY29uZmlybSBidXR0b24gcHJvZ3JhbW1hdGljYWxseSxcbiAgLy8gd2UgbXVzdCBjYWxjdWxhdGUgd2hhdCB0aGUgY29sb3Igc2hvdWxkIGJlIG9uIGhvdmVyL2FjdGl2ZVxuICB2YXIgbm9ybWFsQ29sb3IsIGhvdmVyQ29sb3IsIGFjdGl2ZUNvbG9yO1xuICBpZiAodGFyZ2V0ZWRDb25maXJtICYmIHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3IpIHtcbiAgICBub3JtYWxDb2xvciAgPSBwYXJhbXMuY29uZmlybUJ1dHRvbkNvbG9yO1xuICAgIGhvdmVyQ29sb3IgICA9IGNvbG9yTHVtaW5hbmNlKG5vcm1hbENvbG9yLCAtMC4wNCk7XG4gICAgYWN0aXZlQ29sb3IgID0gY29sb3JMdW1pbmFuY2Uobm9ybWFsQ29sb3IsIC0wLjE0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3VsZFNldENvbmZpcm1CdXR0b25Db2xvcihjb2xvcikge1xuICAgIGlmICh0YXJnZXRlZENvbmZpcm0gJiYgcGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcikge1xuICAgICAgdGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbG9yO1xuICAgIH1cbiAgfVxuXG4gIHN3aXRjaCAoZS50eXBlKSB7XG4gICAgY2FzZSAnbW91c2VvdmVyJzpcbiAgICAgIHNob3VsZFNldENvbmZpcm1CdXR0b25Db2xvcihob3ZlckNvbG9yKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbW91c2VvdXQnOlxuICAgICAgc2hvdWxkU2V0Q29uZmlybUJ1dHRvbkNvbG9yKG5vcm1hbENvbG9yKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbW91c2Vkb3duJzpcbiAgICAgIHNob3VsZFNldENvbmZpcm1CdXR0b25Db2xvcihhY3RpdmVDb2xvcik7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ21vdXNldXAnOlxuICAgICAgc2hvdWxkU2V0Q29uZmlybUJ1dHRvbkNvbG9yKGhvdmVyQ29sb3IpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdmb2N1cyc6XG4gICAgICBsZXQgJGNvbmZpcm1CdXR0b24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY29uZmlybScpO1xuICAgICAgbGV0ICRjYW5jZWxCdXR0b24gID0gbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNhbmNlbCcpO1xuXG4gICAgICBpZiAodGFyZ2V0ZWRDb25maXJtKSB7XG4gICAgICAgICRjYW5jZWxCdXR0b24uc3R5bGUuYm94U2hhZG93ID0gJ25vbmUnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJGNvbmZpcm1CdXR0b24uc3R5bGUuYm94U2hhZG93ID0gJ25vbmUnO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdjbGljayc6XG4gICAgICBsZXQgY2xpY2tlZE9uTW9kYWwgPSAobW9kYWwgPT09IHRhcmdldCk7XG4gICAgICBsZXQgY2xpY2tlZE9uTW9kYWxDaGlsZCA9IGlzRGVzY2VuZGFudChtb2RhbCwgdGFyZ2V0KTtcblxuICAgICAgLy8gSWdub3JlIGNsaWNrIG91dHNpZGUgaWYgYWxsb3dPdXRzaWRlQ2xpY2sgaXMgZmFsc2VcbiAgICAgIGlmICghY2xpY2tlZE9uTW9kYWwgJiYgIWNsaWNrZWRPbk1vZGFsQ2hpbGQgJiYgbW9kYWxJc1Zpc2libGUgJiYgIXBhcmFtcy5hbGxvd091dHNpZGVDbGljaykge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKHRhcmdldGVkQ29uZmlybSAmJiBkb25lRnVuY3Rpb25FeGlzdHMgJiYgbW9kYWxJc1Zpc2libGUpIHtcbiAgICAgICAgaGFuZGxlQ29uZmlybShtb2RhbCwgcGFyYW1zKTtcbiAgICAgIH0gZWxzZSBpZiAoZG9uZUZ1bmN0aW9uRXhpc3RzICYmIG1vZGFsSXNWaXNpYmxlIHx8IHRhcmdldGVkT3ZlcmxheSkge1xuICAgICAgICBoYW5kbGVDYW5jZWwobW9kYWwsIHBhcmFtcyk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVzY2VuZGFudChtb2RhbCwgdGFyZ2V0KSAmJiB0YXJnZXQudGFnTmFtZSA9PT0gJ0JVVFRPTicpIHtcbiAgICAgICAgc3dlZXRBbGVydC5jbG9zZSgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cbn07XG5cbi8qXG4gKiAgVXNlciBjbGlja2VkIG9uIFwiQ29uZmlybVwiL1wiT0tcIlxuICovXG52YXIgaGFuZGxlQ29uZmlybSA9IGZ1bmN0aW9uKG1vZGFsLCBwYXJhbXMpIHtcbiAgdmFyIGNhbGxiYWNrVmFsdWUgPSB0cnVlO1xuXG4gIGlmIChoYXNDbGFzcyhtb2RhbCwgJ3Nob3ctaW5wdXQnKSkge1xuICAgIGNhbGxiYWNrVmFsdWUgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpLnZhbHVlO1xuXG4gICAgaWYgKCFjYWxsYmFja1ZhbHVlKSB7XG4gICAgICBjYWxsYmFja1ZhbHVlID0gJyc7XG4gICAgfVxuICB9XG5cbiAgcGFyYW1zLmRvbmVGdW5jdGlvbihjYWxsYmFja1ZhbHVlKTtcblxuICBpZiAocGFyYW1zLmNsb3NlT25Db25maXJtKSB7XG4gICAgc3dlZXRBbGVydC5jbG9zZSgpO1xuICB9XG4gIC8vIERpc2FibGUgY2FuY2VsIGFuZCBjb25maXJtIGJ1dHRvbiBpZiB0aGUgcGFyYW1ldGVyIGlzIHRydWVcbiAgaWYgKHBhcmFtcy5zaG93TG9hZGVyT25Db25maXJtKSB7XG4gICAgc3dlZXRBbGVydC5kaXNhYmxlQnV0dG9ucygpO1xuICB9XG59O1xuXG4vKlxuICogIFVzZXIgY2xpY2tlZCBvbiBcIkNhbmNlbFwiXG4gKi9cbnZhciBoYW5kbGVDYW5jZWwgPSBmdW5jdGlvbihtb2RhbCwgcGFyYW1zKSB7XG4gIC8vIENoZWNrIGlmIGNhbGxiYWNrIGZ1bmN0aW9uIGV4cGVjdHMgYSBwYXJhbWV0ZXIgKHRvIHRyYWNrIGNhbmNlbCBhY3Rpb25zKVxuICB2YXIgZnVuY3Rpb25Bc1N0ciA9IFN0cmluZyhwYXJhbXMuZG9uZUZ1bmN0aW9uKS5yZXBsYWNlKC9cXHMvZywgJycpO1xuICB2YXIgZnVuY3Rpb25IYW5kbGVzQ2FuY2VsID0gZnVuY3Rpb25Bc1N0ci5zdWJzdHJpbmcoMCwgOSkgPT09ICdmdW5jdGlvbignICYmIGZ1bmN0aW9uQXNTdHIuc3Vic3RyaW5nKDksIDEwKSAhPT0gJyknO1xuXG4gIGlmIChmdW5jdGlvbkhhbmRsZXNDYW5jZWwpIHtcbiAgICBwYXJhbXMuZG9uZUZ1bmN0aW9uKGZhbHNlKTtcbiAgfVxuXG4gIGlmIChwYXJhbXMuY2xvc2VPbkNhbmNlbCkge1xuICAgIHN3ZWV0QWxlcnQuY2xvc2UoKTtcbiAgfVxufTtcblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGhhbmRsZUJ1dHRvbixcbiAgaGFuZGxlQ29uZmlybSxcbiAgaGFuZGxlQ2FuY2VsXG59O1xuIiwidmFyIGhhc0NsYXNzID0gZnVuY3Rpb24oZWxlbSwgY2xhc3NOYW1lKSB7XG4gIHJldHVybiBuZXcgUmVnRXhwKCcgJyArIGNsYXNzTmFtZSArICcgJykudGVzdCgnICcgKyBlbGVtLmNsYXNzTmFtZSArICcgJyk7XG59O1xuXG52YXIgYWRkQ2xhc3MgPSBmdW5jdGlvbihlbGVtLCBjbGFzc05hbWUpIHtcbiAgaWYgKCFoYXNDbGFzcyhlbGVtLCBjbGFzc05hbWUpKSB7XG4gICAgZWxlbS5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xuICB9XG59O1xuXG52YXIgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihlbGVtLCBjbGFzc05hbWUpIHtcbiAgdmFyIG5ld0NsYXNzID0gJyAnICsgZWxlbS5jbGFzc05hbWUucmVwbGFjZSgvW1xcdFxcclxcbl0vZywgJyAnKSArICcgJztcbiAgaWYgKGhhc0NsYXNzKGVsZW0sIGNsYXNzTmFtZSkpIHtcbiAgICB3aGlsZSAobmV3Q2xhc3MuaW5kZXhPZignICcgKyBjbGFzc05hbWUgKyAnICcpID49IDApIHtcbiAgICAgIG5ld0NsYXNzID0gbmV3Q2xhc3MucmVwbGFjZSgnICcgKyBjbGFzc05hbWUgKyAnICcsICcgJyk7XG4gICAgfVxuICAgIGVsZW0uY2xhc3NOYW1lID0gbmV3Q2xhc3MucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICB9XG59O1xuXG52YXIgZXNjYXBlSHRtbCA9IGZ1bmN0aW9uKHN0cikge1xuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdHIpKTtcbiAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XG59O1xuXG52YXIgX3Nob3cgPSBmdW5jdGlvbihlbGVtKSB7XG4gIGVsZW0uc3R5bGUub3BhY2l0eSA9ICcnO1xuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xufTtcblxudmFyIHNob3cgPSBmdW5jdGlvbihlbGVtcykge1xuICBpZiAoZWxlbXMgJiYgIWVsZW1zLmxlbmd0aCkge1xuICAgIHJldHVybiBfc2hvdyhlbGVtcyk7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtcy5sZW5ndGg7ICsraSkge1xuICAgIF9zaG93KGVsZW1zW2ldKTtcbiAgfVxufTtcblxudmFyIF9oaWRlID0gZnVuY3Rpb24oZWxlbSkge1xuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAnJztcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xufTtcblxudmFyIGhpZGUgPSBmdW5jdGlvbihlbGVtcykge1xuICBpZiAoZWxlbXMgJiYgIWVsZW1zLmxlbmd0aCkge1xuICAgIHJldHVybiBfaGlkZShlbGVtcyk7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtcy5sZW5ndGg7ICsraSkge1xuICAgIF9oaWRlKGVsZW1zW2ldKTtcbiAgfVxufTtcblxudmFyIGlzRGVzY2VuZGFudCA9IGZ1bmN0aW9uKHBhcmVudCwgY2hpbGQpIHtcbiAgdmFyIG5vZGUgPSBjaGlsZC5wYXJlbnROb2RlO1xuICB3aGlsZSAobm9kZSAhPT0gbnVsbCkge1xuICAgIGlmIChub2RlID09PSBwYXJlbnQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbnZhciBnZXRUb3BNYXJnaW4gPSBmdW5jdGlvbihlbGVtKSB7XG4gIGVsZW0uc3R5bGUubGVmdCA9ICctOTk5OXB4JztcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICB2YXIgaGVpZ2h0ID0gZWxlbS5jbGllbnRIZWlnaHQsXG4gICAgICBwYWRkaW5nO1xuICBpZiAodHlwZW9mIGdldENvbXB1dGVkU3R5bGUgIT09IFwidW5kZWZpbmVkXCIpIHsgLy8gSUUgOFxuICAgIHBhZGRpbmcgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGVsZW0pLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctdG9wJyksIDEwKTtcbiAgfSBlbHNlIHtcbiAgICBwYWRkaW5nID0gcGFyc2VJbnQoZWxlbS5jdXJyZW50U3R5bGUucGFkZGluZyk7XG4gIH1cblxuICBlbGVtLnN0eWxlLmxlZnQgPSAnJztcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICByZXR1cm4gKCctJyArIHBhcnNlSW50KChoZWlnaHQgKyBwYWRkaW5nKSAvIDIpICsgJ3B4Jyk7XG59O1xuXG52YXIgZmFkZUluID0gZnVuY3Rpb24oZWxlbSwgaW50ZXJ2YWwpIHtcbiAgaWYgKCtlbGVtLnN0eWxlLm9wYWNpdHkgPCAxKSB7XG4gICAgaW50ZXJ2YWwgPSBpbnRlcnZhbCB8fCAxNjtcbiAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgdmFyIGxhc3QgPSArbmV3IERhdGUoKTtcbiAgICB2YXIgdGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gK2VsZW0uc3R5bGUub3BhY2l0eSArIChuZXcgRGF0ZSgpIC0gbGFzdCkgLyAxMDA7XG4gICAgICBsYXN0ID0gK25ldyBEYXRlKCk7XG5cbiAgICAgIGlmICgrZWxlbS5zdHlsZS5vcGFjaXR5IDwgMSkge1xuICAgICAgICBzZXRUaW1lb3V0KHRpY2ssIGludGVydmFsKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRpY2soKTtcbiAgfVxuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snOyAvL2ZhbGxiYWNrIElFOFxufTtcblxudmFyIGZhZGVPdXQgPSBmdW5jdGlvbihlbGVtLCBpbnRlcnZhbCkge1xuICBpbnRlcnZhbCA9IGludGVydmFsIHx8IDE2O1xuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAxO1xuICB2YXIgbGFzdCA9ICtuZXcgRGF0ZSgpO1xuICB2YXIgdGljayA9IGZ1bmN0aW9uKCkge1xuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9ICtlbGVtLnN0eWxlLm9wYWNpdHkgLSAobmV3IERhdGUoKSAtIGxhc3QpIC8gMTAwO1xuICAgIGxhc3QgPSArbmV3IERhdGUoKTtcblxuICAgIGlmICgrZWxlbS5zdHlsZS5vcGFjaXR5ID4gMCkge1xuICAgICAgc2V0VGltZW91dCh0aWNrLCBpbnRlcnZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG4gIH07XG4gIHRpY2soKTtcbn07XG5cbnZhciBmaXJlQ2xpY2sgPSBmdW5jdGlvbihub2RlKSB7XG4gIC8vIFRha2VuIGZyb20gaHR0cDovL3d3dy5ub25vYnRydXNpdmUuY29tLzIwMTEvMTEvMjkvcHJvZ3JhbWF0aWNhbGx5LWZpcmUtY3Jvc3Nicm93c2VyLWNsaWNrLWV2ZW50LXdpdGgtamF2YXNjcmlwdC9cbiAgLy8gVGhlbiBmaXhlZCBmb3IgdG9kYXkncyBDaHJvbWUgYnJvd3Nlci5cbiAgaWYgKHR5cGVvZiBNb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gVXAtdG8tZGF0ZSBhcHByb2FjaFxuICAgIHZhciBtZXZ0ID0gbmV3IE1vdXNlRXZlbnQoJ2NsaWNrJywge1xuICAgICAgdmlldzogd2luZG93LFxuICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgbm9kZS5kaXNwYXRjaEV2ZW50KG1ldnQpO1xuICB9IGVsc2UgaWYgKCBkb2N1bWVudC5jcmVhdGVFdmVudCApIHtcbiAgICAvLyBGYWxsYmFja1xuICAgIHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudHMnKTtcbiAgICBldnQuaW5pdEV2ZW50KCdjbGljaycsIGZhbHNlLCBmYWxzZSk7XG4gICAgbm9kZS5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gIH0gZWxzZSBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QpIHtcbiAgICBub2RlLmZpcmVFdmVudCgnb25jbGljaycpIDtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygbm9kZS5vbmNsaWNrID09PSAnZnVuY3Rpb24nICkge1xuICAgIG5vZGUub25jbGljaygpO1xuICB9XG59O1xuXG52YXIgc3RvcEV2ZW50UHJvcGFnYXRpb24gPSBmdW5jdGlvbihlKSB7XG4gIC8vIEluIHBhcnRpY3VsYXIsIG1ha2Ugc3VyZSB0aGUgc3BhY2UgYmFyIGRvZXNuJ3Qgc2Nyb2xsIHRoZSBtYWluIHdpbmRvdy5cbiAgaWYgKHR5cGVvZiBlLnN0b3BQcm9wYWdhdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9IGVsc2UgaWYgKHdpbmRvdy5ldmVudCAmJiB3aW5kb3cuZXZlbnQuaGFzT3duUHJvcGVydHkoJ2NhbmNlbEJ1YmJsZScpKSB7XG4gICAgd2luZG93LmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gIH1cbn07XG5cbmV4cG9ydCB7IFxuICBoYXNDbGFzcywgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzLCBcbiAgZXNjYXBlSHRtbCwgXG4gIF9zaG93LCBzaG93LCBfaGlkZSwgaGlkZSwgXG4gIGlzRGVzY2VuZGFudCwgXG4gIGdldFRvcE1hcmdpbixcbiAgZmFkZUluLCBmYWRlT3V0LFxuICBmaXJlQ2xpY2ssXG4gIHN0b3BFdmVudFByb3BhZ2F0aW9uXG59O1xuIiwiaW1wb3J0IHsgc3RvcEV2ZW50UHJvcGFnYXRpb24sIGZpcmVDbGljayB9IGZyb20gJy4vaGFuZGxlLWRvbSc7XG5pbXBvcnQgeyBzZXRGb2N1c1N0eWxlIH0gZnJvbSAnLi9oYW5kbGUtc3dhbC1kb20nO1xuXG5cbnZhciBoYW5kbGVLZXlEb3duID0gZnVuY3Rpb24oZXZlbnQsIHBhcmFtcywgbW9kYWwpIHtcbiAgdmFyIGUgPSBldmVudCB8fCB3aW5kb3cuZXZlbnQ7XG4gIHZhciBrZXlDb2RlID0gZS5rZXlDb2RlIHx8IGUud2hpY2g7XG5cbiAgdmFyICRva0J1dHRvbiAgICAgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY29uZmlybScpO1xuICB2YXIgJGNhbmNlbEJ1dHRvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jYW5jZWwnKTtcbiAgdmFyICRtb2RhbEJ1dHRvbnMgPSBtb2RhbC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b25bdGFiaW5kZXhdJyk7XG5cblxuICBpZiAoWzksIDEzLCAzMiwgMjddLmluZGV4T2Yoa2V5Q29kZSkgPT09IC0xKSB7XG4gICAgLy8gRG9uJ3QgZG8gd29yayBvbiBrZXlzIHdlIGRvbid0IGNhcmUgYWJvdXQuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyICR0YXJnZXRFbGVtZW50ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuXG4gIHZhciBidG5JbmRleCA9IC0xOyAvLyBGaW5kIHRoZSBidXR0b24gLSBub3RlLCB0aGlzIGlzIGEgbm9kZWxpc3QsIG5vdCBhbiBhcnJheS5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAkbW9kYWxCdXR0b25zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCR0YXJnZXRFbGVtZW50ID09PSAkbW9kYWxCdXR0b25zW2ldKSB7XG4gICAgICBidG5JbmRleCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAoa2V5Q29kZSA9PT0gOSkge1xuICAgIC8vIFRBQlxuICAgIGlmIChidG5JbmRleCA9PT0gLTEpIHtcbiAgICAgIC8vIE5vIGJ1dHRvbiBmb2N1c2VkLiBKdW1wIHRvIHRoZSBjb25maXJtIGJ1dHRvbi5cbiAgICAgICR0YXJnZXRFbGVtZW50ID0gJG9rQnV0dG9uO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDeWNsZSB0byB0aGUgbmV4dCBidXR0b25cbiAgICAgIGlmIChidG5JbmRleCA9PT0gJG1vZGFsQnV0dG9ucy5sZW5ndGggLSAxKSB7XG4gICAgICAgICR0YXJnZXRFbGVtZW50ID0gJG1vZGFsQnV0dG9uc1swXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICR0YXJnZXRFbGVtZW50ID0gJG1vZGFsQnV0dG9uc1tidG5JbmRleCArIDFdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0b3BFdmVudFByb3BhZ2F0aW9uKGUpO1xuICAgICR0YXJnZXRFbGVtZW50LmZvY3VzKCk7XG5cbiAgICBpZiAocGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcikge1xuICAgICAgc2V0Rm9jdXNTdHlsZSgkdGFyZ2V0RWxlbWVudCwgcGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChrZXlDb2RlID09PSAxMykge1xuICAgICAgaWYgKCR0YXJnZXRFbGVtZW50LnRhZ05hbWUgPT09ICdJTlBVVCcpIHtcbiAgICAgICAgJHRhcmdldEVsZW1lbnQgPSAkb2tCdXR0b247XG4gICAgICAgICRva0J1dHRvbi5mb2N1cygpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYnRuSW5kZXggPT09IC0xKSB7XG4gICAgICAgIC8vIEVOVEVSL1NQQUNFIGNsaWNrZWQgb3V0c2lkZSBvZiBhIGJ1dHRvbi5cbiAgICAgICAgJHRhcmdldEVsZW1lbnQgPSAkb2tCdXR0b247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBEbyBub3RoaW5nIC0gbGV0IHRoZSBicm93c2VyIGhhbmRsZSBpdC5cbiAgICAgICAgJHRhcmdldEVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChrZXlDb2RlID09PSAyNyAmJiBwYXJhbXMuYWxsb3dFc2NhcGVLZXkgPT09IHRydWUpIHtcbiAgICAgICR0YXJnZXRFbGVtZW50ID0gJGNhbmNlbEJ1dHRvbjtcbiAgICAgIGZpcmVDbGljaygkdGFyZ2V0RWxlbWVudCwgZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZhbGxiYWNrIC0gbGV0IHRoZSBicm93c2VyIGhhbmRsZSBpdC5cbiAgICAgICR0YXJnZXRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgaGFuZGxlS2V5RG93bjtcbiIsImltcG9ydCB7IGhleFRvUmdiIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyByZW1vdmVDbGFzcywgZ2V0VG9wTWFyZ2luLCBmYWRlSW4sIHNob3csIGFkZENsYXNzIH0gZnJvbSAnLi9oYW5kbGUtZG9tJztcbmltcG9ydCBkZWZhdWx0UGFyYW1zIGZyb20gJy4vZGVmYXVsdC1wYXJhbXMnO1xuXG52YXIgbW9kYWxDbGFzcyAgID0gJy5zd2VldC1hbGVydCc7XG52YXIgb3ZlcmxheUNsYXNzID0gJy5zd2VldC1vdmVybGF5JztcblxuLypcbiAqIEFkZCBtb2RhbCArIG92ZXJsYXkgdG8gRE9NXG4gKi9cbmltcG9ydCBpbmplY3RlZEhUTUwgZnJvbSAnLi9pbmplY3RlZC1odG1sJztcblxudmFyIHN3ZWV0QWxlcnRJbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzd2VldFdyYXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgc3dlZXRXcmFwLmlubmVySFRNTCA9IGluamVjdGVkSFRNTDtcblxuICAvLyBBcHBlbmQgZWxlbWVudHMgdG8gYm9keVxuICB3aGlsZSAoc3dlZXRXcmFwLmZpcnN0Q2hpbGQpIHtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN3ZWV0V3JhcC5maXJzdENoaWxkKTtcbiAgfVxufTtcblxuLypcbiAqIEdldCBET00gZWxlbWVudCBvZiBtb2RhbFxuICovXG52YXIgZ2V0TW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgdmFyICRtb2RhbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IobW9kYWxDbGFzcyk7XG5cbiAgaWYgKCEkbW9kYWwpIHtcbiAgICBzd2VldEFsZXJ0SW5pdGlhbGl6ZSgpO1xuICAgICRtb2RhbCA9IGdldE1vZGFsKCk7XG4gIH1cblxuICByZXR1cm4gJG1vZGFsO1xufTtcblxuLypcbiAqIEdldCBET00gZWxlbWVudCBvZiBpbnB1dCAoaW4gbW9kYWwpXG4gKi9cbnZhciBnZXRJbnB1dHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyICRtb2RhbCA9IGdldE1vZGFsKCk7XG4gIGlmICgkbW9kYWwpIHtcbiAgICB2YXIgZGl2X2xpc3QgPSAkbW9kYWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQnKTtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGRpdl9saXN0ICk7IC8vIGNvbnZlcnRzIE5vZGVMaXN0IHRvIEFycmF5XG4gIH1cbn07XG5cbi8qXG4gKiBHZXQgRE9NIGVsZW1lbnQgb2Ygb3ZlcmxheVxuICovXG52YXIgZ2V0T3ZlcmxheSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvdmVybGF5Q2xhc3MpO1xufTtcblxuLypcbiAqIEFkZCBib3gtc2hhZG93IHN0eWxlIHRvIGJ1dHRvbiAoZGVwZW5kaW5nIG9uIGl0cyBjaG9zZW4gYmctY29sb3IpXG4gKi9cbnZhciBzZXRGb2N1c1N0eWxlID0gZnVuY3Rpb24oJGJ1dHRvbiwgYmdDb2xvcikge1xuICB2YXIgcmdiQ29sb3IgPSBoZXhUb1JnYihiZ0NvbG9yKTtcbiAgJGJ1dHRvbi5zdHlsZS5ib3hTaGFkb3cgPSAnMCAwIDJweCByZ2JhKCcgKyByZ2JDb2xvciArICcsIDAuOCksIGluc2V0IDAgMCAwIDFweCByZ2JhKDAsIDAsIDAsIDAuMDUpJztcbn07XG5cbi8qXG4gKiBBbmltYXRpb24gd2hlbiBvcGVuaW5nIG1vZGFsXG4gKi9cbnZhciBvcGVuTW9kYWwgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICB2YXIgJG1vZGFsID0gZ2V0TW9kYWwoKTtcbiAgZmFkZUluKGdldE92ZXJsYXkoKSwgMTApO1xuICBzaG93KCRtb2RhbCk7XG4gIGFkZENsYXNzKCRtb2RhbCwgJ3Nob3dTd2VldEFsZXJ0Jyk7XG4gIHJlbW92ZUNsYXNzKCRtb2RhbCwgJ2hpZGVTd2VldEFsZXJ0Jyk7XG5cbiAgd2luZG93LnByZXZpb3VzQWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIHZhciAkb2tCdXR0b24gPSAkbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNvbmZpcm0nKTtcbiAgJG9rQnV0dG9uLmZvY3VzKCk7XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgYWRkQ2xhc3MoJG1vZGFsLCAndmlzaWJsZScpO1xuICB9LCA1MDApO1xuXG4gIHZhciB0aW1lciA9ICRtb2RhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGltZXInKTtcblxuICBpZiAodGltZXIgIT09ICdudWxsJyAmJiB0aW1lciAhPT0gJycpIHtcbiAgICB2YXIgdGltZXJDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICRtb2RhbC50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkb25lRnVuY3Rpb25FeGlzdHMgPSAoKHRpbWVyQ2FsbGJhY2sgfHwgbnVsbCkgJiYgJG1vZGFsLmdldEF0dHJpYnV0ZSgnZGF0YS1oYXMtZG9uZS1mdW5jdGlvbicpID09PSAndHJ1ZScpO1xuICAgICAgaWYgKGRvbmVGdW5jdGlvbkV4aXN0cykgeyBcbiAgICAgICAgdGltZXJDYWxsYmFjayhudWxsKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzd2VldEFsZXJ0LmNsb3NlKCk7XG4gICAgICB9XG4gICAgfSwgdGltZXIpO1xuICB9XG59O1xuXG4vKlxuICogUmVzZXQgdGhlIHN0eWxpbmcgb2YgdGhlIGlucHV0XG4gKiAoZm9yIGV4YW1wbGUgaWYgZXJyb3JzIGhhdmUgYmVlbiBzaG93bilcbiAqL1xudmFyIHJlc2V0SW5wdXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyICRtb2RhbCA9IGdldE1vZGFsKCk7XG4gIHZhciAkaW5wdXRzID0gZ2V0SW5wdXRzKCk7XG5cbiAgcmVtb3ZlQ2xhc3MoJG1vZGFsLCAnc2hvdy1pbnB1dCcpOy8qXG4gICRpbnB1dC52YWx1ZSA9IGRlZmF1bHRQYXJhbXMuaW5wdXRWYWx1ZTtcbiAgJGlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsIGRlZmF1bHRQYXJhbXMuaW5wdXRUeXBlKTtcbiAgJGlucHV0LnNldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInLCBkZWZhdWx0UGFyYW1zLmlucHV0UGxhY2Vob2xkZXIpO1xuKi9cbiAgcmVzZXRJbnB1dEVycm9yKCk7XG59O1xuXG5cbnZhciByZXNldElucHV0RXJyb3IgPSBmdW5jdGlvbihldmVudCkge1xuICAvLyBJZiBwcmVzcyBlbnRlciA9PiBpZ25vcmVcbiAgaWYgKGV2ZW50ICYmIGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyICRtb2RhbCA9IGdldE1vZGFsKCk7XG5cbiAgdmFyICRlcnJvckljb24gPSAkbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWlucHV0LWVycm9yJyk7XG4gIHJlbW92ZUNsYXNzKCRlcnJvckljb24sICdzaG93Jyk7XG5cbiAgdmFyICRlcnJvckNvbnRhaW5lciA9ICRtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtZXJyb3ItY29udGFpbmVyJyk7XG4gIHJlbW92ZUNsYXNzKCRlcnJvckNvbnRhaW5lciwgJ3Nob3cnKTtcbn07XG5cblxuLypcbiAqIFNldCBcIm1hcmdpbi10b3BcIi1wcm9wZXJ0eSBvbiBtb2RhbCBiYXNlZCBvbiBpdHMgY29tcHV0ZWQgaGVpZ2h0XG4gKi9cbnZhciBmaXhWZXJ0aWNhbFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gIHZhciAkbW9kYWwgPSBnZXRNb2RhbCgpO1xuICAkbW9kYWwuc3R5bGUubWFyZ2luVG9wID0gZ2V0VG9wTWFyZ2luKGdldE1vZGFsKCkpO1xufTtcblxuXG5leHBvcnQgeyBcbiAgc3dlZXRBbGVydEluaXRpYWxpemUsXG4gIGdldE1vZGFsLFxuICBnZXRPdmVybGF5LFxuICBnZXRJbnB1dHMsXG4gIHNldEZvY3VzU3R5bGUsXG4gIG9wZW5Nb2RhbCxcbiAgcmVzZXRJbnB1dCxcbiAgcmVzZXRJbnB1dEVycm9yLFxuICBmaXhWZXJ0aWNhbFBvc2l0aW9uXG59O1xuIiwidmFyIGluamVjdGVkSFRNTCA9IFxuXG4gIC8vIERhcmsgb3ZlcmxheVxuICBgPGRpdiBjbGFzcz1cInN3ZWV0LW92ZXJsYXlcIiB0YWJJbmRleD1cIi0xXCI+PC9kaXY+YCArXG5cbiAgLy8gTW9kYWxcbiAgYDxkaXYgY2xhc3M9XCJzd2VldC1hbGVydFwiPmAgK1xuXG4gICAgLy8gRXJyb3IgaWNvblxuICAgIGA8ZGl2IGNsYXNzPVwic2EtaWNvbiBzYS1lcnJvclwiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJzYS14LW1hcmtcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJzYS1saW5lIHNhLWxlZnRcIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwic2EtbGluZSBzYS1yaWdodFwiPjwvc3Bhbj5cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2Rpdj5gICtcblxuICAgIC8vIFdhcm5pbmcgaWNvblxuICAgIGA8ZGl2IGNsYXNzPVwic2EtaWNvbiBzYS13YXJuaW5nXCI+XG4gICAgICA8c3BhbiBjbGFzcz1cInNhLWJvZHlcIj48L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz1cInNhLWRvdFwiPjwvc3Bhbj5cbiAgICA8L2Rpdj5gICtcblxuICAgIC8vIEluZm8gaWNvblxuICAgIGA8ZGl2IGNsYXNzPVwic2EtaWNvbiBzYS1pbmZvXCI+PC9kaXY+YCArXG5cbiAgICAvLyBTdWNjZXNzIGljb25cbiAgICBgPGRpdiBjbGFzcz1cInNhLWljb24gc2Etc3VjY2Vzc1wiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJzYS1saW5lIHNhLXRpcFwiPjwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPVwic2EtbGluZSBzYS1sb25nXCI+PC9zcGFuPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwic2EtcGxhY2Vob2xkZXJcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzYS1maXhcIj48L2Rpdj5cbiAgICA8L2Rpdj5gICtcblxuICAgIGA8ZGl2IGNsYXNzPVwic2EtaWNvbiBzYS1jdXN0b21cIj48L2Rpdj5gICtcblxuICAgIC8vIFRpdGxlLCB0ZXh0IGFuZCBpbnB1dFxuICAgIGA8aDI+VGl0bGU8L2gyPlxuICAgIDxwPlRleHQ8L3A+XG4gICAgPGRpdiBjbGFzcz1cInNhLWlucHV0c1wiPlxuICAgICAgPGZpZWxkc2V0PlxuICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiB0YWJJbmRleD1cIjNcIiAvPlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2EtaW5wdXQtZXJyb3JcIj48L2Rpdj5cbiAgICAgIDwvZmllbGRzZXQ+XG4gICAgPC9kaXY+YCArXG5cbiAgICAvLyBJbnB1dCBlcnJvcnNcbiAgICBgPGRpdiBjbGFzcz1cInNhLWVycm9yLWNvbnRhaW5lclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImljb25cIj4hPC9kaXY+XG4gICAgICA8cD5Ob3QgdmFsaWQhPC9wPlxuICAgIDwvZGl2PmAgK1xuXG4gICAgLy8gQ2FuY2VsIGFuZCBjb25maXJtIGJ1dHRvbnNcbiAgICBgPGRpdiBjbGFzcz1cInNhLWJ1dHRvbi1jb250YWluZXJcIj5cbiAgICAgIDxidXR0b24gY2xhc3M9XCJjYW5jZWxcIiB0YWJJbmRleD1cIjJcIj5DYW5jZWw8L2J1dHRvbj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzYS1jb25maXJtLWJ1dHRvbi1jb250YWluZXJcIj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImNvbmZpcm1cIiB0YWJJbmRleD1cIjFcIj5PSzwvYnV0dG9uPmAgKyBcblxuICAgICAgICAvLyBMb2FkaW5nIGFuaW1hdGlvblxuICAgICAgICBgPGRpdiBjbGFzcz1cImxhLWJhbGwtZmFsbFwiPlxuICAgICAgICAgIDxkaXY+PC9kaXY+XG4gICAgICAgICAgPGRpdj48L2Rpdj5cbiAgICAgICAgICA8ZGl2PjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PmAgK1xuXG4gIC8vIEVuZCBvZiBtb2RhbFxuICBgPC9kaXY+YDtcblxuZXhwb3J0IGRlZmF1bHQgaW5qZWN0ZWRIVE1MO1xuIiwidmFyIGFsZXJ0VHlwZXMgPSBbJ2Vycm9yJywgJ3dhcm5pbmcnLCAnaW5mbycsICdzdWNjZXNzJywgJ2lucHV0JywgJ3Byb21wdCddO1xuXG5pbXBvcnQge1xuICBpc0lFOFxufSBmcm9tICcuL3V0aWxzJztcblxuaW1wb3J0IHtcbiAgZ2V0TW9kYWwsXG4gIGdldElucHV0cyxcbiAgc2V0Rm9jdXNTdHlsZVxufSBmcm9tICcuL2hhbmRsZS1zd2FsLWRvbSc7XG5cbmltcG9ydCB7XG4gIGhhc0NsYXNzLCBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsXG4gIGVzY2FwZUh0bWwsXG4gIF9zaG93LCBzaG93LCBfaGlkZSwgaGlkZVxufSBmcm9tICcuL2hhbmRsZS1kb20nO1xuXG5cbi8qXG4gKiBTZXQgdHlwZSwgdGV4dCBhbmQgYWN0aW9ucyBvbiBtb2RhbFxuICovXG52YXIgc2V0UGFyYW1ldGVycyA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICB2YXIgbW9kYWwgPSBnZXRNb2RhbCgpO1xuXG4gIHZhciAkdGl0bGUgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdoMicpO1xuICB2YXIgJHRleHQgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdwJyk7XG4gIHZhciAkY2FuY2VsQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNhbmNlbCcpO1xuICB2YXIgJGNvbmZpcm1CdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY29uZmlybScpO1xuXG4gIC8qXG4gICAqIFRpdGxlXG4gICAqL1xuICAkdGl0bGUuaW5uZXJIVE1MID0gcGFyYW1zLmh0bWwgPyBwYXJhbXMudGl0bGUgOiBlc2NhcGVIdG1sKHBhcmFtcy50aXRsZSkuc3BsaXQoJ1xcbicpLmpvaW4oJzxicj4nKTtcblxuICAvKlxuICAgKiBUZXh0XG4gICAqL1xuICAkdGV4dC5pbm5lckhUTUwgPSBwYXJhbXMuaHRtbCA/IHBhcmFtcy50ZXh0IDogZXNjYXBlSHRtbChwYXJhbXMudGV4dCB8fCAnJykuc3BsaXQoJ1xcbicpLmpvaW4oJzxicj4nKTtcbiAgaWYgKHBhcmFtcy50ZXh0KSBzaG93KCR0ZXh0KTtcblxuICAvKlxuICAgKiBDdXN0b20gY2xhc3NcbiAgICovXG4gIGlmIChwYXJhbXMuY3VzdG9tQ2xhc3MpIHtcbiAgICBhZGRDbGFzcyhtb2RhbCwgcGFyYW1zLmN1c3RvbUNsYXNzKTtcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtY3VzdG9tLWNsYXNzJywgcGFyYW1zLmN1c3RvbUNsYXNzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBGaW5kIHByZXZpb3VzbHkgc2V0IGNsYXNzZXMgYW5kIHJlbW92ZSB0aGVtXG4gICAgbGV0IGN1c3RvbUNsYXNzID0gbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWN1c3RvbS1jbGFzcycpO1xuICAgIHJlbW92ZUNsYXNzKG1vZGFsLCBjdXN0b21DbGFzcyk7XG4gICAgbW9kYWwuc2V0QXR0cmlidXRlKCdkYXRhLWN1c3RvbS1jbGFzcycsICcnKTtcbiAgfVxuXG4gIC8qXG4gICAqIEljb25cbiAgICovXG4gIGhpZGUobW9kYWwucXVlcnlTZWxlY3RvckFsbCgnLnNhLWljb24nKSk7XG5cbiAgaWYgKHBhcmFtcy50eXBlICYmICFpc0lFOCgpKSB7XG5cbiAgICBsZXQgdmFsaWRUeXBlID0gZmFsc2U7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsZXJ0VHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gYWxlcnRUeXBlc1tpXSkge1xuICAgICAgICB2YWxpZFR5cGUgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXZhbGlkVHlwZSkge1xuICAgICAgbG9nU3RyKCdVbmtub3duIGFsZXJ0IHR5cGU6ICcgKyBwYXJhbXMudHlwZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHR5cGVzV2l0aEljb25zID0gWydzdWNjZXNzJywgJ2Vycm9yJywgJ3dhcm5pbmcnLCAnaW5mbyddO1xuICAgIGxldCAkaWNvbjtcblxuICAgIGlmICh0eXBlc1dpdGhJY29ucy5pbmRleE9mKHBhcmFtcy50eXBlKSAhPT0gLTEpIHtcbiAgICAgICRpY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWljb24uJyArICdzYS0nICsgcGFyYW1zLnR5cGUpO1xuICAgICAgc2hvdygkaWNvbik7XG4gICAgfVxuXG4gICAgbGV0ICRpbnB1dHMgPSBnZXRJbnB1dHMoKTtcblxuICAgIC8vIEFuaW1hdGUgaWNvblxuICAgIHN3aXRjaCAocGFyYW1zLnR5cGUpIHtcblxuICAgICAgY2FzZSAnc3VjY2Vzcyc6XG4gICAgICAgIGFkZENsYXNzKCRpY29uLCAnYW5pbWF0ZScpO1xuICAgICAgICBhZGRDbGFzcygkaWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EtdGlwJyksICdhbmltYXRlU3VjY2Vzc1RpcCcpO1xuICAgICAgICBhZGRDbGFzcygkaWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EtbG9uZycpLCAnYW5pbWF0ZVN1Y2Nlc3NMb25nJyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIGFkZENsYXNzKCRpY29uLCAnYW5pbWF0ZUVycm9ySWNvbicpO1xuICAgICAgICBhZGRDbGFzcygkaWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EteC1tYXJrJyksICdhbmltYXRlWE1hcmsnKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgICBhZGRDbGFzcygkaWNvbiwgJ3B1bHNlV2FybmluZycpO1xuICAgICAgICBhZGRDbGFzcygkaWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EtYm9keScpLCAncHVsc2VXYXJuaW5nSW5zJyk7XG4gICAgICAgIGFkZENsYXNzKCRpY29uLnF1ZXJ5U2VsZWN0b3IoJy5zYS1kb3QnKSwgJ3B1bHNlV2FybmluZ0lucycpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnaW5wdXQnOlxuICAgICAgY2FzZSAncHJvbXB0JzpcblxuICAgICAgICB2YXIgaW5wdXRIVE1MID0gJyc7XG5cbiAgICAgICAgcGFyYW1zLmlucHV0cy5mb3JFYWNoKCBmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG5cbiAgICAgICAgICB2YXIgdGFiSW5kZXggPSAzICsgaW5kZXg7XG5cbiAgICAgICAgICBpZiAoIHBhcmFtcy5pbnB1dHNbaW5kZXhdLmlucHV0VHlwZSA9PT0gJ3RleHQnIClcblxuICAgICAgICAgICAgaW5wdXRIVE1MICs9XG5cbiAgICAgICAgICAgICAgYDxmaWVsZHNldD5cbiAgICAgICAgICAgICAgICA8bGFiZWw+YCArIHBhcmFtcy5pbnB1dHNbaW5kZXhdLmlucHV0TGFiZWwgKyBgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8YnI+PHNwYW4+YCArIHBhcmFtcy5pbnB1dHNbaW5kZXhdLmlucHV0RGVzY3JpcHRpb24gKyBgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiYCArIHBhcmFtcy5pbnB1dHNbaW5kZXhdLmlucHV0VHlwZSArIGBcIiB0YWJJbmRleD1cImAgKyB0YWJJbmRleCArIGBcIiB2YWx1ZT1cImAgKyBwYXJhbXMuaW5wdXRzW2luZGV4XS5pbnB1dFZhbHVlICsgYFwiIHBsYWNlaG9sZGVyPVwiYCArIHBhcmFtcy5pbnB1dHNbaW5kZXhdLmlucHV0UGxhY2Vob2xkZXIgKyBgXCIgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2EtaW5wdXQtZXJyb3JcIj48L2Rpdj5cbiAgICAgICAgICAgICAgPC9maWVsZHNldD5gO1xuXG4gICAgICAgICAgZWxzZSBpZiAoIHBhcmFtcy5pbnB1dHNbaW5kZXhdLmlucHV0VHlwZSA9PT0gJ3JhZGlvJyApXG5cbiAgICAgICAgICAgIGlucHV0SFRNTCArPVxuXG4gICAgICAgICAgICAgIGA8ZmllbGRzZXQ+XG4gICAgICAgICAgICAgICAgPGxhYmVsPmAgKyBwYXJhbXMuaW5wdXRzW2luZGV4XS5pbnB1dExhYmVsICsgYDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGJyPjxzcGFuPmAgKyBwYXJhbXMuaW5wdXRzW2luZGV4XS5pbnB1dERlc2NyaXB0aW9uICsgYDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImAgKyBwYXJhbXMuaW5wdXRzW2luZGV4XS5pbnB1dFR5cGUgKyBgXCIgbmFtZT1cImAgKyBpbmRleCArIGBcIiB0YWJJbmRleD1cImAgKyB0YWJJbmRleCArIGBcIiB2YWx1ZT1cInRydWVcIiBjaGVja2VkPVwiY2hlY2tlZFwiIC8+IGAgKyBwYXJhbXMuaW5wdXRzW2luZGV4XS5pbnB1dFBsYWNlaG9sZGVyWzBdICsgYFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiYCArIHBhcmFtcy5pbnB1dHNbaW5kZXhdLmlucHV0VHlwZSArIGBcIiBuYW1lPVwiYCArIGluZGV4ICsgYFwiIHZhbHVlPVwiZmFsc2VcIj4gYCArIHBhcmFtcy5pbnB1dHNbaW5kZXhdLmlucHV0UGxhY2Vob2xkZXJbMV0gKyBgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNhLWlucHV0LWVycm9yXCI+PC9kaXY+XG4gICAgICAgICAgICAgIDwvZmllbGRzZXQ+YDtcblxuICAgICAgICB9KTtcblxuICAgICAgICBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtaW5wdXRzJykuaW5uZXJIVE1MID0gaW5wdXRIVE1MO1xuXG4gICAgICAgIGFkZENsYXNzKG1vZGFsLCAnc2hvdy1pbnB1dCcpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkaW5wdXRzWzBdLmZvY3VzKCk7XG4gICAgICAgICAgJGlucHV0c1swXS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHN3YWwucmVzZXRJbnB1dEVycm9yKTtcbiAgICAgICAgfSwgNDAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICogQ3VzdG9tIGltYWdlXG4gICAqL1xuICBpZiAocGFyYW1zLmltYWdlVXJsKSB7XG4gICAgbGV0ICRjdXN0b21JY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWljb24uc2EtY3VzdG9tJyk7XG5cbiAgICAkY3VzdG9tSWNvbi5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKCcgKyBwYXJhbXMuaW1hZ2VVcmwgKyAnKSc7XG4gICAgc2hvdygkY3VzdG9tSWNvbik7XG5cbiAgICBsZXQgX2ltZ1dpZHRoID0gODA7XG4gICAgbGV0IF9pbWdIZWlnaHQgPSA4MDtcblxuICAgIGlmIChwYXJhbXMuaW1hZ2VTaXplKSB7XG4gICAgICBsZXQgZGltZW5zaW9ucyA9IHBhcmFtcy5pbWFnZVNpemUudG9TdHJpbmcoKS5zcGxpdCgneCcpO1xuICAgICAgbGV0IGltZ1dpZHRoID0gZGltZW5zaW9uc1swXTtcbiAgICAgIGxldCBpbWdIZWlnaHQgPSBkaW1lbnNpb25zWzFdO1xuXG4gICAgICBpZiAoIWltZ1dpZHRoIHx8ICFpbWdIZWlnaHQpIHtcbiAgICAgICAgbG9nU3RyKCdQYXJhbWV0ZXIgaW1hZ2VTaXplIGV4cGVjdHMgdmFsdWUgd2l0aCBmb3JtYXQgV0lEVEh4SEVJR0hULCBnb3QgJyArIHBhcmFtcy5pbWFnZVNpemUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2ltZ1dpZHRoID0gaW1nV2lkdGg7XG4gICAgICAgIF9pbWdIZWlnaHQgPSBpbWdIZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJGN1c3RvbUljb24uc2V0QXR0cmlidXRlKCdzdHlsZScsICRjdXN0b21JY29uLmdldEF0dHJpYnV0ZSgnc3R5bGUnKSArICd3aWR0aDonICsgX2ltZ1dpZHRoICsgJ3B4OyBoZWlnaHQ6JyArIF9pbWdIZWlnaHQgKyAncHgnKTtcbiAgfVxuXG4gIC8qXG4gICAqIFNob3cgY2FuY2VsIGJ1dHRvbj9cbiAgICovXG4gIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS1oYXMtY2FuY2VsLWJ1dHRvbicsIHBhcmFtcy5zaG93Q2FuY2VsQnV0dG9uKTtcbiAgaWYgKHBhcmFtcy5zaG93Q2FuY2VsQnV0dG9uKSB7XG4gICAgJGNhbmNlbEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gIH0gZWxzZSB7XG4gICAgaGlkZSgkY2FuY2VsQnRuKTtcbiAgfVxuXG4gIC8qXG4gICAqIFNob3cgY29uZmlybSBidXR0b24/XG4gICAqL1xuICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtaGFzLWNvbmZpcm0tYnV0dG9uJywgcGFyYW1zLnNob3dDb25maXJtQnV0dG9uKTtcbiAgaWYgKHBhcmFtcy5zaG93Q29uZmlybUJ1dHRvbikge1xuICAgICRjb25maXJtQnRuLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgfSBlbHNlIHtcbiAgICBoaWRlKCRjb25maXJtQnRuKTtcbiAgfVxuXG4gIC8qXG4gICAqIEN1c3RvbSB0ZXh0IG9uIGNhbmNlbC9jb25maXJtIGJ1dHRvbnNcbiAgICovXG4gIGlmIChwYXJhbXMuY2FuY2VsQnV0dG9uVGV4dCkge1xuICAgICRjYW5jZWxCdG4uaW5uZXJIVE1MID0gZXNjYXBlSHRtbChwYXJhbXMuY2FuY2VsQnV0dG9uVGV4dCk7XG4gIH1cbiAgaWYgKHBhcmFtcy5jb25maXJtQnV0dG9uVGV4dCkge1xuICAgICRjb25maXJtQnRuLmlubmVySFRNTCA9IGVzY2FwZUh0bWwocGFyYW1zLmNvbmZpcm1CdXR0b25UZXh0KTtcbiAgfVxuXG4gIC8qXG4gICAqIEN1c3RvbSBjb2xvciBvbiBjb25maXJtIGJ1dHRvblxuICAgKi9cbiAgaWYgKHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3IpIHtcbiAgICAvLyBTZXQgY29uZmlybSBidXR0b24gdG8gc2VsZWN0ZWQgYmFja2dyb3VuZCBjb2xvclxuICAgICRjb25maXJtQnRuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3I7XG5cbiAgICAvLyBTZXQgdGhlIGNvbmZpcm0gYnV0dG9uIGNvbG9yIHRvIHRoZSBsb2FkaW5nIHJpbmdcbiAgICAkY29uZmlybUJ0bi5zdHlsZS5ib3JkZXJMZWZ0Q29sb3IgPSBwYXJhbXMuY29uZmlybUxvYWRpbmdCdXR0b25Db2xvcjtcbiAgICAkY29uZmlybUJ0bi5zdHlsZS5ib3JkZXJSaWdodENvbG9yID0gcGFyYW1zLmNvbmZpcm1Mb2FkaW5nQnV0dG9uQ29sb3I7XG5cbiAgICAvLyBTZXQgYm94LXNoYWRvdyB0byBkZWZhdWx0IGZvY3VzZWQgYnV0dG9uXG4gICAgc2V0Rm9jdXNTdHlsZSgkY29uZmlybUJ0biwgcGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcik7XG4gIH1cblxuICAvKlxuICAgKiBBbGxvdyBvdXRzaWRlIGNsaWNrXG4gICAqL1xuICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYWxsb3ctb3V0c2lkZS1jbGljaycsIHBhcmFtcy5hbGxvd091dHNpZGVDbGljayk7XG5cbiAgLypcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb25cbiAgICovXG4gIHZhciBoYXNEb25lRnVuY3Rpb24gPSBwYXJhbXMuZG9uZUZ1bmN0aW9uID8gdHJ1ZSA6IGZhbHNlO1xuICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtaGFzLWRvbmUtZnVuY3Rpb24nLCBoYXNEb25lRnVuY3Rpb24pO1xuXG4gIC8qXG4gICAqIEFuaW1hdGlvblxuICAgKi9cbiAgaWYgKCFwYXJhbXMuYW5pbWF0aW9uKSB7XG4gICAgbW9kYWwuc2V0QXR0cmlidXRlKCdkYXRhLWFuaW1hdGlvbicsICdub25lJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHBhcmFtcy5hbmltYXRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgbW9kYWwuc2V0QXR0cmlidXRlKCdkYXRhLWFuaW1hdGlvbicsIHBhcmFtcy5hbmltYXRpb24pOyAvLyBDdXN0b20gYW5pbWF0aW9uXG4gIH0gZWxzZSB7XG4gICAgbW9kYWwuc2V0QXR0cmlidXRlKCdkYXRhLWFuaW1hdGlvbicsICdwb3AnKTtcbiAgfVxuXG4gIC8qXG4gICAqIFRpbWVyXG4gICAqL1xuICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGltZXInLCBwYXJhbXMudGltZXIpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgc2V0UGFyYW1ldGVycztcbiIsIi8qXG4gKiBBbGxvdyB1c2VyIHRvIHBhc3MgdGhlaXIgb3duIHBhcmFtc1xuICovXG52YXIgZXh0ZW5kID0gZnVuY3Rpb24oYSwgYikge1xuICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgIGlmIChiLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGFba2V5XSA9IGJba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGE7XG59O1xuXG4vKlxuICogQ29udmVydCBIRVggY29kZXMgdG8gUkdCIHZhbHVlcyAoIzAwMDAwMCAtPiByZ2IoMCwwLDApKVxuICovXG52YXIgaGV4VG9SZ2IgPSBmdW5jdGlvbihoZXgpIHtcbiAgdmFyIHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xuICByZXR1cm4gcmVzdWx0ID8gcGFyc2VJbnQocmVzdWx0WzFdLCAxNikgKyAnLCAnICsgcGFyc2VJbnQocmVzdWx0WzJdLCAxNikgKyAnLCAnICsgcGFyc2VJbnQocmVzdWx0WzNdLCAxNikgOiBudWxsO1xufTtcblxuLypcbiAqIENoZWNrIGlmIHRoZSB1c2VyIGlzIHVzaW5nIEludGVybmV0IEV4cGxvcmVyIDggKGZvciBmYWxsYmFja3MpXG4gKi9cbnZhciBpc0lFOCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gKHdpbmRvdy5hdHRhY2hFdmVudCAmJiAhd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpO1xufTtcblxuLypcbiAqIElFIGNvbXBhdGlibGUgbG9nZ2luZyBmb3IgZGV2ZWxvcGVyc1xuICovXG52YXIgbG9nU3RyID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIGlmICh3aW5kb3cuY29uc29sZSkge1xuICAgIC8vIElFLi4uXG4gICAgd2luZG93LmNvbnNvbGUubG9nKCdTd2VldEFsZXJ0OiAnICsgc3RyaW5nKTtcbiAgfVxufTtcblxuLypcbiAqIFNldCBob3ZlciwgYWN0aXZlIGFuZCBmb2N1cy1zdGF0ZXMgZm9yIGJ1dHRvbnMgXG4gKiAoc291cmNlOiBodHRwOi8vd3d3LnNpdGVwb2ludC5jb20vamF2YXNjcmlwdC1nZW5lcmF0ZS1saWdodGVyLWRhcmtlci1jb2xvcilcbiAqL1xudmFyIGNvbG9yTHVtaW5hbmNlID0gZnVuY3Rpb24oaGV4LCBsdW0pIHtcbiAgLy8gVmFsaWRhdGUgaGV4IHN0cmluZ1xuICBoZXggPSBTdHJpbmcoaGV4KS5yZXBsYWNlKC9bXjAtOWEtZl0vZ2ksICcnKTtcbiAgaWYgKGhleC5sZW5ndGggPCA2KSB7XG4gICAgaGV4ID0gaGV4WzBdICsgaGV4WzBdICsgaGV4WzFdICsgaGV4WzFdICsgaGV4WzJdICsgaGV4WzJdO1xuICB9XG4gIGx1bSA9IGx1bSB8fCAwO1xuXG4gIC8vIENvbnZlcnQgdG8gZGVjaW1hbCBhbmQgY2hhbmdlIGx1bWlub3NpdHlcbiAgdmFyIHJnYiA9ICcjJztcbiAgdmFyIGM7XG4gIHZhciBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICBjID0gcGFyc2VJbnQoaGV4LnN1YnN0cihpICogMiwgMiksIDE2KTtcbiAgICBjID0gTWF0aC5yb3VuZChNYXRoLm1pbihNYXRoLm1heCgwLCBjICsgYyAqIGx1bSksIDI1NSkpLnRvU3RyaW5nKDE2KTtcbiAgICByZ2IgKz0gKCcwMCcgKyBjKS5zdWJzdHIoYy5sZW5ndGgpO1xuICB9XG5cbiAgcmV0dXJuIHJnYjtcbn07XG5cblxuZXhwb3J0IHtcbiAgZXh0ZW5kLFxuICBoZXhUb1JnYixcbiAgaXNJRTgsXG4gIGxvZ1N0cixcbiAgY29sb3JMdW1pbmFuY2Vcbn07XG4iXX0=

  
  /*
   * Use SweetAlert with RequireJS
   */
  
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return sweetAlert;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = sweetAlert;
  }

})(window, document);