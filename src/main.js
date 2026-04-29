import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import router from './router'
import './assets/main.css'
import 'element-plus/dist/index.css' // <--- 确保这一行存在
const app = createApp(App)
app.use(ElementPlus)
app.use(router)

app.mount('#app')
