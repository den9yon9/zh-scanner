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
  console.log('\n' + colors.bgBlue(colors.white(`扫描完成! 共扫描到${Object.keys(result).length}条汉语词句`)))
  if (!out) return console.log(result);
  writeFileSync(out, stringify(result, { space: 2 }));
  let storePath = path.resolve('.', out)
  console.log(colors.bgBlue(colors.white(`结果已存入${storePath}`)) + '\n')
})();
