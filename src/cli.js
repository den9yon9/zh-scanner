#!/usr/bin/env node
const colors = require('picocolors')
const path = require('path');

const minimist = require("minimist");
const stringify = require("json-stable-stringify");
const zhScanners = require("./zh-scanners.js");
const { writeFileSync } = require("fs");

const { files, out } = minimist(process.argv.slice(2));

(async () => {
  const result = await zhScanners(files)
  Object.values(result).forEach(item => console.log(colors.yellow(item)))
  writeFileSync(out, stringify(result, { space: 2 }) + '\n');
  let storePath = path.resolve('.', out)
  console.log('\n' + colors.green(`扫描完成! 共扫描到${Object.keys(result).length}条记录`))
  console.log('\n' + colors.green(`结果已存入${storePath}`) + '\n')
})();
