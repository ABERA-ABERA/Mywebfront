<template>
  <div class="search-page">
    <ZhihuHeader :userInfo="userInfo" />
    
    <div class="search-container">
      <!-- 搜索框 -->
      <div class="search-header">
        <div class="search-input-wrapper">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索校园论坛内容、人或话题"
            @keyup.enter="handleSearch"
            class="search-input"
          />
          <span class="search-icon" @click="handleSearch">🔍</span>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="search-tabs">
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          综合
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'articles' }"
          @click="activeTab = 'articles'"
        >
          文章
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'users' }"
          @click="activeTab = 'users'"
        >
          用户
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'tags' }"
          @click="activeTab = 'tags'"
        >
          话题
        </button>
      </div>

      <!-- 搜索结果 -->
      <div class="search-results">
        <!-- 无搜索词时显示热搜推荐 -->
        <div v-if="!searchQuery.trim()" class="hot-search-section">
          <div class="hot-search-group">
            <h3 class="group-title">🔥 热门搜索</h3>
            <div class="hot-search-list">
              <div 
                v-for="(topic, index) in hotSearchTopics" 
                :key="topic.id"
                class="hot-search-item"
                @click="searchQuery = topic.title; handleSearch()"
              >
                <span class="hot-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                <span class="hot-title">{{ topic.title }}</span>
                <span class="hot-count">{{ formatHot(topic.hot) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 综合结果 -->
        <div v-if="activeTab === 'all'" class="result-section">
          <!-- 文章结果 -->
          <div v-if="filteredArticles.length > 0" class="result-group">
            <h3 class="group-title">文章</h3>
            <div 
              v-for="article in filteredArticles.slice(0, 3)" 
              :key="article.id"
              class="result-item article-result"
              @click="$router.push(`/article/${article.id}`)"
            >
              <h4 class="result-title">{{ article.title }}</h4>
              <p class="result-summary">{{ article.summary }}</p>
              <div class="result-meta">
                <span>{{ article.author.username }}</span>
                <span>·</span>
                <span>{{ article.createTime }}</span>
                <span>·</span>
                <span>👍 {{ article.likes }}</span>
              </div>
            </div>
          </div>

          <!-- 用户结果 -->
          <div v-if="filteredUsers.length > 0" class="result-group">
            <h3 class="group-title">用户</h3>
            <div 
              v-for="user in filteredUsers.slice(0, 3)" 
              :key="user.id"
              class="result-item user-result"
            >
              <img :src="user.avatar" class="user-avatar" @click="$router.push(`/profile/${user.id}`)" />
              <div class="user-info" @click="$router.push(`/profile/${user.id}`)">
                <div class="user-name">{{ user.username }}</div>
                <div class="user-bio">{{ user.bio }}</div>
                <div class="user-stats">
                  <span>{{ user.followers }} 关注者</span>
                  <span>·</span>
                  <span>{{ user.articles }} 文章</span>
                </div>
              </div>
              <button 
                class="search-follow-btn"
                :class="{ followed: user.isFollowed }"
                @click.stop="toggleFollow(user)"
              >
                {{ user.isFollowed ? '已关注' : '+ 关注' }}
              </button>
            </div>
          </div>

          <!-- 话题结果 -->
          <div v-if="filteredTags.length > 0" class="result-group">
            <h3 class="group-title">话题</h3>
            <div 
              v-for="tag in filteredTags.slice(0, 5)" 
              :key="tag.id"
              class="result-item tag-result"
              @click="$router.push(`/tag/${tag.name}`)"
            >
              <div class="tag-icon">#</div>
              <div class="tag-info">
                <div class="tag-name">{{ tag.name }}</div>
                <div class="tag-count">{{ tag.articles }} 篇文章</div>
              </div>
            </div>
          </div>

          <div v-if="noResults" class="no-results">
            未找到相关结果
          </div>
        </div>

        <!-- 文章结果 -->
        <div v-if="activeTab === 'articles'" class="result-section">
          <div 
            v-for="article in filteredArticles" 
            :key="article.id"
            class="result-item article-result"
            @click="$router.push(`/article/${article.id}`)"
          >
            <h4 class="result-title">{{ article.title }}</h4>
            <p class="result-summary">{{ article.summary }}</p>
            <div class="result-meta">
              <span>{{ article.author.username }}</span>
              <span>·</span>
              <span>{{ article.createTime }}</span>
              <span>·</span>
              <span>👍 {{ article.likes }}</span>
            </div>
          </div>
          <div v-if="filteredArticles.length === 0" class="no-results">
            未找到相关文章
          </div>
        </div>

        <!-- 用户结果 -->
        <div v-if="activeTab === 'users'" class="result-section">
          <div 
            v-for="user in filteredUsers" 
            :key="user.id"
            class="result-item user-result"
          >
            <img :src="user.avatar" class="user-avatar" @click="$router.push(`/profile/${user.id}`)" />
            <div class="user-info" @click="$router.push(`/profile/${user.id}`)">
              <div class="user-name">{{ user.username }}</div>
              <div class="user-bio">{{ user.bio }}</div>
              <div class="user-stats">
                <span>{{ user.followers }} 关注者</span>
                <span>·</span>
                <span>{{ user.articles }} 文章</span>
              </div>
            </div>
            <button 
              class="search-follow-btn"
              :class="{ followed: user.isFollowed }"
              @click.stop="toggleFollow(user)"
            >
              {{ user.isFollowed ? '已关注' : '+ 关注' }}
            </button>
          </div>
          <div v-if="filteredUsers.length === 0" class="no-results">
            未找到相关用户
          </div>
        </div>

        <!-- 话题结果 -->
        <div v-if="activeTab === 'tags'" class="result-section">
          <div 
            v-for="tag in filteredTags" 
            :key="tag.id"
            class="result-item tag-result"
            @click="$router.push(`/tag/${tag.name}`)"
          >
            <div class="tag-icon">#</div>
            <div class="tag-info">
              <div class="tag-name">{{ tag.name }}</div>
              <div class="tag-count">{{ tag.articles }} 篇文章</div>
            </div>
          </div>
          <div v-if="filteredTags.length === 0" class="no-results">
            未找到相关话题
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import { fetchArticleList, fetchHotTopics, fetchTags, fetchRecommendUsers, fetchFollowUser, fetchSearchUsers, fetchSearchArticles } from '@/utils/api'

const route = useRoute()
const router = useRouter()

// State
const userInfo = ref({})
const searchQuery = ref('')
const activeTab = ref('all')
const hotSearchTopics = ref([])
const allArticles = ref([])
const allUsers = ref([])
const allTags = ref([])

// 格式化热度
const formatHot = (num) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toString()
}

// 关注/取消关注
const toggleFollow = async (user) => {
  user.isFollowed = !user.isFollowed
  await fetchFollowUser(user.id)
}

// 解析 tags 字段（后端可能返回字符串或数组）
const parseTags = (tags) => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags.filter(t => t)
  if (typeof tags === 'string') return tags.split(/[,，]/).map(t => t.trim()).filter(t => t)
  return []
}

// 过滤后的结果（文章已从后端搜索，直接返回）
const filteredArticles = computed(() => {
  if (!searchQuery.value.trim()) return []
  return allArticles.value
})

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return []
  const query = searchQuery.value.toLowerCase()
  return allUsers.value.filter(u => 
    (u.username || '').toLowerCase().includes(query) ||
    (u.bio || '').toLowerCase().includes(query)
  )
})

const filteredTags = computed(() => {
  if (!searchQuery.value.trim()) return []
  const query = searchQuery.value.toLowerCase()
  return allTags.value.filter(t => 
    (t.name || '').toLowerCase().includes(query)
  )
})

const noResults = computed(() => {
  return filteredArticles.value.length === 0 && 
         filteredUsers.value.length === 0 && 
         filteredTags.value.length === 0
})

// 搜索
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  // 直接触发后端搜索
  await searchArticlesFromBackend(searchQuery.value)
  // 同步用户搜索
  const userResult = await fetchSearchUsers(searchQuery.value)
  const backendUsers = Array.isArray(userResult.data) ? userResult.data : []
  if (backendUsers.length > 0) {
    allUsers.value = backendUsers.map(u => ({
      id: u.id,
      username: u.username || u.name || '',
      avatar: u.avatar || '',
      bio: u.bio || '',
      isFollowed: u.isFollowed || false
    }))
  }
  // 更新路由
  router.push({ path: '/search', query: { q: searchQuery.value } })
}

// 解析文章列表（统一处理后端返回格式）
const parseArticleList = (data) => {
  let list = data || []
  if (!Array.isArray(list) && Array.isArray(list.list)) list = list.list
  if (!Array.isArray(list) && Array.isArray(list.records)) list = list.records
  if (!Array.isArray(list)) list = []
  return list.map(a => ({
    ...a,
    summary: a.summary || (a.content || '').substring(0, 100) + '...',
    author: a.author || { username: '匿名用户', avatar: '' },
    tags: parseTags(a.tags)
  }))
}

// 从后端搜索文章
const searchArticlesFromBackend = async (keyword) => {
  if (!keyword.trim()) {
    // 无关键词时加载全部文章
    const result = await fetchArticleList()
    allArticles.value = parseArticleList(result.data)
    return
  }
  console.log('[SearchPage] 搜索文章, keyword:', keyword)
  const result = await fetchSearchArticles(keyword)
  console.log('[SearchPage] 搜索结果:', result)
  allArticles.value = parseArticleList(result.data)
  console.log('[SearchPage] allArticles count:', allArticles.value.length)
}

// 监听路由变化，重新搜索
watch(() => route.query.q, async (newQuery) => {
  if (newQuery) {
    searchQuery.value = newQuery
    // 重新搜索文章
    await searchArticlesFromBackend(newQuery)
    // 重新搜索用户
    const userResult = await fetchSearchUsers(newQuery)
    const backendUsers = Array.isArray(userResult.data) ? userResult.data : []
    if (backendUsers.length > 0) {
      allUsers.value = backendUsers.map(u => ({
        id: u.id,
        username: u.username || u.name || '',
        avatar: u.avatar || '',
        bio: u.bio || '',
        isFollowed: u.isFollowed || false
      }))
    } else {
      allUsers.value = fetchRecommendUsers()
    }
  }
}, { immediate: true })

// 加载数据
onMounted(async () => {
  const savedUserInfo = localStorage.getItem('userInfo')
  if (savedUserInfo) {
    userInfo.value = JSON.parse(savedUserInfo)
  }
  
  if (route.query.q) {
    searchQuery.value = route.query.q
  }
  
  // 加载热搜
  const hotTopics = await fetchHotTopics()
  hotSearchTopics.value = hotTopics.slice(0, 5)
  
  // 从后端加载文章（如果有搜索词则搜索，否则加载全部）
  await searchArticlesFromBackend(searchQuery.value)
  
  // 加载用户和标签
  allUsers.value = fetchRecommendUsers()
  
  // 如果有搜索关键词，调用后端接口搜索用户
  if (searchQuery.value.trim()) {
    const userResult = await fetchSearchUsers(searchQuery.value)
    const backendUsers = Array.isArray(userResult.data) ? userResult.data : []
    if (backendUsers.length > 0) {
      allUsers.value = backendUsers.map(u => ({
        id: u.id,
        username: u.username || u.name || '',
        avatar: u.avatar || '',
        bio: u.bio || '',
        isFollowed: u.isFollowed || false
      }))
    }
  }
  allTags.value = fetchTags()
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #f6f7f8;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 12px 50px 12px 20px;
  border: 1px solid #e3e3e3;
  border-radius: 25px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #0084ff;
  box-shadow: 0 0 0 3px rgba(0, 132, 255, 0.1);
}

.search-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 18px;
}

.search-tabs {
  display: flex;
  gap: 20px;
  background: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
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

.search-results {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.result-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.group-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f5;
}

.result-item {
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.result-item:hover {
  background: #f6f7f8;
}

/* 文章结果 */
.article-result {
  border-bottom: 1px solid #f3f4f5;
}

.article-result:last-child {
  border-bottom: none;
}

.result-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.result-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.result-meta {
  display: flex;
  gap: 10px;
  font-size: 13px;
  color: #999;
}

/* 用户结果 */
.user-result {
  display: flex;
  gap: 15px;
  align-items: center;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.user-bio {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.user-stats {
  display: flex;
  gap: 10px;
  font-size: 13px;
  color: #999;
}

/* 搜索结果关注按钮 */
.search-follow-btn {
  padding: 5px 14px;
  border: 1px solid #0084ff;
  border-radius: 4px;
  background: #fff;
  color: #0084ff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: center;
}

.search-follow-btn:hover {
  background: #f0f9ff;
}

.search-follow-btn.followed {
  background: #f3f4f5;
  border-color: #e3e3e3;
  color: #999;
}

/* 话题结果 */
.tag-result {
  display: flex;
  gap: 15px;
  align-items: center;
}

.tag-icon {
  width: 40px;
  height: 40px;
  background: #0084ff;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
}

.tag-info {
  flex: 1;
}

.tag-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.tag-count {
  font-size: 13px;
  color: #999;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}

/* 热搜推荐样式 */
.hot-search-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.hot-search-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hot-search-list {
  display: flex;
  flex-direction: column;
}

.hot-search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s;
}

.hot-search-item:hover {
  background: #f6f7f8;
}

.hot-rank {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #999;
  flex-shrink: 0;
}

.hot-rank.rank-1 { color: #ff4d4f; }
.hot-rank.rank-2 { color: #ff7a45; }
.hot-rank.rank-3 { color: #ffa940; }

.hot-title {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.hot-count {
  font-size: 12px;
  color: #999;
}

@media (max-width: 900px) {
  .search-container {
    padding: 12px;
  }
  .search-input {
    padding: 10px 40px 10px 15px;
    font-size: 14px;
  }
  .search-tabs {
    gap: 15px;
  }
  .search-tab {
    font-size: 13px;
    padding: 6px 0;
  }
  .article-card {
    padding: 12px;
  }
  .article-card .card-title {
    font-size: 1rem;
  }
  .article-card .card-summary {
    font-size: 13px;
  }
}
</style>
