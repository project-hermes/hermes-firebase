const path = require('path');
const {VueLoaderPlugin} = require('vue-loader');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
    entry: ['./src/app.js'],
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name].bundle.js',
        publicPath: '/'
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
            vue: 'vue/dist/vue.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.js$/,
                include: /src/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['env']],
                        plugins: [
                            [
                                'component',
                                {
                                    libraryName: 'element-ui',
                                    styleLibraryName: 'theme-chalk'
                                }
                            ],
                            'transform-object-rest-spread'
                        ]
                    }
                }
            },
            {test: /\.html$/, use: ['html-loader']},
            {
                test: /\.(sass|scss|css)$/,
                use: [
                    'vue-style-loader',
                    // MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: [
                                path.resolve(__dirname, './node_modules')
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.(jpg|png|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: './assets/media/'
                        }
                    }
                ]
            },
            // file-loader(for fonts)
            {test: /\.(woff|woff2|eot|ttf|otf)$/, use: ['file-loader']}
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['public']),
        new HtmlWebpackPlugin({
            inlineSource: '.(js|css)$',
            template: './src/index.html'
        }),

        new HtmlWebpackInlineSourcePlugin(),
        // new MiniCssExtractPlugin({
        //     filename: 'style.[contenthash].css'
        // }),
        new VueLoaderPlugin()
    ]
};
