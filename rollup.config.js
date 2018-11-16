import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/slider.js',
            format: 'umd',
            name: 'SmSlider',
        }
    ],
    plugins: [
        resolve({
            extensions: ['.ts', '.js'],
        }),
        babel({
            exclude: 'node_modules/**',
            extensions: ['.ts', '.js'],
        }),
        postcss({
            extract: true,
            plugins: [
                autoprefixer({
                    grid: true,
                }),
            ],
        }),
        serve(),
        livereload({
            watch: 'dist',
        }),
    ],
};
