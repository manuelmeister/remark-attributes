// md-attr-parser 1.3.0

export interface Properties {
  id: string
  class: string[]
  [K: string]: string | string[]
}

export interface ParseResult {
  prop: Properties
  eaten: string
}

export interface Config {
  defaultValue?: () => string
}

export default function parse(
  value: string,
  indexNext?: number,
  config?: Config
): ParseResult
