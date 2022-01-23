const { isHans, md5 } = require("./utils.js");

/** 替换源码中的汉字 */
module.exports = function babelPluginHansReplacer({ types: t, template }) {
  return {
    visitor: {
      Program(path) {
        const ifSkip = path.node.directives.map((item) => item.value.value).includes("skip scanner");
        if (ifSkip) return;
        path.traverse({
          "StringLiteral|JSXText"(path) {
            if (path.parent.type === "TSLiteralType") return;
            if (!isHans(path.node.value)) return;
            const md5Key = md5(path.node.value.trim()).substr(0, 6);
            const hans = path.node.value;
            const build = template("window.locale?.[%%md5Key%%]||%%hans%%");
            const ast = build({
              md5Key: t.stringLiteral(md5Key),
              hans: t.templateLiteral([t.templateElement({ raw: hans, cooked: hans }, true)], []),
            });
            if (path.parent.type === "JSXAttribute") path.replaceWith(t.JSXExpressionContainer(ast.expression));
            else path.replaceWith(ast.expression);
          },
        });
      },
    },
  };
};
