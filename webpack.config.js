// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";

// Customer app is mounted at /store/ in nginx
const PUBLIC_PATH = isProd ? "/store/" : "/";

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    publicPath: PUBLIC_PATH, // ✅ IMPORTANT
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
          publicPath: PUBLIC_PATH, // ✅ makes image urls also respect /store/
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      publicPath: PUBLIC_PATH, // ✅ IMPORTANT
    }),
    new CleanWebpackPlugin(),
  ],
  devServer: {
    static: path.join(__dirname, "dist"),
    compress: true,
    port: 9005,
    historyApiFallback: true,
  },
  devtool: "source-map",
  stats: { children: true },
};
