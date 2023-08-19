import type {Root} from 'mdast'
import type {Processor, Transformer} from 'unified'
import {
  micromarkAttributes,
  mdastAttributes,
  attributesTransformer
} from './packages/index.ts'

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
