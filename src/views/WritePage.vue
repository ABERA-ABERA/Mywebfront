<template>
  <div class="write-page">
    <ZhihuHeader :userInfo="userInfo" />
    
    <div class="write-container">
      <div class="write-main">
        <h1 class="page-title">写文章</h1>

        <!-- 文章表单 -->
        <div class="article-form">
          <div class="form-group">
            <input 
              v-model="articleForm.title"
              type="text" 
              placeholder="请输入标题（必填）"
              class="title-input"
            />
          </div>

          <div class="form-group">
            <div class="cover-uploader" @click="$refs.coverInput.click()">
              <img v-if="articleForm.cover" :src="articleForm.cover" class="cover-preview" />
              <div v-else class="cover-placeholder">
                <span>📷 点击上传封面图（可选）</span>
              </div>
              <input 
                type="file" 
                ref="coverInput" 
                accept="image/*" 
                style="display: none"
                @change="handleCoverUpload"
              />
            </div>
          </div>

          <div class="form-group">
            <textarea 
              v-model="articleForm.content"
              placeholder="请输入文章内容..."
              rows="15"
              class="content-textarea"
            ></textarea>
          </div>

          <!-- 媒体上传区 -->
          <div class="form-group">
            <div class="media-upload-header">
              <span class="media-label">📎 文章配图/视频</span>
              <div class="media-tools">
                <input type="file" ref="mediaImgInput" multiple accept="image/*" style="display:none" @change="handleMediaImages" />
                <span class="media-tool-btn" @click="$refs.mediaImgInput.click()">📷 图片</span>
                <input type="file" ref="mediaVidInput" multiple accept="video/*" style="display:none" @change="handleMediaVideos" />
                <span class="media-tool-btn" @click="$refs.mediaVidInput.click()">🎥 视频</span>
              </div>
            </div>

            <!-- 媒体预览网格 -->
            <div v-if="articleForm.images.length > 0 || articleForm.videos.length > 0" class="media-preview-grid">
              <div v-for="(img, idx) in articleForm.images" :key="'img-'+idx" class="media-preview-item">
                <img :src="img" />
                <span class="media-remove-btn" @click="removeMediaImage(idx)">×</span>
              </div>
              <div v-for="(vid, idx) in articleForm.videos" :key="'vid-'+idx" class="media-preview-item video-item">
                <video :src="vid" controls preload="metadata"></video>
                <span class="media-remove-btn" @click="removeMediaVideo(idx)">×</span>
              </div>
            </div>

            <div v-if="articleForm.images.length === 0 && articleForm.videos.length === 0" class="media-empty-tip">
              点击上方按钮上传图片或视频，最多支持 9 个文件
            </div>
          </div>

          <div class="form-group">
            <input 
              v-model="articleForm.tagsInput"
              type="text" 
              placeholder="标签（用逗号分隔，如：Vue.js, 前端开发）"
              class="tags-input"
            />
          </div>

          <div class="form-actions">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSubmitArticle" :loading="isSubmitting">
              发布文章
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧提示 -->
      <aside class="write-sidebar">
        <div class="sidebar-card">
          <h3 class="sidebar-title">📝 写作规范</h3>
          <ul class="tips-list">
            <li>标题要简洁明了，突出主题</li>
            <li>内容要有条理，使用段落分隔</li>
            <li>适当使用图片和代码块</li>
            <li>添加相关标签便于检索</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import { fetchAddArticle, fetchUpload, fetchSaveDraft, fetchLoadDraft } from '@/utils/api'

const router = useRouter()

// State
const userInfo = ref({})
const isSubmitting = ref(false)

const articleForm = reactive({
  title: '',
  content: '',
  cover: '',
  tagsInput: '',
  images: [],
  videos: []
})

const draftTimer = ref(null)
const hasDraft = ref(false)

// 媒体文件上传
const uploadFile = async (file) => {
  try {
    const result = await fetchUpload(file)
    if (result.data) return result.data
    // fallback: 本地预览
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsDataURL(file)
    })
  } catch (e) {
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (ev) => resolve(ev.target.result)
      reader.readAsDataURL(file)
    })
  }
}

const handleMediaImages = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return
  if (articleForm.images.length + articleForm.videos.length + files.length > 9) {
    ElMessage.warning('最多只能上传 9 个媒体文件')
    event.target.value = ''
    return
  }
  ElMessage.info(`正在上传 ${files.length} 张图片...`)
  for (const file of files) {
    const url = await uploadFile(file)
    articleForm.images.push(url)
  }
  ElMessage.success('图片上传完成')
  event.target.value = ''
}

const handleMediaVideos = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return
  if (articleForm.images.length + articleForm.videos.length + files.length > 9) {
    ElMessage.warning('最多只能上传 9 个媒体文件')
    event.target.value = ''
    return
  }
  ElMessage.info(`正在上传 ${files.length} 个视频...`)
  for (const file of files) {
    const url = await uploadFile(file)
    articleForm.videos.push(url)
  }
  ElMessage.success('视频上传完成')
  event.target.value = ''
}

const removeMediaImage = (idx) => {
  articleForm.images.splice(idx, 1)
}

const removeMediaVideo = (idx) => {
  articleForm.videos.splice(idx, 1)
}

// 封面上传 - 复用原始 /admin/upload 接口
const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    ElMessage.info('正在上传封面...')
    const result = await fetchUpload(file)
    if (result.data) {
      articleForm.cover = result.data
      ElMessage.success('封面上传成功')
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        articleForm.cover = e.target.result
        ElMessage.success('封面已本地预览（服务器不可用）')
      }
      reader.readAsDataURL(file)
    }
  } catch (e) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      articleForm.cover = ev.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 发布文章 - 复用原始 /admin/article/add 接口
const handleSubmitArticle = async () => {
  if (!articleForm.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!articleForm.content.trim()) {
    ElMessage.warning('请输入内容')
    return
  }

  isSubmitting.value = true
  try {
    const tags = articleForm.tagsInput.split(/[,，]/).map(t => t.trim()).filter(t => t)
    const payload = {
      title: articleForm.title,
      content: articleForm.content,
      cover: articleForm.cover,
      images: articleForm.images.join(','),
      videos: articleForm.videos.join(','),
      tags: tags.join(','),
      type: 'article'
    }
    
    const result = await fetchAddArticle(payload)
    if (result.data) {
      ElMessage.success('文章发布成功！')
      clearDraftTimer()
      router.push('/home')
    } else {
      ElMessage.error('发布失败，请重试')
    }
  } catch (error) {
    ElMessage.error('发布失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 取消
const handleCancel = () => {
  if (articleForm.title || articleForm.content) {
    saveDraft()
    ElMessage.info('已自动保存草稿')
  }
  router.back()
}

// 草稿功能
const saveDraft = async () => {
  if (!articleForm.title && !articleForm.content) return
  hasDraft.value = true
  await fetchSaveDraft({
    title: articleForm.title,
    content: articleForm.content,
    cover: articleForm.cover,
    tags: articleForm.tagsInput,
    images: articleForm.images.join(','),
    videos: articleForm.videos.join(',')
  })
}

const clearDraftTimer = () => {
  if (draftTimer.value) {
    clearInterval(draftTimer.value)
    draftTimer.value = null
  }
}

// 加载数据
onMounted(async () => {
  const savedUserInfo = localStorage.getItem('userInfo')
  if (savedUserInfo) {
    userInfo.value = JSON.parse(savedUserInfo)
  }
  
  // 尝试加载草稿
  const draftResult = await fetchLoadDraft()
  if (draftResult.data) {
    const draft = draftResult.data
    articleForm.title = draft.title || ''
    articleForm.content = draft.content || ''
    articleForm.cover = draft.cover || ''
    articleForm.tagsInput = draft.tags || ''
    if (draft.images) articleForm.images = draft.images.split(',').filter(u => u)
    if (draft.videos) articleForm.videos = draft.videos.split(',').filter(u => u)
    hasDraft.value = true
    ElMessage.info('已恢复上次草稿')
  }
  
  // 每30秒自动保存草稿
  draftTimer.value = setInterval(() => {
    if (articleForm.title || articleForm.content) {
      saveDraft()
    }
  }, 30000)
})
</script>

<style scoped>
.write-page {
  min-height: 100vh;
  background: #f6f7f8;
}

.write-container {
  max-width: 1000px;
  margin: 30px auto;
  display: flex;
  gap: 20px;
  padding: 0 20px;
}

.write-main {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.title-input {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-bottom: 2px solid #f3f4f5;
  font-size: 20px;
  font-weight: 500;
  outline: none;
  transition: border-color 0.3s;
}

.title-input:focus {
  border-bottom-color: #0084ff;
}

.cover-uploader {
  width: 100%;
  max-width: 400px;
  height: 200px;
  border: 2px dashed #e3e3e3;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s;
}

.cover-uploader:hover {
  border-color: #0084ff;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.content-textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #e3e3e3;
  border-radius: 4px;
  font-size: 15px;
  font-family: inherit;
  line-height: 1.8;
  resize: vertical;
  outline: none;
  transition: border-color 0.3s;
}

.content-textarea:focus {
  border-color: #0084ff;
}

.tags-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #e3e3e3;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.tags-input:focus {
  border-color: #0084ff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f5;
}

/* 右侧边栏 */
.write-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.sidebar-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f5;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  padding: 5px 0;
  padding-left: 15px;
  position: relative;
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #0084ff;
}

@media (max-width: 900px) {
  .write-container {
    flex-direction: column;
  }
  
  .write-sidebar {
    width: 100%;
  }
}

/* 媒体上传区 */
.media-upload-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f5;
}

.media-label {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.media-tools {
  display: flex;
  gap: 10px;
  align-items: center;
}

.media-tool-btn {
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  background: #f3f4f5;
  font-size: 13px;
  color: #555;
  transition: all 0.2s;
  user-select: none;
}

.media-tool-btn:hover {
  background: #0084ff;
  color: #fff;
}

.media-preview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
}

.media-preview-item {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  background: #fafafa;
}

.media-preview-item img,
.media-preview-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.media-preview-item.video-item {
  background: #1a1a1a;
}

.media-preview-item.video-item video {
  object-fit: contain;
}

.media-remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: background 0.2s;
}

.media-remove-btn:hover {
  background: rgba(255, 59, 48, 0.9);
}

.media-empty-tip {
  color: #aaa;
  font-size: 13px;
  padding: 20px;
  text-align: center;
  border: 1px dashed #e8e8e8;
  border-radius: 6px;
}
</style>
