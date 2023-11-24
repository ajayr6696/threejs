const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/script.js', // Your entry file
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js' // Output bundle name
    }
};
