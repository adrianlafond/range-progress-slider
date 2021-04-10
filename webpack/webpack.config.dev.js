const baseConfig = require('./webpack.config.base');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const devConfig = {
  ...baseConfig,
  entry: './src/dev.tsx',
  devtool: 'source-map',
  mode: 'development',
  devServer: {
    open: true,
    hot: true,
    liveReload: true,
    watchContentBase: true,
  }
};

devConfig.module.rules.push({
  test: /\.(sa|sc|c)ss$/,
  use: [
    'style-loader',
    'css-loader',
    'sass-loader',
  ],
});

devConfig.plugins = devConfig.plugins || [];
devConfig.plugins.push(
  new HtmlWebpackPlugin({
    template: "./public/index.html"
  }),
);

module.exports = devConfig;
