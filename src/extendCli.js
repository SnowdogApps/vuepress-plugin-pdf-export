const { dev } = require('vuepress')
const { logger, chalk, path } = require('@vuepress/shared-utils')
const { join } = path
const { red } = chalk

const generatePDF = require('./generatePdf')

module.exports = options => {
  const theme = options.theme || '@vuepress/default'
  const filter = options.filter || false
  const sorter = options.sorter || false
  const outputFileName = options.outputFileName === null ? null : options.outputFileName || 'site.pdf'
  const puppeteerLaunchOptions = options.puppeteerLaunchOptions || {}
  const pageOptions = options.pageOptions || {}
  const individualPdfFolder = options.individualPdfFolder;

  return cli => {
    cli
      .command('export [targetDir]', 'export current vuepress site to a PDF file')
      .allowUnknownOptions()
      .action(async (dir = '.') => {
        dir = join(process.cwd(), dir)

        const nCtx = await dev({
          sourceDir: dir,
          clearScreen: false,
          theme
        })

        logger.setOptions({ logLevel: 3 })
        logger.info(`Start to generate current site to PDF ...`)

        try {
          await generatePDF(nCtx, {
            filter,
            host: nCtx.devProcess.host,
            individualPdfFolder,
            outputFileName,
            pageOptions,
            port: nCtx.devProcess.port,
            puppeteerLaunchOptions,
            sorter,
          })
        } catch (error) {
          console.error(red(error))
        }

        nCtx.devProcess.server.close()
        process.exit(0)
      })
  }
}
