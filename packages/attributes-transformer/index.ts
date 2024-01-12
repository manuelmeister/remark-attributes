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
      ['paragraph'].includes(node.type) && parent?.type === 'listItem',
    (node: Parent<Node | AttrsNode>, index, parent) => {
      const children = node.children

      const ids = children.filter(
        (child: {type: string}): child is AttrsNode => child.type === 'attrs'
      )

      if (!ids || ids.length === 0) return

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
        if (sibling.type === 'text') {
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
