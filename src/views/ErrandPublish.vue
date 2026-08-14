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
        <h2 class="publish-title">发布跑腿任务</h2>

        <div class="form-group">
          <label class="form-label">任务标题 <span class="required">*</span></label>
          <input v-model="form.title" class="form-input" placeholder="简要描述你需要什么帮助" maxlength="50" />
        </div>

        <div class="form-group">
          <label class="form-label">任务描述 <span class="required">*</span></label>
          <textarea v-model="form.description" class="form-textarea" placeholder="详细描述任务要求、注意事项等" rows="5" maxlength="500"></textarea>
          <span class="char-count">{{ form.description.length }}/500</span>
        </div>

        <div class="form-group">
          <label class="form-label">任务分类 <span class="required">*</span></label>
          <select v-model="form.category" class="form-select">
            <option value="">请选择分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.name">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">赏金 <span class="required">*</span></label>
          <div class="price-input-wrap">
            <span class="price-symbol">¥</span>
            <input v-model="form.reward" type="number" class="form-input price-input" placeholder="0.00" />
          </div>
          <span class="form-hint">合理的赏金能更快吸引接单者</span>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label class="form-label">出发地 <span class="required">*</span></label>
            <input v-model="form.fromLocation" class="form-input" placeholder="如：菜鸟驿站" />
          </div>
          <div class="form-group half">
            <label class="form-label">目的地 <span class="required">*</span></label>
            <input v-model="form.toLocation" class="form-input" placeholder="如：东区3号楼" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">截止时间 <span class="required">*</span></label>
          <input v-model="form.deadline" type="datetime-local" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">任务标签</label>
          <div class="tag-input-area">
            <span v-for="(tag, idx) in form.tags" :key="idx" class="tag-chip">
              {{ tag }}
              <button class="tag-remove" @click="form.tags.splice(idx, 1)">×</button>
            </span>
            <input
              v-if="form.tags.length < 3"
              v-model="tagInput"
              class="tag-input"
              placeholder="输入标签后回车"
              @keyup.enter="addTag"
              maxlength="10"
            />
          </div>
          <span class="form-hint">最多添加3个标签，方便接单者快速了解</span>
        </div>

        <div class="form-actions">
          <button class="btn-cancel" @click="$router.back()">取消</button>
          <button class="btn-submit" @click="handleSubmit">发布任务</button>
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
import { fetchErrandCategories, fetchAddErrandTask, fetchUserInfo } from '@/utils/api'

const router = useRouter()
const userInfo = ref({})
const categories = ref([])
const tagInput = ref('')

const form = reactive({
  title: '',
  description: '',
  category: '',
  reward: '',
  fromLocation: '',
  toLocation: '',
  deadline: '',
  tags: []
})

const addTag = () => {
  const val = tagInput.value.trim()
  if (val && form.tags.length < 3 && !form.tags.includes(val)) {
    form.tags.push(val)
    tagInput.value = ''
  }
}

const handleSubmit = async () => {
  if (!form.title.trim()) return ElMessage.warning('请输入任务标题')
  if (!form.description.trim()) return ElMessage.warning('请输入任务描述')
  if (!form.category) return ElMessage.warning('请选择分类')
  if (!form.reward || parseFloat(form.reward) <= 0) return ElMessage.warning('请输入有效赏金')
  if (!form.fromLocation.trim()) return ElMessage.warning('请输入出发地')
  if (!form.toLocation.trim()) return ElMessage.warning('请输入目的地')
  if (!form.deadline) return ElMessage.warning('请选择截止时间')

  const payload = {
    ...form,
    reward: parseFloat(form.reward),
    publisher: userInfo.value,
    createTime: new Date().toLocaleString('zh-CN')
  }

  await fetchAddErrandTask(payload)
  ElMessage.success('发布成功！')
  router.push('/trade?tab=errand')
}

onMounted(async () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) userInfo.value = JSON.parse(saved)

  try {
    const r = await fetchUserInfo()
    if (r.data) userInfo.value = { ...userInfo.value, ...r.data }
  } catch (e) { /* ignore */ }

  categories.value = fetchErrandCategories().filter(c => c.id !== 0)
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

.form-hint {
  display: block;
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

/* 标签输入 */
.tag-input-area {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #f0f9ff;
  color: #0084ff;
  font-size: 12px;
  border-radius: 4px;
}

.tag-remove {
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  line-height: 1;
}

.tag-remove:hover {
  color: #ff4d4f;
}

.tag-input {
  padding: 4px 10px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  width: 120px;
}

.tag-input:focus {
  border-color: #0084ff;
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
