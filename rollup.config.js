import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import sass from 'rollup-plugin-sass';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcss from 'postcss';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';

export default [
  // ES6 files
  {
    input: 'src/js/sa11y.js',
    plugins: [nodeResolve()],
    output: [
      { file: `dist/js/joomla-a11y-checker.umd.js`, format: 'umd', name: 'Sa11y' },
      { file: `dist/js/joomla-a11y-checker.umd.min.js`, format: 'umd', name: 'Sa11y', plugins: [terser()] },
    ]
  },
  {
    input: 'src/js/lang/en.js',
    plugins: [nodeResolve()],
    output: [
      { file: `dist/js/lang/en.js`, format: 'umd', name: 'Sa11yLangEn' },
    ]
  },
// SCSS files
{
  input: 'src/scss/sa11y.scss',
  plugins: [sass({
    output: false,
    processor: css => postcss([])
      .process(css)
      .then(async (result) => {
        const path = `dist/css/joomla-a11y-checker.css`;
        if (!existsSync(dirname(path))) {
          await mkdir(dirname(path), {recursive: true})
        }
        await writeFile(path, result.css, {encoding: 'utf8'});

        postcss([autoprefixer({
          from: undefined,
          to: undefined
        }), cssnano])
        .process(result.css)
        .then(async (result) => {
          const path = `dist/css/joomla-a11y-checker.min.css`;
          if (!existsSync(dirname(path))) {
            await mkdir(dirname(path), {recursive: true})
          }
          await writeFile(path, result.css, {encoding: 'utf8'});
        });
      })
  })],
  output: []
}
];
