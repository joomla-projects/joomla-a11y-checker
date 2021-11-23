# Under Development
This is a work in progress port of the sa11y script to be more inline with Joomla coding styles. Especially the removal of the jquery dependency and added support for localisation.

## Dev environment

We have included a light server to test the example files. To use this environment just:
1. Clone this repo on your computer
2. Be sure you have node installed and up to date
3. Execute *npm install*
4. In a terminal execute:

```
npm run serve
```

Then open [http://localhost:8080/docs/examples/errors.html](http://localhost:8080/docs/examples/errors.html) in your browser.

Any change inside /src folder files will trigger the build process for the files and will reload the page with the new changes.

![Sa11y, the accessibility quality assurance tool.](https://ryersondmp.github.io/sa11y/assets/images/github-banner.png)

# Sa11y
Sa11y works as a simple in-page checker that is designed to be easily customized and integrated into any content management system (CMS) to facilitate good accessibility practices. Sa11y works best in a templated CMS environment, although is also available as a bookmarklet. Sa11y is _not_ a comprehensive code analysis tool. Sa11y exclusively highlights content issues.
- Over 50 test conditions.
- Free and open source.
- Concise tooltips explain issues right at the source.
- Low tech: No complex API or integrations.
- Easily customizable: add your custom rulesets.
- Automatic: checks content on page load.
- Additional (toggleable) checks: Contrast, form labels, readability, links (Advanced).
- Dark mode.

Read [Sa11y 2.0 release notes.](https://github.com/ryersondmp/sa11y/releases/tag/2.0)

## Demo and bookmarklet 
:arrow_right: [View project website and demo](https://ryersondmp.github.io/sa11y/) or grab the latest [bookmarklet.](https://ryersondmp.github.io/sa11y/#install)

## Installation

To install on your website, insert Sa11y right in the head tag. Include both Tippy.js and Popper.js before Sa11y. Sa11y consists of three files (located in `/dist/`).

- **sa11y.css**: The main stylesheet. Should be included in the `<head>` of the document (if possible).
- **sa11y-english.js**: Global configurations and exclusions go here. All text strings and tooltip messages are located here for easy translation.
- **sa11y.js**: Contains all logic and rulesets.

### Example installation:
As module:
```html
<!--StyleSheet-->
<link rel="stylesheet" href="css/joomla-a11y-checker.min.css" />

<!-- Tippy.js CDN (tooltip library) -->
<script src="https://unpkg.com/@popperjs/core@2" defer></script>
<script src="https://unpkg.com/tippy.js@6" defer></script>

<script type="module">
  import Sa11y from 'js/sa11y.js';
  import Sa11yLangEn from 'js/lang/en.js';
  
  window.addEventListener('load', () => {
    // Set translations
    Sa11y.Lang.addI18n(Sa11yLangEn.strings);

    // Instantiate
    const checker = new Sa11y.Sa11y(Sa11yLangEn.options);
    checker.doInitialCheck();
  });
</script>

```

As regular script:

```html
<!--StyleSheet-->
<link rel="stylesheet" href="css/joomla-a11y-checker.min.css" />

<!-- Tippy.js CDN (tooltip library) -->
<script src="https://unpkg.com/@popperjs/core@2" defer></script>
<script src="https://unpkg.com/tippy.js@6" defer></script>

<script src="dist/js/joomla-a11y-checker.umd.min.js" defer></script>
<script src="dist/js/lang/en.js" defer></script>

<script>
  window.addEventListener('load', () => {
    // Set translations
    Sa11y.Lang.addI18n(Sa11yLangEn.strings);

    // Instantiate
    const checker = new Sa11y.Sa11y(Sa11yLangEn.options);
    checker.doInitialCheck();
  });
</script>
```

#### Other notes
- This version appends tooltips to the end of the body by default to ensure tooltips do not get hidden by conflicting CSS styling. If you customize the tooltips to include interactive content, please read [Tippy.js documentation on creating accessible interactive tooltips for keyboard users.](https://atomiks.github.io/tippyjs/v6/accessibility/#interactivity)
- Using a Bootstrap-powered template? Versions 3+ already include a tooltip library powered by Poppers.js positioning library. For performance reasons, you can replace the Tippy.js markup with Bootstrap's tooltip markup.

### Create your own rule sets
1. Create your condition (within the QA module for example.
2. Add `this.warningCount++;` or `this.errorCount++;` to update warning or error count.
3. Add respective CSS classes.
4. Add warning or error button before (or after) element using the `Sa11yAnnotate` function, followed by the type `sa11yError`, `sa11yWarning`, `sa11yGood`. Finally, reference your tooltip message.

#### Example: Warn content authors of overusing a component.
The example condition detects if more than one announcement is detected on a page. If it detects more than one instance of the .announcement-component CSS class, it will be indicated as a warning. Using jQuery's `gt:(0)` selector, the warning button will only appear on every instance except the first component. `M['announcementWarningMessage']` represents a string (tooltip message).

```javascript
let $checkAnnouncement = this.root.find('.announcement-component').not(this.containerIgnore);
if ($checkAnnouncement.length > 1) {
    this.warningCount++;
    $('.announcement-component:gt(0)').addClass('sa11y-warning-border');
    $('.announcement-component:gt(0)').before(
            Sa11yAnnotate(sa11yWarning, M['announcementWarningMessage'])
        );
}
```

## Contributing
Want to help make Sa11y better? Consider [contributing](https://github.com/ryersondmp/sa11y/blob/master/CONTRIBUTING.md)!

# Acknowledgements
Development is lead and maintained by [Adam Chaboryk](https://github.com/adamchaboryk), IT Accessibility Specialist, Digital Media Projects, Computing and Communication Services (CCS) at Ryerson University in Toronto, Canada. 

### Previous contributors
- Farhan Mohammed, Web Accessibility &amp; Usability Assistant, Ryerson University (2020/2021)
- Kyle Padernilla, Web Accessibility &amp; Usability Assistant, Ryerson University (2019/2020)
- Arshad Mohammed, Web Accessibility &amp; Usability Assistant, Ryerson University (2018/2019)
- Benjamin Luong, Web Accessibility &amp; Usability Assistant, Ryerson University (2016/2017)

### Other acknowledgements
- Sa11y is an adaptation of [Tota11y by Khan Academy.](https://github.com/Khan/tota11y)
- Tooltip library by [Tippy.js](https://github.com/atomiks/tippyjs)
- [color-contrast](https://github.com/jasonday/color-contrast) script was created by Jason Day.
- Readability feature is an adaptation of the [Readability Bookmarklet](https://accessibility.oit.ncsu.edu/it-accessibility-at-nc-state/developers/tools/readability-bookmarklet/) created by Greg Kraus at North Carolina State University.
- The icons are created by [FontAwesome.](https://github.com/FortAwesome/Font-Awesome)
- Sa11y is built with jQuery (Slim build).
- John Jameson (Princeton University) maintains a fork of Sa11y called [Editoria11y](https://github.com/itmaybejj/editoria11y/) which is available as a turnkey Drupal module. Sa11y and Editoria11y share a lot of code!

## Contact
Have a question or any feedback? Submit it as an [issue](https://github.com/ryersondmp/sa11y/issues) or email: [adam.chaboryk@ryerson.ca](mailto:adam.chaboryk)
