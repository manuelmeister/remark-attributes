# remark-attributes

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]

[**remark**][remark] plugin to support the attributes syntax
(`paragraph{.font-ultrabold}`, `[linktext](/url){target=_blank}`, and
such).

> [!WARNING]
> This plugin is a work in progress.
> It may have bugs, breaking changes and is not fully compatible with markdown-it-attrs.
>
> If you want to help to stabilize this plugin, you are welcome to contribute.

## Contents

*   [What is this?](#what-is-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(remarkAttributes)`](#unifieduseremarkattributes)
*   [Syntax](#syntax)
*   [Syntax tree](#syntax-tree)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] ([remark][]) plugin to add support for attributes.

**unified** is a project that transforms content with abstract syntax trees
(ASTs).
**remark** adds support for markdown to unified.
**mdast** is the markdown AST that remark uses.
**micromark** is the markdown parser we use.
This is a remark plugin that adds support for the directives syntax and AST to
remark.

This plugin also 'supports' attributes syntax inside mdx.
But beware to escape the curly braces with a backslash.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install remark-attributes
```

## Use

Say we have the following file, `example.md`:

```markdown
lorem ipsum [link](https://ecamp3.ch){target=_blank} color ludum dorem

- very good
- easy
- a bit compatible to markdown-it-attrs

{.custom-list}
```

And our module, `example.js`, looks as follows:

```js
import {read} from 'to-vfile'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkAttributes from 'remark-attributes'
import remarkRehype from 'remark-rehype'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'
import {visit} from 'unist-util-visit'
import {h} from 'hastscript'

main()

async function main() {
  const file = await unified()
    .use(remarkParse)
    .use(remarkAttributes)
    .use(remarkRehype)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(await read('example.md'))

  console.log(String(file))
}
```

Now, running `node example` yields:

```html
<p>lorem ipsum <a href="https://ecamp3.ch" target="_blank">link</a> color ludum dorem</p>
<ul class="custom-list">
  <li>very good</li>
  <li>easy</li>
  <li>a bit compatible to markdown-it-attrs</li>
</ul>
```

## Use in mdx

```mdx
const thisIsAMdxExpressionAndNotAnAttribute = true;

lorem ipsum [link](https://ecamp3.ch)\{target=_blank\} color ludum dorem

- very good {thisIsAMdxExpressionAndNotAnAttribute ? 'yes' : 'I tried at least'}
- easy
- a bit compatible to markdown-it-attrs

\{.custom-list\}
```

You need to set mdx to true to enable the escaped mode:
```js
remarkPlugins: [[remarkAttributes, {mdx: true}]]
```

Result:

```html
<p>lorem ipsum <a href="https://ecamp3.ch" target="_blank">link</a> color ludum dorem</p>
<ul class="custom-list">
  <li>very good yes</li>
  <li>easy</li>
  <li>a bit compatible to markdown-it-attrs</li>
</ul>
```
> **Note**
> Currently the result has a stray comment in front of the expression.


## API

This package exports no identifiers.
The default export is `remarkAttributes`.

### `unified().use(remarkAttributes)`

## Syntax

This plugin applies the syntax of <https://github.com/arobase-che/md-attr-parser>
used by the markdown-it-attrs plugin.

## Syntax tree

This plugin applies one mdast utility to build and serialize the AST.

## Contribute

See [`contributing.md`][contributing] in [`remarkjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Manuel Meister][author2] & [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/manuelmeister/remark-attributes/workflows/main/badge.svg

[build]: https://github.com/manuelmeister/remark-attributes/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/manuelmeister/remark-attributes.svg

[coverage]: https://codecov.io/github/manuelmeister/remark-attributes

[downloads-badge]: https://img.shields.io/npm/dm/remark-attributes.svg

[downloads]: https://www.npmjs.com/package/remark-attributes

[npm]: https://docs.npmjs.com/cli/install

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/HEAD/contributing.md

[support]: https://github.com/remarkjs/.github/blob/HEAD/support.md

[coc]: https://github.com/remarkjs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[author2]: https://meister.id

[unified]: https://github.com/unifiedjs/unified

[remark]: https://github.com/remarkjs/remark

[create-plugin]: https://unifiedjs.com/learn/guide/create-a-plugin/
