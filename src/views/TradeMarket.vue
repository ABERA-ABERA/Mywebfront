<template>
  <div class="trade-page">
    <ZhihuHeader :userInfo="userInfo" />

    <div class="trade-container">
      <!-- 顶部模块切换：二手交易 / 跑腿接单 -->
      <div class="module-tabs">
        <button class="module-tab" :class="{ active: activeModule === 'trade' }" @click="activeModule = 'trade'">
          <svg class="module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          二手交易
        </button>
        <button class="module-tab" :class="{ active: activeModule === 'errand' }" @click="activeModule = 'errand'">
          <svg class="module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          跑腿接单
        </button>
      </div>

      <!-- ========== 二手交易模块 ========== -->
      <div v-if="activeModule === 'trade'" class="module-content">
        <!-- 分类筛选 -->
        <div class="category-bar">
          <button
            v-for="cat in tradeCategories"
            :key="cat.id"
            class="cat-btn"
            :class="{ active: tradeCat === cat.id }"
            @click="tradeCat = cat.id"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            {{ cat.name }}
          </button>
          <button class="publish-btn" @click="$router.push('/trade/publish')">
            <svg class="publish-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            发布闲置
          </button>
        </div>

        <!-- 商品瀑布流网格 -->
        <div class="item-grid">
          <div
            v-for="item in filteredTradeItems"
            :key="item.id"
            class="item-card"
            @click="$router.push(`/trade/item/${item.id}`)"
          >
            <div class="item-cover-wrap">
              <img :src="item.images[0]" class="item-cover" />
              <span class="item-condition">{{ item.condition }}</span>
            </div>
            <div class="item-info">
              <h4 class="item-title">{{ item.title }}</h4>
              <div class="item-price-row">
                <span class="item-price">¥{{ item.price }}</span>
                <span class="item-original">¥{{ item.originalPrice }}</span>
              </div>
              <div class="item-seller">
                <img :src="item.seller.avatar" class="seller-avatar" />
                <span class="seller-name">{{ item.seller.username }}</span>
                <span class="item-views">{{ item.views }}浏览</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredTradeItems.length === 0" class="empty-state">
          <p>暂无相关商品</p>
        </div>
      </div>

      <!-- ========== 跑腿接单模块 ========== -->
      <div v-if="activeModule === 'errand'" class="module-content">
        <!-- 分类筛选 -->
        <div class="category-bar">
          <button
            v-for="cat in errandCategories"
            :key="cat.id"
            class="cat-btn"
            :class="{ active: errandCat === cat.id }"
            @click="errandCat = cat.id"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            {{ cat.name }}
          </button>
          <button class="publish-btn" @click="$router.push('/errand/publish')">
            <svg class="publish-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            发布任务
          </button>
        </div>

        <!-- 任务列表 -->
        <div class="task-list">
          <div
            v-for="task in filteredErrandTasks"
            :key="task.id"
            class="task-card"
            @click="$router.push(`/errand/task/${task.id}`)"
          >
            <div class="task-header">
              <div class="task-title-row">
                <h4 class="task-title">{{ task.title }}</h4>
                <span class="task-reward">¥{{ task.reward }}</span>
              </div>
              <div class="task-tags">
                <span v-for="tag in task.tags" :key="tag" class="task-tag">{{ tag }}</span>
              </div>
            </div>
            <p class="task-desc">{{ task.description }}</p>
            <div class="task-route">
              <span class="route-from">{{ task.fromLocation }}</span>
              <svg class="route-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
              <span class="route-to">{{ task.toLocation }}</span>
            </div>
            <div class="task-footer">
              <div class="task-publisher">
                <img :src="task.publisher.avatar" class="publisher-avatar" />
                <span class="publisher-name">{{ task.publisher.username }}</span>
              </div>
              <div class="task-meta">
                <span class="task-deadline">
                  <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {{ task.deadline }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredErrandTasks.length === 0" class="empty-state">
          <p>暂无相关任务</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import {
  fetchTradeItemList, fetchErrandTaskList,
  fetchTradeCategories, fetchErrandCategories,
  fetchUserInfo
} from '@/utils/api'

const route = useRoute()
const userInfo = ref({})
const activeModule = ref('trade')

// 二手交易
const tradeCategories = ref([])
const tradeItems = ref([])
const tradeCat = ref(0)

// 跑腿接单
const errandCategories = ref([])
const errandTasks = ref([])
const errandCat = ref(0)

const filteredTradeItems = computed(() => {
  if (tradeCat.value === 0) return tradeItems.value
  const catName = tradeCategories.value.find(c => c.id === tradeCat.value)?.name
  return tradeItems.value.filter(i => i.category === catName)
})

const filteredErrandTasks = computed(() => {
  if (errandCat.value === 0) return errandTasks.value
  const catName = errandCategories.value.find(c => c.id === errandCat.value)?.name
  return errandTasks.value.filter(t => t.category === catName)
})

onMounted(async () => {
  // 检查 URL 参数是否指定了 errand tab
  if (route.query.tab === 'errand') {
    activeModule.value = 'errand'
  }

  const saved = localStorage.getItem('userInfo')
  if (saved) userInfo.value = JSON.parse(saved)

  try {
    const r = await fetchUserInfo()
    if (r.data) userInfo.value = { ...userInfo.value, ...r.data }
  } catch (e) { /* ignore */ }

  tradeCategories.value = fetchTradeCategories()
  errandCategories.value = fetchErrandCategories()

  const tradeResult = await fetchTradeItemList()
  tradeItems.value = tradeResult.data || []

  const errandResult = await fetchErrandTaskList()
  errandTasks.value = errandResult.data || []
})
</script>

<style scoped>
.trade-page {
  min-height: 100vh;
  background: #f6f7f8;
}

.trade-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 24px;
}

/* 模块切换标签 */
.module-tabs {
  display: flex;
  gap: 0;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.module-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 0;
  border: none;
  background: #fff;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.module-tab:hover {
  color: #0084ff;
  background: #f0f9ff;
}

.module-tab.active {
  color: #0084ff;
  border-bottom-color: #0084ff;
  background: #f0f9ff;
}

.module-icon {
  width: 20px;
  height: 20px;
}

/* 分类栏 */
.category-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.cat-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.cat-btn:hover {
  border-color: #0084ff;
  color: #0084ff;
}

.cat-btn.active {
  background: #0084ff;
  border-color: #0084ff;
  color: #fff;
}

.cat-icon {
  font-size: 14px;
}

.publish-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 6px 16px;
  border: none;
  border-radius: 20px;
  background: #0084ff;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.publish-btn:hover {
  background: #0077e6;
}

.publish-icon {
  width: 14px;
  height: 14px;
}

/* ========== 商品瀑布流网格 ========== */
.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.item-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.item-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.item-cover-wrap {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
  background: #f0f0f0;
}

.item-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.item-card:hover .item-cover {
  transform: scale(1.05);
}

.item-condition {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 11px;
  border-radius: 3px;
}

.item-info {
  padding: 10px 12px 12px;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 8px;
}

.item-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff4d4f;
}

.item-original {
  font-size: 12px;
  color: #bbb;
  text-decoration: line-through;
}

.item-seller {
  display: flex;
  align-items: center;
  gap: 6px;
}

.seller-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.seller-name {
  font-size: 12px;
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-views {
  font-size: 11px;
  color: #bbb;
}

/* ========== 任务列表 ========== */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.task-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}

.task-header {
  margin-bottom: 8px;
}

.task-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.task-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.task-reward {
  font-size: 20px;
  font-weight: 700;
  color: #ff4d4f;
  white-space: nowrap;
}

.task-tags {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.task-tag {
  padding: 2px 8px;
  background: #f0f9ff;
  color: #0084ff;
  font-size: 11px;
  border-radius: 3px;
}

.task-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-route {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 10px;
  font-size: 13px;
}

.route-from, .route-to {
  color: #555;
}

.route-arrow {
  width: 16px;
  height: 16px;
  color: #0084ff;
  flex-shrink: 0;
}

.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f3f3f3;
}

.task-publisher {
  display: flex;
  align-items: center;
  gap: 6px;
}

.publisher-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.publisher-name {
  font-size: 13px;
  color: #666;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-deadline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.meta-icon {
  width: 14px;
  height: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 8px;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .trade-container {
    padding: 0 12px;
    margin: 12px auto;
  }

  .item-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .module-tab {
    font-size: 14px;
    padding: 12px 0;
  }

  .category-bar {
    padding: 10px 12px;
    gap: 6px;
  }

  .cat-btn {
    padding: 4px 10px;
    font-size: 12px;
  }

  .task-card {
    padding: 12px 14px;
  }
}
</style>
