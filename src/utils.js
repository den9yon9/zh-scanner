const { createHash } = require("crypto");
const encrypt = (algorithm, content) => {
  const hash = createHash(algorithm);
  hash.update(content);
  return hash.digest("hex");
};

const md5 = (content) => encrypt("md5", content);

const isHans = (str) => /\p{Unified_Ideograph}/u.test(str);

module.exports = { md5, isHans };
