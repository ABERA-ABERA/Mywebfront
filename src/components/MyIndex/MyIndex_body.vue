<template>
  <div class="login-page">
    <!-- 动态背景粒子 -->
    <div class="particles">
      <span v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></span>
    </div>
    
    <!-- 装饰星星 -->
    <div class="stars">
      <span v-for="i in 8" :key="'s'+i" class="star" :style="starStyle(i)">✦</span>
    </div>

    <!-- 顶部 Header -->
    <header class="top-header">
      <span class="header-title">✧ My Blog ✧</span>
    </header>

    <!-- 登录表单 -->
    <div class="login-wrapper">
      <div class="login-card">
        <div class="card-header">
          <div class="logo-circle">
            <span class="logo-icon">🌸</span>
          </div>
          <h2>欢迎回来</h2>
          <p class="subtitle">ログイン / Sign In</p>
        </div>

        <div class="form-item">
          <label>用户名</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input v-model="username" type="text" placeholder="请输入用户名" />
          </div>
        </div>

        <div class="form-item">
          <label>密码</label>
          <div class="input-wrapper">
            <span class="input-icon">🔑</span>
            <input v-model="password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
          </div>
        </div>

        <button class="login-btn" @click="handleLogin">
          <span>登录</span>
          <span class="btn-sparkle">✦</span>
        </button>
        
        <div class="register-link">
          还没有账号？<a href="#" @click.prevent="showRegister = true">立即注册 ✧</a>
        </div>
      </div>
    </div>

    <!-- 注册弹窗 -->
    <el-dialog v-model="showRegister" title="✧ 注册新账号 ✧" width="420px" append-to-body custom-class="anime-dialog">
      <div class="form-item">
        <label>用户名</label>
        <div class="input-wrapper">
          <span class="input-icon">👤</span>
          <input v-model="regForm.username" type="text" placeholder="请输入用户名" />
        </div>
      </div>
      <div class="form-item">
        <label>邮箱</label>
        <div class="input-wrapper">
          <span class="input-icon">📧</span>
          <input v-model="regForm.email" type="email" placeholder="请输入邮箱" />
        </div>
      </div>
      <div class="form-item">
        <label>密码</label>
        <div class="input-wrapper">
          <span class="input-icon">🔑</span>
          <input v-model="regForm.password" type="password" placeholder="请输入密码" />
        </div>
      </div>
      <div class="form-item">
        <label>确认密码</label>
        <div class="input-wrapper">
          <span class="input-icon">🔑</span>
          <input v-model="regForm.confirmPassword" type="password" placeholder="请再次输入密码" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showRegister = false">取消</el-button>
        <el-button type="primary" @click="handleRegister">注册 ✧</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')
const showRegister = ref(false)
const regForm = reactive({ username: '', email: '', password: '', confirmPassword: '' })

// 粒子样式
const particleStyle = (i) => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 6}s`,
  animationDuration: `${3 + Math.random() * 4}s`,
  width: `${2 + Math.random() * 4}px`,
  height: `${2 + Math.random() * 4}px`,
  opacity: 0.3 + Math.random() * 0.5
})

// 星星样式
const starStyle = (i) => ({
  left: `${10 + Math.random() * 80}%`,
  top: `${10 + Math.random() * 80}%`,
  animationDelay: `${Math.random() * 3}s`,
  fontSize: `${12 + Math.random() * 16}px`,
  opacity: 0.3 + Math.random() * 0.4
})

// Mock 登录：后端不可用时使用假数据
const mockLogin = () => {
  const mockToken = 'mock-token-' + Date.now()
  const mockUser = {
    id: 1,
    token: mockToken,
    username: username.value,
    name: username.value,
    email: username.value + '@zhihu.com',
    avatar: 'https://mywebpro.oss-cn-beijing.aliyuncs.com/ac052700-4c99-48a0-8e11-57d95c025220.jpg',
    bio: '这个人很懒，什么都没有留下~',
    location: '北京',
    followers: 128,
    following: 56,
    articles: 12,
    createTime: [2024, 1, 10]
  }
  localStorage.setItem('token', mockToken)
  localStorage.setItem('userInfo', JSON.stringify(mockUser))
  ElMessage.success('登录成功（Mock 模式）')
  router.push('/home')
}

const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  try {
    const res = await axios.post('admin/user/login', {
      username: username.value,
      password: password.value
    }, { timeout: 3000 })
    const result = res.data
    if (result.code) {
      ElMessage.success('登录成功 ✧')
      localStorage.setItem('token', result.data.token)
      localStorage.setItem('userInfo', JSON.stringify(result.data))
      router.push('/home')
    } else {
      ElMessage.error('登录失败: ' + result.msg)
    }
  } catch (error) {
    console.warn('后端不可用，使用 Mock 登录:', error.message)
    mockLogin()
  }
}

const handleRegister = () => {
  if (!regForm.username || !regForm.email || !regForm.password) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (regForm.password !== regForm.confirmPassword) {
    ElMessage.error('两次密码不一致')
    return
  }
  ElMessage.success('注册成功 ✧ 请登录')
  username.value = regForm.username
  showRegister.value = false
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

/* 粒子动画 */
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: float-particle linear infinite;
}

@keyframes float-particle {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
}

/* 星星装饰 */
.stars {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.star {
  position: absolute;
  color: rgba(255, 215, 0, 0.8);
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

/* 顶部导航 */
.top-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px 40px;
  z-index: 10;
  text-align: center;
}

.header-title {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 3px;
  font-weight: 300;
}

/* 登录表单居中 */
.login-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  position: relative;
}

/* 登录卡片 - 毛玻璃效果 */
.login-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 40px 45px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: card-appear 0.6s ease-out;
}

@keyframes card-appear {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-circle {
  width: 60px;
  height: 60px;
  margin: 0 auto 15px;
  background: linear-gradient(135deg, #ff6b9d, #c44dff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(196, 77, 255, 0.4);
  animation: logo-glow 2s ease-in-out infinite;
}

@keyframes logo-glow {
  0%, 100% { box-shadow: 0 4px 15px rgba(196, 77, 255, 0.4); }
  50% { box-shadow: 0 4px 25px rgba(255, 107, 157, 0.6); }
}

.logo-icon {
  font-size: 28px;
}

.card-header h2 {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 5px;
  letter-spacing: 2px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  letter-spacing: 1px;
}

/* 表单项 */
.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 16px;
  z-index: 2;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 15px 12px 42px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.input-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.input-wrapper input:focus {
  border-color: rgba(196, 77, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(196, 77, 255, 0.15);
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff6b9d, #c44dff);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 3px;
  margin-top: 10px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(196, 77, 255, 0.4);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(196, 77, 255, 0.6);
}

.login-btn:active {
  transform: translateY(0);
}

.btn-sparkle {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  animation: sparkle-rotate 3s linear infinite;
}

@keyframes sparkle-rotate {
  from { transform: translateY(-50%) rotate(0deg); }
  to { transform: translateY(-50%) rotate(360deg); }
}

/* 注册链接 */
.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.register-link a {
  color: #ff6b9d;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.register-link a:hover {
  color: #ff8db5;
  text-decoration: underline;
}

/* 弹窗样式覆盖 */
:deep(.anime-dialog) {
  background: rgba(26, 26, 46, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px !important;
}

:deep(.anime-dialog .el-dialog__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
}

:deep(.anime-dialog .el-dialog__title) {
  color: #fff;
}
</style>
