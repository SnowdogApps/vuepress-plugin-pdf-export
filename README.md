# @e8johan/vuepress-plugin-pdf-export

Vuepress plugin for exporting site as PDF

This is a fork of @snowdog/vuepress-plugin-pdf-export. All changes are available in a PR to the upstream repository. Use this package at your own peril.

## Features
- Exports whole Vuepress based page as a single PDF file
- Applies styles to hide UI elements like navigation or sidebar
- Doesn't require other runtimes like Java to operate
- Designed to work well in headless environments like CI runners

## Config options
- `theme` - theme name (default `@vuepress/default`)
- `sorter` - function for changing pages order (default `false`)
- `filter` - function for filtering the pages (default `false`)
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
