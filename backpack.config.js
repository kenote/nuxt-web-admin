// Backpack Configuration file
const tsconfigPathsWebpackPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  webpack: (config, options, webpack) => {
    config.entry = {
      index: './server/index.ts'
    }

    config.resolve = {
      extensions: ['.ts', '.js', '.json'],
      plugins: [
        new tsconfigPathsWebpackPlugin({
          configFile: 'server/tsconfig.json'
        })
      ]
    }

    config.module.rules.push({
      test: /\.ts$/,
      loader: 'awesome-typescript-loader',
      options: {
        configFileName: 'server/tsconfig.json'
      }
    })
    return config
  }
}