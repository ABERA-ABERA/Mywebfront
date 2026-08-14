<template>
  <div class="discover-page">
    <ZhihuHeader :userInfo="userInfo" />
    
    <div class="discover-container">
      <div class="discover-main">
        <div class="page-header">
          <h1 class="page-title">发现</h1>
          <p class="page-desc">探索更多精彩内容</p>
        </div>

        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else class="article-grid">
          <div 
            v-for="article in articles" 
            :key="article.id"
            class="discover-card"
            @click="$router.push(`/article/${article.id}`)"
          >
            <!-- 头部：头像 + 作者 + 类型标签 -->
            <div class="card-header">
              <img :src="getAuthorAvatar(article)" class="card-avatar" />
              <div class="card-author-info">
                <span class="card-author-name">{{ getAuthorName(article) }}</span>
                <span class="card-author-time">{{ article.createTime || '' }}</span>
              </div>
              <span v-if="article.type === 'article'" class="card-type-tag type-article">文章</span>
              <span v-else class="card-type-tag type-shuoshuo">说说</span>
            </div>

            <!-- 内容区 -->
            <div class="card-body">
              <h3 v-if="article.title" class="card-title">{{ article.title }}</h3>
              <p class="card-summary">{{ article.summary || (article.content || '').substring(0, 80) }}</p>
              
              <!-- 图片网格 -->
              <div v-if="getArticleImages(article).length > 0" class="card-media-grid" :class="'grid-' + Math.min(getArticleImages(article).length, 9)">
                <div v-for="(img, idx) in getArticleImages(article).slice(0, 9)" :key="idx" class="card-grid-item">
                  <img :src="img" />
                </div>
              </div>
            </div>

            <!-- 底部统计 -->
            <div class="card-footer">
              <span class="card-stat-item">
                <svg class="card-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {{ article.likes || 0 }}
              </span>
              <span class="card-stat-item">
                <svg class="card-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {{ article.comments || 0 }}
              </span>
              <span class="card-stat-item">
                <svg class="card-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {{ article.views || 0 }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="!loading && articles.length === 0" class="empty-state">
          <p>暂无内容</p>
        </div>

        <div class="load-more" v-if="articles.length > 0">
          <el-button @click="loadMore" :loading="loadingMore">换一批看看</el-button>
        </div>
      </div>

      <!-- 右侧热榜 -->
      <aside class="discover-sidebar">
        <div class="sidebar-card">
          <h3 class="sidebar-title">🔥 热榜</h3>
          <div class="hot-list">
            <div 
              v-for="(item, index) in hotArticles" 
              :key="item.id"
              class="hot-item"
              @click="$router.push(`/article/${item.id}`)"
            >
              <span class="hot-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
              <div class="hot-info">
                <div class="hot-title">{{ item.title }}</div>
                <div class="hot-meta">{{ item.views || 0 }} 浏览</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import { fetchRandomArticles, fetchHotArticles } from '@/utils/api'

const userInfo = ref({})
const articles = ref([])
const hotArticles = ref([])
const loading = ref(true)
const loadingMore = ref(false)

const getAuthorAvatar = (article) => {
  if (article.author && article.author.avatar) return article.author.avatar
  return 'https://mywebpro.oss-cn-beijing.aliyuncs.com/ac052700-4c99-48a0-8e11-57d95c025220.jpg'
}

const getAuthorName = (article) => {
  if (article.author && article.author.username) return article.author.username
  return '匿名用户'
}

// 解析文章图片（统一展示，含封面）
const getArticleImages = (article) => {
  const imgs = []
  if (article.cover) imgs.push(article.cover)
  const raw = article.images
  if (raw) {
    if (Array.isArray(raw)) imgs.push(...raw.filter(u => u))
    else if (typeof raw === 'string' && raw) imgs.push(...raw.split(/[,，]/).map(u => u.trim()).filter(u => u))
  }
  return [...new Set(imgs)]
}

const parseArticles = (list) => {
  if (!Array.isArray(list)) return []
  return list.map(a => ({
    ...a,
    summary: a.summary || (a.content || '').substring(0, 100) + '...',
    author: a.author || { username: '匿名用户', avatar: '' },
    tags: a.tags || []
  }))
}

const loadArticles = async () => {
  const result = await fetchRandomArticles()
  return parseArticles(result.data)
}

const loadMore = async () => {
  loadingMore.value = true
  articles.value = await loadArticles()
  loadingMore.value = false
}

onMounted(async () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) userInfo.value = JSON.parse(saved)
  
  // 加载随机文章
  articles.value = await loadArticles()
  
  // 加载热榜
  const hotResult = await fetchHotArticles()
  hotArticles.value = parseArticles(hotResult.data).slice(0, 8)
  
  loading.value = false
})
</script>

<style scoped>
.discover-page { min-height: 100vh; background: #f6f7f8; }
.discover-container { max-width: 1200px; margin: 0 auto; padding: 20px; display: flex; gap: 20px; }
.discover-main { flex: 1; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: 600; color: #333; margin: 0 0 5px; }
.page-desc { font-size: 14px; color: #999; margin: 0; }
.loading-state { background: #fff; border-radius: 8px; padding: 20px; }
.article-grid { column-count: 2; column-gap: 12px; }
.discover-card { break-inside: avoid; margin-bottom: 12px; background: rgba(255,255,255,0.95); border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.discover-card:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,0,0,0.08); }

/* 卡片头部 */
.card-header { display: flex; align-items: center; gap: 8px; padding: 10px 12px; }
.card-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.card-author-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.card-author-name { font-weight: 600; color: #333; font-size: 12px; line-height: 1.3; }
.card-author-time { font-size: 11px; color: #999; line-height: 1.2; }
.card-type-tag { font-size: 10px; padding: 1px 6px; border-radius: 8px; line-height: 1.4; white-space: nowrap; flex-shrink: 0; align-self: center; }
.type-article { background: #e8f4fd; color: #0084ff; }
.type-shuoshuo { background: #f0f9eb; color: #67c23a; }

/* 内容区 */
.card-body { padding: 0 12px 8px; display: flex; flex-direction: column; gap: 4px; }
.card-title { font-size: 14px; font-weight: 600; color: #1a1a1a; line-height: 1.4; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-summary { font-size: 12px; color: #666; line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* 图片网格 */
.card-media-grid { display: grid; gap: 3px; margin-top: 4px; }
.card-media-grid.grid-1 { grid-template-columns: 1fr; max-width: 60%; }
.card-media-grid.grid-2, .card-media-grid.grid-4 { grid-template-columns: repeat(2, 1fr); }
.card-media-grid.grid-3 { grid-template-columns: repeat(3, 1fr); }
.card-media-grid.grid-5, .card-media-grid.grid-6, .card-media-grid.grid-7, .card-media-grid.grid-8, .card-media-grid.grid-9 { grid-template-columns: repeat(3, 1fr); }
.card-grid-item { position: relative; padding-top: 100%; overflow: hidden; border-radius: 4px; background: #f0f0f0; }
.card-grid-item img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }

/* 底部统计 */
.card-footer { display: flex; gap: 12px; padding: 6px 12px; border-top: 1px solid #f0f0f0; font-size: 11px; color: #999; }
.card-stat-item { display: flex; align-items: center; gap: 3px; }
.card-stat-icon { width: 12px; height: 12px; flex-shrink: 0; }
.empty-state { text-align: center; padding: 60px; color: #999; background: #fff; border-radius: 8px; }
.load-more { text-align: center; margin-top: 20px; }

/* 右侧热榜 */
.discover-sidebar { width: 280px; flex-shrink: 0; }
.sidebar-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); position: sticky; top: 80px; }
.sidebar-title { font-size: 16px; font-weight: 600; color: #333; margin: 0 0 15px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f5; }
.hot-list { display: flex; flex-direction: column; gap: 12px; }
.hot-item { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 6px; border-radius: 6px; transition: background 0.3s; }
.hot-item:hover { background: #f6f7f8; }
.hot-rank { width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #999; background: #f3f4f5; flex-shrink: 0; }
.hot-rank.rank-1 { background: #ff6b6b; color: #fff; }
.hot-rank.rank-2 { background: #ffa502; color: #fff; }
.hot-rank.rank-3 { background: #ffbe76; color: #fff; }
.hot-info { flex: 1; min-width: 0; }
.hot-title { font-size: 13px; color: #333; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hot-meta { font-size: 11px; color: #999; margin-top: 2px; }

@media (max-width: 900px) {
  .discover-container {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
  }
  .discover-sidebar {
    width: 100%;
  }
  .article-grid {
    column-count: 1;
  }
  .article-card {
    padding: 12px;
  }
  .article-card .card-avatar {
    width: 32px;
    height: 32px;
  }
  .article-card .card-title {
    font-size: 1rem;
  }
  .article-card .card-summary {
    font-size: 13px;
  }
  .article-card .card-stats {
    font-size: 12px;
  }
}
</style>
