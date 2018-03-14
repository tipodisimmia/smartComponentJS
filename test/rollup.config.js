import babel from 'rollup-plugin-babel';

export default {
    input: 'test/test.js',
    treeshake: false,
    output: {
        file: 'test/testBundle.js',
        format: 'umd',
        sourcemap: 'inline',
        name: "testBundle"
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
}