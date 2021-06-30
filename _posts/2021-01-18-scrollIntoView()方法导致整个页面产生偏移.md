---
title: scrollIntoView()方法导致整个页面产生偏移
---

大家好，我是前端队长Daotin，想要获取更多前端精彩内容，关注我(全网同名)，解锁前端成长新姿势。  

问题描述
----

今天在做页面 UI 改版的时候发现，我之前使用的是`dom.scrollIntoView();` 使得点击右侧题目编号的时候，让左侧题目滚动到页面可视区域。

> 如果不知道 `scrollIntoView` 如果使用，我有篇文章专门写了 `scrollIntoView` 的简单使用：[scrollIntoView() 让元素进入可视区域](https://github.com/Daotin/fe-blog/issues/167)

但是现在有个问题就是，当点击题目编号的时候，除了题目会滚动到可视区域，整个页面也会稍稍往上滚动，导致页面错位。

如下图所示，当我点击第 9 题的时候，左侧第 9 题移动到视口中，但是整个页面包括导航栏都往上移动了，且无法在移回来，整个页面是没有滚动条的。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b457e55c51754aa0b949e67723ada381~tplv-k3u1fbpfcp-zoom-1.image)

  

问题分析
----

这个时候唯一的可能就是`scrollIntoView`函数引起的问题。

我之前怀疑是不是该函数给整个页面加了`transform` 属性导致整个页面往上偏移，通过查看 css，发现没有。

没有想到办法。只能借助搜索引擎了，于是我在 Stack Overflow 上面找到了一篇文章：

[javascript - ScrollIntoView() causing the whole page to move](https://stackoverflow.com/questions/11039885/scrollintoview-causing-the-whole-page-to-move)

说的正好是这种情况。

最高赞给出的解决方法是：放弃使用`scrollIntoView` 改用`scrollTop` 来操作滚动条。

```
var target = document.getElementById("target");
target.parentNode.scrollTop = target.offsetTop;

```

> **`offsetTop`：元素上外边框距离父元素上内边框的距离（简单来说就是元素相对父元素上边的距离）**

这段代码好理解，就是当前需要显示的元素距离父元素顶部的距离，也就是滚动条滚动的高度。

这段代码执行后，就可以让该元素到达父元素顶部的位置。

> 注意事项：offsetTop 不一定是相对于父元素的，如果有很多父元素的话，它是相对于第一个`定位的父元素`的。
> 
> 如果第一个父元素未定位（相对`relative`、绝对`absolute`或固定`fixed`），则可能需要将第二行更改为：
> 
> `target.parentNode.scrollTop = target.offsetTop- target.parentNode.offsetTop;`
> 
> 参考 offset 相关属性：[Web/06-一文搞懂 DOM 相关距离问题](https://github.com/Daotin/Web/blob/67c2d89dc70848aace9f91213f5d4e1080720c2b/03-JavaScript/03-BOM/06-一文搞懂DOM相关距离问题.md#13offset系列)

解决方法
----

代码如下，加上动画：

```
var target = document.getElementById("target");

$(target).animate({"scrollTop": target.offsetTop }, 'normal');

```

这是使用 jQuery 的`animate` 动画函数。

> `animate` 函数使用方法：https://jquery.cuishifeng.cn/animate.html

如果不使用 jQuery 的话，由于`scrollTop` 是 js 属性，不是 css 属性，所以不能使用`transition` 来设置动画。动画效果要自己写喽。

下面是一个参考例子：[scrollTop animation without jquery](https://stackoverflow.com/questions/21474678/scrolltop-animation-without-jquery)

相关问题
----

类似的问题和解决方法如下链接：

*   https://stackoverflow.com/questions/57282647/scrollintoview-moves-the-whole-page-layout-up?noredirect=1&lq=1
    
*   https://stackoverflow.com/questions/62169922/scrollintoview-whole-page-shifting-down
    

（完）


***以上，如果你看了觉得对你有所帮助，就点个赞叭，这样Daotin也有更新下去的动力，跪谢各位父老乡亲啦~~~ 听说喜欢点赞的人，一个月内都会有好运降临哦 ~~***
