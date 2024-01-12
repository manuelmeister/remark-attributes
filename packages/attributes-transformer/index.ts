import {visit} from 'unist-util-visit'
import {Node, Parent} from 'unist'
import parseAttrs from 'md-attr-parser'

type AttrsNode = {
  type: 'attrs'
  value?: string
} & Node

export function attributesTransformer(root: any): void {
  visit(
    root,
    (node) => node.type === 'paragraph',
    (node, index, parent) => {
      if (node.children?.length === 1 && node.children[0].type === 'attrs') {
        const index = parent.children.indexOf(node)
        parent.children[index] = node.children[0]
      }
    }
  )

  visit(
    root,
    (node, index, parent) =>
      node.type === 'paragraph' && parent?.type === 'listItem',
    (node: Parent<Node | AttrsNode>, index, parent) => {
      const children = node.children

      const ids = Object.entries(children)
        .filter(([_, child]) => child.type === 'attrs')
        .map(([id, node]) => [parseInt(id), node] as [number, AttrsNode])

      if (!ids || ids.length === 0) return

      for (const [index, attrNode] of ids) {
        const sibling = node.children[index - 1]
        if (sibling?.type === 'text') {
          parent.data = {
            ...parent.data,
            hProperties: {
              ...parent.data?.hProperties,
              ...parseAttrs(attrNode.value).prop
            }
          }
          children.splice(index, 1)
        }
      }
    }
  )

  visit(
    root,
    (node, index, parent) => {
      return (
        parent &&
        parent.children?.length > 1 &&
        Boolean(parent.children.find((node) => node.type === 'attrs')) &&
        node.type === 'attrs'
      )
    },
    (node: AttrsNode, index, parent) => {
      if (index !== undefined) {
        const sibling = parent.children[index - 1]
        if (!sibling || sibling.type === 'text') {
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
