---
layout: mypost
title: 异步数据竞态问题解决方案
tags: [前端]
---

1. 目录
{:toc}

## 背景

在vue spa前端接口请求的时候，比如两个tab，第一个为list1，第二个为list2，如果切换过快，可能tab2获取的是tab1的数据？这种异步数据竞态问题的通用解决办法是什么？

您提到的是前端开发中常见的异步竞态问题（Race Condition）。当在 Vue SPA 中快速切换 tab 时，如果第二个 tab 的数据请求比第一个 tab 的数据请求晚返回，就可能导致显示错误的数据。

解决这种竞态问题的通用方法有几种：

1. **请求标记**（最简单）:
   - 为每个请求添加唯一标识符
   - 检查返回的响应是否匹配当前视图状态的标识符

2. **请求取消**（最通用）: 
   - 使用 Axios 的 CancelToken 或 AbortController 取消前一个请求
   - 在组件销毁或切换 tab 时取消未完成的请求

3. **防抖和节流**:
   - 限制请求发送的频率
   - 确保用户操作稳定后再发送请求

## 请求标记

下面是一个具体的**请求标记**实现示例：

```javascript
export default {
  data() {
    return {
      currentRequestId: null,
      list: []
    }
  },
  methods: {
    async fetchTabData(tabId) {
      // 生成唯一请求ID
      const requestId = Date.now();
      this.currentRequestId = requestId;
      
      try {
        const response = await this.$axios.get(`/api/list/${tabId}`);
        
        // 检查这个响应是否对应最新的请求
        if (this.currentRequestId === requestId) {
          this.list = response.data;
        } else {
          // 忽略过时的响应
          console.log('忽略过时的响应');
        }
      } catch (error) {
        if (this.currentRequestId === requestId) {
          console.error('获取数据失败', error);
        }
      }
    }
  },
  beforeUnmount() {
    // 组件销毁时重置请求ID
    this.currentRequestId = null;
  }
}
```

如果您使用 Vue 3 和 Composition API，解决方案可能看起来像这样：

```javascript
import { ref, onUnmounted } from 'vue';

export function useTabData() {
  const list = ref([]);
  const loading = ref(false);
  let currentRequestId = null;
  
  const fetchTabData = async (tabId) => {
    loading.value = true;
    // 生成唯一请求ID
    const requestId = Date.now();
    currentRequestId = requestId;
    
    try {
      const response = await axios.get(`/api/list/${tabId}`);
      
      // 检查这个响应是否对应最新的请求
      if (currentRequestId === requestId) {
        list.value = response.data;
      }
    } catch (error) {
      if (currentRequestId === requestId) {
        console.error('获取数据失败', error);
      }
    } finally {
      if (currentRequestId === requestId) {
        loading.value = false;
      }
    }
  };
  
  onUnmounted(() => {
    currentRequestId = null;
  });
  
  return {
    list,
    loading,
    fetchTabData
  };
}
```

这种解决方案确保只有最新请求的响应会被处理，从而避免数据错乱的问题。

## 请求取消

> 提问：如果使用 Axios 的 AbortController取消前一个请求呢？如何融入到封装的request.js中，在每次请求前，取消上一次的请求。这种方式是不是不适合统一封装？

使用 Axios 的 AbortController 来取消前一个请求是一种很好的方式，但您提出了一个重要问题 - 如何在封装的 `request.js` 中实现这一逻辑。

确实，这种方式在统一封装时需要考虑一些细节，因为不是所有请求都需要被取消，而且核心是：**区分哪些请求属于同一组**（比如同一个 tab 下的请求）。

以下是一种可能的实现方式：

```javascript
// request.js
import axios from 'axios';

// 存储请求取消控制器的映射
const pendingRequests = new Map();

// 生成请求的唯一键
const generateRequestKey = (config) => {
  // 可以根据 URL 和参数生成唯一键
  // 这里可以添加一个自定义的 abortKey 来分组请求
  const { url, method, params, data, abortKey } = config;
  
  // 如果提供了 abortKey，则使用它作为主键
  // 这样同一组的请求（如同一个 tab 下的请求）会使用相同的 abortKey
  if (abortKey) {
    return abortKey;
  }
  
  // 否则根据请求信息生成唯一键
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
};

// 取消之前的请求
const cancelPreviousRequest = (requestKey) => {
  if (pendingRequests.has(requestKey)) {
    const controller = pendingRequests.get(requestKey);
    controller.abort();
    pendingRequests.delete(requestKey);
  }
};

// 创建请求实例
const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  // 其他 axios 配置
});

// 请求拦截器
instance.interceptors.request.use(config => {
  // 确保 config.abortKey 存在（如果用户没有提供）
  config.abortKey = config.abortKey || generateRequestKey(config);
  
  // 取消同组的上一个请求
  cancelPreviousRequest(config.abortKey);
  
  // 创建新的 AbortController
  const controller = new AbortController();
  config.signal = controller.signal;
  
  // 存储取消控制器
  pendingRequests.set(config.abortKey, controller);
  
  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器
instance.interceptors.response.use(response => {
  // 请求成功完成后，从 pendingRequests 中移除
  const requestKey = generateRequestKey(response.config);
  pendingRequests.delete(requestKey);
  
  return response;
}, error => {
  // 如果是取消请求导致的错误，可以做特殊处理
  if (axios.isCancel(error)) {
    console.log('请求已取消:', error.message);
    return Promise.reject(new Error('请求已取消'));
  }
  
  // 请求失败后，也需要从 pendingRequests 中移除
  if (error.config) {
    const requestKey = generateRequestKey(error.config);
    pendingRequests.delete(requestKey);
  }
  
  return Promise.reject(error);
});

// 导出请求方法
export default {
  get(url, params, config = {}) {
    return instance.get(url, { ...config, params });
  },
  post(url, data, config = {}) {
    return instance.post(url, data, config);
  },
  // 更多方法...
  
  // 也可以提供一个显式的方法来取消特定组的请求
  cancelRequest(abortKey) {
    cancelPreviousRequest(abortKey);
  }
};
```

使用这个封装的方式，您可以在组件中这样使用：

```javascript
import request from '@/utils/request';

export default {
  methods: {
    async fetchTabData(tabId) {
      try {
        // 为同一个 tab 的请求指定相同的 abortKey
        const response = await request.get(`/list/${tabId}`, null, {
          abortKey: `tab-data-${tabId}`
        });
        this.list = response.data;
      } catch (error) {
        if (error.message !== '请求已取消') {
          console.error('获取数据失败', error);
        }
      }
    },
    
    // 也可以在 beforeRouteLeave 或组件销毁时主动取消
    cancelTabRequests(tabId) {
      request.cancelRequest(`tab-data-${tabId}`);
    }
  },
  beforeUnmount() {
    // 可以在组件卸载时取消所有相关请求
    this.cancelTabRequests(this.activeTabId);
  }
}
```

**关于是否适合统一封装的问题：**

这种方式确实适合统一封装，但有以下几点需要注意：

1. **分组机制很重要** - 通过 `abortKey` 参数允许开发者自己决定哪些请求属于同一组，只有同组的请求会互相取消。

2. **不是所有请求都需要取消** - 有些请求可能不需要这个特性，可以选择不提供 `abortKey`。

3. **错误处理** - 被取消的请求会产生错误，需要在拦截器中正确处理，避免影响用户体验。

4. **内存管理** - 需要确保请求完成后从 `pendingRequests` 中移除相关记录，避免内存泄漏。

这种封装方式的优点是可以在项目的任何地方使用一致的请求取消逻辑，而不需要每个组件都实现自己的取消机制。