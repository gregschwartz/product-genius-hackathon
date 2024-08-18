const path = require('path');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

// This is set in the GitHub Actions environment that builds our releases. We
// use it to figure out which of our environments the JS is being built for, so
// it can be added as a property in analytics events and used to select the
// right keys for various integrations.
const branch = process.env.GITHUB_REF_NAME || 'localhost';
const environment = ['main', 'master'].includes(branch) ? 'production' : branch;
console.log('Branch:', branch, 'Environment:', environment);

module.exports = (env, argv) => ({
  entry: { main: './src/index.js' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'facet-chat.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack'],
      },
    ],
  },
  devServer: {
    hot: true,
    client: { overlay: false },
    static: {
      directory: './dist',
    },
    port: 3001,
  },
  plugins: [
    argv.mode !== 'production' && new ReactRefreshWebpackPlugin(),
    new webpack.DefinePlugin({
      __GIT_BRANCH__: JSON.stringify(branch),
      __ENVIRONMENT__: JSON.stringify(environment),
    }),
  ].filter(Boolean),
  resolve: {
    extensions: ['.js', '.jsx'],
  },
});
