const path = require('path')
const configPaths = require('./paths.json')

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')

const OUTPUT = process.env.OUTPUT || 'public'
const outputPath = configPaths.output.js[OUTPUT]

const fs = require('fs')
const filePath = path.resolve(__dirname, '../src/globals/polyfills/Object/defineProperty.js')
const objectDefinePropertyPolyfill = fs.readFileSync(filePath, 'utf8')

console.log(`Webpack will build output to ${outputPath}`)

const config = {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      // Webpack's default minification undoes the work of the ES3 preset below.
      // So we need to override the minifier with the 'ie8' flag enabled.
      // TODO: Contribute way to update uglifyOptions without having to require plugin directly.
      // https://github.com/webpack/webpack/blob/b30de38eb5311051388db05287aa3fd951fa41de/lib/WebpackOptionsDefaulter.js#L273
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          ie8: true
        }
      })
    ]
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
            // env preset is used to avoid getters/setters in Object.defineProperty
            // since this cannot be polyfilled
            // es3 preset is used to avoid keywords such as 'catch' which will break execution
            // in IE8
            presets: ['env', 'es3']
          }
        }
      }
    ]
  },
  plugins: [
    // HACK:
    // Webpack's module wrapper code uses Object.defineProperty
    // If we try to import a polyfill within our modules it's already too late.
    // We're using the banner plugin to allow concatentation to the beginning of the file.
    new webpack.BannerPlugin({
      banner: objectDefinePropertyPolyfill,
      raw: true,
      entryOnly: true // Only top level bundles need to be polyfilled
    })
  ],
  output: {
    // output path (e.g. packages)
    path: path.resolve(__dirname, '..', outputPath),
    filename: '[name]/[name].js', // For example, button/button.js
    library: 'govuk-frontend',
    libraryTarget: 'umd',
    umdNamedDefine: true, // Allows RequireJS to reference `govuk-frontend`
    sourceMapFilename: '[name]/[name].js.map'
  }
}

module.exports = config
