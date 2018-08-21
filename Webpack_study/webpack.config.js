const webpack = require('webpack');

module.exports = {
  entry: './Webpack_study/index.js',    //位置相对于运行命令所在的根目录而定
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
};
