import type {
  Construct,
  Effects,
  Extension,
  State,
  Token,
  TokenizeContext,
  TokenType
} from 'micromark-util-types'

export type AttributesTokenType = TokenType | 'attributes' | 'attrs'

/**
 * Open a token.
 *
 * @param type
 *   Token type.
 * @param fields
 *   Extra fields.
 * @returns
 *   Token.
 */
export type AttributesEnter = (
  type: AttributesTokenType,
  fields?: Omit<Partial<Token>, 'type'> | undefined
) => Token

/**
 * Close a token.
 *
 * @param type
 *   Token type.
 * @returns
 *   Token.
 */
export type AttributesExit = (type: AttributesTokenType) => Token

/**
 * Attempt deals with several values, and tries to parse according to those
 * values.
 *
 * If a value resulted in `ok`, it worked, the tokens that were made are used,
 * and `ok` is switched to.
 * If the result is `nok`, the attempt failed, so we revert to the original
 * state, and `nok` is used.
 *
 * @param construct
 *   Construct(s) to try.
 * @param ok
 *   State to move to when successful.
 * @param nok
 *   State to move to when unsuccessful.
 * @returns
 *   Next state.
 */
export type AttributesAttempt = (
  construct:
    | AttributesConstruct[]
    | AttributesConstruct
    | AttributesConstructRecord,
  ok: State,
  nok?: State | undefined
) => State

export type AttributeEffects = {
  /**
   * Start a new token.
   */
  enter: AttributesEnter

  /**
   * End a started token.
   */
  exit: AttributesExit

  /**
   * Try to tokenize a construct.
   */
  attempt: AttributesAttempt
} & Effects

/**
 * A tokenize function sets up a state machine to handle character codes streaming in.
 *
 * @param this
 *   Tokenize context.
 * @param effects
 *   Effects.
 * @param ok
 *   State to go to when successful.
 * @param nok
 *   State to go to when unsuccessful.
 * @returns
 *   First state.
 */
export type AttributesTokenizer = (
  this: TokenizeContext,
  effects: AttributeEffects,
  ok: State,
  nok: State
) => State

export type AttributesExtension = {
  text?: AttributesConstructRecord
} & Omit<Extension, 'text'>

/**
 * Several constructs, mapped from their initial codes.
 */
export type AttributesConstructRecord = Record<
  string,
  AttributesConstruct[] | AttributesConstruct | undefined
>

export type AttributesConstruct = {
  tokenize?: AttributesTokenizer
} & Omit<Construct, 'tokenize'>
