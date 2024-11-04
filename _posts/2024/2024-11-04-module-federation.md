---
layout: mypost
title: Module Federation 远程模块 vs npm 静态模块
tags: [webpack]
---

1. 目录
{:toc}

## 什么是 Module Federation？

随着前端开发领域的不断演进，现代 Web 应用程序变得越来越复杂，代码体积也越来越大。为了应对这些挑战，开发者们开始寻找更高效的解决方案来管理代码和依赖，而不仅仅依赖传统的构建工具和包管理器。在这样的背景下，Webpack 5 推出了一个革新性的特性——**Module Federation**。

### 什么是 Module Federation？

`Module Federation` 是 Webpack 5 引入的一项特性，旨在支持不同应用在 **运行时** 动态共享和加载模块。它打破了传统前端项目中需要在构建时打包一切依赖的模式，让应用在不重新构建的情况下，能从远程加载共享模块。换句话说，它提供了一种“**动态加载模块的 NPM**”体验。

### Module Federation 出现的背景

在传统前端开发中，我们通常会使用 NPM 或 Yarn 来管理和共享依赖库。每个项目在构建时都会打包一份所有依赖，包括第三方库和自定义组件库。当应用需要更新一个共享的库时，每个项目都要重新安装新版本的库、重新打包并部署。

这种模式虽然工作良好，但在一些场景中会面临挑战：

- **大型项目的构建时间和打包体积**：随着项目规模的扩大，每个应用都打包相同的库会导致代码冗余，增加加载时间。
- **库的更新和版本同步**：当一个组件库更新后，需要手动更新每个依赖它的项目，这对于频繁迭代的项目来说非常麻烦。
- **微前端架构中的独立部署**：在微前端架构中，多个团队负责不同的子应用，这些应用需要共享某些模块，但又需要独立开发、构建和部署。

**Module Federation** 正是在这样的背景下出现的。它提供了一种新的模块共享方式，使得一个项目可以将模块暴露给其他项目，并在运行时从远程加载这些模块。这样一来，多个项目可以共享同一个模块，而不必每次都在构建时引入它。

### Module Federation 解决了什么问题？

1. **运行时共享和动态加载**：不同应用可以在运行时加载共享的模块，不再需要每个应用在构建时都打包相同的代码。这减少了构建时间和应用体积。
2. **即时更新**：如果共享模块（如一个公共组件库）更新了，所有引用它的应用都能立即使用最新版本，而不需要重新安装和构建项目。
3. **去中心化管理**：传统的 NPM 包发布流程需要将代码上传到包管理器，并在使用项目中更新依赖。而 `Module Federation` 允许模块在远程托管，用户项目可以通过简单的网络请求加载它们。
4. **独立开发和部署**：在微前端架构中，每个子应用通常是由不同的团队独立开发和部署的。`Module Federation` 让这些子应用能够共享模块，而不必依赖其他应用的构建或重新发布。

**简单来说**，Module Federation 是为了解决前端开发中共享和加载模块的痛点而诞生的。它提供了一种动态、轻量化的方式来在应用之间共享模块，从而减少代码冗余、加速更新、简化版本管理，特别适合大型应用和微前端架构。

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

### 3. 解释示例中的关键点

- **`exposes` 配置**：在 `app1` 中，`ModuleFederationPlugin` 的 `exposes` 定义了哪些模块可以被其他应用加载。这里我们暴露了 `./Button` 组件。
- **`remotes` 配置**：在 `app2` 中，`remotes` 告诉 Webpack 从 `app1` 的 `remoteEntry.js` 中加载远程模块。
- **`shared` 配置**：确保共享的依赖如 `react` 和 `react-dom` 是单例模式，避免重复加载。

## 微前端、Module Federation 和 Monorepo 的区别与联系

在现代前端开发中，微前端、`Module Federation` 和 `Monorepo` 是三种旨在提升开发效率和项目可扩展性的策略。虽然它们各自有不同的实现和目标，但在一些场景中可以搭配使用，形成更灵活的开发架构。

### 1. 微前端是什么？

**微前端**（Micro-frontend）是一种将大型前端应用拆分成多个小型、独立可部署的子应用的架构模式。它借鉴了微服务的概念，每个子应用可以由不同的团队独立开发、构建和部署，最终通过某种方式在页面上聚合为一个完整的应用。

**微前端的特点**：

- **独立性**：每个子应用可以有自己的技术栈和部署流程。
- **自治**：不同团队可以并行开发各自的子应用，不会因为主应用的变动而影响开发。
- **独立部署**：子应用可以独立更新，而无需整体重新部署。

### 2. Module Federation 与微前端的关系

**Module Federation** 是 Webpack 提供的特性，专注于模块共享和动态加载，帮助在运行时实现代码复用。它在微前端架构中极为有用，因为它能实现以下几种需求：

- **模块共享**：不同子应用可以共享公共模块，比如公共组件库或工具函数，而不需要每次构建时都打包。
- **动态加载**：在应用运行时，子应用可以从远程加载更新后的模块，不需要重新构建和部署整个应用。
- **减少重复代码**：通过共享模块，子应用之间避免了重复打包和加载相同的依赖。

**联系**：
微前端架构中的每个子应用可以使用 `Module Federation` 来共享模块，从而在运行时实现更轻量的模块加载和共享。这种方式尤其适合在复杂的微前端系统中使用，使不同子应用之间的依赖管理更加高效。

**应用场景**：

- 当多个子应用共享一个公共组件库或工具库时，使用 `Module Federation` 可以实现动态加载和共享更新后的模块。
- 在大型企业应用中，多个团队负责不同子应用，但需要共享核心逻辑或组件。

### 3. Monorepo 是什么？

**Monorepo** 是一种将多个项目代码库集中管理在同一个版本库中的实践。这种方式适用于一个团队或多个团队合作开发多个相关的项目。所有子项目可以共享相同的依赖和配置，简化了开发和版本管理。

**Monorepo 的特点**：

- **统一管理**：所有项目共享同一个版本控制系统，版本管理更简单。
- **代码共享**：多个项目可以共享相同的库和工具，减少了重复开发。
- **一致性**：所有项目的构建和测试工具可以一致，方便管理和维护。

**应用场景**：

- 当多个项目高度相关，需要频繁共享代码和库时。
- 当需要统一版本控制和一致的开发环境时，Monorepo 是一个很好的选择。

### 4. 三者的区别与联系

- **微前端与 Monorepo**：虽然微前端架构倾向于独立的子应用开发，但它并不排斥 Monorepo。将微前端架构和 Monorepo 结合使用，可以实现独立开发子应用的同时，享受共享代码和统一版本管理的好处。
- **Module Federation 与微前端**：`Module Federation` 作为 Webpack 提供的模块共享机制，是微前端架构中实现动态模块加载和共享的理想选择。它在微前端应用中允许不同子应用共享模块，使每个子应用可以独立更新和发布，同时享受即时共享模块的好处。
- **Module Federation 与 Monorepo**：虽然 `Module Federation` 通常用于分布式架构，但它也可以在 Monorepo 中使用。Monorepo 中的不同项目可以使用 `Module Federation` 来共享模块，实现代码复用和动态加载。

### 5. 应用场景和如何搭配使用

**单独使用的场景**：

- **微前端**：适用于需要将大型应用分解为多个独立可部署模块的场景，通常用于大型企业应用开发。
- **Module Federation**：适合希望实现动态加载和共享模块的场景，尤其是多个应用共享相同组件库的情况。
- **Monorepo**：适用于需要集中管理多个项目和代码共享的场景，通常用于中小型团队或相关性强的项目组。

**搭配使用的场景**：

- **微前端 + Module Federation**：在微前端架构中，使用 `Module Federation` 来共享公共模块和组件库，使子应用独立开发、构建和部署的同时，可以实现运行时共享。
- **微前端 + Monorepo**：将微前端架构置于 Monorepo 中，可以实现独立子应用的开发和部署，同时享受共享代码和统一管理的优势。
- **Monorepo + Module Federation**：在 Monorepo 中使用 `Module Federation` 共享模块，使不同项目可以在运行时动态加载和使用模块，而不是在构建时引入和打包。

**示例组合**：
在一个大型企业应用中，主应用和多个子应用组成了一个微前端架构。为了实现代码共享，使用 `Module Federation` 在运行时动态加载共享的公共组件库，同时将所有子应用放在一个 Monorepo 中，以方便版本管理和依赖共享。这样的组合既提供了灵活的模块加载，又保持了代码和版本的一致性。

> 总体来说，微前端 是一种架构模式，将大型前端应用拆分成多个独立的、可单独开发和部署的子应用。这种模式下，如果多个子应用有很多共享代码和依赖，使用 Monorepo 会比较方便；如果每个子应用需要独立开发和部署，并且技术栈差异较大，则不使用 Monorepo 也完全可以。
> 而，Module Federation 和 Monorepo 是互补的，但没有依赖关系。你可以在 Monorepo 中使用 Module Federation 来实现子项目间的模块共享，也可以在不同仓库的独立项目之间使用 Module Federation 实现远程模块加载和共享。
> 而，Module Federation 是实现微前端的一种方式，但它本身不是微前端架构，而是用于支持微前端架构的技术手段之一。Module Federation 是一种用于实现模块共享和动态加载的技术，而微前端是一种架构模式，可以使用多种技术手段来实现，比如 Single-SPA、qiankun、iframe 等都可以实现微前端的架构。Module Federation 是其中一种技术，它专注于模块共享和动态加载。
>
> **Module Federation 是一种用于在运行时共享和动态加载模块的技术，常被用于实现微前端架构中不同子应用之间的模块共享和独立部署，解决了代码冗余和版本同步问题；微前端是一种将大型前端应用拆分为多个独立可部署子应用的架构模式，Module Federation 是实现这种架构的技术之一；而 Monorepo 是一种将多个项目集中在同一代码库中进行管理的项目管理策略，虽然它与 Module Federation 和微前端本身没有直接关系，但可以结合使用，以实现更高效的代码共享、依赖管理和协同开发。**
