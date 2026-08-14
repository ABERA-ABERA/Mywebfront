<template>
  <div class="publish-page">
    <ZhihuHeader :userInfo="userInfo" />

    <div class="publish-container">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="back-icon">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        返回
      </button>

      <div class="publish-card">
        <h2 class="publish-title">发布闲置商品</h2>

        <div class="form-group">
          <label class="form-label">商品名称 <span class="required">*</span></label>
          <input v-model="form.title" class="form-input" placeholder="请输入商品名称" maxlength="50" />
        </div>

        <div class="form-group">
          <label class="form-label">商品描述 <span class="required">*</span></label>
          <textarea v-model="form.description" class="form-textarea" placeholder="请详细描述商品的使用情况、购入时间、转手原因等" rows="5" maxlength="500"></textarea>
          <span class="char-count">{{ form.description.length }}/500</span>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label class="form-label">售价 <span class="required">*</span></label>
            <div class="price-input-wrap">
              <span class="price-symbol">¥</span>
              <input v-model="form.price" type="number" class="form-input price-input" placeholder="0.00" />
            </div>
          </div>
          <div class="form-group half">
            <label class="form-label">原价</label>
            <div class="price-input-wrap">
              <span class="price-symbol">¥</span>
              <input v-model="form.originalPrice" type="number" class="form-input price-input" placeholder="0.00" />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label class="form-label">分类 <span class="required">*</span></label>
            <select v-model="form.category" class="form-select">
              <option value="">请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group half">
            <label class="form-label">成色 <span class="required">*</span></label>
            <select v-model="form.condition" class="form-select">
              <option value="">请选择成色</option>
              <option value="全新">全新（未使用）</option>
              <option value="95成新">95成新</option>
              <option value="9成新">9成新</option>
              <option value="8成新">8成新</option>
              <option value="7成新">7成新</option>
              <option value="6成新及以下">6成新及以下</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">交易地点</label>
          <input v-model="form.location" class="form-input" placeholder="如：东区宿舍、图书馆一楼" />
        </div>

        <div class="form-group">
          <label class="form-label">商品图片</label>
          <div class="image-upload-area">
            <div v-for="(img, idx) in previewImages" :key="idx" class="preview-item">
              <img :src="img" class="preview-img" />
              <button class="remove-btn" @click="removeImage(idx)">×</button>
            </div>
            <label v-if="previewImages.length < 9" class="upload-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="upload-icon">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>添加图片</span>
              <input type="file" accept="image/*" multiple class="file-input" @change="handleImageUpload" />
            </label>
          </div>
          <span class="upload-hint">最多上传9张图片，第一张将作为封面图</span>
        </div>

        <div class="form-actions">
          <button class="btn-cancel" @click="$router.back()">取消</button>
          <button class="btn-submit" @click="handleSubmit">发布商品</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import { fetchTradeCategories, fetchAddTradeItem, fetchUserInfo } from '@/utils/api'

const router = useRouter()
const userInfo = ref({})
const categories = ref([])
const previewImages = ref([])

const form = reactive({
  title: '',
  description: '',
  price: '',
  originalPrice: '',
  category: '',
  condition: '',
  location: ''
})

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files)
  const remaining = 9 - previewImages.value.length
  const toUpload = files.slice(0, remaining)
  toUpload.forEach(file => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      previewImages.value.push(ev.target.result)
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

const removeImage = (idx) => {
  previewImages.value.splice(idx, 1)
}

const handleSubmit = async () => {
  if (!form.title.trim()) return ElMessage.warning('请输入商品名称')
  if (!form.description.trim()) return ElMessage.warning('请输入商品描述')
  if (!form.price || parseFloat(form.price) <= 0) return ElMessage.warning('请输入有效售价')
  if (!form.category) return ElMessage.warning('请选择分类')
  if (!form.condition) return ElMessage.warning('请选择成色')

  const payload = {
    ...form,
    price: parseFloat(form.price),
    originalPrice: parseFloat(form.originalPrice) || parseFloat(form.price),
    images: previewImages.value,
    seller: userInfo.value
  }

  await fetchAddTradeItem(payload)
  ElMessage.success('发布成功！')
  router.push('/trade')
}

onMounted(async () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) userInfo.value = JSON.parse(saved)

  try {
    const r = await fetchUserInfo()
    if (r.data) userInfo.value = { ...userInfo.value, ...r.data }
  } catch (e) { /* ignore */ }

  categories.value = fetchTradeCategories().filter(c => c.id !== 0)
})
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: #f6f7f8;
}

.publish-container {
  max-width: 700px;
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

.publish-card {
  background: #fff;
  border-radius: 10px;
  padding: 28px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.publish-title {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin: 0 0 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.required {
  color: #ff4d4f;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #0084ff;
  box-shadow: 0 0 0 2px rgba(0, 132, 255, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-textarea:focus {
  border-color: #0084ff;
  box-shadow: 0 0 0 2px rgba(0, 132, 255, 0.1);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #bbb;
  margin-top: 4px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group.half {
  flex: 1;
}

.price-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.price-symbol {
  position: absolute;
  left: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #ff4d4f;
}

.price-input {
  padding-left: 28px !important;
}

.form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-select:focus {
  border-color: #0084ff;
}

/* 图片上传 */
.image-upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.upload-btn {
  width: 100px;
  height: 100px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
  color: #999;
  font-size: 12px;
}

.upload-btn:hover {
  border-color: #0084ff;
  color: #0084ff;
}

.upload-icon {
  width: 24px;
  height: 24px;
}

.file-input {
  display: none;
}

.upload-hint {
  display: block;
  font-size: 12px;
  color: #bbb;
  margin-top: 6px;
}

/* 操作按钮 */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn-cancel {
  flex: 1;
  padding: 12px 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: #999;
}

.btn-submit {
  flex: 2;
  padding: 12px 0;
  border: none;
  border-radius: 8px;
  background: #0084ff;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover {
  background: #0077e6;
}

@media (max-width: 768px) {
  .publish-container {
    padding: 0 12px;
  }

  .publish-card {
    padding: 20px 16px;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
