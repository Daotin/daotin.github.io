module.exports = {
  // 超过多少字符后换行
  printWidth: 120,
  // 使用tab缩进还是空格
  useTabs: true,
  // 缩进
  tabWidth: 2,
  // 行末分号
  semi: false,
  // 单引号
  singleQuote: true,
  // 是否使用尾逗号
  trailingComma: "all", // 对象或数组末尾加逗号
  // > 标签放在最后一行的末尾，而不是单独放在下一行
  jsxBracketSameLine: false,
  // (x) => {} 箭头函数参数只有一个时是否要有小括号。 alwaysz:总是带括号，avoid：省略括号
  arrowParens: "avoid",
  // 仅在需要时为对象的键添加引号，如果至少一个键需要引号，则所有键都用引号
  quoteProps: "consistent",
  // 在对象的大括号内添加空格
  bracketSpacing: true,
  // 将多行元素的结束标签放在最后一行的末尾，而不是单独占一行
  bracketSameLine: true,
  // 保持文本换行符的处理方式不变
  proseWrap: "preserve",
  //html存在空格是不敏感的
  htmlWhitespaceSensitivity: "ignore",
  // 在Vue文件中的<script>和<style>标签内缩进代码
  vueIndentScriptAndStyle: false,
  // 自动检测并使用文件中已有的行尾样式，作为行结束符
  endOfLine: "auto",
  // 自动格式化嵌入的代码块
  embeddedLanguageFormatting: "auto",
  // 每行单个HTML属性
  singleAttributePerLine: false,
};
