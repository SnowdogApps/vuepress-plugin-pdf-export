const puppeteer = require('puppeteer')
const pdf = require('pdfjs')
const { join } = require('path')
const { fs, logger, chalk } = require('@vuepress/shared-utils')
const { yellow, gray } = chalk

function _createToc(doc, toc, tocPageCount) {
  doc.text('Table of Contents', { fontSize: 20 });
  doc.text(' ', { fontSize: 8 });
  const table = doc.table({
    widths: [5 * pdf.mm, (210-85.8) * pdf.mm, 30 * pdf.mm],
    padding: 0,
    borderWidth: 0
  });
  let currentPage = tocPageCount;
  if (currentPage == -1)
    currentPage = 9998;

  toc.forEach(t => {
    const row = table.row();
    if (t.tocLevel == 0) {
      row.cell(t.title, {fontSize: 11, textAlign: 'left', colspan: 2});
      row.cell((currentPage+1).toString(), {fontSize: 11, textAlign: 'right'});
    } else if (t.tocLevel == 1) {
      row.cell('', {fontSize: 11, textAlign: 'left'});
      row.cell(t.title, {fontSize: 11, textAlign: 'left'});
      row.cell((currentPage+1).toString(), {fontSize: 11, textAlign: 'right'});
    }
    // Other toc levels mean skipping the entry

    if (tocPageCount != -1)
      currentPage += t.pageCount;
  });
}

module.exports = async (ctx, {
  port,
  host,
  sorter,
  filter,
  tocLevel,
  frontPage,
  outputFileName,
  puppeteerLaunchOptions,
  pageOptions
}) => {
  const { pages, tempPath } = ctx
  const tempDir = join(tempPath, 'pdf')
  fs.ensureDirSync(tempDir)

  // Default toc level if not specified
  if (typeof tocLevel !== 'function') {
    tocLevel = function() { return -1; }
  }

  let exportPages = pages.slice(0)

  if (typeof filter === 'function') {
    exportPages = exportPages.filter(filter);
  }

  if (typeof sorter === 'function') {
    exportPages = exportPages.sort(sorter)
  }

  exportPages = exportPages.map(page => {
    return {
      url: page.path,
      title: page.title,
      location: `http://${host}:${port}${page.path}`,
      path: `${tempDir}/${page.key}.pdf`,
      relativePath: page.relativePath
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
    // Build the TOC (collect page numbers, etc)
    var toc = []
    for (let i = 0; i < exportPages.length; i++) {
        const {
          relativePath,
          path,
          title
        } = exportPages[i]
        const file = fs.readFileSync(path)
        const page = new pdf.ExternalDocument(file)
        const tl = tocLevel(exportPages[i])
        if (tl == 0 || tl == 1) {
          toc.push({tocLevel: tl, title: title, pageCount: page.pageCount})
        }
    }

    // Generate and TOC without page numbers to count pages
    const tocPdf = new pdf.Document({
      paddingLeft: 25.4 * pdf.mm,
      paddingRight: 25.4 * pdf.mm,
      paddingTop: 25.4 * pdf.mm,
      paddingBottom: 37.6 * pdf.mm,
    });
    if (toc.length > 0) {
      _createToc(tocPdf, toc, -1);
    }
    let tocPageCount = -1;
    tocPdf.asBuffer((err, data) => {
      if (err) {
        throw err;
      } else {
        const tocPages = new pdf.ExternalDocument(data);
        tocPageCount = tocPages.pageCount;
      }
    }).finally(x => {
      // Merge the pages, but first, insert the TOC
      const mergedPdf = new pdf.Document({
        paddingLeft: 25.4 * pdf.mm,
        paddingRight: 25.4 * pdf.mm,
        paddingTop: 25.4 * pdf.mm,
        paddingBottom: 37.6 * pdf.mm,
      });

      if (frontPage !== false) {
        const file = fs.readFileSync(frontPage)
        const page = new pdf.ExternalDocument(file)
        mergedPdf.addPagesOf(page);
        tocPageCount += page.pageCount;
      }

      if (toc.length > 0) {
        _createToc(mergedPdf, toc, tocPageCount);
      } else {
        tocPageCount = 0;
      }

      for (let i = 0; i < exportPages.length; i++) {
          const {
            path,
          } = exportPages[i]
          const file = fs.readFileSync(path)
          const page = new pdf.ExternalDocument(file)
          mergedPdf.addPagesOf(page)
      }

      mergedPdf.asBuffer((err, data) => {
        if (err) {
          throw err
        } else {
          fs.writeFileSync(outputFileName, data, { encoding: 'binary' })
          logger.success(`Export ${yellow(outputFileName)} file!`)
          resolve()
        }
      })
    });
  })

  await browser.close()
  fs.removeSync(tempDir)
}
