<template>
  <div class="detail-page">
    <ZhihuHeader :userInfo="userInfo" />

    <div class="detail-container" v-if="task">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="back-icon">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        返回
      </button>

      <div class="detail-card">
        <!-- 头部：标题 + 赏金 -->
        <div class="card-header">
          <h1 class="task-title">{{ task.title }}</h1>
          <div class="reward-badge">
            <span class="reward-label">赏金</span>
            <span class="reward-amount">¥{{ task.reward }}</span>
          </div>
        </div>

        <!-- 标签 -->
        <div class="task-tags">
          <span class="task-tag">{{ task.category }}</span>
          <span v-for="tag in task.tags" :key="tag" class="task-tag">{{ tag }}</span>
        </div>

        <!-- 描述 -->
        <div class="detail-section">
          <h3 class="section-title">任务描述</h3>
          <p class="task-desc">{{ task.description }}</p>
        </div>

        <!-- 路线信息 -->
        <div class="detail-section">
          <h3 class="section-title">任务路线</h3>
          <div class="route-card">
            <div class="route-point">
              <div class="point-dot from"></div>
              <div class="point-info">
                <span class="point-label">出发地</span>
                <span class="point-address">{{ task.fromLocation }}</span>
              </div>
            </div>
            <div class="route-line"></div>
            <div class="route-point">
              <div class="point-dot to"></div>
              <div class="point-info">
                <span class="point-label">目的地</span>
                <span class="point-address">{{ task.toLocation }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 截止时间 -->
        <div class="detail-section">
          <h3 class="section-title">时间要求</h3>
          <div class="deadline-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="deadline-icon">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>请在 <strong>{{ task.deadline }}</strong> 前完成</span>
          </div>
        </div>

        <!-- 发布者信息 -->
        <div class="detail-section">
          <h3 class="section-title">发布者</h3>
          <div class="publisher-card">
            <img :src="task.publisher.avatar" class="publisher-avatar" style="cursor:pointer" @click="$router.push(`/profile/${task.publisher.id}`)" />
            <div class="publisher-info">
              <span class="publisher-name" style="cursor:pointer" @click="$router.push(`/profile/${task.publisher.id}`)">{{ task.publisher.username }}</span>
              <span class="publisher-bio">{{ task.publisher.bio }}</span>
            </div>
          </div>
        </div>

        <!-- 元数据 -->
        <div class="detail-meta">
          <span>{{ task.createTime }}发布</span>
        </div>

        <!-- 操作栏 -->
        <div class="detail-actions">
          <button class="action-primary" @click="handleAccept">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            接受任务
          </button>
          <button class="action-secondary" @click="handleContact">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            联系发布者
          </button>
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import { fetchErrandTaskDetail, fetchUserInfo } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const userInfo = ref({})
const task = ref(null)

const handleAccept = () => {
  router.push({
    path: '/order',
    query: {
      type: 'errand',
      taskId: route.params.id,
      title: task.value.title,
      reward: task.value.reward,
      category: task.value.category,
      fromLocation: task.value.fromLocation,
      toLocation: task.value.toLocation,
      publisherId: task.value.publisher.id,
      publisherName: task.value.publisher.username
    }
  })
}

const handleContact = () => {
  ElMessage.info('请通过校园论坛私信联系发布者')
}

onMounted(async () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) userInfo.value = JSON.parse(saved)

  try {
    const r = await fetchUserInfo()
    if (r.data) userInfo.value = { ...userInfo.value, ...r.data }
  } catch (e) { /* ignore */ }

  const result = await fetchErrandTaskDetail(route.params.id)
  if (result.data) {
    task.value = result.data
  }
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #f6f7f8;
}

.detail-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 24px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  background: #fff;
  border-radius: 6px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
}

.back-btn:hover {
  color: #0084ff;
}

.back-icon {
  width: 16px;
  height: 16px;
}

.detail-card {
  background: #fff;
  border-radius: 10px;
  padding: 28px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.task-title {
  font-size: 22px;
  font-weight: 600;
  color: #222;
  line-height: 1.4;
  margin: 0;
  flex: 1;
}

.reward-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff6b6b, #ff4d4f);
  border-radius: 10px;
  color: #fff;
  flex-shrink: 0;
}

.reward-label {
  font-size: 11px;
  opacity: 0.9;
}

.reward-amount {
  font-size: 24px;
  font-weight: 700;
}

.task-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.task-tag {
  padding: 4px 10px;
  background: #f0f9ff;
  color: #0084ff;
  font-size: 12px;
  border-radius: 4px;
}

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.task-desc {
  font-size: 14px;
  color: #555;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 路线卡片 */
.route-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.route-point {
  display: flex;
  align-items: center;
  gap: 12px;
}

.point-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.point-dot.from {
  background: #0084ff;
}

.point-dot.to {
  background: #52c41a;
}

.point-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.point-label {
  font-size: 11px;
  color: #999;
}

.point-address {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.route-line {
  width: 2px;
  height: 24px;
  background: #e0e0e0;
  margin-left: 5px;
  margin-top: 4px;
  margin-bottom: 4px;
}

/* 截止时间 */
.deadline-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fffbe6;
  border-radius: 6px;
  font-size: 14px;
  color: #555;
}

.deadline-icon {
  width: 18px;
  height: 18px;
  color: #faad14;
  flex-shrink: 0;
}

/* 发布者卡片 */
.publisher-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.publisher-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.publisher-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.publisher-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.publisher-bio {
  font-size: 12px;
  color: #999;
}

.detail-meta {
  font-size: 12px;
  color: #bbb;
  margin-bottom: 16px;
}

/* 操作栏 */
.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.action-primary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 0;
  border: none;
  border-radius: 8px;
  background: #0084ff;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.action-primary:hover {
  background: #0077e6;
}

.action-secondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-secondary:hover {
  border-color: #0084ff;
  color: #0084ff;
}

.action-icon {
  width: 18px;
  height: 18px;
}

.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .detail-container {
    padding: 0 12px;
  }

  .detail-card {
    padding: 20px 16px;
  }

  .card-header {
    flex-direction: column;
  }

  .reward-badge {
    flex-direction: row;
    gap: 6px;
    align-self: flex-start;
  }
}
</style>
