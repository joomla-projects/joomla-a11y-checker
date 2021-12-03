import { Jooa11y, Lang } from '../../dist/js/joomla-a11y-checker.js';
import EngSetting from '../../dist/js/lang/en.js';

console.log(EngSetting);
// Set translations
Lang.addI18n(EngSetting.strings);

// Instantiate
const checker = new Jooa11y(EngSetting.options);

checker.doInitialCheck();
