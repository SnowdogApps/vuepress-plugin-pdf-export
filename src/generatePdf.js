const puppeteer = require('puppeteer')
const pdf = require('pdfjs')
const { join } = require('path')
const { fs, logger, chalk } = require('@vuepress/shared-utils')
const { yellow, gray } = chalk

module.exports = async (ctx, {
  filter,
  host,
  individualPdfFolder,
  outputFileName,
  pageOptions,
  port,
  puppeteerLaunchOptions,
  sorter,
}) => {
  const { pages, tempPath } = ctx
  const pdfDir = individualPdfFolder || join(tempPath, 'pdf')

  if (individualPdfFolder && fs.existsSync(pdfDir)) {
    fs.removeSync(pdfDir)
  }
  fs.ensureDirSync(pdfDir)

  let exportPages = pages.slice(0)

  if (typeof sorter === 'function') {
    exportPages = exportPages.sort(sorter)
  }

  if (typeof filter === 'function') {
    exportPages = exportPages.filter(filter)
  }

  exportPages = exportPages.map(page => {
    return {
      url: page.path,
      title: page.title,
      location: `http://${host}:${port}${page.path}`,
      path: `${pdfDir}/${page.key}.pdf`,
      key: page.key,
      frontmatter: page.frontmatter,
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
      format: 'A4',
      ...pageOptions,
      path: pagePath,
    })

    logger.success(`Generated ${yellow(title)} ${gray(`${url}`)}`)
  }

  if (individualPdfFolder) {
    fs.writeFileSync(`${pdfDir}/files.json`, JSON.stringify(exportPages), {encoding: 'UTF8'})
  }

  if (outputFileName) {
    await new Promise(resolve => {
      const mergedPdf = new pdf.Document()

      exportPages
        .map(({path}) => fs.readFileSync(path))
        .forEach(file => {
          const page = new pdf.ExternalDocument(file)
          mergedPdf.addPagesOf(page)
        })

      mergedPdf.asBuffer((err, data) => {
        if (err) {
          throw err
        } else {
          fs.writeFileSync(outputFileName, data, {encoding: 'binary'})
          logger.success(`Export ${yellow(outputFileName)} file!`)
          resolve()
        }
      })
    })
  }

  await browser.close()
  if (!individualPdfFolder) {
    fs.removeSync(pdfDir)
  }
}
