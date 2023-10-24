import type {Root} from 'mdast'
import type {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown'
import type {Processor, Transformer} from 'unified'
import {micromarkAttributes} from './packages/micromark-attributes/index.js'
import {mdastAttributes} from './packages/mdast-attributes/index.js'
import {attributesTransformer} from './packages/attributes-transformer/index.js'
import {AttributesExtension} from './util/types.js'

interface AttributesData {
  micromarkExtensions?: AttributesExtension[]
  fromMarkdownExtensions?: FromMarkdownExtension[]
}

/**
 * Plugin to support attributes like markdown-it-attrs
 * [text](https://test.com){target=_blank}
 */
export default function remarkAttributes(
  this: Processor<Root, Root, Root, string>,
  options = {mdx: false}
): Transformer<Root> {
  const data = this.data() as AttributesData

  function add<K extends keyof AttributesData>(
    key: K,
    value: AttributesData[K][0]
  ) {
    data[key] ||= []
    data[key].unshift(value)
  }

  add('micromarkExtensions', micromarkAttributes({escaped: options.mdx}))
  add('fromMarkdownExtensions', mdastAttributes())

  return attributesTransformer
}
