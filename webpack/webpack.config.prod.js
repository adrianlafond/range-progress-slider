const baseConfig = require('./webpack.config.base');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const prodConfig = {
  ...baseConfig,
  entry: path.join(__dirname, './src/index.tsx'),
  mode: 'production',
};

prodConfig.module.rules.push({
  test: /\.(sa|sc|c)ss$/,
  use: [
    MiniCssExtractPlugin.loader,
    'css-loader',
    'sass-loader',
  ],
});

prodConfig.plugins = prodConfig.plugins || [];
prodConfig.plugins.push(new MiniCssExtractPlugin());

module.exports = prodConfig;