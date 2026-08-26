# 校园论坛 - 前后端接口总文档

> **最后更新**: 2026-08-18  
> **前端版本**: api.js v1.0  
> **后端地址**: http://127.0.0.1:8090  
> **认证方式**: 请求头 `token` 字段（JWT）  
> **通用响应格式**: `{ "code": 1|200, "msg": "xxx", "data": {} }`

---

## 接口状态图例

| 标记 | 含义 |
|------|------|
| ✅ | 后端已实现，测试通过 |
| ⚠️ | 后端接口存在但有 Bug（500/400） |
| ❌ | 后端未实现（404） |
| 🔧 | 纯前端 mock，无后端接口 |

---

## 总览

| 模块 | 总数 | ✅ | ⚠️ | ❌ | 🔧 |
|------|------|---|---|---|---|
| 用户 | 9 | 4 | 3 | 0 | 2 |
| 文章 | 12 | 8 | 3 | 0 | 1 |
| 评论 | 3 | 1 | 1 | 0 | 1 |
| 搜索 | 2 | 2 | 0 | 0 | 0 |
| 上传 | 1 | 0 | 1 | 0 | 0 |
| 交易 | 3 | 0 | 0 | 3 | 1 |
| 跑腿 | 4 | 0 | 0 | 4 | 2 |
| 私信 | 4 | 0 | 0 | 3 | 1 |
| **合计** | **38** | **15** | **8** | **10** | **5** |

---

# 一、用户模块

### 1.1 获取用户信息 ✅⚠️

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchUserInfo()` |
| **后端接口** | `GET /admin/user/info` |
| **认证** | 需要 token |
| **使用页面** | ZhihuHeader, UserProfile, OrderPage, TradePublish, ErrandPublish, TradeItemDetail, ErrandTaskDetail, ChatDetail, MessageCenter, TradeMarket |
| **测试状态** | ⚠️ 500 Internal Server Error |

**前端调用**:
```js
const result = await fetchUserInfo()
// result.data => { id, username, email, avatar, bio, location, createTime, followers, following, articles }
```

**后端响应**:
```json
{
  "code": 1,
  "data": {
    "id": 2,
    "username": "root",
    "name": "root",
    "email": "1301387516@qq.com",
    "bio": "学习ing....",
    "avatar": "https://mywebpro.oss-cn-beijing.aliyuncs.com/e8b2c257-2a3f-4834-9d0b-f38f544eba59.jpg",
    "background": "",
    "location": "",
    "createTime": "2024-01-15",
    "followers": 0,
    "following": 0,
    "articles": 12
  }
}
```

---

### 1.2 获取指定用户信息 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | 未直接封装（通过 fetchArticleList 等间接使用） |
| **后端接口** | `GET /admin/user/info/{id}` |
| **认证** | 需要 token |
| **使用页面** | UserProfile（查看他人主页时） |
| **测试状态** | 未在自动化测试中覆盖，文档标记已完成 |

**后端响应**: 格式同 1.1

---

### 1.3 修改用户信息 ⚠️

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchUpdateUser(payload)` |
| **后端接口** | `POST /admin/user/change` |
| **认证** | 需要 token |
| **使用页面** | UserProfile（编辑资料） |
| **测试状态** | ⚠️ code=0, msg=未知错误 |

**前端请求**:
```json
{
  "username": "新昵称",
  "email": "new@email.com",
  "bio": "新签名",
  "avatar": "https://xxx.com/new-avatar.jpg",
  "background": "https://xxx.com/bg.jpg",
  "location": "上海"
}
```

---

### 1.4 搜索用户 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchSearchUsers(keyword)` |
| **后端接口** | `GET /admin/user/search?keyword={keyword}` |
| **认证** | 需要 token |
| **使用页面** | SearchPage |
| **测试状态** | ✅ 已完成 |

**前端调用**: `fetchSearchUsers('root')`

**后端响应**:
```json
{
  "code": 1,
  "data": [
    {
      "id": 2,
      "username": "root",
      "avatar": "https://mywebpro.oss-cn-beijing.aliyuncs.com/xxx.jpg",
      "bio": "学习ing....",
      "isFollowed": false
    }
  ]
}
```

---

### 1.5 关注/取消关注 ⚠️

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchFollowUser(userId)` |
| **后端接口** | `POST /admin/user/follow` |
| **认证** | 需要 token |
| **使用页面** | ArticleDetail, HomePage, SearchPage, UserProfile, ZhihuSidebar |
| **测试状态** | ⚠️ 500 Internal Server Error |

**前端请求**:
```json
{ "userId": 3 }
```

**后端期望请求**（含 action 字段）:
```json
{ "userId": 3, "action": "follow" }
```

**后端响应**:
```json
{ "code": 1, "data": { "followers": 1235 } }
```

> **注意**: 前端未传 `action` 字段，后端做非空校验会报错。需后端移除 action 非空校验，或前端补传 action。

---

### 1.6 获取关注列表 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchFollowingList()` |
| **后端接口** | `GET /admin/user/following` |
| **认证** | 需要 token |
| **使用页面** | HomePage（关注Tab）, UserProfile |
| **测试状态** | ✅ 已完成 |

**后端响应**:
```json
{
  "code": 1,
  "data": [
    { "id": 3, "username": "李四", "avatar": "...", "bio": "前端开发工程师" }
  ]
}
```

---

### 1.7 获取粉丝列表 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchFollowers()` |
| **后端接口** | `GET /admin/user/followers` |
| **认证** | 需要 token |
| **使用页面** | UserProfile |
| **测试状态** | ✅ 已完成 |

**后端响应**:
```json
{
  "code": 1,
  "data": [
    { "id": 5, "username": "王五", "avatar": "...", "bio": "...", "isFollowedBack": false }
  ]
}
```

---

### 1.8 获取用户点赞文章 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchLikedArticles(userId)` |
| **后端接口** | `GET /admin/user/like/{userId}` |
| **认证** | 需要 token |
| **使用页面** | UserProfile（喜欢的文章Tab） |
| **测试状态** | ✅ 已完成 |

**后端响应**: 直接返回文章数组（无分页包装）
```json
{
  "code": 1,
  "data": [
    { "id": 101, "title": "...", "likes": 234, "isLiked": true, "..." : "..." }
  ]
}
```

---

### 1.9 用户登录 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | 在 MyIndex_body.vue 中直接用 axios 调用 |
| **后端接口** | `POST /admin/user/login` |
| **认证** | 不需要 |
| **使用页面** | 登录页 |
| **测试状态** | ✅ 已完成 |

**前端请求**:
```json
{ "username": "root", "password": "zx20040225" }
```

**后端响应**:
```json
{
  "code": 1,
  "data": {
    "id": 2,
    "username": "root",
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "avatar": "https://mywebpro.oss-cn-beijing.aliyuncs.com/xxx.jpg",
    "email": "1301387516@qq.com"
  }
}
```

---

### 1.10 获取通知 🔧

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchNotifications()` |
| **后端接口** | `GET /admin/notification/list`（后端已实现，前端未调用） |
| **认证** | 需要 token |
| **使用页面** | ZhihuHeader |
| **测试状态** | 🔧 前端直接返回 mock 数据，未请求后端 |

---

### 1.11 获取未读消息数 🔧

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchUnreadMessageCount()` |
| **后端接口** | `GET /admin/message/unread`（后端未实现） |
| **认证** | 需要 token |
| **使用页面** | ZhihuHeader |
| **测试状态** | 🔧 前端纯 mock 计算 |

---

# 二、文章模块

### 2.1 获取文章列表 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchArticleList()` |
| **后端接口** | `GET /admin/article/list` |
| **认证** | 需要 token |
| **使用页面** | HomePage, ArticleDetail, SearchPage, UserProfile |
| **测试状态** | ✅ 已完成 |

**查询参数**: `page`(默认1), `pageSize`(默认10)

**后端响应**:
```json
{
  "code": 1,
  "data": [
    {
      "id": 101,
      "title": "文章标题",
      "content": "文章内容...",
      "summary": "文章摘要...",
      "images": ["https://xxx.com/img1.jpg"],
      "videos": [],
      "author": { "id": 1, "username": "张三", "avatar": "...", "bio": "..." },
      "cover": "",
      "tags": "Vue.js,前端",
      "type": "article",
      "likes": 234,
      "comments": 45,
      "views": 5678,
      "createTime": "2024-01-15 10:30",
      "isLiked": false,
      "isFollowed": false
    }
  ]
}
```

---

### 2.2 获取文章详情 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchArticleDetail(id)` |
| **后端接口** | `GET /admin/article/{id}` |
| **认证** | 需要 token |
| **使用页面** | ArticleDetail |
| **测试状态** | ✅ 已完成 |

**响应格式**: 同 2.1，返回单个对象

---

### 2.3 发布文章 ⚠️

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchAddArticle(payload)` |
| **后端接口** | `POST /admin/article/add` |
| **认证** | 需要 token |
| **使用页面** | WritePage, UserProfile |
| **测试状态** | ⚠️ 400 Bad Request |

**前端请求**:
```json
{
  "title": "文章标题",
  "content": "文章内容",
  "images": "url1,url2",
  "videos": "",
  "cover": "https://xxx.com/cover.jpg",
  "type": "article"
}
```

---

### 2.4 修改文章 ⚠️

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchUpdateArticle(payload)` |
| **后端接口** | `POST /admin/article/update` |
| **认证** | 需要 token |
| **使用页面** | WritePage（编辑模式）, UserProfile |
| **测试状态** | ⚠️ 500 Internal Server Error |

**前端请求**:
```json
{
  "id": 101,
  "title": "修改后标题",
  "content": "修改后内容",
  "images": "url1,url2",
  "videos": ""
}
```

---

### 2.5 删除文章 ⚠️

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchDeleteArticle(id)` |
| **后端接口** | `DELETE /admin/article/delete/{id}` |
| **认证** | 需要 token |
| **使用页面** | UserProfile |
| **测试状态** | ⚠️ 500（可能有关联评论数据导致删除失败） |

---

### 2.6 点赞/取消点赞 ⚠️

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchLikeArticle(articleId)` |
| **后端接口** | `POST /admin/article/like` |
| **认证** | 需要 token |
| **使用页面** | ArticleDetail, HomePage |
| **测试状态** | ⚠️ 500 Internal Server Error |

**前端请求**:
```json
{ "articleId": 101 }
```

**后端期望请求**:
```json
{ "articleId": 101, "action": "like" }
```

**后端响应**: `{ "code": 1, "data": { "likes": 235 } }`

> **注意**: 同 1.5，前端未传 `action` 字段导致后端校验失败。

---

### 2.7 增加浏览量 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchViewArticle(articleId)` |
| **后端接口** | `POST /admin/article/view` |
| **认证** | 需要 token |
| **使用页面** | ArticleDetail |
| **测试状态** | ✅ 已完成 |

**前端请求**: `{ "articleId": 101 }`  
**后端响应**: `{ "code": 1, "data": { "views": 5679 } }`

---

### 2.8 获取热榜 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchHotArticles()` |
| **后端接口** | `GET /admin/article/hot` |
| **认证** | 需要 token |
| **使用页面** | HomePage, DiscoverPage, ZhihuSidebar |
| **测试状态** | ✅ 已完成 |

**查询参数**: `limit`(默认10)  
**响应格式**: 同文章列表，按浏览量降序

---

### 2.9 获取随机文章 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchRandomArticles()` |
| **后端接口** | `GET /admin/article/random` |
| **认证** | 需要 token |
| **使用页面** | DiscoverPage |
| **测试状态** | ✅ 已完成 |

---

### 2.10 收藏/取消收藏 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchCollectArticle(articleId)` |
| **后端接口** | `POST /admin/article/collect` |
| **认证** | 需要 token |
| **使用页面** | ArticleDetail, HomePage |
| **测试状态** | ✅ 已完成 |

**前端请求**: `{ "articleId": 101 }`  
**后端响应**: `{ "code": 1, "data": "收藏成功" }` 或 `{ "data": "取消收藏" }`

---

### 2.11 保存草稿 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchSaveDraft(payload)` |
| **后端接口** | `POST /admin/article/draft` |
| **认证** | 需要 token |
| **使用页面** | WritePage |
| **测试状态** | ✅ 已完成 |

**前端请求**:
```json
{ "title": "草稿标题", "content": "草稿内容", "cover": "...", "tags": "Vue.js" }
```

---

### 2.12 加载草稿 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchLoadDraft()` |
| **后端接口** | `GET /admin/article/draft` |
| **认证** | 需要 token |
| **使用页面** | WritePage |
| **测试状态** | ✅ 已完成 |

---

# 三、评论模块

### 3.1 获取文章评论列表 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchArticleComments(articleId)` |
| **后端接口** | `GET /admin/article/comment/{articleId}` |
| **认证** | 需要 token |
| **使用页面** | ArticleDetail |
| **测试状态** | ✅ 已完成 |

**查询参数**: `page`(默认1), `pageSize`(默认20)

**后端响应**:
```json
{
  "code": 1,
  "data": {
    "list": [
      {
        "id": 1001,
        "articleId": 101,
        "author": { "id": 2, "username": "李四", "avatar": "..." },
        "content": "写得非常好！",
        "image": "",
        "like": 23,
        "createTime": "2024-01-15 12:00",
        "isLiked": false,
        "replies": [
          {
            "id": 10011,
            "author": { "id": 1, "username": "张三", "avatar": "..." },
            "content": "谢谢支持！",
            "image": "",
            "like": 5,
            "createTime": "2024-01-15 13:30",
            "isLiked": false
          }
        ]
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

> **前端处理**: 自动提取 `data.list` 转为数组

---

### 3.2 发表评论 ⚠️

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchAddComment(payload)` |
| **后端接口** | `POST /admin/article/comment` |
| **认证** | 需要 token |
| **使用页面** | ArticleDetail |
| **测试状态** | ⚠️ 400 Bad Request |

**前端请求**:
```json
{
  "articleId": 101,
  "userId": 2,
  "content": "评论内容",
  "image": "https://xxx.com/comment-img.jpg",
  "parentId": null
}
```

---

### 3.3 点赞评论 🔧

| 项目 | 内容 |
|------|------|
| **前端函数** | 无独立函数，在 ArticleDetail.vue 中本地处理 |
| **后端接口** | `POST /admin/comment/like`（后端已实现） |
| **测试状态** | 🔧 前端仅本地切换状态，未请求后端 |

---

# 四、搜索模块

### 4.1 搜索文章 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchSearchArticles(keyword)` |
| **后端接口** | `GET /admin/search?q={keyword}&type=articles` |
| **认证** | 需要 token |
| **使用页面** | SearchPage |
| **测试状态** | ✅ 已完成 |

**后端响应**: `{ "code": 1, "data": [...] }` 或 `{ "data": { "articles": [...] } }` 或 `{ "data": { "list": [...] } }`

> **前端处理**: 兼容三种响应格式，失败时降级为本地过滤

---

### 4.2 搜索用户 ✅

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchSearchUsers(keyword)` |
| **后端接口** | `GET /admin/user/search?keyword={keyword}` |
| **认证** | 需要 token |
| **使用页面** | SearchPage |
| **测试状态** | ✅ 已完成 |

---

# 五、上传模块

### 5.1 上传文件 ⚠️

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchUpload(file)` |
| **后端接口** | `POST /admin/upload` |
| **Content-Type** | `multipart/form-data` |
| **认证** | 需要 token |
| **使用页面** | WritePage, ArticleDetail（评论图片） |
| **测试状态** | ⚠️ 500 Internal Server Error（OSS 配置问题） |

**前端请求**: `FormData` 对象，字段名 `file`  
**后端响应**: `{ "code": 1, "data": "https://xxx.com/uploads/xxx.jpg" }`

---

# 六、交易模块

### 6.1 获取商品列表 ❌

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchTradeItemList(category)` |
| **后端接口** | `GET /admin/trade/item/list?category={category}` |
| **认证** | 需要 token |
| **使用页面** | TradeMarket |
| **测试状态** | ❌ 404 Not Found |
| **Mock 降级** | 使用 `mockTradeItems` |

**前端调用**: `fetchTradeItemList('数码')`

---

### 6.2 获取商品详情 ❌

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchTradeItemDetail(id)` |
| **后端接口** | `GET /admin/trade/item/{id}` |
| **认证** | 需要 token |
| **使用页面** | TradeItemDetail |
| **测试状态** | ❌ 404 Not Found |

---

### 6.3 发布商品 ❌

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchAddTradeItem(payload)` |
| **后端接口** | `POST /admin/trade/item/add` |
| **认证** | 需要 token |
| **使用页面** | TradePublish |
| **测试状态** | ❌ 404 Not Found |

**前端请求**:
```json
{
  "title": "二手iPad",
  "description": "9成新",
  "price": 1500,
  "originalPrice": 3999,
  "images": ["url1", "url2"],
  "category": "数码",
  "condition": "9成新",
  "location": "校内3号楼"
}
```

---

### 6.4 获取交易分类 🔧

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchTradeCategories()` |
| **后端接口** | 无 |
| **测试状态** | 🔧 纯前端 mock |

---

# 七、跑腿模块

### 7.1 获取任务列表 ❌

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchErrandTaskList(category)` |
| **后端接口** | `GET /admin/errand/task/list?category={category}` |
| **认证** | 需要 token |
| **使用页面** | TradeMarket |
| **测试状态** | ❌ 404 Not Found |

---

### 7.2 获取任务详情 ❌

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchErrandTaskDetail(id)` |
| **后端接口** | `GET /admin/errand/task/{id}` |
| **认证** | 需要 token |
| **使用页面** | ErrandTaskDetail |
| **测试状态** | ❌ 404 Not Found |

---

### 7.3 接单任务 ❌

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchAcceptErrandTask(taskId)` |
| **后端接口** | `POST /admin/errand/task/accept` |
| **认证** | 需要 token |
| **使用页面** | ErrandTaskDetail |
| **测试状态** | ❌ 404 Not Found |

**前端请求**: `{ "taskId": 1 }`

---

### 7.4 发布任务 ❌

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchAddErrandTask(payload)` |
| **后端接口** | `POST /admin/errand/task/add` |
| **认证** | 需要 token |
| **使用页面** | ErrandPublish |
| **测试状态** | ❌ 404 Not Found |

**前端请求**:
```json
{
  "title": "帮取快递",
  "description": "菜鸟驿站3个包裹",
  "reward": 5.00,
  "category": "代取快递",
  "fromLocation": "菜鸟驿站",
  "toLocation": "3号楼502",
  "deadline": "2026-08-18 18:00",
  "tags": ["急"]
}
```

---

### 7.5 获取跑腿分类 🔧

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchErrandCategories()` |
| **后端接口** | 无 |
| **测试状态** | 🔧 纯前端 mock |

---

# 八、私信模块

### 8.1 获取会话列表 ❌

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchConversations()` |
| **后端接口** | `GET /admin/message/conversations` |
| **认证** | 需要 token |
| **使用页面** | MessageCenter, ChatDetail |
| **测试状态** | ❌ 404 Not Found |

---

### 8.2 获取消息记录 ❌

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchMessageHistory(conversationId)` |
| **后端接口** | `GET /admin/message/history/{conversationId}` |
| **认证** | 需要 token |
| **使用页面** | ChatDetail |
| **测试状态** | ❌ 404 Not Found |

---

### 8.3 发送私信 ❌

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchSendMessage(payload)` |
| **后端接口** | `POST /admin/message/send` |
| **认证** | 需要 token |
| **使用页面** | ChatDetail |
| **测试状态** | ❌ 404 Not Found |

**前端请求**:
```json
{ "conversationId": 1, "content": "你好" }
```

---

### 8.4 获取未读消息数 🔧

| 项目 | 内容 |
|------|------|
| **前端函数** | `fetchUnreadMessageCount()` |
| **后端接口** | `GET /admin/message/unread`（后端待实现，见后端接口文档 8.4） |
| **认证** | 需要 token |
| **测试状态** | 🔧 前端纯 mock 计算，后端待开发 |

---

# 九、纯 Mock 数据接口（无后端请求）

| 函数 | 说明 | 使用页面 |
|------|------|----------|
| `fetchHotTopics()` | 热榜话题 | ZhihuSidebar |
| `fetchTags()` | 标签列表 | ZhihuSidebar |
| `fetchRecommendUsers()` | 推荐用户 | ZhihuSidebar |
| `fetchCommentsByArticleId(id)` | 评论列表（备用） | — |
| `fetchTradeCategories()` | 交易分类 | TradeMarket, TradePublish |
| `fetchErrandCategories()` | 跑腿分类 | TradeMarket, ErrandPublish |

---

# 十、前端-后端字段差异对照表

> 以下列出前端实际传参和后端期望不一致的地方，需统一修复。

| 接口 | 前端传参 | 后端期望 | 修复建议 |
|------|----------|----------|----------|
| POST /admin/article/like | `{ articleId }` | `{ articleId, action }` | 后端移除 action 非空校验 |
| POST /admin/user/follow | `{ userId }` | `{ userId, action }` | 后端移除 action 非空校验 |
| POST /admin/article/comment | `{ articleId, userId, content, image, parentId }` | `{ articleId, content, image, parentId }` | 后端从 token 获取 userId，前端无需传 |
| POST /admin/article/add | `{ title, content, images(string), ... }` | 需确认必填字段 | 检查 400 原因 |

---

# 十一、待办事项

### 后端需修复（⚠️ 8个）

1. `GET /admin/user/info` — 500 错误，检查 Token 解析逻辑
2. `POST /admin/user/change` — code=0 未知错误，检查请求体字段映射
3. `POST /admin/user/follow` — 500 错误，移除 action 非空校验
4. `POST /admin/article/add` — 400 错误，检查必填字段
5. `POST /admin/article/update` — 500 错误
6. `DELETE /admin/article/delete/{id}` — 500 错误，处理关联数据
7. `POST /admin/article/like` — 500 错误，移除 action 非空校验
8. `POST /admin/article/comment` — 400 错误，userId 应从 token 获取
9. `POST /admin/upload` — 500 错误，检查 OSS 配置

### 后端需新增（❌ 10个）

1. `GET /admin/trade/item/list` — 商品列表
2. `GET /admin/trade/item/{id}` — 商品详情
3. `POST /admin/trade/item/add` — 发布商品
4. `GET /admin/errand/task/list` — 任务列表
5. `GET /admin/errand/task/{id}` — 任务详情
6. `POST /admin/errand/task/accept` — 接单
7. `POST /admin/errand/task/add` — 发布任务
8. `GET /admin/message/conversations` — 会话列表
9. `GET /admin/message/history/{id}` — 消息记录
10. `POST /admin/message/send` — 发送私信

### 前端待改造（🔧 5个）

1. `fetchNotifications()` — 改为请求后端 `GET /admin/notification/list`
2. `fetchUnreadMessageCount()` — 改为请求后端 `GET /admin/message/unread`
3. 评论点赞 — 改为请求后端 `POST /admin/comment/like`
4. `fetchTradeCategories()` — 改为请求后端接口
5. `fetchErrandCategories()` — 改为请求后端接口

---

> **维护说明**: 每次修改 `src/utils/api.js` 中的接口函数时，需同步更新本文档对应条目。  
> 可通过运行 `node test_api.js` 重新测试后端接口状态并更新标记。
