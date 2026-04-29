<template>
  <div class="login-page">
    <!-- 顶部 Header -->
    <header class="top-header">
      个人博客
      <br />
      登录界面
    </header>

    <!-- 登录表单（绝对居中） -->
    <div class="login-wrapper">
      <div class="login-card">
        <h2>用户登录</h2>

        <div class="form-item">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="请输入用户名" />
        </div>

        <div class="form-item">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" />
        </div>

        <button class="login-btn" @click="handleLogin">登录系统</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'


import axios from 'axios'
const router = useRouter()
const username = ref('')
const password = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert('请输入用户名和密码')
    return
  }
  try {
  const res = await axios.post('admin/user/login', {
      username: username.value,
      password: password.value
    })
    const result = res.data
    if (result.code) {
      ElMessage.success('登录成功') // 移到这里，确保请求成功后才提示
      localStorage.setItem('token', result.data.token)
      localStorage.setItem('userInfo', JSON.stringify(result.data))
      // 跳转到首页
      
      router.push({ name: 'head' })
      
    } else {
       alert('登录失败:'+result.msg)
    }
    } catch (error) {
    // 5. 错误处理
    console.error('登录请求失败:', error)
    alert('网络错误或服务器异常，请稍后重试')
  } 
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden; /* 禁止页面滚动，彻底去掉滚动条 */
}

/* 页面铺满全屏 */
.login-page {
  width: 100vw;
  height: 100vh;
  background: #f5f7fa;
  position: relative;
  margin: 0;
  padding: 0;
  box-sizing: border-box; 
}

/* 顶部导航 */
.top-header {
  
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  box-sizing: border-box; 
  width: 100vw;
  text-align: center;
  background: #2c3e50;
  color: #fff;
  padding: 16px 0;
  font-size: 20px;
  z-index: auto;
}

/* ================= 核心：表单绝对居中 ================= */
.login-wrapper {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box; 
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 0px; /* 不被顶部挡住 */
}

/* 登录卡片 */
.login-card {
  background: #f3f1f1;
  padding: 45px;
  border-radius: 12px;
  
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-item {
  margin-bottom: 22px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #555;
}

.form-item input {
  width: 100%;
  padding: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 15px;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: #2c3e50;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}
</style>