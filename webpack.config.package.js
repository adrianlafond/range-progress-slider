const path = require('path');
const pkg = require('./package.json');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: path.join(__dirname, './src/package.tsx'),
  mode: 'production',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: `${pkg.name}.js`,
    library: pkg.name,
    libraryTarget: 'umd',
    publicPath: '/dist',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `${pkg.name}.css`,
    }),
  ],
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'ReactDOM',
      root: 'ReactDOM'
    },
  },
}
