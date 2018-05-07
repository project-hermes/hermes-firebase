const path = require('path'),
      webpack = require('webpack'),
      CleanWebpackPlugin = require('clean-webpack-plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractPlugin = new ExtractTextPlugin({
    filename: './assets/css/app.css'
    // allChunks: true
});

const config = {
  mode: 'development',
  // absolute path for project root with the 'src' folder
  context: path.resolve(__dirname, 'src'),

  entry: {
    // relative path declaration
    app: './app.js'
  },

  output: {
    // absolute path declaration
    path: path.resolve(__dirname, 'public'),
    filename: './assets/js/[name].bundle.js'
  },

  module: {
    rules: [

      // babel-loader with 'env' preset
      { test: /\.js$/, include: /src/, exclude: /node_modules/, use: { loader: "babel-loader", options: { presets: ['env'] } } },
      // html-loader
      { test: /\.html$/, use: ['html-loader'] },
      // sass-loader with sourceMap activated
      // {
      //   test: /\.css$/,
      //   include: [
      //       path.resolve(__dirname, './node_modules/bootstrap/dist/css')
      //   ],
      //   use: extractPlugin.extract({
      //       fallback: 'style-loader',
      //       use: ['css-loader', 'postcss-loader']
      //   })
      // },
      {
        test: /\.scss$/,
        // include: [path.resolve(__dirname, 'src', 'assets', 'scss')],
        use: extractPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true
              }
            }
          ],
          fallback: 'style-loader'
        })
      },
      // file-loader(for images)
      { test: /\.(jpg|png|gif|svg)$/, use: [ { loader: 'file-loader', options: { name: '[name].[ext]', outputPath: './assets/media/' } } ] },
      // file-loader(for fonts)
      { test: /\.(woff|woff2|eot|ttf|otf)$/, use: ['file-loader'] }

    ]
  },

  plugins: [
    // cleaning up only 'public' folder
    new CleanWebpackPlugin(['public']),
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
    // extract-text-webpack-plugin instance
    extractPlugin
  ],

  // devServer: {
  //   // static files served from here
  //   contentBase: path.resolve(__dirname, "./public/assets/media"),
  //   compress: true,
  //   // open app in localhost:2000
  //   port: 2000,
  //   stats: 'errors-only',
  //   open: true
  // },

  devtool: 'inline-source-map'

};

module.exports = config;
