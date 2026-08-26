/**
 * API 工具函数 - 复用原始接口，后端不可用时 fallback 到 mock 数据
 * 后端: Spring Boot + MySQL, 端口 8090
 */
import { mockArticles, mockUsers, mockComments, mockCommentsExtended, mockHotTopics, mockTags, mockNotifications, mockTradeItems, mockErrandTasks, mockTradeCategories, mockErrandCategories, mockConversations, mockMessages } from './mockData'

/**
 * 获取 token
 */
const getToken = () => localStorage.getItem('token') || ''

/**
 * 通用 fetch 封装，带 fallback
 */
const fetchWithFallback = async (url, options = {}, mockFallback = null) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'token': getToken(),
        ...options.headers
      }
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const result = await response.json()
    if (result.code === 1 || result.code === 200) {
      return { success: true, data: result.data, msg: result.msg }
    }
    throw new Error(result.msg || '请求失败')
  } catch (error) {
    console.warn(`接口 ${url} 不可用，使用 mock 数据:`, error.message)
    if (mockFallback) {
      return { success: false, data: mockFallback, msg: 'mock' }
    }
    return { success: false, data: null, msg: error.message }
  }
}

/**
 * 获取用户信息
 * 原始接口: GET /admin/user/info
 */
export const fetchUserInfo = async () => {
  return fetchWithFallback('/admin/user/info', { method: 'GET' }, null)
}

/**
 * 获取文章列表
 * 原始接口: GET /admin/article/list?page=1&pageSize=10
 */
export const fetchArticleList = async (page, pageSize) => {
  let url = '/admin/article/list'
  if (page != null && pageSize != null) {
    url += `?page=${page}&pageSize=${pageSize}`
  }
  return fetchWithFallback(url, { method: 'GET' }, mockArticles)
}

/**
 * 获取文章详情
 * 接口: GET /admin/article/{id}
 */
export const fetchArticleDetail = async (id) => {
  return fetchWithFallback(`/admin/article/${id}`, { method: 'GET' }, null)
}

/**
 * 发布文章
 * 原始接口: POST /admin/article/add
 */
export const fetchAddArticle = async (payload) => {
  return fetchWithFallback('/admin/article/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, { id: Date.now(), ...payload })
}

/**
 * 修改文章
 * 原始接口: POST /admin/article/update
 */
export const fetchUpdateArticle = async (payload) => {
  return fetchWithFallback('/admin/article/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

/**
 * 删除文章
 * 原始接口: DELETE /admin/article/delete/{id}
 */
export const fetchDeleteArticle = async (id) => {
  return fetchWithFallback(`/admin/article/delete/${id}`, {
    method: 'DELETE'
  })
}

/**
 * 修改用户信息
 * 原始接口: POST /admin/user/change
 */
export const fetchUpdateUser = async (payload) => {
  return fetchWithFallback('/admin/user/change', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

/**
 * 上传文件
 * 原始接口: POST /admin/upload
 */
export const fetchUpload = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return fetchWithFallback('/admin/upload', {
    method: 'POST',
    body: formData
  })
}

/**
 * 点赞/取消点赞文章
 * 接口: POST /admin/article/like
 * @param {number} articleId
 * @param {string} action - 'like' 或 'unlike'
 */
export const fetchLikeArticle = async (articleId, action = 'like') => {
  return fetchWithFallback('/admin/article/like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articleId, action })
  })
}

/**
 * 增加文章浏览量
 * 预留接口: POST /admin/article/view
 */
export const fetchViewArticle = async (articleId) => {
  return fetchWithFallback('/admin/article/view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articleId })
  })
}

/**
 * 获取文章评论列表
 * 接口: GET /admin/article/comment/{articleId}
 * 后端返回: { data: { list: [...], total, page, pageSize } }
 */
export const fetchArticleComments = async (articleId) => {
  const id = parseInt(articleId)
  const result = await fetchWithFallback(`/admin/article/comment/${articleId}`, { method: 'GET' }, 
    (() => {
      const allComments = [...mockComments, ...mockCommentsExtended]
      return allComments.filter(c => c.articleId === id)
    })()
  )
  // 后端返回分页格式 { list, total, page, pageSize }，提取 list
  if (result.data && !Array.isArray(result.data) && Array.isArray(result.data.list)) {
    result.data = result.data.list
  }
  return result
}

/**
 * 发表评论（支持图片）
 * 接口: POST /admin/article/comment
 */
export const fetchAddComment = async (payload) => {
  return fetchWithFallback('/admin/article/comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, { id: Date.now(), ...payload })
}

/**
 * 关注/取消关注用户
 * 接口: POST /admin/user/follow
 * @param {number} userId
 * @param {string} action - 'follow' 或 'unfollow'（可选，后端实际为 toggle 模式）
 */
export const fetchFollowUser = async (userId, action) => {
  const body = { userId }
  if (action) body.action = action
  return fetchWithFallback('/admin/user/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

/**
 * 获取关注列表
 * 预留接口: GET /admin/user/following
 */
export const fetchFollowingList = async () => {
  return fetchWithFallback('/admin/user/following', { method: 'GET' }, [])
}

/**
 * 获取热榜（按浏览量排名）
 * 接口: GET /admin/article/hot
 * 如果后端返回的 views 全为 null/0，则用文章列表按浏览量排序代替
 */
export const fetchHotArticles = async () => {
  const result = await fetchWithFallback('/admin/article/hot', { method: 'GET' }, null)
  const list = Array.isArray(result.data) ? result.data : []
  // 检查热榜数据是否有有效的浏览量
  const hasValidViews = list.some(a => a.views != null && a.views > 0)
  // 如果接口失败、无数据、或 views 全为 null/0，用文章列表排序代替
  if (!result.success || !result.data || !hasValidViews) {
    const listResult = await fetchArticleList()
    const fullList = Array.isArray(listResult.data) ? listResult.data : []
    return { success: true, data: fullList.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10) }
  }
  return result
}

/**
 * 搜索文章
 * 接口: GET /admin/search?q=xxx&type=articles
 */
export const fetchSearchArticles = async (keyword) => {
  const result = await fetchWithFallback(`/admin/search?q=${encodeURIComponent(keyword)}&type=articles`, { method: 'GET' }, null)
  // 搜索接口返回格式: { data: { articles: [...] } } 或 { data: [...] }
  if (result.success && result.data) {
    if (Array.isArray(result.data)) return result
    if (Array.isArray(result.data.articles)) return { success: true, data: result.data.articles }
    if (Array.isArray(result.data.list)) return { success: true, data: result.data.list }
  }
  // 如果搜索接口失败，用文章列表本地过滤
  const listResult = await fetchArticleList()
  let list = listResult.data || []
  if (!Array.isArray(list) && Array.isArray(list.list)) list = list.list
  if (!Array.isArray(list)) list = []
  const q = keyword.toLowerCase()
  const filtered = list.filter(a =>
    (a.title || '').toLowerCase().includes(q) ||
    (a.content || '').toLowerCase().includes(q)
  )
  return { success: true, data: filtered }
}

/**
 * 搜索用户
 * 接口: GET /admin/user/search?keyword=xxx
 */
export const fetchSearchUsers = async (keyword) => {
  return fetchWithFallback(`/admin/user/search?keyword=${encodeURIComponent(keyword)}`, { method: 'GET' }, [])
}

/**
 * 获取随机文章（发现模块）
 * 预留接口: GET /admin/article/random
 */
export const fetchRandomArticles = async () => {
  return fetchWithFallback('/admin/article/random', { method: 'GET' }, 
    [...mockArticles].sort(() => Math.random() - 0.5)
  )
}

/**
 * 获取用户点赞过的文章（指定用户）
 * 接口: GET /admin/user/like/{userId}
 * 后端直接返回文章列表数组
 */
export const fetchLikedArticles = async (userId) => {
  return fetchWithFallback(`/admin/user/like/${userId}`, { method: 'GET' }, [])
}

/**
 * 获取当前用户点赞过的文章（分页）
 * 接口: GET /admin/user/liked?page=1&pageSize=10
 * 后端返回: { list: [...], total, page, pageSize }
 */
export const fetchMyLikedArticles = async (page = 1, pageSize = 10) => {
  return fetchWithFallback(`/admin/user/liked?page=${page}&pageSize=${pageSize}`, { method: 'GET' }, [])
}

/**
 * 获取指定用户信息
 * 接口: GET /admin/user/info/{id}
 */
export const fetchUserInfoById = async (id) => {
  return fetchWithFallback(`/admin/user/info/${id}`, { method: 'GET' }, null)
}

/**
 * 获取粉丝列表
 * 预留接口: GET /admin/user/followers
 */
export const fetchFollowers = async () => {
  return fetchWithFallback('/admin/user/followers', { method: 'GET' }, [])
}

/**
 * 收藏/取消收藏文章
 * 预留接口: POST /admin/article/collect
 */
export const fetchCollectArticle = async (articleId) => {
  return fetchWithFallback('/admin/article/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articleId })
  })
}

/**
 * 保存草稿
 * 预留接口: POST /admin/article/draft
 */
export const fetchSaveDraft = async (payload) => {
  return fetchWithFallback('/admin/article/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

/**
 * 加载草稿
 * 预留接口: GET /admin/article/draft
 */
export const fetchLoadDraft = async () => {
  return fetchWithFallback('/admin/article/draft', { method: 'GET' }, null)
}

/**
 * 获取评论列表（本地 mock）
 */
export const fetchCommentsByArticleId = (articleId) => {
  const allComments = [...mockComments, ...mockCommentsExtended]
  return allComments.filter(c => c.articleId === articleId)
}

/**
 * 获取热榜数据
 * 接口: GET /admin/hot/list
 */
export const fetchHotTopics = async () => {
  const result = await fetchWithFallback('/admin/hot/list', { method: 'GET' }, null)
  if (result.success && result.data) {
    const list = Array.isArray(result.data) ? result.data : (result.data.list || [])
    return list.map(item => ({
      id: item.id,
      title: item.title || item.name || '',
      hotValue: item.hotValue || item.views || item.hot || 0,
      ...item
    }))
  }
  return mockHotTopics
}

/**
 * 获取标签数据（mock）
 */
export const fetchTags = () => mockTags

/**
 * 获取通知数据
 * 接口: GET /admin/notification/list
 */
export const fetchNotifications = async () => {
  const result = await fetchWithFallback('/admin/notification/list', { method: 'GET' }, null)
  if (result.success && result.data) {
    return Array.isArray(result.data) ? result.data : (result.data.list || [])
  }
  return mockNotifications
}

/**
 * 获取推荐用户（mock）
 */
export const fetchRecommendUsers = () => mockUsers

/**
 * 获取二手商品列表
 * 预留接口: GET /admin/trade/item/list
 */
export const fetchTradeItemList = async (category) => {
  const url = category ? `/admin/trade/item/list?category=${category}` : '/admin/trade/item/list'
  return fetchWithFallback(url, { method: 'GET' }, mockTradeItems)
}

/**
 * 获取商品详情
 * 预留接口: GET /admin/trade/item/{id}
 */
export const fetchTradeItemDetail = async (id) => {
  return fetchWithFallback(`/admin/trade/item/${id}`, { method: 'GET' }, mockTradeItems.find(i => i.id === parseInt(id)))
}

/**
 * 发布二手商品
 * 预留接口: POST /admin/trade/item/add
 */
export const fetchAddTradeItem = async (payload) => {
  return fetchWithFallback('/admin/trade/item/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, { id: Date.now(), ...payload })
}

/**
 * 获取跑腿任务列表
 * 预留接口: GET /admin/errand/task/list
 */
export const fetchErrandTaskList = async (category) => {
  const url = category ? `/admin/errand/task/list?category=${category}` : '/admin/errand/task/list'
  return fetchWithFallback(url, { method: 'GET' }, mockErrandTasks)
}

/**
 * 获取跑腿任务详情
 * 预留接口: GET /admin/errand/task/{id}
 */
export const fetchErrandTaskDetail = async (id) => {
  return fetchWithFallback(`/admin/errand/task/${id}`, { method: 'GET' }, mockErrandTasks.find(t => t.id === parseInt(id)))
}

/**
 * 接单跑腿任务
 * 预留接口: POST /admin/errand/task/accept
 */
export const fetchAcceptErrandTask = async (taskId) => {
  return fetchWithFallback('/admin/errand/task/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId })
  })
}

/**
 * 发布跑腿任务
 * 预留接口: POST /admin/errand/task/add
 */
export const fetchAddErrandTask = async (payload) => {
  return fetchWithFallback('/admin/errand/task/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, { id: Date.now(), ...payload })
}

/**
 * 获取交易分类列表
 */
export const fetchTradeCategories = () => mockTradeCategories

/**
 * 获取跑腿分类列表
 */
export const fetchErrandCategories = () => mockErrandCategories

/**
 * 获取私信会话列表
 * 预留接口: GET /admin/message/conversations
 */
export const fetchConversations = async () => {
  return fetchWithFallback('/admin/message/conversations', { method: 'GET' }, mockConversations)
}

/**
 * 获取私信消息记录
 * 预留接口: GET /admin/message/history/{conversationId}
 */
export const fetchMessageHistory = async (conversationId) => {
  return fetchWithFallback(`/admin/message/history/${conversationId}`, { method: 'GET' }, mockMessages[conversationId] || [])
}

/**
 * 发送私信
 * 预留接口: POST /admin/message/send
 */
export const fetchSendMessage = async (payload) => {
  return fetchWithFallback('/admin/message/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, { id: Date.now(), ...payload })
}

/**
 * 获取未读消息总数
 */
export const fetchUnreadMessageCount = () => {
  return mockConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
}

// ==================== 评论扩展接口 ====================

/**
 * 删除评论
 * 接口: DELETE /admin/article/comment/delete/{id}
 * 或 DELETE /admin/comment/delete/{id}
 * 只能删除自己的评论
 */
export const fetchDeleteComment = async (commentId) => {
  return fetchWithFallback(`/admin/comment/delete/${commentId}`, { method: 'DELETE' })
}

/**
 * 点赞/取消点赞评论
 * 接口: POST /admin/comment/like
 * @param {number} commentId
 * @param {string} action - 'like' 或 'unlike'（可选，后端为 toggle 模式）
 */
export const fetchLikeComment = async (commentId, action) => {
  const body = { commentId }
  if (action) body.action = action
  return fetchWithFallback('/admin/comment/like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

// ==================== 通知扩展接口 ====================

/**
 * 标记通知为已读
 * 接口: POST /admin/notification/read
 * @param {Array<number>} notificationIds - 要标记为已读的通知ID列表
 */
export const fetchMarkNotificationsRead = async (notificationIds) => {
  return fetchWithFallback('/admin/notification/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notificationIds })
  })
}
