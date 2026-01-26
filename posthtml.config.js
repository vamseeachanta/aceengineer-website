module.exports = {
  plugins: {
    'posthtml-expressions': {
      locals: {
        rootPath: ''
      }
    },
    'posthtml-include': {
      root: './src'
    }
  }
}
