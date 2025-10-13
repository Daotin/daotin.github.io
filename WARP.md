# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 项目概述

这是一个基于 Jekyll 的个人技术博客项目，专注于前端开发内容分享。博客地址：https://daotin.github.io

## 常用开发命令

### 本地开发与构建
```bash
# 启动本地开发服务器（默认端口 8080）
bash blog.sh run

# 指定端口启动本地开发服务器
bash blog.sh run 4000

# 构建项目到 dist 目录
bash blog.sh build

# 部署项目（构建并上传到 CDN）
bash blog.sh deploy
```

### 直接使用 Jekyll 命令
```bash
# 本地开发服务器
bundle exec jekyll serve --watch --host=0.0.0.0 --port=8080

# 构建项目
bundle exec jekyll build --destination=dist
```

### 依赖管理
```bash
# 安装 Ruby 依赖
bundle install

# 更新依赖
bundle update
```

## 项目架构

### 核心配置文件
- `_config.yml` - Jekyll 主配置文件，包含站点信息、菜单配置、SEO 设置
- `Gemfile` - Ruby 依赖定义
- `blog.sh` - 自定义构建和部署脚本

### 目录结构说明
- `_posts/` - 博客文章目录，按年份组织，文件命名格式：`YYYY-MM-DD-title.md`
- `_layouts/` - 页面布局模板
  - `mypost.html` - 博客文章布局模板
  - `page.html` - 普通页面布局模板
- `_includes/` - 可复用的 HTML 片段
  - `header.html` - 页面头部导航
  - `footer.html` - 页面底部
  - `head.html` - HTML head 部分
  - `script.html` - JavaScript 脚本
- `pages/` - 静态页面（标签、搜索、项目等）
- `image/` - 博客文章中使用的图片资源
- `public/` - 公共资源文件

### 文章模板与规范
博客文章需要包含 Front Matter 头信息：
```yaml
---
layout: mypost
title: 文章标题
tags: [标签1, 标签2]
---
```

文章支持：
- 自动生成目录：使用 `{:toc}`
- 代码高亮：使用 Rouge 语法高亮器
- 数学公式：可在 `_config.yml` 中启用 MathJax
- 图片引用：相对路径 `/image/文件名`

### 主题特性
- 响应式设计
- 深色/浅色主题切换
- 搜索功能
- 标签分类
- 留言板功能
- Service Worker 支持

## 开发注意事项

### 文章编辑
- 新文章直接编辑页面链接：`https://github.com/Daotin/daotin.github.io/edit/master/{{ page.path }}`
- 文章模板位于 `_posts/2000-01-01-template.md`
- 图片文件统一放在 `image/` 目录下

### 配置修改
- 修改站点信息：编辑 `_config.yml`
- 菜单配置：修改 `_config.yml` 中的 `menu` 部分
- 友情链接：修改 `_config.yml` 中的 `links` 部分

### 本地预览
使用 `bash blog.sh run` 启动本地服务器，访问 `http://localhost:8080` 预览效果。Jekyll 支持热重载，修改文件后会自动重新构建。