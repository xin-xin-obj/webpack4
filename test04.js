module.exports = {
  module: { // 模块, css, img... 转换为模块
    noParse: /jquery/, // 防止 webpack 解析那些任何与给定正则表达式相匹配的文件
    rules: [ // 后往前 右往左 执行
    	{
				test: require.resolve('jquery'),
				use: [
					{
						loader: 'expose-loader?$' // 暴露全局的 loader
					}
				]
			},
      {
        test: /\.js$/,
        use: 'Happypack/loader?id=js', // 多线打包
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // 抽离出的 css 文件用 <link /> 标签引入
          {
            loader: 'css-loader' // 分析几个 css 文件然后合并成一个, 如解析 @import 语法
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
            loader: 'style-loader', // 动态创建 style 标签，塞到 <head></head> 标签里
            options: {
              sourceMap: true, // singleton 会阻止 sourceMap
              singleton: true, // singleton (是否只使用一个 style 标签)
              modules: true, // 使样式不是全局
              insertAt: 'top', // 插入到 HTML 文件的顶部
              insertInto: '#app', // 插入 dom 位置
              transform: './css.transform.js' // 插入页面前执行
            }
          },
          {
            loader: 'css-loader', // 处理 css 文件然后合并成一个, 如解析 @import 语法
            options: {
              sourceMap: true,
              importLoaders: 2 // 对于 @import ''; 情况处理, 一定要走下面两个 loader
            }
          },
          {
            loader: 'postcss-loader', // css 处理, autoprefixer: 加前缀等功能
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'less-loader', // less 转化为 css
            options: {
              sourceMap: true
            }
          }
        ]
      },
      { // 处理图片
        test: /\.(png|jpg|jpeg|gif)$/,
        // use: [
        //   {
        //     loader: 'file-loader' // 把文件挪动到打包目录下，文件地址返回给变量
        //   },
        // ]
        use: [
          {
            loader: 'url-loader', // 将图片转换为 base64
            options: {
              name: '[name]-[hash:5].[ext]', // 生成的图片名称
              limit: 2048, // 大于 2048 处理成 base64
              publicPath: '', // 引入资源路径前面加的前缀 ''
              outputPath: 'dist/', // 放置在 dist 文件夹下
              useRelativePath: true // 放置在 assets/imgs, 因为图片原本路径为 (aseets/imgs)
            }
          }
        ]
      },
      { // 处理字体文件
        test: /\.(eot|woff2?|ttf|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]-[hash:5].[ext]',
              limit: 5000,
              outputPath: 'assets/imgs/'
            }
          },
          { // 压缩图片
            loader: 'img-loader',
            options: {
              pngquant: { // .png 图片处理
                quality: 80 // 压缩 png
              }
            }
          }
        ]
      },
      { // 处理 html
        test: /\.html$/,
        use: [
          {
            loader: 'html-withimg-loader' // html 中使用 img 标签 src 加载图片
          }
        ]
      }
      // { // 第三方库处理
      //   test: path.resolve(__dirname, './src/app.js'),
      //   use: [
      //     { // use modules that depend on specific global variables
      //       loader: 'imports-loader',
      //       options: {
      //         $: 'jquery'
      //       }
      //     }
      //   ]
      // }
    ]
  },
  plugins: [
    new Happypack({ // js 用 Happypack 打包
      id: 'js',
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { useBuiltIns: 'usage' }] // useBuiltIns 按需处理
            ],
            plugins: [
              ['@babel/plugin-proposal-decorators', { 'legacy': true }], // 类和对象装饰器
              ['@babel/plugin-proposal-class-properties', { 'loose': true }], // 属性初始化
              ['@babel/plugin-transform-runtime'], // 能写 es6+ 新方法, 写库的时候用
              ['@babel/plugin-syntax-dynamic-import'] // 动态加载 import
            ]
          }
        },
        {
          loader: 'imports-loader?this=>window' // console.log(this === window) 返回 true
        },
        {
          loader: 'eslint-loader', // 放置 babel-loader 之后, eslint 校验代码格式
          options: {
            formatter: require('eslint-friendly-formatter') // 报错时输入内容的格式更友好
          },
          enforce: 'pre' // pre 先执行, post 后执行
        }
      ]
    })  	
  ]
}
