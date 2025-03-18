/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/main/actionview/app/javascript
Released under the MIT license
 */
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, 
  global.Rails = factory());
})(this, (function() {
  "use strict";
  const linkClickSelector = "a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]";
  const buttonClickSelector = {
    selector: "button[data-remote]:not([form]), button[data-confirm]:not([form])",
    exclude: "form button"
  };
  const inputChangeSelector = "select[data-remote], input[data-remote], textarea[data-remote]";
  const formSubmitSelector = "form:not([data-turbo=true])";
  const formInputClickSelector = "form:not([data-turbo=true]) input[type=submit], form:not([data-turbo=true]) input[type=image], form:not([data-turbo=true]) button[type=submit], form:not([data-turbo=true]) button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])";
  const formDisableSelector = "input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled";
  const formEnableSelector = "input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled";
  const fileInputSelector = "input[name][type=file]:not([disabled])";
  const linkDisableSelector = "a[data-disable-with], a[data-disable]";
  const buttonDisableSelector = "button[data-remote][data-disable-with], button[data-remote][data-disable]";
  let nonce = null;
  const loadCSPNonce = () => {
    const metaTag = document.querySelector("meta[name=csp-nonce]");
    return nonce = metaTag && metaTag.content;
  };
  const cspNonce = () => nonce || loadCSPNonce();
  const m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;
  const matches = function(element, selector) {
    if (selector.exclude) {
      return m.call(element, selector.selector) && !m.call(element, selector.exclude);
    } else {
      return m.call(element, selector);
    }
  };
  const EXPANDO = "_ujsData";
  const getData = (element, key) => element[EXPANDO] ? element[EXPANDO][key] : undefined;
  const setData = function(element, key, value) {
    if (!element[EXPANDO]) {
      element[EXPANDO] = {};
    }
    return element[EXPANDO][key] = value;
  };
  const $ = selector => Array.prototype.slice.call(document.querySelectorAll(selector));
  const isContentEditable = function(element) {
    var isEditable = false;
    do {
      if (element.isContentEditable) {
        isEditable = true;
        break;
      }
      element = element.parentElement;
    } while (element);
    return isEditable;
  };
  const csrfToken = () => {
    const meta = document.querySelector("meta[name=csrf-token]");
    return meta && meta.content;
  };
  const csrfParam = () => {
    const meta = document.querySelector("meta[name=csrf-param]");
    return meta && meta.content;
  };
  const CSRFProtection = xhr => {
    const token = csrfToken();
    if (token) {
      return xhr.setRequestHeader("X-CSRF-Token", token);
    }
  };
  const refreshCSRFTokens = () => {
    const token = csrfToken();
    const param = csrfParam();
    if (token && param) {
      return $('form input[name="' + param + '"]').forEach((input => input.value = token));
    }
  };
  const AcceptHeaders = {
    "*": "*/*",
    text: "text/plain",
    html: "text/html",
    xml: "application/xml, text/xml",
    json: "application/json, text/javascript",
    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
  };
  const ajax = options => {
    options = prepareOptions(options);
    var xhr = createXHR(options, (function() {
      const response = processResponse(xhr.response != null ? xhr.response : xhr.responseText, xhr.getResponseHeader("Content-Type"));
      if (Math.floor(xhr.status / 100) === 2) {
        if (typeof options.success === "function") {
          options.success(response, xhr.statusText, xhr);
        }
      } else {
        if (typeof options.error === "function") {
          options.error(response, xhr.statusText, xhr);
        }
      }
      return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : undefined;
    }));
    if (options.beforeSend && !options.beforeSend(xhr, options)) {
      return false;
    }
    if (xhr.readyState === XMLHttpRequest.OPENED) {
      return xhr.send(options.data);
    }
  };
  var prepareOptions = function(options) {
    options.url = options.url || location.href;
    options.type = options.type.toUpperCase();
    if (options.type === "GET" && options.data) {
      if (options.url.indexOf("?") < 0) {
        options.url += "?" + options.data;
      } else {
        options.url += "&" + options.data;
      }
    }
    if (!(options.dataType in AcceptHeaders)) {
      options.dataType = "*";
    }
    options.accept = AcceptHeaders[options.dataType];
    if (options.dataType !== "*") {
      options.accept += ", */*; q=0.01";
    }
    return options;
  };
  var createXHR = function(options, done) {
    const xhr = new XMLHttpRequest;
    xhr.open(options.type, options.url, true);
    xhr.setRequestHeader("Accept", options.accept);
    if (typeof options.data === "string") {
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    }
    if (!options.crossDomain) {
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      CSRFProtection(xhr);
    }
    xhr.withCredentials = !!options.withCredentials;
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        return done(xhr);
      }
    };
    return xhr;
  };
  var processResponse = function(response, type) {
    if (typeof response === "string" && typeof type === "string") {
      if (type.match(/\bjson\b/)) {
        try {
          response = JSON.parse(response);
        } catch (error) {}
      } else if (type.match(/\b(?:java|ecma)script\b/)) {
        const script = document.createElement("script");
        script.setAttribute("nonce", cspNonce());
        script.text = response;
        document.head.appendChild(script).parentNode.removeChild(script);
      } else if (type.match(/\b(xml|html|svg)\b/)) {
        const parser = new DOMParser;
        type = type.replace(/;.+/, "");
        try {
          response = parser.parseFromString(response, type);
        } catch (error1) {}
      }
    }
    return response;
  };
  const href = element => element.href;
  const isCrossDomain = function(url) {
    const originAnchor = document.createElement("a");
    originAnchor.href = location.href;
    const urlAnchor = document.createElement("a");
    try {
      urlAnchor.href = url;
      return !((!urlAnchor.protocol || urlAnchor.protocol === ":") && !urlAnchor.host || originAnchor.protocol + "//" + originAnchor.host === urlAnchor.protocol + "//" + urlAnchor.host);
    } catch (e) {
      return true;
    }
  };
  let preventDefault;
  let {CustomEvent: CustomEvent} = window;
  if (typeof CustomEvent !== "function") {
    CustomEvent = function(event, params) {
      const evt = document.createEvent("CustomEvent");
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };
    CustomEvent.prototype = window.Event.prototype;
    ({preventDefault: preventDefault} = CustomEvent.prototype);
    CustomEvent.prototype.preventDefault = function() {
      const result = preventDefault.call(this);
      if (this.cancelable && !this.defaultPrevented) {
        Object.defineProperty(this, "defaultPrevented", {
          get() {
            return true;
          }
        });
      }
      return result;
    };
  }
  const fire = (obj, name, data) => {
    const event = new CustomEvent(name, {
      bubbles: true,
      cancelable: true,
      detail: data
    });
    obj.dispatchEvent(event);
    return !event.defaultPrevented;
  };
  const stopEverything = e => {
    fire(e.target, "ujs:everythingStopped");
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };
  const delegate = (element, selector, eventType, handler) => element.addEventListener(eventType, (function(e) {
    let {target: target} = e;
    while (!!(target instanceof Element) && !matches(target, selector)) {
      target = target.parentNode;
    }
    if (target instanceof Element && handler.call(target, e) === false) {
      e.preventDefault();
      e.stopPropagation();
    }
  }));
  const toArray = e => Array.prototype.slice.call(e);
  const serializeElement = (element, additionalParam) => {
    let inputs = [ element ];
    if (matches(element, "form")) {
      inputs = toArray(element.elements);
    }
    const params = [];
    inputs.forEach((function(input) {
      if (!input.name || input.disabled) {
        return;
      }
      if (matches(input, "fieldset[disabled] *")) {
        return;
      }
      if (matches(input, "select")) {
        toArray(input.options).forEach((function(option) {
          if (option.selected) {
            params.push({
              name: input.name,
              value: option.value
            });
          }
        }));
      } else if (input.checked || [ "radio", "checkbox", "submit" ].indexOf(input.type) === -1) {
        params.push({
          name: input.name,
          value: input.value
        });
      }
    }));
    if (additionalParam) {
      params.push(additionalParam);
    }
    return params.map((function(param) {
      if (param.name) {
        return `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`;
      } else {
        return param;
      }
    })).join("&");
  };
  const formElements = (form, selector) => {
    if (matches(form, "form")) {
      return toArray(form.elements).filter((el => matches(el, selector)));
    } else {
      return toArray(form.querySelectorAll(selector));
    }
  };
  const handleConfirmWithRails = rails => function(e) {
    if (!allowAction(this, rails)) {
      stopEverything(e);
    }
  };
  const confirm = (message, element) => window.confirm(message);
  var allowAction = function(element, rails) {
    let callback;
    const message = element.getAttribute("data-confirm");
    if (!message) {
      return true;
    }
    let answer = false;
    if (fire(element, "confirm")) {
      try {
        answer = rails.confirm(message, element);
      } catch (error) {}
      callback = fire(element, "confirm:complete", [ answer ]);
    }
    return answer && callback;
  };
  const handleDisabledElement = function(e) {
    const element = this;
    if (element.disabled) {
      stopEverything(e);
    }
  };
  const enableElement = e => {
    let element;
    if (e instanceof Event) {
      if (isXhrRedirect(e)) {
        return;
      }
      element = e.target;
    } else {
      element = e;
    }
    if (isContentEditable(element)) {
      return;
    }
    if (matches(element, linkDisableSelector)) {
      return enableLinkElement(element);
    } else if (matches(element, buttonDisableSelector) || matches(element, formEnableSelector)) {
      return enableFormElement(element);
    } else if (matches(element, formSubmitSelector)) {
      return enableFormElements(element);
    }
  };
  const disableElement = e => {
    const element = e instanceof Event ? e.target : e;
    if (isContentEditable(element)) {
      return;
    }
    if (matches(element, linkDisableSelector)) {
      return disableLinkElement(element);
    } else if (matches(element, buttonDisableSelector) || matches(element, formDisableSelector)) {
      return disableFormElement(element);
    } else if (matches(element, formSubmitSelector)) {
      return disableFormElements(element);
    }
  };
  var disableLinkElement = function(element) {
    if (getData(element, "ujs:disabled")) {
      return;
    }
    const replacement = element.getAttribute("data-disable-with");
    if (replacement != null) {
      setData(element, "ujs:enable-with", element.innerHTML);
      element.innerHTML = replacement;
    }
    element.addEventListener("click", stopEverything);
    return setData(element, "ujs:disabled", true);
  };
  var enableLinkElement = function(element) {
    const originalText = getData(element, "ujs:enable-with");
    if (originalText != null) {
      element.innerHTML = originalText;
      setData(element, "ujs:enable-with", null);
    }
    element.removeEventListener("click", stopEverything);
    return setData(element, "ujs:disabled", null);
  };
  var disableFormElements = form => formElements(form, formDisableSelector).forEach(disableFormElement);
  var disableFormElement = function(element) {
    if (getData(element, "ujs:disabled")) {
      return;
    }
    const replacement = element.getAttribute("data-disable-with");
    if (replacement != null) {
      if (matches(element, "button")) {
        setData(element, "ujs:enable-with", element.innerHTML);
        element.innerHTML = replacement;
      } else {
        setData(element, "ujs:enable-with", element.value);
        element.value = replacement;
      }
    }
    element.disabled = true;
    return setData(element, "ujs:disabled", true);
  };
  var enableFormElements = form => formElements(form, formEnableSelector).forEach((element => enableFormElement(element)));
  var enableFormElement = function(element) {
    const originalText = getData(element, "ujs:enable-with");
    if (originalText != null) {
      if (matches(element, "button")) {
        element.innerHTML = originalText;
      } else {
        element.value = originalText;
      }
      setData(element, "ujs:enable-with", null);
    }
    element.disabled = false;
    return setData(element, "ujs:disabled", null);
  };
  var isXhrRedirect = function(event) {
    const xhr = event.detail ? event.detail[0] : undefined;
    return xhr && xhr.getResponseHeader("X-Xhr-Redirect");
  };
  const handleMethodWithRails = rails => function(e) {
    const link = this;
    const method = link.getAttribute("data-method");
    if (!method) {
      return;
    }
    if (isContentEditable(this)) {
      return;
    }
    const href = rails.href(link);
    const csrfToken$1 = csrfToken();
    const csrfParam$1 = csrfParam();
    const form = document.createElement("form");
    let formContent = `<input name='_method' value='${method}' type='hidden' />`;
    if (csrfParam$1 && csrfToken$1 && !isCrossDomain(href)) {
      formContent += `<input name='${csrfParam$1}' value='${csrfToken$1}' type='hidden' />`;
    }
    formContent += '<input type="submit" />';
    form.method = "post";
    form.action = href;
    form.target = link.target;
    form.innerHTML = formContent;
    form.style.display = "none";
    document.body.appendChild(form);
    form.querySelector('[type="submit"]').click();
    stopEverything(e);
  };
  const isRemote = function(element) {
    const value = element.getAttribute("data-remote");
    return value != null && value !== "false";
  };
  const handleRemoteWithRails = rails => function(e) {
    let data, method, url;
    const element = this;
    if (!isRemote(element)) {
      return true;
    }
    if (!fire(element, "ajax:before")) {
      fire(element, "ajax:stopped");
      return false;
    }
    if (isContentEditable(element)) {
      fire(element, "ajax:stopped");
      return false;
    }
    const withCredentials = element.getAttribute("data-with-credentials");
    const dataType = element.getAttribute("data-type") || "script";
    if (matches(element, formSubmitSelector)) {
      const button = getData(element, "ujs:submit-button");
      method = getData(element, "ujs:submit-button-formmethod") || element.getAttribute("method") || "get";
      url = getData(element, "ujs:submit-button-formaction") || element.getAttribute("action") || location.href;
      if (method.toUpperCase() === "GET") {
        url = url.replace(/\?.*$/, "");
      }
      if (element.enctype === "multipart/form-data") {
        data = new FormData(element);
        if (button != null) {
          data.append(button.name, button.value);
        }
      } else {
        data = serializeElement(element, button);
      }
      setData(element, "ujs:submit-button", null);
      setData(element, "ujs:submit-button-formmethod", null);
      setData(element, "ujs:submit-button-formaction", null);
    } else if (matches(element, buttonClickSelector) || matches(element, inputChangeSelector)) {
      method = element.getAttribute("data-method");
      url = element.getAttribute("data-url");
      data = serializeElement(element, element.getAttribute("data-params"));
    } else {
      method = element.getAttribute("data-method");
      url = rails.href(element);
      data = element.getAttribute("data-params");
    }
    ajax({
      type: method || "GET",
      url: url,
      data: data,
      dataType: dataType,
      beforeSend(xhr, options) {
        if (fire(element, "ajax:beforeSend", [ xhr, options ])) {
          return fire(element, "ajax:send", [ xhr ]);
        } else {
          fire(element, "ajax:stopped");
          return false;
        }
      },
      success(...args) {
        return fire(element, "ajax:success", args);
      },
      error(...args) {
        return fire(element, "ajax:error", args);
      },
      complete(...args) {
        return fire(element, "ajax:complete", args);
      },
      crossDomain: isCrossDomain(url),
      withCredentials: withCredentials != null && withCredentials !== "false"
    });
    stopEverything(e);
  };
  const formSubmitButtonClick = function(e) {
    const button = this;
    const {form: form} = button;
    if (!form) {
      return;
    }
    if (button.name) {
      setData(form, "ujs:submit-button", {
        name: button.name,
        value: button.value
      });
    }
    setData(form, "ujs:formnovalidate-button", button.formNoValidate);
    setData(form, "ujs:submit-button-formaction", button.getAttribute("formaction"));
    return setData(form, "ujs:submit-button-formmethod", button.getAttribute("formmethod"));
  };
  const preventInsignificantClick = function(e) {
    const link = this;
    const method = (link.getAttribute("data-method") || "GET").toUpperCase();
    const data = link.getAttribute("data-params");
    const metaClick = e.metaKey || e.ctrlKey;
    const insignificantMetaClick = metaClick && method === "GET" && !data;
    const nonPrimaryMouseClick = e.button != null && e.button !== 0;
    if (nonPrimaryMouseClick || insignificantMetaClick) {
      e.stopImmediatePropagation();
    }
  };
  const Rails = {
    $: $,
    ajax: ajax,
    buttonClickSelector: buttonClickSelector,
    buttonDisableSelector: buttonDisableSelector,
    confirm: confirm,
    cspNonce: cspNonce,
    csrfToken: csrfToken,
    csrfParam: csrfParam,
    CSRFProtection: CSRFProtection,
    delegate: delegate,
    disableElement: disableElement,
    enableElement: enableElement,
    fileInputSelector: fileInputSelector,
    fire: fire,
    formElements: formElements,
    formEnableSelector: formEnableSelector,
    formDisableSelector: formDisableSelector,
    formInputClickSelector: formInputClickSelector,
    formSubmitButtonClick: formSubmitButtonClick,
    formSubmitSelector: formSubmitSelector,
    getData: getData,
    handleDisabledElement: handleDisabledElement,
    href: href,
    inputChangeSelector: inputChangeSelector,
    isCrossDomain: isCrossDomain,
    linkClickSelector: linkClickSelector,
    linkDisableSelector: linkDisableSelector,
    loadCSPNonce: loadCSPNonce,
    matches: matches,
    preventInsignificantClick: preventInsignificantClick,
    refreshCSRFTokens: refreshCSRFTokens,
    serializeElement: serializeElement,
    setData: setData,
    stopEverything: stopEverything
  };
  const handleConfirm = handleConfirmWithRails(Rails);
  Rails.handleConfirm = handleConfirm;
  const handleMethod = handleMethodWithRails(Rails);
  Rails.handleMethod = handleMethod;
  const handleRemote = handleRemoteWithRails(Rails);
  Rails.handleRemote = handleRemote;
  const start = function() {
    if (window._rails_loaded) {
      throw new Error("rails-ujs has already been loaded!");
    }
    window.addEventListener("pageshow", (function() {
      $(formEnableSelector).forEach((function(el) {
        if (getData(el, "ujs:disabled")) {
          enableElement(el);
        }
      }));
      $(linkDisableSelector).forEach((function(el) {
        if (getData(el, "ujs:disabled")) {
          enableElement(el);
        }
      }));
    }));
    delegate(document, linkDisableSelector, "ajax:complete", enableElement);
    delegate(document, linkDisableSelector, "ajax:stopped", enableElement);
    delegate(document, buttonDisableSelector, "ajax:complete", enableElement);
    delegate(document, buttonDisableSelector, "ajax:stopped", enableElement);
    delegate(document, linkClickSelector, "click", preventInsignificantClick);
    delegate(document, linkClickSelector, "click", handleDisabledElement);
    delegate(document, linkClickSelector, "click", handleConfirm);
    delegate(document, linkClickSelector, "click", disableElement);
    delegate(document, linkClickSelector, "click", handleRemote);
    delegate(document, linkClickSelector, "click", handleMethod);
    delegate(document, buttonClickSelector, "click", preventInsignificantClick);
    delegate(document, buttonClickSelector, "click", handleDisabledElement);
    delegate(document, buttonClickSelector, "click", handleConfirm);
    delegate(document, buttonClickSelector, "click", disableElement);
    delegate(document, buttonClickSelector, "click", handleRemote);
    delegate(document, inputChangeSelector, "change", handleDisabledElement);
    delegate(document, inputChangeSelector, "change", handleConfirm);
    delegate(document, inputChangeSelector, "change", handleRemote);
    delegate(document, formSubmitSelector, "submit", handleDisabledElement);
    delegate(document, formSubmitSelector, "submit", handleConfirm);
    delegate(document, formSubmitSelector, "submit", handleRemote);
    delegate(document, formSubmitSelector, "submit", (e => setTimeout((() => disableElement(e)), 13)));
    delegate(document, formSubmitSelector, "ajax:send", disableElement);
    delegate(document, formSubmitSelector, "ajax:complete", enableElement);
    delegate(document, formInputClickSelector, "click", preventInsignificantClick);
    delegate(document, formInputClickSelector, "click", handleDisabledElement);
    delegate(document, formInputClickSelector, "click", handleConfirm);
    delegate(document, formInputClickSelector, "click", formSubmitButtonClick);
    document.addEventListener("DOMContentLoaded", refreshCSRFTokens);
    document.addEventListener("DOMContentLoaded", loadCSPNonce);
    return window._rails_loaded = true;
  };
  Rails.start = start;
  if (typeof jQuery !== "undefined" && jQuery && jQuery.ajax) {
    if (jQuery.rails) {
      throw new Error("If you load both jquery_ujs and rails-ujs, use rails-ujs only.");
    }
    jQuery.rails = Rails;
    jQuery.ajaxPrefilter((function(options, originalOptions, xhr) {
      if (!options.crossDomain) {
        return CSRFProtection(xhr);
      }
    }));
  }
  if (typeof exports !== "object" && typeof module === "undefined") {
    window.Rails = Rails;
    if (fire(document, "rails:attachBindings")) {
      start();
    }
  }
  return Rails;
}));
// This is a manifest file that'll be compiled into including all the files listed below.
// Add new JavaScript/Coffee code in separate files in this directory and they'll automatically
// be included in the compiled file accessible from http://example.com/assets/application.js
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//

;
window.Solidus = {};

Solidus.mountedAt = () => {
  return '/';
};

Solidus.pathFor = (path) => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  const locationOrigin = protocol + '//' + hostname + (port ? ':' + port : '');
  return locationOrigin + Solidus.mountedAt() + path;
};

Solidus.routes = {
  states_search: Solidus.pathFor('api/states'),
  apply_coupon_code: (order_id) => Solidus.pathFor('api/orders/' + order_id + '/coupon_codes')
};



Solidus.disableSaveOnClick = () => {
  const form = document.querySelector('form.edit_order');
  form.addEventListener('submit', () => {
    const elements = form.querySelectorAll('[type="submit"], [type="image"]');
    elements.forEach(element => {
      element.setAttribute('disabled', true);
      element.classList.remove('primary');
      element.classList.add('disabled');
    });
  });
};

window.addEventListener('DOMContentLoaded', () => {
  const termsCheckbox = document.getElementById('accept_terms_and_conditions');

  if (termsCheckbox) {
    const form = termsCheckbox.closest('form');
    const submitButton = form.querySelector('[type="submit"]');
    form.onsubmit = function () {
      if (termsCheckbox.checked) {
        submitButton.innerHTML = 'Submitting...';
        return true;
      } else {
        alert('Please review and accept the Terms of Service');
        submitButton.removeAttribute('disabled');
        submitButton.classList.remove('disabled');
        return false;
      };
    };
  };
});
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('checkout_form_address')) {
    // Hidden by default to support browsers with javascript disabled
    document.querySelectorAll('.js-address-fields')
      .forEach(field => field.style.display = 'block');

    const statesCache = {};

    function updateState(stateContainer, countryId) {
      if (statesCache[countryId]) {
        fillStates(stateContainer, countryId);
        return;
      }

      fetch(`${Solidus.routes.states_search}?country_id=${countryId}`)
        .then(response => response.json())
        .then(data => {
          statesCache[countryId] = {
            states: data.states,
            states_required: data.states_required
          };
          fillStates(stateContainer, countryId);
        });
    };

    function fillStates(stateContainer, countryId) {
      const stateData = statesCache[countryId];

      if (!stateData) {
        return;
      }

      const statesRequired = stateData.states_required;
      const states = stateData.states;

      const stateSelect = stateContainer.querySelector('select');
      const stateInput = stateContainer.querySelector('input');

      if (states.length > 0) {
        const selected = parseInt(stateSelect.value);
        stateSelect.innerHTML = '';
        const statesWithBlank = [{ name: '', id: ''}].concat(states);
        statesWithBlank.forEach(state => {
          const selectOption = document.createElement('option');
          selectOption.value = state.id;
          selectOption.innerHTML = state.name;
          if (selected === state.id) {
            selectOption.setAttribute('selected', true);
          }
          stateSelect.appendChild(selectOption);
        })
        stateSelect.style.display = 'block';
        stateSelect.removeAttribute('disabled');
        stateInput.style.display = 'none';
        stateInput.setAttribute('disabled', true);
        stateContainer.style.display = 'block';
        if (statesRequired) {
          stateSelect.classList.add('required');
          stateContainer.classList.add('field-required');
        } else {
          stateSelect.classList.remove('required');
          stateContainer.classList.remove('field-required');
        }
        stateInput.classList.remove('required');
      } else {
        stateSelect.style.display = 'none';
        stateSelect.setAttribute('disabled', true);
        stateInput.style.display = 'block';
        if (statesRequired) {
          stateContainer.classList.add('field-required');
          stateInput.classList.add('required');
        } else {
          stateInput.value = '';
          stateContainer.classList.remove('field-required');
          stateInput.classList.remove('required');
        }
        stateContainer.style.display = !!statesRequired ? 'block' : 'none';
        if (!statesRequired) {
          stateInput.setAttribute('disabled', true);
        } else {
          stateInput.removeAttribute('disabled');
        }
        stateSelect.classList.remove('required');
      }
    };

    document.querySelectorAll('.js-trigger-state-change').forEach(element => {
      element.addEventListener('change', () => {
        const stateContainer = document.querySelector(element.dataset.stateContainer);
        if (stateContainer) {
          const countryId = element.value;
          updateState(stateContainer, countryId);
        }
      });
    });

    document.querySelectorAll('.js-trigger-state-change:not([hidden])').forEach(element => {
      element.dispatchEvent(new Event('change'));
    });

    const orderUseBilling = document.getElementById('order_use_billing');
    orderUseBilling.addEventListener('change', function() {
      update_shipping_form_state(orderUseBilling);
    });

    function update_shipping_form_state(order_use_billing) {
      const addressInputs = document.querySelectorAll('#shipping .address-inputs');
      const inputs = document.querySelectorAll('#shipping .address-inputs input');
      const selects = document.querySelectorAll('#shipping .address-inputs select');
      if (order_use_billing.checked) {
        addressInputs.forEach(addressInput => addressInput.style.display = 'none');
        inputs.forEach(input => input.setAttribute('disabled', true));
        selects.forEach(sel => sel.setAttribute('disabled', true));
      } else {
        addressInputs.forEach(addressInput => addressInput.style.display = 'block');
        inputs.forEach(input => input.removeAttribute('disabled'));
        selects.forEach(sel => sel.removeAttribute('disabled'));
        document.querySelector('#shipping .js-trigger-state-change').dispatchEvent(new Event('change'));
      }
    };

    update_shipping_form_state(orderUseBilling);
  }
});
const onLoadPage = () => {
  const radios = document.querySelectorAll("[data-js='variant-radio']");
  const thumbnailsLinks = document
    .querySelectorAll("[data-js='product-thumbnail'] a, [data-js='variant-thumbnail'] a");
  const productImage = document.querySelector("[data-js='product-main-image']");
  const variantsThumbnails = document.querySelectorAll("[data-js='variant-thumbnail']");

  if (radios.length > 0) {
    const selectedRadio = document.querySelector("[data-js='variant-radio'][checked='checked']");
    updateVariantPrice(selectedRadio);
    updateVariantImages(selectedRadio.value);
  }

  radios.forEach(radio => {
    radio.addEventListener('click', () => {
      updateVariantPrice(radio);
      updateVariantImages(radio.value);
    });
  });

  thumbnailsLinks.forEach(thumbnailLink => {
    thumbnailLink.addEventListener('click', (event) => {
      event.preventDefault();
      updateProductImage(thumbnailLink.href);
    });
  });

  function updateVariantPrice(variant) {
    const variantPrice = variant.dataset.jsPrice;
    if (variantPrice) {
      document.querySelector("[data-js='price']").innerHTML = variantPrice;
    }
  };

  function updateVariantImages(variantId) {
    selector = "[data-js='variant-thumbnail'][data-js-id='" + variantId + "']";
    variantsThumbnailsToDisplay = document.querySelectorAll(selector);

    variantsThumbnails.forEach(thumbnail => {
      thumbnail.style.display = 'none';
    });

    variantsThumbnailsToDisplay.forEach(thumbnail => {
      thumbnail.style.display = 'list-item';
    });

    if(variantsThumbnailsToDisplay.length) {
      variantFirstImage = variantsThumbnailsToDisplay[0].querySelector('a').href
      updateProductImage(variantFirstImage);
    }
  };

  function updateProductImage(imageSrc) {
    productImage.src = imageSrc;
  }
};

window.addEventListener('DOMContentLoaded', onLoadPage);
window.addEventListener('turbo:load', onLoadPage);
const pageLoadFunction = function () {
  const optionTypeSelector = document.querySelectorAll(".selection-items");
  for (var i = 0; i < optionTypeSelector.length; i++) {
    optionTypeSelector[i].addEventListener("click", onSelection);
  }
  selectFirstVariant();
};

document.addEventListener("turbo:load", pageLoadFunction)
document.addEventListener("DOMContentLoaded", pageLoadFunction);

function selectFirstVariant() {
  const firstVariant = document.querySelector("[data-option-index]");
  if (firstVariant) {
    setTimeout(() => { firstVariant.click(); }, 1);
  }
}

function onSelection(event) {
  if (event.target.name === undefined)
    return;

  document.getElementById(`selected-${event.target.name}`).innerText = event.target.dataset.presentation;

  const optionIndex = event.target.attributes["data-option-index"].value;
  const nextType = document.querySelector(`[data-option-index="${parseInt(optionIndex, 10) + 1}"]`);
  if (nextType) {
    updateOptions(nextType.name, optionIndex);
  }
  selectVariant();
}

function updateStockView(status) {
  if (status) {
    this.stockIndicatorTarget.classList.add("hidden");
    this.cartButtonTarget.disabled = false;
  } else {
    this.stockIndicatorTarget.classList.remove("hidden");
    this.cartButtonTarget.disabled = true;
  }
}

function updateOptions(nextTypeName, optionIndex) {
  const nextOptionValues = this.nextOptionValues(optionIndex);

  let firstRadio = null;
  const allNextOptions = [...document.querySelectorAll(`[name="${nextTypeName}"]`)];
  allNextOptions.forEach((radio) => {
    if (!nextOptionValues.includes(parseInt(radio.value, 10))) {
      radio.disabled = true;
      radio.parentElement.classList.add("hidden");
    } else {
      radio.disabled = false;
      radio.parentElement.classList.remove("hidden");
      if (!firstRadio) { firstRadio = radio; }
      if (radio.dataset && radio.dataset.presentation == "Pay what you can") {
        document.querySelector(`[name="customer_price"]`).parentElement.classList.remove("hidden");
        document.querySelector(`[name="quantity"]`).parentElement.classList.add("hidden");
        document.querySelector(`#product-price`).classList.add("hidden");
      }
    }
  });

  const nextSelectedRadio = document.querySelector(`[name="${nextTypeName}"]:checked`);
  if (nextSelectedRadio.disabled) {
    firstRadio.click();
  } else {
    nextSelectedRadio.click();
  }
}

function nextOptionValues(optionIndex) {
  const values = [];
  const variantOptionsTargets = document.querySelectorAll('.product-variants__list > li > input');
  variantOptionsTargets.forEach((option) => {
    const optionValueIds = JSON.parse(option.attributes["data-option-value-ids"].value);
    const selectedOptionIds = this.currentSelection();
    let matched = true;
    for (let i = 0; i <= optionIndex; i += 1) {
      if (optionValueIds[i] !== selectedOptionIds[i]) {
        matched = false;
        break;
      }
    }
    if (matched) {
      values.push(optionValueIds[parseInt(optionIndex, 10) + 1]);
    }
  });
  return values;
}

function updateView(variant) {
  document.querySelector('#product-price').innerHTML = variant.dataset.price;
  //document.querySelector('#cta_price').innerHTML = variant.dataset.price;
}

function selectVariant() {
  this.variant = document.querySelector(`[data-option-value-ids="${JSON.stringify(this.currentSelection())}"]`);
  if (this.variant) {
    this.variant.click();
    this.updateView(this.variant);
  } else {
    this.priceTarget.innerText = "Not found, please select all optionTypeSelector";
  }
}

function currentSelection() {
  let i = 0;
  const selectionArr = [];
  while (document.querySelector(`[data-option-index="${i}"]`)) {
    selectionArr.push(parseInt(document.querySelector(`[data-option-index="${i}"]:checked`).value, 10));
    i += 1;
  }
  return selectionArr;
};
// Placeholder manifest file.
// the installer will append this file to the app vendored assets here: vendor/assets/javascripts/spree/frontend/all.js'

// spree/frontend/all points to the
// `vendor/assets/javascripts/spree/frontend/all.js` file generated by
// `solidus:install`. See `setup_assets` at
// https://github.com/solidusio/solidus/blob/main/core/lib/generators/solidus/install/install_generator.rb





;
