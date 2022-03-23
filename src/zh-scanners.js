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
                if (isHans(value)) return;
                const notHans = value;
                const md5Key = md5(notHans.trim()).substr(0, 6);
                if (!locale[md5Key]) locale[md5Key] = path.node.value.trim();
              },
              "StringLiteral|JSXText"(path) {
                if (path.parent.type === "TSLiteralType") return;
                if (!path.node.value.trim()) return;
                const md5Key = md5(path.node.value.trim()).substr(0, 6);
                if (!locale[md5Key]) locale[md5Key] = path.node.value.trim();
              },
            });
          }
        },
      });
    })
  );

  return locale;
};
