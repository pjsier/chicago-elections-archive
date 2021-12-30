const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const config = {
  target: ["web", "es5"],
  devtool: "source-map",
  mode: "production",
  entry: {
    app: [path.resolve("./src/js/entry.js")],
  },
  output: {
    path: path.resolve("./dist/static"),
    filename:
      process.env.NODE_ENV === "production"
        ? "[name].[chunkhash].js"
        : "[name].js",
    publicPath: "/static/",
  },
  optimization:
    process.env.NODE_ENV === "production"
      ? {
          minimize: true,
          minimizer: [new TerserPlugin({ parallel: true })],
        }
      : {},
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules\//,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: [">1%", "ie 11", "not op_mini all"],
                    useBuiltIns: "usage",
                    corejs: 3,
                    modules: false,
                  },
                ],
              ],
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[contenthash].[ext]",
              outputPath: "images",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve("./site/_includes/webpack.html"),
      filename: path.resolve("./site/_includes/webpack.njk"),
      scriptLoading: "blocking",
      inject: false,
    }),
  ],
  resolve: {
    extensions: [".js", ".mjs", ".json"],
  },
  watchOptions: {
    poll: true,
  },
}

module.exports = config
