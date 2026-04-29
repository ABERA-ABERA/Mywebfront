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
        <span class="logo">My blog</span>
      </div>
      <div class="nav-right">
        <!-- 【移除】原有的换背景按钮已移至编辑资料 -->
      </div>
    </header>

    <!-- 3. 主要内容区 -->
    <main class="main-content">
      
      <!-- 左侧：个人信息侧边栏 -->
      <aside class="sidebar">
        <div class="profile-card">
          
          <!-- 【新增】个人卡片右上角的操作菜单 (省略号) -->
          <div class="card-actions">
            <el-popover
              placement="bottom-end"
              trigger="click"
              width="200"
              popper-class="user-action-popover"
            >
              <template #reference>
                <button class="action-btn">⋮</button>
              </template>
              <div class="menu-list">
                <!-- 【修改】编辑资料包含头像、背景修改 -->
                <div class="menu-item" @click="openEditDialog">
                  <span class="icon">✏️</span> 编辑资料
                </div>
                <div class="divider"></div>
                <!-- 退出登录 -->
                <div class="menu-item logout" @click="handleLogout">
                  <span class="icon">🚪</span> 退出登录
                </div>
              </div>
            </el-popover>
          </div>

          <!-- 头像区域：点击查看大图 -->
          <div class="avatar-box" @click="openImageViewer([userInfo.avatar || defaultAvatar], 0)" title="点击查看大图">
            <img :src="userInfo.avatar || defaultAvatar" alt="Avatar" class="avatar-img" />
            <div class="avatar-view-mask">🔍</div>
          </div>
          
          <div class="user-basic">
            <h2 class="user-name">{{ userInfo.username || userInfo.name }}</h2>
            <p class="user-signature">"{{ userInfo.bio || '这个人很懒，什么都没有留下~' }}"</p>
          </div>

          <div class="info-list">
            <div class="info-row"><span class="label">邮箱:</span><span class="value">{{ userInfo.email }}</span></div>
            <div class="info-row"><span class="label">加入于:</span><span class="value">{{ userInfo.joinDate }}</span></div>
            <div class="info-row"><span class="label">所在地:</span><span class="value">{{ userInfo.location || '上海' }}</span></div>
          </div>
        </div>
      </aside>

      <!-- 右侧：博文/动态流 -->
      <section class="feed-area">
        
        <!-- 发布框：升级版 -->
        <div class="publish-box">
          <input v-model="newPost.title" class="post-title-input" placeholder="请输入标题（可选）" />
          <textarea v-model="newPost.content" placeholder="记录此刻的心情..." rows="3"></textarea>
          
          <!-- 【修改】媒体预览区域：支持图片和视频 -->
          <div v-if="newPost.images.length > 0 || newPost.videos.length > 0" class="media-preview-grid">
            <!-- 图片预览 -->
            <div v-for="(img, idx) in newPost.images" :key="'img-'+idx" class="preview-item">
              <img :src="img" />
              <span class="remove-media" @click="removeImage(idx)">×</span>
            </div>
            <!-- 视频预览 -->
            <div v-for="(vid, idx) in newPost.videos" :key="'vid-'+idx" class="preview-item video-item">
              <video :src="vid" controls></video>
              <span class="remove-media" @click="removeVideo(idx)">×</span>
            </div>
          </div>

          <div class="publish-footer">
            <div class="tools">
              <input type="file" ref="postImgInput" multiple accept="image/*" style="display: none" @change="handlePostImages" />
              <span class="tool-icon" @click="$refs.postImgInput.click()" title="添加图片">📷</span>
              
              <!-- 【新增】视频上传入口 -->
              <input type="file" ref="postVideoInput" accept="video/*" style="display: none" @change="handlePostVideos" />
              <span class="tool-icon" @click="$refs.postVideoInput.click()" title="添加视频">🎥</span>
              
              <span class="tool-icon" title="表情">😊</span>
            </div>
            <button class="btn-publish" @click="submitPost" :disabled="!newPost.content && newPost.images.length === 0 && newPost.videos.length === 0" :loading="isPosting">
              {{ isPosting ? '发表中...' : '发表' }}
            </button>
          </div>
        </div>

        <!-- 博文列表 -->
        <div v-if="loadingPosts" class="loading-posts">
          <el-skeleton :rows="3" animated />
        </div>
        
        <div v-else class="post-list">
          <div v-for="(post, index) in posts" :key="post.id || index" class="post-item">
            
            <!-- 【新增】博文操作菜单 -->
            <div class="post-actions">
              <el-dropdown trigger="click">
                <span class="el-dropdown-link">
                  ⋮
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
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

            <div class="post-header">
              <img :src="userInfo.avatar || defaultAvatar" class="mini-avatar" />
              <div class="post-meta">
                <span class="post-author">{{ userInfo.username || userInfo.name }}</span>
                <span class="post-time">{{ post.createTimeStr || post.date }}</span>
              </div>
            </div>

            <div class="post-content">
              <h3 v-if="post.title" class="post-title">{{ post.title }}</h3>
              <p>{{ post.content }}</p>
              
              <!-- 【修改】媒体展示区域：支持图片和视频 -->
              <div v-if="(post.images && post.images.length) || (post.videos && post.videos.length)" class="post-media-grid" :class="'grid-' + Math.min((post.images?.length || 0) + (post.videos?.length || 0), 9)">
                
                <!-- 视频展示 -->
                <div v-for="(vid, idx) in post.videos" :key="'v-'+idx" class="grid-item video-grid-item">
                  <video :src="vid" controls preload="metadata"></video>
                </div>

                <!-- 图片展示 -->
                <div v-for="(img, idx) in post.images" :key="'i-'+idx" class="grid-item">
                  <img :src="img" @click="openImageViewer(post.images, idx)" />
                </div>
              </div>
            </div>

            <div class="post-footer">
              <span class="action-item">❤️ {{ post.likes || 0 }}</span>
              <span class="action-item">💬 {{ post.comments || 0 }}</span>
              <span class="action-item">↗️ 分享</span>
            </div>
          </div>
          
          <div v-if="posts.length === 0" class="empty-posts">
            <p>暂无博文，快去发表第一篇吧！</p>
          </div>
        </div>

      </section>
    </main>

    <!-- 统一的图片查看器 -->
    <el-image-viewer
      v-if="showImageViewer"
      :url-list="currentViewImages"
      :initial-index="currentImageIndex"
      @close="closeImageViewer"
    />

    <!-- 【修改】编辑资料对话框：集成头像、背景修改 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人资料"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
      custom-class="custom-edit-dialog"
    >
      <div class="edit-assets-section">
        <!-- 头像编辑 -->
        <div class="asset-item">
          <label>头像</label>
          <div class="edit-avatar-box" @click="$refs.editAvatarInput.click()">
            <img :src="editForm.tempAvatar || userInfo.avatar || defaultAvatar" alt="Edit Avatar" />
            <div class="edit-avatar-mask">
              <span>📷 更换</span>
            </div>
          </div>
          <input type="file" ref="editAvatarInput" accept="image/*" style="display: none" @change="handleEditAvatarChange" />
        </div>

        <!-- 背景编辑 -->
        <div class="asset-item">
          <label>背景图</label>
          <div class="edit-bg-box" @click="$refs.editBgInput.click()">
            <img :src="editForm.tempBackground || currentBackground" alt="Edit Background" />
            <div class="edit-bg-mask">
              <span>📷 更换背景</span>
            </div>
          </div>
          <input type="file" ref="editBgInput" accept="image/*" style="display: none" @change="handleEditBgChange" />
        </div>
      </div>

      <el-form :model="editForm" label-width="80px" class="edit-form">
        <el-form-item label="昵称">
          <el-input v-model="editForm.username" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="所在地">
          <el-input v-model="editForm.location" placeholder="请输入所在地" />
        </el-form-item>

        <el-form-item label="个性签名">
          <el-input 
            v-model="editForm.bio" 
            type="textarea" 
            :rows="3" 
            placeholder="写点什么介绍一下自己吧..." 
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditInfo" :loading="isSubmitting">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 【新增】编辑博文对话框 -->
    <el-dialog
      v-model="editPostDialogVisible"
      title="编辑博文"
      width="600px"
      :close-on-click-modal="false"
      append-to-body
      custom-class="custom-edit-dialog"
    >
      <el-form :model="editingPost" label-width="80px" class="edit-form">
        <el-form-item label="标题">
          <el-input v-model="editingPost.title" placeholder="请输入标题" />
        </el-form-item>
        
        <el-form-item label="内容">
          <el-input 
            v-model="editingPost.content" 
            type="textarea" 
            :rows="5" 
            placeholder="请输入内容" 
          />
        </el-form-item>

        <!-- 【修改】媒体预览与移除 -->
        <el-form-item label="媒体">
          <div v-if="(editingPost.images && editingPost.images.length) || (editingPost.videos && editingPost.videos.length)" class="media-preview-grid">
             <div v-for="(img, idx) in editingPost.images" :key="'e-img-'+idx" class="preview-item">
              <img :src="img" />
              <span class="remove-media" @click="removeEditingImage(idx)">×</span>
            </div>
            <div v-for="(vid, idx) in editingPost.videos" :key="'e-vid-'+idx" class="preview-item video-item">
              <video :src="vid" controls></video>
              <span class="remove-media" @click="removeEditingVideo(idx)">×</span>
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
          <el-button type="primary" @click="submitEditPost" :loading="isEditingPost">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElImageViewer, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- Props & Emits ---
const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  }
});
const emit = defineEmits(['logout', 'updateUserInfo']);

// --- State ---
const defaultAvatar = 'https://mywebpro.oss-cn-beijing.aliyuncs.com/ac052700-4c99-48a0-8e11-57d95c025220.jpg';
const currentBackground = ref('');

// 【核心】用户信息状态
const userInfo = reactive({
  name: '',
  username: '',
  email: '',
  bio: '',
  joinDate: '',
  location: '',
  avatar: ''
});

// 图片查看器状态
const showImageViewer = ref(false);
const currentViewImages = ref([]);
const currentImageIndex = ref(0);

// 发布表单状态
const newPost = ref({
  title: '',
  content: '',
  images: [],
  videos: [] // 【新增】视频数组
});
const isPosting = ref(false); // 发表加载状态

// 博文列表状态
const posts = ref([]); 
const loadingPosts = ref(false);

// --- 编辑资料相关状态 ---
const editDialogVisible = ref(false);
const isSubmitting = ref(false);
const editForm = reactive({
  username: '',
  email: '',
  location: '',
  bio: '',
  tempAvatar: '',      // 临时头像 URL
  tempBackground: ''   // 临时背景 URL
});

// --- 【新增】编辑博文相关状态 ---
const editPostDialogVisible = ref(false);
const isEditingPost = ref(false);
const editingPost = reactive({
  id: null,
  title: '',
  content: '',
  images: [],
  videos: [] // 【新增】视频数组
});

// --- Lifecycle ---
onMounted(() => {
  // 1. 加载背景 (优先从接口获取，其次本地缓存)
  const savedBg = localStorage.getItem('userBackground');
  if (savedBg) {
    currentBackground.value = savedBg;
  }

  // 2. 获取用户信息和博文
  fetchUserInfo();
  fetchPosts();
});

// --- Methods: API Interaction ---

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await fetch('/admin/user/info', {
      method: 'GET',
      headers: { 'token': localStorage.getItem('token') || '' }
    });

    if (!response.ok) throw new Error('获取用户信息失败');

    const result = await response.json();
    
    if (result.code === 1 && result.data) {
      const data = result.data;
      userInfo.name = data.name || '';
      userInfo.username = data.username || data.name || '';
      userInfo.email = data.email || '';
      userInfo.bio = data.bio || '';
      
      if (data.createTime && Array.isArray(data.createTime)) {
        const [year, month, day] = data.createTime;
        userInfo.joinDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else {
        userInfo.joinDate = '';
      }
      
      userInfo.location = data.location || '';
      userInfo.avatar = data.avatar || '';
      
      // 【重要】如果后端返回了背景图字段（假设字段名为 background 或 cover），则更新
      if (data.background) {
        currentBackground.value = data.background;
      } else if (data.cover) {
        currentBackground.value = data.cover;
      }
      
      emit('updateUserInfo', { ...userInfo });
    } else {
      ElMessage.error(result.msg || '获取用户信息失败');
    }
  } catch (error) {
    console.error('Fetch User Info Error:', error);
    ElMessage.error('网络请求失败，请重试');
  }
};

// 获取博文列表
const fetchPosts = async () => {
  loadingPosts.value = true;
  try {
    const response = await fetch('/admin/article/list', {
      method: 'GET',
      headers: { 'token': localStorage.getItem('token') || '' }
    });

    if (!response.ok) throw new Error('获取博文列表失败');

    const result = await response.json();
    
    if (result.code === 1 && result.data) {
      const articleList = Array.isArray(result.data) ? result.data : (result.data.list || []);
      
      posts.value = articleList.map(article => {
        let dateStr = '';
        if (article.createTime) {
          if (Array.isArray(article.createTime)) {
             const [y, m, d] = article.createTime;
             dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          } else {
             dateStr = article.createTime;
          }
        }
        
        // 【修改】解析图片和视频
        // 假设后端可能返回 mixedMedia 字符串 "img1,url2,vid1.mp4" 或者分开的字段
        // 这里为了兼容，假设后端返回 images 和 videos 字段，或者通过后缀判断
        let images = [];
        let videos = [];

        // 情况1: 后端有独立字段
        if (article.images) {
           images = typeof article.images === 'string' ? article.images.split(',').filter(u=>u) : article.images;
        }
        if (article.videos) {
           videos = typeof article.videos === 'string' ? article.videos.split(',').filter(u=>u) : article.videos;
        }

        // 情况2: 后端只有一个 media 字段，需要前端根据后缀区分 (备用逻辑)
        if (!images.length && !videos.length && article.media) {
           const mediaList = typeof article.media === 'string' ? article.media.split(',') : article.media;
           mediaList.forEach(url => {
             if (url.match(/\.(mp4|webm|ogg)$/i)) {
               videos.push(url);
             } else {
               images.push(url);
             }
           });
        }

        return {
          id: article.id,
          title: article.title,
          content: article.content,
          images: images,
          videos: videos,
          likes: article.likes,
          comments: article.comments,
          createTimeStr: dateStr,
          date: dateStr
        };
      });
    }
  } catch (error) {
    console.error('Fetch Posts Error:', error);
    ElMessage.error('获取博文失败');
  } finally {
    loadingPosts.value = false;
  }
};

// 上传图片到 OSS (通用方法)
const uploadToOSS = async (file) => {
  const formData = new FormData();
  formData.append('file', file); 

  try {
    const response = await fetch('/admin/upload', {
      method: 'POST',
      body: formData,
      headers: { 'token': localStorage.getItem('token') || '' }
    });

    if (!response.ok) throw new Error(`上传失败: ${response.statusText}`);

    const result = await response.json();
    
    if (result.code === 1 && result.data) {
      return result.data;
    } else {
      throw new Error(result.msg || '上传失败');
    }
  } catch (error) {
    console.error('OSS Upload Error:', error);
    ElMessage.error(error.message || '文件上传失败');
    throw error;
  }
};

// 【新增】处理编辑对话框中的背景选择
const handleEditBgChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件');
    return;
  }

  try {
    ElMessage.info('正在上传背景...');
    const url = await uploadToOSS(file);
    editForm.tempBackground = url;
    ElMessage.success('背景上传成功，请点击保存以应用');
  } catch (err) {
    // 错误已在 uploadToOSS 中提示
  } finally {
    event.target.value = '';
  }
};

// 处理编辑对话框中的头像选择
const handleEditAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件');
    return;
  }

  try {
    ElMessage.info('正在上传头像...');
    const url = await uploadToOSS(file);
    editForm.tempAvatar = url;
    ElMessage.success('头像上传成功，请点击保存以应用');
  } catch (err) {
    // 错误已在 uploadToOSS 中提示
  } finally {
    event.target.value = '';
  }
};

// 处理博文多图上传
const handlePostImages = async (event) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  if (newPost.value.images.length + files.length > 9) {
    ElMessage.warning('最多只能上传9个媒体文件');
    return;
  }

  try {
    ElMessage.info(`正在上传 ${files.length} 张图片...`);
    const uploadPromises = files.map(file => uploadToOSS(file));
    const newUrls = await Promise.all(uploadPromises);
    newPost.value.images.push(...newUrls);
    ElMessage.success('图片上传完成');
  } catch (e) {
    console.error(e);
  } finally {
    event.target.value = '';
  }
};

// 【新增】处理博文视频上传
const handlePostVideos = async (event) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  // 限制总媒体数
  const totalMedia = newPost.value.images.length + newPost.value.videos.length;
  if (totalMedia + files.length > 9) {
    ElMessage.warning('最多只能上传9个媒体文件');
    return;
  }

  try {
    ElMessage.info(`正在上传 ${files.length} 个视频...`);
    const uploadPromises = files.map(file => uploadToOSS(file));
    const newUrls = await Promise.all(uploadPromises);
    newPost.value.videos.push(...newUrls);
    ElMessage.success('视频上传完成');
  } catch (e) {
    console.error(e);
  } finally {
    event.target.value = '';
  }
};

// 【新增】处理编辑博文时的图片上传
const handleEditPostImages = async (event) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  if (editingPost.images.length + editingPost.videos.length + files.length > 9) {
    ElMessage.warning('最多只能上传9个媒体文件');
    return;
  }

  try {
    ElMessage.info(`正在上传 ${files.length} 张图片...`);
    const uploadPromises = files.map(file => uploadToOSS(file));
    const newUrls = await Promise.all(uploadPromises);
    editingPost.images.push(...newUrls);
    ElMessage.success('图片上传完成');
  } catch (e) {
    console.error(e);
  } finally {
    event.target.value = '';
  }
};

// 【新增】处理编辑博文时的视频上传
const handleEditPostVideos = async (event) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  if (editingPost.images.length + editingPost.videos.length + files.length > 9) {
    ElMessage.warning('最多只能上传9个媒体文件');
    return;
  }

  try {
    ElMessage.info(`正在上传 ${files.length} 个视频...`);
    const uploadPromises = files.map(file => uploadToOSS(file));
    const newUrls = await Promise.all(uploadPromises);
    editingPost.videos.push(...newUrls);
    ElMessage.success('视频上传完成');
  } catch (e) {
    console.error(e);
  } finally {
    event.target.value = '';
  }
};

const removeImage = (index) => {
  newPost.value.images.splice(index, 1);
};

// 【新增】移除新博文中的视频
const removeVideo = (index) => {
  newPost.value.videos.splice(index, 1);
};

// 【新增】移除编辑中的图片
const removeEditingImage = (index) => {
  editingPost.images.splice(index, 1);
};

// 【新增】移除编辑中的视频
const removeEditingVideo = (index) => {
  editingPost.videos.splice(index, 1);
};

// 【完善】博文发表功能
const submitPost = async () => {
  if (!newPost.value.content && newPost.value.images.length === 0 && newPost.value.videos.length === 0) {
    ElMessage.warning('请填写内容或上传媒体');
    return;
  }

  isPosting.value = true;
  try {
    const payload = {
      title: newPost.value.title,
      content: newPost.value.content,
      images: newPost.value.images.join(','),
      videos: newPost.value.videos.join(',') // 【新增】发送视频字段
    };

    const response = await fetch('/admin/article/add', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'token': localStorage.getItem('token') 
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && (result.code === 1 || result.code === 200)) {
      ElMessage.success('发表成功');
      newPost.value = { title: '', content: '', images: [], videos: [] };
      fetchPosts(); // 重新拉取列表以显示最新博文
    } else {
      ElMessage.error(result.msg || '发表失败');
    }
  } catch (error) {
    console.error('Submit Post Error:', error);
    ElMessage.error('网络请求失败');
  } finally {
    isPosting.value = false;
  }
};

// 【新增】打开编辑博文对话框
const openEditPost = (post) => {
  editingPost.id = post.id;
  editingPost.title = post.title;
  editingPost.content = post.content;
  // 深拷贝媒体数组
  editingPost.images = [...(post.images || [])];
  editingPost.videos = [...(post.videos || [])];
  editPostDialogVisible.value = true;
};

// 【新增】提交编辑博文
const submitEditPost = async () => {
  if (!editingPost.content && editingPost.images.length === 0 && editingPost.videos.length === 0) {
    ElMessage.warning('请填写内容或上传媒体');
    return;
  }

  isEditingPost.value = true;
  try {
    const payload = {
      id: editingPost.id,
      title: editingPost.title,
      content: editingPost.content,
      images: editingPost.images.join(','),
      videos: editingPost.videos.join(',') // 【新增】发送视频字段
    };

    const response = await fetch('/admin/article/update', {
      method: 'POST', // 或 PUT，视后端定义而定
      headers: { 
        'Content-Type': 'application/json', 
        'token': localStorage.getItem('token') 
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && (result.code === 1 || result.code === 200)) {
      ElMessage.success('修改成功');
      editPostDialogVisible.value = false;
      fetchPosts(); // 重新拉取列表
    } else {
      ElMessage.error(result.msg || '修改失败');
    }
  } catch (error) {
    console.error('Update Post Error:', error);
    ElMessage.error('网络请求失败');
  } finally {
    isEditingPost.value = false;
  }
};

// 【新增】删除博文
const deletePost = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇博文吗？', '警告', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const response = await fetch(`/admin/article/delete/${id}`, {
      method: 'DELETE', // 或 POST，视后端定义而定
      headers: { 
        'token': localStorage.getItem('token') 
      }
    });

    const result = await response.json();

    if (response.ok && (result.code === 1 || result.code === 200)) {
      ElMessage.success('删除成功');
      fetchPosts(); // 重新拉取列表
    } else {
      ElMessage.error(result.msg || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete Post Error:', error);
      ElMessage.error('网络请求失败');
    }
  }
};

const handleLogout = () => {
  if (confirm('确定要退出当前账号吗？')) {
    localStorage.removeItem('token');
    emit('logout');
    router.push('/');
  }
};

// 统一打开图片查看器
const openImageViewer = (images, index) => {
  currentViewImages.value = images;
  currentImageIndex.value = index;
  showImageViewer.value = true;
};

const closeImageViewer = () => {
  showImageViewer.value = false;
  setTimeout(() => {
    currentViewImages.value = [];
    currentImageIndex.value = 0;
  }, 300);
};

// 打开编辑资料对话框
const openEditDialog = () => {
  editForm.username = userInfo.username || userInfo.name;
  editForm.email = userInfo.email;
  editForm.location = userInfo.location || '';
  editForm.bio = userInfo.bio || '';
  editForm.tempAvatar = ''; 
  editForm.tempBackground = ''; // 重置临时背景
  editDialogVisible.value = true;
};

// 【核心】提交编辑信息（包含头像和背景）
const submitEditInfo = async () => {
  if (!editForm.username || !editForm.email) {
    ElMessage.warning('昵称和邮箱不能为空');
    return;
  }

  isSubmitting.value = true;
  
  const finalAvatarUrl = editForm.tempAvatar || userInfo.avatar;
  // 如果用户选择了新背景，使用新背景；否则保持原样
  const finalBgUrl = editForm.tempBackground || currentBackground.value;

  try {
    const payload = {
      username: editForm.username,
      email: editForm.email,
      location: editForm.location,
      bio: editForm.bio,
      avatar: finalAvatarUrl,
      background: finalBgUrl // 假设后端字段名为 background
    };

    const response = await fetch('/admin/user/change', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': localStorage.getItem('token') || ''
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && (result.code === 1 || result.code === 200)) {
      ElMessage.success('资料修改成功');
      
      // 更新本地状态
      userInfo.username = editForm.username;
      userInfo.name = editForm.username;
      userInfo.email = editForm.email;
      userInfo.location = editForm.location;
      userInfo.bio = editForm.bio;
      userInfo.avatar = finalAvatarUrl;
      
      // 更新背景
      currentBackground.value = finalBgUrl;
      localStorage.setItem('userBackground', finalBgUrl);
      
      emit('updateUserInfo', { ...userInfo });
      editDialogVisible.value = false;
    } else {
      ElMessage.error(result.msg || '修改失败');
    }
  } catch (error) {
    console.error('Update Info Error:', error);
    ElMessage.error('网络请求失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

</script>

<style scoped>
/* 全局重置 */
:global(body), :global(html) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

.qzone-container { 
  position: relative; 
  width: 100%; 
  min-height: 100vh; 
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
  overflow-x: hidden; 
  box-sizing: border-box;
}

.background-layer { 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background-size: cover; 
  background-position: center; 
  background-repeat: no-repeat; 
  z-index: -1; 
  transition: background-image 0.5s ease-in-out; 
}
.background-overlay { 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(0, 0, 0, 0.4); 
}

.top-nav { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 15px 40px; 
  background: rgba(0, 0, 0, 0.6); 
  backdrop-filter: blur(10px); 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
  color: white; 
  position: sticky; 
  top: 0; 
  z-index: 1000; 
  box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
}

.logo { font-size: 1.4rem; font-weight: bold; letter-spacing: 1px; }
.nav-right { display: flex; gap: 15px; align-items: center; }

.main-content { 
  display: flex; 
  justify-content: center; 
  gap: 20px; 
  padding: 30px 20px; 
  max-width: 1200px; 
  margin: 0 auto; 
  align-items: flex-start; 
}

.sidebar { width: 280px; flex-shrink: 0; }

.profile-card { 
  background: rgba(255, 255, 255, 0.95); 
  border-radius: 8px; 
  overflow: visible; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
  text-align: center; 
  padding-bottom: 20px; 
  position: relative; 
}

.card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.action-btn {
  background: rgba(0, 0, 0, 0.1);
  border: none;
  color: #666;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #333;
}

.avatar-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 0;
  margin-bottom: 15px;
  position: relative;
  cursor: pointer;
  transition: filter 0.3s;
}
.avatar-box:hover { filter: brightness(0.9); }

.avatar-view-mask {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 24px;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.avatar-box:hover .avatar-view-mask { opacity: 1; }

.avatar-img { width: 100px; height: 100px; border-radius: 50%; border: 4px solid white; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
.user-basic { padding: 0 15px 15px; border-bottom: 1px solid #eee; }
.user-name { font-size: 1.4rem; color: #333; margin: 10px 0 5px; }
.user-signature { font-size: 0.9rem; color: #666; font-style: italic; margin: 0; }
.info-list { padding: 15px; text-align: left; }
.info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem; }
.info-row .label { color: #999; }
.info-row .value { color: #333; font-weight: 500; }

.feed-area { flex: 1; max-width: 600px; }

.publish-box { background: rgba(255, 255, 255, 0.95); border-radius: 8px; padding: 15px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.post-title-input { width: 100%; border: none; border-bottom: 1px solid #eee; padding: 8px 0; margin-bottom: 10px; font-size: 1.1rem; font-weight: bold; outline: none; }
.publish-box textarea { width: 100%; border: 1px solid #eee; border-radius: 4px; padding: 10px; resize: none; font-family: inherit; margin-bottom: 10px; outline: none; }
.publish-box textarea:focus { border-color: #2575fc; }

/* 【修改】媒体预览网格样式 */
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

.post-item { 
  background: rgba(255, 255, 255, 0.95); 
  border-radius: 8px; 
  padding: 20px; 
  margin-bottom: 20px; 
  box-shadow: 0 2px 10px rgba(0,0,0,0.05); 
  transition: transform 0.2s; 
  position: relative; /* 为绝对定位的操作按钮提供上下文 */
}
.post-item:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }

/* 【新增】博文操作按钮样式 */
.post-actions {
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
  color: #999;
  font-size: 1.2rem;
  z-index: 5;
}
.post-actions:hover {
  color: #333;
}
.text-red {
  color: #f56c6c;
}

.post-header { display: flex; align-items: center; margin-bottom: 15px; }
.mini-avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; object-fit: cover; }
.post-meta { display: flex; flex-direction: column; }
.post-author { font-weight: bold; color: #333; font-size: 1rem; }
.post-time { font-size: 0.8rem; color: #999; }
.post-content p { margin: 0 0 15px; line-height: 1.6; color: #444; white-space: pre-wrap; }
.post-title { margin: 0 0 10px; font-size: 1.2rem; color: #333; }

/* 【修改】博文媒体网格样式 */
.post-media-grid { display: grid; gap: 5px; margin-top: 10px; }
.grid-1 { grid-template-columns: 1fr; max-width: 80%; }
.grid-2, .grid-4 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-5, .grid-6, .grid-7, .grid-8, .grid-9 { grid-template-columns: repeat(3, 1fr); }

.grid-item { position: relative; padding-top: 100%; overflow: hidden; border-radius: 4px; cursor: pointer; background: #000; }
.grid-item img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.grid-item img:hover { transform: scale(1.05); }

/* 【新增】视频网格项样式 */
.video-grid-item {
  cursor: default; /* 视频不需要放大查看器光标 */
}
.video-grid-item video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 或者 contain，看需求 */
}

.post-footer { border-top: 1px solid #f0f0f0; padding-top: 15px; display: flex; gap: 20px; color: #666; font-size: 0.9rem; }
.action-item { cursor: pointer; transition: color 0.3s; }
.action-item:hover { color: #2575fc; }

.edit-form { padding: 10px 20px; }

/* 【新增】编辑对话框中的资源样式 */
.edit-assets-section {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.asset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.asset-item label {
  font-size: 12px;
  color: #666;
  font-weight: bold;
}

.edit-avatar-box {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #ddd;
}
.edit-avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.edit-avatar-mask {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 10px;
  opacity: 0; transition: opacity 0.3s;
}
.edit-avatar-box:hover .edit-avatar-mask { opacity: 1; }

.edit-bg-box {
  position: relative;
  width: 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #ddd;
}
.edit-bg-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.edit-bg-mask {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 10px;
  opacity: 0; transition: opacity 0.3s;
}
.edit-bg-box:hover .edit-bg-mask { opacity: 1; }


/* 加载和空状态样式 */
.loading-posts { padding: 20px; background: rgba(255, 255, 255, 0.9); border-radius: 8px; }
.empty-posts { text-align: center; padding: 40px; color: #999; background: rgba(255, 255, 255, 0.8); border-radius: 8px; }
.no-images-tip { color: #999; font-size: 12px; }

/* Element Plus 样式穿透 */
:deep(.custom-edit-dialog) {
  border-radius: 8px;
  overflow: hidden;
  margin: 15vh auto !important; 
}
:deep(.el-dialog__header) {
  border-bottom: 1px solid #eee;
  padding: 15px 20px;
  margin: 0;
}
:deep(.el-dialog__body) {
  padding: 20px;
}
:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}
:deep(.el-button--primary) {
  background-color: #2575fc;
  border-color: #2575fc;
}

/* 自定义 Popover 菜单样式 */
:deep(.user-action-popover) {
  padding: 5px 0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.menu-list { display: flex; flex-direction: column; }
.menu-item {
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  transition: background 0.2s;
}
.menu-item:hover { background-color: #f5f7fa; color: #2575fc; }
.menu-item.logout:hover { color: #e74c3c; background-color: #fef0f0; }
.menu-item .icon { font-size: 1.1rem; }
.divider { height: 1px; background-color: #eee; margin: 5px 0; }

@media (max-width: 900px) {
  .main-content { flex-direction: column; align-items: center; }
  .sidebar { width: 100%; max-width: 600px; }
  .feed-area { width: 100%; }
}
</style>