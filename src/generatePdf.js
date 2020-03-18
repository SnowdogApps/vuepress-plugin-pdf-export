/* global SORTER, PUPPETEER_LAUNCH_OPTIONS, OUTPUT_FILE_NAME */

const puppeteer = require('puppeteer')
const pdf = require('pdfjs')
const { join } = require('path')
const { fs, logger, chalk } = require('@vuepress/shared-utils')
const { yellow, gray } = chalk

module.exports = async (ctx, { port, host }) => {
  const { pages, tempPath } = ctx
  const tempDir = join(tempPath, 'pdf')
  fs.ensureDirSync(tempDir)

  let exportPages = pages.slice(0)

  if (typeof SORTER === 'function') {
    exportPages = exportPages.sort(SORTER)
  }

  exportPages = exportPages.map(page => {
    return {
      url: page.path,
      title: page.title,
      location: `http://${host}:${port}${page.path}`,
      path: `${tempDir}/${page.key}.pdf`
    }
  })

  const browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTIONS)
  const browserPage = await browser.newPage()

  for (let i = 0; i < exportPages.length; i++) {
    const {
      location,
      path: pagePath,
      url,
      title
    } = exportPages[i]

    await browserPage.goto(
      location,
      { waitUntil: 'networkidle2' }
    )

    await browserPage.pdf({
      path: pagePath,
      format: 'A4'
    })

    logger.success(`Generated ${yellow(title)} ${gray(`${url}`)}`)
  }

  const files = exportPages.map(({ path }) => path)
  const outputFile = `${OUTPUT_FILE_NAME}.pdf`

  await new Promise(resolve => {
    const mergedPdf = new pdf.Document()

    files.forEach(filePath => {
      const file = fs.readFileSync(filePath)
      const page = new pdf.ExternalDocument(file)
      mergedPdf.addPagesOf(page)
    })

    mergedPdf.asBuffer((err, data) => {
      if (err) {
        throw err
      } else {
        fs.writeFileSync(outputFile, data, { encoding: 'binary' })
        logger.success(`Export ${yellow(outputFile)} file!`)
        resolve()
      }
    })
  })

  await browser.close()
  fs.removeSync(tempDir)
}
