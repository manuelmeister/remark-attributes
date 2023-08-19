/**
 * @typedef {import('mdast').Root} Root
 */

import fs from 'node:fs'
import path from 'node:path'
import test from 'tape'
import {readSync} from 'to-vfile'
import {unified} from 'unified'
import {remark} from 'remark'
import {evaluateSync} from '@mdx-js/mdx'
import type {EvaluateOptions} from '@mdx-js/mdx'
import html from 'remark-rehype'
import gfm from 'remark-gfm'
import stringify from 'rehype-stringify'
import {isHidden} from 'is-hidden'
import {renderToString} from 'react-dom/server'
import * as runtime from 'react/jsx-runtime'
import {createElement} from 'react'
import remarkAttributes from '../index.js'

test('directive()', (t) => {
  t.doesNotThrow(() => {
    remark().use(remarkAttributes).use(html).use(stringify).freeze()
  }, 'should not throw if not passed options')

  t.doesNotThrow(() => {
    unified().use(remarkAttributes).freeze()
  }, 'should not throw if without parser or compiler')

  t.end()
})

const testBase = path.join('test', 'positive')

test('fixtures with md', (t) => {
  const entries = fs
    .readdirSync(testBase)
    .filter(
      (d) => !isHidden(d) && fs.existsSync(path.join(testBase, d, 'input.md'))
    )

  t.plan(entries.length)

  let index = -1
  while (++index < entries.length) {
    const fixture = entries[index]
    const todo = fixture.startsWith('_')
    t.test(fixture, {todo}, (st) => {
      const file = readSync(path.join(testBase, fixture, 'input.md'))
      const outfile = readSync(path.join(testBase, fixture, 'output.html'))
      const proc = remark()
        .use(remarkAttributes)
        .use(html)
        .use(stringify)
        .freeze()

      st.equal(String(proc.processSync(file)), String(outfile), 'process')
      st.end()
    })
  }
})

test('fixtures with mdx', (t) => {
  const entries = fs
    .readdirSync(testBase)
    .filter(
      (d) => !isHidden(d) && fs.existsSync(path.join(testBase, d, 'input.mdx'))
    )

  t.plan(entries.length)

  let index = -1
  while (++index < entries.length) {
    const fixture = entries[index]
    const todo = fixture.startsWith('_')
    t.test(fixture,{todo}, async (st) => {
      const file = readSync(path.join(testBase, fixture, 'input.mdx'))
      const outfile = readSync(path.join(testBase, fixture, 'output.html'))

      const result = evaluateSync(file, {
        ...(runtime as unknown as EvaluateOptions),
        remarkPlugins: [[remarkAttributes, {mdx: true}]]
      }).default
      const string = renderToString(createElement(result))
      st.equal(String(string), String(outfile), 'process')
      st.end()
    })
  }
})

test('should throw if missing end backslash and curly brace', async (st) => {
  const file = readSync(path.join(testBase, '../negative', 'missingend.mdx'))

  st.throws(
    () => {
      renderToString(
        createElement(
          evaluateSync(file, {
            ...(runtime as unknown as EvaluateOptions),
            remarkPlugins: [[remarkAttributes, {mdx: true}]]
          }).default
        )
      )
    },
    (error: Error): boolean => {
      return error.message === 'No closing attribute brace found'
    }
  )
})

// TODO: Fix unsupported tests
test('match markdown-it-attrs', async (st) => {
  const testcases = [
    {
      supported: true,
      name: 'it should add attributes when {} in end of last inline',
      src: 'some text{with=attrs}',
      expected: '<p with="attrs">some text</p>'
    },
    {
      supported: false,
      name: 'it should not add attributes when it has too many delimiters {{}}',
      src: 'some text {{with=attrs}}',
      expected: '<p>some text {{with=attrs}}</p>'
    },
    {
      supported: true,
      name: 'it should add attributes when {} in last line',
      src: 'some text\n{with=attrs}',
      expected: '<p with="attrs">some text\n</p>'
    },
    {
      supported: true,
      name: 'it should add classes with {.class} dot notation',
      src: 'some text{.green}',
      expected: '<p class="green">some text</p>'
    },
    {
      supported: true,
      name: 'it should add identifiers with {#id} hashtag notation',
      src: 'some text{#section2}',
      expected: '<p id="section2">some text</p>'
    },
    {
      supported: true,
      name: 'it should support classes, css-modules, identifiers and attributes in same {}',
      src: 'some text{attr=lorem .class #id}',
      expected: '<p attr="lorem" class="class" id="id">some text</p>'
    },
    {
      supported: true,
      name: 'it should support attributes inside " {attr="lorem ipsum"}',
      src: 'some text{attr="lorem ipsum"}',
      expected: '<p attr="lorem ipsum">some text</p>'
    },
    {
      supported: true,
      name: 'it should add classes in same class attribute {.c1 .c2} -> class="c1 c2"',
      src: 'some text{.c1 .c2}',
      expected: '<p class="c1 c2">some text</p>'
    },
    {
      supported: true,
      name: 'it should add classes to inline elements',
      src: 'paragraph **bold**{.red} asdf',
      expected: '<p>paragraph <strong class="red">bold</strong> asdf</p>'
    },
    {
      supported: false,
      name: 'it should not add classes to inline elements with too many {{}}',
      src: 'paragraph **bold**{{.red}} asdf',
      expected: '<p>paragraph <strong>bold</strong>{{.red}} asdf</p>'
    },
    {
      supported: true,
      name: 'it should only remove last {}',
      src: '{{.red}',
      expected: '<p class="red">{</p>'
    },
    {
      supported: true,
      name: 'it should add classes for list items',
      src: '- item 1{.red}\n- item 2',
      expected: '<ul>\n<li class="red">item 1</li>\n<li>item 2</li>\n</ul>'
    },
    {
      supported: false,
      name: 'it should add classes in nested lists',
      src: '- item 1{.a}\n  - nested item {.b}\n  {.c}\n    1. nested nested item {.d}\n    {.e}\n',
      // Adding class to top ul not supported
      //    src += '{.f}',
      //    expected = '<ul class="f">\n',
      expected:
        '<ul>\n<li class="a">item 1\n<ul class="c">\n<li class="b">nested item\n<ol class="e">\n<li class="d">nested nested item</li>\n</ol>\n</li>\n</ul>\n</li>\n</ul>'
    },
    {
      supported: false,
      name: 'it should work with nested inline elements',
      src: '- **bold *italics*{.blue}**{.green}',
      expected:
        '<ul>\n<li><strong class="green">bold <em class="blue">italics</em></strong></li>\n</ul>'
    },
    {
      supported: true,
      name: 'it should add class to inline code block',
      src: 'bla `click()`{.c}',
      expected: '<p>bla <code class="c">click()</code></p>'
    },
    {
      supported: false,
      name: 'it should not trim unrelated white space',
      src: '- **bold** text {.red}',
      expected: '<ul>\n<li class="red"><strong>bold</strong> text</li>\n</ul>'
    },
    {
      supported: false,
      name: 'it should not create empty attributes',
      src: 'text { .red }',
      expected: '<p class="red">text</p>'
    },
    {
      supported: false,
      name: 'it should add attributes to ul when below last bullet point',
      src: '- item1\n- item2\n{.red}',
      expected: '<ul class="red">\n<li>item1</li>\n<li>item2</li>\n</ul>'
    },
    {
      supported: false,
      name: 'it should add classes for both last list item and ul',
      src: '- item{.red}\n{.blue}',
      expected: '<ul class="blue">\n<li class="red">item</li>\n</ul>'
    },
    {
      supported: false,
      name: 'it should add class ul after a "softbreak"',
      src: '- item\n{.blue}',
      expected: '<ul class="blue">\n<li>item</li>\n</ul>'
    },
    {
      supported: false,
      name: 'it should ignore non-text "attr-like" text after a "softbreak"',
      src: '- item\n*{.blue}*',
      expected: '<ul>\n<li>item\n<em>{.blue}</em></li>\n</ul>'
    },
    {
      supported: false,
      name: 'it should work with ordered lists',
      src: '1. item\n{.blue}',
      expected: '<ol class="blue">\n<li>item</li>\n</ol>'
    },
    {
      supported: true,
      name: 'it should work with typography enabled',
      src: 'text{key="val with spaces"}',
      expected: '<p key="val with spaces">text</p>'
    },
    {
      supported: false,
      name: 'it should support code blocks',
      src: '```{.c a=1 #ii}\nfor i in range(10):\n```',
      expected:
        '<pre><code class="c" a="1" id="ii">for i in range(10):\n</code></pre>'
    },
    {
      supported: false,
      name: 'it should support code blocks with language defined',
      src: '```python {.c a=1 #ii}\nfor i in range(10):\n```',
      expected:
        '<pre><code class="c language-python" a="1" id="ii">for i in range(10):\n</code></pre>'
    },
    {
      supported: false,
      name: 'it should support blockquotes',
      src: '> quote\n{.c}',
      expected: '<blockquote class="c">\n<p>quote</p>\n</blockquote>'
    },
    {
      supported: true,
      name: 'it should support tables',
      src: '| h1 | h2 |\n| -- | -- |\n| c1 | c1 |\n\n{.c}',
      expected:
        '<table class="c">\n<thead>\n<tr>\n<th>h1</th>\n<th>h2</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>c1</td>\n<td>c1</td>\n</tr>\n</tbody>\n</table>'
    },
    {
      supported: false,
      name: 'it should support nested lists',
      src: `- item
  - nested
  {.red}

{.blue}
`,
      expected:
        '<ul class="blue">\n<li>item\n<ul class="red">\n<li>nested</li>\n</ul>\n</li>\n</ul>'
    },
    {
      supported: true,
      name: 'it should support images',
      src: '![alt](img.png){.a}',
      expected: '<p><img src="img.png" alt="alt" class="a"></p>'
    },
    {
      supported: true,
      name: 'it should not apply inside `code{.red}`',
      src: 'paragraph `code{.red}`',
      expected: '<p>paragraph <code>code{.red}</code></p>'
    },
    {
      supported: false,
      name: 'it should not apply inside item lists with trailing `code{.red}`',
      src: '- item with trailing `code = {.red}`',
      expected:
        '<ul>\n<li>item with trailing <code>code = {.red}</code></li>\n</ul>'
    },
    {
      supported: false,
      name: 'it should not apply inside item lists with trailing non-text, eg *{.red}*',
      src: '- item with trailing *{.red}*',
      expected: '<ul>\n<li>item with trailing <em>{.red}</em></li>\n</ul>'
    },
    {
      supported: true,
      name: 'it should work with multiple inline code blocks in same paragraph',
      src: 'bla `click()`{.c} blah `release()`{.cpp}',
      expected:
        '<p>bla <code class="c">click()</code> blah <code class="cpp">release()</code></p>'
    },
    {
      supported: false,
      name: 'it should support {} curlies with length == 3',
      src: 'text {1}',
      expected: '<p 1="">text</p>'
    },
    {
      supported: false,
      name: 'it should do nothing with empty classname {.}',
      src: 'text {.}',
      expected: '<p>text {.}</p>'
    },
    {
      supported: false,
      name: 'it should do nothing with empty id {#}',
      src: 'text {#}',
      expected: '<p>text {#}</p>'
    },
    {
      supported: false,
      name: 'it should support horizontal rules ---{#id}',
      src: '---{#id}',
      expected: '<hr id="id">'
    },
    {
      supported: false,
      name: 'it should restrict attributes by allowedAttributes',
      src: 'text {.someclass #someid attr=notAllowed}',
      expected: '<p class="someclass" id="someid">text</p>'
    },
    {
      supported: false,
      name: 'it should restrict attributes by allowedAttributes (regex)',
      src: 'text {.someclass #someid attr=allowed}',
      expected: '<p class="someclass" attr="allowed">text</p>'
    },
    {
      supported: false,
      name: 'it should support multiple classes for <hr>',
      src: '--- {.a .b}',
      expected: '<hr class="a b">'
    },
    {
      supported: false,
      name: 'it should not crash on {#ids} in front of list items',
      src: '- {#ids} [link](./link)',
      expected: '<ul>\n<li>{#ids} <a href="./link">link</a></li>\n</ul>'
    },
    {
      supported: false,
      name: 'it should support empty quoted attrs',
      src: '![](https://example.com/image.jpg){class="" height="100" width=""}',
      expected:
        '<p><img src="https://example.com/image.jpg" alt="" class="" height="100" width=""></p>'
    }
  ]

  const proc = remark()
    .use(remarkAttributes)
    .use(html)
    .use(gfm)
    .use(stringify)
    .freeze()

  st.plan(testcases.length)

  for (const {name, supported, src, expected} of testcases) {
    st.test(name, {todo: !supported}, (st) => {
      st.equal(String(proc.processSync(src)), expected)
      st.end()
    })
  }
})
