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
            <img v-if="currentImage" :src="currentImage" class="gallery-img" />
            <div v-else class="gallery-placeholder">暂无图片</div>
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
            <span class="detail-price">¥{{ item.price ?? 0 }}</span>
            <span class="detail-original" v-if="item.originalPrice">原价 ¥{{ item.originalPrice }}</span>
            <span class="detail-discount" v-if="item.price && item.originalPrice">{{ Math.round((item.price / item.originalPrice) * 100) / 10 }}折</span>
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

          <div class="detail-section" v-if="item.seller">
            <h3 class="section-title">卖家信息</h3>
            <div class="seller-card">
              <img :src="item.seller.avatar" class="seller-avatar" style="cursor:pointer" @click="$router.push(`/profile/${item.seller.id}`)" />
              <div class="seller-detail">
                <span class="seller-name" style="cursor:pointer" @click="$router.push(`/profile/${item.seller.id}`)">{{ item.seller.username }}</span>
                <span class="seller-bio">{{ item.seller.bio || '' }}</span>
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
              <span>{{ item.views || 0 }}次浏览</span>
              <span>·</span>
              <span>{{ item.createTime || '' }}发布</span>
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
            <button class="action-secondary" :class="{ active: isLiked }" :disabled="collectLoading" @click="handleCollect">
              <svg viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" class="action-icon">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              {{ isLiked ? '已收藏' : '收藏' }}
            </button>
            <!-- 卖家操作按钮 -->
            <template v-if="isOwner">
              <button class="action-edit" @click="openEdit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                编辑
              </button>
              <button class="action-delete" @click="handleDelete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
                删除
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <p>加载中...</p>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="showEditDialog" title="编辑商品" width="600px" append-to-body>
      <div class="edit-form">
        <div class="form-item">
          <label>商品名称</label>
          <input v-model="editForm.title" placeholder="请输入商品名称" />
        </div>
        <div class="form-item">
          <label>商品描述</label>
          <textarea v-model="editForm.description" placeholder="请输入商品描述" rows="3"></textarea>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label>售价 (¥)</label>
            <input v-model="editForm.price" type="number" placeholder="0.00" />
          </div>
          <div class="form-item">
            <label>原价 (¥)</label>
            <input v-model="editForm.originalPrice" type="number" placeholder="0.00" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label>分类</label>
            <select v-model="editForm.category">
              <option value="">请选择分类</option>
              <option value="数码电子">数码电子</option>
              <option value="教材书籍">教材书籍</option>
              <option value="服饰鞋包">服饰鞋包</option>
              <option value="运动户外">运动户外</option>
              <option value="生活日用">生活日用</option>
              <option value="美妆护肤">美妆护肤</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="form-item">
            <label>成色</label>
            <select v-model="editForm.condition">
              <option value="">请选择成色</option>
              <option value="全新">全新</option>
              <option value="99新">99新</option>
              <option value="95新">95新</option>
              <option value="9成新">9成新</option>
              <option value="8成新">8成新</option>
              <option value="7成新及以下">7成新及以下</option>
            </select>
          </div>
        </div>
        <div class="form-item">
          <label>交易地点</label>
          <input v-model="editForm.location" placeholder="如：东区宿舍" />
        </div>
        <div class="form-item">
          <label>商品图片</label>
          <div class="edit-images">
            <div v-for="(img, idx) in editForm.images" :key="idx" class="edit-image-item">
              <img :src="img" />
              <button class="remove-img-btn" @click="removeEditImage(idx)">×</button>
            </div>
            <label v-if="editForm.images.length < 9" class="add-image-btn">
              <input type="file" accept="image/*" multiple @change="handleEditImageUpload" hidden />
              <span>+ 添加图片</span>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import { fetchTradeItemDetail, fetchUserInfo, fetchDeleteTradeItem, fetchUpdateTradeItem, fetchUpload, fetchTradeView, fetchTradeCollect } from '@/utils/api'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userInfo = ref({})
const item = ref(null)
const currentImageIdx = ref(0)
const isLiked = ref(false)
const collectLoading = ref(false)
const isOwner = ref(false) // 当前用户是否为卖家
const showEditDialog = ref(false)
const editForm = reactive({
  title: '',
  description: '',
  price: '',
  originalPrice: '',
  category: '',
  condition: '',
  location: '',
  images: []
})

const currentImage = computed(() => {
  if (!item.value || !item.value.images) return ''
  return item.value.images[currentImageIdx.value] || item.value.images[0]
})

const handleContact = () => {
  ElMessage.info('聊天功能开发中，请通过校园论坛私信联系卖家')
}

// 判断是否为卖家
const checkOwner = () => {
  if (!item.value || !userInfo.value.id) return
  isOwner.value = item.value.seller?.id === userInfo.value.id
}

// 打开编辑弹窗
const openEdit = () => {
  if (!item.value) return
  Object.assign(editForm, {
    title: item.value.title,
    description: item.value.description,
    price: item.value.price,
    originalPrice: item.value.originalPrice,
    category: item.value.category,
    condition: item.value.condition,
    location: item.value.location,
    images: [...(item.value.images || [])]
  })
  showEditDialog.value = true
}

// 编辑时上传图片
const handleEditImageUpload = async (e) => {
  const files = Array.from(e.target.files)
  for (const file of files) {
    try {
      const result = await fetchUpload(file)
      if (result.data) {
        editForm.images.push(result.data)
      }
    } catch (err) {
      console.error('图片上传失败:', err)
    }
  }
  e.target.value = ''
}

// 删除编辑中的图片
const removeEditImage = (idx) => {
  editForm.images.splice(idx, 1)
}

// 保存编辑
const saveEdit = async () => {
  if (!editForm.title.trim()) return ElMessage.warning('请输入商品名称')
  if (!editForm.price || parseFloat(editForm.price) <= 0) return ElMessage.warning('请输入有效售价')
  
  try {
    const payload = {
      title: editForm.title,
      description: editForm.description,
      price: parseFloat(editForm.price),
      originalPrice: parseFloat(editForm.originalPrice) || parseFloat(editForm.price),
      images: editForm.images,
      category: editForm.category,
      condition: editForm.condition,
      location: editForm.location
    }
    const result = await fetchUpdateTradeItem(item.value.id, payload)
    if (result.data) {
      // 更新本地数据
      Object.assign(item.value, editForm)
      ElMessage.success('更新成功')
      showEditDialog.value = false
    } else {
      ElMessage.error('更新失败')
    }
  } catch (err) {
    console.error('更新失败:', err)
    ElMessage.error('更新失败')
  }
}

// 删除商品
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？删除后无法恢复', '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await fetchDeleteTradeItem(item.value.id)
    if (result.success || result.data) {
      ElMessage.success('删除成功')
      router.push('/trade')
    } else {
      ElMessage.error(result.msg || '删除失败')
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除失败:', err)
      ElMessage.error('删除失败')
    }
  }
}

const handleBuy = () => {
  if (!item.value.seller) {
    ElMessage.warning('卖家信息不可用')
    return
  }
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
    checkOwner()
    // 增加浏览量
    try {
      const viewResult = await fetchTradeView(parseInt(route.params.id))
      if (viewResult.data && viewResult.data.views !== undefined) {
        item.value.views = viewResult.data.views
      }
    } catch (e) { /* 浏览量不影响页面展示 */ }
  }
})

// 收藏/取消收藏
const handleCollect = async () => {
  if (collectLoading.value) return
  // 乐观更新
  const prev = isLiked.value
  isLiked.value = !prev
  collectLoading.value = true
  try {
    const result = await fetchTradeCollect(parseInt(route.params.id))
    if (result.success) {
      ElMessage.success(isLiked.value ? '收藏成功' : '已取消收藏')
    } else {
      // 回滚
      isLiked.value = prev
      ElMessage.error(result.msg || '操作失败')
    }
  } catch (err) {
    // 网络异常，回滚
    isLiked.value = prev
    ElMessage.error('网络异常')
  } finally {
    collectLoading.value = false
  }
}
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

.gallery-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  color: #ccc;
  font-size: 16px;
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

/* 卖家操作按钮 */
.action-edit {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 0;
  border: none;
  border-radius: 8px;
  background: #52c41a;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.action-edit:hover {
  background: #46a817;
}

.action-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 24px;
  border: 1px solid #ff4d4f;
  border-radius: 8px;
  background: #fff;
  color: #ff4d4f;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-delete:hover {
  background: #ff4d4f;
  color: #fff;
}

/* 编辑表单 */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.form-item input,
.form-item textarea,
.form-item select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-item input:focus,
.form-item textarea:focus,
.form-item select:focus {
  border-color: #0084ff;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-item {
  flex: 1;
}

.edit-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.edit-image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
}

.edit-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-img-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-img-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.add-image-btn {
  width: 80px;
  height: 80px;
  border: 1px dashed #d0d0d0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.add-image-btn:hover {
  border-color: #0084ff;
}

.add-image-btn span {
  font-size: 12px;
  color: #999;
  text-align: center;
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
