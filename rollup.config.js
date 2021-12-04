import { nodeResolve } from '@rollup/plugin-node-resolve';
import css from "rollup-plugin-import-css";
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import sass from 'rollup-plugin-sass';
import cssnano from 'cssnano';
import postcss from 'postcss';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';

export default [
  // ES6 standalone files
  {
    input: 'src/js/jooa11y.js',
    plugins: [
      nodeResolve(),
      css(),
      replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
    })
    ],
    output: [
      { file: 'dist/js/joomla-a11y-checker.standalone.esm.js', format: 'esm'},
      {
        file: 'dist/js/joomla-a11y-checker.standalone.esm.min.js', format: 'esm', plugins: [terser()],
      },
    ],
  },
  // ES6 standalone files
  {
    input: 'src/js/jooa11y.js',
    plugins: [
      nodeResolve(),
      css(),
      replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
    })
    ],
    output: [
      { file: 'dist/js/joomla-a11y-checker.standalone.umd.js', format: 'umd', name: 'Jooa11y'},
      {
        file: 'dist/js/joomla-a11y-checker.standalone.umd.min.js', format: 'umd', name: 'Jooa11y', plugins: [terser()],
      },
    ],
  },
  // ES6 Joomla bundle files
  {
    input: 'src/js/jooa11y.js',
    plugins: [
      nodeResolve(),
      css(),
      replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      // In the Joomla build tools, we need to use the Popper from Bootstrap:
      // Replace import { applyStyles, createPopper } from '@popperjs/core';
      // with import { applyStyles, createPopper } from '../../bootstrap/js/popper.js?v=x.x.x';
    ],
    external: [
      '@popperjs/core'
    ],
    output: [
      { file: 'dist/js/joomla-a11y-checker.esm.js', format: 'esm'},
      {
        file: 'dist/js/joomla-a11y-checker.esm.min.js', format: 'esm', plugins: [terser()],
      },
    ],
  },
  {
    input: 'src/js/lang/en.js',
    plugins: [nodeResolve()],
    output: [
      { file: 'dist/js/lang/en.js', format: 'esm'},
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
