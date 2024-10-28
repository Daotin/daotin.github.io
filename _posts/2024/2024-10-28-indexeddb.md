---
layout: mypost
title: indexeddb封装库选型研究
tags: [javascript]
---

## 背景

原生的 indexeddb 写法很复杂麻烦，所以选择一个类似 localStorage 的写法的封装库很有必要。

indexeddb 阮一峰的教程：https://www.ruanyifeng.com/blog/2018/07/indexeddb.html

原生的 indexeddb 写法：

```js
// 打开数据库
let request = indexedDB.open('MyTestDatabase', 1);

request.onupgradeneeded = function (event) {
  let db = event.target.result;

  // 创建对象存储
  let objectStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });

  // 创建索引
  objectStore.createIndex('name', 'name', { unique: false });
  objectStore.createIndex('email', 'email', { unique: true });
};

request.onsuccess = function (event) {
  let db = event.target.result;

  // 添加数据
  let transaction = db.transaction(['customers'], 'readwrite');
  let objectStore = transaction.objectStore('customers');
  let customer = { name: 'John Doe', email: 'john.doe@example.com' };
  let addRequest = objectStore.add(customer);

  addRequest.onsuccess = function (event) {
    console.log('数据添加成功');

    // 读取数据
    let getRequest = objectStore.get(event.target.result);
    getRequest.onsuccess = function (event) {
      console.log('读取的数据: ', event.target.result);

      // 更新数据
      let updatedCustomer = event.target.result;
      updatedCustomer.name = 'Jane Doe';
      let updateRequest = objectStore.put(updatedCustomer);

      updateRequest.onsuccess = function (event) {
        console.log('数据更新成功');

        // 删除数据
        let deleteRequest = objectStore.delete(event.target.result.id);
        deleteRequest.onsuccess = function (event) {
          console.log('数据删除成功');
        };
      };
    };
  };
};

request.onerror = function (event) {
  console.error('数据库打开失败: ', event.target.errorCode);
};
```

是不是看的头大！

## indexeddb 封装库选型

目前有这几个比较火的封装库：`localforage`，`dexie`，`idb`，`idb-keyval`

这几个的 npm 对比：https://npm-compare.com/dexie,idb,idb-keyval,localforage

简单总结下：

以下是 `localForage`、`Dexie.js`、`idb` 和 `idb-keyval` 的区别、优缺点及适用场景对比：

| 库              | 简介                                           | 优点                                         | 缺点                               | 适用场景                            |
| --------------- | ---------------------------------------------- | -------------------------------------------- | ---------------------------------- | ----------------------------------- |
| **localForage** | 封装多种存储方式（IndexedDB、LocalStorage 等） | 简单易用，兼容性好；自动选择最佳存储方式     | 不支持对象存储，多实例管理复杂     | 简单数据存储，兼容性要求高的项目    |
| **Dexie.js**    | 功能丰富的 IndexedDB 封装库                    | 支持事务、多对象存储；API 简洁；支持复杂查询 | 体积较大，学习曲线稍陡             | 复杂数据管理、多表结构的应用        |
| **idb**         | 接近原生 IndexedDB API 的轻量封装              | 轻量，Promise API；较高性能                  | 需熟悉 IndexedDB，复杂查询支持有限 | 对性能要求高，熟悉 IndexedDB 的项目 |
| **idb-keyval**  | 简单的 key-value 存储库                        | 极简 API，轻量，快速上手                     | 仅支持单一存储，不支持多对象存储   | 简单键值对存储，快速开发的小项目    |

## 选择

> 如果要支持类似表格查询的不同字段的查询，可以使用哪几个？

要支持类似表格查询、根据字段查询等功能，推荐使用 **Dexie.js** 或 **idb**，因为它们支持多字段查询和索引。

- **Dexie.js**：特别适合复杂查询，支持链式查询、范围查询、索引等，类似 SQL 的查询语法，适合较复杂的数据表结构。
- **idb**：虽然相对接近原生 IndexedDB，但它提供索引查询，支持更复杂的数据查找操作。

**localForage** 和 **idb-keyval** 更适合简单键值存储，不支持多字段复杂查询。而且，localForage 本身并不支持直接创建多个对象存储（object store）。它封装了一个简单的 API，适合单一存储需求。但可以通过创建不同的 localForage 实例来实现类似多个对象存储的效果。

而 idb 写法类型 indexeddb，太复杂，所以最终选择 Dexie.js。
