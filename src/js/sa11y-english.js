/* ----------------------------- */
/*         Global defaults       */
/* ----------------------------- */

// Target area to scan.
const sa11yCheckRoot = ''; // Default: body. Use "main" for main content.

// Readability configuration.
const sa11yReadabilityRoot = ''; // Default: main, [role='main'].
const sa11yReadabilityLang = 'en'; // Supported: en = English, fr = French, es = Spanish

// Inclusions and exclusions. Use commas to seperate classes or elements.
const sa11yContainerIgnore = '.sa11y-ignore'; // Ignore specific regions.
const sa11yOutlineIgnore = ''; // Exclude headings from outline panel.
const sa11yHeaderIgnore = ''; // Ignore specific headings. E.g. "h1.jumbotron-heading"
const sa11yImageIgnore = ''; // Ignore specific images.
const sa11yLinkIgnore = ''; // Ignore specific links.
const sa11yLinkIgnoreSpan = 'span.sr-only-example'; // Ignore specific classes within links. Example: <a href="#">learn more <span class="sr-only-example">(opens new tab)</span></a>.
const sa11yLinksToFlag = ''; // Links you don't want your content editors pointing to (e.g. development environments).

/* ------------------------------ */
/*           Localization         */
/* ------------------------------ */

// Language of Sa11y. Some global variables to help translate.
const sa11yLangCode = 'en'; // Language code, e.g. "fr"

// Panel status

// Embedded content.
const $sa11yVideos = "video, [src*='youtube.com'], [src*='vimeo.com'], [src*='yuja.com'], [src*='panopto.com']";
const $sa11yAudio = "audio, [src*='soundcloud.com'], [src*='simplecast.com'], [src*='podbean.com'], [src*='buzzsprout.com'], [src*='blubrry.com'], [src*='transistor.fm'], [src*='fusebox.fm'], [src*='libsyn.com']";
const $sa11yAllEmbeddedContent = `${$sa11yVideos}, ${$sa11yAudio}`;

// Alt Text stop words.
const sa11ySuspiciousAltWords = ['image', 'graphic', 'picture', 'photo'];
const sa11yPlaceholderAltStopWords = [
  'alt',
  'image',
  'photo',
  'decorative',
  'photo',
  'placeholder',
  'placeholder image',
  'spacer',
  '.',
];

// Link Text stop words
const sa11yPartialAltStopWords = [
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
];

const sa11yWarningAltWords = [
  '< ',
  ' >',
  'click here',
];

// Link Text (Advanced)
const sa11yNewWindowPhrases = [
  'external',
  'new tab',
  'new window',
  'pop-up',
  'pop up',
];

// Link Text (Advanced). Only some items in list would need to be translated.
const sa11yFileTypePhrases = [
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
];

/*-----------------------------------------------------------------------
Sa11y: the accessibility quality assurance assistant.
Author: Development led by Adam Chaboryk at Ryerson University.
All acknowledgements and contributors: https://github.com/ryersondmp/sa11y
License: https://github.com/ryersondmp/sa11y/blob/master/LICENSE.md
Copyright (c) 2020 - 2021 Ryerson University
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
-----------------------------------------------------------------------*/
