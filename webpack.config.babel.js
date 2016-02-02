import path from 'path'
import webpack from 'webpack'

import ExtractTextPlugin from 'extract-text-webpack-plugin'
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin'

const config = {
  entry: [
    './embed.js',
  ],

  output: {
    filename: '[name].[hash].js',
    path: path.join(__dirname, 'build'),
    libraryTarget: 'umd',
  },

  devtool: 'source-map',

  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['eslint'],
      },
    ],
    loaders: [
      {
        test: /\.less$/,
        exclude: /node_modules/,
        loader: 'css!less',
      },
      {
        test: path => /\.js$/.test(path) && !/\.test\.js$/.test(path),
        exclude: /node_modules/,
        loaders: ['babel'],
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.DOMAIN': JSON.stringify(process.env.EMBED_ORIGIN || 'localhost'),
      'process.env.HEIM_ORIGIN': JSON.stringify(process.env.HEIM_ORIGIN || 'http://localhost:8080'),
    }),
    new StaticSiteGeneratorPlugin('main', ['/']),
  ],
}

if (process.env.NODE_ENV === 'production') {
  const lessLoader = config.module.loaders[0]
  lessLoader.loader = ExtractTextPlugin.extract(lessLoader.loader)
  config.plugins.push(new ExtractTextPlugin('main.[contenthash].css'))

  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {warnings: false},
  }))
  config.plugins.push(new webpack.optimize.DedupePlugin())
}

export default config
