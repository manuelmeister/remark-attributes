import type {FromMarkdownExtension} from 'mdast-util-directive/lib/index.js'

/**
 * Fully-configured extension to add Heading ID nodes to Markdown.
 **/
export function mdastAttributes(): FromMarkdownExtension {
  return {
    enter: {
      attrs(token) {
        // @ts-expect-error Assume `token` is a `Token`.
        this.enter({type: 'attrs', value: null}, token)
        this.buffer()
      }
    },
    exit: {
      attrs(token) {
        const attrs = this.resume()
        const node = this.exit(token)
        // @ts-expect-error Assume `node` is a `AttrsNode`.
        node.value = attrs
      }
    }
  }
}
