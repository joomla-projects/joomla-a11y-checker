import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import sass from 'rollup-plugin-sass';
import cssnano from 'cssnano';
import postcss from 'postcss';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';

export default [
  // ES6 files
  {
    input: 'src/js/jooa11y.js',
    plugins: [nodeResolve()],
    output: [
      { file: 'dist/js/joomla-a11y-checker.umd.js', format: 'umd', name: 'Jooa11y' },
      {
        file: 'dist/js/joomla-a11y-checker.umd.min.js', format: 'umd', name: 'Jooa11y', plugins: [terser()],
      },
    ],
  },
  {
    input: 'src/js/lang/en.js',
    plugins: [nodeResolve()],
    output: [
      { file: 'dist/js/lang/en.js', format: 'umd', name: 'Jooa11yLangEn' },
    ],
  },
  // SCSS files
  {
    input: 'src/scss/jooa11y.scss',
    plugins: [sass({
      output: false,
      processor: (css) => {
        postcss()
          .process(css, { from: undefined })
          .then(async (result) => {
            const path = 'dist/css/joomla-a11y-checker.css';
            const pathMin = 'dist/css/joomla-a11y-checker.min.css';

            if (!existsSync(dirname(path))) {
              await mkdir(dirname(path), { recursive: true });
            }
            await writeFile(path, result.css, { encoding: 'utf8' });

            postcss([cssnano])
              .process(result.css, { from: undefined })
              .then(async (result) => {
                if (!existsSync(dirname(pathMin))) {
                  await mkdir(dirname(pathMin), { recursive: true });
                }
                await writeFile(pathMin, result.css, { encoding: 'utf8' });
              });
          });

        return '';
      },
    })],
  },

];
