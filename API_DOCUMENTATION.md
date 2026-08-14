# 校园论坛 - 接口文档

## 概述

本文档定义了校园论坛系统的后端 API 接口规范、数据库表结构设计及请求/响应数据格式。后端基于 Spring Boot + MySQL，端口 8090。

## 前端已使用的接口

**重要说明**：前端代码已通过 `src/utils/api.js` 统一封装层复用以下原始接口，后端不可用时自动降级到 mock 数据。

### 原始接口（已实现）

| 接口 | 方法 | 使用页面 | 说明 |
|------|------|----------|------|
| `/admin/user/login` | POST | 登录页 | 用户登录 |
| `/admin/user/info` | GET | 个人主页、导航栏 | 获取当前用户信息 |
| `/admin/user/change` | POST | 个人设置 | 修改用户信息 |
| `/admin/article/list` | GET | 首页、文章详情、搜索页、个人主页 | 获取文章列表 |
| `/admin/article/add` | POST | 写文章页 | 发布文章 |
| `/admin/article/update` | POST | 编辑文章 | 修改文章内容 |
| `/admin/article/delete/{id}` | DELETE | 文章管理 | 删除文章 |
| `/admin/upload` | POST | 写文章页、评论 | 上传文件（封面/图片） |

### 新增接口（预留，需后端实现）

| 接口 | 方法 | 使用页面 | 说明 |
|------|------|----------|------|
| `/admin/article/like` | POST | 文章详情、首页 | 点赞/取消点赞 |
| `/admin/article/view` | POST | 文章详情 | 增加浏览量 |
| `/admin/article/collect` | POST | 文章详情、首页 | 收藏/取消收藏 |
| `/admin/article/hot` | GET | 首页热榜、发现页、侧边栏 | 热榜（按浏览量排名） |
| `/admin/article/random` | GET | 发现页 | 随机返回文章 |
| `/admin/article/comment/{articleId}` | GET | 文章详情 | 获取文章评论列表 |
| `/admin/article/comment` | POST | 文章详情 | 发表评论（支持图片） |
| `/admin/article/draft` | POST | 写文章页 | 保存草稿 |
| `/admin/article/draft` | GET | 写文章页 | 加载草稿 |
| `/admin/user/follow` | POST | 文章详情、首页、搜索页 | 关注/取消关注用户 |
| `/admin/user/following` | GET | 首页关注Tab、个人主页 | 获取关注列表 |
| `/admin/user/followers` | GET | 个人主页 | 获取粉丝列表 |
| `/admin/user/like/{userId}` | GET | 个人主页 | 获取用户点赞过的文章 |
| `/admin/user/info/{id}` | GET | 个人主页 | 获取指定用户信息 |

**数据降级策略**：
- 所有接口调用优先尝试真实后端（代理到 `http://127.0.0.1:8090`）
- 后端不可用时自动返回 mock 数据，保证页面正常显示
- mock 数据定义在 `src/utils/mockData.js`

## 基础信息

- **基础 URL**: `http://127.0.0.1:8090`
- **认证方式**: Token 认证（通过请求头 `token` 字段传递）
- **数据格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

```json
{
  "code": 1,        // 状态码：1 或 200 表示成功，其他表示失败
  "msg": "success", // 响应消息
  "data": {}        // 响应数据
}
```

---

## 1. 用户认证模块

### 1.1 用户登录

**接口**: `POST /admin/user/login`

**描述**: 用户登录系统，获取访问令牌

**请求参数**:
```json
{
  "username": "string",  // 用户名（必填）
  "password": "string"   // 密码（必填）
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "username": "张三",
    "avatar": "https://example.com/avatar.jpg",
    "email": "zhangsan@example.com"
  }
}
```

---

### 1.2 获取用户信息

**接口**: `GET /admin/user/info`

**描述**: 获取当前登录用户的详细信息

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "id": 1,
    "username": "张三",
    "name": "张三",
    "email": "zhangsan@example.com",
    "bio": "全栈开发工程师 | 热爱开源",
    "avatar": "https://example.com/avatar.jpg",
    "background": "https://example.com/background.jpg",
    "location": "北京",
    "createTime": [2024, 1, 15],
    "followers": 1234,
    "following": 56,
    "articles": 89
  }
}
```

---

### 1.3 修改用户信息

**接口**: `POST /admin/user/change`

**描述**: 修改当前登录用户的个人信息

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**请求参数**:
```json
{
  "username": "string",      // 昵称（必填）
  "email": "string",         // 邮箱（必填）
  "location": "string",      // 所在地（可选）
  "bio": "string",           // 个性签名（可选）
  "avatar": "string",        // 头像 URL（可选）
  "background": "string"     // 背景图 URL（可选）
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "修改成功",
  "data": null
}
```

---

## 2. 文章模块

### 2.1 获取文章列表

**接口**: `GET /admin/article/list`

**描述**: 获取文章列表，支持分页和过滤

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 10）
- `type`: 文章类型（可选：`shuoshuo` | `article`）
- `tag`: 标签过滤（可选）

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": [
    {
      "id": 101,
      "title": "Vue 3 Composition API 最佳实践",
      "content": "Vue 3 引入了 Composition API...",
      "summary": "Vue 3 引入了 Composition API，这是一种全新的组织组件逻辑的方式...",
      "author": {
        "id": 1,
        "username": "张三",
        "avatar": "https://example.com/avatar.jpg",
        "bio": "全栈开发工程师 | 热爱开源"
      },
      "cover": "https://example.com/cover.jpg",
      "tags": ["Vue.js", "前端开发", "JavaScript"],
      "type": "article",
      "likes": 234,
      "comments": 45,
      "views": 5678,
      "createTime": "2024-01-15 10:30",
      "isLiked": false
    }
  ]
}
```

---

### 2.2 获取文章详情

**接口**: `GET /admin/article/{id}`

**描述**: 根据文章 ID 获取文章详细信息

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
- `id`: 文章 ID

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "id": 101,
    "title": "Vue 3 Composition API 最佳实践",
    "content": "完整文章内容...",
    "summary": "文章摘要...",
    "author": {
      "id": 1,
      "username": "张三",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "全栈开发工程师 | 热爱开源",
      "followers": 1234
    },
    "cover": "https://example.com/cover.jpg",
    "tags": ["Vue.js", "前端开发"],
    "type": "article",
    "likes": 234,
    "comments": 45,
    "views": 5678,
    "createTime": "2024-01-15 10:30",
    "isLiked": false,
    "isFollowed": false
  }
}
```

---

### 2.3 发布文章

**接口**: `POST /admin/article/add`

**描述**: 发布新文章或说说

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**请求参数**:
```json
{
  "title": "string",           // 标题（文章模式必填）
  "content": "string",         // 内容（必填）
  "images": "string",          // 图片 URL，多个用逗号分隔（可选）
  "videos": "string",          // 视频 URL，多个用逗号分隔（可选）
  "cover": "string",           // 封面图 URL（可选）
  "type": "string"             // 类型：`shuoshuo` | `article`（必填）
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "发表成功",
  "data": {
    "id": 104,
    "title": "新文章标题",
    "createTime": "2024-01-16 14:20"
  }
}
```

---

### 2.4 修改文章

**接口**: `POST /admin/article/update`

**描述**: 修改已有文章

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**请求参数**:
```json
{
  "id": 101,                 // 文章 ID（必填）
  "title": "string",         // 标题（可选）
  "content": "string",       // 内容（可选）
  "images": "string",        // 图片 URL（可选）
  "videos": "string"         // 视频 URL（可选）
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "修改成功",
  "data": null
}
```

---

### 2.5 删除文章

**接口**: `DELETE /admin/article/delete/{id}`

**描述**: 删除指定文章

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
- `id`: 文章 ID

**响应示例**:
```json
{
  "code": 1,
  "msg": "删除成功",
  "data": null
}
```

---

## 3. 评论模块

### 3.1 获取评论列表

**接口**: `GET /admin/comment/list`

**描述**: 获取指定文章的评论列表

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
- `articleId`: 文章 ID（必填）
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 20）

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": [
    {
      "id": 1001,
      "articleId": 101,
      "author": {
        "id": 2,
        "username": "李四",
        "avatar": "https://example.com/avatar2.jpg"
      },
      "content": "写得非常好！",
      "likes": 23,
      "createTime": "2024-01-15 12:00",
      "isLiked": false,
      "replies": [
        {
          "id": 10011,
          "author": {
            "id": 1,
            "username": "张三",
            "avatar": "https://example.com/avatar1.jpg"
          },
          "content": "谢谢支持！",
          "likes": 5,
          "createTime": "2024-01-15 13:30",
          "isLiked": false
        }
      ]
    }
  ]
}
```

---

### 3.2 发表评论

**接口**: `POST /admin/comment/add`

**描述**: 对指定文章发表评论

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**请求参数**:
```json
{
  "articleId": 101,          // 文章 ID（必填）
  "content": "string",       // 评论内容（必填）
  "parentId": null           // 父评论 ID，用于回复评论（可选）
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "评论成功",
  "data": {
    "id": 1002,
    "createTime": "2024-01-15 14:20"
  }
}
```

---

### 3.3 删除评论

**接口**: `DELETE /admin/comment/delete/{id}`

**描述**: 删除指定评论

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
- `id`: 评论 ID

**响应示例**:
```json
{
  "code": 1,
  "msg": "删除成功",
  "data": null
}
```

---

## 4. 互动模块

### 4.1 点赞文章

**接口**: `POST /admin/article/like`

**描述**: 对文章点赞或取消点赞

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**请求参数**:
```json
{
  "articleId": 101,          // 文章 ID（必填）
  "action": "like"           // 操作：`like`（点赞）| `cancel`（取消）
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "操作成功",
  "data": {
    "likes": 235
  }
}
```

---

### 4.2 点赞评论

**接口**: `POST /admin/comment/like`

**描述**: 对评论点赞或取消点赞

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**请求参数**:
```json
{
  "commentId": 1001,         // 评论 ID（必填）
  "action": "like"           // 操作：`like`（点赞）| `cancel`（取消）
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "操作成功",
  "data": {
    "likes": 24
  }
}
```

---

### 4.3 关注用户

**接口**: `POST /admin/user/follow`

**描述**: 关注或取消关注用户

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**请求参数**:
```json
{
  "userId": 2,               // 用户 ID（必填）
  "action": "follow"         // 操作：`follow`（关注）| `unfollow`（取消关注）
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "操作成功",
  "data": {
    "followers": 1235
  }
}
```

---

## 5. 搜索模块

### 5.1 综合搜索

**接口**: `GET /admin/search`

**描述**: 搜索文章、用户、话题

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
- `q`: 搜索关键词（必填）
- `type`: 搜索类型（可选：`all` | `articles` | `users` | `tags`，默认 `all`）
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 10）

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "articles": [
      {
        "id": 101,
        "title": "Vue 3 Composition API 最佳实践",
        "summary": "文章摘要...",
        "author": {
          "id": 1,
          "username": "张三"
        },
        "createTime": "2024-01-15 10:30",
        "likes": 234
      }
    ],
    "users": [
      {
        "id": 1,
        "username": "张三",
        "avatar": "https://example.com/avatar.jpg",
        "bio": "全栈开发工程师",
        "followers": 1234,
        "articles": 89
      }
    ],
    "tags": [
      {
        "id": 1,
        "name": "Vue.js",
        "articles": 1234
      }
    ]
  }
}
```

---

## 6. 文件上传模块

### 6.1 上传文件

**接口**: `POST /admin/upload`

**描述**: 上传图片或视频文件

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**请求参数**:
- `file`: 文件对象（必填，支持图片：jpg/png/gif，视频：mp4/webm）

**响应示例**:
```json
{
  "code": 1,
  "msg": "上传成功",
  "data": "https://example.com/uploads/2024/01/15/image.jpg"
}
```

---

## 7. 热榜模块

### 7.1 获取热榜

**接口**: `GET /admin/hot/list`

**描述**: 获取热门话题榜单

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
- `limit`: 返回数量（默认 10）

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "title": "Vue 3.4 发布，性能提升 30%",
      "hot": 1234567
    }
  ]
}
```

---

## 8. 通知模块

### 8.1 获取通知列表

**接口**: `GET /admin/notification/list`

**描述**: 获取用户通知列表

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 20）

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "type": "like",
      "user": {
        "id": 2,
        "username": "李四",
        "avatar": "https://example.com/avatar2.jpg"
      },
      "article": {
        "id": 101,
        "title": "Vue 3 Composition API 最佳实践"
      },
      "createTime": "2024-01-15 15:30",
      "isRead": false
    }
  ]
}
```

---

### 8.2 标记通知已读

**接口**: `POST /admin/notification/read`

**描述**: 标记通知为已读状态

**请求头**:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**请求参数**:
```json
{
  "notificationIds": [1, 2, 3]  // 通知 ID 数组（必填，传空数组表示全部已读）
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "操作成功",
  "data": null
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 1      | 成功 |
| 200    | 成功 |
| 400    | 请求参数错误 |
| 401    | 未授权，需要登录 |
| 403    | 无权限访问 |
| 404    | 资源不存在 |
| 500    | 服务器内部错误 |

---

## 9. 用户注册模块

### 9.1 用户注册

**接口**: `POST /admin/user/register`

**描述**: 注册新用户

**请求参数**:
```json
{
  "username": "string",        // 用户名（必填）
  "email": "string",           // 邮箱（必填）
  "password": "string"         // 密码（必填）
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "注册成功",
  "data": {
    "userId": 4,
    "username": "新用户"
  }
}
```

---

## 认证说明

1. 用户登录后，后端返回 `token`
2. 前端将 `token` 存储在 `localStorage` 中
3. 需要认证的接口，在请求头中添加 `token` 字段
4. Token 过期时间由后端控制，前端需在 401 错误时跳转登录页

---

## 注意事项

1. 所有 POST 请求需设置 `Content-Type: application/json`
2. 文件上传使用 `multipart/form-data` 格式
3. 图片 URL 多个时用逗号分隔存储
4. 时间格式统一使用 `YYYY-MM-DD HH:mm` 或时间戳数组 `[year, month, day]`
5. 分页参数从 1 开始计数

---

## 新增接口详细定义

### 点赞/取消点赞文章

**接口**: `POST /admin/article/like`

**请求头**: `token: xxx`

**请求参数**:
```json
{
  "articleId": 101
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "点赞成功",
  "data": { "likes": 235 }
}
```

---

### 增加文章浏览量

**接口**: `POST /admin/article/view`

**请求头**: `token: xxx`

**请求参数**:
```json
{
  "articleId": 101
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": { "views": 5679 }
}
```

---

### 获取热榜（按浏览量排名）

**接口**: `GET /admin/article/hot`

**描述**: 返回浏览量最高的文章列表，用于热榜展示

**请求头**: `token: xxx`

**查询参数**:
- `limit`: 返回数量（默认 10）

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": [
    {
      "id": 101,
      "title": "Vue 3 Composition API 最佳实践",
      "views": 5678,
      "likes": 234,
      "author": {
        "id": 1,
        "username": "张三",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

---

### 获取文章评论列表

**接口**: `GET /admin/article/comment/{articleId}`

**请求头**: `token: xxx`

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": [
    {
      "id": 1001,
      "articleId": 101,
      "author": {
        "id": 2,
        "username": "李四",
        "avatar": "https://example.com/avatar2.jpg"
      },
      "content": "写得很好，学到了！",
      "image": "",
      "likes": 12,
      "createTime": "2024-01-15 14:30",
      "isLiked": false,
      "replies": [
        {
          "id": 1002,
          "author": { "id": 1, "username": "张三" },
          "content": "谢谢支持！",
          "createTime": "2024-01-15 15:00"
        }
      ]
    }
  ]
}
```

---

### 发表评论（支持图片）

**接口**: `POST /admin/article/comment`

**请求头**: `token: xxx`

**请求参数**:
```json
{
  "articleId": 101,
  "content": "评论内容",
  "image": "https://example.com/comment-image.jpg",
  "parentId": null
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "评论成功",
  "data": {
    "id": 1003,
    "articleId": 101,
    "content": "评论内容",
    "image": "https://example.com/comment-image.jpg"
  }
}
```

---

### 关注/取消关注用户

**接口**: `POST /admin/user/follow`

**请求头**: `token: xxx`

**请求参数**:
```json
{
  "userId": 2
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "关注成功",
  "data": null
}
```

---

### 获取关注列表

**接口**: `GET /admin/user/following`

**请求头**: `token: xxx`

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": [
    {
      "id": 2,
      "username": "李四",
      "avatar": "https://example.com/avatar2.jpg",
      "bio": "前端开发工程师"
    }
  ]
}
```

---

### 获取随机文章（发现模块）

**接口**: `GET /admin/article/random`

**描述**: 随机返回数据库中的文章，用于发现页展示

**请求头**: `token: xxx`

**查询参数**:
- `limit`: 返回数量（默认 10）

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": [
    {
      "id": 105,
      "title": "随机文章标题",
      "content": "文章内容...",
      "summary": "文章摘要...",
      "cover": "https://example.com/cover.jpg",
      "views": 1234,
      "likes": 56,
      "comments": 12,
      "author": {
        "id": 3,
        "username": "王五",
        "avatar": "https://example.com/avatar3.jpg"
      },
      "tags": ["Vue.js", "前端"],
      "createTime": "2024-01-16 09:00"
    }
  ]
}
```

---

### 收藏/取消收藏文章

**接口**: `POST /admin/article/collect`

**描述**: 对文章收藏或取消收藏（切换模式）

**请求头**: `token: xxx`，`Content-Type: application/json`

**请求参数**:
```json
{
  "articleId": 101
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "收藏成功",
  "data": null
}
```

---

### 保存草稿

**接口**: `POST /admin/article/draft`

**描述**: 保存当前编辑内容为草稿

**请求头**: `token: xxx`，`Content-Type: application/json`

**请求参数**:
```json
{
  "title": "string",
  "content": "string",
  "cover": "string",
  "tags": "string"
}
```

**响应示例**:
```json
{
  "code": 1,
  "msg": "保存成功",
  "data": { "id": 1 }
}
```

---

### 加载草稿

**接口**: `GET /admin/article/draft`

**描述**: 获取当前用户的最新草稿

**请求头**: `token: xxx`

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "id": 1,
    "title": "草稿标题",
    "content": "草稿内容...",
    "cover": "https://example.com/cover.jpg",
    "tags": "Vue.js, 前端",
    "updateTime": "2024-01-16 14:00"
  }
}
```

---

### 获取用户点赞过的文章

**接口**: `GET /admin/user/like/{userId}`

**描述**: 获取指定用户点赞过的文章列表，直接返回文章数组

**请求头**: `token: xxx`

**路径参数**:
- `userId`: 用户 ID（整数）

**响应示例**:
```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "id": 2,
      "title": "这是第二篇测试博文",
      "content": "接下来加入修改功能\n修改功能已添加",
      "summary": null,
      "images": [
        "https://mywebpro.oss-cn-beijing.aliyuncs.com/413307ee-6557-4652-9629-51f96a438949.jpg"
      ],
      "videos": [],
      "cover": null,
      "type": "shuoshuo",
      "author": {
        "id": 1,
        "username": "莲莲",
        "avatar": "https://mywebpro.oss-cn-beijing.aliyuncs.com/91fe53d4-36b0-4973-a05f-63c426988688.jpg",
        "bio": "学习ing....",
        "followers": null
      },
      "tags": null,
      "likes": 1,
      "comments": 0,
      "views": 0,
      "createTime": "2026-04-29 18:55",
      "isLiked": true,
      "isFollowed": false
    }
  ]
}
```

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int | 文章 ID |
| `title` | string | 文章标题 |
| `content` | string | 文章内容 |
| `summary` | string/null | 文章摘要 |
| `images` | array | 配图 URL 数组 |
| `videos` | array | 视频 URL 数组 |
| `cover` | string/null | 封面图 URL |
| `type` | string | 文章类型（article/shuoshuo） |
| `author` | object | 作者信息（id, username, avatar, bio, followers） |
| `tags` | string/null | 标签 |
| `likes` | int | 点赞数 |
| `comments` | int | 评论数 |
| `views` | int | 浏览量 |
| `createTime` | string | 创建时间（yyyy-MM-dd HH:mm） |
| `isLiked` | boolean | 当前用户是否已赞 |
| `isFollowed` | boolean | 当前用户是否已关注作者 |

---

### 获取粉丝列表

**接口**: `GET /admin/user/followers`

**描述**: 获取当前用户的粉丝列表

**请求头**: `token: xxx`

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": [
    {
      "id": 3,
      "username": "王五",
      "avatar": "https://example.com/avatar3.jpg",
      "bio": "前端爱好者",
      "isFollowedBack": false
    }
  ]
}
```

---

### 获取指定用户信息

**接口**: `GET /admin/user/info/{id}`

**描述**: 根据用户 ID 获取该用户的公开信息（用于他人主页）

**请求头**: `token: xxx`

**路径参数**:
- `id`: 用户 ID

**响应示例**:
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "id": 2,
    "username": "李四",
    "name": "李四",
    "bio": "全栈开发工程师",
    "avatar": "https://example.com/avatar2.jpg",
    "background": "https://example.com/bg.jpg",
    "email": "lisi@example.com",
    "location": "上海",
    "createTime": [2024, 1, 10],
    "followers": 500,
    "following": 100,
    "articles": 30
  }
}
```

---

## 数据库表结构设计

> 以下为推荐的 MySQL 数据库表结构，与上述接口一一对应。

### 1. 用户表 `user`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 用户 ID |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | 用户名/昵称 |
| `password` | VARCHAR(255) | NOT NULL | 密码（加密存储） |
| `email` | VARCHAR(100) | UNIQUE | 邮箱 |
| `bio` | VARCHAR(500) | DEFAULT '' | 个性签名 |
| `avatar` | VARCHAR(500) | DEFAULT '' | 头像 URL |
| `background` | VARCHAR(500) | DEFAULT '' | 背景图 URL |
| `location` | VARCHAR(100) | DEFAULT '' | 所在地 |
| `create_time` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 注册时间 |
| `update_time` | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

```sql
CREATE TABLE `user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) UNIQUE,
  `bio` VARCHAR(500) DEFAULT '',
  `avatar` VARCHAR(500) DEFAULT '',
  `background` VARCHAR(500) DEFAULT '',
  `location` VARCHAR(100) DEFAULT '',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 2. 文章表 `article`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 文章 ID |
| `user_id` | BIGINT | FK → user.id, NOT NULL | 作者 ID |
| `title` | VARCHAR(200) | DEFAULT '' | 标题 |
| `content` | TEXT | | 内容 |
| `summary` | VARCHAR(500) | DEFAULT '' | 摘要（可自动生成） |
| `cover` | VARCHAR(500) | DEFAULT '' | 封面图 URL |
| `images` | TEXT | | 图片 URL，逗号分隔 |
| `videos` | TEXT | | 视频 URL，逗号分隔 |
| `tags` | VARCHAR(500) | DEFAULT '' | 标签，逗号分隔 |
| `type` | VARCHAR(20) | DEFAULT 'article' | 类型：article / shuoshuo |
| `likes` | INT | DEFAULT 0 | 点赞数 |
| `comments` | INT | DEFAULT 0 | 评论数 |
| `views` | INT | DEFAULT 0 | 浏览量 |
| `create_time` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 发布时间 |
| `update_time` | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

```sql
CREATE TABLE `article` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `title` VARCHAR(200) DEFAULT '',
  `content` TEXT,
  `summary` VARCHAR(500) DEFAULT '',
  `cover` VARCHAR(500) DEFAULT '',
  `images` TEXT,
  `videos` TEXT,
  `tags` VARCHAR(500) DEFAULT '',
  `type` VARCHAR(20) DEFAULT 'article',
  `likes` INT DEFAULT 0,
  `comments` INT DEFAULT 0,
  `views` INT DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 3. 评论表 `comment`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 评论 ID |
| `article_id` | BIGINT | FK → article.id, NOT NULL | 文章 ID |
| `user_id` | BIGINT | FK → user.id, NOT NULL | 评论者 ID |
| `parent_id` | BIGINT | DEFAULT NULL | 父评论 ID（回复时用） |
| `content` | TEXT | NOT NULL | 评论内容 |
| `image` | VARCHAR(500) | DEFAULT '' | 评论图片 URL |
| `likes` | INT | DEFAULT 0 | 点赞数 |
| `create_time` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 评论时间 |

```sql
CREATE TABLE `comment` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `article_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `parent_id` BIGINT DEFAULT NULL,
  `content` TEXT NOT NULL,
  `image` VARCHAR(500) DEFAULT '',
  `likes` INT DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 4. 点赞表 `user_like`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 主键 |
| `user_id` | BIGINT | FK → user.id, NOT NULL | 用户 ID |
| `article_id` | BIGINT | FK → article.id, NOT NULL | 文章 ID |
| `create_time` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 点赞时间 |

```sql
CREATE TABLE `user_like` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `article_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_article` (`user_id`, `article_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 5. 关注关系表 `user_follow`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 主键 |
| `follower_id` | BIGINT | FK → user.id, NOT NULL | 粉丝 ID（谁关注了） |
| `following_id` | BIGINT | FK → user.id, NOT NULL | 被关注用户 ID |
| `create_time` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 关注时间 |

```sql
CREATE TABLE `user_follow` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `follower_id` BIGINT NOT NULL,
  `following_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_follower_following` (`follower_id`, `following_id`),
  FOREIGN KEY (`follower_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`following_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 6. 收藏表 `user_collect`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 主键 |
| `user_id` | BIGINT | FK → user.id, NOT NULL | 用户 ID |
| `article_id` | BIGINT | FK → article.id, NOT NULL | 文章 ID |
| `create_time` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 收藏时间 |

```sql
CREATE TABLE `user_collect` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `article_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_article` (`user_id`, `article_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 7. 通知表 `notification`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 通知 ID |
| `user_id` | BIGINT | FK → user.id, NOT NULL | 接收者 ID |
| `from_user_id` | BIGINT | FK → user.id, NOT NULL | 触发者 ID |
| `type` | VARCHAR(20) | NOT NULL | 类型：like / comment / follow |
| `article_id` | BIGINT | DEFAULT NULL | 关联文章 ID（follow 时为 NULL） |
| `content` | VARCHAR(500) | DEFAULT '' | 通知内容（如评论内容） |
| `is_read` | TINYINT(1) | DEFAULT 0 | 是否已读：0未读 1已读 |
| `create_time` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 通知时间 |

```sql
CREATE TABLE `notification` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `from_user_id` BIGINT NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `article_id` BIGINT DEFAULT NULL,
  `content` VARCHAR(500) DEFAULT '',
  `is_read` TINYINT(1) DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`from_user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 8. 草稿表 `draft`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 草稿 ID |
| `user_id` | BIGINT | FK → user.id, NOT NULL | 用户 ID |
| `title` | VARCHAR(200) | DEFAULT '' | 标题 |
| `content` | TEXT | | 内容 |
| `cover` | VARCHAR(500) | DEFAULT '' | 封面图 URL |
| `tags` | VARCHAR(500) | DEFAULT '' | 标签 |
| `create_time` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_time` | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

```sql
CREATE TABLE `draft` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `title` VARCHAR(200) DEFAULT '',
  `content` TEXT,
  `cover` VARCHAR(500) DEFAULT '',
  `tags` VARCHAR(500) DEFAULT '',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 表关系图

```
user (1) ──────< (N) article
  │                    │
  │                    │
  │ (1)             (N)│
  │                    │
  ├──────< (N) comment >──────┘
  │                    │
  ├──────< (N) user_like  >──────┘
  │                    │
  ├──────< (N) user_collect>──────┘
  │
  ├──────< (N) user_follow (follower_id → following_id)
  │
  └──────< (N) notification
```

---

### 索引建议

```sql
-- 文章表：按浏览量排序（热榜）
CREATE INDEX idx_article_views ON article(views DESC);

-- 文章表：按用户查询
CREATE INDEX idx_article_user ON article(user_id);

-- 文章表：按时间排序
CREATE INDEX idx_article_time ON article(create_time DESC);

-- 评论表：按文章查询
CREATE INDEX idx_comment_article ON comment(article_id);

-- 点赞表：按用户查询（喜欢的文章）
CREATE INDEX idx_like_user ON user_like(user_id);

-- 关注表：按粉丝/关注查询
CREATE INDEX idx_follow_follower ON user_follow(follower_id);
CREATE INDEX idx_follow_following ON user_follow(following_id);

-- 通知表：按用户+未读查询
CREATE INDEX idx_notif_user ON notification(user_id, is_read);

-- 草稿表：按用户查询
CREATE INDEX idx_draft_user ON draft(user_id);
```

---
---

## 新增接口（2026-07-04 补充）

> 以下为后续开发中新增的接口，与上方文档以时间分隔。

---

### 1. 搜索用户

**接口**: `GET /admin/user/search?keyword={keyword}`

**描述**: 根据关键词搜索用户，匹配用户名或个人简介

**请求头**: `token: xxx`

**查询参数**:
- `keyword`: 搜索关键词（必填，URL 编码）

**响应示例**:
```json
{
  "code": 1,
  "data": [
    {
      "id": 2,
      "username": "root",
      "avatar": "",
      "bio": "学习ing....",
      "isFollowed": false
    }
  ]
}
```

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int | 用户 ID |
| `username` | string | 用户名 |
| `avatar` | string | 头像 URL |
| `bio` | string | 个性签名 |
| `isFollowed` | boolean | 当前用户是否已关注该用户 |

---

### 2. 获取热榜文章

**接口**: `GET /admin/article/hot`

**描述**: 获取热榜文章列表，按浏览量降序排列。若后端无此接口，前端自动降级为使用文章列表按浏览量排序。

**请求头**: `token: xxx`

**响应示例**:
```json
{
  "code": 1,
  "data": [
    {
      "id": 2,
      "title": "这是第二篇测试博文",
      "content": "接下来加入修改功能\n修改功能已添加",
      "cover": null,
      "images": [],
      "videos": [],
      "type": "shuoshuo",
      "author": {
        "id": 1,
        "username": "莲莲",
        "avatar": "https://mywebpro.oss-cn-beijing.aliyuncs.com/xxx.jpg",
        "bio": "学习ing....",
        "followers": null
      },
      "likes": 1,
      "comments": 0,
      "views": 5,
      "createTime": "2026-04-29 18:55",
      "isLiked": true,
      "isFollowed": false
    }
  ]
}
```

**说明**: 响应格式与文章列表接口 `/admin/article/list` 一致，仅按 `views` 降序排序。

---

### 3. 获取用户点赞过的文章（路径修正）

**接口**: `GET /admin/user/like/{userId}`

**描述**: 获取指定用户点赞过的文章列表，直接返回文章数组（无分页包装）。

**请求头**: `token: xxx`

**路径参数**:
- `userId`: 用户 ID（整数）

**响应示例**:
```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "id": 2,
      "title": "这是第二篇测试博文",
      "content": "接下来加入修改功能\n修改功能已添加",
      "summary": null,
      "images": [
        "https://mywebpro.oss-cn-beijing.aliyuncs.com/xxx.jpg"
      ],
      "videos": [],
      "cover": null,
      "type": "shuoshuo",
      "author": {
        "id": 1,
        "username": "莲莲",
        "avatar": "https://mywebpro.oss-cn-beijing.aliyuncs.com/xxx.jpg",
        "bio": "学习ing....",
        "followers": null
      },
      "tags": null,
      "likes": 1,
      "comments": 0,
      "views": 0,
      "createTime": "2026-04-29 18:55",
      "isLiked": true,
      "isFollowed": false
    }
  ]
}
```

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int | 文章 ID |
| `title` | string | 文章标题 |
| `content` | string | 文章内容 |
| `summary` | string/null | 文章摘要 |
| `images` | array | 配图 URL 数组 |
| `videos` | array | 视频 URL 数组 |
| `cover` | string/null | 封面图 URL |
| `type` | string | 文章类型（article/shuoshuo） |
| `author` | object | 作者信息（id, username, avatar, bio, followers） |
| `tags` | string/null | 标签 |
| `likes` | int | 点赞数 |
| `comments` | int | 评论数 |
| `views` | int | 浏览量 |
| `createTime` | string | 创建时间（yyyy-MM-dd HH:mm） |
| `isLiked` | boolean | 当前用户是否已赞 |
| `isFollowed` | boolean | 当前用户是否已关注作者 |

---

## 10. 交易平台模块

### 10.1 获取二手商品列表

**接口**: `GET /admin/trade/item/list`

**请求头**: `token: xxx`

**查询参数**:
- `category`: 分类筛选（可选）
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 20）

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int | 商品 ID |
| `title` | string | 商品标题 |
| `description` | string | 商品描述 |
| `price` | number | 售价 |
| `originalPrice` | number | 原价 |
| `images` | array | 商品图片 URL 数组 |
| `category` | string | 分类 |
| `condition` | string | 成色 |
| `seller` | object | 卖家信息 |
| `views` | int | 浏览次数 |
| `likes` | int | 收藏数 |
| `createTime` | string | 发布时间 |
| `location` | string | 交易地点 |
| `status` | string | 状态：selling/sold/offline |

---

### 10.2 获取商品详情

**接口**: `GET /admin/trade/item/{id}`

---

### 10.3 发布闲置商品

**接口**: `POST /admin/trade/item/add`

**请求参数**:
```json
{
  "title": "string",
  "description": "string",
  "price": 2800,
  "originalPrice": 4799,
  "images": ["url1", "url2"],
  "category": "string",
  "condition": "string",
  "location": "string"
}
```

---

### 10.4 获取跑腿任务列表

**接口**: `GET /admin/errand/task/list`

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int | 任务 ID |
| `title` | string | 任务标题 |
| `description` | string | 任务描述 |
| `reward` | number | 赏金（元） |
| `category` | string | 分类 |
| `publisher` | object | 发布者信息 |
| `runner` | object/null | 接单人信息 |
| `fromLocation` | string | 出发地 |
| `toLocation` | string | 目的地 |
| `deadline` | string | 截止时间 |
| `status` | string | 状态：pending/accepted/completed |
| `tags` | array | 标签数组 |

---

### 10.5 获取跑腿任务详情

**接口**: `GET /admin/errand/task/{id}`

---

### 10.6 接受跑腿任务

**接口**: `POST /admin/errand/task/accept`

**请求参数**:
```json
{
  "taskId": 4001
}
```

---

### 10.7 发布跑腿任务

**接口**: `POST /admin/errand/task/add`

**请求参数**:
```json
{
  "title": "string",
  "description": "string",
  "reward": 5,
  "category": "string",
  "fromLocation": "string",
  "toLocation": "string",
  "deadline": "string",
  "tags": ["急", "大件"]
}
```

---

## 11. 私信模块

### 11.1 获取会话列表

**接口**: `GET /admin/message/conversations`

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int | 会话 ID |
| `user` | object | 对方用户信息 |
| `lastMessage` | string | 最后一条消息内容 |
| `lastTime` | string | 最后消息时间 |
| `unreadCount` | int | 未读消息数 |
| `isOnline` | boolean | 是否在线 |

---

### 11.2 获取消息记录

**接口**: `GET /admin/message/history/{conversationId}`

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int | 消息 ID |
| `senderId` | int | 发送者 ID |
| `content` | string | 消息内容 |
| `time` | string | 发送时间 |
| `isRead` | boolean | 是否已读 |

---

### 11.3 发送消息

**接口**: `POST /admin/message/send`

**请求参数**:
```json
{
  "conversationId": 5001,
  "content": "string"
}
```

---

### 11.4 获取未读消息数

**接口**: `GET /admin/message/unread`

---

### 11.5 标记消息已读

**接口**: `POST /admin/message/read`

**请求参数**:
```json
{
  "conversationId": 5001
}
```

---

## 12. 订单模块

### 12.1 创建订单

**接口**: `POST /admin/order/create`

**请求参数**:
```json
{
  "type": "trade",
  "itemId": 3001,
  "taskId": 4001,
  "tradeMethod": "face",
  "remark": "string"
}
```

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `orderId` | int | 订单 ID |
| `orderNo` | string | 订单编号 |
| `type` | string | 订单类型 |
| `buyerId` | int | 买家/接单人 ID |
| `sellerId` | int | 卖家/发布者 ID |
| `amount` | number | 订单金额 |
| `status` | string | 状态：pending/confirmed/shipped/completed/cancelled |

---

### 12.2 获取订单详情

**接口**: `GET /admin/order/{id}`

---

### 12.3 获取我的订单列表

**接口**: `GET /admin/order/list`

---

### 12.4 更新订单状态

**接口**: `POST /admin/order/update`

**状态流转**:
- `pending` → `confirmed` → `shipped` → `completed`
- `pending`/`confirmed` → `cancelled`

---

## 数据库表结构（新增）

### 9. 二手商品表 `trade_item`

```sql
CREATE TABLE `trade_item` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `seller_id` BIGINT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2),
  `images` TEXT,
  `category` VARCHAR(50) NOT NULL,
  `condition` VARCHAR(20) NOT NULL,
  `views` INT DEFAULT 0,
  `likes` INT DEFAULT 0,
  `location` VARCHAR(100) DEFAULT '',
  `status` VARCHAR(20) DEFAULT 'selling',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`seller_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 10. 跑腿任务表 `errand_task`

```sql
CREATE TABLE `errand_task` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `publisher_id` BIGINT NOT NULL,
  `runner_id` BIGINT DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `reward` DECIMAL(10,2) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `from_location` VARCHAR(200) NOT NULL,
  `to_location` VARCHAR(200) NOT NULL,
  `deadline` DATETIME,
  `tags` VARCHAR(200) DEFAULT '',
  `status` VARCHAR(20) DEFAULT 'pending',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`publisher_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`runner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 11. 私信会话表 `conversation`

```sql
CREATE TABLE `conversation` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user1_id` BIGINT NOT NULL,
  `user2_id` BIGINT NOT NULL,
  `last_message` TEXT,
  `last_time` DATETIME,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_pair` (`user1_id`, `user2_id`),
  FOREIGN KEY (`user1_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user2_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 12. 私信消息表 `message`

```sql
CREATE TABLE `message` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `conversation_id` BIGINT NOT NULL,
  `sender_id` BIGINT NOT NULL,
  `content` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 13. 订单表 `order`

```sql
CREATE TABLE `order` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `order_no` VARCHAR(50) NOT NULL UNIQUE,
  `type` VARCHAR(20) NOT NULL,
  `item_id` BIGINT,
  `task_id` BIGINT,
  `buyer_id` BIGINT NOT NULL,
  `seller_id` BIGINT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `trade_method` VARCHAR(20) DEFAULT 'face',
  `remark` VARCHAR(500) DEFAULT '',
  `status` VARCHAR(20) DEFAULT 'pending',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`buyer_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 索引建议（新增）

```sql
CREATE INDEX idx_trade_item_seller ON trade_item(seller_id);
CREATE INDEX idx_trade_item_category ON trade_item(category);
CREATE INDEX idx_trade_item_status ON trade_item(status, create_time DESC);
CREATE INDEX idx_errand_task_publisher ON errand_task(publisher_id);
CREATE INDEX idx_errand_task_runner ON errand_task(runner_id);
CREATE INDEX idx_errand_task_status ON errand_task(status, create_time DESC);
CREATE INDEX idx_conversation_user1 ON conversation(user1_id, last_time DESC);
CREATE INDEX idx_conversation_user2 ON conversation(user2_id, last_time DESC);
CREATE INDEX idx_message_conversation ON message(conversation_id, create_time);
CREATE INDEX idx_message_unread ON message(conversation_id, is_read);
CREATE INDEX idx_order_buyer ON `order`(buyer_id, create_time DESC);
CREATE INDEX idx_order_seller ON `order`(seller_id, create_time DESC);
CREATE INDEX idx_order_status ON `order`(status);