import type {Root} from 'mdast'
import type {Processor, Transformer} from 'unified'
import {micromarkAttributes} from './packages/micromark-attributes/index.js'
import {mdastAttributes} from './packages/mdast-attributes/index.js'
import {attributesTransformer} from './packages/attributes-transformer/index.js'

/**
 * Plugin to support attributes like markdown-it-attrs
 * [text](https://test.com){target=_blank}
 */
export default function remarkAttributes(
  this: Processor,
  options = {mdx: false}
): Transformer<Root> {
  const data: Record<string, unknown> = this.data()

  /**
   * @param {string} key
   * @param {unknown} value
   */
  function add(key: string, value: unknown) {
    const list = (data[key] || (data[key] = [])) as unknown[]
    list.unshift(value)
  }

  add('micromarkExtensions', micromarkAttributes({escaped: options.mdx}))
  add('fromMarkdownExtensions', mdastAttributes())

  return attributesTransformer
}
