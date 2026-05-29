import type {Root} from 'mdast'
import type {Plugin} from 'unified'

export interface RemarkAttributesOptions {
  mdx?: boolean | undefined
}

declare const remarkAttributes: Plugin<[RemarkAttributesOptions?], Root>

export default remarkAttributes
