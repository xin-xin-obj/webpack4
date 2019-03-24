﻿const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 抽离出 css 样式为一个文件
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin') // css 压缩
const UglifyJsWebpackPlugin = require('uglifyjs-webpack-plugin') // js 压缩
const CleanWebpackPlugin = require('clean-webpack-plugin') // 每次打包都会删掉原来的并重新打包
const CopyWebpackPlugin = require('copy-webpack-plugin') // 拷贝文件
const Happypack  = require('happypack')

module.exports = { // 开发服务器配置
  mode: 'production',
  entry: {
    index: './src/index.js', // 入口
    other: './src/other.js'
  },
  output: {
    filename: '[name].[hash:5].js', // 打包后文件名, 加入 hash 5位
    path: path.resolve(__dirname, 'dist') // 打包后文件放哪里, 路径必须是一个绝对路径, path.resolve 相对路径解析成绝对路径
    // publicPath: 'http://www.zhihu.cn' // 引入资源路径前面加的前缀
  },
  optimization: { // 优化项
    minimizer: [
      new UglifyJsWebpackPlugin({
        cache: true, // 缓存
        parallel: true, // 并发压缩
        sourceMap: true // 监控错误
      }),
      new OptimizeCssAssetsWebpackPlugin({})
    ],
    splitChunks: { // 多页面 分割代码
      cacheGroups: { // 缓存组
        common: { // 公共模块
          chunks: 'initial', // 刚开始
          minSize: 0, // 超过 0 个字节
          minChunks: 2 // 用了 2 次以上
        },
        vendor: { // 第三方模块
          priority: 1, // 先执行 权限高
          test: /node_modules/,
          chunks: 'initial', // 刚开始
          minSize: 0, // 超过 0 个字节
          minChunks: 2 // 用了 2 次以上
        }
      }
    }
  },
  watch: true, // 实时监控打包
  watchOptions: {
    poll: 1000, // 监听间隔
    aggregateTimeout: 500, // 防抖
    ignored: /node_modules/ // 不需要监控
  },
  resolve: { // 解析第三方包
    modules: [path.resolve('node_modules')], // 找文件的位置
    extensions: ['.js', '.css', '.json'], // 引入文件的后缀依次解析
    mainFields: ['style', 'main'], // 先找 style 再找 main
    // mainFiles: [], // 入口文件名字 index.js
    alias: { // 别名
      bootstrap: 'bootstrap/dist/css/bootstrap.css'
    }
  },
  devtool: 'cheap-module-source-map', // 源码映射会单独生成一个 sourcemap 文件 出错了会标识当前报错位置
  devServer: {
    hot: true, // 启动热更新
    port: 8080, // 启动端口
    open: true, // 自动打开浏览器
    progress: true, // 运行过程
    contentBase: './build', // 指向 build 文件
    compress: true, // 压缩
    // proxy: { // 1) 重写方式把请求代理到 express 服务上
    //   '/api': 'http://localhost:3000' // 配置代理
    //   '/api': {
    //     target: 'http://localhost:3000', // 配置代理
    //     pathRewrite: {'/api':''} // 重写路径
    //   }
    // }
    before(app) { // 2) 提供的钩子，前端模拟数据
      app.get('/user', (req, res) => {
        res.json({name: 'ganbefore'})
      })
    }
    // 3) 服务端启动 webpack
  },
  // externals: { // webpack 不处理依赖库
  //   jquery: '$'
  // },
  module: { // 模块, css, img... 转换为模块
    noParse: /jquery/, // 不需要解析
    rules: [ // 后往前 右往左 执行
      // {
      //   test: require.resolve('jquery'),
      //   use: 'expose-loader?$' // 暴露全局的 loader 内联 loader
      // },
      {
        test: /\.js$/,
        use: 'Happypack/loader?id=js',
        include: path.resolve(__dirname, 'src'),
        exclude: '/node_modules',
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // 抽离出的 css 文件用 link 标签引入
          {
            loader: 'css-loader' // 解析 @import 语法
          },
          {
            loader: 'postcss-loader' // css 处理, autoprefixer: 加前缀
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader', // style-loader 动态创建 style 标签，塞到 head 标签里
            options: {
              insertAt: 'top' // 插入到顶部
            }
          },
          {
            loader: 'css-loader' // 解析 @import 语法
          },
          {
            loader: 'postcss-loader' // css 处理, autoprefixer: 加前缀
          },
          {
            loader: 'less-loader' // less -> css
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        // use: [
        //   {
        //     loader: 'file-loader' // 默认会在内部生成一张图片到 build 目录把生成的图片名字返回回来
        //   },
        // ]
        use: [
          {
            loader: 'url-loader', // 将文件转换为base64
            options: {
              limit: 1, // 小于设置值时用 base64 来转化
              outputPath: '/img/' // 放置在 img 目录下
              // publicPath: 'http://wwww.zhihu.cn' // 引入资源路径前面加的前缀
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-withimg-loader' // html中直接使用img标签src加载图片的话，因为没有被依赖，图片将不会被打包。这个loader解决这个问题，图片会被打包，而且路径也处理妥当
          }
        ]
      }
    ]
  },
  plugins: [ // 放置 webpack 插件
    new HtmlWebpackPlugin({
      template: './src/index.html', // 模板
      filename: 'index.html', // 打包后的文件名
      minify: { // 压缩
        removeAttributeQuotes: true, // 删除双引号
        collapseWhitespace: true // 变成一行
      },
      hash: true // 引入文件名称加上 hash
    }),
    new MiniCssExtractPlugin({ // 抽离出 css 样式
      filename: 'css/main.css'
    }),
    new webpack.ProvidePlugin({ // 在每个模块中都注入 $
      $: 'jquery'
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: './doc',
        to: './'
      }
    ]),
    new webpack.BannerPlugin('ganyihuan 2019'), // 版权信息
    new webpack.DefinePlugin({ // 定义环境变量
      DEV: JSON.stringify('production'), // string production
      FLAG: 'true', // boolean
      EXPRESSION: '1+1' // 2
    }),
    new webpack.IgnorePlugin(/\.\/locale/, /moment/), // 忽略 moment 里的 locale 包
    // new webpack.DllReferencePlugin({ // 引入 Dll 的函数名
    //   manifest: path.resolve(__dirname, 'dist', 'manifest.json')
    // })
    new Happypack({ // js 用 Happypack 打包
      id: 'js',
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
            plugins: [
              ['@babel/plugin-proposal-decorators', { 'legacy': true }], // 类和对象装饰器
              ['@babel/plugin-proposal-class-properties', { 'loose': true }], // 属性初始化
              ['@babel/plugin-transform-runtime'],
              ['@babel/plugin-syntax-dynamic-import']
            ]
          }
        }
      ]
    }),
    new webpack.HotModuleReplacementPlugin(), // 热更新插件
    new webpack.NamedModulesPlugin() // 打印更新的模块路径
  ]
}
