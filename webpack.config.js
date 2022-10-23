const path = require('path');

module.exports = {
  mode: 'development',
  // mode: 'production',
  entry: {
    index: path.resolve(__dirname, 'development/js/preview_excel.js'),
  },
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
