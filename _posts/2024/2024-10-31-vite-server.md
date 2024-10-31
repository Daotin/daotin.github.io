---
layout: mypost
title: Vite Server 配置与跨域问题
tags: [vite]
---


在前端开发中，我们常常需要在开发环境中调用后端 API 接口。这时，跨域问题（CORS，Cross-Origin Resource Sharing）便不可避免。本文将以 Vite server 配置为例，解析跨域问题的根本原因以及解决思路。

## 背景

在前端开发阶段，当我们尝试从本地前端服务器（如 `localhost`）请求不同域名的后端接口时，常会遇到跨域限制。例如，发送请求后，后端返回 `403 Forbidden` 状态码，提示“Invalid CORS request”。这类跨域问题往往是由浏览器的安全策略所导致的。

![image](https://github.com/user-attachments/assets/fcc02b40-4ada-48d8-870d-ab59e6290707)


在 Vite 开发中，我们可以通过在 `vite.config.js` 中配置 `server.proxy` 来简化跨域请求的处理。代理配置不仅方便路径管理，还能通过参数 `changeOrigin: true` 模拟请求来源。很多开发者在遇到跨域问题时会设置 `changeOrigin: true`，希望借此解决问题。然而，是否配置 `changeOrigin` 就能消除跨域限制呢？

## 分析

1. **跨域请求的本质**  
   浏览器的跨域策略会根据请求的来源（origin）与目标服务器的地址是否一致来决定是否允许访问。例如，当我们在 `localhost:5173` 下访问 `http://10.8.80.208` 的接口时，浏览器会检测这是一个跨域请求。如果后端未正确配置允许跨域访问，浏览器便会拦截该请求。

2. **Vite 代理的作用**  
   Vite 的 `proxy` 配置可以将请求路径重定向至目标服务器，这样我们在开发中只需请求 `/api`，而代理会帮我们将请求指向 `http://10.8.80.208/cmqc-stage-api`。然而，浏览器的 CORS 检查依旧存在，即便代理将 `origin` 修改为后端地址，浏览器仍会验证响应的来源。因此，**代理配置的 `changeOrigin: true` 并不能绕过跨域检查**，仅是让请求“看起来”来自目标服务器的地址。

3. **后端的 CORS 配置是关键**  
   浏览器的跨域限制要求后端明确支持该请求来源，因此即便代理配置了 `changeOrigin: true`，后端仍需要在响应中设置正确的 `Access-Control-Allow-Origin` 头，才能允许跨域访问。也就是说，CORS 的根本解决方案在于后端的支持，而非前端的代理配置。

4. **`changeOrigin` 的适用场景**  
   `changeOrigin: true` 在跨域问题上并无实际帮助，仅在以下场景中有辅助作用：
   - **模拟生产环境的来源**：在开发中将请求伪装成生产环境的来源，以确保兼容性。
   - **API 负载均衡和路由需求**：当后端路由依赖 `origin` 路由流量时，`changeOrigin` 可以帮助请求被正确路由到后端的不同实例。

5. **Referer 头的影响**  
   有时开发者会尝试通过修改 `Referer` 头来解决跨域问题，然而 `Referer` 对浏览器的 CORS 限制没有任何帮助。跨域验证依赖的是 `Origin` 头，浏览器只会根据后端的 CORS 配置来决定是否允许跨域请求，因此 `Referer` 头在跨域限制上没有实际作用。

---

## 结论

在 Vite server 配置中，跨域问题的解决取决于后端的 CORS 设置，而非代理的 `changeOrigin` 配置。总结如下：

1. **后端配置是核心**：确保后端设置了正确的 `Access-Control-Allow-Origin`，明确允许前端的来源（如 `localhost:5173`）。
2. **Vite 代理的作用是简化开发**：代理可以让路径配置更加简洁，方便调试，但不会绕过跨域限制。
3. **`changeOrigin` 不是跨域问题的解决方案**：`changeOrigin: true` 在无法配置后端 CORS 的情况下也无法绕过浏览器的限制，主要用于模拟环境和路由需求的辅助。

因此，在开发中处理跨域请求的关键是确保后端 CORS 配置正确，而代理只是一个便捷的开发工具。
