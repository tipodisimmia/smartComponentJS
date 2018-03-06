import babel from 'rollup-plugin-babel';

export default {
    input: 'src/index.js',
    output:{
        file: 'build/SmartComponentJS.js',
        format: 'umd',
        sourcemap: 'inline',
        name:"SmartComponentJS"
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
    ]
};