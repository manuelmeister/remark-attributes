import type {Plugin} from 'unified'

export interface RemarkAttributesOptions {
  mdx?: boolean | undefined
}

declare const remarkAttributes: Plugin<[RemarkAttributesOptions?]>

export default remarkAttributes
