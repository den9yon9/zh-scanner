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
  const filePaths = fileArr.filter(item => !/node_modules/.test(item)) 
  let locale = {};

  await Promise.all(
    filePaths.map(async (filePath) => {
      let code = await readFile(filePath, { encoding: "utf-8" });
      let ast = parse(code, {
        sourceType: "unambiguous",
        plugins: ["jsx", "typescript"],
      });
      let comments = ast.comments;

      traverse(ast, {
        enter(path) {
          if (path.type === "Program") {
            const ifSkip = path.node.directives
              .map((item) => item.value.value)
              .includes("skip scanner");
            if (ifSkip) return;
            path.traverse({
              "StringLiteral|JSXText"(path) {
                const line = path.node.loc.start.line;
                let ifSkip = comments.find(
                  (item) =>
                    item.loc.start.line === line - 1 &&
                    item.value.includes("skip scanner")
                );
                if (ifSkip) return;
                if (path.parent.type === "TSLiteralType") return;
                if (!isHans(path.node.value)) return;
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
