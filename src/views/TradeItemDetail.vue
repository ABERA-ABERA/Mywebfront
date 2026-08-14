<template>
  <div class="detail-page">
    <ZhihuHeader :userInfo="userInfo" />

    <div class="detail-container" v-if="item">
      <!-- 返回按钮 -->
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="back-icon">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        返回
      </button>

      <div class="detail-layout">
        <!-- 左侧：图片区域 -->
        <div class="detail-gallery">
          <div class="gallery-main">
            <img :src="currentImage" class="gallery-img" />
          </div>
          <div class="gallery-thumbs" v-if="item.images && item.images.length > 1">
            <div
              v-for="(img, idx) in item.images"
              :key="idx"
              class="thumb-item"
              :class="{ active: currentImageIdx === idx }"
              @click="currentImageIdx = idx"
            >
              <img :src="img" class="thumb-img" />
            </div>
          </div>
        </div>

        <!-- 右侧：信息区域 -->
        <div class="detail-info">
          <h1 class="detail-title">{{ item.title }}</h1>

          <div class="detail-price-row">
            <span class="detail-price">¥{{ item.price }}</span>
            <span class="detail-original">原价 ¥{{ item.originalPrice }}</span>
            <span class="detail-discount">{{ Math.round((item.price / item.originalPrice) * 100) / 10 }}折</span>
          </div>

          <div class="detail-tags">
            <span class="detail-tag">{{ item.condition }}</span>
            <span class="detail-tag">{{ item.category }}</span>
            <span class="detail-tag">{{ item.location }}</span>
          </div>

          <div class="detail-section">
            <h3 class="section-title">商品描述</h3>
            <p class="detail-desc">{{ item.description }}</p>
          </div>

          <div class="detail-section">
            <h3 class="section-title">卖家信息</h3>
            <div class="seller-card">
              <img :src="item.seller.avatar" class="seller-avatar" style="cursor:pointer" @click="$router.push(`/profile/${item.seller.id}`)" />
              <div class="seller-detail">
                <span class="seller-name" style="cursor:pointer" @click="$router.push(`/profile/${item.seller.id}`)">{{ item.seller.username }}</span>
                <span class="seller-bio">{{ item.seller.bio }}</span>
              </div>
              <button class="contact-btn" @click="handleContact">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="contact-icon">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                联系卖家
              </button>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-meta">
              <span>{{ item.views }}次浏览</span>
              <span>·</span>
              <span>{{ item.createTime }}发布</span>
            </div>
          </div>

          <div class="detail-actions">
            <button class="action-primary" @click="handleBuy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              我想要
            </button>
            <button class="action-secondary" :class="{ active: isLiked }" @click="isLiked = !isLiked">
              <svg viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" class="action-icon">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              收藏
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import { fetchTradeItemDetail, fetchUserInfo } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const userInfo = ref({})
const item = ref(null)
const currentImageIdx = ref(0)
const isLiked = ref(false)

const currentImage = computed(() => {
  if (!item.value || !item.value.images) return ''
  return item.value.images[currentImageIdx.value] || item.value.images[0]
})

const handleContact = () => {
  ElMessage.info('聊天功能开发中，请通过校园论坛私信联系卖家')
}

const handleBuy = () => {
  router.push({
    path: '/order',
    query: {
      type: 'trade',
      itemId: route.params.id,
      title: item.value.title,
      price: item.value.price,
      image: item.value.images?.[0] || '',
      sellerId: item.value.seller.id,
      sellerName: item.value.seller.username
    }
  })
}

onMounted(async () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) userInfo.value = JSON.parse(saved)

  try {
    const r = await fetchUserInfo()
    if (r.data) userInfo.value = { ...userInfo.value, ...r.data }
  } catch (e) { /* ignore */ }

  const result = await fetchTradeItemDetail(route.params.id)
  if (result.data) {
    item.value = result.data
  }
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #f6f7f8;
}

.detail-container {
  max-width: 1100px;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-icon {
  width: 16px;
  height: 16px;
}

.detail-layout {
  display: flex;
  gap: 24px;
}

/* 左侧图片区 */
.detail-gallery {
  width: 480px;
  flex-shrink: 0;
}

.gallery-main {
  width: 100%;
  padding-top: 100%;
  position: relative;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.gallery-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fafafa;
}

.gallery-thumbs {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.thumb-item {
  width: 64px;
  height: 64px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s;
}

.thumb-item.active {
  border-color: #0084ff;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右侧信息区 */
.detail-info {
  flex: 1;
  min-width: 0;
}

.detail-title {
  font-size: 22px;
  font-weight: 600;
  color: #222;
  line-height: 1.4;
  margin: 0 0 16px;
}

.detail-price-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fff5f5;
  border-radius: 8px;
}

.detail-price {
  font-size: 28px;
  font-weight: 700;
  color: #ff4d4f;
}

.detail-original {
  font-size: 14px;
  color: #bbb;
  text-decoration: line-through;
}

.detail-discount {
  padding: 2px 6px;
  background: #ff4d4f;
  color: #fff;
  font-size: 11px;
  border-radius: 3px;
  font-weight: 500;
}

.detail-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.detail-tag {
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
  margin: 0 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-desc {
  font-size: 14px;
  color: #555;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 卖家卡片 */
.seller-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.seller-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.seller-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.seller-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.seller-bio {
  font-size: 12px;
  color: #999;
}

.contact-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: 1px solid #0084ff;
  border-radius: 20px;
  background: #fff;
  color: #0084ff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.contact-btn:hover {
  background: #f0f9ff;
}

.contact-icon {
  width: 14px;
  height: 14px;
}

.detail-meta {
  display: flex;
  gap: 6px;
  font-size: 12px;
  color: #bbb;
}

/* 底部操作栏 */
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-secondary:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.action-secondary.active {
  border-color: #ff4d4f;
  color: #ff4d4f;
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

@media (max-width: 900px) {
  .detail-layout {
    flex-direction: column;
  }

  .detail-gallery {
    width: 100%;
  }

  .detail-container {
    padding: 0 12px;
  }
}
</style>
