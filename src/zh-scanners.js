const { readFile } = require("fs/promises");
const { glob } = require("glob");
const { promisify } = require("util");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { md5, isHans } = require("./utils.js");

/**
 *
 * @param {glob} files
 * @returns 汉字json
 */

module.exports = async function zhScanners(files) {
  const fileArr = await promisify(glob)(files);
  const filePaths = fileArr.filter((item) => !/node_modules/.test(item));
  let locale = {};

  await Promise.all(
    filePaths.map(async (filePath) => {
      let code = await readFile(filePath, { encoding: "utf-8" });
      let ast = parse(code, {
        sourceType: "unambiguous",
        plugins: ["jsx", "typescript"],
      });

      traverse(ast, {
        enter(path) {
          if (path.type === "Program") {
            const ifSkip = path.node.directives.map((item) => item.value.value).includes("skip scanner");
            if (ifSkip) return;
            path.traverse({
              TemplateLiteral(path) {
                if (path.node.expressions.length !== 0) return;
                const [{ value }] = path.node.quasis;
                const { raw, cooked } = value;
                if (isHans(cooked)) return;
                const notHans = cooked.trim();
                const md5Key = md5(notHans).substr(0, 6);
                if (!locale[md5Key]) locale[md5Key] = notHans;
              },
              "StringLiteral|JSXText"(path) {
                if (path.parent.type === "TSLiteralType") return;
                if (!isHans(path.node.value)) return;
                const hans = path.node.value.trim();
                if (!hans) return;
                const md5Key = md5(hans).substr(0, 6);
                if (!locale[md5Key]) locale[md5Key] = hans;
              },
            });
          }
        },
      });
    })
  );

  return locale;
};
