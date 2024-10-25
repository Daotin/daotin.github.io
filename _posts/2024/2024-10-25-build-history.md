---
layout: mypost
title: 前端构建工具发展史
tags: [前端]
---

## 构建工具发展进程总览

从刀耕火种，到 grunt，glup 这种任务自动化工具，再到模块打包工具 webpack，rollup，再到 Parcel，Snowpack， Turbopack 现代化构建工具，再到 Esbuild，vite 等高性能构建工具。

## 刀耕火种

几乎没有构建工具，开发者直接编写 HTML、CSS 和 JavaScript，主要通过 js,css 压缩工具，手动压缩代码、合并文件，然后上传到服务器。

缺点：效率低下，代码难以管理，无法处理依赖关系。

## Grunt 时代（2012 年左右）

grunt 是第一个流行的现代化前端构建工具。是一个基于配置的任务运行器。

功能：文件压缩、语法检查、CSS 预处理等

缺点：配置较为繁琐，构建速度较慢。

## Gulp 时代（2013 年后）

gulp 是基于流的自动化构建工具。配置简单，支持同时执行多个任务。

相比于 grunt，Gulp 通过流式操作、并行任务处理、简洁代码风格和更灵活的插件体系，解决了 Grunt 速度慢、配置繁琐、扩展性弱等问题，因此在前端构建任务中逐渐取代了 Grunt，成为更高效和灵活的选择。

1. **基于流的处理方式**

- **问题**：Grunt 的任务是基于文件系统的，每个任务通常会将输出写入磁盘，再由下一个任务读取，频繁的文件 I/O 操作增加了时间开销。
- **解决方案**：Gulp 使用 Node.js 的流机制将文件直接传递到下一个任务，减少了磁盘读写操作，从而提升了构建速度。文件在任务间通过内存流传递，不必每次读写磁盘。

2. **更灵活的任务管理**

- **问题**：Grunt 的任务通常是串行执行的，缺乏灵活的并行和异步执行机制。这在处理大量任务时会增加构建时间。
- **解决方案**：Gulp 支持任务的并行与异步执行，可以让多个不依赖彼此的任务并行运行，节省构建时间。Gulp 通过 `gulp.series()` 和 `gulp.parallel()` 实现任务的灵活组合，提供更精细的控制。

3. **简洁的配置与代码**

- **问题**：Grunt 的配置文件（Gruntfile）结构复杂，任务和配置项较多，较为冗长。每个任务需要详细配置，且容易因为配置繁多而出错。
- **解决方案**：Gulp 倡导 "代码优于配置" 的理念，构建流程更像是一段代码逻辑，便于维护和理解。Gulp 的配置相对简洁，使用代码流控制构建步骤，编写和阅读更加直观。

## Webpack 时代（2014 年后）

Webpack 取代 Gulp 成为主流构建工具的原因，主要体现在以下几个方面：

1. **模块化打包与依赖管理**

- 背景：项目越来越复杂，所以模块化需求开始增长
- **问题**：Gulp 的设计理念主要是**针对任务管理和自动化流程处理**，而不是模块打包工具。虽然可以通过插件实现文件的编译和处理，但它没有内置的模块化系统来处理复杂的依赖关系。
- **解决方案**：Webpack 的核心优势在于它可以将所有类型的文件（JavaScript、CSS、图片等）视作模块，并且可以自动处理模块的依赖关系。它通过静态分析和打包机制将模块及其依赖打包成单一文件或按需加载的多个文件，大大简化了复杂项目的管理。

2. **一站式构建工具**

- **问题**：Gulp 依赖插件来处理不同的构建任务，如编译、合并、压缩等。但由于它本身并不处理模块化，项目复杂度较高时，可能需要组合大量的插件来完成不同的需求。
- **解决方案**：Webpack 提供了一站式的构建功能，从模块打包到代码分割、热更新、树摇优化（Tree Shaking）等都可以通过配置实现。开发者无需引入多种工具组合，Webpack 本身就能处理所有构建任务。

3. **代码分割与按需加载**

- 背景：单页应用(SPA)的兴起，代码分割的需求增加，按需加载变得重要
- **问题**：Gulp 本质上是一个任务管理工具，不具备对模块依赖图的理解。因此，它不能很好地实现代码分割和按需加载，需要依赖其他工具进行复杂的配置。
- **解决方案**：Webpack 内置代码分割功能，可以根据不同的应用场景对代码进行按需加载（如懒加载）。这极大地提升了性能，特别是在大型单页面应用（SPA）中，能够减少初始加载时间。

4. **开发模式和热更新**

- 背景：项目越来越复杂，开发体验也越来越重要
- **问题**：Gulp 可以通过插件实现浏览器自动刷新和文件监听，但并没有集成的开发模式工具支持，需要手动配置多个插件，并且效率相对较低。
- **解决方案**：Webpack 提供了开发模式下的实时热更新功能（Hot Module Replacement, HMR），可以在代码更新时即时在浏览器中刷新部分内容，而不需要刷新整个页面，大大提升了开发效率和体验。

5. **树摇优化 (Tree Shaking) 和作用域提升 (Scope Hoisting)**

- **问题**：Gulp 无法进行代码优化，如删除未使用的代码（Dead Code Elimination）。即使可以通过插件来压缩代码，也不能有效优化模块的使用。
- **解决方案**：Webpack 引入了树摇优化，可以自动移除未被引用的代码，减少打包文件的体积。同时，作用域提升能减少函数作用域的嵌套，进一步优化性能。这些现代化的优化手段为生产环境带来了显著的性能提升。

总结：

Webpack 取代 Gulp 成为主流构建工具的主要原因在于它的模块化打包能力、强大的依赖管理、代码分割和按需加载、热更新和代码优化等现代化功能。这使得 Webpack 能够处理更加复杂的前端项目，并显著提升开发和生产效率。而 Gulp 作为任务管理工具，在处理简单的构建任务时依然适用，但对于现代大型项目和单页面应用而言，Webpack 提供了更加全面的解决方案，因此逐渐取代了 Gulp 的位置。

## Rollup 时代（2015 年后）

这么看来，webpack 已经很优秀了，为什么后面又会出现 rollup？

简单来说：Rollup 不是要取代 Webpack，而是在特定场景（库的开发）下提供更好的解决方案。两者是互补关系。

虽然 Webpack 非常强大，并且在前端构建工具中占据了主导地位，但 Rollup 的出现并且得到广泛使用，是因为它解决了一些 Webpack 无法完美满足的特定需求，尤其是在构建 **JavaScript 库** 和模块打包方面。Rollup 主要有以下几个原因和特点，使得它即便在 Webpack 流行的情况下，仍然得以发展并获得广泛的应用：

1. **不同的使用场景**

- **Webpack**：Webpack 是为构建复杂的 **应用程序**（尤其是单页面应用）设计的。虽然 Webpack 也可以打包库，但其设计并不是针对库打包优化的。
- **Rollup**：Rollup 专门为打包 **JavaScript 库** 而设计，能够生成更为简洁、优化的代码输出。它支持 ES 模块的原生打包，使其可以生成高效的、体积更小的代码，更加适合发布为 npm 包或库文件的场景。

2. **原生支持 ES 模块**

- **Webpack**：虽然 Webpack 支持多种模块化格式（如 CommonJS、AMD、ESM 等），但它的模块系统是基于自己的实现，最终打包的文件包含了一些 Webpack 的模块管理代码（即“Runtime”）。
- **Rollup**：Rollup 通过原生支持 ES 模块规范（ESM），并将其作为首要目标。它可以生成没有额外运行时开销的纯净的 ES 模块输出，因此生成的代码更干净、体积更小。

3. **树摇优化 (Tree Shaking) 的优势**

- **Webpack**：Webpack 也支持树摇优化，但由于它支持多种模块化格式（如 CommonJS），在处理非 ESM 模块时，树摇优化效果可能不如预期。此外，Webpack 打包应用时，往往会有额外的打包逻辑和运行时，增加了最终文件的体积。
- **Rollup**：Rollup 在处理 ES 模块时，其树摇优化效果非常出色。由于 Rollup 是以 ES 模块为核心，它能够更精准地进行代码优化和删除未使用的模块，生成的打包文件通常比 Webpack 更小。

总结：

**Webpack** 仍然是构建复杂单页面应用（SPA）和管理大量依赖的优秀工具，它擅长处理复杂的模块依赖、动态加载、热更新等功能。

**Rollup** 则更适合用于构建 JavaScript 库，因其生成更小、更优化的打包文件，并且能够灵活输出多种模块格式。Rollup 的简洁性和对 ES 模块的原生支持使其在库开发中表现更好。

因此，**Webpack 和 Rollup 并不是直接的替代关系**，而是各自适用于不同的场景：Webpack 适合复杂的应用程序，Rollup 则专注于高效地构建轻量级的 JavaScript 库。

## Parcel 时代（2017 年后）

**Parcel 出现的主要原因是为了解决 Webpack 的一个突出问题：配置太复杂**

```js
// 配置对比
// Webpack 需要大量配置
module.exports = {
  entry: './src/index.js',
  output: { ... },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      // ... 更多配置
    ]
  },
  plugins: [ ... ]
};

// Parcel 几乎零配置
// 直接运行：parcel index.html
```

它的设计理念和特性使其成为一个“零配置”的打包工具，针对现代前端开发的痛点进行了优化。具体比如：

| webpack                                             | parcel                                                         |
| --------------------------------------------------- | -------------------------------------------------------------- |
| 处理常见文件类型（如图片、字体、CSS 预处理器、JSX 等）需要手动安装和配置 loader 和插件 | 开箱即用，内置对常见文件类型的支持，不需要手动安装和配置额外的 loader 或插件                     |
| 通过配置可以实现代码拆分（Code Splitting）                        | 内置了智能的代码拆分机制，自动将项目的依赖关系进行拆分并按需加载                               |
| 热更新功能需要配置                                           | 默认支持快速的热更新，且无需额外配置                                             |
| 通过插件（如 Babel）处理 JavaScript 的兼容性和新特性转换，但这通常需要手动配置    | 内置对 ES6+、TypeScript 等现代 JavaScript 语言特性的支持，开发者不必手动设置 Babel 等工具 |

总结：

Parcel 的出现是为了解决开发者在使用像 Webpack 这样功能强大但配置复杂的工具时遇到的困扰。Parcel 的**零配置**、**自动依赖分析**、**内置代码拆分**和**快速热更新**等功能，大大简化了开发者的工作流，特别是在中小型项目和原型开发中表现尤为出色。

**但是，因为 webpack 生态更完善，配置更灵活，功能更强大，所以适合大型项目，而 Parcel 更适合个人项目或者小的项目。**

## Vite 时代（2020 年后）

Vite 出现主要是为了**解决 Webpack 在`开发环境`下的性能问题**。

1. **开发服务器启动快**

- **问题**：传统构建工具（如 Webpack、Parcel）在启动开发服务器时，会先进行一次完整的依赖打包构建，即便使用了缓存和增量构建优化，对于大型项目来说，启动时间依然较长，影响开发效率。
- **解决方案**：Vite 采用了 **按需加载的开发服务器**。它利用 ES 模块（ESM）的原生支持，直接在开发环境中基于浏览器的模块加载机制，按需加载文件，而无需在启动时完成整个项目的打包。这一设计让开发服务器的启动速度非常快，即使是大型项目也能在瞬间启动。

2. **热更新极快**

- **问题**：Webpack 和其他传统工具的热模块替换（HMR）虽然可以实现局部更新，但由于模块管理的复杂性，大项目中的 HMR 速度会逐渐变慢，甚至会导致页面全局刷新，影响开发体验。
- **解决方案**：Vite 的 HMR 机制基于 ESM 模块，能在文件更新时仅重新加载受影响的模块，且不需要重新打包整个应用。

3. **依赖的预构建**

- **问题**：传统工具在开发过程中需要处理大量的第三方依赖库，特别是大量小模块的引入，会导致开发构建速度变慢。
- **解决方案**：Vite 使用 **Esbuild** 对第三方依赖库进行预构建。Esbuild 是一个极快的构建工具，用 Go 语言编写，性能远超 JavaScript 构建工具。通过在开发启动阶段预先打包依赖，Vite 能够加速依赖的加载，避免多次重复解析依赖带来的性能问题，从而大幅提升开发速度。

4. **生产环境的优化构建**

- **问题**：Vite 虽然主要为开发体验而优化，但在生产环境构建中，传统工具（如 Webpack）会产生冗余的模块化包装代码，优化的复杂性较高，尤其在代码拆分和 Tree Shaking 上容易有性能瓶颈。
- **解决方案**：Vite 在生产环境中使用 Rollup 进行打包，打包后的代码更简洁，没有多余的模块化包装代码，体积也更小。

简单来说：Vite 就是为了让开发者在**开发时**能获得更好的体验，特别是在大型项目中。

## Turbopack（2022.10）

官网：https://turbo.hector.im/pack/docs

**TurboPack 的推出是为了进一步提升前端构建工具的性能和开发体验，特别是为了解决 Vite 和 Webpack 在超大规模项目和复杂场景下遇到的性能瓶颈。**

TurboPack 由 Vercel 团队推出，其设计目标是成为“下一个时代的超高速 JavaScript 打包器”，并在以下几个方面做出了突破和优化：

1. **超高性能与 Rust 实现**

- **问题**：Vite 虽然在开发环境中性能出色，但在极大规模的代码库下，JavaScript 和 Node.js 的性能依然有限，尤其在多核并发和文件 I/O 操作上，Node.js 有一定的瓶颈。
- **解决方案**：TurboPack 使用 **Rust** 语言编写，这带来了极高的性能优势。Rust 是一个系统级编程语言，拥有非常快的编译速度和出色的并发处理能力。相比 JavaScript，Rust 能更好地利用多核 CPU，处理大规模并行任务，特别适合处理构建打包这种大量文件 I/O 和计算密集型任务。这使得 TurboPack 在大型代码库中比 Vite 和 Webpack 的速度更快。

2. **增量构建与持久缓存**

- **问题**：Vite 和 Webpack 虽然都支持增量构建和缓存，但在极大规模的项目中，构建时的缓存管理和增量更新可能依然需要耗费较多时间，尤其是在项目重启或依赖更新时。
- **解决方案**：TurboPack 引入了更加高效的 **增量构建** 和 **持久缓存** 机制。它的构建缓存可以持久化存储在磁盘中，重启项目后也能继续利用缓存，避免重复编译已处理过的模块。TurboPack 的缓存机制也针对多核 CPU 进行了优化，确保了在项目更新、模块变动时，只需编译真正有变动的部分，从而进一步减少构建时间。

3. **快速冷启动**

- **问题**：传统的构建工具在冷启动（即首次启动构建）时，通常需要扫描整个项目并建立依赖关系，随着项目规模的增大，冷启动时间可能会明显变长。
- **解决方案**：TurboPack 的架构设计优化了冷启动过程，通过高效的依赖分析和并行处理策略，使得即便在首次启动时也能获得极快的构建速度。这对大型代码库尤其重要，因为可以缩短开发者等待构建的时间，提升工作效率。

4. **模块化和插件系统**

- **问题**：Vite 和 Webpack 都有丰富的插件系统，但这些插件的执行速度受限于 JavaScript 本身的性能，在复杂场景或高并发需求下，仍有一定的性能瓶颈。
- **解决方案**：TurboPack 的插件系统基于 Rust 实现，并在设计上更注重模块化和高效的并行处理。Rust 的高性能插件架构使得 TurboPack 在运行复杂插件或大规模文件处理时也能保持出色的性能。同时，Rust 编写的插件更能高效地执行，不会对主构建过程产生显著的性能拖累。

5. **深度集成现代 JavaScript 框架**

- **问题**：虽然 Vite 已经针对 Vue、React 等现代框架进行了优化，但对于复杂的多框架项目或一些特定的性能需求，Vite 的 JavaScript 架构可能会出现性能瓶颈。
- **解决方案**：TurboPack 针对现代框架如 **React** 和 **Next.js** 做了深度优化，特别是在 SSR（服务器端渲染）、多页面应用支持和代码拆分方面有很好的性能表现。Vercel 团队本身是 Next.js 的开发者，因此 TurboPack 与 Next.js 具有天然的兼容性，并可以充分发挥其性能优势，特别是在复杂的 React 项目中。

6. **未来的 Web 性能需求**

- **问题**：随着前端技术的发展，Web 应用的体积和复杂度逐年增长，传统的 JavaScript 工具在处理极端复杂的应用时效率逐渐下降，未来需要一种性能更高的解决方案。
- **解决方案**：TurboPack 的设计不仅关注现有的开发需求，还瞄准了未来的 Web 应用场景，致力于构建一个能适应未来需求的高性能打包器。例如，TurboPack 的模块解析和构建机制为 WebAssembly（Wasm）和 Rust 的高性能扩展做好了准备，使其可以处理更多非 JavaScript 的模块类型，为未来 Web 应用的更高性能提供了保障。

7. **微前端和多项目支持**

- **问题**：在 Webpack 和 Vite 中，处理微前端架构或多个项目的组合构建通常比较复杂，尤其是在共享模块、同步更新方面可能需要额外配置和插件支持。
- **解决方案**：TurboPack 的多项目和微前端架构支持更强大且简洁，通过模块化的依赖管理和更高效的缓存共享，使得多个项目的组合构建更为流畅。它的依赖分析和缓存策略也适用于多项目构建和模块共享，帮助开发者更轻松地管理和更新大型项目中的多个子模块或微前端模块。

总结：

TurboPack 目前特别适合那些对 **性能要求极高的超大型项目**、**复杂多框架应用**、**微前端架构**以及**需要持久缓存**的场景，而 Vite 依然是开发体验良好、适合中小型项目的优秀工具。因此，TurboPack 的出现并非完全替代 Vite 和 Webpack，而是为特定需求提供了一个更高性能的选择。

## Rspack（2024.08）

官网：https://rspack.dev/zh/guide/start/introduction

Rspack 和 turbopack 都是基于 Rust 实现的 bundler，且都发挥了 Rust 语言的优势。

与 turbopack 不同的是，Rspack 选择了**对 webpack 生态兼容的路线**，一方面，这些兼容可能会带来一定的性能开销，但在实际的业务落地中，我们发现对于大部分的应用来说，这些性能开销是可以接受的，另一方面，这些兼容也使得 Rspack 可以更好地与上层的框架和生态进行集成，能够实现业务的渐进式迁移。

## 总结

| 构建工具  | 主要优点                                 | 主要缺点                           | 适用场景                     |
| --------- | ---------------------------------------- | ---------------------------------- | ---------------------------- |
| Grunt     | • 配置清晰<br>• 插件丰富                 | • 速度慢<br>• 配置繁琐             | 简单的任务自动化             |
| Gulp      | • 流式处理<br>• 语法简单                 | • 不支持模块化<br>• 复杂项目维护难 | 简单的前端自动化工作流       |
| Webpack   | • 模块化强大<br>• 生态完善<br>• 配置灵活 | • 配置复杂<br>• 打包速度慢         | 大型应用程序开发             |
| Rollup    | • 代码简洁<br>• Tree-shaking 优秀        | • 插件较少<br>• 功能相对单一       | 类库/框架开发                |
| Parcel    | • 零配置<br>• 使用简单                   | • 生态不完善<br>• 大型项目不适用   | 小型项目/原型开发            |
| Vite      | • 开发速度快<br>• 配置简单               | • 生态相对较新<br>• 兼容性有限     | 现代化 web 应用开发          |
| Turbopack | • 速度极快<br>• 增量编译                 | • 不够成熟<br>• 功能不完善         | 仍在开发中，暂不建议生产使用 |
| Rspack    | • 兼容 Webpack<br>• 速度快               | • 生态不完善<br>• 文档较少         | 需要快速构建的 Webpack 项目  |

**选择建议**：

- 新项目首选：Vite
- 大型项目：Webpack
- 库开发：Rollup
- 小项目：Parcel
- 需要极致性能：可以观望 Turbopack/Rspack