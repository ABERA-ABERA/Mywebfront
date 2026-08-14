<template>
  <header class="zhihu-header">
    <div class="header-content">
      <!-- Logo -->
      <div class="header-left">
        <router-link to="/home" class="logo-link">
          <span class="logo-text">校园论坛</span>
        </router-link>
        
        <!-- 导航标签 -->
        <nav class="nav-tabs">
          <router-link 
            v-for="tab in navTabs" 
            :key="tab.path" 
            :to="tab.path"
            class="nav-tab"
            :class="{ active: $route.path === tab.path || $route.path.startsWith(tab.path + '/') }"
          >
            {{ tab.name }}
          </router-link>
        </nav>
      </div>

      <!-- 搜索框 -->
      <div class="header-center">
        <div class="search-box">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索校园论坛内容、人或话题"
            @keyup.enter="handleSearch"
          />
          <span class="search-icon" @click="handleSearch">🔍</span>
        </div>
      </div>

      <!-- 右侧操作区 -->
      <div class="header-right">
        <!-- 写文章按钮 -->
        <button class="action-btn ask-btn" @click="$router.push('/write')">
          <span>✏️ 写文章</span>
        </button>

        <!-- 私信 -->
        <div class="message-wrapper">
          <el-badge :value="unreadMsgCount" :hidden="unreadMsgCount === 0" class="message-badge">
            <button class="action-btn icon-btn" @click="$router.push('/messages')" title="我的私信">
              <svg class="msg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </button>
          </el-badge>
        </div>

        <!-- 通知 -->
        <div class="notification-wrapper">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
            <button class="action-btn icon-btn" @click="showNotifications = true">
              🔔
            </button>
          </el-badge>
        </div>

        <!-- 用户菜单 -->
        <el-dropdown trigger="click" @command="handleUserCommand">
          <div class="user-avatar-wrapper">
            <img :src="userInfo.avatar || defaultAvatar" class="user-avatar" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="messages">
                <span class="icon">💬</span> 我的私信
                <span v-if="unreadMsgCount > 0" class="msg-badge-inline">{{ unreadMsgCount }}</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="profile">
                <span class="icon">👤</span> 我的主页
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <span class="icon">⚙️</span> 设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <span class="icon text-red">🚪</span> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 通知弹窗 -->
    <el-drawer
      v-model="showNotifications"
      title="通知"
      direction="rtl"
      size="400px"
    >
      <div class="notification-list">
        <div 
          v-for="notif in notifications" 
          :key="notif.id"
          class="notification-item"
          :class="{ unread: !notif.isRead }"
          @click="handleNotifClick(notif)"
        >
          <img :src="notif.user.avatar" class="notif-avatar" />
          <div class="notif-content">
            <div class="notif-header">
              <span class="notif-user">{{ notif.user.username }}</span>
              <span class="notif-type">
                {{ notif.type === 'like' ? '赞了你的文章' : notif.type === 'comment' ? '评论了你的文章' : '关注了你' }}
              </span>
            </div>
            <div v-if="notif.article" class="notif-article">
              {{ notif.article.title }}
            </div>
            <div v-if="notif.content" class="notif-comment">
              {{ notif.content }}
            </div>
            <div class="notif-time">{{ notif.createTime }}</div>
          </div>
        </div>
        <div v-if="notifications.length === 0" class="empty-notif">
          暂无通知
        </div>
      </div>
    </el-drawer>
    <!-- 设置弹窗 -->
    <el-drawer
      v-model="showSettings"
      title="设置"
      direction="rtl"
      size="450px"
    >
      <div class="settings-section">
        <h3 class="settings-group-title">账号设置</h3>
        <div class="settings-item">
          <span class="settings-label">修改密码</span>
          <el-button size="small" @click="ElMessage.info('功能开发中')">修改</el-button>
        </div>
        <div class="settings-item">
          <span class="settings-label">绑定手机</span>
          <el-button size="small" @click="ElMessage.info('功能开发中')">绑定</el-button>
        </div>
        <div class="settings-item">
          <span class="settings-label">绑定邮箱</span>
          <el-button size="small" @click="ElMessage.info('功能开发中')">绑定</el-button>
        </div>
      </div>
      <div class="settings-section">
        <h3 class="settings-group-title">通知偏好</h3>
        <div class="settings-item">
          <span class="settings-label">点赞通知</span>
          <el-switch v-model="settingsForm.likeNotify" />
        </div>
        <div class="settings-item">
          <span class="settings-label">评论通知</span>
          <el-switch v-model="settingsForm.commentNotify" />
        </div>
        <div class="settings-item">
          <span class="settings-label">关注通知</span>
          <el-switch v-model="settingsForm.followNotify" />
        </div>
      </div>
      <div class="settings-section">
        <h3 class="settings-group-title">隐私设置</h3>
        <div class="settings-item">
          <span class="settings-label">谁可以看我的动态</span>
          <el-select v-model="settingsForm.privacy" size="small" style="width: 120px">
            <el-option label="所有人" value="all" />
            <el-option label="仅关注的人" value="following" />
            <el-option label="仅自己" value="self" />
          </el-select>
        </div>
      </div>
      <div class="settings-section">
        <h3 class="settings-group-title">关于</h3>
        <div class="settings-item">
          <span class="settings-label">版本</span>
          <span class="settings-value">1.0.0</span>
        </div>
      </div>
    </el-drawer>
  </header>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { fetchUserInfo, fetchNotifications, fetchUnreadMessageCount } from '@/utils/api'

const router = useRouter()

// Props
const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

// State
const defaultAvatar = 'https://mywebpro.oss-cn-beijing.aliyuncs.com/ac052700-4c99-48a0-8e11-57d95c025220.jpg'
const searchQuery = ref('')
const showNotifications = ref(false)
const notifications = ref([])
const showSettings = ref(false)
const unreadMsgCount = ref(0)
const settingsForm = reactive({
  likeNotify: true,
  commentNotify: true,
  followNotify: true,
  privacy: 'all'
})

// 导航标签
const navTabs = [
  { name: '首页', path: '/home' },
  { name: '发现', path: '/explore' },
  { name: '交易', path: '/trade' }
]

// 未读通知数
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.isRead).length
})

// 搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }
  router.push({ path: '/search', query: { q: searchQuery.value } })
}

// 用户菜单命令
const handleUserCommand = (command) => {
  if (command === 'messages') {
    router.push('/messages')
  } else if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'settings') {
    showSettings.value = true
  } else if (command === 'logout') {
    handleLogout()
  }
}

// 通知点击跳转
const handleNotifClick = (notif) => {
  // 标记为已读
  notif.isRead = true
  if (notif.article && notif.article.id) {
    router.push(`/article/${notif.article.id}`)
    showNotifications.value = false
  } else if (notif.type === 'follow' && notif.user && notif.user.id) {
    router.push(`/profile/${notif.user.id}`)
    showNotifications.value = false
  }
}

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出当前账号吗？')) {
    localStorage.removeItem('token')
    router.push('/')
  }
}

// 加载通知和用户信息
onMounted(async () => {
  // 加载通知
  notifications.value = fetchNotifications()
  
  // 加载未读私信数
  unreadMsgCount.value = fetchUnreadMessageCount()
  
  // 从真实接口获取用户信息
  if (localStorage.getItem('token')) {
    const result = await fetchUserInfo()
    if (result.data && result.data.username) {
      const data = result.data
      if (data.createTime && Array.isArray(data.createTime)) {
        const [year, month, day] = data.createTime
        data.joinDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
      // 更新 localStorage 中的用户信息（确保头像等字段同步）
      const saved = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const updated = { ...saved, ...data }
      localStorage.setItem('userInfo', JSON.stringify(updated))
    }
  }
})
</script>

<style scoped>
.zhihu-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo-link {
  text-decoration: none;
  color: #0084ff;
  font-size: 28px;
  font-weight: bold;
}

.logo-text {
  font-style: italic;
}

.nav-tabs {
  display: flex;
  gap: 20px;
}

.nav-tab {
  text-decoration: none;
  color: #666;
  font-size: 15px;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.nav-tab:hover {
  color: #0084ff;
}

.nav-tab.active {
  color: #0084ff;
  border-bottom-color: #0084ff;
  font-weight: 500;
}

.header-center {
  flex: 1;
  max-width: 400px;
  margin: 0 30px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-box input {
  width: 100%;
  padding: 8px 40px 8px 15px;
  border: 1px solid #e3e3e3;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.search-box input:focus {
  border-color: #0084ff;
  box-shadow: 0 0 0 2px rgba(0, 132, 255, 0.1);
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
  color: #666;
}

.action-btn:hover {
  background: #f3f4f5;
}

.ask-btn {
  background: #0084ff;
  color: white;
}

.ask-btn:hover {
  background: #0077e6;
}

.icon-btn {
  font-size: 20px;
  padding: 8px;
}

.notification-wrapper {
  position: relative;
}

.message-wrapper {
  position: relative;
}

.msg-icon {
  width: 22px;
  height: 22px;
}

.msg-badge-inline {
  margin-left: 8px;
  padding: 1px 6px;
  background: #ff4d4f;
  color: #fff;
  font-size: 11px;
  border-radius: 8px;
  font-weight: 500;
}

.user-avatar-wrapper {
  cursor: pointer;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

/* 通知抽屉样式 */
.notification-list {
  padding: 10px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.notification-item:hover {
  background: #f6f7f8;
}

.notification-item.unread {
  background: #f0f9ff;
}

.notif-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.notif-content {
  flex: 1;
}

.notif-header {
  display: flex;
  gap: 8px;
  margin-bottom: 5px;
}

.notif-user {
  font-weight: 500;
  color: #333;
}

.notif-type {
  color: #999;
  font-size: 13px;
}

.notif-article {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.notif-comment {
  color: #333;
  font-size: 14px;
  margin-bottom: 5px;
}

.notif-time {
  color: #999;
  font-size: 12px;
}

.empty-notif {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.icon {
  margin-right: 8px;
}

.text-red {
  color: #f56c6c;
}

/* 设置抽屉 */
.settings-section {
  padding: 15px 0;
  border-bottom: 1px solid #f3f4f5;
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-group-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.settings-label {
  font-size: 14px;
  color: #666;
}

.settings-value {
  font-size: 14px;
  color: #999;
}

/* 手机端适配 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 12px;
    height: 50px;
  }
  .header-left {
    gap: 12px;
  }
  .logo-text {
    font-size: 20px;
  }
  .nav-tabs {
    gap: 12px;
  }
  .nav-tab {
    font-size: 13px;
  }
  .header-center {
    display: none;
  }
  .header-right {
    gap: 8px;
  }
  .ask-btn span {
    display: none;
  }
  .ask-btn::before {
    content: '✏️';
    font-size: 18px;
  }
  .ask-btn {
    padding: 6px 10px;
  }
  .user-avatar {
    width: 28px;
    height: 28px;
  }
}
</style>
