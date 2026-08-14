<template>
  <div class="article-page">
    <ZhihuHeader :userInfo="userInfo" />
    
    <div class="article-container">
      <!-- 文章主体 -->
      <main class="article-main">
        <div v-if="!article.id" class="article-loading">
          <el-skeleton :rows="5" animated />
        </div>

        <template v-else>
          <!-- 文章头部 -->
          <article class="article-content">
            <h1 class="article-title">{{ article.title }}</h1>
            
            <div class="article-meta">
              <div class="meta-left">
                <img :src="article.author.avatar || defaultAvatar" class="meta-avatar" />
                <div class="meta-info">
                  <span class="meta-author">{{ article.author.username }}</span>
                  <span class="meta-time">{{ article.createTime }}</span>
                </div>
              </div>
              <div class="meta-right">
                <button 
                  class="follow-btn" 
                  :class="{ followed: isFollowed }"
                  @click.stop="toggleFollow"
                >
                  {{ isFollowed ? '已关注' : '+ 关注' }}
                </button>
              </div>
            </div>

            <!-- 文章内容 -->
            <div class="article-body" v-html="renderedContent"></div>

            <!-- 文章图片网格（统一展示，含封面） -->
            <div v-if="articleImages.length > 0" class="article-media-section">
              <div class="media-gallery-grid" :class="'grid-' + Math.min(articleImages.length, 9)">
                <div v-for="(img, idx) in articleImages.slice(0, 9)" :key="'img-'+idx" class="gallery-grid-item" @click="openImageViewer(articleImages, idx)">
                  <img :src="img" />
                </div>
              </div>
            </div>

            <!-- 文章视频 -->
            <div v-if="articleVideos.length > 0" class="article-media-section">
              <h4 class="media-section-title">🎥 文章视频</h4>
              <div class="video-gallery">
                <video v-for="(vid, idx) in articleVideos" :key="'vid-'+idx" :src="vid" controls preload="metadata" class="gallery-video"></video>
              </div>
            </div>

            <!-- 标签 -->
            <div v-if="article.tags && article.tags.length > 0" class="article-tags">
              <router-link 
                v-for="tag in article.tags" 
                :key="tag" 
                :to="`/tag/${tag}`"
                class="tag-item"
              >
                {{ tag }}
              </router-link>
            </div>

            <!-- 操作栏 -->
            <div class="article-actions">
              <button class="action-btn" :class="{ active: isLiked }" @click="toggleLike">
                <svg class="action-icon" viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{{ isLiked ? '已赞' : '点赞' }} {{ article.likes || 0 }}</span>
              </button>
              <button class="action-btn" :class="{ active: isCollected }" @click="toggleCollect">
                <svg class="action-icon" viewBox="0 0 24 24" :fill="isCollected ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>{{ isCollected ? '已收藏' : '收藏' }}</span>
              </button>
              <button class="action-btn" @click="shareArticle">
                <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                <span>分享</span>
              </button>
              <span class="action-stat">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                {{ article.views || 0 }}
              </span>
              <span class="action-stat">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {{ comments.length }}
              </span>
            </div>
          </article>

          <!-- 评论区 -->
          <section class="comments-section">
            <h2 class="comments-title">评论 ({{ comments.length }})</h2>
            
            <!-- 发表评论 -->
            <div class="comment-form">
              <img :src="userInfo.avatar || defaultAvatar" class="comment-avatar" />
              <div class="comment-input-area">
                <textarea 
                  v-model="newComment" 
                  placeholder="写下你的评论..." 
                  rows="3"
                  class="comment-textarea"
                ></textarea>
                
                <!-- 评论图片预览 -->
                <div v-if="commentImage" class="comment-image-preview">
                  <img :src="commentImage" alt="Comment image" />
                  <span class="remove-image" @click="commentImage = ''">×</span>
                </div>
                
                <div class="comment-actions">
                  <div class="comment-tools">
                    <input type="file" ref="commentImageInput" accept="image/*" style="display: none" @change="handleCommentImage" />
                    <span class="tool-btn" @click="$refs.commentImageInput.click()">📷 图片</span>
                  </div>
                  <button class="submit-comment" @click="submitComment" :disabled="!newComment.trim()">
                    发表评论
                  </button>
                </div>
              </div>
            </div>

            <!-- 评论列表 -->
            <div class="comment-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <img :src="comment.author?.avatar || defaultAvatar" class="comment-avatar" />
                <div class="comment-body">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.author?.username || '匿名用户' }}</span>
                    <span class="comment-time">{{ comment.createTime }}</span>
                  </div>
                  <div class="comment-text">{{ comment.content }}</div>
                  
                  <!-- 评论图片 -->
                  <div v-if="comment.image" class="comment-image">
                    <img :src="comment.image" alt="Comment image" />
                  </div>
                  
                  <div class="comment-footer">
                    <span class="comment-action" @click="toggleCommentLike(comment)">
                      <svg class="comment-action-icon" viewBox="0 0 24 24" :fill="comment.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {{ comment.likes || 0 }}
                    </span>
                    <span class="comment-action" @click="toggleReply(comment)">
                      <svg class="comment-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 14 4 9 9 4"/>
                        <path d="M20 18v-4a4 4 0 0 0-4-4H4"/>
                      </svg>
                      回复
                    </span>
                  </div>

                  <!-- 回复输入框 -->
                  <div v-if="replyingTo === comment.id" class="reply-form">
                    <textarea v-model="replyContent" placeholder="回复..." rows="2" class="reply-textarea"></textarea>
                    <div class="reply-actions">
                      <button class="reply-cancel" @click="replyingTo = null">取消</button>
                      <button class="reply-submit" @click="submitReply(comment)" :disabled="!replyContent.trim()">回复</button>
                    </div>
                  </div>

                  <!-- 子回复 -->
                  <div v-if="comment.replies && comment.replies.length > 0" class="reply-list">
                    <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                      <span class="reply-author">{{ reply.author?.username || '匿名用户' }}</span>
                      <span class="reply-text">{{ reply.content }}</span>
                      <span class="reply-time">{{ reply.createTime }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="comments.length === 0" class="empty-comments">
                暂无评论，来说两句吧~
              </div>
            </div>
          </section>
        </template>
      </main>

      <!-- 右侧边栏 -->
      <aside class="article-sidebar">
        <!-- 相关推荐 -->
        <div class="sidebar-card">
          <h3 class="sidebar-title">相关推荐</h3>
          <div 
            v-for="related in relatedArticles" 
            :key="related.id"
            class="related-item"
            @click="$router.push(`/article/${related.id}`)"
          >
            <div class="related-title">{{ related.title }}</div>
            <div class="related-meta">{{ related.views || 0 }} 浏览</div>
          </div>
        </div>
      </aside>
    </div>

    <!-- 图片查看器 -->
    <el-image-viewer
      v-if="showImageViewer"
      :url-list="currentViewImages"
      :initial-index="currentImageIndex"
      @close="closeImageViewer"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import { 
  fetchArticleList, fetchArticleDetail, fetchArticleComments, fetchAddComment, 
  fetchLikeArticle, fetchViewArticle, fetchFollowUser, fetchUpload,
  fetchCollectArticle
} from '@/utils/api'

const defaultAvatar = 'https://mywebpro.oss-cn-beijing.aliyuncs.com/ac052700-4c99-48a0-8e11-57d95c025220.jpg'
const BACKEND_BASE = 'http://127.0.0.1:8090'
const route = useRoute()

// 解析图片 URL：相对路径自动补全后端基址
const resolveImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  return BACKEND_BASE + (url.startsWith('/') ? url : '/' + url)
}

// State
const userInfo = ref({})
const article = ref({})
const comments = ref([])
const isLiked = ref(false)
const isFollowed = ref(false)
const isCollected = ref(false)
const newComment = ref('')
const commentImage = ref('')
const replyingTo = ref(null)
const replyContent = ref('')
const allArticles = ref([])

// 图片查看器
const showImageViewer = ref(false)
const currentViewImages = ref([])
const currentImageIndex = ref(0)
const openImageViewer = (images, index) => { currentViewImages.value = images; currentImageIndex.value = index; showImageViewer.value = true }
const closeImageViewer = () => { showImageViewer.value = false; setTimeout(() => { currentViewImages.value = []; currentImageIndex.value = 0 }, 300) }

const renderedContent = computed(() => {
  return (article.value.content || '').replace(/\n/g, '<br>')
})

// 解析文章图片（统一展示，含封面）
const articleImages = computed(() => {
  const imgs = []
  // 封面图作为第一张
  if (article.value.cover) imgs.push(article.value.cover)
  // images 字段
  const raw = article.value.images
  if (raw) {
    if (Array.isArray(raw)) imgs.push(...raw.filter(u => u))
    else if (typeof raw === 'string' && raw) imgs.push(...raw.split(/[,，]/).map(u => u.trim()).filter(u => u))
  }
  // 去重
  return [...new Set(imgs)]
})

const articleVideos = computed(() => {
  const vids = article.value.videos
  if (!vids) return []
  if (Array.isArray(vids)) return vids.filter(u => u)
  return String(vids).split(',').map(u => u.trim()).filter(u => u)
})

const relatedArticles = computed(() => {
  if (!article.value.id) return []
  return allArticles.value.filter(a => a.id !== article.value.id).slice(0, 5)
})

// 点赞
const toggleLike = async () => {
  isLiked.value = !isLiked.value
  article.value.likes += isLiked.value ? 1 : -1
  await fetchLikeArticle(article.value.id)
  ElMessage.success(isLiked.value ? '已点赞' : '取消点赞')
}

// 收藏
const toggleCollect = async () => {
  isCollected.value = !isCollected.value
  await fetchCollectArticle(article.value.id)
  ElMessage.success(isCollected.value ? '已收藏' : '取消收藏')
}

// 分享文章
const shareArticle = async () => {
  const url = window.location.href
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (e) {
    // fallback
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    ElMessage.success('链接已复制到剪贴板')
  }
}

// 关注作者
const toggleFollow = async () => {
  isFollowed.value = !isFollowed.value
  await fetchFollowUser(article.value.author?.id)
  ElMessage.success(isFollowed.value ? '已关注' : '取消关注')
}

// 评论图片上传
const handleCommentImage = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  try {
    const result = await fetchUpload(file)
    if (result.data) {
      commentImage.value = resolveImageUrl(result.data)
      ElMessage.success('图片上传成功')
    } else {
      const reader = new FileReader()
      reader.onload = (e) => { commentImage.value = e.target.result }
      reader.readAsDataURL(file)
    }
  } catch (e) {
    const reader = new FileReader()
    reader.onload = (ev) => { commentImage.value = ev.target.result }
    reader.readAsDataURL(file)
  }
  event.target.value = ''
}

// 发表评论
const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  const payload = {
    articleId: article.value.id,
    content: newComment.value,
    image: commentImage.value || ''
  }
  
  const result = await fetchAddComment(payload)
  if (result.data) {
    // 归一化后端返回的评论数据
    const newC = normalizeComment({
      id: result.data.id || Date.now(),
      articleId: article.value.id,
      author: result.data.author || {
        id: result.data.userId || userInfo.value.id || 0,
        username: result.data.userName || userInfo.value.username || '当前用户',
        avatar: result.data.userAvatar || userInfo.value.avatar || defaultAvatar
      },
      content: newComment.value,
      image: commentImage.value || '',
      likes: 0,
      createTime: result.data.createTime || '刚刚',
      isLiked: false,
      replies: []
    })
    comments.value.unshift(newC)
    newComment.value = ''
    commentImage.value = ''
    ElMessage.success('评论成功')
  }
}

// 点赞评论
const toggleCommentLike = (comment) => {
  comment.isLiked = !comment.isLiked
  comment.likes += comment.isLiked ? 1 : -1
}

// 回复
const toggleReply = (comment) => {
  replyingTo.value = replyingTo.value === comment.id ? null : comment.id
  replyContent.value = ''
}

const submitReply = async (comment) => {
  if (!replyContent.value.trim()) return
  
  const payload = {
    articleId: article.value.id,
    content: replyContent.value,
    parentId: comment.id,
    image: ''
  }
  
  const result = await fetchAddComment(payload)
  if (!comment.replies) comment.replies = []
  comment.replies.push({
    id: result.data?.id || Date.now(),
    author: { 
      id: userInfo.value.id || 0,
      username: userInfo.value.username || '当前用户', 
      avatar: userInfo.value.avatar || defaultAvatar 
    },
    content: replyContent.value,
    likes: 0,
    createTime: '刚刚',
    isLiked: false
  })
  replyContent.value = ''
  replyingTo.value = null
  ElMessage.success('回复成功')
}

// 评论数据归一化：兼容后端格式和 mock 格式
// 后端可能返回: { userId, userName, userAvatar, createTime: [2024,1,15], ... }
// mock 格式: { author: { id, username, avatar }, createTime: '2024-01-15 12:00', ... }
const normalizeComment = (c) => {
  // 解析作者信息
  const author = c.author || {
    id: c.userId || c.user?.id || 0,
    username: c.userName || c.user?.username || c.user?.name || '匿名用户',
    avatar: c.userAvatar || c.user?.avatar || defaultAvatar
  }
  // 解析时间
  let createTime = c.createTime || ''
  if (Array.isArray(createTime)) {
    const [y, m, d] = createTime
    createTime = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  // 解析子回复
  const replies = (c.replies || []).map(r => {
    const rAuthor = r.author || {
      id: r.userId || r.user?.id || 0,
      username: r.userName || r.user?.username || r.user?.name || '匿名用户',
      avatar: r.userAvatar || r.user?.avatar || defaultAvatar
    }
    let rTime = r.createTime || ''
    if (Array.isArray(rTime)) {
      const [y, m, d] = rTime
      rTime = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
    return {
      id: r.id,
      author: rAuthor,
      content: r.content || '',
      likes: r.likes ?? r.like ?? 0,
      createTime: rTime,
      isLiked: r.isLiked || false
    }
  })

  // 解析图片 URL（兼容多种字段名）
  const image = resolveImageUrl(c.image || c.imageUrl || c.img || c.images || '')

  return {
    id: c.id,
    articleId: c.articleId,
    author,
    content: c.content || '',
    image,
    likes: c.likes ?? c.like ?? 0,
    createTime,
    isLiked: c.isLiked || false,
    replies
  }
}

// 加载数据
onMounted(async () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) userInfo.value = JSON.parse(saved)
  
  const articleId = parseInt(route.params.id)
  
  // 加载文章列表（用于相关文章推荐）
  const listResult = await fetchArticleList()
  const articleList = listResult.data || []
  allArticles.value = (Array.isArray(articleList) ? articleList : []).map(a => ({
    ...a,
    author: a.author || { username: '匿名用户', avatar: '' },
    tags: a.tags || []
  }))
  
  // 优先用详情接口获取完整文章数据（含图片）
  const detailResult = await fetchArticleDetail(articleId)
  let found = null
  if (detailResult.success && detailResult.data) {
    found = detailResult.data
  } else {
    // 详情接口失败，回退到列表查找
    found = allArticles.value.find(a => a.id === articleId)
  }
  
  if (found) {
    let dateStr = ''
    if (found.createTime) {
      if (Array.isArray(found.createTime)) {
        const [y, m, d] = found.createTime
        dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      } else { dateStr = found.createTime }
    }
    
    article.value = {
      id: found.id,
      title: found.title || '',
      content: found.content || '',
      author: {
        id: found.author?.id || 0,
        username: found.author?.username || '匿名用户',
        avatar: found.author?.avatar || defaultAvatar
      },
      cover: found.cover || '',
      images: found.images || [],
      videos: found.videos || [],
      tags: found.tags || [],
      likes: found.likes || 0,
      comments: found.comments || 0,
      views: found.views || 0,
      createTime: dateStr,
      isLiked: found.isLiked || false,
      isFollowed: found.isFollowed || false
    }
    isLiked.value = article.value.isLiked
    isFollowed.value = article.value.isFollowed
    
    // 增加浏览量并使用后端返回的真实值
    const viewResult = await fetchViewArticle(articleId)
    if (viewResult.data && viewResult.data.views != null) {
      article.value.views = viewResult.data.views
    } else {
      article.value.views = (article.value.views || 0) + 1
    }
  } else {
    ElMessage.error('文章不存在')
  }
  
  // 加载评论
  const commentResult = await fetchArticleComments(articleId)
  const rawComments = commentResult.data || []
  comments.value = rawComments.map(normalizeComment)
})
</script>

<style scoped>
.article-page { min-height: 100vh; background: #f6f7f8; }
.article-container { max-width: 1200px; margin: 20px auto; display: flex; gap: 20px; padding: 0 20px; }
.article-main { flex: 1; min-width: 0; }
.article-loading { background: #fff; border-radius: 8px; padding: 30px; }
.article-content { background: #fff; border-radius: 8px; padding: 30px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.article-title { font-size: 28px; font-weight: 700; color: #1a1a1a; line-height: 1.4; margin-bottom: 20px; }
.article-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #f3f4f5; }
.meta-left { display: flex; align-items: center; gap: 10px; }
.meta-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.meta-info { display: flex; flex-direction: column; }
.meta-author { font-size: 15px; font-weight: 500; color: #333; }
.meta-time { font-size: 13px; color: #999; }
.follow-btn { padding: 6px 16px; border-radius: 20px; border: 1px solid #0084ff; background: #fff; color: #0084ff; cursor: pointer; font-size: 13px; transition: all 0.3s; }
.follow-btn:hover { background: #0084ff; color: #fff; }
.follow-btn.followed { background: #f3f4f5; border-color: #e3e3e3; color: #999; }
.article-body { font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px; }
.article-media-section { margin: 20px 0; }
.media-gallery-grid { display: grid; gap: 3px; }
.media-gallery-grid.grid-1 { grid-template-columns: 1fr; max-width: 60%; }
.media-gallery-grid.grid-2, .media-gallery-grid.grid-4 { grid-template-columns: repeat(2, 1fr); }
.media-gallery-grid.grid-3 { grid-template-columns: repeat(3, 1fr); }
.media-gallery-grid.grid-5, .media-gallery-grid.grid-6, .media-gallery-grid.grid-7, .media-gallery-grid.grid-8, .media-gallery-grid.grid-9 { grid-template-columns: repeat(3, 1fr); }
.gallery-grid-item { position: relative; padding-top: 100%; overflow: hidden; border-radius: 6px; cursor: pointer; background: #f0f0f0; }
.gallery-grid-item img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.gallery-grid-item img:hover { transform: scale(1.05); }
.video-gallery { display: flex; flex-direction: column; gap: 12px; margin: 20px 0; }
.gallery-video { width: 100%; max-height: 450px; border-radius: 6px; background: #000; }

.article-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; padding-top: 15px; border-top: 1px solid #f3f4f5; }
.tag-item { padding: 4px 12px; background: #f0f9ff; color: #0084ff; border-radius: 4px; font-size: 13px; text-decoration: none; transition: background 0.3s; }
.tag-item:hover { background: #e0f0ff; }
.article-actions { display: flex; align-items: center; gap: 16px; padding-top: 20px; border-top: 1px solid #f0f0f0; }
.action-btn { display: flex; align-items: center; gap: 6px; padding: 8px 18px; border: none; border-radius: 20px; background: #f5f5f5; cursor: pointer; font-size: 14px; color: #666; transition: all 0.25s ease; }
.action-btn:hover { background: #e8f4ff; color: #0084ff; }
.action-btn.active { background: #e8f4ff; color: #0084ff; }
.action-icon { width: 18px; height: 18px; flex-shrink: 0; }
.action-stat { display: flex; align-items: center; gap: 5px; font-size: 14px; color: #999; }
.stat-icon { width: 16px; height: 16px; }

/* 评论区 */
.comments-section { background: #fff; border-radius: 8px; padding: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.comments-title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 20px; }
.comment-form { display: flex; gap: 12px; margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #f3f4f5; }
.comment-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.comment-input-area { flex: 1; }
.comment-textarea { width: 100%; padding: 12px; border: 1px solid #e3e3e3; border-radius: 8px; font-size: 14px; font-family: inherit; resize: none; outline: none; transition: border-color 0.3s; }
.comment-textarea:focus { border-color: #0084ff; }
.comment-image-preview { position: relative; width: 80px; height: 80px; margin-top: 8px; border-radius: 6px; overflow: hidden; }
.comment-image-preview img { width: 100%; height: 100%; object-fit: cover; }
.remove-image { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: #fff; width: 18px; height: 18px; border-radius: 50%; text-align: center; line-height: 16px; cursor: pointer; font-size: 12px; }
.comment-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.comment-tools { display: flex; gap: 10px; }
.tool-btn { cursor: pointer; font-size: 13px; color: #999; transition: color 0.3s; }
.tool-btn:hover { color: #0084ff; }
.submit-comment { padding: 6px 20px; background: #0084ff; color: #fff; border: none; border-radius: 20px; cursor: pointer; font-size: 14px; transition: background 0.3s; }
.submit-comment:hover { background: #0077e6; }
.submit-comment:disabled { background: #ccc; cursor: not-allowed; }

/* 评论列表 */
.comment-list { display: flex; flex-direction: column; gap: 20px; }
.comment-item { display: flex; gap: 12px; }
.comment-body { flex: 1; }
.comment-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.comment-author { font-size: 14px; font-weight: 500; color: #333; }
.comment-time { font-size: 12px; color: #999; }
.comment-text { font-size: 14px; line-height: 1.6; color: #333; margin-bottom: 8px; }
.comment-image { margin-bottom: 8px; max-width: 200px; border-radius: 6px; overflow: hidden; }
.comment-image img { width: 100%; }
.comment-footer { display: flex; gap: 15px; }
.comment-action { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #999; cursor: pointer; transition: color 0.25s; }
.comment-action:hover { color: #0084ff; }
.comment-action-icon { width: 14px; height: 14px; }

/* 回复 */
.reply-form { margin-top: 10px; padding: 10px; background: #f6f7f8; border-radius: 6px; }
.reply-textarea { width: 100%; padding: 8px; border: 1px solid #e3e3e3; border-radius: 4px; font-size: 13px; font-family: inherit; resize: none; outline: none; }
.reply-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.reply-cancel { padding: 4px 12px; border: 1px solid #e3e3e3; border-radius: 4px; background: #fff; cursor: pointer; font-size: 12px; }
.reply-submit { padding: 4px 12px; background: #0084ff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
.reply-submit:disabled { background: #ccc; }
.reply-list { margin-top: 10px; padding: 10px; background: #f9fafb; border-radius: 6px; }
.reply-item { padding: 6px 0; font-size: 13px; display: flex; gap: 8px; align-items: baseline; }
.reply-author { font-weight: 500; color: #0084ff; flex-shrink: 0; }
.reply-text { color: #333; }
.reply-time { font-size: 11px; color: #999; margin-left: auto; flex-shrink: 0; }
.empty-comments { text-align: center; padding: 40px; color: #999; }

/* 右侧边栏 */
.article-sidebar { width: 280px; flex-shrink: 0; }
.sidebar-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); position: sticky; top: 80px; }
.sidebar-title { font-size: 16px; font-weight: 600; color: #333; margin: 0 0 15px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f5; }
.related-item { padding: 10px 0; cursor: pointer; border-bottom: 1px solid #f9fafb; transition: background 0.3s; }
.related-item:hover { background: #f6f7f8; margin: 0 -10px; padding: 10px; border-radius: 4px; }
.related-title { font-size: 14px; color: #333; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.related-meta { font-size: 12px; color: #999; margin-top: 4px; }

@media (max-width: 900px) {
  .article-container {
    flex-direction: column;
    padding: 0 12px;
    margin: 12px auto;
  }
  .article-content {
    padding: 16px;
  }
  .article-title {
    font-size: 20px;
  }
  .article-body {
    font-size: 15px;
  }
  .meta-avatar {
    width: 32px;
    height: 32px;
  }
  .meta-author {
    font-size: 13px;
  }
  .meta-time {
    font-size: 12px;
  }
  .media-gallery-grid.grid-1 { max-width: 80%; }
  .article-sidebar {
    width: 100%;
  }
  .sidebar-card {
    position: static;
  }
  .comment-input-area {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
