---
layout: mypost
title: vue组件编写文档如何一份代码既显示UI样式，又显示文件源代码？
tags: vue
---

1. 目录
{:toc}


## 前言

在编写组件文档的时候，需要在一个页面同时展示组件的UI样式和编写组件的源代码。

最简单的做法是写两份代码，一份展示UI，一份展示源代码，但是这样维护起来很麻烦，每次改动都要修改两份代码。

<!--more-->


## 问题描述

有没有好方法可以在只写一份代码的情况下实现上述功能呢？

有当然是有，不过踩了一些坑。

## 问题分析

最开始我想的是通过js获取UI展示部分的代码，然后通过js创建元素，添加到文件末尾。

但是这有一个问题是，只能获取到html元素，对于script的部分不能显示，也就对整个组件的使用方法不是很清晰。

于是我就换个思路，获取整个vue文件的源代码，然后显示。

这个思路是可行的，唯一的问题是如何获取整个vue文件的源码。

## 解决方案

通过 Google 找到了一个解决方案：**通过使用 ajax 来获取本地vue文件。**

具体代码如下，详细步骤见注释：

```js
function getCode(fileName) {
    let src = `/source/app/docs/${fileName}.vue`;
    /**
     * <div class="docs-code"></div> 就是展示代码的区域
     * 至于为什么加<pre><code></code></pre>? 
     * 1、是因为高亮显示使用了 highlight.js插件，这个插件要求<pre><code></code></pre> 之前的代码才会被高亮。
     * 2、并且因为有了pre标签，所以代码中的空格换行等格式才得以保留。
     */
    let docsCode = $('<div class="docs-code"><pre><code></code></pre></div>');

    // 创建一个新的xhr对象
    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', src);
    // 指定返回的数据为纯文本格式
    xhr.responseType = 'text'; // 如果不兼容，可采用 xhr.overrideMimeType('text/plain;charset=utf-8'); 
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // 将获取的vue文件源码插入到code标签中
            docsCode.find('code').text(xhr.responseText);
            // 将代码插入到vue文件尾部
            docsCode.appendTo($('.' + fileName));
            // 代码高亮显示函数
            Vue.prototype.$highlight();
        } else {
            docsCode.find('code').text('获取文件源代码失败。');
        }
    };
}

```
如此，我的一份代码即可显示组件UI，亦可显示组件源代码本身。


我把代码高亮和获取封装成vue插件的形式，在每个vue组件中的mounted调用即可：

```js
import Vue from 'vue';
import Hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

let Highlight = {};
Highlight.install = function (Vue, options) {
    Vue.prototype.$highlight = () => {
        $('pre code').each(function (i, element) {
            // element.innerHTML = element.innerHTML.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
            Hljs.highlightBlock(element);
        });
    };

    // 获取docs-button.vue源代码
    Vue.prototype.$getCode = (name) => {
        let src = `/source/app/docs/${name}.vue`;
        // 有了pre可以显示源代码中的空格和换行
        let docsCode = $('<div class="docs-code"><pre><code></code></pre></div>');

        // 创建一个新的xhr对象
        let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.open('GET', src);
        xhr.responseType = 'text';
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                docsCode.find('code').text(xhr.responseText);
                docsCode.appendTo($('.' + name));
                // 代码高亮显示
                Vue.prototype.$highlight();
            } else {
                docsCode.find('code').text('获取文件源代码失败。');
            }
        };
    };
};
export default Highlight;

```


示例如下图：
![image](https://user-images.githubusercontent.com/23518990/72592219-12d5a100-393d-11ea-9f95-91551c60b232.png)

## 参考链接

- https://blog.csdn.net/SilenceJude/article/details/97002176



---

## 现在有新的实现方式，使用mdx。

在 `Vite + Vue` 项目中集成 `MDX`（Markdown + JSX 语法扩展）可以通过 `@mdx-js/vue` 进行支持。以下是一个完整的集成示例。

---

### **步骤 1：安装依赖**
在你的 Vite + Vue 项目中安装 `MDX` 相关依赖：
```sh
npm install @mdx-js/vue @mdx-js/loader
```

---

### **步骤 2：配置 Vite 解析 MDX**
在 `vite.config.js`（或 `vite.config.ts`）中添加 MDX 支持：
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mdx from '@mdx-js/rollup'

export default defineConfig({
  plugins: [
    vue(),
    mdx() // 让 Vite 识别 .mdx 文件
  ],
  resolve: {
    extensions: ['.vue', '.mdx']
  }
})
```

---

### **步骤 3：创建 MDX 组件**
在 `src/components` 目录下创建一个 `.mdx` 文件，例如 `Example.mdx`：
```mdx
# Hello MDX in Vue

这是一个 MDX 组件的示例。

<button @click="count++">点击增加：{count}</button>

export const count = ref(0);
```
---

### **步骤 4：在 Vue 组件中使用 MDX**
在 `App.vue` 或其他 Vue 组件中引入 MDX 组件：
```vue
<script setup>
import Example from './components/Example.mdx'
</script>

<template>
  <div>
    <h1>Vite + Vue3 + MDX 示例</h1>
    <Example />
  </div>
</template>
```
---

### **可选：使用 Vue 组件**
你可以在 `MDX` 文件中直接使用 Vue 组件，例如：
```mdx
import MyButton from './MyButton.vue';

<MyButton>点击我</MyButton>
```

并确保 `MyButton.vue` 存在：
```vue
<template>
  <button class="btn">
    <slot />
  </button>
</template>

<style>
.btn {
  padding: 8px 16px;
  background: blue;
  color: white;
  border-radius: 4px;
}
</style>
```

---

### **总结**
以上就是在 `Vite + Vue` 项目中集成 `MDX` 文件的完整流程，你可以用它来编写富文本内容，并在其中插入 Vue 组件，让 Markdown 具有更强的交互性。🚀

（完）


