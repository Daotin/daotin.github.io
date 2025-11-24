---
layout: mypost
title: 一道并发面试题
tags:
  - 面试
---

> 请实现一个函数，可以批量请求数据，所有的 url 地址在 urls 参数中，同时可以通过 max 参数控制请求的并发量，当所有的请求结束后，需要执行 callback 回调函数，发请求的函数直接使用 fetch 即可。
> 函数的名称和参数如下：
> function sendRequest(urls, max, callback) {}

ChatGPT:

```jsx
// 以下是一个使用async/await和Promise实现的sendRequest函数，可以满足您的需求：
async function sendRequest(urls, max, callback) {
  // 去除重复的url
  const uniqueUrls = [...new Set(urls)];

  // 定义一个用于存储请求任务的数组
  const tasks = [];

  // 定义一个执行请求的内部函数
  async function fetchUrl(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  }

  // 遍历所有的url，创建异步请求任务
  for (const url of uniqueUrls) {
    tasks.push(fetchUrl(url));
  }

  // 使用 Promise.all 控制并发数量
  async function processBatch() {
    while (tasks.length) {
      const batch = tasks.splice(0, max);
      await Promise.allSettled(batch);
    }
  }

  // 处理所有请求任务
  await processBatch();

  // 当所有请求任务结束后，执行回调函数
  if (typeof callback === 'function') {
    callback();
  }
}
这个函数首先通过Set去除了重复的url，然后遍历所有的url创建异步请求任务。我们使用Promise.allSettled对任务进行分批处理，控制并发数量。最后，当所有请求任务结束后，执行回调函数。

您可以这样使用这个函数：

const urls = [
  '<https://jsonplaceholder.typicode.com/todos/1>',
  '<https://jsonplaceholder.typicode.com/todos/2>',
  '<https://jsonplaceholder.typicode.com/todos/3>',
];

sendRequest(urls, 2, () => {
  console.log('所有请求已完成');
});
请注意，fetch函数在浏览器环境中是可用的，但在Node.js环境中需要使用额外的库（如node-fetch）。

```

> 上面的代码有没有错误？

ChatGPT:

在这段代码中，有一个小问题：在 `processBatch` 函数中，使用了 `Promise.allSettled` 方法来控制并发数量。但是，`Promise.allSettled` 并没有限制并发数量的功能，它只是等待所有 Promise 都 settled（即变成 fulfilled 或 rejected 状态）后才返回结果。因此，在这里应该改用 `Promise.all` 方法来控制并发数量。

修改后的代码：

```js
async function processBatch() {
  while (tasks.length) {
    const batch = tasks.splice(0, max);
    await Promise.all(batch);
  }
}

```

这样就可以确保同时最多只有 `max` 个请求在进行了。

> 使用 Promise.all 会有个问题，比如最大并发是 5，当有一个 url 执行完成后，如果使用的是 Promise.all，那么就会有一个空位，直到其他 4 个执行完成

ChatGPT:

您说得没错，如果使用的是 `Promise.all`，当有一个请求任务完成后，由于其他请求还在进行中，因此会导致整个批处理任务无法结束。为了解决这个问题，可以使用一个计数器来记录已经完成的任务数量，当计数器达到了 URL 数组的长度时，说明所有请求都已经完成。

修改后的代码：

```js
async function processBatch() {
  let i = 0;
  while (i < uniqueUrls.length) {
    const batch = tasks.splice(0, max);
    await Promise.all(batch.map(task => task.then(() => i++)));
  }
}

```

这样就能够确保所有请求都被执行完毕，并且也能够控制最大并发数量。

> 我的意思是，当有一个 url 执行完成后，如何再往里面及时补充，而不是让它空缺。

ChatGPT：

好的，如果您希望在一个请求完成后立即启动下一个请求，而不让队列中有空缺，则可以将 `handleUrl` 函数中的 `processQueue()` 改为 `handleNextUrl()`。这样，每当处理完一个 URL 后，会立即调用 `handleNextUrl()` 函数来启动下一个请求。

修改后的代码：

```js
async function sendRequest(urls, max, callback) {
  const uniqueUrls = [...new Set(urls)];

  const results = [];
  let running = 0;
  let i = 0;

  async function handleUrl(url) {
    running++;
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("⭐data==>", data.id);
      results.push(data);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      results.push(null);
    }
    running--;
    handleNextUrl();
  }

  function handleNextUrl() {
    while (i < uniqueUrls.length && running < max) {
      handleUrl(uniqueUrls[i++]);
    }
    if (running === 0 && i === uniqueUrls.length && typeof callback === "function") {
      callback(results);
    }
  }

  handleNextUrl();
}

```

这样就能够保证队列中没有空闲位置，并且能够及时添加新的请求。

> 请把上面的请求模拟成 3s 的延时

ChatGPT:

好的，为了模拟异步请求，我们可以使用 `setTimeout` 来模拟一个 3 秒的延迟。修改后的代码如下：

```js
async function sendRequest(urls, max, callback) {
  const uniqueUrls = [...new Set(urls)];

  const results = [];
  let running = 0;
  let i = 0;

  async function handleUrl(url) {
    running++;
    try {
      // 模拟异步请求
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log(`Fetching ${url}...`);
      const data = { url };
      results.push(data);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      results.push(null);
    }
    running--;
    handleNextUrl();
  }

  function handleNextUrl() {
    while (i < uniqueUrls.length && running < max) {
      handleUrl(uniqueUrls[i++]);
    }
    if (running === 0 && i === uniqueUrls.length && typeof callback === "function") {
      callback(results);
    }
  }

  handleNextUrl();
}

```

在这个版本的代码中，我们使用了 `await new Promise(resolve => setTimeout(resolve, 3000))` 来模拟异步请求。这会使每个请求都有 3 秒的延迟，并且在完成时会将一个包含 URL 的数据添加到 `results` 数组中。

---

最后经过测试，确实完美执行。

![](/image/2023/2024-05-10-16-35-03.png)

完整代码如下：

```js
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function sendRequest(urls, max, callback) {
  const uniqueUrls = [...new Set(urls)];

  const results = [];
  let running = 0;
  let i = 0;

  async function handleUrl(url) {
    running++;
    console.log('⭐running==>', running);
    try {
      // 模拟异步请求
      await new Promise((resolve) => setTimeout(resolve, getRandomInt(100, 5000)));
      console.log(`Fetching ${url}...`);
      const data = { url };
      results.push(data);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      results.push(null);
    }
    running--;
    handleNextUrl();
  }

  function handleNextUrl() {
    while (i < uniqueUrls.length && running < max) {
      handleUrl(uniqueUrls[i++]);
    }
    if (running === 0 && i === uniqueUrls.length && typeof callback === 'function') {
      callback(results);
    }
  }

  handleNextUrl();
}

const urls = [
  '<https://jsonplaceholder.typicode.com/todos/1>',
  '<https://jsonplaceholder.typicode.com/todos/2>',
  '<https://jsonplaceholder.typicode.com/todos/3>',
  '<https://jsonplaceholder.typicode.com/todos/4>',
  '<https://jsonplaceholder.typicode.com/todos/5>',
  '<https://jsonplaceholder.typicode.com/todos/6>',
  '<https://jsonplaceholder.typicode.com/todos/7>',
  '<https://jsonplaceholder.typicode.com/todos/8>',
  '<https://jsonplaceholder.typicode.com/todos/9>',
  '<https://jsonplaceholder.typicode.com/todos/10>',
];

sendRequest(urls, 3, () => {
  console.log('所有请求已完成');
});
```

---

另一个并发控制思路：

并发控制原理：

1. 创建task，每个task返回的是一个Promise 函数
2. 创建MAX个task形成任务池
3. 创建一个runTask函数，从任务池中取出MAX个task并发，每个task在执行完后继续取下一个task执行，直到任务池为空
4. 使用一个共享的index变量，确保每个task取到的任务是唯一的，并可以判断任务池是否为空
5. 使用Promise.all等待所有task执行完毕

```js
/**
 * 并发控制函数
 * @param {Function[]} tasks - 存放 Promise 工厂函数的数组
 * @param {number} max - 最大并发量
 * @returns {Promise<any[]>} - 所有任务执行的结果（保持顺序）
 */
function concurrentRun(tasks, max) {
  const results = []; // 存储结果
  let index = 0; // 共享的索引，用于取出下一个任务

  // 递归执行任务的函数 (Worker)
  async function runTask() {
    // 如果索引超出了任务长度，说明没任务了，直接返回
    if (index >= tasks.length) return;

    // 1. 取出当前索引，并将全局索引 +1 (原子操作)
    const i = index++;
    const task = tasks[i];

    try {
      // 2. 执行任务，并保存结果到对应位置
      results[i] = await task();
    } catch (err) {
      // 捕获错误，防止整个 Promise.all 崩溃
      results[i] = err;
    }

    // 3. 当前任务完成后，递归调用自身，去取下一个任务
    await runTask();
  }

  // 4. 创建 max 个并发“线程” (如果任务少于 max，则只创建任务数量个)
  const workers = Array.from({ length: Math.min(tasks.length, max) }, () => runTask());

  // 5. 等待所有 worker 执行完毕
  return Promise.all(workers).then(() => results);
}

// ---以下是测试代码---

// 模拟一个异步请求：随机 1-3 秒返回
// 注意：tasks 数组里存放的必须是 Promise 工厂函数（即返回 Promise 的函数），而不是已经创建好的 Promise 对象。如果是 Promise 对象，它们在创建时就已经开始请求了，无法实现并发控制。
const createRequest = (id) => () =>
  new Promise((resolve) => {
    const time = 1000 + Math.random() * 2000;
    console.log(`开始任务: ${id}`);
    setTimeout(() => {
      console.log(`-- 完成任务: ${id} (耗时 ${(time / 1000).toFixed(1)}s)`);
      resolve(`Result ${id}`);
    }, time);
  });

// 生成 10 个任务
const tasks = Array.from({ length: 10 }, (_, i) => createRequest(i + 1));

// 执行并发：最大并发数为 3
console.log(`准备执行 10 个任务，最大并发 3...`);
concurrentRun(tasks, 3).then((data) => {
  console.log('所有任务完成:', data);
});


```
还可以继续完善，比如增加错误重试等。


