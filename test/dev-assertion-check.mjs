// Renders `{...}` attribute blocks through the built plugin with micromark's
// dev-build assertions enabled. Run via `node --conditions=development`, which
// selects micromark's `dev/` builds (the ones that assert token invariants).
//
// remark-attributes used to emit an unbalanced token stream for attribute
// blocks — it `consume`d before `nok` on the terminator path, and closed the
// `}` without a matching open — which tripped the assertion
// `expected last token to be open` (see issue #10). micromark strips these
// assertions from its production build, so the malformed stream is silently
// accepted there and this is only observable under the `development` condition.
//
// Exits 0 if every case renders; exits non-zero (letting the assertion surface)
// on regression.
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkAttributes from '../dist/index.js'

const cases = [
  {input: '# Heading {#id}', includes: 'id="id"'},
  {input: 'some text{.green}', includes: 'class="green"'},
  {input: '[link](/x){.btn target=_blank}', includes: 'class="btn"'}
]

const processor = unified()
  .use(remarkParse)
  .use(remarkAttributes)
  .use(remarkRehype)
  .use(rehypeStringify)

for (const {input, includes} of cases) {
  const output = String(await processor.process(input))
  if (!output.includes(includes)) {
    process.stderr.write(
      `unexpected output for ${JSON.stringify(input)}: ${output}\n`
    )
    process.exit(2)
  }
}

process.stdout.write('ok')
