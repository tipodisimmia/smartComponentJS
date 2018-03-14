
import babel from 'rollup-plugin-babel';

export default {
    input: 'src/index.js',
    treeshake: false,
    output: {
        file: 'build/SmartComponentJS.js',
        format: 'umd',
        name: "SmartComponentJS"
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
}