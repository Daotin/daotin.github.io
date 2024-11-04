---
layout: mypost
title: Module Federation 远程模块 vs npm 静态模块
tags: [webpack]
---

1. 目录
   {:toc}

## 什么是 Module Federation？

随着前端开发领域的不断演进，现代 Web 应用程序变得越来越复杂，代码体积也越来越大。为了应对这些挑战，开发者们开始寻找更高效的解决方案来管理代码和依赖，而不仅仅依赖传统的构建工具和包管理器。在这样的背景下，Webpack 5 推出了一个革新性的特性——**Module Federation**。

### Module Federation 出现的背景

在传统前端开发中，我们通常会使用 NPM 或 Yarn 来管理和共享依赖库。每个项目在构建时都会打包一份所有依赖，包括第三方库和自定义组件库。当应用需要更新一个共享的库时，每个项目都要重新安装新版本的库、重新打包并部署。

而且，当一个组件库更新后，需要手动更新每个依赖它的项目，这对于频繁迭代的项目来说非常麻烦。

**Module Federation** 正是在这样的背景下出现的。它提供了一种新的模块共享方式，使得一个项目可以将模块暴露给其他项目，并在运行时从远程加载这些模块。这样一来，多个项目可以共享同一个模块，而不必每次都在构建时引入它。

> 可以简单理解为，如果使用传统的 npm 的话，每次共享库更新了，使用的项目都有重新安装 npm，太麻烦了，但是 Module Federation 就相当于引用在线的 npm，实时更新，不需要重新安，而且节省当前项目的体积大小。

## Module Federation 使用示例

假设我们有两个项目：`app1` 和 `app2`。`app1` 是一个组件库提供者，`app2` 需要在运行时从 `app1` 加载组件。

### 1. 配置 `app1` 作为远程模块提供者

在 `app1` 中，我们会使用 `ModuleFederationPlugin` 来暴露模块。

**app1 的项目结构**：

```
app1/
│
├── src/
│   ├── components/
│   │   └── Button.js
│   └── index.js
├── webpack.config.js
└── package.json
```

**Button 组件**（`src/components/Button.js`）：

```javascript
import React from 'react';

const Button = () => {
  return <button>这是一个远程按钮</button>;
};

export default Button;
```

**Webpack 配置**（`webpack.config.js`）：

```javascript
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: 'http://localhost:3001/', // 开发环境的地址
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button', // 暴露 Button 组件
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
  mode: 'development',
};
```

**启动 `app1`**：

```bash
npm start
```

`app1` 启动后会在 `http://localhost:3001/` 提供 `remoteEntry.js`，这是 `app2` 远程加载 `Button` 组件的入口。

### 2. 配置 `app2` 作为模块使用者

在 `app2` 中，我们配置 `ModuleFederationPlugin` 以从 `app1` 加载远程模块。

**app2 的项目结构**：

```
app2/
│
├── src/
│   ├── index.js
│   └── App.js
├── webpack.config.js
└── package.json
```

**App 组件**（`src/App.js`）：

```javascript
import React, { Suspense, lazy } from 'react';

// 从远程加载 Button 组件
const RemoteButton = lazy(() => import('app1/Button'));

function App() {
  return (
    <div>
      <h1>App2 使用的远程组件</h1>
      <Suspense fallback='加载中...'>
        <RemoteButton />
      </Suspense>
    </div>
  );
}

export default App;
```

**Webpack 配置**（`webpack.config.js`）：

```javascript
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: 'http://localhost:3002/', // 开发环境的地址
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'app2',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js', // 从 app1 加载模块
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
  mode: 'development',
};
```

**启动 `app2`**：

```bash
npm start
```

`app2` 启动后访问 `http://localhost:3002/`，你会看到它从 `app1` 动态加载并显示了远程的 `Button` 组件。

## 微前端、Module Federation 和 Monorepo 的区别与联系

1、微前端 是一种架构模式，将大型前端应用拆分成多个独立的、可单独开发和部署的子应用。这种模式下，如果多个子应用有很多共享代码和依赖，使用 Monorepo 会比较方便；如果每个子应用需要独立开发和部署，并且技术栈差异较大，则不使用 Monorepo 也完全可以。

2、而，Module Federation 和 Monorepo 是互补的，但没有依赖关系。你可以在 Monorepo 中使用 Module Federation 来实现子项目间的模块共享，也可以在不同仓库的独立项目之间使用 Module Federation 实现远程模块加载和共享。

3、而，Module Federation 是实现微前端的一种方式，但它本身不是微前端架构，而是用于支持微前端架构的技术手段之一。Module Federation 是一种用于实现模块共享和动态加载的技术，而微前端是一种架构模式，可以使用多种技术手段来实现，比如 Single-SPA、qiankun、iframe 等都可以实现微前端的架构。Module Federation 是其中一种技术，它专注于模块共享和动态加载。

> **Module Federation 是一种用于在运行时共享和动态加载模块的技术，常被用于实现微前端架构中不同子应用之间的模块共享和独立部署，解决了代码冗余和版本同步问题；微前端是一种将大型前端应用拆分为多个独立可部署子应用的架构模式，Module Federation 是实现这种架构的技术之一；而 Monorepo 是一种将多个项目集中在同一代码库中进行管理的项目管理策略，虽然它与 Module Federation 和微前端本身没有直接关系，但可以结合使用，以实现更高效的代码共享、依赖管理和协同开发。**
