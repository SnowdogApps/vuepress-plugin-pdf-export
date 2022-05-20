# @e8johan/vuepress-plugin-pdf-export

Vuepress plugin for exporting site as PDF

This is a fork of @snowdog/vuepress-plugin-pdf-export. All changes are available in a PR to the upstream repository. Use this package at your own peril.

## Features
- Exports whole Vuepress based page as a single PDF file
- Applies styles to hide UI elements like navigation or sidebar
- Doesn't require other runtimes like Java to operate
- Designed to work well in headless environments like CI runners
- Can filter and sort pages.
- Can generate a rudimentary table of contents

## Config options
- `theme` - theme name (default `@vuepress/default`)
- `sorter` - function for changing pages order (default `false`)
- `filter` - function for filtering the pages (default `false`)
- `tocLevel` - function returning a TOC level for the pages, i.e. zero or one (default `false`)
- `outputFileName` - name of output file (default `site.pdf`)
- `puppeteerLaunchOptions` - [Puppeteer launch options object](https://github.com/puppeteer/puppeteer/blob/v2.1.1/docs/api.md#puppeteerlaunchoptions) (default `{}`)
- `pageOptions` - [Puppeteer page formatting options object](https://github.com/puppeteer/puppeteer/blob/v2.1.1/docs/api.md#pagepdfoptions) (default `{format: 'A4'}`)

### Usage

Using this plugin:

``` js
// in .vuepress/config.js
module.exports = {
  plugins: ['@snowdog/vuepress-plugin-pdf-export']
}
```

Then run:

``` bash
vuepress export [path/to/your/docs]
```

#### The filter function

The `filter` function takes a `pages` object and returns `true` or `false`. Only pages where the function returns `true` are rendered to the pdf. The function is invoked as follows:

```
exportPages = exportPages.filter(filter);
```

#### The sorter function

The `sorter` function takes two `pages` objects and return `-1`, `0`, or `1` to indicate the sort order. The function is invoked as follows:

```
exportPages = exportPages.sort(sorter)
```

The sorting happens after the filtering, so you only have to handle the pages that pass your filter function.

#### The tocLevel function

The `tocLevel` function takes a `pages` object returns a TOC level, either zero (`0`, top level) or one (`1`, secondary level), or minus one (`-1`, leave out of TOC). If the entire TOC is empty, e.g. every page is on level `-1`, no TOC is rendered.

The TOC generation is invoked after the filtering and sorting. So the list of pages can be assumed to be filtered.

### Tips
To run this plugin on Gitlab CI you may want to run Chrome with `no-sandbox` flag. [Details](https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#setting-up-chrome-linux-sandbox)

```js
module.exports = {
  plugins: [
    ['@snowdog/vuepress-plugin-pdf-export', {
      puppeteerLaunchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    }]
  ]
}
```

## Known Issues

- At the moment, pdfjs cannot inject footers on the rendered pages, and the individual pages do not know their page number, so the page numbers in the TOC relates to the page numbers in the PDF, but no page number is rendered on the actual PDF pages.
