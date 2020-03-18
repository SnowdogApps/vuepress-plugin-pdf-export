const { resolve } = require('path')

module.exports = options => ({
  extendCli: resolve(__dirname, 'src', 'extendCli.js'),
  enhanceAppFiles: resolve(__dirname, 'src', 'enhanceAppFile.js'),
  define() {
    return {
      THEME: options.theme || '@vuepress/default',
      SORTER: options.sorter || false,
      OUTPUT_FILE_NAME: options.outputFileName || 'site',
      PUPPETEER_LAUNCH_OPTIONS: options.puppeteerLaunchOptions || {}
    }
  }
})
