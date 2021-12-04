import { Jooa11y, Lang } from '../assets/js/joomla-a11y-checker.esm.js';
import EngSetting from '../assets/js/lang/en.js';

window.addEventListener('load', () => {
  // Set translations
  Lang.addI18n(EngSetting.strings);
  // Instantiate
  const checker = new Jooa11y(EngSetting.options);
  checker.doInitialCheck();
});
