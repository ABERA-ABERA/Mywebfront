<template>
  <div class="qzone-container">
    <!-- 1. 背景层 -->
    <div 
      class="background-layer" 
      :style="{ backgroundImage: currentBackground ? `url(${currentBackground})` : 'none' }"
    >
      <div class="background-overlay"></div>
    </div>

    <!-- 2. 顶部导航栏 -->
    <header class="top-nav">
      <div class="nav-left">
        <span class="logo" @click="$router.push('/home')" style="cursor:pointer">My blog</span>
      </div>
      <div class="nav-right">
        <button class="nav-back-btn" @click="$router.push('/home')">← 返回首页</button>
      </div>
    </header>

    <!-- 3. 主要内容区 -->
    <main class="main-content">
      
      <!-- 左侧：个人信息侧边栏 -->
      <aside class="sidebar">
        <div class="profile-card">
          
          <div class="card-actions">
            <el-popover placement="bottom-end" trigger="click" width="200" popper-class="user-action-popover">
              <template #reference>
                <button class="action-btn">⋮</button>
              </template>
              <div class="menu-list">
                <div class="menu-item" @click="openEditDialog">
                  <span class="icon">✏️</span> 编辑资料
                </div>
                <div class="divider"></div>
                <div class="menu-item logout" @click="handleLogout">
                  <span class="icon">🚪</span> 退出登录
                </div>
              </div>
            </el-popover>
          </div>

          <div class="avatar-box" @click="openImageViewer([userInfo.avatar || defaultAvatar], 0)" title="点击查看大图">
            <img :src="userInfo.avatar || defaultAvatar" alt="Avatar" class="avatar-img" />
            <div class="avatar-view-mask">🔍</div>
          </div>
          
          <div class="user-basic">
            <h2 class="user-name">{{ userInfo.username || userInfo.name }}</h2>
            <p class="user-signature">"{{ userInfo.bio || '这个人很懒，什么都没有留下~' }}"</p>
          </div>

          <!-- 他人主页关注按钮 -->
          <div v-if="!isSelfProfile" class="profile-follow-btn-wrapper">
            <button 
              class="profile-follow-btn" 
              :class="{ followed: isFollowing }"
              @click="toggleFollowThisUser"
            >
              {{ isFollowing ? '已关注' : '+ 关注' }}
            </button>
          </div>

          <!-- 统计栏：关注/粉丝/获赞 -->
          <div class="stats-bar">
            <div class="stat-item" @click="showFollowingDialog = true">
              <span class="stat-num">{{ userStats.following }}</span>
              <span class="stat-label">关注</span>
            </div>
            <div class="stat-item" @click="showFollowersDialog = true">
              <span class="stat-num">{{ userStats.followers }}</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ userStats.totalLikes }}</span>
              <span class="stat-label">获赞</span>
            </div>
          </div>

          <div class="info-list">
            <div class="info-row"><span class="label">邮箱:</span><span class="value">{{ userInfo.email }}</span></div>
            <div class="info-row"><span class="label">加入于:</span><span class="value">{{ userInfo.joinDate }}</span></div>
            <div class="info-row"><span class="label">所在地:</span><span class="value">{{ userInfo.location || '上海' }}</span></div>
          </div>
        </div>

        <!-- 博文模式切换 -->
        <div class="mode-switch-card">
          <div class="switch-title">发布模式</div>
          <el-radio-group v-model="postMode" class="mode-radio-group">
            <el-radio-button label="shuoshuo">
              <span class="icon">💬</span> 说说
            </el-radio-button>
            <el-radio-button label="article">
              <span class="icon">📝</span> 文章
            </el-radio-button>
          </el-radio-group>
          <div class="mode-desc">
            {{ postMode === 'shuoshuo' ? '记录此刻心情，简短随意' : '撰写长篇博文，支持封面与排版' }}
          </div>
        </div>

        <!-- 关注列表弹窗 -->
        <el-dialog v-model="showFollowingDialog" title="我的关注" width="450px" append-to-body custom-class="custom-edit-dialog">
          <div v-if="followingList.length === 0" class="empty-dialog-tip">暂无关注</div>
          <div v-for="user in followingList" :key="user.id" class="follow-user-item">
            <img :src="user.avatar || defaultAvatar" class="follow-user-avatar" />
            <div class="follow-user-info">
              <div class="follow-user-name">{{ user.username }}</div>
              <div class="follow-user-bio">{{ user.bio || '' }}</div>
            </div>
            <button class="follow-action-btn followed" @click="unfollowUser(user)">已关注</button>
          </div>
        </el-dialog>

        <!-- 粉丝列表弹窗 -->
        <el-dialog v-model="showFollowersDialog" title="我的粉丝" width="450px" append-to-body custom-class="custom-edit-dialog">
          <div v-if="followersList.length === 0" class="empty-dialog-tip">暂无粉丝</div>
          <div v-for="user in followersList" :key="user.id" class="follow-user-item">
            <img :src="user.avatar || defaultAvatar" class="follow-user-avatar" />
            <div class="follow-user-info">
              <div class="follow-user-name">{{ user.username }}</div>
              <div class="follow-user-bio">{{ user.bio || '' }}</div>
            </div>
            <button 
              class="follow-action-btn" 
              :class="{ followed: user.isFollowedBack }" 
              @click="toggleFollowBack(user)"
            >
              {{ user.isFollowedBack ? '已关注' : '+ 关注' }}
            </button>
          </div>
        </el-dialog>
      </aside>

      <!-- 右侧：博文/动态流 -->
      <section class="feed-area">
        
        <!-- Tab 切换：我的文章 / 喜欢的文章 -->
        <div class="feed-tabs">
          <button class="feed-tab" :class="{ active: feedTab === 'my' }" @click="feedTab = 'my'">📝 我的文章</button>
          <button class="feed-tab" :class="{ active: feedTab === 'liked' }" @click="switchToLiked">❤️ 喜欢的文章</button>
        </div>

        <!-- 动态发布框（仅在我的文章Tab显示） -->
        <div v-if="feedTab === 'my'" class="publish-box" :class="'mode-' + postMode">
          
          <!-- 文章模式：封面设置 -->
          <div v-if="postMode === 'article'" class="article-cover-setup">
            <div class="cover-preview" @click="$refs.articleCoverInput.click()">
              <img v-if="newPost.cover" :src="newPost.cover" />
              <div v-else class="cover-placeholder">
                <span>📷 设置封面</span>
              </div>
              <input type="file" ref="articleCoverInput" accept="image/*" style="display: none" @change="handleArticleCoverUpload" />
            </div>
            <div class="cover-tip">点击上传封面图</div>
          </div>

          <input v-model="newPost.title" class="post-title-input" :placeholder="postMode === 'article' ? '请输入文章标题（必填）' : '请输入标题（可选）'" />
          <textarea v-model="newPost.content" :placeholder="postMode === 'article' ? '在此开始撰写你的文章...' : '记录此刻的心情...'" :rows="postMode === 'article' ? 8 : 3"></textarea>
          
          <!-- 媒体预览 -->
          <div v-if="newPost.images.length > 0 || newPost.videos.length > 0" class="media-preview-grid">
            <div v-for="(img, idx) in newPost.images" :key="'img-'+idx" class="preview-item">
              <img :src="img" />
              <span class="remove-media" @click="removeImage(idx)">×</span>
            </div>
            <div v-for="(vid, idx) in newPost.videos" :key="'vid-'+idx" class="preview-item video-item">
              <video :src="vid" controls></video>
              <span class="remove-media" @click="removeVideo(idx)">×</span>
            </div>
          </div>

          <div class="publish-footer">
            <div class="tools">
              <input type="file" ref="postImgInput" multiple accept="image/*" style="display: none" @change="handlePostImages" />
              <span class="tool-icon" @click="$refs.postImgInput.click()" title="添加图片">📷</span>
              <input type="file" ref="postVideoInput" accept="video/*" style="display: none" @change="handlePostVideos" />
              <span class="tool-icon" @click="$refs.postVideoInput.click()" title="添加视频">🎥</span>
              <span class="tool-icon" title="表情">😊</span>
            </div>
            <button class="btn-publish" @click="submitPost" :disabled="!isPostValid">
              {{ isPosting ? '发表中...' : (postMode === 'article' ? '发布文章' : '发表说说') }}
            </button>
          </div>
        </div>

        <!-- 博文列表 -->
        <div v-if="loadingPosts" class="loading-posts">
          <el-skeleton :rows="3" animated />
        </div>
        
        <!-- 我的文章列表 -->
        <div v-else-if="feedTab === 'my'" class="post-list" :class="'list-mode-' + postMode">
          <div v-for="(post, index) in sortedPosts" :key="post.id || index" class="post-item" :class="['item-mode-' + post.type, { 'pinned-post': isPinned(post.id) }]">
            
            <div class="post-actions">
              <el-dropdown trigger="click">
                <span class="el-dropdown-link">⋮</span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="togglePinPost(post)">
                      <span class="icon">📌</span> {{ isPinned(post.id) ? '取消置顶' : '置顶' }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="openEditPost(post)">
                      <span class="icon">✏️</span> 编辑
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="deletePost(post.id)">
                      <span class="icon text-red">🗑️</span> 删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <!-- 文章封面 -->
            <div v-if="postMode === 'article' && post.cover" class="article-cover-display" @click="openImageViewer([post.cover], 0)">
              <img :src="post.cover" />
            </div>

            <div class="post-header">
              <img :src="userInfo.avatar || defaultAvatar" class="mini-avatar" />
              <div class="post-meta">
                <span class="post-author">{{ userInfo.username || userInfo.name }}</span>
                <span class="post-time">{{ post.createTimeStr || post.date }}</span>
              </div>
              <span v-if="post.type === 'article'" class="post-tag article-tag">文章</span>
              <span v-else class="post-tag shuoshuo-tag">说说</span>
              <span v-if="isPinned(post.id)" class="pinned-tag">📌 置顶</span>
            </div>

            <div class="post-content">
              <h3 v-if="post.title" class="post-title">{{ post.title }}</h3>
              <p :class="postMode === 'article' ? 'article-content' : 'shuoshuo-content'">{{ post.content }}</p>
              
              <!-- 媒体展示 -->
              <div v-if="(post.images && post.images.length) || (post.videos && post.videos.length)" class="post-media-grid" :class="'grid-' + Math.min((post.images?.length || 0) + (post.videos?.length || 0), 9)">
                <div v-for="(vid, idx) in post.videos" :key="'v-'+idx" class="grid-item video-grid-item">
                  <video :src="vid" controls preload="metadata"></video>
                </div>
                <div v-for="(img, idx) in post.images" :key="'i-'+idx" class="grid-item">
                  <img :src="img" @click="openImageViewer(post.images, idx)" />
                </div>
              </div>
            </div>

            <div class="post-footer">
              <span class="action-item" @click.stop="togglePostComment(post)">
                <svg class="post-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {{ post.comments || 0 }}
              </span>
              <span class="action-item" @click.stop="sharePost(post)">
                <svg class="post-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                分享
              </span>
            </div>
          </div>
          
          <div v-if="posts.length === 0" class="empty-posts">
            <p>暂无博文，快去发表第一篇吧！</p>
          </div>
        </div>

        <!-- 喜欢的文章列表 -->
        <div v-else-if="feedTab === 'liked'" class="post-list">
          <div v-if="loadingLiked" class="loading-posts">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else>
            <div 
              v-for="article in likedArticles" 
              :key="article.id" 
              class="post-item item-mode-article liked-post-card"
              @click="$router.push(`/article/${article.id}`)"
            >
              <!-- 头部：作者信息 + 类型标签 -->
              <div class="post-header">
                <img :src="getArticleAuthorAvatar(article)" class="mini-avatar" />
                <div class="post-meta">
                  <span class="post-author">{{ getArticleAuthorName(article) }}</span>
                  <span class="post-time">{{ formatArticleTime(article) }}</span>
                </div>
                <span v-if="article.type === 'article'" class="post-tag article-tag">文章</span>
                <span v-else class="post-tag shuoshuo-tag">说说</span>
                <span class="liked-badge">
                  <svg class="liked-badge-icon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </span>
              </div>

              <!-- 内容区 -->
              <div class="post-content">
                <h3 v-if="article.title" class="post-title liked-title">{{ article.title }}</h3>
                <p class="liked-summary">{{ (article.summary || article.content || '').substring(0, 120) }}</p>
                
                <!-- 文章配图 -->
                <div v-if="getArticleImages(article).length > 0" class="post-media-grid" :class="'grid-' + Math.min(getArticleImages(article).length, 9)">
                  <div v-for="(img, idx) in getArticleImages(article).slice(0, 9)" :key="idx" class="grid-item" @click.stop="openImageViewer(getArticleImages(article), idx)">
                    <img :src="img" />
                  </div>
                </div>
              </div>

              <!-- 底部统计 -->
              <div class="post-footer liked-footer">
                <span class="action-item liked-stat">
                  <svg class="post-stat-icon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {{ article.likes || 0 }}
                </span>
                <span class="action-item liked-stat">
                  <svg class="post-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {{ article.comments || 0 }}
                </span>
                <span class="action-item liked-stat">
                  <svg class="post-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {{ article.views || 0 }}
                </span>
              </div>
            </div>
            <div v-if="likedArticles.length === 0" class="empty-posts">
              <p>暂无喜欢的文章，去首页看看吧~</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 图片查看器 -->
    <el-image-viewer
      v-if="showImageViewer"
      :url-list="currentViewImages"
      :initial-index="currentImageIndex"
      @close="closeImageViewer"
    />

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑个人资料" width="500px" :close-on-click-modal="false" append-to-body custom-class="custom-edit-dialog">
      <div class="edit-assets-section">
        <div class="asset-item">
          <label>头像</label>
          <div class="edit-avatar-box" @click="$refs.editAvatarInput.click()">
            <img :src="editForm.tempAvatar || userInfo.avatar || defaultAvatar" alt="Edit Avatar" />
            <div class="edit-avatar-mask"><span>📷 更换</span></div>
          </div>
          <input type="file" ref="editAvatarInput" accept="image/*" style="display: none" @change="handleEditAvatarChange" />
        </div>
        <div class="asset-item">
          <label>背景图</label>
          <div class="edit-bg-box" @click="$refs.editBgInput.click()">
            <img :src="editForm.tempBackground || currentBackground" alt="Edit Background" />
            <div class="edit-bg-mask"><span>📷 更换背景</span></div>
          </div>
          <input type="file" ref="editBgInput" accept="image/*" style="display: none" @change="handleEditBgChange" />
        </div>
      </div>
      <el-form :model="editForm" label-width="80px" class="edit-form">
        <el-form-item label="昵称"><el-input v-model="editForm.username" placeholder="请输入昵称" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="editForm.email" placeholder="请输入邮箱" /></el-form-item>
        <el-form-item label="所在地"><el-input v-model="editForm.location" placeholder="请输入所在地" /></el-form-item>
        <el-form-item label="个性签名"><el-input v-model="editForm.bio" type="textarea" :rows="3" placeholder="写点什么介绍一下自己吧..." /></el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditInfo" :loading="isSubmitting">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑博文对话框 -->
    <el-dialog v-model="editPostDialogVisible" title="编辑博文" width="600px" :close-on-click-modal="false" append-to-body custom-class="custom-edit-dialog">
      <el-form :model="editingPost" label-width="80px" class="edit-form">
        <el-form-item label="标题"><el-input v-model="editingPost.title" placeholder="请输入标题" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="editingPost.content" type="textarea" :rows="5" placeholder="请输入内容" /></el-form-item>
        <el-form-item label="媒体">
          <div v-if="(editingPost.images && editingPost.images.length) || (editingPost.videos && editingPost.videos.length)" class="media-preview-grid">
            <div v-for="(img, idx) in editingPost.images" :key="'e-img-'+idx" class="preview-item">
              <img :src="img" /><span class="remove-media" @click="removeEditingImage(idx)">×</span>
            </div>
            <div v-for="(vid, idx) in editingPost.videos" :key="'e-vid-'+idx" class="preview-item video-item">
              <video :src="vid" controls></video><span class="remove-media" @click="removeEditingVideo(idx)">×</span>
            </div>
          </div>
          <div v-else class="no-images-tip">暂无媒体文件</div>
          <div style="margin-top: 10px;">
            <input type="file" ref="editPostImgInput" multiple accept="image/*" style="display: none" @change="handleEditPostImages" />
            <el-button size="small" @click="$refs.editPostImgInput.click()">+ 图片</el-button>
            <input type="file" ref="editPostVideoInput" accept="video/*" style="display: none" @change="handleEditPostVideos" />
            <el-button size="small" @click="$refs.editPostVideoInput.click()">+ 视频</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editPostDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditPost" :loading="isEditingPost">保存修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElImageViewer, ElMessageBox } from 'element-plus'
import { fetchFollowingList, fetchFollowers, fetchLikedArticles, fetchFollowUser, fetchArticleList, fetchUserInfo as fetchUserInfoApi } from '@/utils/api'

const router = useRouter()
const route = useRoute()

// 判断是否是查看他人主页
const profileUserId = computed(() => route.params.id ? parseInt(route.params.id) : null)
const isSelfProfile = computed(() => !profileUserId.value || profileUserId.value === currentUserId.value)
const currentUserId = ref(null)
const isFollowing = ref(false)

// --- State ---
const defaultAvatar = 'https://mywebpro.oss-cn-beijing.aliyuncs.com/ac052700-4c99-48a0-8e11-57d95c025220.jpg'
const currentBackground = ref('')
const userInfo = reactive({ name: '', username: '', email: '', bio: '', joinDate: '', location: '', avatar: '' })
const showImageViewer = ref(false)
const currentViewImages = ref([])
const currentImageIndex = ref(0)
const postMode = ref('shuoshuo')
const newPost = ref({ title: '', content: '', images: [], videos: [], cover: '' })
const isPosting = ref(false)
const posts = ref([])
const loadingPosts = ref(false)
const editDialogVisible = ref(false)
const isSubmitting = ref(false)
const editForm = reactive({ username: '', email: '', location: '', bio: '', tempAvatar: '', tempBackground: '' })
const editPostDialogVisible = ref(false)
const isEditingPost = ref(false)
const editingPost = reactive({ id: null, title: '', content: '', images: [], videos: [] })

// 新增：统计数据、Tab、关注/粉丝、喜欢的文章
const userStats = reactive({ following: 0, followers: 0, totalLikes: 0 })
const feedTab = ref('my')
const showFollowingDialog = ref(false)
const showFollowersDialog = ref(false)
const followingList = ref([])
const followersList = ref([])
const likedArticles = ref([])
const loadingLiked = ref(false)

// 置顶文章功能
const pinnedPostIds = ref([])
const loadPinnedPosts = () => {
  try {
    const saved = localStorage.getItem('pinnedPostIds')
    pinnedPostIds.value = saved ? JSON.parse(saved) : []
  } catch (e) { pinnedPostIds.value = [] }
}
const savePinnedPosts = () => {
  localStorage.setItem('pinnedPostIds', JSON.stringify(pinnedPostIds.value))
}
const togglePinPost = (post) => {
  const idx = pinnedPostIds.value.indexOf(post.id)
  if (idx > -1) {
    pinnedPostIds.value.splice(idx, 1)
    ElMessage.success('已取消置顶')
  } else {
    if (pinnedPostIds.value.length >= 3) {
      ElMessage.warning('最多置顶3篇文章')
      return
    }
    pinnedPostIds.value.unshift(post.id)
    ElMessage.success('已置顶')
  }
  savePinnedPosts()
}
const isPinned = (postId) => pinnedPostIds.value.includes(postId)
// 排序：置顶文章在前
const sortedPosts = computed(() => {
  if (pinnedPostIds.value.length === 0) return posts.value
  const pinned = pinnedPostIds.value.map(id => posts.value.find(p => p.id === id)).filter(Boolean)
  const unpinned = posts.value.filter(p => !pinnedPostIds.value.includes(p.id))
  return [...pinned, ...unpinned]
})

const isPostValid = computed(() => {
  if (postMode.value === 'article') return newPost.value.title && newPost.value.content
  return newPost.value.content || newPost.value.images.length > 0 || newPost.value.videos.length > 0
})

// --- Lifecycle ---
onMounted(async () => {
  const savedBg = localStorage.getItem('userBackground')
  if (savedBg) currentBackground.value = savedBg
  
  // 获取当前用户ID
  const saved = localStorage.getItem('userInfo')
  if (saved) {
    const u = JSON.parse(saved)
    currentUserId.value = u.id || u.userId || null
  }
  
  // 如果是查看他人主页，加载该用户信息
  if (!isSelfProfile.value) {
    await loadOtherUserProfile()
    // 检查是否已关注
    const followResult = await fetchFollowingList()
    const ids = (followResult.data || []).map(u => u.id || u)
    isFollowing.value = ids.includes(profileUserId.value)
  }
  
  // 先获取用户信息（设置 currentUserId），再加载文章和统计
  await fetchUserInfo()
  loadPinnedPosts()
  fetchPosts()
  loadUserStats()
})

// 加载他人主页信息
const loadOtherUserProfile = async () => {
  try {
    const response = await fetch(`/admin/user/info/${profileUserId.value}`, { 
      method: 'GET', 
      headers: { 'token': localStorage.getItem('token') || '' } 
    })
    if (response.ok) {
      const result = await response.json()
      if (result.code === 1 && result.data) {
        const data = result.data
        userInfo.username = data.username || data.name || ''
        userInfo.name = data.name || ''
        userInfo.bio = data.bio || ''
        userInfo.avatar = data.avatar || ''
        userInfo.email = data.email || ''
        userInfo.location = data.location || ''
      }
    }
  } catch (e) {
    console.error('Load other user profile error:', e)
  }
}

// --- 统计数据加载 ---
const loadUserStats = async () => {
  // 加载关注列表
  const followResult = await fetchFollowingList()
  const rawList = followResult.data || []
  followingList.value = rawList.map(u => {
    if (typeof u === 'object') return u
    return { id: u, username: 'User' + u }
  })
  userStats.following = followingList.value.length

  // 加载粉丝列表
  const fansResult = await fetchFollowers()
  followersList.value = (fansResult.data || []).map(u => ({ ...u, isFollowedBack: false }))
  userStats.followers = followersList.value.length

  // 计算获赞总数（从已发布的文章中累计）
  // 延迟执行，等 fetchPosts 完成
  setTimeout(() => {
    userStats.totalLikes = posts.value.reduce((sum, p) => sum + (p.likes || 0), 0)
  }, 1000)
}

// --- 关注/取消关注 ---
const unfollowUser = async (user) => {
  try {
    await ElMessageBox.confirm(`确定取消关注「${user.username}」吗？`, '提示', { type: 'warning' })
    await fetchFollowUser(user.id)
    followingList.value = followingList.value.filter(u => u.id !== user.id)
    userStats.following = followingList.value.length
    ElMessage.success('已取消关注')
  } catch (e) { /* cancelled */ }
}

const toggleFollowBack = async (user) => {
  user.isFollowedBack = !user.isFollowedBack
  await fetchFollowUser(user.id)
  ElMessage.success(user.isFollowedBack ? '已关注' : '取消关注')
}

// --- 喜欢的文章 ---
const likedArticleIds = ref(new Set()) // 已赞文章ID集合，用于标记isLiked

const switchToLiked = async () => {
  feedTab.value = 'liked'
  loadingLiked.value = true
  const uid = currentUserId.value
  console.log('[switchToLiked] currentUserId:', uid)
  if (!uid) { 
    console.warn('[switchToLiked] currentUserId is null, cannot load liked articles')
    loadingLiked.value = false; return 
  }
  const result = await fetchLikedArticles(uid)
  console.log('[switchToLiked] API result:', JSON.stringify(result))
  const rawList = Array.isArray(result.data) ? result.data : []
  console.log('[switchToLiked] rawList length:', rawList.length, 'items:', rawList)
  likedArticles.value = rawList.map(a => ({
    ...a,
    author: a.author || { username: '匿名用户', avatar: '' },
    summary: a.summary || (a.content || '').substring(0, 100) + '...'
  }))
  console.log('[switchToLiked] likedArticles count:', likedArticles.value.length)
  // 记录已赞ID，用于标记文章列表中的isLiked
  likedArticleIds.value = new Set(rawList.map(a => a.id))
  // 同步更新 posts 列表的 isLiked 状态
  posts.value.forEach(p => {
    p.isLiked = likedArticleIds.value.has(p.id)
  })
  loadingLiked.value = false
}

const getArticleAuthorAvatar = (article) => {
  if (article.author && article.author.avatar) return article.author.avatar
  return defaultAvatar
}

const getArticleAuthorName = (article) => {
  if (article.author && article.author.username) return article.author.username
  return '匿名用户'
}

// 解析文章配图（兼容数组和逗号分隔字符串）
const getArticleImages = (article) => {
  if (!article) return []
  if (Array.isArray(article.images)) return article.images.filter(img => img)
  if (typeof article.images === 'string' && article.images) {
    return article.images.split(/[,，]/).map(s => s.trim()).filter(s => s)
  }
  return []
}

const formatArticleTime = (article) => {
  if (!article.createTime) return ''
  if (Array.isArray(article.createTime)) {
    const [y, m, d] = article.createTime
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  return article.createTime
}



// --- API Methods ---
const fetchUserInfo = async () => {
  try {
    const result = await fetchUserInfoApi()
    if (result.success && result.data) {
      const data = result.data
      // 设置当前用户ID（用于加载喜欢的文章等）
      if (!currentUserId.value && data.id) {
        currentUserId.value = data.id
      }
      userInfo.name = data.name || ''
      userInfo.username = data.username || data.name || ''
      userInfo.email = data.email || ''
      userInfo.bio = data.bio || ''
      if (data.createTime && Array.isArray(data.createTime)) {
        const [year, month, day] = data.createTime
        userInfo.joinDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
      userInfo.location = data.location || ''
      userInfo.avatar = data.avatar || ''
      if (data.background) currentBackground.value = data.background
      // 同步到 localStorage
      localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, id: data.id }))
    }
  } catch (error) {
    console.error('Fetch User Info Error:', error)
    // fallback to localStorage
    const saved = localStorage.getItem('userInfo')
    if (saved) {
      const u = JSON.parse(saved)
      userInfo.username = u.username || u.name || ''
      userInfo.name = u.name || ''
      userInfo.email = u.email || ''
      userInfo.bio = u.bio || ''
      userInfo.avatar = u.avatar || ''
      userInfo.location = u.location || ''
    }
  }
}

const fetchPosts = async () => {
  loadingPosts.value = true
  try {
    const response = await fetch('/admin/article/list', { method: 'GET', headers: { 'token': localStorage.getItem('token') || '' } })
    if (!response.ok) throw new Error('获取博文列表失败')
    const result = await response.json()
    if (result.code === 1 && result.data) {
      const articleList = Array.isArray(result.data) ? result.data : (result.data.list || [])
      
      // 按当前查看的用户ID过滤文章（自己的主页或他人主页）
      const targetUid = isSelfProfile.value ? currentUserId.value : profileUserId.value
      const userArticles = targetUid ? articleList.filter(a => a.author && a.author.id === targetUid) : articleList
      
      // 获取当前用户已赞文章列表，用于标记 isLiked
      const uid = currentUserId.value
      let likedIds = new Set()
      if (uid) {
        try {
          const likeResult = await fetchLikedArticles(uid)
          const likedList = Array.isArray(likeResult.data) ? likeResult.data : []
          likedIds = new Set(likedList.map(a => a.id))
          likedArticleIds.value = likedIds
        } catch (e) { /* ignore */ }
      }
      
      posts.value = userArticles.map(article => {
        let dateStr = ''
        if (article.createTime) {
          if (Array.isArray(article.createTime)) {
            const [y, m, d] = article.createTime
            dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          } else { dateStr = article.createTime }
        }
        let images = [], videos = [], cover = article.cover || ''
        if (article.images) images = typeof article.images === 'string' ? article.images.split(',').filter(u=>u) : article.images
        if (article.videos) videos = typeof article.videos === 'string' ? article.videos.split(',').filter(u=>u) : article.videos
        if (!images.length && !videos.length && article.media) {
          const mediaList = typeof article.media === 'string' ? article.media.split(',') : article.media
          mediaList.forEach(url => { url.match(/\.(mp4|webm|ogg)$/i) ? videos.push(url) : images.push(url) })
        }
        return { 
          id: article.id, title: article.title, content: article.content, images, videos, cover, 
          type: article.type || (article.title ? 'article' : 'shuoshuo'), 
          likes: article.likes, comments: article.comments ?? 0, 
          createTimeStr: dateStr, date: dateStr,
          isLiked: likedIds.has(article.id)
        }
      })
    }
  } catch (error) {
    console.error('Fetch Posts Error:', error)
    ElMessage.error('获取博文失败')
  } finally { loadingPosts.value = false }
}

const uploadToOSS = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  try {
    const response = await fetch('/admin/upload', { method: 'POST', body: formData, headers: { 'token': localStorage.getItem('token') || '' } })
    if (!response.ok) throw new Error(`上传失败`)
    const result = await response.json()
    if (result.code === 1 && result.data) return result.data
    else throw new Error(result.msg || '上传失败')
  } catch (error) {
    ElMessage.error(error.message || '文件上传失败')
    throw error
  }
}

const handleArticleCoverUpload = async (event) => {
  const file = event.target.files[0]; if (!file) return
  if (!file.type.startsWith('image/')) { ElMessage.error('请选择图片文件'); return }
  try { ElMessage.info('正在上传封面...'); const url = await uploadToOSS(file); newPost.value.cover = url; ElMessage.success('封面上传成功') } catch (err) {} finally { event.target.value = '' }
}

const handleEditBgChange = async (event) => {
  const file = event.target.files[0]; if (!file) return
  try { ElMessage.info('正在上传背景...'); const url = await uploadToOSS(file); editForm.tempBackground = url; ElMessage.success('背景上传成功，请点击保存以应用') } catch (err) {} finally { event.target.value = '' }
}

const handleEditAvatarChange = async (event) => {
  const file = event.target.files[0]; if (!file) return
  try { ElMessage.info('正在上传头像...'); const url = await uploadToOSS(file); editForm.tempAvatar = url; ElMessage.success('头像上传成功，请点击保存以应用') } catch (err) {} finally { event.target.value = '' }
}

const handlePostImages = async (event) => {
  const files = Array.from(event.target.files); if (files.length === 0) return
  if (newPost.value.images.length + files.length > 9) { ElMessage.warning('最多只能上传9个媒体文件'); return }
  try { const urls = await Promise.all(files.map(f => uploadToOSS(f))); newPost.value.images.push(...urls); ElMessage.success('图片上传完成') } catch (e) {} finally { event.target.value = '' }
}

const handlePostVideos = async (event) => {
  const files = Array.from(event.target.files); if (files.length === 0) return
  if (newPost.value.images.length + newPost.value.videos.length + files.length > 9) { ElMessage.warning('最多只能上传9个媒体文件'); return }
  try { const urls = await Promise.all(files.map(f => uploadToOSS(f))); newPost.value.videos.push(...urls); ElMessage.success('视频上传完成') } catch (e) {} finally { event.target.value = '' }
}

const handleEditPostImages = async (event) => {
  const files = Array.from(event.target.files); if (files.length === 0) return
  try { const urls = await Promise.all(files.map(f => uploadToOSS(f))); editingPost.images.push(...urls); ElMessage.success('图片上传完成') } catch (e) {} finally { event.target.value = '' }
}

const handleEditPostVideos = async (event) => {
  const files = Array.from(event.target.files); if (files.length === 0) return
  try { const urls = await Promise.all(files.map(f => uploadToOSS(f))); editingPost.videos.push(...urls); ElMessage.success('视频上传完成') } catch (e) {} finally { event.target.value = '' }
}

const removeImage = (i) => newPost.value.images.splice(i, 1)
const removeVideo = (i) => newPost.value.videos.splice(i, 1)
const removeEditingImage = (i) => editingPost.images.splice(i, 1)
const removeEditingVideo = (i) => editingPost.videos.splice(i, 1)

const submitPost = async () => {
  if (!isPostValid.value) { ElMessage.warning(postMode.value === 'article' ? '标题和内容不能为空' : '请填写内容或上传媒体'); return }
  isPosting.value = true
  try {
    const payload = { title: newPost.value.title, content: newPost.value.content, images: newPost.value.images.join(','), videos: newPost.value.videos.join(','), cover: newPost.value.cover, type: postMode.value }
    const response = await fetch('/admin/article/add', { method: 'POST', headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') }, body: JSON.stringify(payload) })
    const result = await response.json()
    if (response.ok && (result.code === 1 || result.code === 200)) { ElMessage.success('发表成功'); newPost.value = { title: '', content: '', images: [], videos: [], cover: '' }; fetchPosts() }
    else ElMessage.error(result.msg || '发表失败')
  } catch (error) { ElMessage.error('网络请求失败') } finally { isPosting.value = false }
}

const openEditPost = (post) => { editingPost.id = post.id; editingPost.title = post.title; editingPost.content = post.content; editingPost.images = [...(post.images || [])]; editingPost.videos = [...(post.videos || [])]; editPostDialogVisible.value = true }

const submitEditPost = async () => {
  if (!editingPost.content && editingPost.images.length === 0 && editingPost.videos.length === 0) { ElMessage.warning('请填写内容或上传媒体'); return }
  isEditingPost.value = true
  try {
    const payload = { id: editingPost.id, title: editingPost.title, content: editingPost.content, images: editingPost.images.join(','), videos: editingPost.videos.join(',') }
    const response = await fetch('/admin/article/update', { method: 'POST', headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') }, body: JSON.stringify(payload) })
    const result = await response.json()
    if (response.ok && (result.code === 1 || result.code === 200)) { ElMessage.success('修改成功'); editPostDialogVisible.value = false; fetchPosts() }
    else ElMessage.error(result.msg || '修改失败')
  } catch (error) { ElMessage.error('网络请求失败') } finally { isEditingPost.value = false }
}

const deletePost = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇博文吗？', '警告', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    const response = await fetch(`/admin/article/delete/${id}`, { method: 'DELETE', headers: { 'token': localStorage.getItem('token') } })
    const result = await response.json()
    if (response.ok && (result.code === 1 || result.code === 200)) { ElMessage.success('删除成功'); fetchPosts() }
    else ElMessage.error(result.msg || '删除失败')
  } catch (error) { if (error !== 'cancel') ElMessage.error('网络请求失败') }
}

const handleLogout = () => { if (confirm('确定要退出当前账号吗？')) { localStorage.removeItem('token'); router.push('/') } }

// 关注当前主页用户
const toggleFollowThisUser = async () => {
  isFollowing.value = !isFollowing.value
  await fetchFollowUser(profileUserId.value)
  ElMessage.success(isFollowing.value ? '已关注' : '取消关注')
}



// 点击评论 - 跳转到文章详情页
const togglePostComment = (post) => {
  router.push(`/article/${post.id}`)
}

// 分享博文
const sharePost = async (post) => {
  const url = `${window.location.origin}/article/${post.id}`
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (e) {
    ElMessage.info('分享链接: ' + url)
  }
}
const openImageViewer = (images, index) => { currentViewImages.value = images; currentImageIndex.value = index; showImageViewer.value = true }
const closeImageViewer = () => { showImageViewer.value = false; setTimeout(() => { currentViewImages.value = []; currentImageIndex.value = 0 }, 300) }
const openEditDialog = () => { editForm.username = userInfo.username || userInfo.name; editForm.email = userInfo.email; editForm.location = userInfo.location || ''; editForm.bio = userInfo.bio || ''; editForm.tempAvatar = ''; editForm.tempBackground = ''; editDialogVisible.value = true }

const submitEditInfo = async () => {
  if (!editForm.username || !editForm.email) { ElMessage.warning('昵称和邮箱不能为空'); return }
  isSubmitting.value = true
  const finalAvatarUrl = editForm.tempAvatar || userInfo.avatar
  const finalBgUrl = editForm.tempBackground || currentBackground.value
  try {
    const payload = { username: editForm.username, email: editForm.email, location: editForm.location, bio: editForm.bio, avatar: finalAvatarUrl, background: finalBgUrl }
    const response = await fetch('/admin/user/change', { method: 'POST', headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') || '' }, body: JSON.stringify(payload) })
    const result = await response.json()
    if (response.ok && (result.code === 1 || result.code === 200)) {
      ElMessage.success('资料修改成功')
      userInfo.username = editForm.username; userInfo.name = editForm.username; userInfo.email = editForm.email; userInfo.location = editForm.location; userInfo.bio = editForm.bio; userInfo.avatar = finalAvatarUrl
      currentBackground.value = finalBgUrl; localStorage.setItem('userBackground', finalBgUrl)
      editDialogVisible.value = false
    } else ElMessage.error(result.msg || '修改失败')
  } catch (error) { ElMessage.error('网络请求失败，请重试') } finally { isSubmitting.value = false }
}
</script>

<style scoped>
/* 完全复用 MyIndex_head.vue 的样式 */
:global(body), :global(html) { margin: 0; padding: 0; width: 100%; height: 100%; overflow-x: hidden; }

.qzone-container { position: relative; width: 100%; min-height: 100vh; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; overflow-x: hidden; box-sizing: border-box; }
.background-layer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; background-repeat: no-repeat; z-index: -1; transition: background-image 0.5s ease-in-out; }
.background-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.4); }
.top-nav { display: flex; justify-content: space-between; align-items: center; padding: 15px 40px; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: white; position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.logo { font-size: 1.4rem; font-weight: bold; letter-spacing: 1px; }
.nav-right { display: flex; gap: 15px; align-items: center; }
.nav-back-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; transition: all 0.3s; }
.nav-back-btn:hover { background: rgba(255,255,255,0.25); }
.main-content { display: flex; justify-content: center; gap: 20px; padding: 30px 20px; max-width: 1200px; margin: 0 auto; align-items: flex-start; }
.sidebar { width: 280px; flex-shrink: 0; }
.profile-card { background: rgba(255, 255, 255, 0.95); border-radius: 8px; overflow: visible; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; padding-bottom: 20px; position: relative; margin-bottom: 20px; }
.card-actions { position: absolute; top: 10px; right: 10px; z-index: 10; }
.action-btn { background: rgba(0, 0, 0, 0.1); border: none; color: #666; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; line-height: 1; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
.action-btn:hover { background: rgba(0, 0, 0, 0.2); color: #333; }
.avatar-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 0; margin-bottom: 15px; position: relative; cursor: pointer; transition: filter 0.3s; }
.avatar-box:hover { filter: brightness(0.9); }
.avatar-view-mask { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
.avatar-box:hover .avatar-view-mask { opacity: 1; }
.avatar-img { width: 100px; height: 100px; border-radius: 50%; border: 4px solid white; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
.user-basic { padding: 0 15px 15px; border-bottom: 1px solid #eee; }
.user-name { font-size: 1.4rem; color: #333; margin: 10px 0 5px; }
.user-signature { font-size: 0.9rem; color: #666; font-style: italic; margin: 0; }
.info-list { padding: 15px; text-align: left; }
.info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem; }
.info-row .label { color: #999; }
.info-row .value { color: #333; font-weight: 500; }
.mode-switch-card { background: rgba(255, 255, 255, 0.95); border-radius: 8px; padding: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; margin-bottom: 20px; }
.switch-title { font-size: 14px; color: #666; margin-bottom: 10px; font-weight: bold; }
.mode-radio-group { display: flex; width: 100%; }
.mode-radio-group :deep(.el-radio-button) { flex: 1; }
.mode-radio-group :deep(.el-radio-button__inner) { width: 100%; padding: 8px 0; }
.mode-desc { font-size: 12px; color: #999; margin-top: 8px; }
.feed-area { flex: 1; max-width: 600px; }
.publish-box { background: rgba(255, 255, 255, 0.95); border-radius: 8px; padding: 15px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: all 0.3s; }
.publish-box.mode-article { padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.article-cover-setup { margin-bottom: 15px; display: flex; align-items: center; gap: 15px; }
.cover-preview { width: 120px; height: 80px; border-radius: 6px; overflow: hidden; border: 2px dashed #ddd; cursor: pointer; position: relative; background: #f9f9f9; }
.cover-preview img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px; }
.cover-tip { font-size: 12px; color: #999; }
.post-title-input { width: 100%; border: none; border-bottom: 1px solid #eee; padding: 8px 0; margin-bottom: 10px; font-size: 1.1rem; font-weight: bold; outline: none; }
.mode-article .post-title-input { font-size: 1.4rem; border-bottom: 2px solid #2575fc; margin-bottom: 20px; }
.publish-box textarea { width: 100%; border: 1px solid #eee; border-radius: 4px; padding: 10px; resize: none; font-family: inherit; margin-bottom: 10px; outline: none; }
.publish-box textarea:focus { border-color: #2575fc; }
.mode-article .publish-box textarea { font-size: 1.05rem; line-height: 1.8; border: none; background: #fafafa; padding: 15px; }
.media-preview-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
.preview-item { position: relative; width: 80px; height: 80px; border-radius: 4px; overflow: hidden; background: #f0f0f0; }
.preview-item img, .preview-item video { width: 100%; height: 100%; object-fit: cover; }
.remove-media { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; width: 18px; height: 18px; border-radius: 50%; text-align: center; line-height: 16px; cursor: pointer; font-size: 12px; }
.publish-footer { display: flex; justify-content: space-between; align-items: center; }
.tools { display: flex; gap: 15px; }
.tool-icon { cursor: pointer; font-size: 1.2rem; opacity: 0.6; transition: opacity 0.3s; }
.tool-icon:hover { opacity: 1; }
.btn-publish { background: #2575fc; color: white; border: none; padding: 6px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; }
.btn-publish:hover { background: #1a5bca; }
.btn-publish:disabled { background: #ccc; cursor: not-allowed; }
.post-item { background: rgba(255, 255, 255, 0.95); border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: transform 0.2s; position: relative; }
.post-item:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.item-mode-article { padding: 0; overflow: hidden; }
.item-mode-article .post-content { padding: 0 20px 15px; }
.item-mode-article .post-footer { padding: 15px 20px; margin: 0; }
/* 说说也采用和文章一致的布局 */
.item-mode-shuoshuo { padding: 0; overflow: hidden; }
.item-mode-shuoshuo .post-content { padding: 0 20px 15px; }
.item-mode-shuoshuo .post-footer { padding: 15px 20px; margin: 0; }
.post-actions { position: absolute; top: 15px; right: 15px; display: flex; align-items: center; gap: 8px; z-index: 5; }
.text-red { color: #f56c6c; }
.post-header { display: flex; align-items: center; gap: 10px; padding: 15px 20px; margin-bottom: 0; }
.mini-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.post-meta { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.post-author { font-weight: 600; color: #333; font-size: 14px; line-height: 1.3; }
.post-time { font-size: 12px; color: #999; line-height: 1.3; }
.post-tag { font-size: 10px; padding: 2px 8px; border-radius: 10px; display: inline-block; line-height: 1.4; white-space: nowrap; flex-shrink: 0; align-self: center; }
.shuoshuo-tag { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
.article-tag { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.pinned-tag { font-size: 10px; padding: 2px 8px; border-radius: 10px; display: inline-block; line-height: 1.4; white-space: nowrap; flex-shrink: 0; align-self: center; background: #fff7e6; color: #fa8c16; border: 1px solid #ffd591; }
/* 置顶文章高亮 */
.pinned-post { border-left: 3px solid #fa8c16; }
.post-content p { margin: 0 0 15px; line-height: 1.6; color: #444; white-space: pre-wrap; }
.post-title { margin: 0 0 10px; font-size: 1.2rem; color: #333; }
.item-mode-article .post-title { font-size: 1.5rem; margin-bottom: 15px; }
.article-cover-display { width: 100%; height: 200px; overflow: hidden; cursor: pointer; }
.article-cover-display img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.article-cover-display:hover img { transform: scale(1.05); }
.post-media-grid { display: grid; gap: 3px; margin-top: 10px; }
.grid-1 { grid-template-columns: 1fr; max-width: 80%; }
.grid-2, .grid-4 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-5, .grid-6, .grid-7, .grid-8, .grid-9 { grid-template-columns: repeat(3, 1fr); }
.grid-item { position: relative; padding-top: 100%; overflow: hidden; border-radius: 4px; cursor: pointer; background: #000; }
.grid-item img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.grid-item img:hover { transform: scale(1.05); }
.video-grid-item { cursor: default; }
.video-grid-item video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
.post-footer { border-top: 1px solid #f0f0f0; padding: 10px 20px; display: flex; gap: 24px; color: #888; font-size: 13px; }
.action-item { display: flex; align-items: center; gap: 5px; cursor: pointer; transition: color 0.25s; }
.action-item:hover { color: #2575fc; }
.post-stat-icon { width: 15px; height: 15px; flex-shrink: 0; }
.edit-form { padding: 10px 20px; }
.edit-assets-section { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 10px; background: #f9f9f9; border-radius: 8px; }
.asset-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.asset-item label { font-size: 12px; color: #666; font-weight: bold; }
.edit-avatar-box { position: relative; width: 80px; height: 80px; border-radius: 50%; overflow: hidden; cursor: pointer; border: 2px dashed #ddd; }
.edit-avatar-box img { width: 100%; height: 100%; object-fit: cover; }
.edit-avatar-mask { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; opacity: 0; transition: opacity 0.3s; }
.edit-avatar-box:hover .edit-avatar-mask { opacity: 1; }
.edit-bg-box { position: relative; width: 120px; height: 80px; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px dashed #ddd; }
.edit-bg-box img { width: 100%; height: 100%; object-fit: cover; }
.edit-bg-mask { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; opacity: 0; transition: opacity 0.3s; }
.edit-bg-box:hover .edit-bg-mask { opacity: 1; }
.loading-posts { padding: 20px; background: rgba(255, 255, 255, 0.9); border-radius: 8px; }
.empty-posts { text-align: center; padding: 40px; color: #999; background: rgba(255, 255, 255, 0.8); border-radius: 8px; }
.no-images-tip { color: #999; font-size: 12px; }
:deep(.custom-edit-dialog) { border-radius: 8px; overflow: hidden; margin: 15vh auto !important; }
:deep(.el-dialog__header) { border-bottom: 1px solid #eee; padding: 15px 20px; margin: 0; }
:deep(.el-dialog__body) { padding: 20px; }
:deep(.el-input__wrapper) { box-shadow: 0 0 0 1px #dcdfe6 inset; }
:deep(.el-button--primary) { background-color: #2575fc; border-color: #2575fc; }
:deep(.user-action-popover) { padding: 5px 0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.menu-list { display: flex; flex-direction: column; }
.menu-item { padding: 10px 15px; cursor: pointer; display: flex; align-items: center; gap: 10px; color: #333; transition: background 0.2s; }
.menu-item:hover { background-color: #f5f7fa; color: #2575fc; }
.menu-item.logout:hover { color: #e74c3c; background-color: #fef0f0; }
.menu-item .icon { font-size: 1.1rem; }
.divider { height: 1px; background-color: #eee; margin: 5px 0; }
/* 统计栏 */
.stats-bar { display: flex; justify-content: space-around; padding: 12px 15px; border-bottom: 1px solid #eee; }
.stats-bar .stat-item { text-align: center; cursor: pointer; transition: opacity 0.3s; }
.stats-bar .stat-item:hover { opacity: 0.7; }
.stats-bar .stat-num { display: block; font-size: 1.2rem; font-weight: bold; color: #333; }
.stats-bar .stat-label { display: block; font-size: 0.75rem; color: #999; margin-top: 2px; }

/* 他人主页关注按钮 */
.profile-follow-btn-wrapper { padding: 10px 15px; text-align: center; border-bottom: 1px solid #eee; }
.profile-follow-btn { padding: 6px 24px; border-radius: 20px; border: 1px solid #0084ff; background: #0084ff; color: #fff; cursor: pointer; font-size: 14px; transition: all 0.3s; }
.profile-follow-btn:hover { background: #0077e6; }
.profile-follow-btn.followed { background: #f3f4f5; border-color: #e3e3e3; color: #999; }
.profile-follow-btn.followed:hover { background: #fef0f0; color: #f56c6c; border-color: #f56c6c; }

/* 点赞激活状态 */
.action-item.active { color: #ff4d4f; }

/* Feed Tabs */
.feed-tabs { display: flex; gap: 0; background: rgba(255,255,255,0.95); border-radius: 8px; margin-bottom: 15px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.feed-tab { flex: 1; padding: 12px 0; border: none; background: none; font-size: 14px; color: #666; cursor: pointer; transition: all 0.3s; border-bottom: 2px solid transparent; }
.feed-tab:hover { color: #2575fc; background: #f8f9ff; }
.feed-tab.active { color: #2575fc; font-weight: bold; border-bottom-color: #2575fc; background: #f0f6ff; }

/* 关注/粉丝弹窗 */
.empty-dialog-tip { text-align: center; padding: 40px 20px; color: #999; font-size: 14px; }
.follow-user-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.follow-user-item:last-child { border-bottom: none; }
.follow-user-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.follow-user-info { flex: 1; min-width: 0; }
.follow-user-name { font-size: 14px; font-weight: 500; color: #333; }
.follow-user-bio { font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.follow-action-btn { padding: 4px 12px; border: 1px solid #0084ff; border-radius: 4px; background: #fff; color: #0084ff; font-size: 12px; cursor: pointer; transition: all 0.3s; white-space: nowrap; }
.follow-action-btn:hover { background: #f0f9ff; }
.follow-action-btn.followed { background: #f3f4f5; border-color: #e3e3e3; color: #999; }

/* 喜欢的文章 */
/* 喜欢的文章卡片增强 */
.liked-post-card { cursor: pointer; }
.liked-post-card:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,0,0,0.08); }
.liked-title { font-size: 1.15rem; color: #1a1a1a; font-weight: 600; line-height: 1.5; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.liked-summary { font-size: 14px; color: #666; line-height: 1.7; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.liked-footer { border-top: 1px solid #f0f0f0; }
.liked-stat { color: #999; font-size: 13px; }
.liked-stat:hover { color: #2575fc; }
.liked-badge { display: flex; align-items: center; gap: 2px; font-size: 0; color: #ff4d4f; background: #fff1f0; padding: 4px 8px; border-radius: 12px; flex-shrink: 0; }
.liked-badge-icon { width: 14px; height: 14px; }

@media (max-width: 900px) {
  .main-content { flex-direction: column; align-items: center; padding: 0 12px; }
  .sidebar { width: 100%; max-width: 600px; }
  .feed-area { width: 100%; }
  .profile-header { padding: 20px 16px; }
  .profile-avatar { width: 64px; height: 64px; }
  .profile-name { font-size: 18px; }
  .profile-bio { font-size: 13px; }
  .post-card { padding: 12px; }
  .post-header { gap: 8px; }
  .post-avatar { width: 36px; height: 36px; }
  .post-title { font-size: 1rem; }
  .post-content p { font-size: 13px; }
  .post-media-grid { gap: 3px; }
  .grid-1 { max-width: 160px; }
  .grid-2, .grid-4 { max-width: 240px; }
  .grid-3, .grid-5, .grid-6, .grid-7, .grid-8, .grid-9 { max-width: 260px; }
  .post-footer { padding: 10px 12px; font-size: 12px; }
  .liked-post-card { padding: 12px; }
  .liked-title { font-size: 1rem; }
  .liked-summary { font-size: 13px; }
}
</style>
