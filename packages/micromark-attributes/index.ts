import {AttributesExtension} from '../../util/types.js'
import {codes} from 'micromark-util-symbol/codes.js'
import {Code, State} from 'micromark-util-types'

export function micromarkAttributes(
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
                tokenize(effects, startOk, startNok) {
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
                          tokenize(effects, diveOk, diveNok) {
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
                    }

                    if (code === codes.leftCurlyBrace) {
                      effects.enter('attributes')
                      effects.consume(code)
                      effects.enter('attrs')
                      effects.enter('chunkString', {contentType: 'string'})
                      return inside
                    }

                    if (code !== null) {
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
                    }

                    if (code === codes.backslash) {
                      return effects.attempt(
                        {
                          tokenize(effects, insideOk, insideNok) {
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
                              }

                              if (code === codes.backslash) {
                                effects.consume(code)
                                return insideNok(code)
                              }

                              if (code !== null) {
                                effects.consume(code)
                                return insideNok(code)
                              }

                              throw new Error(
                                `No closing attribute brace found`
                              )
                            }
                          }
                        },
                        startOk,
                        continueFurtherInside
                      )(code)
                    }

                    if (code !== null) {
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
