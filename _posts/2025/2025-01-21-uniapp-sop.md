---
layout: mypost
title: uniapp开发微信小程序SOP
tags: [uniapp]
---

1. 目录
   {:toc}

## 开发工具推荐

- Hbuilder X
- VSCode

## 创建项目

直接使用 Hbuilder X 可视化界面，新建「项目 」，选择「默认模板 」，Vue 版本选择 2（3 貌似有不少坑）

运行测试项目：

在微信开发者工具里运行：进入 hello-uniapp 项目，点击工具栏的运行 -> 运行到小程序模拟器 -> 微信开发者工具，即可在微信开发者工具里面体验 uni-app。

HbuilderX 安装的插件：

![Untitled](/image/2025/Untitled.png)

## 项目目录

在默认的结构上，增加了一些目录：

![Untitled](/image/2025/Untitled%201.png)

> 为什么新增 style 目录，而不放在 static 目录？

非 static 目录下的文件（vue 组件、js、css 等）只有被引用时，才会被打包编译。css、less/scss 等资源不要放在 static 目录下，建议这些公用的资源放在自建的 common 目录下。static 目录一般存放图片文件。

## UI 组件库

我们选用的是旧的 uview 组件库：`"uview-ui": "^1.8.8",`，没有使用 uniapp 推荐的自家的 uni-ui，但是在项目中也是用到了 uni-ui，但不是主要的使用。

## api

api 目录参考原 Vue3 项目模板

## Components

正常开发 Vue2 组件

## Config

是一些常用配置。比如`BASE_URL`

## pages

pages 里面专门弄一个 tabBar，放每个底部按钮的入口页。作用是后期进行分包。

其他的文件夹，均为配置 subPackages 时子包的根目录。

关于分包的介绍：[https://uniapp.dcloud.net.cn/collocation/pages.html#subpackages](https://uniapp.dcloud.net.cn/collocation/pages.html#subpackages)

> 分包加载是一种优化小程序启动时间和减小首次下载大小的技术手段。通过将小程序分成一个主包和多个分包，用户在初次打开小程序时只需下载主包内容，从而加快启动速度。用户在需要时再下载其他分包内容。

![Untitled](/image/2025/Untitled%202.png)

分包的配置：

```jsx
// 在这个例子中，pages数组仅列出了主包内的页面，而subPackages数组则定义了两个分包，每个分包都有自己的根目录root和包含的页面pages。这样，当应用运行并访问分包中的页面时，相应的分包才会被下载和加载。

{
  "pages": [
    "pages/index/index", // 主包页面
    "pages/about/about" // 主包页面
  ],
  "subPackages": [
    {
      "root": "packageA/",
      "pages": [
        "pages/cat/cat", // 分包A中的页面
        "pages/dog/dog" // 分包A中的页面
      ]
    },
    {
      "root": "packageB/",
      "pages": [
        "pages/apple/apple", // 分包B中的页面
        "pages/banana/banana" // 分包B中的页面
      ]
    }
  ]
}
```

> 注意：**`pages.json`**文件中的**`pages`**选项是用来配置小程序的所有页面路径的。在**`pages.json`**中，你需要列出项目中所有的页面路径，以便于 uni-app 框架能够知道项目包含哪些页面，以及页面的入口。

但是，如果使用了**`subPackages`**来实现分包加载，那么主包中的**`pages.json`**文件的**`pages`**数组就不需要列出所有页面。在这种情况下，你只需在主包的**`pages`**中列出主包内的页面，而分包中的页面则在各自的分包配置内部通过**`pages`**数组进行定义。

>

分包后，可以在微信开发者工具中的“详情”中看到：

![Untitled](/image/2025/Untitled%203.png)

### packs.json 文件

- `pages`：存放所有的页面
  - 一般放置除分包外的：默认启动页面/tabBar 页面/所有分包都需用到公共资源、JS 脚本等
  - pages 节点的第一项为应用入口页（即首页）
  - 应用中新增/减少页面，都需要对 pages 数组进行修改
  - 如果分包的话，分包的页面不需要再 pages 中写，而是写在分包的 pages 里面
- `subPackages`：分包配置
  - 在小程序启动时，默认会下载主包并启动主包内页面，当用户进入分包内某个页面时，会把对应分包自动下载下来，下载完成后再进行展示
  - 微信小程序每个分包的大小是 2M，总体积一共不能超过 20M。
- `tabBar`：配置导航菜单
- `globalStyle`：配置状态栏、导航条、标题、窗口背景色等
- `easycom`：按照 easycom 编写的组件，可以不用引用、注册，直接在页面中使用
- `condition`：仅开发期间生效，用于模拟直达页面的场景（比如直接进入详情页
- `preloadRule`：分包预加载配置。配置 preloadRule 后，在进入小程序某个页面时，由框架自动预下载可能需要的分包，提升进入后续分包页面时的启动速度

## static

主要存放公共静态图片。

![Untitled](/image/2025/Untitled%204.png)

在 vue 页面中如何使用？

```jsx
<image
  class="arrow"
  src="/static/images/manage/drop-down.png"
  mode="aspectFit|aspectFill|widthFix"
></image>

<!-- or -->

<image
  class="arrow"
  src="@/static/images/manage/drop-down.png"
  mode="aspectFit|aspectFill|widthFix"
></image>
```

当然，每个模块自己的目录下，也可以新增一个 static 文件夹来存放自己模块的图片。

那么在使用的时候，可以使用**相对链接**。

![Untitled](/image/2025/Untitled%205.png)

![Untitled](/image/2025/Untitled%206.png)

## store

正常 Vuex 的配置。

## styles

style 样式可以参考 Vue 模板。

样式的引入在 App.vue 组件中：

```html
<style lang="scss">
	@import 'uview-ui/index.scss';

	/*每个页面公共css */
	@import './styles/base.scss';

	page {
		background-color: #f7f9fb;
		height: 100%;
		box-sizing: border-box;
	}
</style>
```

> 注意：uni.scss 文件是个特殊的文件，不在 styles 文件夹内，uniapp 自带的。
> 主要存放**样式变量**，并且在代码中无需 import 这个文件即可在所有 vue 文件的 scss 代码中使用这里的样式变量。

如果我们定义了一个类似 tailwind 的通用类比如 common.scss，那么放在哪里，可以使得所有的 vue 文件都可以直接使用呢？

下面两种都可以。

1. 放在 App.vue
2. 放在 uni.scss 中

```html
<style lang="scss">
	/*每个页面公共css */
	@import 'uview-ui/index.scss';
	@import 'styles/common.scss';
</style>
```

## uni_modules

当 uView 组件库和原生的组件不满足要求的时候，可以使用 uni_ui 组件库。

uni-ui 是 DCloud 提供的一个跨端 ui 库，它是基于 vue 组件的、flex 布局的、无 dom 的跨全端 ui 框架。

`uni-ui`  不包括内置组件，**它是内置组件的补充**

### [通过 uni_modules 单独安装组件](https://uniapp.dcloud.net.cn/component/uniui/quickstart.html#%E9%80%9A%E8%BF%87-uni-modules-%E5%8D%95%E7%8B%AC%E5%AE%89%E8%A3%85%E7%BB%84%E4%BB%B6)

如果你没有创建 uni-ui 项目模板，也可以在你的工程里，通过 uni_modules 单独安装需要的某个组件。

![Untitled](/image/2025/Untitled%207.png)

下载完成后就会出现在这里：

![Untitled](/image/2025/Untitled%208.png)

然后就可以直接使用了。

## unpackage

运行的时候自动产生的文件夹，不用管。

## utils

工具函数库。

## uni.scss

`uni.scss`为 uni-app 新建项目自带工程文件，使用的预处理器为`sass/scss`，由此可见，uni-app 官方推荐的是`scss`，同时我们 uv-ui 也是`scss`的坚定推崇者，不建议在 uni-app 中使用`less`、`stylus`等。

`uni.scss`具有如下一些特点：

- 无需引入，uni-app 在编译时，会自动引入此文件
- 在此中定义的`scss`变量，可以全局使用，可以在此定义一些颜色，主题，尺寸等变量
- **`uni.scss`会编译到每个`scss`文件中**(请着重理解这一句话)

综上所述，我们可以得知，`uni.scss`主要是利用`scss`的特性，定义一些全局变量，供各个写了`lang=scss`的 style 标签引用，但是这引出了一个重要的问题：

`uni.scss`中所写的一切内容，都会注入到每个声明了`scss`的文件中，这意味着，如果您的`uni.scss`如果有几百行，大小 10k 左右，那么这个 10k 都会被注入所有的 其他`scss`文件(页面)中，如果您的应用有 50 个页面，那么有可能因此导致整体的包体积多了 50 \* 10 = 500k 的大小，这可能会导致小程序包太大而无法预览和发布， 所以，我们建议您只将`scss`变量相关的内容放到`uni.scss`中。

## uView 组件库

> 目前：目前 uView 尚未支持 vue3 版本，但是 [uview-plus](https://github.com/ijry/uview-plus) 和 [uv-ui](https://github.com/climblee/uv-ui) 支持 vue3.
>
> 参考[组件库选型](https://codercup.github.io/unibest-docs/base/ui/ui)。

### npm 安装

1. 创建 package.json：`npm init -y`
2. 按照`npm install uview-ui@1.8.8`
3. 进行必要的配置：[https://v1.uviewui.com/components/npmSetting.html](https://v1.uviewui.com/components/npmSetting.html)

## 还原设计稿

尺寸单位：[https://uniapp.dcloud.net.cn/tutorial/syntax-css.html#尺寸单位](https://uniapp.dcloud.net.cn/tutorial/syntax-css.html#%E5%B0%BA%E5%AF%B8%E5%8D%95%E4%BD%8D)

**举例说明：**

1. 若设计稿宽度为 750px，元素 A 在设计稿上的宽度为 100px，那么元素 A 在  `uni-app`  里面的宽度应该设为：`750 * 100 / 750`，结果为：100rpx。
2. 若设计稿宽度为 640px，元素 A 在设计稿上的宽度为 100px，那么元素 A 在  `uni-app`  里面的宽度应该设为：`750 * 100 / 640`，结果为：117rpx。
3. 若设计稿宽度为 375px，元素 B 在设计稿上的宽度为 200px，那么元素 B 在  `uni-app`  里面的宽度应该设为：`750 * 200 / 375`，结果为：400rpx。

## 发布小程序

[https://uniapp.dcloud.net.cn/quickstart-hx.html#发布为小程序](https://uniapp.dcloud.net.cn/quickstart-hx.html#%E5%8F%91%E5%B8%83%E4%B8%BA%E5%B0%8F%E7%A8%8B%E5%BA%8F)
