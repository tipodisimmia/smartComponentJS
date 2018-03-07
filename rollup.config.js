

export default {
    input: 'src/index.js',
    treeshake: false,
    output: {
        file: 'build/SmartComponentJS.js',
        format: 'es',
        sourcemap: 'inline',
        name: "SmartComponentJS",
        module:"SmartComponentJS",
    }
}