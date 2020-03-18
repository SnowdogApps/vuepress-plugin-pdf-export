/* global THEME */


const { join } = require('path')
const { dev } = require('vuepress')
const { logger, chalk } = require('@vuepress/shared-utils')
const { red } = chalk

import generatePDF from './generatePdf'

module.exports = cli => {
  cli
    .command('export [targetDir]', 'export current vuepress site to a PDF file')
    .allowUnknownOptions()
    .action(async (dir = '.') => {
      dir = join(process.cwd(), dir)

      const nCtx = await dev({
        sourceDir: dir,
        clearScreen: false,
        theme: THEME
      })

      logger.setOptions({ logLevel: 3 })
      logger.info(`Start to generate current site to PDF ...`)

      try {
        await generatePDF(nCtx, {
          port: nCtx.devProcess.port,
          host: nCtx.devProcess.host
        })
      } catch (error) {
        console.error(red(error))
      }

      nCtx.devProcess.server.close()
      process.exit(0)
    })
}
