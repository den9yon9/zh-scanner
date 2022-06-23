# zh-scanner

## 扫描 js(x),ts(x) 代码中的汉字到指定文件

### usage

1.安装

```bash
$ npm i zh-scanner --save-dev
```

2.配置 npm 脚本

--files 选项指定你要扫描的目录, 支持 glob 匹配, --out 选项指定扫描结果要存放的位置

```json
{
  "scripts": {
    "scanner": "zh-scanner --files '**/*.{tsx,ts,jsx,js}' --out ./zh-CN.json"
  }
}
```

3.执行

```bash
# 扫描出的汉字以 json 的形式存储, json key 为扫描出的汉字语句的 md5 值的前 6 位, json value 为扫描出的汉字
$ npm run scanner
```


### 配合附带的babel插件 babel-plugin-zh-replacer 做多语言自动替换

1.将提取出的 zh-CN.json 上传到翻译网站, 如 crowdin, 翻译完成后, 下载对应的各语言 json, 并根据语言重命名如: en.json, ar.json, jp.json

2.根据用户语言后引入对应语言的 json 并挂载到 window 对象上, 参考代码:

```javascript
import(`someDir/${lan}.json`).then((module) => {
  window.locale = module.default;
});
```

3.将 babel-plugin-zh-replacer 插件添加到项目的 babel 配置文件中, 如

```javascript
// babel.config.js
const { babelPluginZhReplacer } = require("@den9yon9/zh-scanner");

module.export = {
  plugins: [babelPluginZhReplacer],
};
```

### Q&A

Q. 某个文件想排除掉不被扫描怎么办?

A. 在文件起始位置添加字符串指令 "skip scanner", 即可跳过这个文件

Q. 我想排除某一句汉语, 使其不被扫描和翻译要怎样处理?

A. 使用模板字符串, 模板字符串中的汉语不会被扫描和翻译

Q. 我想扫描并翻译某一句非汉语, 要怎样处理?

A. 使用模板字符串, 模板字符串中非汉语会被扫描并翻译

Q. 为什么含有表达式的模板字符串没有被处理?

A. 含有表达式的模板字符串无法扫描出完整的文案语义, 所以无法处理, 你可以这样:

```javascript
"xx位好友向你发送了xx条消息".replace("xx", "2").replace("xx", "100")
```
