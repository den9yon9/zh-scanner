# zh-scanner

## 扫描 js,ts,tsx,jsx 代码中的汉字, 并提取到指定文件

### useage

1.安装

```bash
$ npm i zh-scanner --save-dev
```

2.配置 npm 脚本

--files 参数指定你要扫描的目录, 支持 glob 匹配, --out 参数指定扫描结果要存放的位置

```json
{
  "scripts": {
    "scanner": "scanner --files '**/*.{tsx,ts,jsx,js}' --out ./zh-CN.json"
  }
}
```

3.扫描汉字,执行

```bash
$ npm run scanner
```

即可将--files 参数指定范围中的汉字提取出来, 存储到--out 参数指定的文件中

扫描出的汉字以 json 的形式存储, json key 为扫描出的汉字语句的 md5 值的前 6 位, json value 为扫描出的汉字

### 配合 babel 插件 babel-plugin-zh-replacer 做多语言自动替换

1.将提取出的 zh-CN.json 上传到翻译网站, 如 crowdin, 翻译完成后, 下载对应的各语言 json, 并重新命名如: en.json, ar.json, jp.json

2.获取用户语言后引入对应语言的 json 并挂载到 window 对象上, 参考代码:

```javascript
import(`someDir/${lan}.json`).then((data) => {
  window.locale = data;
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

Q. 想排除某一句话
A. 使用模板字符串, 模板字符串不会被扫描

Q. 字符串里夹杂变量怎么处理
A. 可以这样处理:

```jsx
<div>{"xx位好友向你发送了xx条消息".replace("xx", "2").replace("xx", "100")}</div>
```
