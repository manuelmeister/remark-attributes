import type {Root} from 'mdast'
import type {Pluggable, Plugin} from 'unified'
import remarkAttributes, {RemarkAttributesOptions} from 'remark-attributes'

const plugin: Plugin<[RemarkAttributesOptions?], Root> = remarkAttributes
const pluggable: Pluggable = remarkAttributes

void plugin
void pluggable
