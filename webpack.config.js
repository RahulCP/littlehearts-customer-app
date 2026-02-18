// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

// If you WANT dev URL to be /store/... then public path must be /store/ in dev too
const PUBLIC_PATH = "/store/";

module.exports = {
  entry: "./src/index.js",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    publicPath: PUBLIC_PATH,
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[name].[hash][ext]",
          publicPath: PUBLIC_PATH,
        },
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },

  resolve: { extensions: [".js", ".jsx"] },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      publicPath: PUBLIC_PATH,
    }),
    new CleanWebpackPlugin(),
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
      publicPath: PUBLIC_PATH,
    },
    devMiddleware: {
      publicPath: PUBLIC_PATH,
    },

    compress: true,
    port: 9005,
    host: "0.0.0.0",
    allowedHosts: "all",

    // ✅ THIS is the key for /store/illolam refresh
    historyApiFallback: {
      index: PUBLIC_PATH,
    },
  },

  devtool: "source-map",
  stats: { children: true },
};
