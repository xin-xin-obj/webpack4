const path = require('path')

module.exports = {
	mode: 'production',
	entry: {
		index: ''
	},
	output: {
		filename: '[name].[hash:5].js',
		chunkFilename: '[name].[contenthash].js',
		publicPath: '',
		path: path.resolve(__dirname, 'dist'),
		library: '',
		libraryTarget: 'umd'
	},
	optimization: {
		runtimeChunk: {
			name: 'runtime'
		},
		usedExports: true,
		splitChunks: {
			chunks: 'all',
			minSize: 30000,
			minChunks: 2,
			maxAsynsRequests: 5,
			maxInitialRequests: 3,
			automaticDelimiter: '~',
			name: true,
			cacheGroups: {
				vendors: {
					priority: 1,
					minSize: 0,
					minChunks: 1,
					filename: 'vendors.js',
					chunks: 'initial',
					test: /[\\/]node_modules[\\/]/
				},
				default: {
					priority: -1,
					minSize: 0,
					minChunks: 0,
					filename: 'common.js',
					chunks: 'initial',
					useExsitingChunk: true
				}
			}
		}
	},
	watch: true,
	watchOptions: {
		poll: 1000,
		aggregateTimemout: 500,
		ignored: /node_modules/
	},
	devtool: 'cheap-module-source-map',
	externals: {
		jquery: '$'
	},
	resolve: {
		modules: [path.resolve(__dirname, 'node_modules')],
		extensions: ['.js'],
		mainFileds: ['style'],
		alias: {
			bootstrap: ''
		}
	},
	modules: {
		noParse: /jquery/
	},
}
