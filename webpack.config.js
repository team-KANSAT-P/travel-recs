import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import 'dotenv/config';

export default {
  entry: './client/index.tsx',
  output: {
    path: path.join(import.meta.dirname, 'dist'),
    filename: 'bundle.js',
  },
  mode: process.env.NODE_ENV || 'development',
  plugins: [new HtmlWebpackPlugin({ template: './client/index.html' })],
  devServer: {
    static: {
      directory: path.resolve(import.meta.dirname, './client'),
    },
    port: 8080,
    proxy: [
      {
        context: '/api/',
        target: 'http://localhost:3000',
      },
    ],
    historyApiFallback: true,
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
};
