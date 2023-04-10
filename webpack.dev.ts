import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import NodePolyfillWebpackPlugin from 'node-polyfill-webpack-plugin';
import { resolve } from 'path';

const PORT = 1212;

const config = {
    entry: './src/VIew/index.tsx',
    resolve: {
        extensions: ['.ts', '.tsx', '.json', '.js', '.jsx'],
    },
    output: {
        filename: 'dotTech/assets/js/[name].bundle.js',
        path: resolve(__dirname, 'dist'),
    // publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/i,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ],
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.(woff2|woff|eot|ttf|otf)$/,
                use: ['file-loader'],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'watchdog/assets/css/style.css',
        }),
        new HtmlWebpackPlugin({
            template: 'src/VIew/index.html',
        }),
        new NodePolyfillWebpackPlugin(),
    ],
    mode: 'development',
    optimization: {
        usedExports: true,
    },
    devServer: {
        hot: true,
        historyApiFallback: true,
        port: 8084,
        host: 'localhost',
        client: {
            overlay: {
                warnings: false,
                errors: true,
            },
        },
        proxy: {
            context: ['/api'],
            target: `http://localhost:${3999}`,
        },
    },
};

export default config;
