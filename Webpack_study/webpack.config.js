const webpack = require('webpack');
const path = require("path");//

module.exports = {
  mode: 'development',
  entry: './index.js',    //路径相对于运行webpack命令时所在的目录而定
  output: {
    path: path.resolve(__dirname, 'dist'),	//__dirname：node.js的全局变量，指向当前执行脚本所在的目录路径，而且是绝对路径，path.resolve用来拼接路径
    filename: 'bundle.js'
  },
  module: {
	rules: [
		{
			test: /\.jsx$/, 
			include:__dirname,
			use:'babel-loader',
		}
	]
  }
};
