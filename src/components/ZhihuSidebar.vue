<template>
  <aside class="zhihu-sidebar">
    <!-- 热榜 -->
    <div class="sidebar-card">
      <div class="card-header">
        <span class="card-title">🔥 热榜</span>
        <router-link to="/explore" class="card-more">更多 ›</router-link>
      </div>
      <div class="hot-list">
        <div 
          v-for="(topic, index) in hotTopics" 
          :key="topic.id"
          class="hot-item"
          @click="$router.push(`/article/${topic.id}`)"
        >
          <span class="hot-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
          <div class="hot-content">
            <div class="hot-title">{{ topic.title }}</div>
            <div class="hot-meta">{{ formatHot(topic.hot) }} 浏览</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐关注 -->
    <div class="sidebar-card">
      <div class="card-header">
        <span class="card-title">✨ 推荐关注</span>
      </div>
      <div class="recommend-users">
        <div 
          v-for="user in recommendUsers" 
          :key="user.id"
          class="recommend-user"
        >
          <img :src="user.avatar" class="user-avatar" />
          <div class="user-info">
            <div class="user-name">{{ user.username }}</div>
            <div class="user-bio">{{ user.bio }}</div>
          </div>
          <button 
            class="follow-btn"
            :class="{ followed: user.isFollowed }"
            @click="toggleFollow(user)"
          >
            {{ user.isFollowed ? '已关注' : '+ 关注' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 话题广场 -->
    <div class="sidebar-card">
      <div class="card-header">
        <span class="card-title">🏷️ 热门话题</span>
      </div>
      <div class="tag-cloud">
        <router-link 
          v-for="tag in popularTags" 
          :key="tag.id"
          :to="`/tag/${tag.name}`"
          class="tag-item"
        >
          {{ tag.name }}
          <span class="tag-count">{{ tag.articles }}</span>
        </router-link>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="sidebar-footer">
      <div class="footer-links">
        <a href="#">关于校园论坛</a>
        <a href="#">帮助中心</a>
        <a href="#">隐私政策</a>
      </div>
      <div class="copyright">© 2024 校园论坛</div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchHotArticles, fetchRecommendUsers, fetchTags, fetchFollowUser } from '@/utils/api'

// State
const hotTopics = ref([])
const recommendUsers = ref([])
const popularTags = ref([])

// 格式化浏览量数字
const formatHot = (num) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 关注/取消关注
const toggleFollow = async (user) => {
  user.isFollowed = !user.isFollowed
  await fetchFollowUser(user.id)
  ElMessage.success(user.isFollowed ? '关注成功' : '取消关注')
}

// 加载数据
onMounted(async () => {
  // 使用真实接口获取热榜（按浏览量排序）
  const hotResult = await fetchHotArticles()
  hotTopics.value = (hotResult.data || []).slice(0, 5).map(a => ({
    id: a.id,
    title: a.title,
    hot: a.views || 0,
    cover: a.cover || ''
  }))
  
  recommendUsers.value = fetchRecommendUsers().map(u => ({
    ...u,
    isFollowed: false
  }))
  
  popularTags.value = fetchTags().slice(0, 8)
})
</script>

<style scoped>
.zhihu-sidebar {
  width: 220px;
  flex-shrink: 0;
}

.sidebar-card {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f3f4f5;
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.card-more {
  font-size: 13px;
  color: #999;
  text-decoration: none;
}

.card-more:hover {
  color: #0084ff;
}

/* 热榜样式 */
.hot-list {
  padding: 10px 15px;
}

.hot-item {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  cursor: pointer;
  transition: background 0.3s;
}

.hot-item:hover {
  background: #f6f7f8;
  margin: 0 -15px;
  padding: 10px 15px;
  border-radius: 4px;
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

.hot-rank.rank-1 {
  color: #ff4d4f;
}

.hot-rank.rank-2 {
  color: #ff7a45;
}

.hot-rank.rank-3 {
  color: #ffa940;
}

.hot-content {
  flex: 1;
  min-width: 0;
}

.hot-title {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.hot-meta {
  font-size: 12px;
  color: #999;
}

/* 推荐用户样式 */
.recommend-users {
  padding: 10px 15px;
}

.recommend-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.user-bio {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follow-btn {
  padding: 5px 12px;
  border: 1px solid #0084ff;
  border-radius: 4px;
  background: #fff;
  color: #0084ff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.follow-btn:hover {
  background: #f0f9ff;
}

.follow-btn.followed {
  background: #f3f4f5;
  border-color: #e3e3e3;
  color: #999;
}

/* 话题标签样式 */
.tag-cloud {
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #f3f4f5;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s;
}

.tag-item:hover {
  background: #e3e3e3;
  color: #333;
}

.tag-count {
  font-size: 11px;
  color: #999;
}

/* 页脚样式 */
.sidebar-footer {
  padding: 20px 15px;
  text-align: center;
  font-size: 12px;
  color: #999;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}

.footer-links a {
  color: #999;
  text-decoration: none;
}

.footer-links a:hover {
  color: #0084ff;
}

.copyright {
  color: #bbb;
}
</style>
