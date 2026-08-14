<template>
  <div class="order-page">
    <ZhihuHeader :userInfo="userInfo" />

    <div class="order-container">
      <!-- 顶部返回 -->
      <div class="order-top-bar">
        <button class="back-btn" @click="$router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="back-icon">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          返回
        </button>
        <span class="page-title">{{ isTradeOrder ? '确认订单' : '接单确认' }}</span>
      </div>

      <!-- 二手商品下单 -->
      <div v-if="isTradeOrder" class="order-section">
        <!-- 卖家信息条 -->
        <div class="seller-bar">
          <div class="seller-avatar-wrap">
            <img :src="orderData.sellerAvatar || defaultAvatar" class="seller-avatar" />
          </div>
          <span class="seller-name">{{ orderData.sellerName || '卖家' }}</span>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <!-- 商品信息卡片 -->
        <div class="goods-card">
          <img :src="orderData.image || 'https://via.placeholder.com/100x100/f6f7f8/999?text=商品图片'" class="goods-img" />
          <div class="goods-info">
            <h3 class="goods-title">{{ orderData.title || '商品' }}</h3>
            <div class="goods-tags">
              <span class="goods-tag">闲鱼担保</span>
              <span class="goods-tag">验货宝</span>
            </div>
            <div class="goods-price-row">
              <span class="goods-price">¥{{ orderData.price || '0' }}</span>
              <span class="goods-shipping">包邮</span>
            </div>
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="order-info-card">
          <div class="info-row">
            <span class="info-label">商品金额</span>
            <span class="info-value">¥{{ orderData.price || '0' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">运费</span>
            <span class="info-value free">免运费</span>
          </div>
          <div class="info-row highlight">
            <span class="info-label">实付款</span>
            <span class="info-value price">¥{{ orderData.price || '0' }}</span>
          </div>
        </div>

        <!-- 交易方式 -->
        <div class="trade-method-card">
          <h4 class="method-title">交易方式</h4>
          <div class="method-options">
            <div
              class="method-option"
              :class="{ active: tradeMethod === 'face' }"
              @click="tradeMethod = 'face'"
            >
              <svg class="method-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              <div class="method-text">
                <span class="method-name">面交</span>
                <span class="method-desc">校园内当面交易</span>
              </div>
              <div class="method-check" :class="{ checked: tradeMethod === 'face' }">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
            <div
              class="method-option"
              :class="{ active: tradeMethod === 'delivery' }"
              @click="tradeMethod = 'delivery'"
            >
              <svg class="method-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <div class="method-text">
                <span class="method-name">代取</span>
                <span class="method-desc">委托跑腿同学代取</span>
              </div>
              <div class="method-check" :class="{ checked: tradeMethod === 'delivery' }">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- 留言 -->
        <div class="remark-card">
          <h4 class="remark-title">给卖家留言（选填）</h4>
          <textarea
            v-model="remark"
            class="remark-input"
            placeholder="请输入你想对卖家说的话..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- 跑腿任务接单 -->
      <div v-else class="order-section">
        <!-- 任务信息卡片 -->
        <div class="errand-order-card">
          <div class="errand-header">
            <span class="errand-category">{{ orderData.category || '任务' }}</span>
            <div class="errand-reward">
              <span class="reward-label">赏金</span>
              <span class="reward-amount">¥{{ orderData.reward || '0' }}</span>
            </div>
          </div>
          <h3 class="errand-title">{{ orderData.title || '跑腿任务' }}</h3>

          <!-- 路线信息 -->
          <div class="route-mini">
            <div class="route-stop">
              <div class="stop-dot from"></div>
              <span class="stop-text">{{ orderData.fromLocation || '出发地' }}</span>
            </div>
            <div class="route-arrow">
              <div class="arrow-line"></div>
              <svg class="arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
            <div class="route-stop">
              <div class="stop-dot to"></div>
              <span class="stop-text">{{ orderData.toLocation || '目的地' }}</span>
            </div>
          </div>

          <div class="errand-publisher">
            <span class="publisher-label">委托人</span>
            <span class="publisher-name">{{ orderData.publisherName || '用户' }}</span>
          </div>
        </div>

        <!-- 接单信息 -->
        <div class="order-info-card">
          <div class="info-row">
            <span class="info-label">任务赏金</span>
            <span class="info-value">¥{{ orderData.reward || '0' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">平台服务费</span>
            <span class="info-value">¥0.00</span>
          </div>
          <div class="info-row highlight">
            <span class="info-label">预计收入</span>
            <span class="info-value price">¥{{ orderData.reward || '0' }}</span>
          </div>
        </div>

        <!-- 接单须知 -->
        <div class="notice-card">
          <h4 class="notice-title">接单须知</h4>
          <ul class="notice-list">
            <li>接单后请及时联系委托人确认任务详情</li>
            <li>完成任务后需委托人确认方可获得赏金</li>
            <li>如遇问题请通过平台私信沟通解决</li>
            <li>请遵守校园文明公约和平台规则</li>
          </ul>
        </div>

        <!-- 留言 -->
        <div class="remark-card">
          <h4 class="remark-title">给委托人留言（选填）</h4>
          <textarea
            v-model="remark"
            class="remark-input"
            placeholder="请输入你想对委托人说的话..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- 底部提交栏 -->
      <div class="order-bottom-bar">
        <div class="total-section">
          <span class="total-label">{{ isTradeOrder ? '实付款' : '预计收入' }}</span>
          <span class="total-price">¥{{ isTradeOrder ? (orderData.price || '0') : (orderData.reward || '0') }}</span>
        </div>
        <button class="submit-btn" :class="{ disabled: submitting }" @click="handleSubmit">
          {{ submitting ? '提交中...' : (isTradeOrder ? '提交订单' : '确认接单') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import { fetchUserInfo } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const userInfo = ref({})
const remark = ref('')
const tradeMethod = ref('face')
const submitting = ref(false)
const defaultAvatar = 'https://mywebpro.oss-cn-beijing.aliyuncs.com/ac052700-4c99-48a0-8e11-57d95c025220.jpg'

const isTradeOrder = computed(() => route.query.type === 'trade')

const orderData = computed(() => {
  if (isTradeOrder.value) {
    return {
      title: route.query.title,
      price: route.query.price,
      image: route.query.image,
      sellerId: route.query.sellerId,
      sellerName: route.query.sellerName,
      sellerAvatar: ''
    }
  } else {
    return {
      title: route.query.title,
      reward: route.query.reward,
      category: route.query.category,
      fromLocation: route.query.fromLocation,
      toLocation: route.query.toLocation,
      publisherId: route.query.publisherId,
      publisherName: route.query.publisherName
    }
  }
})

const handleSubmit = async () => {
  if (submitting.value) return
  submitting.value = true

  setTimeout(() => {
    submitting.value = false
    if (isTradeOrder.value) {
      ElMessage.success('订单提交成功！请等待卖家确认')
    } else {
      ElMessage.success('已成功接单！请及时联系委托人')
    }
    router.push('/trade')
  }, 1000)
}

onMounted(async () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) userInfo.value = JSON.parse(saved)

  try {
    const r = await fetchUserInfo()
    if (r.data) userInfo.value = { ...userInfo.value, ...r.data }
  } catch (e) { /* ignore */ }
})
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background: #f6f7f8;
  padding-bottom: 80px;
}

.order-container {
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
  padding: 0 16px;
}

.order-top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  position: sticky;
  top: 0;
  background: #f6f7f8;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.back-btn:hover {
  background: #e8e8e8;
}

.back-icon {
  width: 16px;
  height: 16px;
  color: #555;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: #222;
}

/* 卖家信息条 */
.seller-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 10px 10px 0 0;
  border-bottom: 1px solid #f0f0f0;
}

.seller-avatar-wrap {
  flex-shrink: 0;
}

.seller-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.seller-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  flex: 1;
}

.arrow-icon {
  width: 14px;
  height: 14px;
  color: #ccc;
}

/* 商品信息卡片 */
.goods-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: #fff;
  border-radius: 0 0 10px 10px;
  margin-bottom: 12px;
}

.goods-img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f6f7f8;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.goods-title {
  font-size: 15px;
  font-weight: 500;
  color: #222;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-tags {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.goods-tag {
  padding: 2px 6px;
  background: #f0f9ff;
  color: #0084ff;
  font-size: 11px;
  border-radius: 3px;
}

.goods-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 6px;
}

.goods-price {
  font-size: 20px;
  font-weight: 700;
  color: #ff4d4f;
}

.goods-shipping {
  font-size: 12px;
  color: #52c41a;
  padding: 1px 4px;
  border: 1px solid #52c41a;
  border-radius: 3px;
}

/* 订单信息卡片 */
.order-info-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f8f8f8;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row.highlight {
  padding-top: 14px;
  margin-top: 4px;
  border-top: 1px dashed #f0f0f0;
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.info-value.free {
  color: #52c41a;
}

.info-value.price {
  font-size: 20px;
  font-weight: 700;
  color: #ff4d4f;
}

/* 交易方式 */
.trade-method-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
}

.method-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 14px;
}

.method-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.method-option:hover {
  border-color: #0084ff;
  background: #f0f9ff;
}

.method-option.active {
  border-color: #0084ff;
  background: #f0f9ff;
}

.method-icon {
  width: 24px;
  height: 24px;
  color: #0084ff;
  flex-shrink: 0;
}

.method-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.method-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.method-desc {
  font-size: 12px;
  color: #999;
}

.method-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.method-check.checked {
  background: #0084ff;
  border-color: #0084ff;
}

.method-check svg {
  width: 12px;
  height: 12px;
  color: #fff;
}

/* 留言 */
.remark-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
}

.remark-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px;
}

.remark-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 13px;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}

.remark-input:focus {
  border-color: #0084ff;
}

/* 跑腿任务订单卡片 */
.errand-order-card {
  background: #fff;
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 12px;
}

.errand-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.errand-category {
  padding: 4px 10px;
  background: #f0f9ff;
  color: #0084ff;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 500;
}

.errand-reward {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.reward-label {
  font-size: 11px;
  color: #999;
}

.reward-amount {
  font-size: 24px;
  font-weight: 700;
  color: #ff4d4f;
}

.errand-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 16px;
  line-height: 1.4;
}

/* 路线迷你展示 */
.route-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 14px;
}

.route-stop {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.stop-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stop-dot.from {
  background: #0084ff;
}

.stop-dot.to {
  background: #52c41a;
}

.stop-text {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.route-arrow {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.arrow-line {
  width: 20px;
  height: 2px;
  background: #ddd;
}

.arrow-svg {
  width: 14px;
  height: 14px;
  color: #bbb;
}

.errand-publisher {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.publisher-label {
  color: #999;
}

.publisher-name {
  color: #333;
  font-weight: 500;
}

/* 接单须知 */
.notice-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
}

.notice-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px;
}

.notice-list {
  margin: 0;
  padding: 0 0 0 18px;
}

.notice-list li {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

/* 底部提交栏 */
.order-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.04);
  z-index: 100;
}

.total-section {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.total-label {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 22px;
  font-weight: 700;
  color: #ff4d4f;
}

.submit-btn {
  padding: 12px 36px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #0084ff, #0070e0);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 132, 255, 0.3);
}

.submit-btn:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 132, 255, 0.4);
}

.submit-btn.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .order-container {
    padding: 0 12px;
  }

  .goods-img {
    width: 80px;
    height: 80px;
  }

  .submit-btn {
    padding: 12px 24px;
  }
}
</style>
