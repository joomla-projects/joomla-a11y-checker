function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function createCommonjsModule(fn, module) {
  return module = {
    exports: {}
  }, fn(module, module.exports), module.exports;
}

var sprintf$1 = createCommonjsModule(function (module, exports) {
  /* global window, exports, define */
  !function () {
    var re = {
      not_string: /[^s]/,
      not_bool: /[^t]/,
      not_type: /[^T]/,
      not_primitive: /[^v]/,
      number: /[diefg]/,
      numeric_arg: /[bcdiefguxX]/,
      json: /[j]/,
      not_json: /[^j]/,
      text: /^[^\x25]+/,
      modulo: /^\x25{2}/,
      placeholder: /^\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
      key: /^([a-z_][a-z_\d]*)/i,
      key_access: /^\.([a-z_][a-z_\d]*)/i,
      index_access: /^\[(\d+)\]/,
      sign: /^[+-]/
    };

    function sprintf(key) {
      // `arguments` is not an array, but should be fine for this call
      return sprintf_format(sprintf_parse(key), arguments);
    }

    function vsprintf(fmt, argv) {
      return sprintf.apply(null, [fmt].concat(argv || []));
    }

    function sprintf_format(parse_tree, argv) {
      var cursor = 1,
          tree_length = parse_tree.length,
          arg,
          output = '',
          i,
          k,
          ph,
          pad,
          pad_character,
          pad_length,
          is_positive,
          sign;

      for (i = 0; i < tree_length; i++) {
        if (typeof parse_tree[i] === 'string') {
          output += parse_tree[i];
        } else if (_typeof(parse_tree[i]) === 'object') {
          ph = parse_tree[i]; // convenience purposes only

          if (ph.keys) {
            // keyword argument
            arg = argv[cursor];

            for (k = 0; k < ph.keys.length; k++) {
              if (arg == undefined) {
                throw new Error(sprintf('[sprintf] Cannot access property "%s" of undefined value "%s"', ph.keys[k], ph.keys[k - 1]));
              }

              arg = arg[ph.keys[k]];
            }
          } else if (ph.param_no) {
            // positional argument (explicit)
            arg = argv[ph.param_no];
          } else {
            // positional argument (implicit)
            arg = argv[cursor++];
          }

          if (re.not_type.test(ph.type) && re.not_primitive.test(ph.type) && arg instanceof Function) {
            arg = arg();
          }

          if (re.numeric_arg.test(ph.type) && typeof arg !== 'number' && isNaN(arg)) {
            throw new TypeError(sprintf('[sprintf] expecting number but found %T', arg));
          }

          if (re.number.test(ph.type)) {
            is_positive = arg >= 0;
          }

          switch (ph.type) {
            case 'b':
              arg = parseInt(arg, 10).toString(2);
              break;

            case 'c':
              arg = String.fromCharCode(parseInt(arg, 10));
              break;

            case 'd':
            case 'i':
              arg = parseInt(arg, 10);
              break;

            case 'j':
              arg = JSON.stringify(arg, null, ph.width ? parseInt(ph.width) : 0);
              break;

            case 'e':
              arg = ph.precision ? parseFloat(arg).toExponential(ph.precision) : parseFloat(arg).toExponential();
              break;

            case 'f':
              arg = ph.precision ? parseFloat(arg).toFixed(ph.precision) : parseFloat(arg);
              break;

            case 'g':
              arg = ph.precision ? String(Number(arg.toPrecision(ph.precision))) : parseFloat(arg);
              break;

            case 'o':
              arg = (parseInt(arg, 10) >>> 0).toString(8);
              break;

            case 's':
              arg = String(arg);
              arg = ph.precision ? arg.substring(0, ph.precision) : arg;
              break;

            case 't':
              arg = String(!!arg);
              arg = ph.precision ? arg.substring(0, ph.precision) : arg;
              break;

            case 'T':
              arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
              arg = ph.precision ? arg.substring(0, ph.precision) : arg;
              break;

            case 'u':
              arg = parseInt(arg, 10) >>> 0;
              break;

            case 'v':
              arg = arg.valueOf();
              arg = ph.precision ? arg.substring(0, ph.precision) : arg;
              break;

            case 'x':
              arg = (parseInt(arg, 10) >>> 0).toString(16);
              break;

            case 'X':
              arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase();
              break;
          }

          if (re.json.test(ph.type)) {
            output += arg;
          } else {
            if (re.number.test(ph.type) && (!is_positive || ph.sign)) {
              sign = is_positive ? '+' : '-';
              arg = arg.toString().replace(re.sign, '');
            } else {
              sign = '';
            }

            pad_character = ph.pad_char ? ph.pad_char === '0' ? '0' : ph.pad_char.charAt(1) : ' ';
            pad_length = ph.width - (sign + arg).length;
            pad = ph.width ? pad_length > 0 ? pad_character.repeat(pad_length) : '' : '';
            output += ph.align ? sign + arg + pad : pad_character === '0' ? sign + pad + arg : pad + sign + arg;
          }
        }
      }

      return output;
    }

    var sprintf_cache = Object.create(null);

    function sprintf_parse(fmt) {
      if (sprintf_cache[fmt]) {
        return sprintf_cache[fmt];
      }

      var _fmt = fmt,
          match,
          parse_tree = [],
          arg_names = 0;

      while (_fmt) {
        if ((match = re.text.exec(_fmt)) !== null) {
          parse_tree.push(match[0]);
        } else if ((match = re.modulo.exec(_fmt)) !== null) {
          parse_tree.push('%');
        } else if ((match = re.placeholder.exec(_fmt)) !== null) {
          if (match[2]) {
            arg_names |= 1;
            var field_list = [],
                replacement_field = match[2],
                field_match = [];

            if ((field_match = re.key.exec(replacement_field)) !== null) {
              field_list.push(field_match[1]);

              while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                } else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                } else {
                  throw new SyntaxError('[sprintf] failed to parse named argument key');
                }
              }
            } else {
              throw new SyntaxError('[sprintf] failed to parse named argument key');
            }

            match[2] = field_list;
          } else {
            arg_names |= 2;
          }

          if (arg_names === 3) {
            throw new Error('[sprintf] mixing positional and named placeholders is not (yet) supported');
          }

          parse_tree.push({
            placeholder: match[0],
            param_no: match[1],
            keys: match[2],
            sign: match[3],
            pad_char: match[4],
            align: match[5],
            width: match[6],
            precision: match[7],
            type: match[8]
          });
        } else {
          throw new SyntaxError('[sprintf] unexpected placeholder');
        }

        _fmt = _fmt.substring(match[0].length);
      }

      return sprintf_cache[fmt] = parse_tree;
    }
    /**
     * export to either browser or node.js
     */

    /* eslint-disable quote-props */


    {
      exports['sprintf'] = sprintf;
      exports['vsprintf'] = vsprintf;
    }

    if (typeof window !== 'undefined') {
      window['sprintf'] = sprintf;
      window['vsprintf'] = vsprintf;
    }
    /* eslint-enable quote-props */

  }(); // eslint-disable-line
});
var _sprintf = sprintf$1.sprintf; //----------------------------------------------------------------------
// Templating for Error, Warning and Pass buttons.
//----------------------------------------------------------------------

function Sa11yAnnotate(type, content) {
  var _CSSName;

  var inline = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  ValidTypes = new Set([sa11yError, sa11yWarning, sa11yGood]);
  CSSName = (_CSSName = {}, _defineProperty(_CSSName, sa11yError, "error"), _defineProperty(_CSSName, sa11yWarning, "warning"), _defineProperty(_CSSName, sa11yGood, "good"), _CSSName); // TODO: Discuss Throwing Errors.

  if (!ValidTypes.has(type)) {
    throw Error;
  } // Check if content is a function


  if (content && {}.toString.call(content) === "[object Function]") {
    // if it is, call it and get the value.
    content = content();
  }

  return "\n        <div class=".concat(inline ? "sa11y-instance-inline" : "sa11y-instance", ">\n            <button\n            type=\"button\"   \n            aria-label=\"").concat([type], "\" \n            class=\"sa11y-btn\n            sa11y-").concat(CSSName[type], "-btn").concat(inline ? "-text" : "", "\" \n            data-tippy-content=\"<div lang='").concat(sa11yLangCode, "'>\n                <div class='sa11y-header-text'>").concat([type], "\n                </div>\n                ").concat(content, " \n            </div>\n        \"> \n        </button>\n        </div>");
}

var Joomla = Joomla || {};

(function (window, document, Joomla) {
  var Sa11y = {
    langCode: 'en',
    langStrings: {},
    addI18n: function addI18n(code, strings) {
      Sa11y.langCode = code;
      Sa11y.langStrings = strings;
    },
    _: function _(string) {
      return Sa11y.translate(string);
    },
    sprintf: function sprintf(string) {
      var transString = Sa11y._(string);

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return _sprintf.apply(void 0, [transString].concat(args));
    },
    translate: function translate(string) {
      return Sa11y.langStrings[string] || string;
    },
    // Templating for full-width banners.
    annotateBanner: function annotateBanner(type, content) {
      var _CSSName2;

      ValidTypes = new Set([sa11yError, sa11yWarning, sa11yGood]);
      CSSName = (_CSSName2 = {}, _defineProperty(_CSSName2, sa11yError, "error"), _defineProperty(_CSSName2, sa11yWarning, "warning"), _defineProperty(_CSSName2, sa11yGood, "good"), _CSSName2); // TODO: Discuss Throwing Errors.

      if (!ValidTypes.has(type)) {
        throw Error;
      } // Check if content is a function


      if (content && {}.toString.call(content) === "[object Function]") {
        // if it is, call it and get the value.
        content = content();
      }

      return "<div class=\"sa11y-instance sa11y-".concat(CSSName[type], "-message-container\">\n            <div role=\"region\" aria-label=\"").concat([type], "\" class=\"sa11y-").concat(CSSName[type], "-message\" lang=\"").concat(sa11yLangCode, "\">\n                ").concat(content, "\n            </div>\n        </div>");
    }
  };

  if (Joomla && Joomla.Text && Joomla.Text._) {
    Sa11y.translate = Joomla.Text._;
  }

  window.Sa11y = Sa11y;
})(window, document, Joomla); //Encapsulate jQuery to avoid conflicts.


(function ($) {
  var Sa11yLang = window.Sa11y;

  var Sa11y = function Sa11y() {
    var _this = this;

    _classCallCheck(this, Sa11y);

    _defineProperty(this, "sa11yMainToggle", function () {
      //Keeps checker active when navigating between pages until it is toggled off.
      var sa11yToggle = document.getElementById("sa11y-toggle");
      sa11yToggle.addEventListener('click', function (e) {
        if (localStorage.getItem("sa11y-remember-panel") === "Opened") {
          localStorage.setItem("sa11y-remember-panel", "Closed");
          sa11yToggle.classList.remove("sa11y-on");
          sa11yToggle.setAttribute("aria-expanded", "false");

          _this.resetAll();

          _this.updateBadge();

          e.preventDefault();
        } else {
          localStorage.setItem("sa11y-remember-panel", "Opened");
          sa11yToggle.classList.add("sa11y-on");
          sa11yToggle.setAttribute("aria-expanded", "true");

          _this.checkAll(); //Don't show badge when panel is opened.


          document.getElementById("sa11y-notification-badge").style.display = 'none';
          e.preventDefault();
        }
      }); //Remember to leave it open

      if (localStorage.getItem("sa11y-remember-panel") === "Opened") {
        sa11yToggle.classList.add("sa11y-on");
        sa11yToggle.setAttribute("aria-expanded", "true");
      } //Crudely give a little time to load any other content or slow post-rendered JS, iFrames, etc.


      if (sa11yToggle.classList.contains("sa11y-on")) {
        sa11yToggle.classList.toggle("loading-sa11y");
        sa11yToggle.setAttribute("aria-expanded", "true");
        setTimeout(_this.checkAll, 800);
      } //Escape key to shutdown.


      document.onkeydown = function (evt) {
        evt = evt || window.event;
        var isEscape = false;

        if ("key" in evt) {
          isEscape = evt.key === "Escape" || evt.key === "Esc";
        } else {
          isEscape = evt.keyCode === 27;
        }

        if (isEscape && document.getElementById("sa11y-panel").classList.contains("sa11y-active")) {
          tippy.hideAll();
          sa11yToggle.setAttribute("aria-expanded", "false");
          sa11yToggle.classList.remove("sa11y-on");
          sa11yToggle.click();
          this.resetAll();
        }
      };
    });

    _defineProperty(this, "loadGlobals", function () {
      // Look for a content container
      if (typeof sa11yCheckRoot !== "string" || $(sa11yCheckRoot).length === 0) {
        sa11yCheckRoot = "body";
      } // Readability


      if (typeof sa11yReadabilityRoot !== "string" || $(sa11yReadabilityRoot).length === 0) {
        sa11yReadabilityRoot = "body";
      } // Combine default and custom ignores.


      var separator = ", "; // Ignore specific classes within links.

      if (sa11yLinkIgnoreSpan.length > 0) {
        var sa11yLinkIgnoreSpanSelectors = sa11yLinkIgnoreSpan.split(",");
        sa11yLinkIgnoreSpan = "noscript" + separator + sa11yLinkIgnoreSpanSelectors.join();
      } else {
        sa11yLinkIgnoreSpan = "noscript";
      } // Container ignores apply to self and children.


      if (sa11yContainerIgnore.length > 0) {
        var containerSelectors = sa11yContainerIgnore.split(",");

        for (var i = 0; i < containerSelectors.length; i++) {
          containerSelectors[i] = containerSelectors[i] + " *, " + containerSelectors[i];
        }

        sa11yContainerIgnore = "[aria-hidden='true'], #sa11y-container *, .sa11y-instance *" + separator + containerSelectors.join();
      } else {
        sa11yContainerIgnore = "[aria-hidden='true'], #sa11y-container *, .sa11y-instance *";
      }

      _this.containerIgnore = sa11yContainerIgnore; // Images ignore defaults plus presentation role.

      if (sa11yImageIgnore.length > 1) {
        sa11yImageIgnore += separator;
      }

      _this.imageIgnore = sa11yImageIgnore + _this.containerIgnore + separator + "[role='presentation'], [src^='https://trck.youvisit.com']";
      _this.headerIgnore = sa11yHeaderIgnore; // Links ignore defaults plus sa11y links.

      if (sa11yLinkIgnore.length > 0) {
        sa11yLinkIgnore += separator;
      }

      _this.linkIgnore = sa11yLinkIgnore + sa11yContainerIgnore + separator + "[aria-hidden='true'], .anchorjs-link";

      if (sa11yHeaderIgnore.length > 0) {
        _this.headerIgnore += separator + sa11yContainerIgnore;
      } else {
        _this.headerIgnore = sa11yContainerIgnore;
      }
    });

    _defineProperty(this, "sanitizeHTMLandComputeARIA", function () {
      //Helper: Help clean up HTML characters for tooltips and outline panel.
      _this.sanitizeForHTML = function (string) {
        var entityMap = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
          "/": "&#x2F;",
          "`": "&#x60;",
          "=": "&#x3D;"
        };
        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
          return entityMap[s];
        });
      }; //Mini ignore function.


      $.fn.ignore = function (sel) {
        return this.clone().find(sel || ">*").remove().end();
      }; //Helper: Compute alt text on images within a text node.


      _this.computeTextNodeWithImage = function ($el) {
        var returnText = ""; //No image, has text.

        if ($el.find("img").length === 0 && $el.text().trim().length > 1) {
          returnText = $el.text().trim();
        } //Has image, no text.
        else if ($el.find("img").length && $el.text().trim().length === 0) {
          var imgalt = $el.find("img").attr("alt");

          if (imgalt == undefined || imgalt == " " || imgalt == "") {
            returnText = " ";
          } else if ($el.find("img").attr("alt") !== undefined) {
            returnText = imgalt;
          }
        } //Has image and text. 
        //To-do: This is a hack? Any way to do this better?
        else if ($el.find("img").length && $el.text().trim().length) {
          $el.find("img").each(function () {
            $(this).clone().insertAfter($(this)).replaceWith(" <span class='sa11y-clone-image-text' aria-hidden='true'>" + $(this).attr('alt') + "</span> ");
          });
          returnText = $el.text().trim();
        }

        return returnText;
      }; //Helper: Handle ARIA labels for Link Text module.


      _this.computeAriaLabel = function ($el) {
        if ($el.is("[aria-label]")) {
          return $el.attr("aria-label");
        } else if ($el.is("[aria-labelledby]")) {
          var target = $el.attr("aria-labelledby").split(/\s+/);

          if (target.length > 0) {
            var returnText = "";
            $.each($(target), function (i, el) {
              returnText += $("#" + el).ignore("span.sa11y-heading-label").text() + " ";
            });
            return returnText;
          } else {
            return "";
          }
        } //Children of element.
        else if ($el.children().is("[aria-label]")) {
          return $el.children().attr("aria-label");
        } else if ($el.children().is("[title]")) {
          return $el.children().attr("title");
        } else if ($el.children().is("[aria-labelledby]")) {
          var _target = $el.children().attr("aria-labelledby").split(/\s+/);

          if (_target.length > 0) {
            var _returnText = "";
            $.each($(_target), function (i, el) {
              _returnText += $("#" + el).ignore("span.sa11y-heading-label").text() + " ";
            });
            return _returnText;
          } else {
            return "";
          }
        } else {
          return "noAria";
        }
      };
    });

    _defineProperty(this, "settingPanelToggles", function () {
      //Toggle: Contrast
      var $sa11yContrastCheck = document.getElementById("sa11y-contrast-toggle");
      $sa11yContrastCheck.onclick = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(localStorage.getItem("sa11y-remember-contrast") === "On")) {
                  _context.next = 9;
                  break;
                }

                localStorage.setItem("sa11y-remember-contrast", "Off");
                $sa11yContrastCheck.textContent = "".concat(sa11yOff);
                $sa11yContrastCheck.setAttribute("aria-pressed", "false");

                _this.resetAll(false);

                _context.next = 7;
                return _this.checkAll();

              case 7:
                _context.next = 15;
                break;

              case 9:
                localStorage.setItem("sa11y-remember-contrast", "On");
                $sa11yContrastCheck.textContent = "".concat(sa11yOn);
                $sa11yContrastCheck.setAttribute("aria-pressed", "true");

                _this.resetAll(false);

                _context.next = 15;
                return _this.checkAll();

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      })); //Toggle: Form labels

      var $sa11yLabelsCheck = document.getElementById("sa11y-labels-toggle");
      $sa11yLabelsCheck.onclick = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(localStorage.getItem("sa11y-remember-labels") === "On")) {
                  _context2.next = 9;
                  break;
                }

                localStorage.setItem("sa11y-remember-labels", "Off");
                $sa11yLabelsCheck.textContent = "".concat(sa11yOff);
                $sa11yLabelsCheck.setAttribute("aria-pressed", "false");

                _this.resetAll(false);

                _context2.next = 7;
                return _this.checkAll();

              case 7:
                _context2.next = 15;
                break;

              case 9:
                localStorage.setItem("sa11y-remember-labels", "On");
                $sa11yLabelsCheck.textContent = "".concat(sa11yOn);
                $sa11yLabelsCheck.setAttribute("aria-pressed", "true");

                _this.resetAll(false);

                _context2.next = 15;
                return _this.checkAll();

              case 15:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      })); //Toggle: Links (Advanced)

      var $sa11yChangeRequestCheck = document.getElementById("sa11y-links-advanced-toggle");
      $sa11yChangeRequestCheck.onclick = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(localStorage.getItem("sa11y-remember-links-advanced") === "On")) {
                  _context3.next = 9;
                  break;
                }

                localStorage.setItem("sa11y-remember-links-advanced", "Off");
                $sa11yChangeRequestCheck.textContent = "".concat(sa11yOff);
                $sa11yChangeRequestCheck.setAttribute("aria-pressed", "false");

                _this.resetAll(false);

                _context3.next = 7;
                return _this.checkAll();

              case 7:
                _context3.next = 15;
                break;

              case 9:
                localStorage.setItem("sa11y-remember-links-advanced", "On");
                $sa11yChangeRequestCheck.textContent = "".concat(sa11yOn);
                $sa11yChangeRequestCheck.setAttribute("aria-pressed", "true");

                _this.resetAll(false);

                _context3.next = 15;
                return _this.checkAll();

              case 15:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      })); //Toggle: Readability

      var $sa11yReadabilityCheck = document.getElementById("sa11y-readability-toggle");
      $sa11yReadabilityCheck.onclick = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(localStorage.getItem("sa11y-remember-readability") === "On")) {
                  _context4.next = 10;
                  break;
                }

                localStorage.setItem("sa11y-remember-readability", "Off");
                $sa11yReadabilityCheck.textContent = "".concat(sa11yOff);
                $sa11yReadabilityCheck.setAttribute("aria-pressed", "false");
                document.getElementById("sa11y-readability-panel").classList.remove("sa11y-active");

                _this.resetAll(false);

                _context4.next = 8;
                return _this.checkAll();

              case 8:
                _context4.next = 17;
                break;

              case 10:
                localStorage.setItem("sa11y-remember-readability", "On");
                $sa11yReadabilityCheck.textContent = "".concat(sa11yOn);
                $sa11yReadabilityCheck.setAttribute("aria-pressed", "true");
                document.getElementById("sa11y-readability-panel").classList.add("sa11y-active");

                _this.resetAll(false);

                _context4.next = 17;
                return _this.checkAll();

              case 17:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      if (localStorage.getItem("sa11y-remember-readability") === "On") {
        document.getElementById("sa11y-readability-panel").classList.add("sa11y-active");
      } //Toggle: Dark mode. (Credits: https://derekkedziora.com/blog/dark-mode-revisited)


      var systemInitiatedDark = window.matchMedia("(prefers-color-scheme: dark)");
      var $sa11yTheme = document.getElementById("sa11y-theme-toggle");
      var html = document.querySelector("html");
      var theme = localStorage.getItem("sa11y-remember-theme");

      if (systemInitiatedDark.matches) {
        $sa11yTheme.textContent = "".concat(sa11yOn);
        $sa11yTheme.setAttribute("aria-pressed", "true");
      } else {
        $sa11yTheme.textContent = "".concat(sa11yOff);
        $sa11yTheme.setAttribute("aria-pressed", "false");
      }

      function prefersColorTest(systemInitiatedDark) {
        if (systemInitiatedDark.matches) {
          html.setAttribute("data-sa11y-theme", "dark");
          $sa11yTheme.textContent = "".concat(sa11yOn);
          $sa11yTheme.setAttribute("aria-pressed", "true");
          localStorage.setItem("sa11y-remember-theme", "");
        } else {
          html.setAttribute("data-sa11y-theme", "light");
          $sa11yTheme.textContent = "".concat(sa11yOff);
          $sa11yTheme.setAttribute("aria-pressed", "false");
          localStorage.setItem("sa11y-remember-theme", "");
        }
      }

      systemInitiatedDark.addListener(prefersColorTest);
      $sa11yTheme.onclick = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var theme;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                theme = localStorage.getItem("sa11y-remember-theme");

                if (theme === "dark") {
                  html.setAttribute("data-sa11y-theme", "light");
                  localStorage.setItem("sa11y-remember-theme", "light");
                  $sa11yTheme.textContent = "".concat(sa11yOff);
                  $sa11yTheme.setAttribute("aria-pressed", "false");
                } else if (theme === "light") {
                  html.setAttribute("data-sa11y-theme", "dark");
                  localStorage.setItem("sa11y-remember-theme", "dark");
                  $sa11yTheme.textContent = "".concat(sa11yOn);
                  $sa11yTheme.setAttribute("aria-pressed", "true");
                } else if (systemInitiatedDark.matches) {
                  html.setAttribute("data-sa11y-theme", "light");
                  localStorage.setItem("sa11y-remember-theme", "light");
                  $sa11yTheme.textContent = "".concat(sa11yOff);
                  $sa11yTheme.setAttribute("aria-pressed", "false");
                } else {
                  html.setAttribute("data-sa11y-theme", "dark");
                  localStorage.setItem("sa11y-remember-theme", "dark");
                  $sa11yTheme.textContent = "".concat(sa11yOn);
                  $sa11yTheme.setAttribute("aria-pressed", "true");
                }

              case 2:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      if (theme === "dark") {
        html.setAttribute("data-sa11y-theme", "dark");
        localStorage.setItem("sa11y-remember-theme", "dark");
        $sa11yTheme.textContent = "".concat(sa11yOn);
        $sa11yTheme.setAttribute("aria-pressed", "true");
      } else if (theme === "light") {
        html.setAttribute("data-sa11y-theme", "light");
        localStorage.setItem("sa11y-remember-theme", "light");
        $sa11yTheme.textContent = "".concat(sa11yOff);
        $sa11yTheme.setAttribute("aria-pressed", "false");
      }
    });

    _defineProperty(this, "initializeJumpToIssueTooltip", function () {
      tippy('#sa11y-cycle-toggle', {
        content: "<div style=\"text-align:center\">".concat(sa11yShortcutTooltip, " &raquo;<br><span class=\"sa11y-shortcut-icon\"></span></div>"),
        allowHTML: true,
        delay: [900, 0],
        trigger: "mouseenter focusin",
        arrow: true,
        placement: 'top',
        theme: "sa11y-theme",
        aria: {
          content: null,
          expanded: false
        },
        appendTo: document.body
      });
    });

    _defineProperty(this, "checkAll", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _this.errorCount = 0;
              _this.warningCount = 0;
              _this.root = $(sa11yCheckRoot);
              _this.readabilityRoot = $(sa11yReadabilityRoot);

              _this.findElements(); //Ruleset checks


              _this.checkHeaders();

              _this.checkLinkText();

              _this.checkAltText();

              if (localStorage.getItem("sa11y-remember-contrast") === "On") {
                _this.checkContrast();
              }

              if (localStorage.getItem("sa11y-remember-labels") === "On") {
                _this.checkLabels();
              }

              if (localStorage.getItem("sa11y-remember-links-advanced") === "On") {
                _this.checkLinksAdvanced();
              }

              if (localStorage.getItem("sa11y-remember-readability") === "On") {
                _this.checkReadability();
              }

              _this.checkEmbeddedContent();

              _this.checkQA(); //Update panel


              if (_this.panelActive) {
                _this.resetAll();
              } else {
                _this.updatePanel();
              }

              _this.initializeTooltips();

              _this.detectOverflow(); //Don't show badge when panel is opened.


              if (document.getElementsByClassName("sa11y-on").length == 0) {
                _this.updateBadge();
              }

            case 18:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    })));

    _defineProperty(this, "resetAll", function () {
      var restartPanel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      _this.panelActive = false;

      _this.clearEverything(); //Remove eventListeners on the Show Outline and Show Panel toggles.


      var $outlineToggle = document.getElementById("sa11y-outline-toggle");
      var resetOutline = $outlineToggle.cloneNode(true);
      $outlineToggle.parentNode.replaceChild(resetOutline, $outlineToggle);
      var $settingsToggle = document.getElementById("sa11y-settings-toggle");
      var resetSettings = $settingsToggle.cloneNode(true);
      $settingsToggle.parentNode.replaceChild(resetSettings, $settingsToggle); //Errors

      document.querySelectorAll('.sa11y-error-border').forEach(function (el) {
        return el.classList.remove('sa11y-error-border');
      });
      document.querySelectorAll('.sa11y-error-heading').forEach(function (el) {
        return el.classList.remove('sa11y-error-heading');
      });
      document.querySelectorAll('.sa11y-error-text').forEach(function (el) {
        return el.classList.remove('sa11y-error-text');
      }); //Warnings

      document.querySelectorAll('.sa11y-warning-border').forEach(function (el) {
        return el.classList.remove('sa11y-warning-border');
      });
      document.querySelectorAll('.sa11y-warning-text').forEach(function (el) {
        return el.classList.remove('sa11y-warning-text');
      });
      document.querySelectorAll('p').forEach(function (el) {
        return el.classList.remove('sa11y-fake-list');
      });
      var allcaps = document.querySelectorAll('.sa11y-warning-uppercase');
      allcaps.forEach(function (el) {
        return el.outerHTML = el.innerHTML;
      }); //Good

      document.querySelectorAll('.sa11y-good-border').forEach(function (el) {
        return el.classList.remove('sa11y-good-border');
      });
      document.querySelectorAll('.sa11y-good-text').forEach(function (el) {
        return el.classList.remove('sa11y-good-text');
      }); //Remove

      document.querySelectorAll("\n                .sa11y-instance,\n                .sa11y-instance-inline,\n                .sa11y-heading-label,\n                #sa11y-outline-list li,\n                .sa11y-readability-period,\n                #sa11y-readability-info span,\n                #sa11y-readability-details li,\n                .sa11y-clone-image-text\n            ").forEach(function (el) {
        return el.parentNode.removeChild(el);
      }); //Etc

      document.querySelectorAll('.sa11y-overflow').forEach(function (el) {
        return el.classList.remove('sa11y-overflow');
      });
      document.querySelectorAll('.sa11y-fake-heading').forEach(function (el) {
        return el.classList.remove('sa11y-fake-heading');
      });
      document.querySelectorAll('.sa11y-pulse-border').forEach(function (el) {
        return el.classList.remove('sa11y-pulse-border');
      });
      document.querySelector('#sa11y-panel-alert').classList.remove("sa11y-active");
      var empty = document.querySelector('#sa11y-panel-alert-text');

      while (empty.firstChild) {
        empty.removeChild(empty.firstChild);
      }

      var clearStatus = document.querySelector('#sa11y-status');

      while (clearStatus.firstChild) {
        clearStatus.removeChild(clearStatus.firstChild);
      }

      if (restartPanel) {
        document.querySelector('#sa11y-panel').classList.remove("sa11y-active");
      }
    });

    _defineProperty(this, "clearEverything", function () {});

    _defineProperty(this, "initializeTooltips", function () {
      tippy(".sa11y-btn", {
        interactive: true,
        trigger: "mouseenter click focusin",
        //Focusin trigger to ensure "Jump to issue" button displays tooltip.
        arrow: true,
        delay: [200, 0],
        //Slight delay to ensure mouse doesn't quickly trigger and hide tooltip.
        theme: "sa11y-theme",
        placement: 'bottom',
        allowHTML: true,
        aria: {
          content: 'describedby'
        },
        appendTo: document.body
      });
    });

    _defineProperty(this, "detectOverflow", function () {
      var findParentWithOverflow = function findParentWithOverflow($el, property, value) {
        while ($el !== null) {
          var style = window.getComputedStyle($el);
          var propValue = style.getPropertyValue(property);

          if (propValue === value) {
            return $el;
          }

          $el = $el.parentElement;
        }

        return null;
      };

      var $findButtons = document.querySelectorAll('.sa11y-btn');
      $findButtons.forEach(function ($el) {
        var overflowing = findParentWithOverflow($el, 'overflow', 'hidden');

        if (overflowing !== null) {
          overflowing.classList.add('sa11y-overflow');
        }
      });
    });

    _defineProperty(this, "updateBadge", function () {
      var totalCount = _this.errorCount + _this.warningCount;
      var warningCount = _this.warningCount;
      var notifBadge = document.getElementById("sa11y-notification-badge");

      if (totalCount === 0) {
        notifBadge.style.display = "none";
      } else if (_this.warningCount > 0 && _this.errorCount === 0) {
        notifBadge.style.display = "flex";
        notifBadge.classList.add("sa11y-notification-badge-warning");
        document.getElementById('sa11y-notification-count').innerHTML = "".concat(sa11yPanelStatus["status10"](warningCount));
      } else {
        notifBadge.style.display = "flex";
        notifBadge.classList.remove("sa11y-notification-badge-warning");
        document.getElementById('sa11y-notification-count').innerHTML = "".concat(sa11yPanelStatus["status11"](totalCount));
      }
    });

    _defineProperty(this, "updatePanel", function () {
      _this.panelActive = true;
      var totalCount = _this.errorCount + _this.warningCount;
      var warningCount = _this.warningCount;
      var errorCount = _this.errorCount;

      _this.buildPanel();

      _this.skipToIssue();

      var $sa11ySkipBtn = document.getElementById("sa11y-cycle-toggle");
      $sa11ySkipBtn.disabled = false;
      $sa11ySkipBtn.setAttribute("style", "cursor: pointer !important;");
      var $sa11yPanel = document.getElementById("sa11y-panel");
      $sa11yPanel.classList.add("sa11y-active");
      var $panelContent = document.getElementById("sa11y-panel-content");
      var $sa11yStatus = document.getElementById("sa11y-status");
      var $findButtons = document.querySelectorAll('.sa11y-btn');

      if (_this.errorCount === 1 && _this.warningCount === 1) {
        $panelContent.setAttribute("class", "sa11y-errors");
        $sa11yStatus.textContent = "".concat(sa11yPanelStatus["status1"]);
      } else if (_this.errorCount === 1 && _this.warningCount > 0) {
        $panelContent.setAttribute("class", "sa11y-errors");
        $sa11yStatus.textContent = "".concat(sa11yPanelStatus["status2"](warningCount));
      } else if (_this.errorCount > 0 && _this.warningCount === 1) {
        $panelContent.setAttribute("class", "sa11y-errors");
        $sa11yStatus.textContent = "".concat(sa11yPanelStatus["status3"](errorCount));
      } else if (_this.errorCount > 0 && _this.warningCount > 0) {
        $panelContent.setAttribute("class", "sa11y-errors");
        $sa11yStatus.textContent = "".concat(sa11yPanelStatus["status4"](errorCount, warningCount));
      } else if (_this.errorCount > 0) {
        $panelContent.setAttribute("class", "sa11y-errors");
        $sa11yStatus.textContent = "".concat(_this.errorCount === 1 ? sa11yPanelStatus["status5"] : sa11yPanelStatus["status6"](errorCount));
      } else if (_this.warningCount > 0) {
        $panelContent.setAttribute("class", "sa11y-warnings");
        $sa11yStatus.textContent = "".concat(totalCount === 1 ? sa11yPanelStatus["status7"] : sa11yPanelStatus["status8"](warningCount));
      } else {
        $panelContent.setAttribute("class", "sa11y-good");
        $sa11yStatus.textContent = "".concat(sa11yPanelStatus["status9"]);

        if ($findButtons.length === 0) {
          $sa11ySkipBtn.disabled = true;
          $sa11ySkipBtn.setAttribute("style", "cursor: default !important;");
        }
      }
    });

    _defineProperty(this, "buildPanel", function () {
      var $outlineToggle = document.getElementById("sa11y-outline-toggle");
      var $outlinePanel = document.getElementById("sa11y-outline-panel");
      var $outlineList = document.getElementById("sa11y-outline-list");
      var $settingsToggle = document.getElementById("sa11y-settings-toggle");
      var $settingsPanel = document.getElementById("sa11y-settings-panel");
      var $settingsContent = document.getElementById("sa11y-settings-content");
      var $headingAnnotations = document.querySelectorAll(".sa11y-heading-label"); //Show outline panel

      $outlineToggle.addEventListener('click', function (e) {
        if ($outlineToggle.getAttribute("aria-expanded") == "true") {
          $outlineToggle.classList.remove("sa11y-outline-active");
          $outlinePanel.classList.remove("sa11y-active");
          $outlineToggle.textContent = "".concat(sa11yShowOutline);
          $outlineToggle.setAttribute("aria-expanded", "false");
          localStorage.setItem("sa11y-remember-outline", "Closed");
        } else {
          $outlineToggle.classList.add("sa11y-outline-active");
          $outlinePanel.classList.add("sa11y-active");
          $outlineToggle.textContent = "".concat(sa11yHideOutline);
          $outlineToggle.setAttribute("aria-expanded", "true");
          localStorage.setItem("sa11y-remember-outline", "Opened");
        } //Set focus on Page Outline heading for accessibility.


        document.querySelector("#sa11y-outline-header > h2").focus(); //Show heading level annotations.

        $headingAnnotations.forEach(function ($el) {
          return $el.classList.toggle("sa11y-label-visible");
        }); //Close Settings panel when Show Outline is active.

        $settingsPanel.classList.remove("sa11y-active");
        $settingsToggle.classList.remove("sa11y-settings-active");
        $settingsToggle.setAttribute("aria-expanded", "false");
        $settingsToggle.textContent = "".concat(sa11yShowSettings); //Keyboard accessibility fix for scrollable panel content.

        if ($outlineList.clientHeight > 250) {
          $outlineList.setAttribute("tabindex", "0");
        }
      }); //Remember to leave outline open

      if (localStorage.getItem("sa11y-remember-outline") === "Opened") {
        $outlineToggle.classList.add("sa11y-outline-active");
        $outlinePanel.classList.add("sa11y-active");
        $outlineToggle.textContent = "".concat(sa11yHideOutline);
        $outlineToggle.setAttribute("aria-expanded", "true");
        $headingAnnotations.forEach(function ($el) {
          return $el.classList.toggle("sa11y-label-visible");
        }); //Keyboard accessibility fix for scrollable panel content.

        if ($outlineList.clientHeight > 250) {
          $outlineList.setAttribute("tabindex", "0");
        }
      } //Show settings panel


      $settingsToggle.addEventListener('click', function (e) {
        if ($settingsToggle.getAttribute("aria-expanded") === "true") {
          $settingsToggle.classList.remove("sa11y-settings-active");
          $settingsPanel.classList.remove("sa11y-active");
          $settingsToggle.textContent = "".concat(sa11yShowSettings);
          $settingsToggle.setAttribute("aria-expanded", "false");
        } else {
          $settingsToggle.classList.add("sa11y-settings-active");
          $settingsPanel.classList.add("sa11y-active");
          $settingsToggle.textContent = "".concat(sa11yHideSettings);
          $settingsToggle.setAttribute("aria-expanded", "true");
        } //Set focus on Settings heading for accessibility.


        document.querySelector("#sa11y-settings-header > h2").focus(); //Close Show Outline panel when Settings is active.

        $outlinePanel.classList.remove("sa11y-active");
        $outlineToggle.classList.remove("sa11y-outline-active");
        $outlineToggle.setAttribute("aria-expanded", "false");
        $outlineToggle.textContent = "".concat(sa11yShowOutline);
        $headingAnnotations.forEach(function ($el) {
          return $el.classList.remove("sa11y-label-visible");
        });
        localStorage.setItem("sa11y-remember-outline", "Closed"); //Keyboard accessibility fix for scrollable panel content.

        if ($settingsContent.clientHeight > 350) {
          $settingsContent.setAttribute("tabindex", "0");
        }
      }); //Enhanced keyboard accessibility for panel.

      document.getElementById('sa11y-panel-controls').addEventListener('keydown', function (e) {
        var $tab = document.querySelectorAll('#sa11y-outline-toggle[role=tab], #sa11y-settings-toggle[role=tab]');

        if (e.key === 'ArrowRight') {
          for (var i = 0; i < $tab.length; i++) {
            if ($tab[i].getAttribute('aria-expanded') === "true" || $tab[i].getAttribute('aria-expanded') === "false") {
              $tab[i + 1].focus();
              e.preventDefault();
              break;
            }
          }
        }

        if (e.key === 'ArrowDown') {
          for (var _i2 = 0; _i2 < $tab.length; _i2++) {
            if ($tab[_i2].getAttribute('aria-expanded') === "true" || $tab[_i2].getAttribute('aria-expanded') === "false") {
              $tab[_i2 + 1].focus();

              e.preventDefault();
              break;
            }
          }
        }

        if (e.key === 'ArrowLeft') {
          for (var _i3 = $tab.length - 1; _i3 > 0; _i3--) {
            if ($tab[_i3].getAttribute('aria-expanded') === "true" || $tab[_i3].getAttribute('aria-expanded') === "false") {
              $tab[_i3 - 1].focus();

              e.preventDefault();
              break;
            }
          }
        }

        if (e.key === 'ArrowUp') {
          for (var _i4 = $tab.length - 1; _i4 > 0; _i4--) {
            if ($tab[_i4].getAttribute('aria-expanded') === "true" || $tab[_i4].getAttribute('aria-expanded') === "false") {
              $tab[_i4 - 1].focus();

              e.preventDefault();
              break;
            }
          }
        }
      });
      var $closeAlertToggle = document.getElementById("sa11y-close-alert");
      var $alertPanel = document.getElementById("sa11y-panel-alert");
      var $alertText = document.getElementById("sa11y-panel-alert-text");
      var $sa11ySkipBtn = document.getElementById("sa11y-cycle-toggle");
      $closeAlertToggle.addEventListener('click', function () {
        $alertPanel.classList.remove("sa11y-active");

        while ($alertText.firstChild) {
          $alertText.removeChild($alertText.firstChild);
        }

        document.querySelectorAll('.sa11y-pulse-border').forEach(function (el) {
          return el.classList.remove('sa11y-pulse-border');
        });
        $sa11ySkipBtn.focus();
      });
    });

    _defineProperty(this, "skipToIssue", function () {
      /* Polyfill for scrollTo. scrollTo instead of .animate(), so Sa11y could use jQuery slim build. Credit: https://stackoverflow.com/a/67108752 & https://github.com/iamdustan/smoothscroll */
      var reducedMotionQuery = false;
      var scrollBehavior = "smooth";

      if (!('scrollBehavior' in document.documentElement.style)) {
        var js = document.createElement('script');
        js.src = "https://cdn.jsdelivr.net/npm/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js";
        document.head.appendChild(js);
      }

      if (!document.documentMode) {
        if (typeof window.matchMedia === "function") {
          reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        }

        if (!reducedMotionQuery || reducedMotionQuery.matches) {
          scrollBehavior = "auto";
        }
      }

      var sa11yBtnLocation = 0;
      var findSa11yBtn = $(".sa11y-btn").length; //Jump to issue using keyboard shortcut.

      document.onkeyup = function (e) {
        if (e.altKey && e.code == "Period") {
          skipToIssueToggle();
          e.preventDefault();
        }
      }; //Jump to issue using click.


      var $skipToggle = document.getElementById("sa11y-cycle-toggle");
      $skipToggle.addEventListener('click', function (e) {
        skipToIssueToggle();
        e.preventDefault();
      });

      var skipToIssueToggle = function skipToIssueToggle() {
        //Calculate location of both visible and hidden buttons.
        var $findButtons = document.querySelectorAll('.sa11y-btn');
        /* To-do: Convert rest of Skip-to-issue button to vanilla Js.
        const findVisibleParent = ($el, property, value) => {
            while($el !== null) {
                const style = window.getComputedStyle($el);
                const propValue = style.getPropertyValue(property);
                        if (propValue === value) {
                            return $el;
                        }
                    $el = $el.parentElement;
                }
                return null;
            };
        
        let test;
        $findButtons.forEach(function ($el) {
            const overflowing = findVisibleParent($el, 'display', 'none');
            if (overflowing !== null) {
                test = overflowing.previousElementSibling;
            }       
        });
        console.log(test) */

        var visiblePosition = $(".sa11y-btn").eq(sa11yBtnLocation).closest(":visible").offset().top - 50;
        var hiddenPosition = $findButtons[sa11yBtnLocation].offsetTop; //let hiddenPosition = $(".sa11y-btn").eq(sa11yBtnLocation).offset().top;

        if (visiblePosition >= 1) {
          setTimeout(function () {
            window.scrollTo({
              top: visiblePosition,
              behavior: scrollBehavior
            });
          }, 1);
          $(".sa11y-btn:hidden").each(function () {
            $(this).parent().closest(":visible").addClass("sa11y-pulse-border");
          });
          $findButtons[sa11yBtnLocation].focus();
        } else {
          $findButtons[sa11yBtnLocation].focus();
        }

        var $alertPanel = document.getElementById("sa11y-panel-alert");
        var $alertText = document.getElementById("sa11y-panel-alert-text");
        var $alertPanelPreview = document.getElementById("sa11y-panel-alert-preview");
        var $closeAlertToggle = document.getElementById("sa11y-close-alert"); //If location is less than 0 = hidden element (e.g. display:none);

        if (hiddenPosition == 0) {
          $alertPanel.classList.add("sa11y-active");
          $alertText.textContent = "".concat(sa11yPanelStatus["notVisibleAlert"]);
          $alertPanelPreview.innerHTML = $findButtons[sa11yBtnLocation].getAttribute('data-tippy-content');
          $closeAlertToggle.focus();
        } else if (hiddenPosition < 1) {
          $alertPanel.classList.remove("sa11y-active");
          document.querySelectorAll('.sa11y-pulse-border').forEach(function (el) {
            return el.classList.remove('sa11y-pulse-border');
          });
        }

        sa11yBtnLocation += 1;

        if (sa11yBtnLocation >= findSa11yBtn) {
          sa11yBtnLocation = 0;
        }
      };
    });

    _defineProperty(this, "findElements", function () {
      var root = _this.root,
          containerIgnore = _this.containerIgnore;
      _this.$p = root.find("p").not(containerIgnore);
      _this.$h = root.find("h1, h2, h3, h4, h5, h6, [role='heading'][aria-level]").not(containerIgnore);
    });

    _defineProperty(this, "checkHeaders", function () {
      var prevLevel;

      _this.$h.each(function (i, el) {
        var $el = $(el);

        var text = _this.computeTextNodeWithImage($el);

        var htext = _this.sanitizeForHTML(text);

        var level;

        if ($el.attr("aria-level")) {
          level = +$el.attr("aria-level");
        } else {
          level = +$el[0].tagName.slice(1);
        }

        var headingLength = $el.text().trim().length;
        var error = null;
        var warning = null;

        if (level - prevLevel > 1 && i !== 0) {
          error = sa11yIM["headings"]["nonConsecutiveHeadingLevel"](prevLevel, level);
        } else if ($el.text().trim().length == 0) {
          if ($el.find("img").length) {
            var imgalt = $el.find("img").attr("alt");

            if (imgalt == undefined || imgalt == " " || imgalt == "") {
              error = sa11yIM["headings"]["emptyHeadingWithImage"](level);
              $el.addClass("sa11y-error-text");
            }
          } else {
            error = sa11yIM["headings"]["emptyHeading"](level);
            $el.addClass("sa11y-error-text");
          }
        } else if (i === 0 && level !== 1 && level !== 2) {
          error = sa11yIM["headings"]["firstHeading"];
        } else if ($el.text().trim().length > 170) {
          warning = sa11yIM["headings"]["longHeading"](headingLength);
        }

        prevLevel = level;
        var li = "<li class='sa11y-outline-".concat(level, "'>\n                <span class='sa11y-badge'>").concat(level, "</span> \n                <span class='sa11y-outline-list-item'>").concat(htext, "</span>\n            </li>");
        var liError = "<li class='sa11y-outline-".concat(level, "'>\n                <span class='sa11y-badge sa11y-error-badge'>\n                <span aria-hidden='true'>&#10007;</span>\n                <span class='sa11y-visually-hidden'>").concat(sa11yError, "</span> ").concat(level, "</span> \n                <span class='sa11y-outline-list-item sa11y-red-text sa11y-bold'>").concat(htext, "</span>\n            </li>");
        var liWarning = "<li class='sa11y-outline-".concat(level, "'>\n                <span class='sa11y-badge sa11y-warning-badge'>\n                <span aria-hidden='true'>&#x3f;</span>\n                <span class='sa11y-visually-hidden'>").concat(sa11yWarning, "</span> ").concat(level, "</span> \n                <span class='sa11y-outline-list-item sa11y-yellow-text sa11y-bold'>").concat(htext, "</span>\n            </li>");

        if ($el.not(sa11yOutlineIgnore).length !== 0) {
          //Append heading labels.
          $el.not(sa11yOutlineIgnore).append("<span class='sa11y-heading-label'>H".concat(level, "</span>")); //Heading errors

          if (error != null && $el.closest("a").length > 0) {
            _this.errorCount++;
            $el.addClass("sa11y-error-heading");
            $el.closest("a").after(Sa11yAnnotate(sa11yError, error, true));
            $("#sa11y-outline-list").append(liError);
          } else if (error != null) {
            _this.errorCount++;
            $el.addClass("sa11y-error-heading");
            $el.before(Sa11yAnnotate(sa11yError, error));
            $("#sa11y-outline-list").append(liError);
          } //Heading warnings
          else if (warning != null && $el.closest("a").length > 0) {
            _this.warningCount++;
            $el.closest("a").after(Sa11yAnnotate(sa11yWarning, warning));
            $("#sa11y-outline-list").append(liWarning);
          } else if (warning != null) {
            _this.warningCount++;
            $el.before(Sa11yAnnotate(sa11yWarning, warning));
            $("#sa11y-outline-list").append(liWarning);
          } //Not an error or warning
          else if (error == null || warning == null) {
            $("#sa11y-outline-list").append(li);
          }
        }
      }); //Check to see there is at least one H1 on the page.


      var $h1 = _this.root.find("h1, [role='heading'][aria-level='1']").not(_this.containerIgnore);

      if ($h1.length === 0) {
        _this.errorCount++;
        $("#sa11y-outline-header").after("<div class='sa11y-instance sa11y-missing-h1'>\n                    <span class='sa11y-badge sa11y-error-badge'><span aria-hidden='true'>&#10007;</span><span class='sa11y-visually-hidden'>".concat(sa11yError, "</span></span> \n                    <span class='sa11y-red-text sa11y-bold'>").concat(sa11yIM["headings"]["missingHeadingOnePanelText"], "</span>\n                </div>"));
        $("#sa11y-container").after(Sa11yLang.annotateBanner(sa11yError, sa11yIM["headings"]["missingHeadingOne"]));
      }
    });

    _defineProperty(this, "checkLinkText", function () {
      var _this2 = this;

      var containsLinkTextStopWords = function containsLinkTextStopWords(textContent) {
        var urlText = ["http", ".asp", ".htm", ".php", ".edu/", ".com/", ".net/", ".org/", ".us/", ".ca/", ".de/", ".icu/", ".uk/", ".ru/", ".info/", ".top/", ".xyz/", ".tk/", ".cn/", ".ga/", ".cf/", ".nl/", ".io/"];
        var hit = [null, null, null]; // Flag partial stop words.

        $.each(sa11yPartialAltStopWords, function (index, word) {
          if (textContent.length === word.length && textContent.toLowerCase().indexOf(word) >= 0) {
            hit[0] = word;
            return false;
          }
        }); // Other warnings we want to add.

        $.each(sa11yWarningAltWords, function (index, word) {
          if (textContent.toLowerCase().indexOf(word) >= 0) {
            hit[1] = word;
            return false;
          }
        }); // Flag link text containing URLs.

        $.each(urlText, function (index, word) {
          if (textContent.toLowerCase().indexOf(word) >= 0) {
            hit[2] = word;
            return false;
          }
        });
        return hit;
      };
      /* Mini function if you need to exclude any text contained with a span. We created this function to ignore automatically appended sr-only text for external links and document filetypes.
        $.fn.ignore = function(sel){
          return this.clone().find(sel||">*").remove().end();
      };
        $el.ignore("span.sr-only").text().trim();
          
      Example: <a href="#">learn more <span class="sr-only">(external)</span></a>
      
      This function will ignore the text "(external)", and correctly flag this link as an error for non descript link text. */


      $.fn.ignore = function (sel) {
        return this.clone().find(sel || ">*").remove().end();
      };

      var $links = this.root.find("a[href]").not(this.linkIgnore);
      var M = sa11yIM["linktext"];
      $links.each(function (i, el) {
        var $el = $(el);

        var linkText = _this2.computeAriaLabel($el);

        var hasAriaLabelledBy = $el.attr("aria-labelledby");
        var hasAriaLabel = $el.attr("aria-label");
        var hasTitle = $el.attr("title");
        var childAriaLabelledBy = $el.children().attr("aria-labelledby");
        var childAriaLabel = $el.children().attr("aria-label");
        var childTitle = $el.children().attr("title");
        var error = containsLinkTextStopWords($el.ignore(sa11yLinkIgnoreSpan).text().trim());

        if (linkText === "noAria") {
          linkText = $el.text();
        } //Flag empty hyperlinks


        if ($el.attr("href") !== undefined && $el.text().trim().length == 0) {
          if ($el.find("img").length) ;else if (hasAriaLabelledBy != null || hasAriaLabel != null) {
            $el.addClass("sa11y-good-border");
            $el.before(Sa11yAnnotate(sa11yGood, M["linkLabel"](linkText), true));
          } else if (hasTitle != null) {
            var _linkText = $el.attr("title");

            $el.addClass("sa11y-good-border");
            $el.before(Sa11yAnnotate(sa11yGood, M["linkLabel"](_linkText), true));
          } else if ($el.children().length) {
            if (childAriaLabelledBy != null || childAriaLabel != null || childTitle != null) {
              $el.addClass("sa11y-good-border");
              $el.before(Sa11yAnnotate(sa11yGood, M["linkLabel"](linkText), true));
            } else {
              _this2.errorCount++;
              $el.addClass("sa11y-error-border");
              $el.after(Sa11yAnnotate(sa11yError, M["emptyLinkNoLabel"], true));
            }
          } else {
            _this2.errorCount++;
            $el.addClass("sa11y-error-border");
            $el.after(Sa11yAnnotate(sa11yError, M["emptyLink"], true));
          }
        } else if (error[0] != null) {
          if (hasAriaLabelledBy != null) {
            $el.before(Sa11yAnnotate(sa11yGood, M["linkLabel"](linkText), true));
          } else if (hasAriaLabel != null) {
            $el.before(Sa11yAnnotate(sa11yGood, M["linkLabel"](hasAriaLabel), true));
          } else if ($el.attr("aria-hidden") == "true" && $el.attr("tabindex") == "-1") ;else {
            _this2.errorCount++;
            $el.addClass("sa11y-error-text");
            $el.after(Sa11yAnnotate(sa11yError, M["linkStopWordMessage"](error[0]), true));
          }
        } else if (error[1] != null) {
          _this2.warningCount++;
          $el.addClass("sa11y-warning-text");
          $el.after(Sa11yAnnotate(sa11yWarning, M["linkBestPractices"](error[1]), true));
        } else if (error[2] != null) {
          if (linkText.length > 40) {
            _this2.warningCount++;
            $el.addClass("sa11y-warning-text");
            $el.after(Sa11yAnnotate(sa11yWarning, M["linkURL"], true));
          }
        }
      });
    });

    _defineProperty(this, "checkLinksAdvanced", function () {
      var M = sa11yIM["linksAdvanced"];

      var $linksTargetBlank = _this.root.find("a[href]").not(_this.linkIgnore).not("#sa11y-container a").not(".sa11y-exclude");

      var seen = {};
      $linksTargetBlank.each(function (i, el) {
        var $el = $(el);

        var linkText = _this.computeAriaLabel($el);

        if (linkText === "noAria") {
          linkText = $el.text();
        }

        var fileTypeMatch = $el.filter("\n                    a[href$='.pdf'], \n                    a[href$='.doc'], \n                    a[href$='.zip'], \n                    a[href$='.mp3'], \n                    a[href$='.txt'], \n                    a[href$='.exe'], \n                    a[href$='.dmg'], \n                    a[href$='.rtf'],\n                    a[href$='.pptx'],\n                    a[href$='.ppt'],\n                    a[href$='.xls'],\n                    a[href$='.xlsx'],\n                    a[href$='.csv'],\n                    a[href$='.mp4'],\n                    a[href$='.mov'],\n                    a[href$='.avi']\n                ").length; //Links with identical accessible names have equivalent purpose.
        //If link has an image, process alt attribute,
        //To-do: Kinda hacky. Doesn't return accessible name of link in correct order.

        var alt = $el.find("img").attr("alt");

        if (alt === undefined) {
          alt = "";
        } //Return link text and image's alt text.


        var linkTextTrimmed = linkText.trim().toLowerCase() + " " + alt;
        var href = $el.attr("href");

        if (seen[linkTextTrimmed] && linkTextTrimmed.length !== 0) {
          if (seen[href]) ;else {
            _this.warningCount++;
            $el.addClass("sa11y-warning-text");
            $el.after(Sa11yAnnotate(sa11yWarning, M["linkIdenticalName"](linkText), true));
          }
        } else {
          seen[linkTextTrimmed] = true;
          seen[href] = true;
        } //New tab or new window.


        var containsNewWindowPhrases = sa11yNewWindowPhrases.some(function (pass) {
          return linkText.toLowerCase().indexOf(pass) >= 0;
        }); //Link that points to a file type indicates that it does.

        var containsFileTypePhrases = sa11yFileTypePhrases.some(function (pass) {
          return linkText.toLowerCase().indexOf(pass) >= 0;
        });

        if ($el.attr("target") === "_blank" && fileTypeMatch === 0 && !containsNewWindowPhrases) {
          _this.warningCount++;
          $el.addClass("sa11y-warning-text");
          $el.after(Sa11yAnnotate(sa11yWarning, M["newTabWarning"], true));
        }

        if (fileTypeMatch === 1 && !containsFileTypePhrases) {
          _this.warningCount++;
          $el.addClass("sa11y-warning-text");
          $el.before(Sa11yAnnotate(sa11yWarning, M["fileTypeWarning"], true));
        }
      });
    });

    _defineProperty(this, "checkAltText", function () {
      _this.containsAltTextStopWords = function (alt) {
        var altUrl = [".png", ".jpg", ".jpeg", ".gif", ".tiff", ".svg"];
        var hit = [null, null, null];
        altUrl.forEach(function (word) {
          if (alt.toLowerCase().indexOf(word) >= 0) {
            hit[0] = word;
          }
        });
        sa11ySuspiciousAltWords.forEach(function (word) {
          if (alt.toLowerCase().indexOf(word) >= 0) {
            hit[1] = word;
          }
        });
        sa11yPlaceholderAltStopWords.forEach(function (word) {
          if (alt.length === word.length && alt.toLowerCase().indexOf(word) >= 0) {
            hit[2] = word;
          }
        });
        return hit;
      }; // Stores the corresponding issue text to alternative text


      var M = sa11yIM["images"];
      var container = document.querySelector(sa11yCheckRoot);
      var images = Array.from(container.querySelectorAll("img"));
      var excludeimages = Array.from(container.querySelectorAll(_this.imageIgnore));
      var $img = images.filter(function ($el) {
        return !excludeimages.includes($el);
      });
      $img.forEach(function ($el) {
        var alt = $el.getAttribute("alt");

        if (alt == undefined) {
          if ($el.closest('a[href]')) {
            if ($el.closest('a[href]').textContent.trim().length > 1) {
              $el.classList.add("sa11y-error-border");
              $el.closest('a[href]').insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, M["missingAltLinkButHasTextMessage"], false));
            } else if ($el.closest('a[href]').textContent.trim().length == 0) {
              $el.classList.add("sa11y-error-border");
              $el.closest('a[href]').insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, M["missingAltLinkMessage"], false));
            }
          } // General failure message if image is missing alt.
          else {
            $el.classList.add("sa11y-error-border");
            $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, M["missingAltMessage"], false));
          }
        } // If alt attribute is present, further tests are done.
        else {
          var altText = _this.sanitizeForHTML(alt); //Prevent tooltip from breaking.


          var error = _this.containsAltTextStopWords(altText);

          var altLength = alt.length; // Image fails if a stop word was found.

          if (error[0] != null && $el.closest("a[href]")) {
            _this.errorCount++;
            $el.classList.add("sa11y-error-border");
            $el.closest("a[href]").insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, M["linkImageBadAltMessage"](altText, error[0]), false));
          } else if (error[2] != null && $el.closest("a[href]")) {
            _this.errorCount++;
            $el.classList.add("sa11y-error-border");
            $el.closest("a[href]").insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, M["linkImagePlaceholderAltMessage"](altText), false));
          } else if (error[1] != null && $el.closest("a[href]")) {
            _this.warningCount++;
            $el.classList.add("sa11y-warning-border");
            $el.closest("a[href]").insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["linkImageSusAltMessage"](altText, error[1]), false));
          } else if (error[0] != null) {
            _this.errorCount++;
            $el.classList.add("sa11y-error-border");
            $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, M["altHasBadWordMessage"](altText, error[0]), false));
          } else if (error[2] != null) {
            _this.errorCount++;
            $el.classList.add("sa11y-error-border");
            $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, M["altPlaceholderMessage"](altText), false));
          } else if (error[1] != null) {
            _this.warningCount++;
            $el.classList.add("sa11y-warning-border");
            $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["altHasSusWordMessage"](altText, error[1]), false));
          } else if ((alt == "" || alt == " ") && $el.closest("a[href]")) {
            if ($el.closest("a[href]").getAttribute("tabindex") == "-1" && $el.closest("a[href]").getAttribute("aria-hidden") == "true") ;else if ($el.closest("a[href]").getAttribute("aria-hidden") == "true") {
              _this.errorCount++;
              $el.classList.add("sa11y-error-border");
              $el.closest("a[href]").insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, M["hyperlinkedImageAriaHidden"], false));
            } else if ($el.closest("a[href]").textContent.trim().length == 0) {
              _this.errorCount++;
              $el.classList.add("sa11y-error-border");
              $el.closest("a[href]").insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, M["imageLinkNullAltNoTextMessage"], false));
            } else {
              $el.closest("a[href]").insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yGood, M["linkHasAltMessage"], false));
            }
          } //Link and contains alt text.
          else if (alt.length > 250 && $el.closest("a[href]")) {
            _this.warningCount++;
            $el.classList.add("sa11y-warning-border");
            $el.closest("a[href]").insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["hyperlinkAltLengthMessage"](altText, altLength), false));
          } //Link and contains an alt text.
          else if (alt != "" && $el.closest("a[href]") && $el.closest("a[href]").textContent.trim().length == 0) {
            _this.warningCount++;
            $el.classList.add("sa11y-warning-border");
            $el.closest("a[href]").insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["imageLinkAltTextMessage"](altText), false));
          } //Contains alt text & surrounding link text.
          else if (alt != "" && $el.closest("a[href]") && $el.closest("a[href]").textContent.trim().length > 1) {
            _this.warningCount++;
            $el.classList.add("sa11y-warning-border");
            $el.closest("a[href]").insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["anchorLinkAndAltMessage"](altText), false));
          } //Decorative alt and not a link. TODO: ADD NOT (ANCHOR) SELECTOR 
          else if (alt == "" || alt == " ") {
            _this.warningCount++;
            $el.classList.add("sa11y-warning-border");
            $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["decorativeMessage"], false));
          } else if (alt.length > 250) {
            _this.warningCount++;
            $el.classList.add("sa11y-warning-border");
            $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["altTooLongMessage"](altText, altLength), false));
          } else if (alt != "") {
            $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yGood, M["passAlt"](altText), false));
          }
        }
      });
    });

    _defineProperty(this, "checkLabels", function () {
      var $inputs = _this.root.find("input, select, textarea").not(_this.containerIgnore).not("input:hidden");

      $inputs.each(function (i, el) {
        var $el = $(el);

        var ariaLabel = _this.computeAriaLabel($el);

        var M = sa11yIM["labels"]; //If button type is submit or button: pass

        if ($el.attr("type") === "submit" || $el.attr("type") === "button" || $el.attr("type") === "hidden") ; //Inputs where type="image".
        else if ($el.attr("type") === "image") {
          var imgalt = $el.attr("alt");

          if (imgalt == undefined || imgalt == "" || imgalt == " ") {
            if ($el.attr("aria-label") !== undefined) ;else {
              _this.errorCount++;
              $el.addClass("sa11y-error-border");
              $el.after(Sa11yAnnotate(sa11yError, M["missingImageInputMessage"], true));
            }
          }
        } //Recommendation to remove reset buttons.
        else if ($el.attr("type") === "reset") {
          _this.warningCount++;
          $el.addClass("sa11y-warning-border");
          $el.after(Sa11yAnnotate(sa11yWarning, M["inputResetMessage"], true));
        } //Uses ARIA. Warn them to ensure there's a visible label.
        else if ($el.attr("aria-label") || $el.attr("aria-labelledby") || $el.attr("title")) {
          if ($el.attr("title")) {
            var _ariaLabel = $el.attr("title");

            _this.warningCount++;
            $el.addClass("sa11y-warning-border");
            $el.after(Sa11yAnnotate(sa11yWarning, M["ariaLabelInputMessage"](_ariaLabel), true));
          } else {
            _this.warningCount++;
            $el.addClass("sa11y-warning-border");
            $el.after(Sa11yAnnotate(sa11yWarning, M["ariaLabelInputMessage"](ariaLabel), true));
          }
        } //Implicit labels.
        else if ($el.parents().is("label") && $el.parents("label").text().trim().length !== 0) ; //Has an ID but doesn't have a matching FOR attribute.
        else if ($el.attr("id") && $el.prevAll().is("label") || $el.nextAll().is("label")) {
          var prevlabel = $el.prevAll("label");
          var nextlabel = $el.nextAll("label");
          if (prevlabel.attr("for") === $el.attr("id") || nextlabel.attr("for") === $el.attr("id")) ;else {
            _this.errorCount++;
            $el.addClass("sa11y-error-border");
            $el.after(Sa11yAnnotate(sa11yError, M["noForAttributeMessage"]($el.attr("id")), true));
          }
        } else {
          _this.errorCount++;
          $el.addClass("sa11y-error-border");
          $el.after(Sa11yAnnotate(sa11yError, M["missingLabelMessage"], true));
        }
      });
    });

    _defineProperty(this, "checkEmbeddedContent", function () {
      var M = sa11yIM["embeddedContent"];
      var container = document.querySelector(sa11yCheckRoot);
      var containerexclusions = Array.from(container.querySelectorAll(_this.containerIgnore));
      var $findiframes = Array.from(container.querySelectorAll("iframe, audio, video"));
      var $iframes = $findiframes.filter(function ($el) {
        return !containerexclusions.includes($el);
      }); //Warning: Video content.

      var $videos = $iframes.filter(function ($el) {
        return $el.matches($sa11yVideos);
      });
      $videos.forEach(function ($el) {
        var track = $el.getElementsByTagName('TRACK');
        if ($el.tagName === "VIDEO" && track.length) ;else {
          _this.warningCount++;
          $el.classList.add("sa11y-warning-border");
          $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["video"]));
        }
      }); //Warning: Audio content.

      var $audio = $iframes.filter(function ($el) {
        return $el.matches($sa11yAudio);
      });
      $audio.forEach(function ($el) {
        _this.warningCount++;
        $el.classList.add("sa11y-warning-border");
        $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["audio"]));
      }); //Warning: Data visualizations. 

      var $dataviz = $iframes.filter(function ($el) {
        return $el.matches($sa11yDataViz);
      });
      $dataviz.forEach(function ($el) {
        _this.warningCount++;
        $el.classList.add("sa11y-warning-border");
        $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["dataviz"]));
      }); //Warning: Twitter timelines that are too long.

      var $twitter = $iframes.filter(function ($el) {
        return $el.matches($sa11yTwitter);
      });
      $twitter.forEach(function ($el) {
        var tweets = $el.contentWindow.document.body.querySelectorAll('.timeline-TweetList-tweet');

        if (tweets.length > 3) {
          _this.warningCount++;
          $el.classList.add("sa11y-warning-border");
          $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["twitter"]));
        }
      }); //Error: iFrame is missing accessible name.

      $iframes.forEach(function ($el) {
        if ($el.tagName === "VIDEO" || $el.tagName === "AUDIO" || $el.getAttribute("aria-hidden") === "true" || $el.getAttribute("hidden") !== null || $el.style.display == 'none' || $el.getAttribute("role") === "presentation") ;else if ($el.getAttribute("title") === null || $el.getAttribute("title") === '') {
          if ($el.getAttribute("aria-label") === null || $el.getAttribute("aria-label") === '') {
            if ($el.getAttribute("aria-labelledby") === null) {
              //Make sure red error border takes precedence 
              if ($el.classList.contains("sa11y-warning-border")) {
                $el.classList.remove("sa11y-warning-border");
              }

              _this.errorCount++;
              $el.classList.add("sa11y-error-border");
              $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, M["missingEmbedTitle"]));
            }
          }
        } else ;
      });
      var $embeddedcontent = $iframes.filter(function ($el) {
        return !$el.matches($sa11yAllEmbeddedContent);
      });
      $embeddedcontent.forEach(function ($el) {
        if ($el.tagName === "VIDEO" || $el.tagName === "AUDIO" || $el.getAttribute("aria-hidden") === "true" || $el.getAttribute("hidden") !== null || $el.style.display == 'none' || $el.getAttribute("role") === "presentation" || $el.getAttribute("tabindex") === "-1") ;else {
          _this.warningCount++;
          $el.classList.add("sa11y-warning-border");
          $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["generalEmbedWarning"]));
        }
      });
    });

    _defineProperty(this, "checkQA", function () {
      var M = sa11yIM["QA"];
      var container = document.querySelector(sa11yCheckRoot);
      var containerexclusions = Array.from(container.querySelectorAll(_this.containerIgnore)); //Error: Find all links pointing to development environment.

      var $findbadDevLinks = Array.from(container.querySelectorAll(sa11yLinksToFlag));
      var $badDevLinks = $findbadDevLinks.filter(function ($el) {
        return !containerexclusions.includes($el);
      });
      $badDevLinks.forEach(function ($el) {
        _this.errorCount++;
        $el.classList.add("sa11y-error-text");
        $el.insertAdjacentHTML('afterend', Sa11yAnnotate(sa11yError, M["badLink"]($el), true));
      }); //Warning: Find all PDFs. Although only append warning icon to first PDF on page.

      var checkPDF = _this.root.find("a[href$='.pdf']").not(_this.containerIgnore);

      var firstPDF = _this.root.find("a[href$='.pdf']:first").not(_this.containerIgnore);

      var pdfCount = checkPDF.length;

      if (checkPDF.length > 0) {
        _this.warningCount++;
        checkPDF.addClass("sa11y-warning-text");
        checkPDF.has("img").removeClass("sa11y-warning-text");
        firstPDF.after(Sa11yAnnotate(sa11yWarning, M["pdf"](pdfCount), true));
      } //Warning: Detect uppercase. 


      var $findallcaps = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li:not([class^='sa11y']), blockquote"));
      var $allcaps = $findallcaps.filter(function ($el) {
        return !containerexclusions.includes($el);
      });
      $allcaps.forEach(function ($el) {
        var uppercasePattern = /(?!<a[^>]*?>)(\b[A-Z][',!:A-Z\s]{15,}|\b[A-Z]{15,}\b)(?![^<]*?<\/a>)/g;
        var html = $el.innerHTML;
        $el.innerHTML = html.replace(uppercasePattern, "<span class='sa11y-warning-uppercase'>$1</span>");
      });
      var $warningUppercase = document.querySelectorAll(".sa11y-warning-uppercase");
      $warningUppercase.forEach(function ($el) {
        $el.insertAdjacentHTML('afterend', Sa11yAnnotate(sa11yWarning, M["uppercaseWarning"], true));
      });

      if ($warningUppercase.length > 0) {
        _this.warningCount++;
      } //Tables check.


      var $findtables = Array.from(container.querySelectorAll("table:not([role='presentation'])"));
      var $tables = $findtables.filter(function ($el) {
        return !containerexclusions.includes($el);
      });
      $tables.forEach(function ($el) {
        var findTHeaders = $el.querySelectorAll("th");
        var findHeadingTags = $el.querySelectorAll("h1, h2, h3, h4, h5, h6");

        if (findTHeaders.length == 0) {
          _this.errorCount++;
          $el.classList.add("sa11y-error-border");
          $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, M["tables"]["missingHeadings"]));
        }

        if (findHeadingTags.length > 0) {
          _this.errorCount++;
          findHeadingTags.forEach(function ($el) {
            $el.classList.add("sa11y-error-heading");
            $el.parentNode.classList.add("sa11y-error-border");
            $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, M["tables"]["semanticHeading"]));
          });
        }

        findTHeaders.forEach(function ($el) {
          if ($el.textContent.trim().length == 0) {
            _this.errorCount++;
            $el.classList.add("sa11y-error-border");
            $el.innerHTML = Sa11yAnnotate(sa11yError, M["tables"]["emptyHeading"]);
          }
        });
      }); //Error: Missing language tag. Lang should be at least 2 characters.

      var lang = document.querySelector("html").getAttribute("lang");

      if (lang == undefined || lang.length < 2) {
        _this.errorCount++;
        var sa11yContainer = document.getElementById("sa11y-container");
        sa11yContainer.insertAdjacentHTML('afterend', Sa11yLang.annotateBanner(sa11yError, M["pageLanguageMessage"]));
      } //Excessive bolding or italics.


      var $findstrongitalics = Array.from(container.querySelectorAll("strong, em"));
      var $strongitalics = $findstrongitalics.filter(function ($el) {
        return !containerexclusions.includes($el);
      });
      $strongitalics.forEach(function ($el) {
        if ($el.textContent.trim().length > 400) {
          _this.warningCount++;
          $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["badItalics"]));
        }
      }); //Find blockquotes used as headers.

      var $findblockquotes = Array.from(container.querySelectorAll("blockquote"));
      var $blockquotes = $findblockquotes.filter(function ($el) {
        return !containerexclusions.includes($el);
      });
      $blockquotes.forEach(function ($el, i) {
        var bqHeadingText = $el.textContent;

        if (bqHeadingText.trim().length < 25) {
          _this.warningCount++;
          $el.classList.add("sa11y-warning-border");
          $el.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, M["blockquoteMessage"](bqHeadingText)));
        }
      }); // Warning: Detect fake headings.

      _this.$p.each(function (i, el) {
        var $el = $(el);
        var brAfter = $el.html().indexOf("</strong><br>");
        var brBefore = $el.html().indexOf("<br></strong>"); //Check paragraphs greater than x characters.

        if ($el && $el.text().trim().length >= 300) {
          var firstChild = $el.contents()[0]; //If paragraph starts with <strong> tag and ends with <br>.

          if ($(firstChild).is("strong") && (brBefore !== -1 || brAfter !== -1)) {
            var boldtext = $el.find("strong").text();

            if ($el && boldtext.length <= 120) {
              $el.find("strong").addClass("sa11y-fake-heading sa11y-error-heading");
              $el.before(Sa11yAnnotate(sa11yWarning, M["fakeHeading"](boldtext)));
            }
          }
        } // If paragraph only contains <p><strong>...</strong></p>.


        var $fakeHeading = $el.filter(function () {
          return /^<(strong)>.+<\/\1>$/.test($.trim($(this).html()));
        }); //Although only flag if it:
        // 1) Has less than 120 characters (typical heading length).
        // 2) The previous element is not a heading.

        if ($fakeHeading.text().length <= 120 && $fakeHeading.prev(_this.$h).length !== 1 && $fakeHeading.next(_this.$p).length == 1) {
          var _boldtext = $fakeHeading.text();

          $fakeHeading.addClass("sa11y-fake-heading sa11y-error-heading");
          $fakeHeading.find("strong").after(Sa11yAnnotate(sa11yWarning, M["fakeHeading"](_boldtext), true));
        }
      });

      if ($(".sa11y-fake-heading").length > 0) {
        _this.warningCount++;
      }
      /* Thanks to John Jameson from PrincetonU for this ruleset! */
      // Detect paragraphs that should be lists.


      var activeMatch = "";
      var prefixDecrement = {
        b: "a",
        B: "A",
        2: "1"
      };
      var prefixMatch = /a\.|a\)|A\.|A\)|1\.|1\)|\*\s|-\s|--|•\s|→\s|✓\s|✔\s|✗\s|✖\s|✘\s|❯\s|›\s|»\s/;

      var decrement = function decrement(el) {
        return el.replace(/^b|^B|^2/, function (match) {
          return prefixDecrement[match];
        });
      };

      _this.$p.each(function (i, el) {
        var $first = $(el);
        var hit = false; // Grab first two characters.

        var firstPrefix = $first.text().substring(0, 2);

        if (firstPrefix.trim().length > 0 && firstPrefix !== activeMatch && firstPrefix.match(prefixMatch)) {
          // We have a prefix and a possible hit
          // Split p by carriage return if present and compare.
          var hasBreak = $first.html().indexOf("<br>");

          if (hasBreak !== -1) {
            var subParagraph = $first.html().substring(hasBreak + 4).trim();
            var subPrefix = subParagraph.substring(0, 2);

            if (firstPrefix === decrement(subPrefix)) {
              hit = true;
            }
          } // Decrement the second p prefix and compare .


          if (!hit) {
            var $second = $(el).next("p");

            if ($second) {
              var secondPrefix = decrement($first.next().text().substring(0, 2));

              if (firstPrefix === secondPrefix) {
                hit = true;
              }
            }
          }

          if (hit) {
            this.warningCount++;
            $first.before(Sa11yAnnotate(sa11yWarning, M["shouldBeList"](firstPrefix)));
            $first.addClass("sa11y-fake-list");
            activeMatch = firstPrefix;
          } else {
            activeMatch = "";
          }
        } else {
          activeMatch = "";
        }
      });

      if ($(".sa11y-fake-list").length > 0) {
        _this.warningCount++;
      } //Example ruleset. Be creative.


      var $checkAnnouncement = _this.root.find(".announcement-component").not(_this.containerIgnore);

      if ($checkAnnouncement.length > 1) {
        _this.warningCount++;
        $(".announcement-component:gt(0)").addClass("sa11y-warning-border");
        $(".announcement-component:gt(0)").before(Sa11yAnnotate(sa11yWarning, M["announcementWarningMessage"]));
      }
    });

    _defineProperty(this, "checkContrast", function () {
      var container = document.querySelector(sa11yCheckRoot);
      var containerexclusions = Array.from(container.querySelectorAll(_this.containerIgnore));
      var $findcontrast = Array.from(container.querySelectorAll("* > :not(.sa11y-heading-label)"));
      var $contrast = $findcontrast.filter(function ($el) {
        return !containerexclusions.includes($el);
      });
      var contrastErrors = {
        errors: [],
        warnings: []
      };
      var elements = $contrast;
      var contrast = {
        // Parse rgb(r, g, b) and rgba(r, g, b, a) strings into an array.
        // Adapted from https://github.com/gka/chroma.js
        parseRgb: function parseRgb(css) {
          var i, m, rgb, _i, _j;

          if (m = css.match(/rgb\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*\)/)) {
            rgb = m.slice(1, 4);

            for (i = _i = 0; _i <= 2; i = ++_i) {
              rgb[i] = +rgb[i];
            }

            rgb[3] = 1;
          } else if (m = css.match(/rgba\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*,\s*([01]|[01]?\.\d+)\)/)) {
            rgb = m.slice(1, 5);

            for (i = _j = 0; _j <= 3; i = ++_j) {
              rgb[i] = +rgb[i];
            }
          }

          return rgb;
        },
        // Based on http://www.w3.org/TR/WCAG20/#relativeluminancedef
        relativeLuminance: function relativeLuminance(c) {
          var lum = [];

          for (var i = 0; i < 3; i++) {
            var v = c[i] / 255;
            lum.push(v < 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
          }

          return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
        },
        // Based on http://www.w3.org/TR/WCAG20/#contrast-ratiodef
        contrastRatio: function contrastRatio(x, y) {
          var l1 = contrast.relativeLuminance(contrast.parseRgb(x));
          var l2 = contrast.relativeLuminance(contrast.parseRgb(y));
          return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        },
        getBackground: function getBackground(el) {
          var styles = getComputedStyle(el),
              bgColor = styles.backgroundColor,
              bgImage = styles.backgroundImage,
              rgb = contrast.parseRgb(bgColor) + '',
              alpha = rgb.split(','); // if background has alpha transparency, flag manual check

          if (alpha[3] < 1 && alpha[3] > 0) {
            return "alpha";
          } // if element has no background image, or transparent background (alpha == 0) return bgColor


          if (bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent' && bgImage === "none" && alpha[3] !== '0') {
            return bgColor;
          } else if (bgImage !== "none") {
            return "image";
          } // retest if not returned above


          if (el.tagName === 'HTML') {
            return 'rgb(255, 255, 255)';
          } else {
            return contrast.getBackground(el.parentNode);
          }
        },
        // check visibility - based on jQuery method
        isVisible: function isVisible(el) {
          return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        },
        check: function check() {
          // resets results
          contrastErrors = {
            errors: [],
            warnings: []
          };

          for (var i = 0; i < elements.length; i++) {
            (function (n) {
              var elem = elements[n]; // test if visible. Although we want invisible too.

              if (contrast
              /* .isVisible(elem) */
              ) {
                var style = getComputedStyle(elem),
                    color = style.color,
                    fill = style.fill,
                    fontSize = parseInt(style.fontSize),
                    pointSize = fontSize * 3 / 4,
                    fontWeight = style.fontWeight,
                    htmlTag = elem.tagName,
                    background = contrast.getBackground(elem),
                    textString = [].reduce.call(elem.childNodes, function (a, b) {
                  return a + (b.nodeType === 3 ? b.textContent : '');
                }, ''),
                    text = textString.trim(),
                    ratio,
                    error,
                    warning;

                if (htmlTag === "SVG") {
                  ratio = Math.round(contrast.contrastRatio(fill, background) * 100) / 100;

                  if (ratio < 3) {
                    error = {
                      elem: elem,
                      ratio: ratio + ':1'
                    };
                    contrastErrors.errors.push(error);
                  }
                } else if (text.length || htmlTag === "INPUT" || htmlTag === "SELECT" || htmlTag === "TEXTAREA") {
                  // does element have a background image - needs to be manually reviewed
                  if (background === "image") {
                    warning = {
                      elem: elem
                    };
                    contrastErrors.warnings.push(warning);
                  } else if (background === "alpha") {
                    warning = {
                      elem: elem
                    };
                    contrastErrors.warnings.push(warning);
                  } else {
                    ratio = Math.round(contrast.contrastRatio(color, background) * 100) / 100;

                    if (pointSize >= 18 || pointSize >= 14 && fontWeight >= 700) {
                      if (ratio < 3) {
                        error = {
                          elem: elem,
                          ratio: ratio + ':1'
                        };
                        contrastErrors.errors.push(error);
                      }
                    } else {
                      if (ratio < 4.5) {
                        error = {
                          elem: elem,
                          ratio: ratio + ':1'
                        };
                        contrastErrors.errors.push(error);
                      }
                    }
                  }
                }
              }
            })(i);
          }

          return contrastErrors;
        }
      };
      contrast.check();
      var _sa11yIM$contrast = sa11yIM["contrast"],
          errorMessage = _sa11yIM$contrast.errorMessage,
          warningMessage = _sa11yIM$contrast.warningMessage;
      contrastErrors.errors.forEach(function (item) {
        var name = item.elem;
        var cratio = item.ratio;
        var clone = name.cloneNode(true);
        var removeSa11yHeadingLabel = clone.querySelectorAll('.sa11y-heading-label');

        for (var i = 0; i < removeSa11yHeadingLabel.length; i++) {
          clone.removeChild(removeSa11yHeadingLabel[i]);
        }

        var nodetext = clone.textContent;
        _this.errorCount++;
        name.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yError, errorMessage(cratio, nodetext)));
      });
      contrastErrors.warnings.forEach(function (item) {
        var name = item.elem;
        var clone = name.cloneNode(true);
        var removeSa11yHeadingLabel = clone.querySelectorAll('.sa11y-heading-label');

        for (var i = 0; i < removeSa11yHeadingLabel.length; i++) {
          clone.removeChild(removeSa11yHeadingLabel[i]);
        }

        var nodetext = clone.textContent;
        _this.warningCount++;
        name.insertAdjacentHTML('beforebegin', Sa11yAnnotate(sa11yWarning, warningMessage(nodetext)));
      });
    });

    _defineProperty(this, "checkReadability", function () {
      var container = document.querySelector(sa11yReadabilityRoot);
      var containerexclusions = Array.from(container.querySelectorAll(_this.containerIgnore));
      var $findreadability = Array.from(container.querySelectorAll("p, li"));
      var $readability = $findreadability.filter(function ($el) {
        return !containerexclusions.includes($el);
      }); //Crude hack to add a period to the end of list items to make a complete sentence.

      $readability.forEach(function ($el) {
        var listText = $el.textContent;

        if (listText.charAt(listText.length - 1) !== ".") {
          $el.insertAdjacentHTML("beforeend", "<span class='sa11y-readability-period sa11y-visually-hidden'>.</span>");
        }
      }); // Compute syllables: http://stackoverflow.com/questions/5686483/how-to-compute-number-of-syllables-in-a-word-in-javascript

      function number_of_syllables(wordCheck) {
        wordCheck = wordCheck.toLowerCase().replace('.', '').replace('\n', '');

        if (wordCheck.length <= 3) {
          return 1;
        }

        wordCheck = wordCheck.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        wordCheck = wordCheck.replace(/^y/, '');
        var syllable_string = wordCheck.match(/[aeiouy]{1,2}/g);

        if (!!syllable_string) {
          var syllables = syllable_string.length;
        } else {
          syllables = 0;
        }

        return syllables;
      }

      var readabilityarray = [];

      for (var i = 0; i < $readability.length; i++) {
        var current = $readability[i];

        if (current.textContent.replace(/ |\n/g, '') !== '') {
          readabilityarray.push(current.textContent);
        }
      }

      var paragraphtext = readabilityarray.join(' ').trim().toString();
      var words_raw = paragraphtext.replace(/[.!?-]+/g, ' ').split(' ');
      var words = 0;

      for (var i = 0; i < words_raw.length; i++) {
        if (words_raw[i] != 0) {
          words = words + 1;
        }
      }

      var sentences_raw = paragraphtext.split(/[.!?]+/);
      var sentences = 0;

      for (var i = 0; i < sentences_raw.length; i++) {
        if (sentences_raw[i] != '') {
          sentences = sentences + 1;
        }
      }

      var total_syllables = 0;
      var syllables1 = 0;
      var syllables2 = 0;

      for (var i = 0; i < words_raw.length; i++) {
        if (words_raw[i] != 0) {
          var syllable_count = number_of_syllables(words_raw[i]);

          if (syllable_count == 1) {
            syllables1 = syllables1 + 1;
          }

          if (syllable_count == 2) {
            syllables2 = syllables2 + 1;
          }

          total_syllables = total_syllables + syllable_count;
        }
      } //var characters = paragraphtext.replace(/[.!?|\s]+/g, '').length;
      //Reference: https://core.ac.uk/download/pdf/6552422.pdf
      //Reference: https://github.com/Yoast/YoastSEO.js/issues/267


      var flesch_reading_ease;

      if (sa11yReadabilityLang === "en") {
        flesch_reading_ease = 206.835 - 1.015 * words / sentences - 84.6 * total_syllables / words;
      } else if (sa11yReadabilityLang === "fr") {
        //French (Kandel & Moles)
        flesch_reading_ease = 207 - 1.015 * words / sentences - 73.6 * total_syllables / words;
      } else if (sa11yReadabilityLang === "es") {
        flesch_reading_ease = 206.84 - 1.02 * words / sentences - 0.60 * (100 * total_syllables / words);
      }

      if (flesch_reading_ease > 100) {
        flesch_reading_ease = 100;
      } else if (flesch_reading_ease < 0) {
        flesch_reading_ease = 0;
      }

      var M = sa11yIM["readability"];
      var $readabilityinfo = document.getElementById("sa11y-readability-info");

      if (paragraphtext.length === 0) {
        $readabilityinfo.innerHTML = M["noPorLiMessage"];
      } else if (words > 30) {
        var fleschScore = flesch_reading_ease.toFixed(1);
        var avgWordsPerSentence = (words / sentences).toFixed(1);
        var complexWords = Math.round(100 * ((words - (syllables1 + syllables2)) / words)); //WCAG AAA pass if greater than 60

        if (fleschScore >= 0 && fleschScore < 30) {
          $readabilityinfo.innerHTML = "<span>".concat(fleschScore, "</span> <span class=\"sa11y-readability-score\">").concat(sa11yVeryDifficultReadability, "</span>");
        } else if (fleschScore > 31 && fleschScore < 49) {
          $readabilityinfo.innerHTML = "<span>".concat(fleschScore, "</span> <span class=\"sa11y-readability-score\">").concat(sa11yDifficultReadability, "</span>");
        } else if (fleschScore > 50 && fleschScore < 60) {
          $readabilityinfo.innerHTML = "<span>".concat(fleschScore, "</span> <span class=\"sa11y-readability-score\">").concat(sa11yFairlyDifficultReadability, "</span>");
        } else {
          $readabilityinfo.innerHTML = "<span>".concat(fleschScore, "</span> <span class=\"sa11y-readability-score\">").concat(sa11yGoodReadability, "</span>");
        }

        document.getElementById("sa11y-readability-details").innerHTML = "<li><span class='sa11y-bold'>".concat(sa11yAvgWordPerSentence, "</span> ").concat(avgWordsPerSentence, "</li>\n                <li><span class='sa11y-bold'>").concat(sa11yComplexWords, "</span> ").concat(complexWords, "%</li>\n                <li><span class='sa11y-bold'>").concat(sa11yTotalWords, "</span> ").concat(words, "</li>");
      } else {
        $readabilityinfo.textContent = M["notEnoughContentMessage"];
      }
    });

    //Icon on the main toggle. Easy to replace.
    var MainToggleIcon = "<svg role='img' focusable='false' width='35px' height='35px' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='#ffffff' d='M256 48c114.953 0 208 93.029 208 208 0 114.953-93.029 208-208 208-114.953 0-208-93.029-208-208 0-114.953 93.029-208 208-208m0-40C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 56C149.961 64 64 149.961 64 256s85.961 192 192 192 192-85.961 192-192S362.039 64 256 64zm0 44c19.882 0 36 16.118 36 36s-16.118 36-36 36-36-16.118-36-36 16.118-36 36-36zm117.741 98.023c-28.712 6.779-55.511 12.748-82.14 15.807.851 101.023 12.306 123.052 25.037 155.621 3.617 9.26-.957 19.698-10.217 23.315-9.261 3.617-19.699-.957-23.316-10.217-8.705-22.308-17.086-40.636-22.261-78.549h-9.686c-5.167 37.851-13.534 56.208-22.262 78.549-3.615 9.255-14.05 13.836-23.315 10.217-9.26-3.617-13.834-14.056-10.217-23.315 12.713-32.541 24.185-54.541 25.037-155.621-26.629-3.058-53.428-9.027-82.141-15.807-8.6-2.031-13.926-10.648-11.895-19.249s10.647-13.926 19.249-11.895c96.686 22.829 124.283 22.783 220.775 0 8.599-2.03 17.218 3.294 19.249 11.895 2.029 8.601-3.297 17.219-11.897 19.249z'/></svg>";
    var sa11ycontainer = document.createElement("div");
    sa11ycontainer.setAttribute("id", "sa11y-container");
    sa11ycontainer.setAttribute("role", "region");
    sa11ycontainer.setAttribute("lang", sa11yLangCode);
    sa11ycontainer.setAttribute("aria-label", sa11yContainerLabel);
    var loadContrastPreference = localStorage.getItem("sa11y-remember-contrast") === "On";
    var loadLabelsPreference = localStorage.getItem("sa11y-remember-labels") === "On";
    var loadChangeRequestPreference = localStorage.getItem("sa11y-remember-links-advanced") === "On";
    var loadReadabilityPreference = localStorage.getItem("sa11y-remember-readability") === "On";
    sa11ycontainer.innerHTML = //Main toggle button.
    "<button type=\"button\" aria-expanded=\"false\" id=\"sa11y-toggle\" aria-describedby=\"sa11y-notification-badge\" aria-label=\"".concat(sa11yMainToggleLabel, "\" disabled>\n                    ").concat(MainToggleIcon, "\n                    <div id=\"sa11y-notification-badge\">\n                        <span id=\"sa11y-notification-count\"></span>\n                    </div>\n                </button>") + //Start of main container.
    "<div id=\"sa11y-panel\">" + //Page Outline tab.
    "<div id=\"sa11y-outline-panel\" role=\"tabpanel\" aria-labelledby=\"sa11y-outline-header\">\n                <div id=\"sa11y-outline-header\" class=\"sa11y-header-text\">\n                    <h2 tabindex=\"-1\">".concat(Sa11yLang._('JOOMLA_A11Y_CHECKER_PAGE_OUTLINE'), "</h2>\n                </div>\n                <div id=\"sa11y-outline-content\">\n                    <ul id=\"sa11y-outline-list\"></ul>\n                </div>") + //Readability tab.
    "<div id=\"sa11y-readability-panel\">\n                    <div id=\"sa11y-readability-content\">\n                        <h2 class=\"sa11y-header-text-inline\">".concat(sa11yReadability, "</h2>\n                        <p id=\"sa11y-readability-info\"></p>\n                        <ul id=\"sa11y-readability-details\"></ul>\n                    </div>\n                </div>\n            </div>") + //End of Page Outline tab.
    //Settings tab.
    "<div id=\"sa11y-settings-panel\" role=\"tabpanel\" aria-labelledby=\"sa11y-settings-header\">\n                <div id=\"sa11y-settings-header\" class=\"sa11y-header-text\">\n                    <h2 tabindex=\"-1\">".concat(sa11ySettings, "</h2>\n                </div>\n                <div id=\"sa11y-settings-content\">\n                    <ul id=\"sa11y-settings-options\">  \n                        <li>\n                            <label id=\"check-contrast\" for=\"sa11y-contrast-toggle\">").concat(sa11yContrast, "</label>\n                            <button id=\"sa11y-contrast-toggle\" \n                            aria-labelledby=\"check-contrast\" \n                            class=\"sa11y-settings-switch\" \n                            aria-pressed=\"").concat(loadContrastPreference ? "true" : "false", "\">").concat(loadContrastPreference ? sa11yOn : sa11yOff, "</button>\n                        </li>\n                        <li>\n                            <label id=\"check-labels\" for=\"sa11y-labels-toggle\">").concat(sa11yFormLabels, "</label>\n                            <button id=\"sa11y-labels-toggle\" aria-labelledby=\"check-labels\" class=\"sa11y-settings-switch\" \n                            aria-pressed=\"").concat(loadLabelsPreference ? "true" : "false", "\">").concat(loadLabelsPreference ? sa11yOn : sa11yOff, "</button>\n                        </li>\n                        <li>\n                            <label id=\"check-changerequest\" for=\"sa11y-links-advanced-toggle\">").concat(sa11yLinksAdvanced, " <span class=\"sa11y-badge\">AAA</span></label>\n                            <button id=\"sa11y-links-advanced-toggle\" aria-labelledby=\"check-changerequest\" class=\"sa11y-settings-switch\" \n                            aria-pressed=\"").concat(loadChangeRequestPreference ? "true" : "false", "\">").concat(loadChangeRequestPreference ? sa11yOn : sa11yOff, "</button>\n                        </li>\n                        <li>\n                            <label id=\"check-readability\" for=\"sa11y-readability-toggle\">").concat(sa11yReadability, " <span class=\"sa11y-badge\">AAA</span></label>\n                            <button id=\"sa11y-readability-toggle\" aria-labelledby=\"check-readability\" class=\"sa11y-settings-switch\" \n                            aria-pressed=\"").concat(loadReadabilityPreference ? "true" : "false", "\">").concat(loadReadabilityPreference ? sa11yOn : sa11yOff, "</button>\n                        </li>\n                        <li>\n                            <label id=\"dark-mode\" for=\"sa11y-theme-toggle\">").concat(sa11yDarkMode, "</label>\n                            <button id=\"sa11y-theme-toggle\" aria-labelledby=\"dark-mode\" class=\"sa11y-settings-switch\"></button>\n                        </li>\n                    </ul>\n                </div>\n            </div>") + //Console warning messages.
    "<div id=\"sa11y-panel-alert\">\n                <div class=\"sa11y-header-text\">\n                    <button id=\"sa11y-close-alert\" class=\"sa11y-close-btn\" aria-label=\"".concat(sa11yAlertClose, "\" aria-describedby=\"sa11y-alert-heading sa11y-panel-alert-text\"></button>\n                    <h2 id=\"sa11y-alert-heading\">").concat(sa11yAlertText, "</h2>\n                </div>\n                <p id=\"sa11y-panel-alert-text\"></p>\n                <div id=\"sa11y-panel-alert-preview\"></div>\n            </div>") + //Main panel that conveys state of page.
    "<div id=\"sa11y-panel-content\">\n                <button id=\"sa11y-cycle-toggle\" type=\"button\" aria-label=\"".concat(sa11yShortcutSR, "\">\n                    <div class=\"sa11y-panel-icon\"></div>\n                </button>\n                <div id=\"sa11y-panel-text\"><p id=\"sa11y-status\" aria-live=\"polite\"></p></div>\n            </div>") + //Show Outline & Show Settings button.
    "<div id=\"sa11y-panel-controls\" role=\"tablist\" aria-orientation=\"horizontal\">\n                <button type=\"button\" role=\"tab\" aria-expanded=\"false\" id=\"sa11y-outline-toggle\" aria-controls=\"sa11y-outline-panel\">\n                    ".concat(sa11yShowOutline, "\n                </button>\n                <button type=\"button\" role=\"tab\" aria-expanded=\"false\" id=\"sa11y-settings-toggle\" aria-controls=\"sa11y-settings-panel\">\n                    ").concat(sa11yShowSettings, "\n                </button>\n                <div style=\"width:35px\"></div> \n            </div>") + //End of main container.
    "</div>";
    var pagebody = document.getElementsByTagName("BODY")[0];
    pagebody.prepend(sa11ycontainer); //Put before document.ready because of CSS flicker when dark mode is enabled.

    this.settingPanelToggles(); // Preload before CheckAll function.

    $(document).ready(function () {
      _this.loadGlobals();

      _this.sa11yMainToggle();

      _this.sanitizeHTMLandComputeARIA();

      _this.initializeJumpToIssueTooltip();
    }); //500ms to let the page settle down (e.g. slow loading JavaScript components).

    setTimeout(function () {
      $(document).ready(function () {
        document.getElementById("sa11y-toggle").disabled = false; //To-do: Yes, this is total crap and needs to be re-thinked. On document.ready, it crudely checks/annotates the page, and then instantly clears/resets everything except for the badge counter. Need to figure out a way to update badge counter without painting entire page with error buttons.

        if (localStorage.getItem("sa11y-remember-panel") === "Closed" || localStorage.getItem("sa11y-remember-panel") === null) {
          _this.checkAll();

          _this.resetAll();
        }
      });
    }, 500);
  } //----------------------------------------------------------------------
  // Main toggle button
  //----------------------------------------------------------------------
  ; //No IE support.


  if (window.navigator.userAgent.match(/MSIE|Trident/) === null) {
    new Sa11y();
  }
})(jQuery);
/*-----------------------------------------------------------------------
Sa11y: the accessibility quality assurance assistant.                
Author: Development led by Adam Chaboryk at Ryerson University.
All acknowledgements and contributors: https://github.com/ryersondmp/sa11y
License: https://github.com/ryersondmp/sa11y/blob/master/LICENSE.md
Copyright (c) 2020 - 2021 Ryerson University
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
------------------------------------------------------------------------*/


var sa11y = {};
export { sa11y as default };
