/**
 * Sa11y Translation object
 */
const Lang = {
      langStrings: {},
      addI18n: function (strings) {
        this.langStrings = strings;
      },
      _: function(string) {
          return this.translate(string)
      },
      sprintf: function(string, ...args) {
        let transString = this._(string);

        if (args && args.length) {
          args.forEach((arg) => {
            // @TODO: use transString.replace('%s', arg), and update lang strings for it
            transString = transString.replace(/%\([a-zA-z]+\)/, arg);
          });
        }
        return transString;
      },
      translate: function(string) {
        return this.langStrings[string] || string;
      },
};

if (window.Joomla && Joomla.Text && Joomla.Text._)
{
  Lang.translate = Joomla.Text._;
}

/**
 * Sa11y default options
 */
  const defaultOptions = {
    langCode: 'en',

    // Target area to scan.
    checkRoot: 'body', // A content container

    // Readability configuration.
    readabilityRoot: 'body',
    readabilityLang: 'en',

    // Inclusions and exclusions. Use commas to seperate classes or elements.
    containerIgnore: '.sa11y-ignore', // Ignore specific regions.
    outlineIgnore: '', // Exclude headings from outline panel.
    headerIgnore: '', // Ignore specific headings. E.g. "h1.jumbotron-heading"
    imageIgnore: '', // Ignore specific images.
    linkIgnore: '', // Ignore specific links.
    linkIgnoreSpan: 'noscript, span.sr-only-example', // Ignore specific classes within links. Example: <a href="#">learn more <span class="sr-only-example">(opens new tab)</span></a>.
    linksToFlag: '', // Links you don't want your content editors pointing to (e.g. development environments).

    // Embedded content.
    videoContent: "video, [src*='youtube.com'], [src*='vimeo.com'], [src*='yuja.com'], [src*='panopto.com']",
    audioContent: "audio, [src*='soundcloud.com'], [src*='simplecast.com'], [src*='podbean.com'], [src*='buzzsprout.com'], [src*='blubrry.com'], [src*='transistor.fm'], [src*='fusebox.fm'], [src*='libsyn.com']",
    embeddedContent: '',

    // Alt Text stop words.
    suspiciousAltWords: ['image', 'graphic', 'picture', 'photo'],
    placeholderAltStopWords: [
      'alt',
      'image',
      'photo',
      'decorative',
      'photo',
      'placeholder',
      'placeholder image',
      'spacer',
      '.',
    ],
    // Link Text stop words
    partialAltStopWords: [
      'click',
      'click here',
      'click here for more',
      'click here to learn more',
      'click here to learn more.',
      'check out',
      'download',
      'download here',
      'download here.',
      'find out',
      'find out more',
      'find out more.',
      'form',
      'here',
      'here.',
      'info',
      'information',
      'link',
      'learn',
      'learn more',
      'learn more.',
      'learn to',
      'more',
      'page',
      'paper',
      'read more',
      'read',
      'read this',
      'this',
      'this page',
      'this page.',
      'this website',
      'this website.',
      'view',
      'view our',
      'website',
      '.',
    ],
    warningAltWords: [
      '< ',
      ' >',
      'click here',
    ],
    // Link Text (Advanced)
    newWindowPhrases: [
      'external',
      'new tab',
      'new window',
      'pop-up',
      'pop up',
    ],
    // Link Text (Advanced). Only some items in list would need to be translated.
    fileTypePhrases: [
      'document',
      'pdf',
      'doc',
      'docx',
      'word',
      'mp3',
      'ppt',
      'text',
      'pptx',
      'powerpoint',
      'txt',
      'exe',
      'dmg',
      'rtf',
      'install',
      'windows',
      'macos',
      'spreadsheet',
      'worksheet',
      'csv',
      'xls',
      'xlsx',
      'video',
      'mp4',
      'mov',
      'avi',
    ],
  };
  defaultOptions.embeddedContent = `${defaultOptions.videoContent}, ${defaultOptions.audioContent}`;

  /**
   * Load and validate options
   *
   * @param {Sa11y}  instance
   * @param {Object} customOptions
   * @returns {Object}
   */
  const loadOptions = (instance, customOptions) => {
    const options = customOptions ? Object.assign(defaultOptions, customOptions) : defaultOptions;

    // Check required options
    ['langCode', 'checkRoot', 'readabilityRoot', 'readabilityLang'].forEach((option) => {
      if (!options[option]) {
        throw new Error(`Option [${option}] is required`);
      }
    });

    // Container ignores apply to self and children.
    if (options.containerIgnore) {
      let containerSelectors = options.containerIgnore.split(',').map((el) => {
        return `${el} *, ${el}`
      });

      options.containerIgnore = '[aria-hidden="true"], #sa11y-container *, .sa11y-instance *, ' + containerSelectors.join(', ')
    } else {
      options.containerIgnore = '[aria-hidden="true"], #sa11y-container *, .sa11y-instance *';
    }
    instance.containerIgnore = options.containerIgnore;

    // Images ignore
    instance.imageIgnore = instance.containerIgnore + ', [role="presentation"], [src^="https://trck.youvisit.com"]';

    if (options.imageIgnore) {
      instance.imageIgnore = options.imageIgnore + ',' + instance.imageIgnore;
    }

    // Ignore specific headings
    instance.headerIgnore = options.containerIgnore;

    if (options.headerIgnore) {
      instance.headerIgnore = options.headerIgnore + ',' + instance.headerIgnore;
    }

    // Links ignore defaults plus sa11y links.
    instance.linkIgnore = instance.containerIgnore + ', [aria-hidden="true"], .anchorjs-link';

    if (options.linkIgnore) {
      instance.linkIgnore = options.linkIgnore + ',' + instance.linkIgnore;
    }

    return options;
  };

/**
 * Sa11y class
 */
class Sa11y {
        constructor(options) {
          this.containerIgnore = '';
          this.imageIgnore = '';
          this.headerIgnore = '';
          this.linkIgnore = '';

          // Load options
          this.options = loadOptions(this, options);

            //Icon on the main toggle. Easy to replace.
            const MainToggleIcon =
                "<svg role='img' focusable='false' width='35px' height='35px' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='#ffffff' d='M256 48c114.953 0 208 93.029 208 208 0 114.953-93.029 208-208 208-114.953 0-208-93.029-208-208 0-114.953 93.029-208 208-208m0-40C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 56C149.961 64 64 149.961 64 256s85.961 192 192 192 192-85.961 192-192S362.039 64 256 64zm0 44c19.882 0 36 16.118 36 36s-16.118 36-36 36-36-16.118-36-36 16.118-36 36-36zm117.741 98.023c-28.712 6.779-55.511 12.748-82.14 15.807.851 101.023 12.306 123.052 25.037 155.621 3.617 9.26-.957 19.698-10.217 23.315-9.261 3.617-19.699-.957-23.316-10.217-8.705-22.308-17.086-40.636-22.261-78.549h-9.686c-5.167 37.851-13.534 56.208-22.262 78.549-3.615 9.255-14.05 13.836-23.315 10.217-9.26-3.617-13.834-14.056-10.217-23.315 12.713-32.541 24.185-54.541 25.037-155.621-26.629-3.058-53.428-9.027-82.141-15.807-8.6-2.031-13.926-10.648-11.895-19.249s10.647-13.926 19.249-11.895c96.686 22.829 124.283 22.783 220.775 0 8.599-2.03 17.218 3.294 19.249 11.895 2.029 8.601-3.297 17.219-11.897 19.249z'/></svg>";

            const sa11ycontainer = document.createElement("div");
            sa11ycontainer.setAttribute("id", "sa11y-container");
            sa11ycontainer.setAttribute("role", "region");
            sa11ycontainer.setAttribute("lang", this.options.langCode);
            sa11ycontainer.setAttribute("aria-label", Lang._('JOOMLA_A11Y_CHECKER_CONTAINER_LABEL'));

            let loadContrastPreference =
                localStorage.getItem("sa11y-remember-contrast") === "On";

            let loadLabelsPreference =
                localStorage.getItem("sa11y-remember-labels") === "On";

            let loadChangeRequestPreference =
                localStorage.getItem("sa11y-remember-links-advanced") === "On";

            let loadReadabilityPreference =
                localStorage.getItem("sa11y-remember-readability") === "On";

            sa11ycontainer.innerHTML =

                //Main toggle button.
                `<button type="button" aria-expanded="false" id="sa11y-toggle" aria-describedby="sa11y-notification-badge" aria-label="${Lang._('JOOMLA_A11Y_CHECKER_MAIN_TOGGLE_LABEL')}" disabled>
                    ${MainToggleIcon}
                    <div id="sa11y-notification-badge">
                        <span id="sa11y-notification-count"></span>
                    </div>
                </button>` +

                //Start of main container.
                `<div id="sa11y-panel">` +

                //Page Outline tab.
                `<div id="sa11y-outline-panel" role="tabpanel" aria-labelledby="sa11y-outline-header">
                <div id="sa11y-outline-header" class="sa11y-header-text">
                    <h2 tabindex="-1">${Lang._('JOOMLA_A11Y_CHECKER_PAGE_OUTLINE')}</h2>
                </div>
                <div id="sa11y-outline-content">
                    <ul id="sa11y-outline-list"></ul>
                </div>` +

                //Readability tab.
                `<div id="sa11y-readability-panel">
                    <div id="sa11y-readability-content">
                        <h2 class="sa11y-header-text-inline">${Lang._('JOOMLA_A11Y_CHECKER_READABILITY')}</h2>
                        <p id="sa11y-readability-info"></p>
                        <ul id="sa11y-readability-details"></ul>
                    </div>
                </div>
            </div>` + //End of Page Outline tab.

                //Settings tab.
                `<div id="sa11y-settings-panel" role="tabpanel" aria-labelledby="sa11y-settings-header">
                <div id="sa11y-settings-header" class="sa11y-header-text">
                    <h2 tabindex="-1">${Lang._('JOOMLA_A11Y_CHECKER_SETTINGS')}</h2>
                </div>
                <div id="sa11y-settings-content">
                    <ul id="sa11y-settings-options">
                        <li>
                            <label id="check-contrast" for="sa11y-contrast-toggle">${Lang._('JOOMLA_A11Y_CHECKER_CONTRAST')}</label>
                            <button id="sa11y-contrast-toggle"
                            aria-labelledby="check-contrast"
                            class="sa11y-settings-switch"
                            aria-pressed="${
                                loadContrastPreference ? "true" : "false"
                            }">${loadContrastPreference ? Lang._('JOOMLA_A11Y_CHECKER_ON') : Lang._('JOOMLA_A11Y_CHECKER_OFF')}</button>
                        </li>
                        <li>
                            <label id="check-labels" for="sa11y-labels-toggle">${Lang._('JOOMLA_A11Y_CHECKER_FORM_LABELS')}</label>
                            <button id="sa11y-labels-toggle" aria-labelledby="check-labels" class="sa11y-settings-switch"
                            aria-pressed="${
                                loadLabelsPreference ? "true" : "false"
                            }">${loadLabelsPreference ? Lang._('JOOMLA_A11Y_CHECKER_ON') : Lang._('JOOMLA_A11Y_CHECKER_OFF')}</button>
                        </li>
                        <li>
                            <label id="check-changerequest" for="sa11y-links-advanced-toggle">${Lang._('JOOMLA_A11Y_CHECKER_LINKS_ADVANCED')}<span class="sa11y-badge">AAA</span></label>
                            <button id="sa11y-links-advanced-toggle" aria-labelledby="check-changerequest" class="sa11y-settings-switch"
                            aria-pressed="${
                                loadChangeRequestPreference ? "true" : "false"
                            }">${loadChangeRequestPreference ? Lang._('JOOMLA_A11Y_CHECKER_ON') : Lang._('JOOMLA_A11Y_CHECKER_OFF')}</button>
                        </li>
                        <li>
                            <label id="check-readability" for="sa11y-readability-toggle">${Lang._('JOOMLA_A11Y_CHECKER_READABILITY')}<span class="sa11y-badge">AAA</span></label>
                            <button id="sa11y-readability-toggle" aria-labelledby="check-readability" class="sa11y-settings-switch"
                            aria-pressed="${
                                loadReadabilityPreference ? "true" : "false"
                            }">${loadReadabilityPreference ? Lang._('JOOMLA_A11Y_CHECKER_ON') : Lang._('JOOMLA_A11Y_CHECKER_OFF')}</button>
                        </li>
                        <li>
                            <label id="dark-mode" for="sa11y-theme-toggle">${Lang._('JOOMLA_A11Y_CHECKER_DARK_MODE')}</label>
                            <button id="sa11y-theme-toggle" aria-labelledby="dark-mode" class="sa11y-settings-switch"></button>
                        </li>
                    </ul>
                </div>
            </div>` +

                //Console warning messages.
                `<div id="sa11y-panel-alert">
                <div class="sa11y-header-text">
                    <button id="sa11y-close-alert" class="sa11y-close-btn" aria-label="${Lang._('JOOMLA_A11Y_CHECKER_ALERT_CLOSE')}" aria-describedby="sa11y-alert-heading sa11y-panel-alert-text"></button>
                    <h2 id="sa11y-alert-heading">${Lang._('JOOMLA_A11Y_CHECKER_ALERT_TEXT')}</h2>
                </div>
                <p id="sa11y-panel-alert-text"></p>
                <div id="sa11y-panel-alert-preview"></div>
            </div>` +

                //Main panel that conveys state of page.
                `<div id="sa11y-panel-content">
                <button id="sa11y-cycle-toggle" type="button" aria-label="${Lang._('JOOMLA_A11Y_CHECKER_SHORTCUT_SR')}">
                    <div class="sa11y-panel-icon"></div>
                </button>
                <div id="sa11y-panel-text"><p id="sa11y-status" aria-live="polite"></p></div>
            </div>` +

                //Show Outline & Show Settings button.
                `<div id="sa11y-panel-controls" role="tablist" aria-orientation="horizontal">
                <button type="button" role="tab" aria-expanded="false" id="sa11y-outline-toggle" aria-controls="sa11y-outline-panel">
                    ${Lang._('JOOMLA_A11Y_CHECKER_SHOW_OUTLINE')}
                </button>
                <button type="button" role="tab" aria-expanded="false" id="sa11y-settings-toggle" aria-controls="sa11y-settings-panel">
                    ${Lang._('JOOMLA_A11Y_CHECKER_SHOW_SETTINGS')}
                </button>
                <div style="width:35px"></div>
            </div>` +

                //End of main container.
                `</div>`;

            const pagebody = document.getElementsByTagName("BODY")[0];
            pagebody.prepend(sa11ycontainer);

            //Put before document.ready because of CSS flicker when dark mode is enabled.
            this.settingPanelToggles();

            // Preload before CheckAll function.
            this.sa11yMainToggle();
            this.sanitizeHTMLandComputeARIA();
            this.initializeJumpToIssueTooltip();

            //500ms to let the page settle down (e.g. slow loading JavaScript components).
            setTimeout(() => {
                    document.getElementById("sa11y-toggle").disabled = false;

                    //To-do: Yes, this is total crap and needs to be re-thinked. On document.ready, it crudely checks/annotates the page, and then instantly clears/resets everything except for the badge counter. Need to figure out a way to update badge counter without painting entire page with error buttons.
                    if (localStorage.getItem("sa11y-remember-panel") === "Closed" || localStorage.getItem("sa11y-remember-panel") === null) {
                        this.checkAll();
                        this.resetAll();
                    }
            }, 500);
        }

        //----------------------------------------------------------------------
        // Main toggle button
        //----------------------------------------------------------------------
        sa11yMainToggle() {

            //Keeps checker active when navigating between pages until it is toggled off.
            const sa11yToggle = document.getElementById("sa11y-toggle");
            sa11yToggle.addEventListener('click', (e) => {
                if (localStorage.getItem("sa11y-remember-panel") === "Opened") {
                    localStorage.setItem("sa11y-remember-panel", "Closed");
                    sa11yToggle.classList.remove("sa11y-on")
                    sa11yToggle.setAttribute("aria-expanded", "false");
                    this.resetAll();
                    this.updateBadge();
                    e.preventDefault();
                } else {
                    localStorage.setItem("sa11y-remember-panel", "Opened");
                    sa11yToggle.classList.add("sa11y-on");
                    sa11yToggle.setAttribute("aria-expanded", "true");
                    this.checkAll();
                    //Don't show badge when panel is opened.
                    document.getElementById("sa11y-notification-badge").style.display = 'none';
                    e.preventDefault();
                }
            });

            //Remember to leave it open
            if (localStorage.getItem("sa11y-remember-panel") === "Opened") {
                sa11yToggle.classList.add("sa11y-on");
                sa11yToggle.setAttribute("aria-expanded", "true");
            }

            //Crudely give a little time to load any other content or slow post-rendered JS, iFrames, etc.
            if (sa11yToggle.classList.contains("sa11y-on")) {
                sa11yToggle.classList.toggle("loading-sa11y");
                sa11yToggle.setAttribute("aria-expanded", "true");
                setTimeout(this.checkAll, 800);
            }

            //Escape key to shutdown.
            document.onkeydown = (evt) => {
                evt = evt || window.event;
                var isEscape = false;
                if ("key" in evt) {
                    isEscape = (evt.key === "Escape" || evt.key === "Esc");
                } else {
                    isEscape = (evt.keyCode === 27);
                }
                if (isEscape && document.getElementById("sa11y-panel").classList.contains("sa11y-active")) {
                    tippy.hideAll();
                    sa11yToggle.setAttribute("aria-expanded", "false");
                    sa11yToggle.classList.remove("sa11y-on");
                    sa11yToggle.click();
                    this.resetAll();
                }
            }
        }

        // ============================================================
        // Helpers: Sanitize HTML and compute ARIA for hyperlinks
        // ============================================================
        sanitizeHTMLandComputeARIA() {

            //Helper: Help clean up HTML characters for tooltips and outline panel.
            this.sanitizeForHTML = function (string) {
                let entityMap = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                    "/": "&#x2F;",
                    "`": "&#x60;",
                    "=": "&#x3D;",
                };
                return String(string).replace(/[&<>"'`=\/]/g, function (s) {
                    return entityMap[s];
                });
            };

            //Mini ignore function.
            $.fn.ignore = function (sel) {
                return this.clone().find(sel || ">*").remove().end();
            };

            //Helper: Compute alt text on images within a text node.
            this.computeTextNodeWithImage = function ($el) {
                let returnText = "";
                //No image, has text.
                if ($el.find("img").length === 0 && $el.text().trim().length > 1) {
                    returnText = $el.text().trim();
                }
                //Has image, no text.
                else if ($el.find("img").length && $el.text().trim().length === 0) {
                    let imgalt = $el.find("img").attr("alt");
                    if (imgalt == undefined || imgalt == " " || imgalt == "") {
                        returnText = " ";
                    } else if ($el.find("img").attr("alt") !== undefined) {
                        returnText = imgalt;
                    }
                }
                //Has image and text.
                //To-do: This is a hack? Any way to do this better?
                else if ($el.find("img").length && $el.text().trim().length) {
                    $el.find("img").each(function(){
                       $(this).clone().insertAfter($(this)).replaceWith(" <span class='sa11y-clone-image-text' aria-hidden='true'>" + $(this).attr('alt') + "</span> ");
                    });
                    returnText = $el.text().trim();
                }
                return returnText;
            }

            //Helper: Handle ARIA labels for Link Text module.
            this.computeAriaLabel = function ($el) {

                if ($el.is("[aria-label]")) {
                    return $el.attr("aria-label");
                }
                else if ($el.is("[aria-labelledby]")) {
                    let target = $el.attr("aria-labelledby").split(/\s+/);
                    if (target.length > 0) {
                        let returnText = "";
                        $.each($(target), function (i, el) {
                            returnText += $("#" + el).ignore("span.sa11y-heading-label").text() + " ";
                        });
                        return returnText;
                    } else {
                        return "";
                    }
                }
                //Children of element.
                else if ($el.children().is("[aria-label]")) {
                    return $el.children().attr("aria-label");
                }
                else if ($el.children().is("[title]")) {
                    return $el.children().attr("title");
                }
                else if ($el.children().is("[aria-labelledby]")) {
                    let target = $el.children().attr("aria-labelledby").split(/\s+/);
                    if (target.length > 0) {
                        let returnText = "";
                        $.each($(target), function (i, el) {
                            returnText += $("#" + el).ignore("span.sa11y-heading-label").text() + " ";
                        });
                        return returnText;
                    } else {
                        return "";
                    }
                }
                else {
                    return "noAria";
                }
            };
        }

        //----------------------------------------------------------------------
        // Setting's panel: Additional ruleset toggles.
        //----------------------------------------------------------------------
        settingPanelToggles() {
            //Toggle: Contrast
            const $sa11yContrastCheck = document.getElementById("sa11y-contrast-toggle");
            $sa11yContrastCheck.onclick = async () => {
                if (localStorage.getItem("sa11y-remember-contrast") === "On") {
                    localStorage.setItem("sa11y-remember-contrast", "Off");
                    $sa11yContrastCheck.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_OFF')}`;
                    $sa11yContrastCheck.setAttribute("aria-pressed", "false");
                    this.resetAll(false);
                    await this.checkAll();
                } else {
                    localStorage.setItem("sa11y-remember-contrast", "On");
                    $sa11yContrastCheck.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_ON')}`;
                    $sa11yContrastCheck.setAttribute("aria-pressed", "true");
                    this.resetAll(false);
                    await this.checkAll();
                }
            };

            //Toggle: Form labels
            const $sa11yLabelsCheck = document.getElementById("sa11y-labels-toggle");
            $sa11yLabelsCheck.onclick = async () => {
                if (localStorage.getItem("sa11y-remember-labels") === "On") {
                    localStorage.setItem("sa11y-remember-labels", "Off");
                    $sa11yLabelsCheck.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_OFF')}`;
                    $sa11yLabelsCheck.setAttribute("aria-pressed", "false");
                    this.resetAll(false);
                    await this.checkAll();
                } else {
                    localStorage.setItem("sa11y-remember-labels", "On");
                    $sa11yLabelsCheck.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_ON')}`;
                    $sa11yLabelsCheck.setAttribute("aria-pressed", "true");
                    this.resetAll(false);
                    await this.checkAll();
                }
            };

            //Toggle: Links (Advanced)
            const $sa11yChangeRequestCheck = document.getElementById("sa11y-links-advanced-toggle");
            $sa11yChangeRequestCheck.onclick = async () => {
                if (localStorage.getItem("sa11y-remember-links-advanced") === "On") {
                    localStorage.setItem("sa11y-remember-links-advanced", "Off");
                    $sa11yChangeRequestCheck.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_OFF')}`;
                    $sa11yChangeRequestCheck.setAttribute("aria-pressed", "false");
                    this.resetAll(false);
                    await this.checkAll();
                } else {
                    localStorage.setItem("sa11y-remember-links-advanced", "On");
                    $sa11yChangeRequestCheck.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_ON')}`;
                    $sa11yChangeRequestCheck.setAttribute("aria-pressed", "true");
                    this.resetAll(false);
                    await this.checkAll();
                }
            };

            //Toggle: Readability
            const $sa11yReadabilityCheck = document.getElementById("sa11y-readability-toggle");
            $sa11yReadabilityCheck.onclick = async () => {
                if (localStorage.getItem("sa11y-remember-readability") === "On") {
                    localStorage.setItem("sa11y-remember-readability", "Off");
                    $sa11yReadabilityCheck.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_OFF')}`;
                    $sa11yReadabilityCheck.setAttribute("aria-pressed", "false");
                    document.getElementById("sa11y-readability-panel").classList.remove("sa11y-active");
                    this.resetAll(false);
                    await this.checkAll();
                } else {
                    localStorage.setItem("sa11y-remember-readability", "On");
                    $sa11yReadabilityCheck.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_ON')}`;
                    $sa11yReadabilityCheck.setAttribute("aria-pressed", "true");
                    document.getElementById("sa11y-readability-panel").classList.add("sa11y-active");
                    this.resetAll(false);
                    await this.checkAll();
                }
            };

            if (localStorage.getItem("sa11y-remember-readability") === "On") {
                document.getElementById("sa11y-readability-panel").classList.add("sa11y-active");
            }

            //Toggle: Dark mode. (Credits: https://derekkedziora.com/blog/dark-mode-revisited)

            let systemInitiatedDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            );
            const $sa11yTheme = document.getElementById("sa11y-theme-toggle");
            const html = document.querySelector("html");
            const theme = localStorage.getItem("sa11y-remember-theme");
            if (systemInitiatedDark.matches) {
                $sa11yTheme.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_ON')}`;
                $sa11yTheme.setAttribute("aria-pressed", "true");
            } else {
                $sa11yTheme.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_OFF')}`;
                $sa11yTheme.setAttribute("aria-pressed", "false");
            }

            function prefersColorTest(systemInitiatedDark) {
                if (systemInitiatedDark.matches) {
                    html.setAttribute("data-sa11y-theme", "dark");
                    $sa11yTheme.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_ON')}`;
                    $sa11yTheme.setAttribute("aria-pressed", "true");
                    localStorage.setItem("sa11y-remember-theme", "");
                } else {
                    html.setAttribute("data-sa11y-theme", "light");
                    $sa11yTheme.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_OFF')}`;
                    $sa11yTheme.setAttribute("aria-pressed", "false");
                    localStorage.setItem("sa11y-remember-theme", "");
                }
            }

            systemInitiatedDark.addListener(prefersColorTest);
            $sa11yTheme.onclick = async () => {
                const theme = localStorage.getItem("sa11y-remember-theme");
                if (theme === "dark") {
                    html.setAttribute("data-sa11y-theme", "light");
                    localStorage.setItem("sa11y-remember-theme", "light");
                    $sa11yTheme.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_OFF')}`;
                    $sa11yTheme.setAttribute("aria-pressed", "false");
                } else if (theme === "light") {
                    html.setAttribute("data-sa11y-theme", "dark");
                    localStorage.setItem("sa11y-remember-theme", "dark");
                    $sa11yTheme.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_ON')}`;
                    $sa11yTheme.setAttribute("aria-pressed", "true");
                } else if (systemInitiatedDark.matches) {
                    html.setAttribute("data-sa11y-theme", "light");
                    localStorage.setItem("sa11y-remember-theme", "light");
                    $sa11yTheme.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_OFF')}`;
                    $sa11yTheme.setAttribute("aria-pressed", "false");
                } else {
                    html.setAttribute("data-sa11y-theme", "dark");
                    localStorage.setItem("sa11y-remember-theme", "dark");
                    $sa11yTheme.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_OFF')}`;
                    $sa11yTheme.setAttribute("aria-pressed", "true");
                }
            };
            if (theme === "dark") {
                html.setAttribute("data-sa11y-theme", "dark");
                localStorage.setItem("sa11y-remember-theme", "dark");
                $sa11yTheme.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_ON')}`;
                $sa11yTheme.setAttribute("aria-pressed", "true");
            } else if (theme === "light") {
                html.setAttribute("data-sa11y-theme", "light");
                localStorage.setItem("sa11y-remember-theme", "light");
                $sa11yTheme.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_OFF')}`;
                $sa11yTheme.setAttribute("aria-pressed", "false");
            }
        }

        //----------------------------------------------------------------------
        // Tooltip for Jump-to-Issue button.
        //----------------------------------------------------------------------
        initializeJumpToIssueTooltip() {
            tippy('#sa11y-cycle-toggle', {
                content: `<div style="text-align:center">${Lang._('JOOMLA_A11Y_CHECKER_SHORTCUT_TOOLTIP')} &raquo;<br><span class="sa11y-shortcut-icon"></span></div>`,
                allowHTML: true,
                delay: [900, 0],
                trigger: "mouseenter focusin",
                arrow: true,
                placement: 'top',
                theme: "sa11y-theme",
                aria: {
                    content: null,
                    expanded: false,
                },
                appendTo: document.body,
            });
        }

        // ----------------------------------------------------------------------
        // Check all
        // ----------------------------------------------------------------------
        checkAll = async () => {
            this.errorCount = 0;
            this.warningCount = 0;
            this.root = $(this.options.checkRoot);
            this.readabilityRoot = $(this.options.readabilityRoot);

            this.findElements();

            //Ruleset checks
            this.checkHeaders();
            this.checkLinkText();
            this.checkAltText();

            if (localStorage.getItem("sa11y-remember-contrast") === "On") {
                this.checkContrast();
            }

            if (localStorage.getItem("sa11y-remember-labels") === "On") {
                this.checkLabels();
            }

            if (localStorage.getItem("sa11y-remember-links-advanced") === "On") {
                this.checkLinksAdvanced();
            }

            if (localStorage.getItem("sa11y-remember-readability") === "On") {
                this.checkReadability();
            }

            this.checkEmbeddedContent();
            this.checkQA();

            //Update panel
            if (this.panelActive) {
                this.resetAll();
            } else {
                this.updatePanel();
            }
            this.initializeTooltips();
            this.detectOverflow();

            //Don't show badge when panel is opened.
            if (!document.getElementsByClassName('sa11y-on').length) {
                this.updateBadge();
            }
        };

        // ============================================================
        // Reset all
        // ============================================================
        resetAll (restartPanel = true) {
            this.panelActive = false;
            this.clearEverything();

            //Remove eventListeners on the Show Outline and Show Panel toggles.
            const $outlineToggle = document.getElementById("sa11y-outline-toggle");
            const resetOutline = $outlineToggle.cloneNode(true);
            $outlineToggle.parentNode.replaceChild(resetOutline, $outlineToggle);

            const $settingsToggle = document.getElementById("sa11y-settings-toggle");
            const resetSettings = $settingsToggle.cloneNode(true);
            $settingsToggle.parentNode.replaceChild(resetSettings, $settingsToggle);

            //Errors
            document.querySelectorAll('.sa11y-error-border').forEach((el) => el.classList.remove('sa11y-error-border'));
            document.querySelectorAll('.sa11y-error-heading').forEach((el) => el.classList.remove('sa11y-error-heading'));
            document.querySelectorAll('.sa11y-error-text').forEach((el) => el.classList.remove('sa11y-error-text'));

            //Warnings
            document.querySelectorAll('.sa11y-warning-border').forEach((el) => el.classList.remove('sa11y-warning-border'));
            document.querySelectorAll('.sa11y-warning-text').forEach((el) => el.classList.remove('sa11y-warning-text'));
            document.querySelectorAll('p').forEach((el) => el.classList.remove('sa11y-fake-list'));
            let allcaps = document.querySelectorAll('.sa11y-warning-uppercase');
            allcaps.forEach(el => el.outerHTML = el.innerHTML);

            //Good
            document.querySelectorAll('.sa11y-good-border').forEach((el) => el.classList.remove('sa11y-good-border'));
            document.querySelectorAll('.sa11y-good-text').forEach((el) => el.classList.remove('sa11y-good-text'));

            //Remove
            document.querySelectorAll(`
                .sa11y-instance,
                .sa11y-instance-inline,
                .sa11y-heading-label,
                #sa11y-outline-list li,
                .sa11y-readability-period,
                #sa11y-readability-info span,
                #sa11y-readability-details li,
                .sa11y-clone-image-text
            `).forEach(el => el.parentNode.removeChild(el));

            //Etc
            document.querySelectorAll('.sa11y-overflow').forEach((el) => el.classList.remove('sa11y-overflow'));
            document.querySelectorAll('.sa11y-fake-heading').forEach((el) => el.classList.remove('sa11y-fake-heading'));
            document.querySelectorAll('.sa11y-pulse-border').forEach((el) => el.classList.remove('sa11y-pulse-border'));
            document.querySelector('#sa11y-panel-alert').classList.remove("sa11y-active")

            var empty = document.querySelector('#sa11y-panel-alert-text');
            while(empty.firstChild) empty.removeChild(empty.firstChild);

            var clearStatus = document.querySelector('#sa11y-status');
            while(clearStatus.firstChild) clearStatus.removeChild(clearStatus.firstChild)

            if (restartPanel) {
                document.querySelector('#sa11y-panel').classList.remove("sa11y-active");
            }
        };
        clearEverything () {};

        // ============================================================
        // Initialize tooltips for error/warning/pass buttons: (Tippy.js)
        // Although you can also swap this with Bootstrap's tooltip library for example.
        // ============================================================
        initializeTooltips () {
            tippy(".sa11y-btn", {
                interactive: true,
                trigger: "mouseenter click focusin", //Focusin trigger to ensure "Jump to issue" button displays tooltip.
                arrow: true,
                delay: [200, 0], //Slight delay to ensure mouse doesn't quickly trigger and hide tooltip.
                theme: "sa11y-theme",
                placement: 'bottom',
                allowHTML: true,
                aria: {
                    content: 'describedby',
                },
                appendTo: document.body,
            });
        }

        // ============================================================
        // Detect parent containers that have hidden overflow.
        // ============================================================
        detectOverflow () {
            const findParentWithOverflow = ($el, property, value) => {
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
            const $findButtons = document.querySelectorAll('.sa11y-btn');
            $findButtons.forEach(function ($el) {
                const overflowing = findParentWithOverflow($el, 'overflow', 'hidden');
                if (overflowing !== null) {
                    overflowing.classList.add('sa11y-overflow');
                }
            });
        }

        // ============================================================
        // Update iOS style notification badge on icon.
        // ============================================================
        updateBadge () {
            let totalCount = this.errorCount + this.warningCount;
            let warningCount = this.warningCount;
            const notifBadge = document.getElementById("sa11y-notification-badge");
            if (totalCount === 0) {
                notifBadge.style.display = "none";
            } else if (this.warningCount > 0 && this.errorCount === 0) {
                notifBadge.style.display = "flex";
                notifBadge.classList.add("sa11y-notification-badge-warning");
                document.getElementById('sa11y-notification-count').innerHTML = Lang.sprintf('JOOMLA_A11Y_CHECKER_PANEL_STATUS_10', warningCount);
            } else {
                notifBadge.style.display = "flex";
                notifBadge.classList.remove("sa11y-notification-badge-warning");
                document.getElementById('sa11y-notification-count').innerHTML = Lang.sprintf('JOOMLA_A11Y_CHECKER_PANEL_STATUS_10', totalCount);
            }
        }

        // ----------------------------------------------------------------------
        // Main panel: Display and update panel.
        // ----------------------------------------------------------------------
        updatePanel () {
            this.panelActive = true;
            let totalCount = this.errorCount + this.warningCount;
            let warningCount = this.warningCount;
            let errorCount = this.errorCount;

            this.buildPanel();

            this.skipToIssue();

            const $sa11ySkipBtn = document.getElementById("sa11y-cycle-toggle");

            $sa11ySkipBtn.disabled = false;
            $sa11ySkipBtn.setAttribute("style", "cursor: pointer !important;");

            const $sa11yPanel = document.getElementById("sa11y-panel");
            $sa11yPanel.classList.add("sa11y-active");

            const $panelContent = document.getElementById("sa11y-panel-content");
            const $sa11yStatus = document.getElementById("sa11y-status");
            const $findButtons = document.querySelectorAll('.sa11y-btn');

            if (this.errorCount === 1 && this.warningCount === 1) {
                $panelContent.setAttribute("class", "sa11y-errors");
                $sa11yStatus.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_PANEL_STATUS_1')}`;
            }
            else if (this.errorCount === 1 && this.warningCount > 0) {
                $panelContent.setAttribute("class", "sa11y-errors");
                $sa11yStatus.textContent = Lang.sprintf('JOOMLA_A11Y_CHECKER_PANEL_STATUS_2', warningCount);
            }
            else if (this.errorCount > 0 && this.warningCount === 1) {
                $panelContent.setAttribute("class", "sa11y-errors");
                $sa11yStatus.textContent = Lang.sprintf('JOOMLA_A11Y_CHECKER_PANEL_STATUS_3', errorCount);
            }
            else if (this.errorCount > 0 && this.warningCount > 0) {
                $panelContent.setAttribute("class", "sa11y-errors");
                $sa11yStatus.textContent = Lang.sprintf('JOOMLA_A11Y_CHECKER_PANEL_STATUS_4', errorCount, warningCount);
            }
            else if (this.errorCount > 0) {
                $panelContent.setAttribute("class", "sa11y-errors");
                $sa11yStatus.textContent = this.errorCount === 1 ?
                  Lang._('JOOMLA_A11Y_CHECKER_PANEL_STATUS_5') :
                  Lang.sprintf('JOOMLA_A11Y_CHECKER_PANEL_STATUS_6', errorCount)
                ;
            }
            else if (this.warningCount > 0) {
                $panelContent.setAttribute("class", "sa11y-warnings");
                $sa11yStatus.textContent = totalCount === 1 ?
                    Lang._('JOOMLA_A11Y_CHECKER_PANEL_STATUS_7'):
                    Lang.sprintf('JOOMLA_A11Y_CHECKER_PANEL_STATUS_8', errorCount)
                ;
            }
            else {
                $panelContent.setAttribute("class", "sa11y-good");
                $sa11yStatus.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_PANEL_STATUS_9')}`;

                if ($findButtons.length === 0) {
                    $sa11ySkipBtn.disabled = true;
                    $sa11ySkipBtn.setAttribute("style", "cursor: default !important;");
                }
            }
        };

        // ----------------------------------------------------------------------
        // Main panel: Build Show Outline and Settings tabs.
        // ----------------------------------------------------------------------
        buildPanel = () => {

            const $outlineToggle = document.getElementById("sa11y-outline-toggle");
            const $outlinePanel = document.getElementById("sa11y-outline-panel");
            const $outlineList = document.getElementById("sa11y-outline-list");

            const $settingsToggle = document.getElementById("sa11y-settings-toggle");
            const $settingsPanel = document.getElementById("sa11y-settings-panel");
            const $settingsContent = document.getElementById("sa11y-settings-content");

            const $headingAnnotations = document.querySelectorAll(".sa11y-heading-label");

            //Show outline panel
            $outlineToggle.addEventListener('click', (e) => {
                if ($outlineToggle.getAttribute("aria-expanded") == "true") {
                    $outlineToggle.classList.remove("sa11y-outline-active");
                    $outlinePanel.classList.remove("sa11y-active");
                    $outlineToggle.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_SHOW_OUTLINE')}`;
                    $outlineToggle.setAttribute("aria-expanded", "false");
                    localStorage.setItem("sa11y-remember-outline", "Closed");
                } else {
                    $outlineToggle.classList.add("sa11y-outline-active");
                    $outlinePanel.classList.add("sa11y-active");
                    $outlineToggle.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_HIDE_OUTLINE')}`;
                    $outlineToggle.setAttribute("aria-expanded", "true");
                    localStorage.setItem("sa11y-remember-outline", "Opened");
                }

                //Set focus on Page Outline heading for accessibility.
                document.querySelector("#sa11y-outline-header > h2").focus();

                //Show heading level annotations.
                $headingAnnotations.forEach(($el) => $el.classList.toggle("sa11y-label-visible"));

                //Close Settings panel when Show Outline is active.
                $settingsPanel.classList.remove("sa11y-active");
                $settingsToggle.classList.remove("sa11y-settings-active");
                $settingsToggle.setAttribute("aria-expanded", "false");
                $settingsToggle.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_SHOW_SETTINGS')}`;

                //Keyboard accessibility fix for scrollable panel content.
                if ($outlineList.clientHeight > 250) {
                    $outlineList.setAttribute("tabindex", "0");
                }
            });

            //Remember to leave outline open
            if (localStorage.getItem("sa11y-remember-outline") === "Opened") {
                $outlineToggle.classList.add("sa11y-outline-active");
                $outlinePanel.classList.add("sa11y-active");
                $outlineToggle.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_HIDE_OUTLINE')}`;
                $outlineToggle.setAttribute("aria-expanded", "true");
                $headingAnnotations.forEach(($el) => $el.classList.toggle("sa11y-label-visible"));
                //Keyboard accessibility fix for scrollable panel content.
                if ($outlineList.clientHeight > 250) {
                    $outlineList.setAttribute("tabindex", "0");
                }
            }

            //Show settings panel
            $settingsToggle.addEventListener('click', (e) => {
                if ($settingsToggle.getAttribute("aria-expanded") === "true") {
                    $settingsToggle.classList.remove("sa11y-settings-active");
                    $settingsPanel.classList.remove("sa11y-active");
                    $settingsToggle.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_SHOW_SETTINGS')}`;
                    $settingsToggle.setAttribute("aria-expanded", "false");
                } else {
                    $settingsToggle.classList.add("sa11y-settings-active");
                    $settingsPanel.classList.add("sa11y-active");
                    $settingsToggle.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_HIDE_SETTINGS')}`;
                    $settingsToggle.setAttribute("aria-expanded", "true");
                }

                //Set focus on Settings heading for accessibility.
                document.querySelector("#sa11y-settings-header > h2").focus();

                //Close Show Outline panel when Settings is active.
                $outlinePanel.classList.remove("sa11y-active");
                $outlineToggle.classList.remove("sa11y-outline-active");
                $outlineToggle.setAttribute("aria-expanded", "false");
                $outlineToggle.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_SHOW_OUTLINE')}`;
                $headingAnnotations.forEach(($el) => $el.classList.remove("sa11y-label-visible"));
                localStorage.setItem("sa11y-remember-outline", "Closed");

                //Keyboard accessibility fix for scrollable panel content.
                if ($settingsContent.clientHeight > 350) {
                    $settingsContent.setAttribute("tabindex", "0");
                }
            });

            //Enhanced keyboard accessibility for panel.
            document.getElementById('sa11y-panel-controls').addEventListener('keydown', function(e) {
            const $tab = document.querySelectorAll('#sa11y-outline-toggle[role=tab], #sa11y-settings-toggle[role=tab]');
                if (e.key === 'ArrowRight') {
                    for (let i = 0; i < $tab.length; i++) {
                        if ($tab[i].getAttribute('aria-expanded') === "true" || $tab[i].getAttribute('aria-expanded') === "false") {
                            $tab[i+1].focus();
                            e.preventDefault();
                            break;
                        }
                    }
                }
                if (e.key === 'ArrowDown') {
                    for (let i = 0; i < $tab.length; i++) {
                        if ($tab[i].getAttribute('aria-expanded') === "true" || $tab[i].getAttribute('aria-expanded') === "false") {
                            $tab[i+1].focus();
                            e.preventDefault();
                            break;
                        }
                    }
                }
                if (e.key === 'ArrowLeft') {
                    for (let i = $tab.length-1; i > 0; i--) {
                        if ($tab[i].getAttribute('aria-expanded') === "true" || $tab[i].getAttribute('aria-expanded') === "false") {
                            $tab[i-1].focus();
                            e.preventDefault();
                            break;
                        }
                    }
                }
                if (e.key === 'ArrowUp') {
                    for (let i = $tab.length-1; i > 0; i--) {
                        if ($tab[i].getAttribute('aria-expanded') === "true" || $tab[i].getAttribute('aria-expanded') === "false") {
                            $tab[i-1].focus();
                            e.preventDefault();
                            break;
                        }
                    }
                }
            });

            const $closeAlertToggle = document.getElementById("sa11y-close-alert");
            const $alertPanel = document.getElementById("sa11y-panel-alert");
            const $alertText = document.getElementById("sa11y-panel-alert-text");
            const $sa11ySkipBtn = document.getElementById("sa11y-cycle-toggle");

            $closeAlertToggle.addEventListener('click', () => {
                $alertPanel.classList.remove("sa11y-active");
                while($alertText.firstChild) $alertText.removeChild($alertText.firstChild);
                document.querySelectorAll('.sa11y-pulse-border').forEach((el) => el.classList.remove('sa11y-pulse-border'));
                $sa11ySkipBtn.focus();
            });
        }

        // ============================================================
        // Main panel: Skip to issue button.
        // ============================================================

        skipToIssue = () => {
            /* Polyfill for scrollTo. scrollTo instead of .animate(), so Sa11y could use jQuery slim build. Credit: https://stackoverflow.com/a/67108752 & https://github.com/iamdustan/smoothscroll */
            var reducedMotionQuery = false;
            var scrollBehavior = "smooth";
            if (!('scrollBehavior' in document.documentElement.style)) {
                var js = document.createElement('script');
                js.src = "https://cdn.jsdelivr.net/npm/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js";
                document.head.appendChild(js);
            }
            if (!(document.documentMode)) {
                if (typeof window.matchMedia === "function") {
                    reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
                }
                if (!reducedMotionQuery || reducedMotionQuery.matches) {
                    scrollBehavior = "auto";
                }
            }

            let sa11yBtnLocation = 0;
            const findSa11yBtn = $(".sa11y-btn").length;

            //Jump to issue using keyboard shortcut.
            document.onkeyup = function (e) {
                if (e.altKey && e.code == "Period") {
                    skipToIssueToggle();
                    e.preventDefault();
                }
            };

            //Jump to issue using click.
            const $skipToggle = document.getElementById("sa11y-cycle-toggle");
            $skipToggle.addEventListener('click', (e) => {
                skipToIssueToggle();
                e.preventDefault();
            });

            const skipToIssueToggle = function () {

                //Calculate location of both visible and hidden buttons.
                const $findButtons = document.querySelectorAll('.sa11y-btn');

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

                let visiblePosition = $(".sa11y-btn").eq(sa11yBtnLocation).closest(":visible").offset().top - 50;

                let hiddenPosition = $findButtons[sa11yBtnLocation].offsetTop;

                //let hiddenPosition = $(".sa11y-btn").eq(sa11yBtnLocation).offset().top;

                if (visiblePosition >= 1) {
                    setTimeout(function() {
                        window.scrollTo({
                            top: visiblePosition,
                            behavior: scrollBehavior
                        });
                    },1);

                    $(".sa11y-btn:hidden").each(function () {
                        $(this).parent().closest(":visible").addClass("sa11y-pulse-border");
                    });

                    $findButtons[sa11yBtnLocation].focus();
                }
                else {
                    $findButtons[sa11yBtnLocation].focus();
                }

                const $alertPanel = document.getElementById("sa11y-panel-alert");
                const $alertText = document.getElementById("sa11y-panel-alert-text");
                const $alertPanelPreview = document.getElementById("sa11y-panel-alert-preview");
                const $closeAlertToggle = document.getElementById("sa11y-close-alert");

                //If location is less than 0 = hidden element (e.g. display:none);
                if (hiddenPosition === 0) {
                    $alertPanel.classList.add("sa11y-active");
                    $alertText.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_PANEL_STATUS_1')}`;

                    $alertPanelPreview.innerHTML = $findButtons[sa11yBtnLocation].getAttribute('data-tippy-content');

                    $closeAlertToggle.focus();

                } else if (hiddenPosition < 1) {
                    $alertPanel.classList.remove("sa11y-active");
                    document.querySelectorAll('.sa11y-pulse-border').forEach((el) => el.classList.remove('sa11y-pulse-border'));
                }

                sa11yBtnLocation += 1;
                if (sa11yBtnLocation >= findSa11yBtn) {
                    sa11yBtnLocation = 0;
                }
            };
        }

        // ============================================================
        // Finds all elements and caches them
        // ============================================================
        findElements () {
            let {
                root,
                containerIgnore
            } = this;
            this.$p = root.find("p").not(containerIgnore);
            this.$h = root
                .find("h1, h2, h3, h4, h5, h6, [role='heading'][aria-level]")
                .not(containerIgnore);
        };

        // ============================================================
        // Rulesets: Check Headings
        // ============================================================
        checkHeaders () {
            let prevLevel;
            this.$h.each((i, el) => {
                let $el = $(el);
                let text = this.computeTextNodeWithImage($el);
                let htext = this.sanitizeForHTML(text);
                let level;

                if ($el.attr("aria-level")) {
                    level = +$el.attr("aria-level");
                } else {
                    level = +$el[0].tagName.slice(1);
                }

                let headingLength = $el.text().trim().length;
                let error = null;
                let warning = null;

                if (level - prevLevel > 1 && i !== 0) {
                    error = Lang.sprintf('JOOMLA_A11Y_CHECKER_HEADING_NON_CONSECUTIVE_LEVEL', prevLevel, level);
                } else if ($el.text().trim().length === 0) {
                    if ($el.find("img").length) {
                        const imgalt = $el.find("img").attr("alt");
                        if (imgalt === undefined || imgalt === " " || imgalt === "") {
                            error = Lang.sprintf('JOOMLA_A11Y_CHECKER_HEADING_EMPTY_WITH_IMAGE', level);
                            $el.addClass("sa11y-error-text");
                        }
                    } else {
                        error = Lang.sprintf('JOOMLA_A11Y_CHECKER_HEADING_EMPTY', level);
                        $el.addClass("sa11y-error-text");
                    }
                } else if (i === 0 && level !== 1 && level !== 2) {
                    error = `${Lang._('JOOMLA_A11Y_CHECKER_HEADING_FIRST')}`;
                } else if ($el.text().trim().length > 170) {
                    warning = `${Lang._('JOOMLA_A11Y_CHECKER_HEADING_LONG')} . ${Lang._('JOOMLA_A11Y_CHECKER_HEADING_LONG_INFO', headingLength)}`;
                }

                prevLevel = level;

                let li =
                    `<li class='sa11y-outline-${level}'>
                <span class='sa11y-badge'>${level}</span>
                <span class='sa11y-outline-list-item'>${htext}</span>
            </li>`;

                let liError =
                    `<li class='sa11y-outline-${level}'>
                <span class='sa11y-badge sa11y-error-badge'>
                <span aria-hidden='true'>&#10007;</span>
                <span class='sa11y-visually-hidden'>${Lang._('JOOMLA_A11Y_CHECKER_ERROR')}</span> ${level}</span>
                <span class='sa11y-outline-list-item sa11y-red-text sa11y-bold'>${htext}</span>
            </li>`;

                let liWarning =
                    `<li class='sa11y-outline-${level}'>
                <span class='sa11y-badge sa11y-warning-badge'>
                <span aria-hidden='true'>&#x3f;</span>
                <span class='sa11y-visually-hidden'>${Lang._('JOOMLA_A11Y_CHECKER_WARNING')}</span> ${level}</span>
                <span class='sa11y-outline-list-item sa11y-yellow-text sa11y-bold'>${htext}</span>
            </li>`;

                if ($el.not(this.options.outlineIgnore).length !== 0) {

                    //Append heading labels.
                    $el.not(this.options.outlineIgnore).append(
                        `<span class='sa11y-heading-label'>H${level}</span>`
                    );

                    //Heading errors
                    if (error != null && $el.closest("a").length > 0) {
                        this.errorCount++;
                        $el.addClass("sa11y-error-heading");
                        $el.closest("a").after(this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), error, true));
                        $("#sa11y-outline-list").append(liError);
                    } else if (error != null) {
                        this.errorCount++;
                        $el.addClass("sa11y-error-heading");
                        $el.before(this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), error));
                        $("#sa11y-outline-list").append(liError);
                    }

                    //Heading warnings
                    else if (warning != null && $el.closest("a").length > 0) {
                        this.warningCount++;
                        $el.closest("a").after(this.annotate(Lang._('JOOMLA_A11Y_CHECKER_WARNING'), warning));
                        $("#sa11y-outline-list").append(liWarning);
                    } else if (warning != null) {
                        this.warningCount++;
                        $el.before(this.annotate(Lang._('JOOMLA_A11Y_CHECKER_WARNING'), warning));
                        $("#sa11y-outline-list").append(liWarning);
                    }

                    //Not an error or warning
                    else if (error == null || warning == null) {
                        $("#sa11y-outline-list").append(li);
                    }
                }
            });

            //Check to see there is at least one H1 on the page.
            let $h1 = this.root
                .find("h1, [role='heading'][aria-level='1']")
                .not(this.containerIgnore);
            if ($h1.length === 0) {
                this.errorCount++;

                $("#sa11y-outline-header").after(
                    `<div class='sa11y-instance sa11y-missing-h1'>
                    <span class='sa11y-badge sa11y-error-badge'><span aria-hidden='true'>&#10007;</span><span class='sa11y-visually-hidden'>${Lang._('JOOMLA_A11Y_CHECKER_ERROR')}</span></span>
                    <span class='sa11y-red-text sa11y-bold'>${Lang._('JOOMLA_A11Y_CHECKER_PANEL_HEADING_MISSING_ONE')}</span>
                </div>`
                );

                $("#sa11y-container").after(
                    this.annotateBanner(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_HEADING_MISSING_ONE')}`)
                );
            }
        };

        // ============================================================
        // Rulesets: Link text
        // ============================================================
        checkLinkText () {
            const containsLinkTextStopWords = (textContent) => {
                let urlText = [
                    "http",
                    ".asp",
                    ".htm",
                    ".php",
                    ".edu/",
                    ".com/",
                    ".net/",
                    ".org/",
                    ".us/",
                    ".ca/",
                    ".de/",
                    ".icu/",
                    ".uk/",
                    ".ru/",
                    ".info/",
                    ".top/",
                    ".xyz/",
                    ".tk/",
                    ".cn/",
                    ".ga/",
                    ".cf/",
                    ".nl/",
                    ".io/"
                ];

                let hit = [null, null, null];

                // Flag partial stop words.
                $.each(this.options.partialAltStopWords, function (index, word) {
                    if (
                        textContent.length === word.length &&
                        textContent.toLowerCase().indexOf(word) >= 0
                    ) {
                        hit[0] = word;
                        return false;
                    }
                });

                // Other warnings we want to add.
                $.each(this.options.warningAltWords, function (index, word) {
                    if (textContent.toLowerCase().indexOf(word) >= 0) {
                        hit[1] = word;
                        return false;
                    }
                });

                // Flag link text containing URLs.
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

            let $links = this.root.find("a[href]").not(this.linkIgnore);

            $links.each((i, el) => {
                let $el = $(el);
                let linkText = this.computeAriaLabel($el);

                var hasAriaLabelledBy = $el.attr("aria-labelledby");
                var hasAriaLabel = $el.attr("aria-label");
                var hasTitle = $el.attr("title");
                var childAriaLabelledBy = $el.children().attr("aria-labelledby");
                var childAriaLabel = $el.children().attr("aria-label");
                var childTitle = $el.children().attr("title");

                var error = containsLinkTextStopWords($el.ignore(this.options.linkIgnoreSpan).text().trim());

                if (linkText === "noAria") {
                    linkText = $el.text();
                }

                //Flag empty hyperlinks
                if ( $el.attr('href') && !$el.text().trim()) {
                    if ($el.find("img").length) {
                        // Do nothing
                    } else if (hasAriaLabelledBy != null || hasAriaLabel != null) {
                        $el.addClass("sa11y-good-border")
                        $el.before(
                            this.annotate(Lang._('JOOMLA_A11Y_CHECKER_GOOD'), Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_LABEL', linkText), true)
                        );
                    } else if (hasTitle != null) {
                        let linkText = $el.attr("title");
                        $el.addClass("sa11y-good-border")
                        $el.before(
                            this.annotate(Lang._('JOOMLA_A11Y_CHECKER_GOOD'), Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_LABEL', linkText), true)
                        );
                    } else if ($el.children().length) {
                        if (childAriaLabelledBy != null || childAriaLabel != null || childTitle != null) {
                            $el.addClass("sa11y-good-border");
                            $el.before(
                                this.annotate(Lang._('JOOMLA_A11Y_CHECKER_GOOD'), Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_LABEL', linkText), true)
                            );
                        } else {
                            this.errorCount++;
                            $el.addClass("sa11y-error-border");
                            $el.after(this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), Lang._('JOOMLA_A11Y_CHECKER_LINK_EMPTY_LINK_NO_LABEL'), true));
                        }
                    } else {
                        this.errorCount++;
                        $el.addClass("sa11y-error-border");
                        $el.after(this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_LINK_EMPTY')}`, true));
                    }
                } else if (error[0] !== null) {
                    if (hasAriaLabelledBy) {
                        $el.before(
                            this.annotate(Lang._('JOOMLA_A11Y_CHECKER_GOOD'), Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_LABEL', linkText), true)
                        );
                    } else if (hasAriaLabel) {
                        $el.before(
                            this.annotate(Lang._('JOOMLA_A11Y_CHECKER_GOOD'), M["linkLabel"](hasAriaLabel), true)
                        );
                    } else if ($el.attr("aria-hidden") === "true" && $el.attr("tabindex") === "-1") {
                        //Do nothing.
                    } else {
                        this.errorCount++;
                        $el.addClass("sa11y-error-text");
                        $el.after(
                          this.annotate(
                            Lang._('JOOMLA_A11Y_CHECKER_ERROR'),
                            `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_STOPWORD', error[0])} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LINK_STOPWORD_TIP')}`,
                            true
                          )
                        );
                    }
                } else if (error[1] !== null) {
                    this.warningCount++;
                    $el.addClass("sa11y-warning-text");
                    $el.after(
                      this.annotate(
                        Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                        `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_BEST_PRACTICES', error[1])} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LINK_BEST_PRACTICES_DETAILS')}`,
                        true
                      )
                    );
                } else if (error[2] != null) {
                    if (linkText.length > 40) {
                        this.warningCount++;
                        $el.addClass("sa11y-warning-text");
                        $el.after(
                          this.annotate(
                            Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                            `${Lang._('JOOMLA_A11Y_CHECKER_LINK_URL')} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LINK_URL_TIP')}`,
                            true
                          )
                        );
                    }
                }
            });
        };

        // ============================================================
        // Rulesets: Links (Advanced)
        // ============================================================
        checkLinksAdvanced () {

            //const M = sa11yIM["linksAdvanced"];

            let $linksTargetBlank = this.root
                .find("a[href]")
                .not(this.linkIgnore)
                .not("#sa11y-container a")
                .not(".sa11y-exclude");

            var seen = {};
            $linksTargetBlank.each((i, el) => {
                let $el = $(el);
                let linkText = this.computeAriaLabel($el);

                if (linkText === "noAria") {
                    linkText = $el.text();
                }

                const fileTypeMatch = $el.filter(`
                    a[href$='.pdf'],
                    a[href$='.doc'],
                    a[href$='.zip'],
                    a[href$='.mp3'],
                    a[href$='.txt'],
                    a[href$='.exe'],
                    a[href$='.dmg'],
                    a[href$='.rtf'],
                    a[href$='.pptx'],
                    a[href$='.ppt'],
                    a[href$='.xls'],
                    a[href$='.xlsx'],
                    a[href$='.csv'],
                    a[href$='.mp4'],
                    a[href$='.mov'],
                    a[href$='.avi']
                `).length;

                //Links with identical accessible names have equivalent purpose.

                //If link has an image, process alt attribute,
                //To-do: Kinda hacky. Doesn't return accessible name of link in correct order.
                var alt = $el.find("img").attr("alt");
                if (alt === undefined) {
                    alt = "";
                }

                //Return link text and image's alt text.
                var linkTextTrimmed = linkText.trim().toLowerCase() + " " + alt;
                var href = $el.attr("href");

                if (seen[linkTextTrimmed] && linkTextTrimmed.length !== 0) {
                    if (seen[href]) {
                        //Nothing
                    } else {
                        this.warningCount++;
                        $el.addClass("sa11y-warning-text");
                        $el.after(
                          this.annotate(
                            Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                            `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_IDENTICAL_NAME', linkText)} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LINK_IDENTICAL_NAME_TIP')}`,
                            true
                          )
                        );
                    }
                } else {
                    seen[linkTextTrimmed] = true;
                    seen[href] = true;
                }

                //New tab or new window.
                const containsNewWindowPhrases = this.options.newWindowPhrases.some(function (pass) {
                    return linkText.toLowerCase().indexOf(pass) >= 0;
                });

                //Link that points to a file type indicates that it does.
                const containsFileTypePhrases = this.options.fileTypePhrases.some(function (pass) {
                    return linkText.toLowerCase().indexOf(pass) >= 0;
                });

                if ($el.attr("target") === "_blank" && fileTypeMatch === 0 && !containsNewWindowPhrases) {
                    this.warningCount++;
                    $el.addClass("sa11y-warning-text");
                    $el.after(
                      this.annotate(
                        Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                        `${Lang._('JOOMLA_A11Y_CHECKER_NEW_TAB_WARNING')} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_NEW_TAB_WARNING_TIP')}`,
                        true
                      )
                    );
                }

                if (fileTypeMatch === 1 && !containsFileTypePhrases) {
                    this.warningCount++;
                    $el.addClass("sa11y-warning-text");
                    $el.after(
                      this.annotate(
                        Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                        `${Lang._('JOOMLA_A11Y_CHECKER_FILE_TYPE_WARNING')} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_FILE_TYPE_WARNING_TIP')}`,
                        true
                      )
                    );
                 }
            });
        }

        // ============================================================
        // Ruleset: Alternative text
        // ============================================================
        checkAltText () {
            this.containsAltTextStopWords = (alt) => {
                const altUrl = [
                    ".png",
                    ".jpg",
                    ".jpeg",
                    ".gif",
                    ".tiff",
                    ".svg"
                ];

                let hit = [null, null, null];
                altUrl.forEach((word) => {
                    if (alt.toLowerCase().indexOf(word) >= 0) {
                        hit[0] = word;
                    }
                });
                this.options.suspiciousAltWords.forEach((word) => {
                    if (alt.toLowerCase().indexOf(word) >= 0) {
                        hit[1] = word;
                    }
                });
                this.options.placeholderAltStopWords.forEach((word) => {
                    if (alt.length === word.length && alt.toLowerCase().indexOf(word) >= 0) {
                        hit[2] = word;
                    }
                });
                return hit;
            };

            // Stores the corresponding issue text to alternative text
            const container = document.querySelector(this.options.checkRoot);

            const images = Array.from(container.querySelectorAll("img"));
            const excludeimages = Array.from(container.querySelectorAll(this.imageIgnore));
            const $img = images.filter($el => !excludeimages.includes($el));

            $img.forEach(($el) => {
                let alt = $el.getAttribute("alt")
                if (alt == undefined) {
                    if ($el.closest('a[href]')) {
                        if ($el.closest('a[href]').textContent.trim().length > 1) {
                            $el.classList.add("sa11y-error-border");
                            $el.closest('a[href]').insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_MISSING_ALT_LINK_BUT_HAS_TEXT_MESSAGE')}`, false, true));
                        }
                        else if ($el.closest('a[href]').textContent.trim().length == 0) {
                            $el.classList.add("sa11y-error-border");
                            $el.closest('a[href]').insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_MISSING_ALT_LINK_MESSAGE')}`, false, true));
                        }
                    }
                    // General failure message if image is missing alt.
                    else {
                        $el.classList.add("sa11y-error-border");
                        $el.insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_MISSING_ALT_MESSAGE')}`, false, true));
                    }
                }
                // If alt attribute is present, further tests are done.
                else {
                    let altText = this.sanitizeForHTML(alt); //Prevent tooltip from breaking.
                    let error = this.containsAltTextStopWords(altText);
                    let altLength = alt.length;

                    // Image fails if a stop word was found.
                    if (error[0] != null && $el.closest("a[href]")) {
                        this.errorCount++;
                        $el.classList.add("sa11y-error-border");
                        $el.closest("a[href]").insertAdjacentHTML(
                          'beforebegin',
                          this.annotate(
                            Lang._('JOOMLA_A11Y_CHECKER_ERROR'),
                            `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_IMAGE_BAD_ALT_MESSAGE', altText, error[0])} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LINK_IMAGE_BAD_ALT_MESSAGE_INFO')}`,
                            false
                          )
                        );
                    }
                    else if (error[2] != null && $el.closest("a[href]")) {
                        this.errorCount++;
                        $el.classList.add("sa11y-error-border");
                        $el.closest("a[href]").insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_LINK_IMAGE_PLACEHOLDER_ALT_MESSAGE')}`, false, true));
                    }
                    else if (error[1] != null && $el.closest("a[href]")) {
                        this.warningCount++;
                        $el.classList.add("sa11y-warning-border");
                        $el.closest("a[href]").insertAdjacentHTML(
                          'beforebegin',
                          this.annotate(
                            Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                            `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_IMAGE_SUS_ALT_MESSAGE', altText, error[1])} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LINK_IMAGE_SUS_ALT_MESSAGE_INFO')}`,
                            false
                          )
                        );
                    }
                    else if (error[0] != null) {
                        this.errorCount++;
                        $el.classList.add("sa11y-error-border");
                        $el.insertAdjacentHTML(
                          'beforebegin',
                          this.annotate(
                            Lang._('JOOMLA_A11Y_CHECKER_ERROR'),
                            `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_ALT_HAS_BAD_WORD_MESSAGE', altText)} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LINK_ALT_HAS_BAD_WORD_MESSAGE_INFO')}`,
                            false
                          )
                        );
                    }
                    else if (error[2] != null) {
                        this.errorCount++;
                        $el.classList.add("sa11y-error-border");
                        $el.insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_ALT_PLACEHOLDER_MESSAGE', altText)}`, false));
                    }
                    else if (error[1] != null) {
                        this.warningCount++;
                        $el.classList.add("sa11y-warning-border");
                        $el.insertAdjacentHTML(
                          'beforebegin',
                          this.annotate(
                            Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                            `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_ALT_HAS_SUS_WORD_MESSAGE', altText, error[1])} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LINK_ALT_HAS_SUS_WORD_MESSAGE_INFO')}`,
                            false
                          )
                        );
                    }
                    else if ((alt == "" || alt == " ") && $el.closest("a[href]")) {
                        if ($el.closest("a[href]").getAttribute("tabindex") == "-1" && $el.closest("a[href]").getAttribute("aria-hidden") == "true") {
                            //Do nothing.
                        }
                        else if ($el.closest("a[href]").getAttribute("aria-hidden") == "true") {
                            this.errorCount++;
                            $el.classList.add("sa11y-error-border");
                            $el.closest("a[href]").insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_LINK_HYPERLINKED_IMAGE_ARIA_HIDDEN')}`, false, true));
                        }
                        else if ($el.closest("a[href]").textContent.trim().length == 0) {
                            this.errorCount++;
                            $el.classList.add("sa11y-error-border");
                            $el.closest("a[href]").insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_LINK_IMAGE_LINK_NULL_ALT_NO_TEXT_MESSAGE')}`, false, true));
                        }
                        else {
                            $el.closest("a[href]").insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_GOOD'), `${Lang._('JOOMLA_A11Y_CHECKER_LINK_LINK_HAS_ALT_MESSAGE')}`, false, true));
                        }
                    }

                    //Link and contains alt text.
                    else if (alt.length > 250 && $el.closest("a[href]")) {
                        this.warningCount++;
                        $el.classList.add("sa11y-warning-border");
                        $el.closest("a[href]").insertAdjacentHTML(
                          'beforebegin',
                          this.annotate(
                            Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                            `${Lang.sprintf('JOOMLA_A11Y_CHECKER_HYPERLINK_ALT_LENGTH_MESSAGE', altText, altLength)} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_HYPERLINK_ALT_LENGTH_MESSAGE_INFO')}`,
                            false
                          )
                        );
                    }

                    //Link and contains an alt text.
                    else if (alt != "" && $el.closest("a[href]") && $el.closest("a[href]").textContent.trim().length == 0) {
                        this.warningCount++;
                        $el.classList.add("sa11y-warning-border");
                        $el.closest("a[href]").insertAdjacentHTML(
                          'beforebegin',
                          this.annotate(
                            Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                            `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_IMAGE_LINK_ALT_TEXT_MESSAGE', altText)} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LINK_IMAGE_LINK_ALT_TEXT_MESSAGE_INFO')}`,
                            false
                          )
                        );
                    }

                    //Contains alt text & surrounding link text.
                    else if (alt != "" && $el.closest("a[href]") && $el.closest("a[href]").textContent.trim().length > 1) {
                        this.warningCount++;
                        $el.classList.add("sa11y-warning-border");
                        $el.closest("a[href]").insertAdjacentHTML(
                          'beforebegin',
                          this.annotate(Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                            `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_ANCHOR_LINK_AND_ALT_MESSAGE', altText)} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LINK_ANCHOR_LINK_AND_ALT_MESSAGE_INFO')}`,
                            false
                          )
                        );
                    }

                    //Decorative alt and not a link. TODO: ADD NOT (ANCHOR) SELECTOR
                    else if (alt == "" || alt == " ") {
                        this.warningCount++;
                        $el.classList.add("sa11y-warning-border");
                        $el.insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_WARNING'),  `${Lang._('JOOMLA_A11Y_CHECKER_LINK_DECORATIVE_MESSAGE')}`, false, true));
                    }
                    else if (alt.length > 250) {
                        this.warningCount++;
                        $el.classList.add("sa11y-warning-border");
                        $el.insertAdjacentHTML(
                          'beforebegin',
                          this.annotate(Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                            `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_ALT_TOO_LONG_MESSAGE', altText, altLength)} ${Lang._('JOOMLA_A11Y_CHECKER_LINK_ALT_TOO_LONG_MESSAGE_INFO')}`,
                            false
                          )
                        );
                    }
                    else if (alt != "") {
                        $el.insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_GOOD'),  `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LINK_PASS_ALT', altText)}`, false, true));
                    }
                }
            });
        };

        // ============================================================
        // Rulesets: Labels
        // ============================================================
        checkLabels () {

            let $inputs = this.root
                .find("input, select, textarea")
                .not(this.containerIgnore)
                .not("input:hidden");

            $inputs.each((i, el) => {
                let $el = $(el);
                let ariaLabel = this.computeAriaLabel($el);

                //If button type is submit or button: pass
                if ($el.attr("type") === "submit" || $el.attr("type") === "button" || $el.attr("type") === "hidden") {
                    //Do nothing
                }
                //Inputs where type="image".
                else if ($el.attr("type") === "image") {
                    let imgalt = $el.attr("alt");
                    if (imgalt == undefined || imgalt == "" || imgalt == " ") {
                        if ($el.attr("aria-label") !== undefined) {
                            //Good.
                        } else {
                            this.errorCount++;
                            $el.addClass("sa11y-error-border");
                            $el.after(this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_LABELS_MISSING_IMAGE_INPUT_MESSAGE')}`, true));
                        }
                    }
                }
                //Recommendation to remove reset buttons.
                else if ($el.attr("type") === "reset") {
                    this.warningCount++;
                    $el.addClass("sa11y-warning-border");
                    $el.after(this.annotate(
                      Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                      `${Lang._('JOOMLA_A11Y_CHECKER_LABELS_INPUT_RESET_MESSAGE')} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LABELS_INPUT_RESET_MESSAGE_TIP')}`,
                      true
                      )
                    );
                }
                //Uses ARIA. Warn them to ensure there's a visible label.
                else if ($el.attr("aria-label") || $el.attr("aria-labelledby") || $el.attr("title")) {
                    if ($el.attr("title")) {
                        let ariaLabel = $el.attr("title");
                        this.warningCount++;
                        $el.addClass("sa11y-warning-border");
                        $el.after(this.annotate(
                          Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                          `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LABELS_ARIA_LABEL_INPUT_MESSAGE', ariaLabel)} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LABELS_ARIA_LABEL_INPUT_MESSAGE_INFO')}`,
                          true
                          )
                        );
                    } else {
                        this.warningCount++;
                        $el.addClass("sa11y-warning-border");
                        $el.after(this.annotate(
                          Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                          `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LABELS_ARIA_LABEL_INPUT_MESSAGE', ariaLabel)} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LABELS_ARIA_LABEL_INPUT_MESSAGE_INFO')}`,
                          true)
                        );
                    }
                }
                //Implicit labels.
                else if (
                    $el.parents().is("label") &&
                    $el.parents("label").text().trim().length !== 0
                    ) {
                    //Do nothing if label has text.
                }
                //Has an ID but doesn't have a matching FOR attribute.
                else if ($el.attr("id") && ($el.prevAll().is("label")) || $el.nextAll().is("label")) {
                    let prevlabel = $el.prevAll("label");
                    let nextlabel = $el.nextAll("label");
                    if (
                        (prevlabel.attr("for") === $el.attr("id")) ||
                        (nextlabel.attr("for") === $el.attr("id"))
                        ) {
                        //Do nothing.
                    } else {
                        this.errorCount++;
                        $el.addClass("sa11y-error-border");
                        $el.after(this.annotate(
                          Lang._('JOOMLA_A11Y_CHECKER_ERROR'),
                          `${Lang.sprintf('JOOMLA_A11Y_CHECKER_LABELS_NO_FOR_ATTRIBUTE_MESSAGE', $el.attr("id"))} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_LABELS_NO_FOR_ATTRIBUTE_MESSAGE_INFO')}`,
                          true)
                        );
                    }
                }
                else {
                    this.errorCount++;
                    $el.addClass("sa11y-error-border");
                    $el.after(this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_LABELS_MISSING_LABEL_MESSAGE')}`, true));
                }
            });
        };

        // ============================================================
        // Rulesets: Embedded content.
        // ============================================================
        checkEmbeddedContent() {

            const container = document.querySelector(this.options.checkRoot);
            const containerexclusions = Array.from(container.querySelectorAll(this.containerIgnore));

            const $findiframes = Array.from(container.querySelectorAll("iframe, audio, video"));
            const $iframes = $findiframes.filter($el => !containerexclusions.includes($el));

            //Warning: Video content.
            const $videos = $iframes.filter($el => $el.matches($sa11yVideos));
            $videos.forEach(($el) => {
                let track = $el.getElementsByTagName('TRACK');
                if ($el.tagName === "VIDEO" && track.length) {

                } else {
                    this.warningCount++;
                    $el.classList.add("sa11y-warning-border");
                    $el.insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_WARNING'), `${Lang._('JOOMLA_A11Y_CHECKER_EMBED_VIDEO')}`));
                }
            });

            //Warning: Audio content.
            const $audio = $iframes.filter($el => $el.matches($sa11yAudio));
            $audio.forEach(($el) => {
                this.warningCount++;
                $el.classList.add("sa11y-warning-border");
                $el.insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_WARNING'), `${Lang._('JOOMLA_A11Y_CHECKER_EMBED_AUDIO')}`));
              });

            //Error: iFrame is missing accessible name.
            $iframes.forEach(($el) => {
                if ($el.tagName === "VIDEO" ||
                    $el.tagName === "AUDIO" ||
                    $el.getAttribute("aria-hidden") === "true" ||
                    $el.getAttribute("hidden") !== null ||
                    $el.style.display == 'none' ||
                    $el.getAttribute("role") === "presentation")
                    {
                        //Ignore if hidden.
                    }
                else if ($el.getAttribute("title") === null || $el.getAttribute("title") === '') {
                    if ($el.getAttribute("aria-label") === null || $el.getAttribute("aria-label") === '') {
                        if ($el.getAttribute("aria-labelledby") === null) {
                            //Make sure red error border takes precedence
                            if ($el.classList.contains("sa11y-warning-border")) {
                                $el.classList.remove("sa11y-warning-border");
                            }
                            this.errorCount++;
                            $el.classList.add("sa11y-error-border");
                            $el.insertAdjacentHTML('beforebegin',
                                this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_EMBED_MISSING_TITLE')}`)
                            );
                        }
                    }
                }
                else {
                    //Nothing
                }
            });

            const $embeddedcontent = $iframes.filter($el => !$el.matches($sa11yAllEmbeddedContent));
            $embeddedcontent.forEach($el => {
                if ($el.tagName === "VIDEO" ||
                    $el.tagName === "AUDIO" ||
                    $el.getAttribute("aria-hidden") === "true" ||
                    $el.getAttribute("hidden") !== null ||
                    $el.style.display == 'none' ||
                    $el.getAttribute("role") === "presentation" ||
                    $el.getAttribute("tabindex") === "-1")
                    {
                        //Ignore if hidden.
                    }
                else {
                    this.warningCount++;
                    $el.classList.add("sa11y-warning-border");
                    $el.insertAdjacentHTML('beforebegin',
                        this.annotate(Lang._('JOOMLA_A11Y_CHECKER_WARNING'), `${Lang._('JOOMLA_A11Y_CHECKER_EMBED_GENERAL_WARNING')}`)
                    );
                }
            });
        }

        // ============================================================
        // Rulesets: QA
        // ============================================================
        checkQA() {

            const container = document.querySelector(this.options.checkRoot);
            const containerexclusions = Array.from(container.querySelectorAll(this.containerIgnore));

            //Error: Find all links pointing to development environment.
            const $findbadDevLinks = this.options.linksToFlag ? Array.from(container.querySelectorAll(this.options.linksToFlag)) : [];
            const $badDevLinks = $findbadDevLinks.filter($el => !containerexclusions.includes($el));
            $badDevLinks.forEach(($el) => {
                this.errorCount++;
                $el.classList.add("sa11y-error-text");
                $el.insertAdjacentHTML('afterend', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), Lang.sprintf('JOOMLA_A11Y_CHECKER_QA_BAD_LINK', $el.attr('href')), true));
            });

            //Warning: Find all PDFs. Although only append warning icon to first PDF on page.
            let checkPDF = this.root
                .find("a[href$='.pdf']")
                .not(this.containerIgnore);
            let firstPDF = this.root
                .find("a[href$='.pdf']:first")
                .not(this.containerIgnore);
            let pdfCount = checkPDF.length;
            if (checkPDF.length > 0) {
                this.warningCount++;
                checkPDF.addClass("sa11y-warning-text");
                checkPDF.has("img").removeClass("sa11y-warning-text");
                firstPDF.after(this.annotate(Lang._('JOOMLA_A11Y_CHECKER_WARNING'), Lang.sprintf('JOOMLA_A11Y_CHECKER_QA_BAD_LINK', pdfCount), true));
            }

            //Warning: Detect uppercase.
            const $findallcaps = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li:not([class^='sa11y']), blockquote"));
            const $allcaps = $findallcaps.filter($el => !containerexclusions.includes($el));
            $allcaps.forEach(function ($el) {
                var uppercasePattern = /(?!<a[^>]*?>)(\b[A-Z][',!:A-Z\s]{15,}|\b[A-Z]{15,}\b)(?![^<]*?<\/a>)/g;

                var html = $el.innerHTML;
                $el.innerHTML = html.replace(uppercasePattern, "<span class='sa11y-warning-uppercase'>$1</span>");
            });

            const $warningUppercase = document.querySelectorAll(".sa11y-warning-uppercase");

            $warningUppercase.forEach(($el) => {
                $el.insertAdjacentHTML('afterend', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_WARNING'), `${Lang._('JOOMLA_A11Y_CHECKER_QA_UPPERCASE_WARNING')}`, true));
            });

            if ($warningUppercase.length > 0) {
                this.warningCount++;
            }

            //Tables check.
            const $findtables = Array.from(container.querySelectorAll("table:not([role='presentation'])"));
            const $tables = $findtables.filter($el => !containerexclusions.includes($el));
            $tables.forEach(($el) => {
                let findTHeaders = $el.querySelectorAll("th");
                let findHeadingTags = $el.querySelectorAll("h1, h2, h3, h4, h5, h6");
                if (findTHeaders.length == 0) {
                    this.errorCount++;
                    $el.classList.add("sa11y-error-border");
                    $el.insertAdjacentHTML('beforebegin',
                      this.annotate(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_TABLES_MISSING_HEADINGS')}`)
                    );
                }
                if (findHeadingTags.length > 0) {
                    this.errorCount++;
                    findHeadingTags.forEach(($el) => {
                        $el.classList.add("sa11y-error-heading");
                        $el.parentNode.classList.add("sa11y-error-border");
                        $el.insertAdjacentHTML(
                          'beforebegin',
                          this.annotate(
                            Lang._('JOOMLA_A11Y_CHECKER_ERROR'),
                            `${Lang._('JOOMLA_A11Y_CHECKER_TABLES_SEMANTIC_HEADING')} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_TABLES_SEMANTIC_HEADING_INFO')}`
                          )
                        );
                    });
                }
                findTHeaders.forEach(($el) => {
                    if ($el.textContent.trim().length == 0) {
                        this.errorCount++;
                        $el.classList.add("sa11y-error-border");
                        $el.innerHTML = this.annotate(
                          Lang._('JOOMLA_A11Y_CHECKER_ERROR'),
                          `${Lang._('JOOMLA_A11Y_CHECKER_TABLES_EMPTY_HEADING')} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_TABLES_EMPTY_HEADING_INFO')}`
                        );
                    }
                });
            });

            //Error: Missing language tag. Lang should be at least 2 characters.
            const lang = document.querySelector("html").getAttribute("lang");
            if (lang == undefined || lang.length < 2) {
                this.errorCount++;
                const sa11yContainer = document.getElementById("sa11y-container");
                sa11yContainer.insertAdjacentHTML('afterend', this.annotateBanner(Lang._('JOOMLA_A11Y_CHECKER_ERROR'), `${Lang._('JOOMLA_A11Y_CHECKER_QA_PAGE_LANGUAGE_MESSAGE')}`));
            }

            //Excessive bolding or italics.
            const $findstrongitalics = Array.from(container.querySelectorAll("strong, em"));
            const $strongitalics = $findstrongitalics.filter($el => !containerexclusions.includes($el));
            $strongitalics.forEach(($el) => {
                if ($el.textContent.trim().length > 400) {
                    this.warningCount++;
                    $el.insertAdjacentHTML('beforebegin', this.annotate(Lang._('JOOMLA_A11Y_CHECKER_WARNING'), `${Lang._('JOOMLA_A11Y_CHECKER_QA_BAD_ITALICS')}`));
                  }
            });

            //Find blockquotes used as headers.
            const $findblockquotes = Array.from(container.querySelectorAll("blockquote"));
            const $blockquotes = $findblockquotes.filter($el => !containerexclusions.includes($el));
            $blockquotes.forEach(($el, i) => {
                let bqHeadingText = $el.textContent;
                if (bqHeadingText.trim().length < 25) {
                    this.warningCount++;
                    $el.classList.add("sa11y-warning-border");
                    $el.insertAdjacentHTML(
                      'beforebegin',
                      this.annotate(
                        Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                        `${Lang.sprintf('JOOMLA_A11Y_CHECKER_QA_BLOCKQUOTE_MESSAGE', bqHeadingText)} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_QA_BLOCKQUOTE_MESSAGE_TIP')}`
                      )
                    );
                }
            });

            // Warning: Detect fake headings.
            this.$p.each((i, el) => {
                let $el = $(el);
                let brAfter = $el.html().indexOf("</strong><br>");
                let brBefore = $el.html().indexOf("<br></strong>");

                //Check paragraphs greater than x characters.
                if ($el && $el.text().trim().length >= 300) {
                    var firstChild = $el.contents()[0];

                    //If paragraph starts with <strong> tag and ends with <br>.
                    if ($(firstChild).is("strong") && (brBefore !== -1 || brAfter !== -1)) {
                        let boldtext = $el.find("strong").text();

                        if ($el && boldtext.length <= 120) {
                            $el.find("strong").addClass("sa11y-fake-heading sa11y-error-heading");
                            $el.before(
                              this.annotate(
                                Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                                `${Lang.sprintf('JOOMLA_A11Y_CHECKER_QA_FAKE_HEADING', boldtext)} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_QA_FAKE_HEADING_INFO')}`
                              )
                            );
                        }
                    }
                }

                // If paragraph only contains <p><strong>...</strong></p>.
                let $fakeHeading = $el.filter(function () {
                    return /^<(strong)>.+<\/\1>$/.test($.trim($(this).html()));
                });

                //Although only flag if it:
                // 1) Has less than 120 characters (typical heading length).
                // 2) The previous element is not a heading.
                if ($fakeHeading.text().length <= 120 && $fakeHeading.prev(this.$h).length !== 1 && $fakeHeading.next(this.$p).length === 1) {
                    let boldtext = $fakeHeading.text();
                    $fakeHeading.addClass("sa11y-fake-heading sa11y-error-heading");
                    $fakeHeading.find("strong").after(
                      this.annotate(
                        Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                        `${Lang.sprintf('JOOMLA_A11Y_CHECKER_QA_FAKE_HEADING', boldtext)} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_QA_FAKE_HEADING_INFO')}`
                      )
                    );
                }

            });
            if ($(".sa11y-fake-heading").length > 0) {
                this.warningCount++;
            }

            /* Thanks to John Jameson from PrincetonU for this ruleset! */
            // Detect paragraphs that should be lists.
            let activeMatch = "";
            let prefixDecrement = {
                b: "a",
                B: "A",
                2: "1",
            };
            let prefixMatch = /a\.|a\)|A\.|A\)|1\.|1\)|\*\s|-\s|--|•\s|→\s|✓\s|✔\s|✗\s|✖\s|✘\s|❯\s|›\s|»\s/;
            let decrement = function (el) {
                return el.replace(/^b|^B|^2/, function (match) {
                    return prefixDecrement[match];
                });
            };
            this.$p.each(function (i, el) {
                let $first = $(el);
                let hit = false;
                // Grab first two characters.
                let firstPrefix = $first.text().substring(0, 2);
                if (
                    firstPrefix.trim().length > 0 &&
                    firstPrefix !== activeMatch &&
                    firstPrefix.match(prefixMatch)
                ) {
                    // We have a prefix and a possible hit
                    // Split p by carriage return if present and compare.
                    let hasBreak = $first.html().indexOf("<br>");
                    if (hasBreak !== -1) {
                        let subParagraph = $first
                            .html()
                            .substring(hasBreak + 4)
                            .trim();
                        let subPrefix = subParagraph.substring(0, 2);
                        if (firstPrefix === decrement(subPrefix)) {
                            hit = true;
                        }
                    }
                    // Decrement the second p prefix and compare .
                    if (!hit) {
                        let $second = $(el).next("p");
                        if ($second) {
                            let secondPrefix = decrement(
                                $first.next().text().substring(0, 2)
                            );
                            if (firstPrefix === secondPrefix) {
                                hit = true;
                            }
                        }
                    }
                    if (hit) {
                        this.warningCount++;
                        $first.before(
                            this.annotate(
                              Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                              `${Lang._('JOOMLA_A11Y_CHECKER_QA_SHOULD_BE_LIST', 'firstPrefix')} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_QA_SHOULD_BE_LIST_TIP')}`
                            )
                        );
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
                this.warningCount++;
            }
        };

        // ============================================================
        // Rulesets: Contrast
        // Color contrast plugin by jasonday: https://github.com/jasonday/color-contrast
        // ============================================================
        checkContrast () {

            const container = document.querySelector(this.options.checkRoot);
            const containerexclusions = Array.from(container.querySelectorAll(this.containerIgnore));

            const $findcontrast = Array.from(container.querySelectorAll("* > :not(.sa11y-heading-label)"));
            const $contrast = $findcontrast.filter($el => !containerexclusions.includes($el));

            var contrastErrors = {
                errors: [],
                warnings: []
            };

            let elements = $contrast;
            var contrast = {
                // Parse rgb(r, g, b) and rgba(r, g, b, a) strings into an array.
                // Adapted from https://github.com/gka/chroma.js
                parseRgb: function (css) {
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
                relativeLuminance: function (c) {
                    var lum = [];
                    for (var i = 0; i < 3; i++) {
                        var v = c[i] / 255;
                        lum.push(v < 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
                    }
                    return (0.2126 * lum[0]) + (0.7152 * lum[1]) + (0.0722 * lum[2]);
                },
                // Based on http://www.w3.org/TR/WCAG20/#contrast-ratiodef
                contrastRatio: function (x, y) {
                    var l1 = contrast.relativeLuminance(contrast.parseRgb(x));
                    var l2 = contrast.relativeLuminance(contrast.parseRgb(y));
                    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
                },

                getBackground: function (el) {
                    var styles = getComputedStyle(el),
                        bgColor = styles.backgroundColor,
                        bgImage = styles.backgroundImage,
                        rgb = contrast.parseRgb(bgColor) + '',
                        alpha = rgb.split(',');

                    // if background has alpha transparency, flag manual check
                    if (alpha[3] < 1 && alpha[3] > 0) {
                        return "alpha";
                    }

                    // if element has no background image, or transparent background (alpha == 0) return bgColor
                    if (bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent' && bgImage === "none" && alpha[3] !== '0') {
                        return bgColor;
                    } else if (bgImage !== "none") {
                        return "image";
                    }

                    // retest if not returned above
                    if (el.tagName === 'HTML') {
                        return 'rgb(255, 255, 255)';
                    } else {
                        return contrast.getBackground(el.parentNode);
                    }
                },
                // check visibility - based on jQuery method
                isVisible: function (el) {
                    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
                },
                check: function () {
                    // resets results
                    contrastErrors = {
                        errors: [],
                        warnings: []
                    };

                    for (var i = 0; i < elements.length; i++) {
                        (function (n) {
                            var elem = elements[n];
                            // test if visible. Although we want invisible too.
                            if (contrast /* .isVisible(elem) */) {
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
                                        }
                                        contrastErrors.errors.push(error);
                                    }
                                } else if (text.length || htmlTag === "INPUT" || htmlTag === "SELECT" || htmlTag === "TEXTAREA") {
                                    // does element have a background image - needs to be manually reviewed
                                    if (background === "image") {
                                        warning = {
                                            elem: elem
                                        }
                                        contrastErrors.warnings.push(warning)
                                    } else if (background === "alpha") {
                                        warning = {
                                            elem: elem
                                        }
                                        contrastErrors.warnings.push(warning)
                                    } else {
                                        ratio = Math.round(contrast.contrastRatio(color, background) * 100) / 100;
                                        if (pointSize >= 18 || (pointSize >= 14 && fontWeight >= 700)) {
                                            if (ratio < 3) {
                                                error = {
                                                    elem: elem,
                                                    ratio: ratio + ':1'
                                                }
                                                contrastErrors.errors.push(error);
                                            }
                                        } else {
                                            if (ratio < 4.5) {
                                                error = {
                                                    elem: elem,
                                                    ratio: ratio + ':1'
                                                }
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
            }

            contrast.check();
            //const {errorMessage, warningMessage} = sa11yIM["contrast"];

            contrastErrors.errors.forEach(item => {
                var name = item.elem;
                var cratio = item.ratio;
                var clone = name.cloneNode(true);
                var removeSa11yHeadingLabel = clone.querySelectorAll('.sa11y-heading-label');
                for(var i = 0; i < removeSa11yHeadingLabel.length; i++){
                    clone.removeChild(removeSa11yHeadingLabel[i])
                }
                var nodetext = clone.textContent;

                this.errorCount++;
                name.insertAdjacentHTML('beforebegin',
                    this.annotate(
                      Lang._('JOOMLA_A11Y_CHECKER_ERROR'),
                      `${Lang.sprintf('JOOMLA_A11Y_CHECKER_CONTRAST_ERROR_MESSAGE', cratio, nodetext)} 
                        <hr aria-hidden="true"> 
                        ${Lang.sprintf('JOOMLA_A11Y_CHECKER_CONTRAST_ERROR_MESSAGE_INFO', cratio, nodetext)}`,
                      true
                    )
                );
            });

            contrastErrors.warnings.forEach(item => {
                var name = item.elem;
                var clone = name.cloneNode(true);
                var removeSa11yHeadingLabel = clone.querySelectorAll('.sa11y-heading-label');
                for(var i = 0; i < removeSa11yHeadingLabel.length; i++){
                    clone.removeChild(removeSa11yHeadingLabel[i])
                }
                var nodetext = clone.textContent;

                this.warningCount++;
                name.insertAdjacentHTML('beforebegin',
                    this.annotate(
                      Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
                      `${Lang.sprintf('JOOMLA_A11Y_CHECKER_CONTRAST_WARNING_MESSAGE', nodetext)} <hr aria-hidden="true"> ${Lang._('JOOMLA_A11Y_CHECKER_CONTRAST_WARNING_MESSAGE_INFO')}`
                    )
                );
            });
        };

        // ============================================================
        // Rulesets: Readability
        // Adapted from Greg Kraus' readability script: https://accessibility.oit.ncsu.edu/it-accessibility-at-nc-state/developers/tools/readability-bookmarklet/
        // ============================================================
        checkReadability () {

            const container = document.querySelector(this.options.readabilityRoot);
            const containerexclusions = Array.from(container.querySelectorAll(this.containerIgnore));

            const $findreadability = Array.from(container.querySelectorAll("p, li"));
            const $readability = $findreadability.filter($el => !containerexclusions.includes($el));

            //Crude hack to add a period to the end of list items to make a complete sentence.
            $readability.forEach($el => {
                var listText = $el.textContent;
                if (listText.charAt(listText.length - 1) !== ".") {
                    $el.insertAdjacentHTML("beforeend", "<span class='sa11y-readability-period sa11y-visually-hidden'>.</span>");
                }
            });

            // Compute syllables: http://stackoverflow.com/questions/5686483/how-to-compute-number-of-syllables-in-a-word-in-javascript
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
                if (current.textContent.replace(/ |\n/g,'') !== '') {
                    readabilityarray.push(current.textContent);
                }
            }

            let paragraphtext = readabilityarray.join(' ').trim().toString();
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
            }

            //var characters = paragraphtext.replace(/[.!?|\s]+/g, '').length;
            //Reference: https://core.ac.uk/download/pdf/6552422.pdf
            //Reference: https://github.com/Yoast/YoastSEO.js/issues/267

            let flesch_reading_ease;
            if (this.options.readabilityLang === 'en') {
                flesch_reading_ease = 206.835 - (1.015 * words / sentences) - (84.6 * total_syllables / words);
            } else if (this.options.readabilityLang === 'fr') {
                //French (Kandel & Moles)
                flesch_reading_ease = 207 - (1.015 * words / sentences) - (73.6 * total_syllables / words);
            } else if (this.options.readabilityLang === 'es') {
                flesch_reading_ease = 206.84 - (1.02 * words / sentences) - (0.60 * (100 * total_syllables / words));
            }

            if (flesch_reading_ease > 100) {
                flesch_reading_ease = 100;
            } else if (flesch_reading_ease < 0) {
                flesch_reading_ease = 0;
            }

            const $readabilityinfo = document.getElementById("sa11y-readability-info");

            if (paragraphtext.length === 0) {
                $readabilityinfo.innerHTML = `${Lang._('JOOMLA_A11Y_CHECKER_READABILITY_NO_P_OR_LI_MESSAGE')}`;
            }
            else if (words > 30) {
                var fleschScore = flesch_reading_ease.toFixed(1);
                var avgWordsPerSentence = (words / sentences).toFixed(1);
                var complexWords = Math.round(100 * ((words - (syllables1 + syllables2)) / words));

                //WCAG AAA pass if greater than 60
                if (fleschScore >= 0 && fleschScore < 30) {
                    $readabilityinfo.innerHTML =
                        `<span>${fleschScore}</span> <span class="sa11y-readability-score">${Lang._('JOOMLA_A11Y_CHECKER_VERY_DIFFICULT_READABILITY')}</span>`;

                } else if (fleschScore > 31 && fleschScore < 49) {
                    $readabilityinfo.innerHTML =
                        `<span>${fleschScore}</span> <span class="sa11y-readability-score">${Lang._('JOOMLA_A11Y_CHECKER_DIFFICULT_READABILITY')}</span>`;

                } else if (fleschScore > 50 && fleschScore < 60) {
                    $readabilityinfo.innerHTML =
                        `<span>${fleschScore}</span> <span class="sa11y-readability-score">${Lang._('JOOMLA_A11Y_CHECKER_FAIRLY_DIFFICULT_READABILITY')}</span>`;
                } else {
                    $readabilityinfo.innerHTML =
                        `<span>${fleschScore}</span> <span class="sa11y-readability-score">${Lang._('JOOMLA_A11Y_CHECKER_GOOD_READABILITY')}</span>`;
                }

                document.getElementById("sa11y-readability-details").innerHTML =
                `<li><span class='sa11y-bold'>${Lang._('JOOMLA_A11Y_CHECKER_AVG_WORD_PER_SENTENCE')}</span> ${avgWordsPerSentence}</li>
                <li><span class='sa11y-bold'>${Lang._('JOOMLA_A11Y_CHECKER_COMPLEX_WORDS')}</span> ${complexWords}%</li>
                <li><span class='sa11y-bold'>${Lang._('JOOMLA_A11Y_CHECKER_TOTAL_WORDS')}</span> ${words}</li>`;
            }
            else {
                $readabilityinfo.textContent = `${Lang._('JOOMLA_A11Y_CHECKER_READABILITY_NOT_ENOUGH_CONTENT_MESSAGE')}`;
            }
        };

    //----------------------------------------------------------------------
    // Templating for Error, Warning and Pass buttons.
    //----------------------------------------------------------------------
    annotate(type, content, inline = false) {
      const validTypes = [
        Lang._('JOOMLA_A11Y_CHECKER_ERROR'),
        Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
        Lang._('JOOMLA_A11Y_CHECKER_GOOD'),
      ];

      if (validTypes.indexOf(type) === -1) {
        throw Error(`Invalid type [${type}] for annotation`);
      }

      const CSSName = {
        [validTypes[0]]: "error",
        [validTypes[1]]: "warning",
        [validTypes[2]]: "good",
      };

      // Check if content is a function
      if (content && {}.toString.call(content) === "[object Function]") {
        // if it is, call it and get the value.
        content = content();
      }

      // Escape content, it is need because it used inside data-tippy-content=""
      const $div = document.createElement('div');
      $div.textContent = content;
      const escapedContent = $div.innerHTML.replaceAll('"', '&quot;').replaceAll("'", '&#039;');

      return `
        <div class=${inline ? "sa11y-instance-inline" : "sa11y-instance"}>
            <button
            type="button"
            aria-label="${[type]}"
            class="sa11y-btn sa11y-${CSSName[type]}-btn${inline ? "-text" : ""}"
            data-tippy-content="<div lang='${this.options.langCode}'>
                <div class='sa11y-header-text'>${[type]}</div>
                ${escapedContent}
            </div>
        ">
        </button>
        </div>`;
    };

    //----------------------------------------------------------------------
    // Templating for full-width banners.
    //----------------------------------------------------------------------
    annotateBanner(type, content) {
      const validTypes = [
        Lang._('JOOMLA_A11Y_CHECKER_ERROR'),
        Lang._('JOOMLA_A11Y_CHECKER_WARNING'),
        Lang._('JOOMLA_A11Y_CHECKER_GOOD'),
      ];

      if (validTypes.indexOf(type) === -1) {
        throw Error(`Invalid type [${type}] for annotation`);
      }

      const CSSName = {
        [validTypes[0]]: "error",
        [validTypes[1]]: "warning",
        [validTypes[2]]: "good",
      };

      // Check if content is a function
      if (content && {}.toString.call(content) === "[object Function]") {
        // if it is, call it and get the value.
        content = content();
      }

      return `<div class="sa11y-instance sa11y-${CSSName[type]}-message-container">
      <div role="region" aria-label="${[type]}" class="sa11y-${CSSName[type]}-message" lang="${this.options.langCode}">
          ${content}
      </div>
  </div>`;
    };

  }

export default {
  Lang,
  Sa11y,
}



/*-----------------------------------------------------------------------
Sa11y: the accessibility quality assurance assistant.
Author: Development led by Adam Chaboryk at Ryerson University.
All acknowledgements and contributors: https://github.com/ryersondmp/sa11y
License: https://github.com/ryersondmp/sa11y/blob/master/LICENSE.md
Copyright (c) 2020 - 2021 Ryerson University
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
------------------------------------------------------------------------*/
