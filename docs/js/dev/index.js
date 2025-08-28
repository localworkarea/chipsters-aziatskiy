(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const videoYoutubeButtons = document.querySelectorAll(".video-youtube__button");
videoYoutubeButtons.forEach((button) => {
  button.addEventListener("click", function() {
    const youTubeCode = this.getAttribute("data-youtube");
    let urlVideo = `https://www.youtube.com/embed/${youTubeCode}?rel=0&showinfo=0`;
    const iframe = document.createElement("iframe");
    iframe.setAttribute("allowfullscreen", "");
    {
      urlVideo += "&autoplay=1";
      iframe.setAttribute("allow", "autoplay; encrypted-media");
    }
    iframe.setAttribute("src", urlVideo);
    const body = this.closest(".video-youtube__body");
    body.innerHTML = "";
    body.appendChild(iframe);
    body.classList.add("video-added");
  });
});
const isMobile = { Android: function() {
  return navigator.userAgent.match(/Android/i);
}, BlackBerry: function() {
  return navigator.userAgent.match(/BlackBerry/i);
}, iOS: function() {
  return navigator.userAgent.match(/iPhone|iPad|iPod/i);
}, Opera: function() {
  return navigator.userAgent.match(/Opera Mini/i);
}, Windows: function() {
  return navigator.userAgent.match(/IEMobile/i);
}, any: function() {
  return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
} };
function addLoadedAttr() {
  if (!document.documentElement.hasAttribute("data-fls-preloader-loading")) {
    window.addEventListener("load", function() {
      setTimeout(function() {
        document.documentElement.setAttribute("data-fls-loaded", "");
      }, 0);
    });
  }
}
class FullPage {
  constructor(element, options) {
    let config = {
      noEventSelector: "[data-fls-fullpage-noevent]",
      classInit: "--fullpage-init",
      wrapperAnimatedClass: "--fullpage-switching",
      selectorSection: "[data-fls-fullpage-section]",
      activeClass: "--fullpage-active-section",
      previousClass: "--fullpage-previous-section",
      nextClass: "--fullpage-next-section",
      idActiveSection: 0,
      swipeAngle: 45,
      mode: element.dataset.flsFullpageEffect ? element.dataset.flsFullpageEffect : "slider",
      bullets: element.hasAttribute("data-fls-fullpage-bullets") ? true : false,
      bulletsClass: "--fullpage-bullets",
      bulletClass: "--fullpage-bullet",
      bulletActiveClass: "--fullpage-bullet-active",
      onInit: function() {
      },
      onSwitching: function() {
      },
      onDestroy: function() {
      }
    };
    this.options = Object.assign(config, options);
    this.wrapper = element;
    this.sections = this.wrapper.querySelectorAll(this.options.selectorSection);
    this.activeSection = false;
    this.activeSectionId = false;
    this.previousSection = false;
    this.previousSectionId = false;
    this.nextSection = false;
    this.nextSectionId = false;
    this.bulletsWrapper = false;
    this.stopEvent = false;
    if (this.sections.length) {
      this.init();
    }
  }
  init() {
    if (this.options.idActiveSection > this.sections.length - 1) return;
    this.setId();
    this.activeSectionId = this.options.idActiveSection;
    this.setEffectsClasses();
    this.setClasses();
    this.setStyle();
    if (this.options.bullets) {
      this.setBullets();
      this.setActiveBullet(this.activeSectionId);
    }
    this.events();
    setTimeout(() => {
      document.documentElement.classList.add(this.options.classInit);
      this.options.onInit(this);
      document.dispatchEvent(new CustomEvent("fpinit", {
        detail: {
          fp: this
        }
      }));
    }, 0);
  }
  destroy() {
    this.removeEvents();
    this.removeClasses();
    document.documentElement.classList.remove(this.options.classInit);
    this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
    this.removeEffectsClasses();
    this.removeZIndex();
    this.removeStyle();
    this.removeId();
    this.options.onDestroy(this);
    document.dispatchEvent(new CustomEvent("fpdestroy", {
      detail: {
        fp: this
      }
    }));
  }
  setId() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      section.setAttribute("data-fls-fullpage-id", index);
    }
  }
  removeId() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      section.removeAttribute("data-fls-fullpage-id");
    }
  }
  setClasses() {
    this.previousSectionId = this.activeSectionId - 1 >= 0 ? this.activeSectionId - 1 : false;
    this.nextSectionId = this.activeSectionId + 1 < this.sections.length ? this.activeSectionId + 1 : false;
    this.activeSection = this.sections[this.activeSectionId];
    this.activeSection.classList.add(this.options.activeClass);
    for (let index = 0; index < this.sections.length; index++) {
      document.documentElement.classList.remove(`--fullpage-section-${index}`);
    }
    document.documentElement.classList.add(`--fullpage-section-${this.activeSectionId}`);
    if (this.previousSectionId !== false) {
      this.previousSection = this.sections[this.previousSectionId];
      this.previousSection.classList.add(this.options.previousClass);
    } else {
      this.previousSection = false;
    }
    if (this.nextSectionId !== false) {
      this.nextSection = this.sections[this.nextSectionId];
      this.nextSection.classList.add(this.options.nextClass);
    } else {
      this.nextSection = false;
    }
    this.unlockByClick?.();
  }
  removeEffectsClasses() {
    switch (this.options.mode) {
      case "slider":
        this.wrapper.classList.remove("slider-mode");
        break;
      case "cards":
        this.wrapper.classList.remove("cards-mode");
        this.setZIndex();
        break;
      case "fade":
        this.wrapper.classList.remove("fade-mode");
        this.setZIndex();
        break;
    }
  }
  setEffectsClasses() {
    switch (this.options.mode) {
      case "slider":
        this.wrapper.classList.add("slider-mode");
        break;
      case "cards":
        this.wrapper.classList.add("cards-mode");
        this.setZIndex();
        break;
      case "fade":
        this.wrapper.classList.add("fade-mode");
        this.setZIndex();
        break;
    }
  }
  setStyle() {
    switch (this.options.mode) {
      case "slider":
        this.styleSlider();
        break;
      case "cards":
        this.styleCards();
        break;
      case "fade":
        this.styleFade();
        break;
    }
  }
  styleSlider() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      if (index === this.activeSectionId) {
        section.style.transform = "translate3D(0,0,0)";
      } else if (index < this.activeSectionId) {
        section.style.transform = "translate3D(0,-100%,0)";
      } else if (index > this.activeSectionId) {
        section.style.transform = "translate3D(0,100%,0)";
      }
    }
  }
  styleCards() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      if (index >= this.activeSectionId) {
        section.style.transform = "translate3D(0,0,0)";
      } else if (index < this.activeSectionId) {
        section.style.transform = "translate3D(0,-100%,0)";
      }
    }
  }
  styleFade() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      if (index === this.activeSectionId) {
        section.style.opacity = "1";
        section.style.pointerEvents = "all";
      } else {
        section.style.opacity = "0";
        section.style.pointerEvents = "none";
      }
    }
  }
  removeStyle() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      section.style.opacity = "";
      section.style.visibility = "";
      section.style.transform = "";
    }
  }
  checkScroll(yCoord, element) {
    this.goScroll = false;
    if (!this.stopEvent && element) {
      this.goScroll = true;
      if (this.haveScroll(element)) {
        this.goScroll = false;
        const position = Math.round(element.scrollHeight - element.scrollTop);
        if (Math.abs(position - element.scrollHeight) < 2 && yCoord <= 0 || Math.abs(position - element.clientHeight) < 2 && yCoord >= 0) {
          this.goScroll = true;
        }
      }
    }
  }
  haveScroll(element) {
    return element.scrollHeight !== window.innerHeight;
  }
  removeClasses() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      section.classList.remove(this.options.activeClass);
      section.classList.remove(this.options.previousClass);
      section.classList.remove(this.options.nextClass);
    }
  }
  events() {
    this.events = {
      wheel: this.wheel.bind(this),
      touchdown: this.touchDown.bind(this),
      touchup: this.touchUp.bind(this),
      touchmove: this.touchMove.bind(this),
      touchcancel: this.touchUp.bind(this),
      transitionEnd: this.transitionend.bind(this),
      click: this.clickBullets.bind(this)
    };
    if (isMobile.iOS()) {
      document.addEventListener("touchmove", (e) => {
        e.preventDefault();
      });
    }
    this.setEvents();
  }
  // data-fp-locked == разблокируем свайп на секции с атрибутом data-fp-locked кликом по элементу data-fp-unlock-index
  unlockByClick() {
    const unlockables = this.activeSection.querySelectorAll("[data-fp-unlock-index]");
    if (unlockables.length) {
      unlockables.forEach((el) => {
        el.addEventListener("click", () => {
          const index = el.getAttribute("data-fp-unlock-index");
          this.activeSection.removeAttribute("data-fp-locked");
          document.documentElement.classList.forEach((className) => {
            if (className.startsWith("_target-el--")) {
              document.documentElement.classList.remove(className);
            }
          });
          document.documentElement.classList.add(`_target-el--${index}`);
          const nextSectionId = this.activeSectionId + 1;
          if (nextSectionId < this.sections.length) {
            setTimeout(() => {
              this.switchingSection(nextSectionId, 100);
            }, 400);
          }
        });
      });
    }
  }
  setEvents() {
    this.wrapper.addEventListener("wheel", this.events.wheel);
    this.wrapper.addEventListener("touchstart", this.events.touchdown);
    if (this.options.bullets && this.bulletsWrapper) {
      this.bulletsWrapper.addEventListener("click", this.events.click);
    }
    const nextArrowBtns = document.querySelectorAll(".chips__btn");
    nextArrowBtns.forEach((nextArrowBtn) => {
      nextArrowBtn.addEventListener("click", () => {
        const nextSectionId = this.activeSectionId + 1;
        if (nextSectionId < this.sections.length) {
          this.switchingSection(nextSectionId);
        }
      });
    });
  }
  removeEvents() {
    this.wrapper.removeEventListener("wheel", this.events.wheel);
    this.wrapper.removeEventListener("touchdown", this.events.touchdown);
    this.wrapper.removeEventListener("touchup", this.events.touchup);
    this.wrapper.removeEventListener("touchcancel", this.events.touchup);
    this.wrapper.removeEventListener("touchmove", this.events.touchmove);
    if (this.bulletsWrapper) {
      this.bulletsWrapper.removeEventListener("click", this.events.click);
    }
  }
  clickBullets(e) {
    const bullet = e.target.closest(`.${this.options.bulletClass}`);
    if (bullet) {
      const arrayChildren = Array.from(this.bulletsWrapper.children);
      const idClickBullet = arrayChildren.indexOf(bullet);
      const isGoingForward = idClickBullet > this.activeSectionId;
      let canGo = true;
      if (isGoingForward) {
        for (let i = this.activeSectionId; i < idClickBullet; i++) {
          if (this.sections[i].hasAttribute("data-fp-locked")) {
            canGo = false;
            break;
          }
        }
      }
      if (canGo) {
        this.switchingSection(idClickBullet);
      }
    }
  }
  setActiveBullet(idButton) {
    if (!this.bulletsWrapper) return;
    const bullets = this.bulletsWrapper.children;
    for (let index = 0; index < bullets.length; index++) {
      const bullet = bullets[index];
      if (idButton === index) bullet.classList.add(this.options.bulletActiveClass);
      else bullet.classList.remove(this.options.bulletActiveClass);
    }
  }
  touchDown(e) {
    this._touchStartY = e.changedTouches[0].pageY;
    this._touchStartX = e.changedTouches[0].pageX;
    this._eventElement = e.target.closest(`.${this.options.activeClass}`);
    if (this._eventElement) {
      this._eventElement.addEventListener("touchend", this.events.touchup);
      this._eventElement.addEventListener("touchcancel", this.events.touchup);
      this._eventElement.addEventListener("touchmove", this.events.touchmove);
      this.clickOrTouch = true;
      if (isMobile.iOS()) {
        if (this._eventElement.scrollHeight !== this._eventElement.clientHeight) {
          if (this._eventElement.scrollTop === 0) {
            this._eventElement.scrollTop = 1;
          }
          if (this._eventElement.scrollTop === this._eventElement.scrollHeight - this._eventElement.clientHeight) {
            this._eventElement.scrollTop = this._eventElement.scrollHeight - this._eventElement.clientHeight - 1;
          }
        }
        this.allowUp = this._eventElement.scrollTop > 0;
        this.allowDown = this._eventElement.scrollTop < this._eventElement.scrollHeight - this._eventElement.clientHeight;
        this.lastY = e.changedTouches[0].pageY;
      }
    }
  }
  touchMove(e) {
    const targetElement = e.target.closest(`.${this.options.activeClass}`);
    if (isMobile.iOS()) {
      let up = e.changedTouches[0].pageY > this.lastY;
      let down = !up;
      this.lastY = e.changedTouches[0].pageY;
      if (targetElement) {
        if (up && this.allowUp || down && this.allowDown) {
          e.stopPropagation();
        } else if (e.cancelable) {
          e.preventDefault();
        }
      }
    }
    const deltaX = e.changedTouches[0].pageX - this._touchStartX;
    const deltaY = e.changedTouches[0].pageY - this._touchStartY;
    const angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI);
    if (angle < 90 - this.options.swipeAngle) {
      return;
    }
    if (!this.clickOrTouch || e.target.closest(this.options.noEventSelector)) return;
    let yCoord = this._touchStartY - e.changedTouches[0].pageY;
    this.checkScroll(yCoord, targetElement);
    if (this.goScroll && Math.abs(yCoord) > 20) {
      this.choiceOfDirection(yCoord);
    }
  }
  touchUp(e) {
    this._eventElement.removeEventListener("touchend", this.events.touchup);
    this._eventElement.removeEventListener("touchcancel", this.events.touchup);
    this._eventElement.removeEventListener("touchmove", this.events.touchmove);
    return this.clickOrTouch = false;
  }
  transitionend(e) {
    this.stopEvent = false;
    document.documentElement.classList.remove(this.options.wrapperAnimatedClass);
    this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
  }
  wheel(e) {
    if (e.target.closest(this.options.noEventSelector)) return;
    const yCoord = e.deltaY;
    const targetElement = e.target.closest(`.${this.options.activeClass}`);
    this.checkScroll(yCoord, targetElement);
    if (this.goScroll) this.choiceOfDirection(yCoord);
  }
  choiceOfDirection(direction) {
    const isLocked = this.activeSection.hasAttribute("data-fp-locked");
    if (direction > 0 && isLocked) return;
    if (direction > 0 && this.nextSection !== false) {
      this.activeSectionId = this.activeSectionId + 1 < this.sections.length ? ++this.activeSectionId : this.activeSectionId;
    } else if (direction < 0 && this.previousSection !== false) {
      this.activeSectionId = this.activeSectionId - 1 >= 0 ? --this.activeSectionId : this.activeSectionId;
    }
    this.switchingSection(this.activeSectionId, direction);
  }
  switchingSection(idSection = this.activeSectionId, direction) {
    if (!direction) {
      if (idSection < this.activeSectionId) {
        direction = -100;
      } else if (idSection > this.activeSectionId) {
        direction = 100;
      }
    }
    this.activeSectionId = idSection;
    this.stopEvent = true;
    if (this.previousSectionId === false && direction < 0 || this.nextSectionId === false && direction > 0) {
      this.stopEvent = false;
    }
    if (this.stopEvent) {
      document.documentElement.classList.add(this.options.wrapperAnimatedClass);
      this.wrapper.classList.add(this.options.wrapperAnimatedClass);
      this.removeClasses();
      this.setClasses();
      this.setStyle();
      if (this.options.bullets) this.setActiveBullet(this.activeSectionId);
      let delaySection;
      if (direction < 0) {
        delaySection = this.activeSection.dataset.flsFullpageDirectionUp ? parseInt(this.activeSection.dataset.flsFullpageDirectionUp) : 500;
        document.documentElement.classList.add("--fullpage-up");
        document.documentElement.classList.remove("--fullpage-down");
      } else {
        delaySection = this.activeSection.dataset.flsFullpageDirectionDown ? parseInt(this.activeSection.dataset.flsFullpageDirectionDown) : 500;
        document.documentElement.classList.remove("--fullpage-up");
        document.documentElement.classList.add("--fullpage-down");
      }
      setTimeout(() => {
        this.events.transitionEnd();
      }, delaySection);
      this.options.onSwitching(this);
      document.dispatchEvent(new CustomEvent("fpswitching", {
        detail: {
          fp: this
        }
      }));
    }
  }
  setBullets() {
    this.bulletsWrapper = document.querySelector(`.${this.options.bulletsClass}`);
    if (!this.bulletsWrapper) {
      const bullets = document.createElement("div");
      bullets.classList.add(this.options.bulletsClass);
      this.wrapper.append(bullets);
      this.bulletsWrapper = bullets;
    }
    if (this.bulletsWrapper) {
      for (let index = 0; index < this.sections.length; index++) {
        const span = document.createElement("span");
        span.classList.add(this.options.bulletClass);
        this.bulletsWrapper.append(span);
      }
    }
  }
  setZIndex() {
    let zIndex = this.sections.length;
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      section.style.zIndex = zIndex;
      --zIndex;
    }
  }
  removeZIndex() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      section.style.zIndex = "";
    }
  }
}
if (document.querySelector("[data-fls-fullpage]")) {
  window.addEventListener("load", () => window.flsFullpage = new FullPage(document.querySelector("[data-fls-fullpage]")));
}
(function() {
  function append() {
    var length = arguments.length;
    for (var i = 0; i < length; i++) {
      var node = i < 0 || arguments.length <= i ? void 0 : arguments[i];
      if (node.nodeType === 1 || node.nodeType === 11) this.appendChild(node);
      else this.appendChild(document.createTextNode(String(node)));
    }
  }
  function replaceChildren() {
    while (this.lastChild) {
      this.removeChild(this.lastChild);
    }
    if (arguments.length) this.append.apply(this, arguments);
  }
  function replaceWith() {
    var parent = this.parentNode;
    for (var _len = arguments.length, nodes = new Array(_len), _key = 0; _key < _len; _key++) {
      nodes[_key] = arguments[_key];
    }
    var i = nodes.length;
    if (!parent) return;
    if (!i) parent.removeChild(this);
    while (i--) {
      var node = nodes[i];
      if (typeof node !== "object") {
        node = this.ownerDocument.createTextNode(node);
      } else if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      if (!i) {
        parent.replaceChild(node, this);
      } else {
        parent.insertBefore(this.previousSibling, node);
      }
    }
  }
  if (typeof Element !== "undefined") {
    if (!Element.prototype.append) {
      Element.prototype.append = append;
      DocumentFragment.prototype.append = append;
    }
    if (!Element.prototype.replaceChildren) {
      Element.prototype.replaceChildren = replaceChildren;
      DocumentFragment.prototype.replaceChildren = replaceChildren;
    }
    if (!Element.prototype.replaceWith) {
      Element.prototype.replaceWith = replaceWith;
      DocumentFragment.prototype.replaceWith = replaceWith;
    }
  }
})();
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}
function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = void 0;
  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function extend(target, object) {
  return Object.getOwnPropertyNames(Object(target)).reduce(function(extended, key) {
    var currentValue = Object.getOwnPropertyDescriptor(Object(target), key);
    var newValue = Object.getOwnPropertyDescriptor(Object(object), key);
    return Object.defineProperty(extended, key, newValue || currentValue);
  }, {});
}
function isString(value) {
  return typeof value === "string";
}
function isArray(value) {
  return Array.isArray(value);
}
function parseSettings() {
  var settings = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  var object = extend(settings);
  var types;
  if (object.types !== void 0) {
    types = object.types;
  } else if (object.split !== void 0) {
    types = object.split;
  }
  if (types !== void 0) {
    object.types = (isString(types) || isArray(types) ? String(types) : "").split(",").map(function(type) {
      return String(type).trim();
    }).filter(function(type) {
      return /((line)|(word)|(char))/i.test(type);
    });
  }
  if (object.absolute || object.position) {
    object.absolute = object.absolute || /absolute/.test(settings.position);
  }
  return object;
}
function parseTypes(value) {
  var types = isString(value) || isArray(value) ? String(value) : "";
  return {
    none: !types,
    lines: /line/i.test(types),
    words: /word/i.test(types),
    chars: /char/i.test(types)
  };
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isNode(input) {
  return isObject(input) && /^(1|3|11)$/.test(input.nodeType);
}
function isLength(value) {
  return typeof value === "number" && value > -1 && value % 1 === 0;
}
function isArrayLike(value) {
  return isObject(value) && isLength(value.length);
}
function toArray(value) {
  if (isArray(value)) return value;
  if (value == null) return [];
  return isArrayLike(value) ? Array.prototype.slice.call(value) : [value];
}
function getTargetElements(target) {
  var elements = target;
  if (isString(target)) {
    if (/^(#[a-z]\w+)$/.test(target.trim())) {
      elements = document.getElementById(target.trim().slice(1));
    } else {
      elements = document.querySelectorAll(target);
    }
  }
  return toArray(elements).reduce(function(result, element) {
    return [].concat(_toConsumableArray(result), _toConsumableArray(toArray(element).filter(isNode)));
  }, []);
}
var entries = Object.entries;
var expando = "_splittype";
var cache = {};
var uid = 0;
function set(owner, key, value) {
  if (!isObject(owner)) {
    console.warn("[data.set] owner is not an object");
    return null;
  }
  var id = owner[expando] || (owner[expando] = ++uid);
  var data = cache[id] || (cache[id] = {});
  if (value === void 0) {
    if (!!key && Object.getPrototypeOf(key) === Object.prototype) {
      cache[id] = _objectSpread2(_objectSpread2({}, data), key);
    }
  } else if (key !== void 0) {
    data[key] = value;
  }
  return value;
}
function get(owner, key) {
  var id = isObject(owner) ? owner[expando] : null;
  var data = id && cache[id] || {};
  {
    return data;
  }
}
function remove(element) {
  var id = element && element[expando];
  if (id) {
    delete element[id];
    delete cache[id];
  }
}
function clear() {
  Object.keys(cache).forEach(function(key) {
    delete cache[key];
  });
}
function cleanup() {
  entries(cache).forEach(function(_ref) {
    var _ref2 = _slicedToArray(_ref, 2), id = _ref2[0], _ref2$ = _ref2[1], isRoot = _ref2$.isRoot, isSplit = _ref2$.isSplit;
    if (!isRoot || !isSplit) {
      cache[id] = null;
      delete cache[id];
    }
  });
}
function toWords(value) {
  var separator = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : " ";
  var string = value ? String(value) : "";
  return string.trim().replace(/\s+/g, " ").split(separator);
}
var rsAstralRange = "\\ud800-\\udfff";
var rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23";
var rsComboSymbolsRange = "\\u20d0-\\u20f0";
var rsVarRange = "\\ufe0e\\ufe0f";
var rsAstral = "[".concat(rsAstralRange, "]");
var rsCombo = "[".concat(rsComboMarksRange).concat(rsComboSymbolsRange, "]");
var rsFitz = "\\ud83c[\\udffb-\\udfff]";
var rsModifier = "(?:".concat(rsCombo, "|").concat(rsFitz, ")");
var rsNonAstral = "[^".concat(rsAstralRange, "]");
var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
var rsZWJ = "\\u200d";
var reOptMod = "".concat(rsModifier, "?");
var rsOptVar = "[".concat(rsVarRange, "]?");
var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = "(?:".concat(["".concat(rsNonAstral).concat(rsCombo, "?"), rsCombo, rsRegional, rsSurrPair, rsAstral].join("|"), "\n)");
var reUnicode = RegExp("".concat(rsFitz, "(?=").concat(rsFitz, ")|").concat(rsSymbol).concat(rsSeq), "g");
var unicodeRange = [rsZWJ, rsAstralRange, rsComboMarksRange, rsComboSymbolsRange, rsVarRange];
var reHasUnicode = RegExp("[".concat(unicodeRange.join(""), "]"));
function asciiToArray(string) {
  return string.split("");
}
function hasUnicode(string) {
  return reHasUnicode.test(string);
}
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}
function stringToArray(string) {
  return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
}
function toString(value) {
  return value == null ? "" : String(value);
}
function toChars(string) {
  var separator = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
  string = toString(string);
  if (string && isString(string)) {
    if (!separator && hasUnicode(string)) {
      return stringToArray(string);
    }
  }
  return string.split(separator);
}
function createElement(name, attributes) {
  var element = document.createElement(name);
  if (!attributes) {
    return element;
  }
  Object.keys(attributes).forEach(function(attribute) {
    var rawValue = attributes[attribute];
    var value = isString(rawValue) ? rawValue.trim() : rawValue;
    if (value === null || value === "") return;
    if (attribute === "children") {
      element.append.apply(element, _toConsumableArray(toArray(value)));
    } else {
      element.setAttribute(attribute, value);
    }
  });
  return element;
}
var defaults = {
  splitClass: "",
  lineClass: "line",
  wordClass: "word",
  charClass: "char",
  types: ["lines", "words", "chars"],
  absolute: false,
  tagName: "div"
};
function splitWordsAndChars(textNode, settings) {
  settings = extend(defaults, settings);
  var types = parseTypes(settings.types);
  var TAG_NAME = settings.tagName;
  var VALUE = textNode.nodeValue;
  var splitText = document.createDocumentFragment();
  var words = [];
  var chars = [];
  if (/^\s/.test(VALUE)) {
    splitText.append(" ");
  }
  words = toWords(VALUE).reduce(function(result, WORD, idx, arr) {
    var wordElement;
    var characterElementsForCurrentWord;
    if (types.chars) {
      characterElementsForCurrentWord = toChars(WORD).map(function(CHAR) {
        var characterElement = createElement(TAG_NAME, {
          "class": "".concat(settings.splitClass, " ").concat(settings.charClass),
          style: "display: inline-block;",
          children: CHAR
        });
        set(characterElement, "isChar", true);
        chars = [].concat(_toConsumableArray(chars), [characterElement]);
        return characterElement;
      });
    }
    if (types.words || types.lines) {
      wordElement = createElement(TAG_NAME, {
        "class": "".concat(settings.wordClass, " ").concat(settings.splitClass),
        style: "display: inline-block; ".concat(types.words && settings.absolute ? "position: relative;" : ""),
        children: types.chars ? characterElementsForCurrentWord : WORD
      });
      set(wordElement, {
        isWord: true,
        isWordStart: true,
        isWordEnd: true
      });
      splitText.appendChild(wordElement);
    } else {
      characterElementsForCurrentWord.forEach(function(characterElement) {
        splitText.appendChild(characterElement);
      });
    }
    if (idx < arr.length - 1) {
      splitText.append(" ");
    }
    return types.words ? result.concat(wordElement) : result;
  }, []);
  if (/\s$/.test(VALUE)) {
    splitText.append(" ");
  }
  textNode.replaceWith(splitText);
  return {
    words,
    chars
  };
}
function split(node, settings) {
  var type = node.nodeType;
  var wordsAndChars = {
    words: [],
    chars: []
  };
  if (!/(1|3|11)/.test(type)) {
    return wordsAndChars;
  }
  if (type === 3 && /\S/.test(node.nodeValue)) {
    return splitWordsAndChars(node, settings);
  }
  var childNodes = toArray(node.childNodes);
  if (childNodes.length) {
    set(node, "isSplit", true);
    if (!get(node).isRoot) {
      node.style.display = "inline-block";
      node.style.position = "relative";
      var nextSibling = node.nextSibling;
      var prevSibling = node.previousSibling;
      var text = node.textContent || "";
      var textAfter = nextSibling ? nextSibling.textContent : " ";
      var textBefore = prevSibling ? prevSibling.textContent : " ";
      set(node, {
        isWordEnd: /\s$/.test(text) || /^\s/.test(textAfter),
        isWordStart: /^\s/.test(text) || /\s$/.test(textBefore)
      });
    }
  }
  return childNodes.reduce(function(result, child) {
    var _split = split(child, settings), words = _split.words, chars = _split.chars;
    return {
      words: [].concat(_toConsumableArray(result.words), _toConsumableArray(words)),
      chars: [].concat(_toConsumableArray(result.chars), _toConsumableArray(chars))
    };
  }, wordsAndChars);
}
function getPosition(node, isWord, settings, scrollPos) {
  if (!settings.absolute) {
    return {
      top: isWord ? node.offsetTop : null
    };
  }
  var parent = node.offsetParent;
  var _scrollPos = _slicedToArray(scrollPos, 2), scrollX = _scrollPos[0], scrollY = _scrollPos[1];
  var parentX = 0;
  var parentY = 0;
  if (parent && parent !== document.body) {
    var parentRect = parent.getBoundingClientRect();
    parentX = parentRect.x + scrollX;
    parentY = parentRect.y + scrollY;
  }
  var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height, x = _node$getBoundingClie.x, y = _node$getBoundingClie.y;
  var top = y + scrollY - parentY;
  var left = x + scrollX - parentX;
  return {
    width,
    height,
    top,
    left
  };
}
function unSplitWords(element) {
  if (!get(element).isWord) {
    toArray(element.children).forEach(function(child) {
      return unSplitWords(child);
    });
  } else {
    remove(element);
    element.replaceWith.apply(element, _toConsumableArray(element.childNodes));
  }
}
var createFragment = function createFragment2() {
  return document.createDocumentFragment();
};
function repositionAfterSplit(element, settings, scrollPos) {
  var types = parseTypes(settings.types);
  var TAG_NAME = settings.tagName;
  var nodes = element.getElementsByTagName("*");
  var wordsInEachLine = [];
  var wordsInCurrentLine = [];
  var lineOffsetY = null;
  var elementHeight;
  var elementWidth;
  var contentBox;
  var lines = [];
  var parent = element.parentElement;
  var nextSibling = element.nextElementSibling;
  var splitText = createFragment();
  var cs = window.getComputedStyle(element);
  var align = cs.textAlign;
  var fontSize = parseFloat(cs.fontSize);
  var lineThreshold = fontSize * 0.2;
  if (settings.absolute) {
    contentBox = {
      left: element.offsetLeft,
      top: element.offsetTop,
      width: element.offsetWidth
    };
    elementWidth = element.offsetWidth;
    elementHeight = element.offsetHeight;
    set(element, {
      cssWidth: element.style.width,
      cssHeight: element.style.height
    });
  }
  toArray(nodes).forEach(function(node) {
    var isWordLike = node.parentElement === element;
    var _getPosition = getPosition(node, isWordLike, settings, scrollPos), width = _getPosition.width, height = _getPosition.height, top = _getPosition.top, left = _getPosition.left;
    if (/^br$/i.test(node.nodeName)) return;
    if (types.lines && isWordLike) {
      if (lineOffsetY === null || top - lineOffsetY >= lineThreshold) {
        lineOffsetY = top;
        wordsInEachLine.push(wordsInCurrentLine = []);
      }
      wordsInCurrentLine.push(node);
    }
    if (settings.absolute) {
      set(node, {
        top,
        left,
        width,
        height
      });
    }
  });
  if (parent) {
    parent.removeChild(element);
  }
  if (types.lines) {
    lines = wordsInEachLine.map(function(wordsInThisLine) {
      var lineElement = createElement(TAG_NAME, {
        "class": "".concat(settings.splitClass, " ").concat(settings.lineClass),
        style: "display: block; text-align: ".concat(align, "; width: 100%;")
      });
      set(lineElement, "isLine", true);
      var lineDimensions = {
        height: 0,
        top: 1e4
      };
      splitText.appendChild(lineElement);
      wordsInThisLine.forEach(function(wordOrElement, idx, arr) {
        var _data$get = get(wordOrElement), isWordEnd = _data$get.isWordEnd, top = _data$get.top, height = _data$get.height;
        var next = arr[idx + 1];
        lineDimensions.height = Math.max(lineDimensions.height, height);
        lineDimensions.top = Math.min(lineDimensions.top, top);
        lineElement.appendChild(wordOrElement);
        if (isWordEnd && get(next).isWordStart) {
          lineElement.append(" ");
        }
      });
      if (settings.absolute) {
        set(lineElement, {
          height: lineDimensions.height,
          top: lineDimensions.top
        });
      }
      return lineElement;
    });
    if (!types.words) {
      unSplitWords(splitText);
    }
    element.replaceChildren(splitText);
  }
  if (settings.absolute) {
    element.style.width = "".concat(element.style.width || elementWidth, "px");
    element.style.height = "".concat(elementHeight, "px");
    toArray(nodes).forEach(function(node) {
      var _data$get2 = get(node), isLine = _data$get2.isLine, top = _data$get2.top, left = _data$get2.left, width = _data$get2.width, height = _data$get2.height;
      var parentData = get(node.parentElement);
      var isChildOfLineNode = !isLine && parentData.isLine;
      node.style.top = "".concat(isChildOfLineNode ? top - parentData.top : top, "px");
      node.style.left = isLine ? "".concat(contentBox.left, "px") : "".concat(left - (isChildOfLineNode ? contentBox.left : 0), "px");
      node.style.height = "".concat(height, "px");
      node.style.width = isLine ? "".concat(contentBox.width, "px") : "".concat(width, "px");
      node.style.position = "absolute";
    });
  }
  if (parent) {
    if (nextSibling) parent.insertBefore(element, nextSibling);
    else parent.appendChild(element);
  }
  return lines;
}
var _defaults = extend(defaults, {});
var SplitType = /* @__PURE__ */ (function() {
  _createClass(SplitType2, null, [{
    key: "clearData",
    /**
     * CLears all data
     */
    value: function clearData() {
      clear();
    }
    /**
     * The default settings for all splitType instances
     * @static
     */
  }, {
    key: "setDefaults",
    /**
     * Sets the default settings for all SplitType instances.
     * The provided object will be merged with the existing defaults objects.
     *
     * @param {Object} settings an object containing the settings to override
     * @returns {Object} the new default settings
     * @public
     * @static
     * @example
     * SplitType.setDefaults({ "position": "absolute" })
     */
    value: function setDefaults(options) {
      _defaults = extend(_defaults, parseSettings(options));
      return defaults;
    }
    /**
     * Revert target elements to their original html content
     * Has no effect on that
     *
     * @param {any} elements The target elements to revert. One of:
     *  - {string} A css selector
     *  - {HTMLElement} A single element
     * -  {NodeList} A NodeList or collection
     *  - {HTMLElement[]} An array of Elements
     * -  {Array<HTMLElement|NodeList|HTMLElement[]>} A nested array of elements
     * @static
     */
  }, {
    key: "revert",
    value: function revert(elements) {
      getTargetElements(elements).forEach(function(element) {
        var _data$get = get(element), isSplit = _data$get.isSplit, html = _data$get.html, cssWidth = _data$get.cssWidth, cssHeight = _data$get.cssHeight;
        if (isSplit) {
          element.innerHTML = html;
          element.style.width = cssWidth || "";
          element.style.height = cssHeight || "";
          remove(element);
        }
      });
    }
    /**
     * Creates a new SplitType instance
     * This static method provides a way to create a `SplitType` instance without
     * using the `new` keyword.
     *
     * @param {any} target The target elements to split. One of:
     *  - {string} A css selector
     *  - {HTMLElement} A single element
     * -  {NodeList} A NodeList or collection
     *  - {HTMLElement[]} An array of Elements
     * -  {Array<HTMLElement|NodeList|HTMLElement[]>} A nested array of elements
     * @param {Object} [options] Settings for the SplitType instance
     * @return {SplitType} the SplitType instance
     * @static
     */
  }, {
    key: "create",
    value: function create(target, options) {
      return new SplitType2(target, options);
    }
    /**
     * Creates a new `SplitType` instance
     *
     * @param {any} elements The target elements to split. One of:
     *  - {string} A css selector
     *  - {HTMLElement} A single element
     * -  {NodeList} A NodeList or collection
     *  - {HTMLElement[]} An array of Elements
     * -  {Array<HTMLElement|NodeList|HTMLElement[]>} A nested array of elements
     * @param {Object} [options] Settings for the SplitType instance
     */
  }, {
    key: "data",
    /**
     * The internal data store
     */
    get: function get2() {
      return cache;
    }
  }, {
    key: "defaults",
    get: function get2() {
      return _defaults;
    },
    set: function set2(options) {
      _defaults = extend(_defaults, parseSettings(options));
    }
  }]);
  function SplitType2(elements, options) {
    _classCallCheck(this, SplitType2);
    this.isSplit = false;
    this.settings = extend(_defaults, parseSettings(options));
    this.elements = getTargetElements(elements);
    this.split();
  }
  _createClass(SplitType2, [{
    key: "split",
    value: function split$1(options) {
      var _this = this;
      this.revert();
      this.elements.forEach(function(element) {
        set(element, "html", element.innerHTML);
      });
      this.lines = [];
      this.words = [];
      this.chars = [];
      var scrollPos = [window.pageXOffset, window.pageYOffset];
      if (options !== void 0) {
        this.settings = extend(this.settings, parseSettings(options));
      }
      var types = parseTypes(this.settings.types);
      if (types.none) {
        return;
      }
      this.elements.forEach(function(element) {
        set(element, "isRoot", true);
        var _split2 = split(element, _this.settings), words = _split2.words, chars = _split2.chars;
        _this.words = [].concat(_toConsumableArray(_this.words), _toConsumableArray(words));
        _this.chars = [].concat(_toConsumableArray(_this.chars), _toConsumableArray(chars));
      });
      this.elements.forEach(function(element) {
        if (types.lines || _this.settings.absolute) {
          var lines = repositionAfterSplit(element, _this.settings, scrollPos);
          _this.lines = [].concat(_toConsumableArray(_this.lines), _toConsumableArray(lines));
        }
      });
      this.isSplit = true;
      window.scrollTo(scrollPos[0], scrollPos[1]);
      cleanup();
    }
    /**
     * Reverts target element(s) back to their original html content
     * Deletes all stored data associated with the target elements
     * Resets the properties on the splitType instance
     *
     * @public
     */
  }, {
    key: "revert",
    value: function revert() {
      if (this.isSplit) {
        this.lines = null;
        this.words = null;
        this.chars = null;
        this.isSplit = false;
      }
      SplitType2.revert(this.elements);
    }
  }]);
  return SplitType2;
})();
addLoadedAttr();
const splitTextLines = document.querySelectorAll(".split-lines");
const splitTextWords = document.querySelectorAll(".split-words");
const splitTextChars = document.querySelectorAll(".split-chars");
const splitTextBoth = document.querySelectorAll(".split-both");
const splitSetSpan = document.querySelectorAll(".split-words.set-span");
function initSplitType() {
  if (splitTextLines.length > 0) {
    splitTextLines.forEach((element) => {
      new SplitType(element, { types: "lines" });
    });
  }
  if (splitTextWords.length > 0) {
    splitTextWords.forEach((element) => {
      new SplitType(element, { types: "words" });
      const words = element.querySelectorAll(".word");
      words.forEach((word, index) => {
        word.style.setProperty("--index", index);
      });
    });
  }
  if (splitTextChars.length > 0) {
    splitTextChars.forEach((element) => {
      new SplitType(element, { types: "chars" });
      const chars = element.querySelectorAll(".char");
      chars.forEach((char, index) => {
        char.style.setProperty("--index", index);
      });
    });
  }
  if (splitTextBoth.length > 0) {
    splitTextBoth.forEach((element) => {
      new SplitType(element, { types: "lines, words" });
      const words = element.querySelectorAll(".word");
      words.forEach((word, index) => {
        word.style.setProperty("--index", index);
      });
    });
  }
  if (splitSetSpan.length > 0) {
    splitSetSpan.forEach((splitSetSpan2) => {
      const words = splitSetSpan2.querySelectorAll(".word");
      words.forEach((word) => {
        const text = word.textContent.trim();
        word.innerHTML = `<span class="word-span">${text}</span>`;
      });
    });
  }
}
initSplitType();
let lastWidth = window.innerWidth;
const resizeObserver = new ResizeObserver((entries2) => {
  requestAnimationFrame(() => {
    entries2.forEach((entry) => {
      const currentWidth = entry.contentRect.width;
      if (currentWidth !== lastWidth) {
        setTimeout(() => {
          initSplitType();
        }, 50);
        lastWidth = currentWidth;
      }
    });
  });
});
resizeObserver.observe(document.body);
let optionsCycleInterval = null;
function startOptionsCycle({ iterations = Infinity, delay = 1300 } = {}) {
  const options = document.querySelector(".options");
  const items = options?.querySelectorAll(".options__item");
  if (!options || !items?.length) return;
  let currentIndex = 0;
  let count = 0;
  const total = items.length;
  clearInterval(optionsCycleInterval);
  optionsCycleInterval = setInterval(() => {
    items.forEach((item) => item.classList.remove("_active"));
    options.classList.remove(...[...Array(total)].map((_, i) => `item-${i + 1}`));
    items[currentIndex].classList.add("_active");
    options.classList.add(`item-${currentIndex + 1}`);
    currentIndex = (currentIndex + 1) % total;
    count++;
    if (iterations !== Infinity && count >= iterations * total) {
      clearInterval(optionsCycleInterval);
      setTimeout(() => {
        items.forEach((item) => item.classList.remove("_active"));
        options.classList.remove(...[...Array(total)].map((_, i) => `item-${i + 1}`));
      }, delay);
    }
  }, delay);
}
function stopOptionsCycle() {
  clearInterval(optionsCycleInterval);
  optionsCycleInterval = null;
  const options = document.querySelector(".options");
  const items = options?.querySelectorAll(".options__item");
  if (options) {
    options.classList.remove("item-1", "item-2", "item-3");
  }
  if (items?.length) {
    items.forEach((item) => item.classList.remove("_active"));
  }
}
document.addEventListener("click", (e) => {
  const target = e.target.closest(".options__input");
  if (!target) return;
  const options = document.querySelector(".options");
  const items = options?.querySelectorAll(".options__item");
  stopOptionsCycle();
  if (options) {
    options.classList.remove(...[...Array(items.length)].map((_, i) => `item-${i + 1}`));
  }
  if (items?.length) {
    items.forEach((item) => item.classList.remove("_active"));
  }
  htmlObserver.disconnect();
  const html = document.documentElement;
  const value = target.value;
  html.classList.remove("_form-item--1", "_form-item--2", "_form-item--3");
  html.classList.add(`_form-item--${value}`);
});
const mm = window.matchMedia("(max-width: 51.31em)");
function handleMatchMedia(e) {
  if (e.matches) {
    startOptionsCycle(
      { iterations: 1, delay: 900 }
      // настройка итераций и задержки, если нужно
    );
  } else {
    stopOptionsCycle();
  }
}
const htmlObserver = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "attributes" && mutation.attributeName === "class") {
      const html = document.documentElement;
      if (html.classList.contains("--fullpage-section-1")) {
        handleMatchMedia(mm);
        break;
      }
    }
  }
});
htmlObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"]
});
mm.addEventListener("change", handleMatchMedia);
window.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector(".section-4__list");
  const items = list?.querySelectorAll(".section-4__item");
  if (list && items?.length > 1) {
    items[1].scrollIntoView({ behavior: "auto", inline: "center" });
  }
});
