import type {Pluggable, Plugin} from 'unified'
import remarkAttributes, {RemarkAttributesOptions} from 'remark-attributes'

const plugin: Plugin<[RemarkAttributesOptions?]> = remarkAttributes
const pluggable: Pluggable = remarkAttributes

void plugin
void pluggable
