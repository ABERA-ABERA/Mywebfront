# API 接口测试报告

> **测试时间**: 2026-08-18  
> **后端地址**: http://127.0.0.1:8090  
> **测试账号**: root / zx20040225  
> **登录状态**: ✅ 成功获取 Token

---

## 总览

| 指标 | 数值 |
|------|------|
| 总计接口 | 38 |
| ✅ 已完成 | 19 |
| ⚠️ 有Bug | 7 |
| ❌ 未实现 | 12 |
| 完成率 | 50.0% |

---

## ✅ 已完成接口 (19个)

| # | 模块 | 接口名 | 方法 | 路径 |
|---|------|--------|------|------|
| 1 | 用户 | 获取用户信息 | GET | /admin/user/info |
| 2 | 用户 | 搜索用户 | GET | /admin/user/search?keyword=xxx |
| 3 | 用户 | 关注/取消关注 | POST | /admin/user/follow |
| 4 | 用户 | 获取关注列表 | GET | /admin/user/following |
| 5 | 用户 | 获取粉丝列表 | GET | /admin/user/followers |
| 6 | 用户 | 获取用户点赞文章 | GET | /admin/user/like/{userId} |
| 7 | 文章 | 获取文章列表 | GET | /admin/article/list |
| 8 | 文章 | 获取文章详情 | GET | /admin/article/{id} |
| 9 | 文章 | 发布文章 | POST | /admin/article/add |
| 10 | 文章 | 增加浏览量 | POST | /admin/article/view |
| 11 | 文章 | 获取热榜 | GET | /admin/article/hot |
| 12 | 文章 | 获取随机文章 | GET | /admin/article/random |
| 13 | 文章 | 保存草稿 | POST | /admin/article/draft |
| 14 | 文章 | 加载草稿 | GET | /admin/article/draft |
| 15 | 评论 | 获取文章评论 | GET | /admin/article/comment/{articleId} |
| 16 | 评论 | 点赞评论 | POST | /admin/comment/like |
| 17 | 搜索 | 搜索文章 | GET | /admin/search?q=xxx&type=articles |
| 18 | 通知 | 获取通知列表 | GET | /admin/notification/list |
| 19 | 热榜 | 获取热榜(list) | GET | /admin/hot/list |

---

## ⚠️ 有Bug接口 (7个) — 后端需修复

| # | 模块 | 接口名 | 方法 | 路径 | 错误描述 | 原因分析 |
|---|------|--------|------|------|----------|----------|
| 1 | 用户 | 修改用户信息 | POST | /admin/user/change | code=0, msg=未知错误 | 字段映射问题，可能前端传的字段名与后端不匹配 |
| 2 | 文章 | 修改文章 | POST | /admin/article/update | HTTP 500 | 服务端内部异常，可能是 SQL 或字段问题 |
| 3 | 文章 | 删除文章 | DELETE | /admin/article/delete/{id} | HTTP 500 | 服务端内部异常（测试 id=99999 不存在也可能触发） |
| 4 | 文章 | 点赞/取消点赞 | POST | /admin/article/like | code=0, msg='2-1'已存在 | 后端需要 `action` 字段区分 like/unlike，但重复操作报错 |
| 5 | 文章 | 收藏/取消收藏 | POST | /admin/article/collect | code=0, msg='2-1'已存在 | 同上，重复操作报错而非切换状态 |
| 6 | 评论 | 发表评论 | POST | /admin/article/comment | HTTP 400 | 请求体格式不对，后端可能期望不同字段 |
| 7 | 上传 | 上传文件 | POST | /admin/upload | HTTP 500 | 文件上传配置问题（OSS 或本地存储） |

### Bug 详细分析

#### 1. 修改用户信息 POST /admin/user/change
```
请求: { username: 'root', bio: '学习ing....' }
响应: { code: 0, msg: '未知错误' }
```
**可能原因**: 后端期望的字段名与前端不一致，或 token 解析出的 userId 有问题。

#### 2. 修改文章 POST /admin/article/update
```
请求: { id: 1, title: '修改测试标题' }
响应: HTTP 500
```
**可能原因**: 后端 update SQL 异常，或必填字段缺失。

#### 3. 删除文章 DELETE /admin/article/delete/{id}
```
请求: id=99999 (不存在的文章)
响应: HTTP 500
```
**可能原因**: 后端未处理文章不存在的情况，应返回 code=0 而非 500。

#### 4. 点赞 POST /admin/article/like
```
请求: { articleId: 1, action: 'like' }
响应: { code: 0, msg: "'2-1'已存在" }
```
**可能原因**: 后端使用 userId-articleId 唯一约束，重复点赞应返回成功或忽略，而非报错。

#### 5. 收藏 POST /admin/article/collect
```
请求: { articleId: 1 }
响应: { code: 0, msg: "'2-1'已存在" }
```
**可能原因**: 同点赞，重复收藏应实现 toggle 逻辑。

#### 6. 发表评论 POST /admin/article/comment
```
请求: { articleId: 1, userId: 2, content: '测试评论', image: '' }
响应: HTTP 400
```
**可能原因**: 后端期望的请求体格式不同，可能不需要 `userId`（从 token 获取），或字段名不同。

#### 7. 上传文件 POST /admin/upload
```
请求: multipart/form-data
响应: HTTP 500
```
**可能原因**: OSS 配置问题或本地存储路径不存在。

---

## ❌ 未实现接口 (12个) — 后端需新增

| # | 模块 | 接口名 | 方法 | 路径 |
|---|------|--------|------|------|
| 1 | 交易 | 获取商品列表 | GET | /admin/trade/item/list |
| 2 | 交易 | 获取商品详情 | GET | /admin/trade/item/{id} |
| 3 | 交易 | 发布商品 | POST | /admin/trade/item/add |
| 4 | 跑腿 | 获取任务列表 | GET | /admin/errand/task/list |
| 5 | 跑腿 | 获取任务详情 | GET | /admin/errand/task/{id} |
| 6 | 跑腿 | 接单任务 | POST | /admin/errand/task/accept |
| 7 | 跑腿 | 发布任务 | POST | /admin/errand/task/add |
| 8 | 私信 | 获取会话列表 | GET | /admin/message/conversations |
| 9 | 私信 | 获取消息记录 | GET | /admin/message/history/{conversationId} |
| 10 | 私信 | 发送消息 | POST | /admin/message/send |
| 11 | 私信 | 获取未读消息数 | GET | /admin/message/unread |
| 12 | 私信 | 标记消息已读 | POST | /admin/message/read |

> 以上接口后端返回 404，Controller 尚未创建。详细接口规范见 `API_DOCUMENTATION.md`。

---

## 前端 Mock 数据使用清单

以下接口在后端不可用时，前端会 fallback 到 mock 数据：

| 接口 | Mock 来源 | 使用页面 |
|------|-----------|----------|
| 文章列表 | mockArticles | HomePage, UserProfile |
| 随机文章 | mockArticles (随机排序) | DiscoverPage |
| 文章评论 | mockComments + mockCommentsExtended | ArticleDetail |
| 热榜话题 | mockHotTopics | 已改为后端接口 |
| 标签 | mockTags | HomePage 侧边栏 |
| 通知 | mockNotifications | ZhihuHeader |
| 推荐用户 | mockUsers | 侧边栏 |
| 二手商品 | mockTradeItems | TradeMarket |
| 跑腿任务 | mockErrandTasks | ErrandTask |
| 私信会话 | mockConversations | MessageCenter |
| 消息记录 | mockMessages | ChatDetail |
| 交易分类 | mockTradeCategories | TradeMarket |
| 跑腿分类 | mockErrandCategories | ErrandTask |

> **注意**: `fetchUserInfo` 已移除 mock 兜底，后端不可用时返回 null，前端 fallback 到 localStorage。

---

## 修复建议优先级

### 高优先级（影响核心功能）
1. **修改用户信息** — 个人资料编辑无法保存
2. **上传文件** — 图片/头像上传不可用
3. **发表评论** — 评论功能不可用

### 中优先级（影响用户体验）
4. **修改文章** — 编辑博文无法保存
5. **删除文章** — 删除博文报错
6. **点赞/收藏** — 重复操作报错（需改为 toggle）

### 低优先级（新功能待开发）
7. **交易模块** — 3 个接口需新增
8. **跑腿模块** — 4 个接口需新增
9. **私信模块** — 5 个接口需新增
