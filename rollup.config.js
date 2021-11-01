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
    { file: `dist/js/joomla-a11y-checker.js`, format: 'esm' },
    { file: `dist/js/joomla-a11y-checker.min.js`, format: 'esm', plugins: [terser()] },
  ]
},
// ES5 files
{
	input: 'src/js/sa11y.js',
  plugins: [nodeResolve(), getBabelOutputPlugin({ presets: ['@babel/preset-env'] })],
  output: [
    { file: `dist/js/joomla-a11y-checker-es5.js`, format: 'esm' },
    { file: `dist/js/joomla-a11y-checker-es5.min.js`, format: 'esm', plugins: [getBabelOutputPlugin({ presets: ['@babel/preset-env'] }), terser()] },
  ]
},
// SCSS files
{
  input: 'src/scss/sa11y.scss',
  plugins: [sass({
    output: false,
    processor: css => postcss([autoprefixer({
      from: undefined,
      to: undefined
    })])
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
