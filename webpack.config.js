const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('inline-chunk-html-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = MiniCssExtractPlugin.loader;

const plugins = [
  new HtmlWebpackPlugin({
    filename: path.resolve(__dirname, 'static/index.html'),
    template: 'templates/index.html',

    inject: false,
    environment: process.env.NODE_ENV,
    scriptLoading: 'blocking',
  }),

  new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/index.js/]),
  new MiniCssExtractPlugin(),
];

const config = {
  entry: './development/ts/preview_excel.ts',
  output: {
    path: path.resolve(__dirname, 'static/js'),
    filename: 'index.js',
    publicPath: path.resolve(__dirname, 'static'),
  },
  devServer: {
    port: 8080,
    static: [path.join(__dirname, "templates"), path.join(__dirname, "static")],
    compress: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      "X-Content-Type-Options": "Disabled"
    }
  },
  plugins,
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '...'],
  },
};

module.exports = () => {
  config.mode = isProduction ? 'production' : 'development';
  return config;
};
