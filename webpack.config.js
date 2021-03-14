const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  mode: 'development',
  node: {
    fs: 'empty',
    net: 'empty'
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, 'dist')   
  },
  plugins: [   
    new webpack.DefinePlugin({
      BAOBAB_DEPLOYED_ADDRESS: JSON.stringify(fs.readFileSync('deployedAddress.txt', 'utf8').replace(/\n|\r/g, "")),
      CYPRESS_DEPLOYED_ADDRESS: JSON.stringify(fs.readFileSync('cypress/deployedAddress.txt', 'utf8').replace(/\n|\r/g, "")),
      BAOBAB_DEPLOYED_ABI: fs.existsSync('deployedABI.txt') && fs.readFileSync('deployedABI.txt', 'utf8'),
      CYPRESS_DEPLOYED_ABI: fs.existsSync('cypress/deployedABI.txt') && fs.readFileSync('cypress/deployedABI.txt', 'utf8'),
      CYPRESS_PRIV_KEY: JSON.stringify(fs.existsSync('cypress_secret') && fs.readFileSync('cypress_secret', 'utf8')),
      BAOBAB_PRIV_KEY: JSON.stringify(fs.existsSync('baobab_secret') && fs.readFileSync('baobab_secret', 'utf8')),
    }),
    new CopyWebpackPlugin([{ from: "./src/index.html", to: "index.html"}])
  ],
  devServer: { contentBase: path.join(__dirname, "dist"), compress: true, port: 80}
}