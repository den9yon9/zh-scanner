// eslint-disable-next-line @typescript-eslint/no-var-requires
const { isHans, md5 } = require('./utils.cjs')

/** 替换源码中的汉字 */
module.exports = function babelPluginHansReplacer({ types: t, template }) {
  return {
    visitor: {
      Program(path) {
        const ifSkip = path.node.directives
          .map((item) => item.value.value)
          .includes('skip scanner')
        if (ifSkip) return
        path.traverse({
          TemplateLiteral(path) {
            if (path.node.expressions.length !== 0) return
            const [{ value }] = path.node.quasis
            const { raw, cooked } = value
            if (isHans(cooked)) return
            const notHans = cooked
            const md5Key = md5(notHans.trim()).substr(0, 6)
            const build = template('window.locale?.[%%md5Key%%]||%%notHans%%')
            const ast = build({
              md5Key: t.stringLiteral(md5Key),
              notHans: t.stringLiteral(notHans)
            })
            path.replaceWith(ast.expression)
          },
          'StringLiteral|JSXText'(path) {
            if (path.parent.type === 'TSLiteralType') return
            if (!isHans(path.node.value)) return
            const md5Key = md5(path.node.value.trim()).substr(0, 6)
            const hans = path.node.value
            const build = template('window.locale?.[%%md5Key%%]||%%hans%%')
            const ast = build({
              md5Key: t.stringLiteral(md5Key),
              hans: t.templateLiteral(
                [t.templateElement({ raw: hans, cooked: hans }, true)],
                []
              )
            })
            if (path.parent.type === 'JSXAttribute' || path.parent.type === 'JSXElement')
              path.replaceWith(t.JSXExpressionContainer(ast.expression))
            else path.replaceWith(ast.expression)
          }
        })
      }
    }
  }
}
