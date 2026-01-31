const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js', // Cache-busting for JS
    publicPath: '/', // This ensures that paths are resolved correctly
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash][ext]',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      publicPath: '/', // Ensures correct path resolution
    }),
    new CleanWebpackPlugin()
  ],
  devServer: {
    static: path.join(__dirname, 'dist'), // Serve from 'dist' during development
    compress: true,
    port: 9005,
    historyApiFallback: true,
  },
  devtool: 'source-map', // Enable source maps for debugging
  stats: {
    children: true,
  },
};
