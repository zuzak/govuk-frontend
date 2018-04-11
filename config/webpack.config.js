const path = require('path')
const configPaths = require('./paths.json')

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const OUTPUT = process.env.OUTPUT || 'public'
const outputPath = configPaths.output.js[OUTPUT]

console.log(`Webpack will build output to ${outputPath}`)

const config = {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: false
  },
  entry: configPaths.entry.js,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: [
              require('babel-plugin-transform-es3-member-expression-literals'),
              require('babel-plugin-transform-es3-property-literals')
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new UglifyJsPlugin({
      uglifyOptions: {
        ie8: true
      }
    })
  ],
  output: {
    // output path (e.g. packages)
    path: path.resolve(__dirname, '..', outputPath),
    filename: '[name]/[name].js'//, // For example, button/button.js
    // library: 'govuk-frontend',
    // libraryTarget: 'umd',
    // umdNamedDefine: true, // Allows RequireJS to reference `govuk-frontend`
    // sourceMapFilename: '[name]/[name].js.map'
  }
}

module.exports = config
