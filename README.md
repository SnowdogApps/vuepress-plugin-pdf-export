# @snowdog/vuepress-plugin-pdf-export
Vuepress plugin for exporting site as PDF

## Features
- Exports whole Vuepress based page as a single PDF file
- Applies styles to hide UI elements like navigation or sidebar
- Doesn't require other runtimes like Java to operate
- Designed to work well in headless environments like CI runners

## Config options
- `filter` - function for filtering pages (default `false`)
- `individualPdfFolder` - string (default temp dir), if supplied will save the individual PDFs and a `files.json` file
    with the title, url, location, path, key, and frontmatter for each PDF to allow later combining/mapping
- `theme` - theme name (default `@vuepress/default`)
- `outputFileName` - name of output file (default `site.pdf`, or null to skip creating a combined file (useful if saving individual PDFs))
- `puppeteerLaunchOptions` - [Puppeteer launch options object](https://github.com/puppeteer/puppeteer/blob/v2.1.1/docs/api.md#puppeteerlaunchoptions) (default `{}`)
- `pageOptions` - [Puppeteer page formatting options object](https://github.com/puppeteer/puppeteer/blob/v2.1.1/docs/api.md#pagepdfoptions) (default `{format: 'A4'}`)
- `sorter` - function for changing pages order (default `false`)

### Sort/Filter Functions

The input to each is page object(s) from Vuepress context:
[https://vuepress.vuejs.org/plugin/context-api.html#ctx-pages](https://vuepress.vuejs.org/plugin/context-api.html#ctx-pages)

There is better documenation about the properties of a page object currently available at:
[https://vuepress.vuejs.org/plugin/option-api.html#extendpagedata](https://vuepress.vuejs.org/plugin/option-api.html#extendpagedata)

At the time of writing all the keys available were:
`title`, `_meta`, `_filePath`, `_content`, `_permalink`, `frontmatter`, `_permalinkPattern`, `_extractHeaders`,
`_context`, `regularPath`, `relativePath`, `key`, `path`, `_strippedContent`, `headers`, `_computed`, `_localePath`

Sort will receive `(a, b)` where `a` and `b` are page objects and should return an integer.

Filter will receive a page object and the index and should return `true`/`false`.

## Usage

Using this plugin:

``` js
// in .vuepress/config.js
module.exports = {
  plugins: ['@snowdog/vuepress-plugin-pdf-export']
}
```

Using the plugin with options:

```js
// in .vuepress/config.js
module.exports = {
    // ...
    plugins: [
        // ...
        [
            require("../../vuepress-plugin-pdf-export"),
            {
                // options to override
                outputFileName: null,
                pageOptions: {
                    format: 'Letter',
                    printBackground: true,
                    displayHeaderFooter: false,
                    headerTemplate: "",
                    footerTemplate: "",
                    margin: {
                        top: "1in",
                        left: "1in",
                        right: "1in",
                        bottom: "1in",
                    }
                },
                individualPdfFolder: 'build/pdf',
                filter: (a) =>  !a?.frontmatter?.home,
                sorter: (a, b) =>  a.path < b.path ? -1 : 1,
            }
        ]
    ],
    // ...
};
```

Then run:

``` bash
vuepress export [path/to/your/docs]
```

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
