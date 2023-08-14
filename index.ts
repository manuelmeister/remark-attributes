import type {Plugin} from 'unified'
import type {Root} from 'mdast'
import type {Code, State} from 'micromark-util-types'
import type {Node, Parent} from 'unist'
import type {FromMarkdownExtension} from 'mdast-util-directive/lib'
import type {AttributesExtension} from './util/types'

import {visit} from 'unist-util-visit'
import {codes} from 'micromark-util-symbol/codes.js'
// @ts-ignore
import parseAttrs from 'md-attr-parser'

export function micromarkAttrs(
  options = {escaped: false}
): AttributesExtension {
  const syntaxExtensionEscaped: AttributesExtension = {
    text: {
      [codes.backslash]: {
        name: 'attributesEscapedMaybeStart',
        tokenize(effects, ok, stop) {
          return start

          function start(code: Code) {
            return effects.attempt(
              {
                tokenize: function (effects, startOk, startNok) {
                  return attemptStart

                  function attemptStart(code: Code) {
                    if (code !== null) {
                      effects.consume(code)
                      return dive
                    }
                  }

                  function dive(code: Code) {
                    if (code === codes.backslash) {
                      effects.consume(code)
                      effects.enter('chunkString', {contentType: 'string'})
                      return effects.attempt(
                        {
                          tokenize: (effects, diveOk, diveNok) => {
                            return escapedBraces

                            function escapedBraces(code: Code) {
                              if (code === codes.backslash) {
                                effects.consume(code)
                                return braces
                              }
                              return diveNok(code)
                            }

                            function braces(code: Code) {
                              if (
                                code === codes.leftCurlyBrace ||
                                code === codes.rightCurlyBrace
                              ) {
                                effects.consume(code)
                                effects.exit('chunkString')
                                return diveOk(code)
                              }
                              return diveNok(code)
                            }
                          }
                        },
                        startOk,
                        dive
                      )
                    } else if (code === codes.leftCurlyBrace) {
                      effects.enter('attributes')
                      effects.consume(code)
                      effects.enter('attrs')
                      effects.enter('chunkString', {contentType: 'string'})
                      return inside
                    } else if (code !== null) {
                      return startNok
                    }
                  }

                  function continueFurtherInside(code: Code) {
                    effects.consume(code)
                    return inside
                  }

                  function inside(code: Code) {
                    if (
                      [
                        codes.carriageReturn,
                        codes.lineFeed,
                        codes.carriageReturnLineFeed
                      ].includes(code as any)
                    ) {
                      effects.consume(code)
                      return startNok(code)
                    } else if (code === codes.backslash) {
                      return effects.attempt(
                        {
                          tokenize: (effects, insideOk, insideNok) => {
                            return attemptBackslash

                            function attemptBackslash(code: Code) {
                              if (code === codes.backslash) {
                                effects.exit('chunkString')
                                effects.exit('attrs')
                                effects.consume(code)
                                return endBrace
                              }
                            }

                            function endBrace(code: Code) {
                              if (code === codes.rightCurlyBrace) {
                                effects.consume(code)
                                effects.exit('attributes')
                                return insideOk(code)
                              } else if (code === codes.backslash) {
                                effects.consume(code)
                                return insideNok(code)
                              } else if (code !== null) {
                                effects.consume(code)
                                return insideNok(code)
                              } else {
                                throw new Error(
                                  `No closing attribute brace found`
                                )
                              }
                            }
                          }
                        },
                        startOk,
                        continueFurtherInside
                      )(code)
                    } else if (code !== null) {
                      effects.consume(code)
                      return inside
                    }
                  }
                }
              },
              ok,
              stop
            )(code)
          }
        }
      }
    }
  }
  const syntaxExtension: AttributesExtension = {
    text: {
      [codes.leftCurlyBrace]: {
        name: 'attributesMaybeStart',
        tokenize(effects, ok, nok) {
          return start

          function start(code: Code) {
            return effects.attempt(
              {
                tokenize(effects, ok: State, nok: State) {
                  return attemptStart

                  function attemptStart(code: Code) {
                    if (code !== null) {
                      effects.enter('attributes')
                      effects.consume(code)
                      effects.enter('attrs')
                      effects.enter('chunkString', {contentType: 'string'})
                      return inside
                    }
                  }

                  function inside(code: Code) {
                    if (code !== null) {
                      if (
                        [
                          codes.carriageReturn,
                          codes.lineFeed,
                          codes.carriageReturnLineFeed,
                          null,
                          codes.backslash,
                          codes.leftCurlyBrace
                        ].includes(code as any)
                      ) {
                        effects.consume(code)
                        return nok(code)
                      }
                      if (code === codes.rightCurlyBrace) {
                        effects.exit('chunkString')
                        effects.exit('attrs')
                        effects.consume(code)
                        effects.exit('attributes')
                        return ok(code)
                      }
                      effects.consume(code)
                      return inside
                    }
                    return nok(code)
                  }
                }
              },
              ok,
              nok
            )(code)
          }
        },
        previous: (code: Code) => code !== codes.backslash
      }
    }
  }
  return options.escaped ? syntaxExtensionEscaped : syntaxExtension
}

/**
 * Fully-configured extension to add Heading ID nodes to Markdown.
 **/
export function mdastAttrs(): FromMarkdownExtension {
  return {
    enter: {
      attrs(token) {
        // @ts-ignore
        this.enter({type: 'attrs', value: null}, token)
        this.buffer()
      }
    },
    exit: {
      attrs(token) {
        const attrs = this.resume()
        const node = this.exit(token)
        // @ts-ignore
        node.value = attrs
      }
    }
  }
}

interface AttrsNode extends Node {
  value?: string
}

/**
 * Plugin to support attributes like markdown-it-attrs
 * [text](https://test.com){target=_blank}
 */
export default function remarkAttributes(
  options = {mdx: false}
): Plugin<void[], Root> {
  return function () {
    const data: Record<string, unknown> = this.data()

    /**
     * @param {string} key
     * @param {unknown} value
     */
    function add(key: string, value: unknown) {
      const list = (data[key] || (data[key] = [])) as unknown[]
      list.unshift(value)
    }

    add('micromarkExtensions', micromarkAttrs({escaped: options.mdx}))
    add('fromMarkdownExtensions', mdastAttrs())

    return (node: any) => {
      visit(
        node,
        (node) => node.type == 'paragraph',
        (node, index, parent) => {
          if (node.children?.length == 1 && node.children[0].type == 'attrs') {
            const index = parent.children.indexOf(node)
            parent.children[index] = node.children[0]
          }
        }
      )

      visit(
        node,
        (node, index, parent) =>
          ['paragraph'].includes(node.type) && parent?.type == 'listItem',
        (node: Parent<AttrsNode>, index, parent) => {
          const children = node.children

          const ids = children.filter(
            (child: {type: string}) => child.type === 'attrs'
          )

          if (!ids || ids.length == 0) return

          const attrNode = ids[0]
          parent.data = {
            ...parent.data,
            hProperties: {
              ...parent.data?.hProperties,
              ...parseAttrs(attrNode.value).prop
            }
          }
          const nodeIndex = children.indexOf(attrNode)
          children.splice(nodeIndex, 1)
        }
      )

      visit(
        node,
        (node, index, parent) => {
          return (
            parent &&
            parent.children?.length > 1 &&
            !!parent.children.find((node) => node.type === 'attrs') &&
            node.type == 'attrs'
          )
        },
        (node: AttrsNode, index, parent) => {
          if (index !== undefined) {
            const sibling = parent.children[index - 1]
            if (sibling.type == 'text') {
              parent.data = {
                ...parent.data,
                hProperties: {
                  ...parent.data?.hProperties,
                  ...parseAttrs(node.value).prop
                }
              }
            } else {
              sibling.data = {
                ...sibling.data,
                hProperties: {
                  ...sibling.data?.hProperties,
                  ...parseAttrs(node.value).prop
                }
              }
            }
          }
          parent.children.splice(index, 1)
        }
      )
    }
  }
}
