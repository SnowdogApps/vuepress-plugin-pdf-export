const puppeteer = require('puppeteer')
const pdf = require('pdfjs')
const { join } = require('path')
const { fs, logger, chalk } = require('@vuepress/shared-utils')
const { yellow, gray } = chalk

module.exports = async (ctx, {
  port,
  host,
  sorter,
  outputFileName,
  puppeteerLaunchOptions,
  pageOptions
}) => {
  const { pages, tempPath } = ctx
  const tempDir = join(tempPath, 'pdf')
  fs.ensureDirSync(tempDir)

  let exportPages = pages.slice(0)

  if (typeof sorter === 'function') {
    exportPages = exportPages.sort(sorter)
  }

  exportPages = exportPages.map(page => {
    return {
      url: page.path,
      title: page.title,
      location: `http://${host}:${port}${page.path}`,
      path: `${tempDir}/${page.key}.pdf`
    }
  })

  const browser = await puppeteer.launch(puppeteerLaunchOptions)
  const browserPage = await browser.newPage()

  for (let i = 0; i < exportPages.length; i++) {
    const {
      location,
      path: pagePath,
      url,
      title
    } = exportPages[i]

    await browserPage.setDefaultNavigationTimeout(0)

    await browserPage.goto(
      location,
      { waitUntil: 'networkidle2' }
    )

    await browserPage.pdf({
      path: pagePath,
      format: 'A4',
      ...pageOptions
    })

    logger.success(`Generated ${yellow(title)} ${gray(`${url}`)}`)
  }

  await new Promise(resolve => {
    const mergedPdf = new pdf.Document()

    exportPages
      .map(({ path }) => fs.readFileSync(path))
      .forEach(file => {
        const page = new pdf.ExternalDocument(file)
        mergedPdf.addPagesOf(page)
      })

    mergedPdf.asBuffer((err, data) => {
      if (err) {
        throw err
      } else {
        fs.writeFileSync(outputFileName, data, { encoding: 'binary' })
        logger.success(`Export ${yellow(outputFileName)} file!`)
        resolve()
      }
    })
  })

  await browser.close()
  fs.removeSync(tempDir)
}
