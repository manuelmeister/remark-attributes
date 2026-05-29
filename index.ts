import type {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown'
import {micromarkAttributes} from './packages/micromark-attributes/index.js'
import {mdastAttributes} from './packages/mdast-attributes/index.js'
import {attributesTransformer} from './packages/attributes-transformer/index.js'
import {AttributesExtension} from './util/types.js'

export interface RemarkAttributesOptions {
  mdx?: boolean
}

interface AttributesData {
  micromarkExtensions?: AttributesExtension[]
  fromMarkdownExtensions?: FromMarkdownExtension[]
}

/**
 * Plugin to support attributes like markdown-it-attrs
 * [text](https://test.com){target=_blank}
 */
function remarkAttributes(this: any, options: RemarkAttributesOptions = {}) {
  const settings = {mdx: false, ...options}
  const data = this.data() as AttributesData

  function add<K extends keyof AttributesData>(
    key: K,
    value: AttributesData[K][0]
  ) {
    data[key] ||= []
    data[key].unshift(value)
  }

  add('micromarkExtensions', micromarkAttributes({escaped: settings.mdx}))
  add('fromMarkdownExtensions', mdastAttributes())

  return attributesTransformer
}

export default remarkAttributes as any
