<template>
  <div class="home-page">
    <ZhihuHeader :userInfo="userInfo" />
    
    <div class="home-container">
      <!-- 左侧内容流 -->
      <main class="feed-main">
        <!-- 分类标签 -->
        <div class="feed-tabs">
          <button 
            class="tab-btn"
            :class="{ active: activeTab === 'recommend' }"
            @click="activeTab = 'recommend'"
          >
            推荐
          </button>
          <button 
            class="tab-btn"
            :class="{ active: activeTab === 'follow' }"
            @click="activeTab = 'follow'"
          >
            关注
          </button>
          <button 
            class="tab-btn"
            :class="{ active: activeTab === 'hot' }"
            @click="activeTab = 'hot'"
          >
            热榜
          </button>
        </div>

        <!-- 文章列表（QQ空间说说风格） -->
        <div class="feed-list">
          <div 
            v-for="article in displayArticles" 
            :key="article.id"
            class="shuoshuo-item"
            @click="$router.push(`/article/${article.id}`)"
          >
            <!-- 头部：头像 + 作者 + 时间 -->
            <div class="shuoshuo-header">
              <img :src="article.author.avatar || defaultAvatar" class="shuoshuo-avatar" />
              <div class="shuoshuo-user">
                <span class="shuoshuo-name">{{ article.author.username }}</span>
                <span class="shuoshuo-time">{{ article.createTime }}</span>
              </div>
            </div>

            <!-- 文字内容 -->
            <div class="shuoshuo-body">
              <h3 v-if="article.title" class="shuoshuo-title">{{ article.title }}</h3>
              <p class="shuoshuo-summary">{{ (article.summary || article.content || '').substring(0, 120) }}</p>

              <!-- 文章配图网格 -->
              <div v-if="getArticleImages(article).length > 0" class="post-media-grid" :class="'grid-' + Math.min(getArticleImages(article).length, 9)">
                <div v-for="(img, idx) in getArticleImages(article).slice(0, 9)" :key="idx" class="grid-item" @click.stop="openImageViewer(getArticleImages(article), idx)">
                  <img :src="img" />
                </div>
              </div>
            </div>

            <!-- 操作栏：点赞/评论/浏览/收藏 -->
            <div class="shuoshuo-actions">
              <span class="action-btn" :class="{ active: article.isLiked }" @click.stop="quickLike(article)">
                <svg class="action-icon" viewBox="0 0 24 24" :fill="article.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <em>{{ article.likes || '赞' }}</em>
              </span>
              <span class="action-btn" @click.stop="$router.push(`/article/${article.id}`)">
                <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <em>{{ article.comments || '评论' }}</em>
              </span>
              <span class="action-btn">
                <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <em>{{ article.views || '浏览' }}</em>
              </span>
              <span class="action-btn" :class="{ active: article.isCollected }" @click.stop="quickCollect(article)">
                <svg class="action-icon" viewBox="0 0 24 24" :fill="article.isCollected ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <em>收藏</em>
              </span>
            </div>
          </div>

          <div v-if="displayArticles.length === 0 && !isLoadingMore" class="empty-feed">
            {{ activeTab === 'follow' ? '还没有关注任何人，快去关注一些用户吧！' : '暂无内容' }}
          </div>

          <!-- 加载更多按钮 -->
          <div v-if="displayArticles.length > 0" class="load-more-wrapper">
            <button 
              v-if="hasMore" 
              class="load-more-btn" 
              :disabled="isLoadingMore"
              @click="loadMoreArticles"
            >
              {{ isLoadingMore ? '加载中...' : '加载更多' }}
            </button>
            <span v-else class="no-more-tip">没有更多了</span>
          </div>
        </div>
      </main>

      <!-- 右侧边栏 -->
      <ZhihuSidebar />
    </div>

    <!-- 图片查看器 -->
    <el-image-viewer
      v-if="showImageViewer"
      :url-list="currentViewImages"
      :initial-index="currentImageIndex"
      @close="closeImageViewer"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import ZhihuSidebar from '@/components/ZhihuSidebar.vue'
import { fetchArticleList, fetchArticleDetail, fetchHotArticles, fetchFollowingList, fetchLikeArticle, fetchCollectArticle, fetchUserInfo } from '@/utils/api'

const defaultAvatar = 'https://mywebpro.oss-cn-beijing.aliyuncs.com/ac052700-4c99-48a0-8e11-57d95c025220.jpg'

// State
const userInfo = ref({})
const activeTab = ref('recommend')
const articles = ref([])
const hotArticles = ref([])
const followingIds = ref([])

// 分页状态
const currentPage = ref(1)
const pageSize = 5
const hasMore = ref(true)
const isLoadingMore = ref(false)

// 图片查看器
const showImageViewer = ref(false)
const currentViewImages = ref([])
const currentImageIndex = ref(0)
const openImageViewer = (images, index) => { currentViewImages.value = images; currentImageIndex.value = index; showImageViewer.value = true }
const closeImageViewer = () => { showImageViewer.value = false; setTimeout(() => { currentViewImages.value = []; currentImageIndex.value = 0 }, 300) }

// 根据标签过滤文章
const displayArticles = computed(() => {
  if (activeTab.value === 'recommend') {
    return articles.value
  } else if (activeTab.value === 'follow') {
    // 只显示关注用户的文章
    if (followingIds.value.length === 0) return []
    return articles.value.filter(a => {
      const authorId = a.author?.id
      return followingIds.value.includes(authorId)
    })
  } else if (activeTab.value === 'hot') {
    // 按浏览量排序
    return [...articles.value].sort((a, b) => (b.views || 0) - (a.views || 0))
  }
  return articles.value
})

// 解析后端返回的文章数据
const parseArticles = (list) => {
  // 兼容分页格式: { list: [...] } / { records: [...] }
  let items = list
  if (!Array.isArray(items) && items && Array.isArray(items.list)) items = items.list
  if (!Array.isArray(items) && items && Array.isArray(items.records)) items = items.records
  if (!Array.isArray(items)) return []
  return items.map(article => {
    let dateStr = ''
    if (article.createTime) {
      if (Array.isArray(article.createTime)) {
        const [y, m, d] = article.createTime
        dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      } else {
        dateStr = article.createTime
      }
    }
    return {
      id: article.id,
      title: article.title || '',
      content: article.content || '',
      summary: article.summary || (article.content || '').substring(0, 100) + '...',
      author: {
        id: article.author?.id || 0,
        username: article.author?.username || '匿名用户',
        avatar: article.author?.avatar || defaultAvatar
      },
      images: article.images || [],
      tags: article.tags || [],
      likes: article.likes ?? 0,
      comments: article.comments ?? article.commentCount ?? 0,
      views: Math.max(0, article.views ?? 0),
      createTime: dateStr,
      isLiked: !!article.isLiked,
      isCollected: !!article.isCollected
    }
  })
}

// 渲染文章内容（支持HTML图片）
const renderArticleContent = (article) => {
  const content = article.content || ''
  if (!content) return article.summary || ''
  // 如果 content 包含 HTML 标签，直接渲染；否则当纯文本处理
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content
  }
  // 纯文本：换行转 <br>
  return content.replace(/\n/g, '<br>')
}

// 解析文章配图：优先 images 字段，否则从 content 中提取图片
const getArticleImages = (article) => {
  // 1. 优先用 images 字段
  const raw = article.images
  if (raw) {
    const imgs = Array.isArray(raw) ? raw.filter(u => u) :
      String(raw).split(/[,，]/).map(u => u.trim()).filter(u => u)
    if (imgs.length > 0) return imgs.slice(0, 9)
  }
  // 2. 从 content 中提取 <img> 标签的 src
  const content = article.content || ''
  if (content) {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g
    const matches = []
    let match
    while ((match = imgRegex.exec(content)) !== null) {
      if (match[1]) matches.push(match[1])
      if (matches.length >= 9) break
    }
    if (matches.length > 0) return matches
  }
  return []
}

// 点赞 - 立即 ±1 + 图标变色 + 后端同步
const quickLike = async (article) => {
  const wasLiked = article.isLiked
  const newLiked = !wasLiked
  // 立即更新：图标变色 + 数字 ±1
  article.isLiked = newLiked
  article.likes = Math.max(0, article.likes + (newLiked ? 1 : -1))
  try {
    await fetchLikeArticle(article.id, newLiked ? 'like' : 'unlike')
    // 后端返回后用真实值覆盖
    const detail = await fetchArticleDetail(article.id)
    if (detail.success && detail.data) {
      article.likes = Math.max(0, detail.data.likes ?? 0)
      article.views = Math.max(0, detail.data.views ?? article.views)
    }
  } catch (e) {
    console.error('点赞操作失败:', e)
    // 失败时回滚
    article.isLiked = wasLiked
    article.likes = Math.max(0, article.likes + (newLiked ? -1 : 1))
  }
}

// 收藏 - 图标立即切换 + 后端同步
const quickCollect = async (article) => {
  const wasCollected = article.isCollected
  article.isCollected = !wasCollected
  try {
    await fetchCollectArticle(article.id)
    const detail = await fetchArticleDetail(article.id)
    if (detail.success && detail.data) {
      article.likes = Math.max(0, detail.data.likes ?? article.likes)
      article.views = Math.max(0, detail.data.views ?? article.views)
    }
  } catch (e) {
    console.error('收藏操作失败:', e)
    article.isCollected = wasCollected
  }
}

// 加载数据
onMounted(async () => {
  // 先从 localStorage 加载（快速显示）
  const savedUserInfo = localStorage.getItem('userInfo')
  if (savedUserInfo) {
    userInfo.value = JSON.parse(savedUserInfo)
  }
  
  // 从后端获取最新用户信息（确保头像等字段正确）
  try {
    const userResult = await fetchUserInfo()
    if (userResult.success && userResult.data) {
      const data = userResult.data
      userInfo.value = {
        ...userInfo.value,
        id: data.id,
        username: data.username,
        avatar: data.avatar || userInfo.value.avatar,
        bio: data.bio,
        email: data.email
      }
      // 同步到 localStorage
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  } catch (e) {
    console.warn('获取用户信息失败:', e)
  }
  
  // 调用真实接口 /admin/article/list 分页加载
  currentPage.value = 1
  hasMore.value = true
  const result = await fetchArticleList(1, pageSize)
  console.log('[HomePage] article list result:', result)
  const firstPageData = result.data || []
  articles.value = parseArticles(firstPageData)
  // 如果返回数量少于 pageSize，说明没有更多了
  if (Array.isArray(firstPageData) && firstPageData.length < pageSize) {
    hasMore.value = false
  }
  console.log('[HomePage] parsed articles:', articles.value.length)
  
  // 加载热榜数据
  const hotResult = await fetchHotArticles()
  hotArticles.value = parseArticles(hotResult.data)
  
  // 加载关注列表
  const followResult = await fetchFollowingList()
  followingIds.value = (followResult.data || []).map(u => u.id || u)
})

// 加载更多文章
const loadMoreArticles = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  isLoadingMore.value = true
  try {
    const nextPage = currentPage.value + 1
    const result = await fetchArticleList(nextPage, pageSize)
    const newData = result.data || []
    const newArticles = parseArticles(newData)
    if (newArticles.length > 0) {
      articles.value = [...articles.value, ...newArticles]
      currentPage.value = nextPage
    }
    // 返回数量少于 pageSize 或为空，说明没有更多了
    if (Array.isArray(newData) && newData.length < pageSize) {
      hasMore.value = false
    }
  } catch (e) {
    console.error('加载更多文章失败:', e)
  } finally {
    isLoadingMore.value = false
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f6f7f8;
}

.home-container {
  max-width: 1800px;
  margin: 20px auto;
  display: flex;
  gap: 24px;
  padding: 0 30px;
}

.feed-main {
  flex: 1;
  min-width: 0;
}

.feed-tabs {
  display: flex;
  gap: 20px;
  background: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.tab-btn {
  padding: 8px 0;
  border: none;
  background: none;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #0084ff;
}

.tab-btn.active {
  color: #0084ff;
  border-bottom-color: #0084ff;
  font-weight: 500;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* QQ空间说说风格卡片 */
.shuoshuo-item {
  background: #fff;
  border-radius: 6px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.shuoshuo-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 头部：头像 + 名字 + 时间 */
.shuoshuo-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.shuoshuo-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.shuoshuo-user {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.shuoshuo-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.shuoshuo-time {
  font-size: 12px;
  color: #999;
}

/* 内容区 */
.shuoshuo-body {
  margin-bottom: 10px;
}
.shuoshuo-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.shuoshuo-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin: 0 0 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

/* 文章配图网格（紧凑美观） */
.post-media-grid {
  display: grid;
  gap: 4px;
  margin-top: 8px;
}
/* 1张图：较小尺寸，不占太多空间 */
.grid-1 { grid-template-columns: 1fr; max-width: 180px; }
.grid-1 .grid-item { padding-top: 75%; border-radius: 6px; }
/* 2张图：并排 */
.grid-2 { grid-template-columns: repeat(2, 1fr); max-width: 280px; }
.grid-2 .grid-item { padding-top: 66%; }
/* 3张图：横排 */
.grid-3 { grid-template-columns: repeat(3, 1fr); max-width: 300px; }
.grid-3 .grid-item { padding-top: 66%; }
/* 4张图：2x2 */
.grid-4 { grid-template-columns: repeat(2, 1fr); max-width: 280px; }
.grid-4 .grid-item { padding-top: 66%; }
/* 5-9张图：3列网格 */
.grid-5, .grid-6, .grid-7, .grid-8, .grid-9 { grid-template-columns: repeat(3, 1fr); max-width: 300px; }
.grid-5 .grid-item, .grid-6 .grid-item, .grid-7 .grid-item, .grid-8 .grid-item, .grid-9 .grid-item { padding-top: 66%; }
.grid-item {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
  background: #f0f0f0;
}
.grid-item img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}
.grid-item:hover img { transform: scale(1.03); }

/* 操作栏 */
.shuoshuo-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid #f3f3f3;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.action-btn:hover {
  background: #f3f4f5;
  color: #333;
}
.action-btn.active {
  color: #ff4d4f;
}
.action-btn.active:hover {
  background: #fff1f0;
}
.action-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.action-btn em {
  font-style: normal;
  font-size: 13px;
}

.empty-feed {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
  background: #fff;
  border-radius: 8px;
}

@media (max-width: 900px) {
  .home-container {
    flex-direction: column;
    padding: 0 12px;
    gap: 12px;
  }
  
  .feed-main {
    width: 100%;
  }

  .zhihu-sidebar {
    display: none;
  }

  .feed-tabs {
    padding: 10px 15px;
    gap: 15px;
  }

  .shuoshuo-item {
    padding: 12px;
  }

  .shuoshuo-avatar {
    width: 36px;
    height: 36px;
  }

  .shuoshuo-header {
    gap: 8px;
    margin-bottom: 8px;
  }

  .shuoshuo-name {
    font-size: 13px;
  }

  .shuoshuo-time {
    font-size: 11px;
  }

  .shuoshuo-title {
    font-size: 1rem;
  }

  .shuoshuo-summary {
    font-size: 13px;
  }

  .post-media-grid {
    gap: 3px;
  }

  .grid-1 { max-width: 160px; }
  .grid-2, .grid-4 { max-width: 240px; }
  .grid-3, .grid-5, .grid-6, .grid-7, .grid-8, .grid-9 { max-width: 260px; }

  .shuoshuo-actions {
    gap: 2px;
  }

  .action-btn {
    padding: 4px 8px;
    font-size: 12px;
  }

  .action-icon {
    width: 16px;
    height: 16px;
  }
}

/* 加载更多按钮 */
.load-more-wrapper {
  text-align: center;
  padding: 20px 0;
}

.load-more-btn {
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #666;
  padding: 10px 32px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.load-more-btn:hover:not(:disabled) {
  background: #f0f6ff;
  border-color: #0084ff;
  color: #0084ff;
}

.load-more-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.no-more-tip {
  color: #999;
  font-size: 13px;
}
</style>
