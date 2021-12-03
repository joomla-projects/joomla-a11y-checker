# Jooa11y
Jooa11y is an **accessibility and quality assurance** tool that **visually highlights** common accessibility and usability issues. Geared towards content authors, Jooa11y identifies many errors or warnings and provides guidance on on how to fix them. Jooa11y is ***not*** a comprehensive code analysis tool - it exclusively highlights content issues.
- Over 50 test conditions.
- Free and open source.
- Included by default in Joomla 4.1 and later
- Concise tooltips explain issues right at the source.
- Low tech: No complex API or integrations.
- Additional (toggleable) checks: Contrast, form labels, readability, links (Advanced).
- Dark mode.

Jooa11y began as a fork of the [sa11y script](https://github.com/ryersondmp/sa11y) to be more inline with Joomla coding styles, especially the removal of the jquery dependency and added support for localisation.

## Demo
:arrow_right: [View project website and demo](https://joomla-projects.github.io/joomla-a11y-checker/) 

## Installation (Joomla 4.1)

Jooa11y is included in Joomla 4.1 and later. There is nothing to install.

## Installation (Manual)

To install on your website, insert Jooa11y right in the head tag. Include both Tippy.js and Popper.js before Jooa11y. Jooa11y consists of three files (located in `/dist/`).

- **joomla-a11y-checker.css**: The main stylesheet. Should be included in the `<head>` of the document (if possible).
- **en.js**: Global configurations and exclusions go here. All text strings and tooltip messages are located here for easy translation.
- **joomla-a11y-checker.umd..js**: Contains all logic and rulesets.

### Example installation:
As module:
```html
<!--StyleSheet-->
<link rel="stylesheet" href="css/joomla-a11y-checker.min.css" />

<!-- Tippy.js CDN (tooltip library) -->
<script src="https://unpkg.com/@popperjs/core@2" defer></script>
<script src="https://unpkg.com/tippy.js@6" defer></script>

<script type="module">
  import Jooa11y from 'js/jooa11y.js';
  import Jooa11yLangEn from 'js/lang/en.js';
  
  window.addEventListener('load', () => {
    // Set translations
    Jooa11y.Lang.addI18n(Jooa11yLangEn.strings);

    // Instantiate
    const checker = new Jooa11y.Jooa11y(Jooa11yLangEn.options);
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
    Jooa11y.Lang.addI18n(Jooa11yLangEn.strings);

    // Instantiate
    const checker = new Jooa11y.Jooa11y(Jooa11yLangEn.options);
    checker.doInitialCheck();
  });
</script>
```
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
## Other notes

- This version appends tooltips to the end of the body by default to ensure tooltips do not get hidden by conflicting CSS styling. If you customize the tooltips to include interactive content, please read [Tippy.js documentation on creating accessible interactive tooltips for keyboard users.](https://atomiks.github.io/tippyjs/v6/accessibility/#interactivity)

### Create your own rule sets
1. Create your condition (within the QA module for example.
2. Add `this.warningCount++;` or `this.errorCount++;` to update warning or error count.
3. Add respective CSS classes.
4. Add warning or error button before (or after) element using the `Jooa11yAnnotate` function, followed by the type `jooa11yError`, `jooa11yWarning`, `jooa11yGood`. Finally, reference your tooltip message.

## Contributing
Want to help make Jooa11y better? Consider [contributing](https://github.com/joomla-projects/joomla-a11y-checker/blob/joomla/CONTRIBUTING.md)!

## Acknowledgements
Jooa11y began as a vanilla js fork of [Sa11y](https://github.com/ryersondmp/sa11y), which was created by Digital Media Projects, Computing and Communication Services (CCS) at Ryerson University in Toronto, Canada.

Sa11y itself began as a fork of Tota11y by Khan Academy