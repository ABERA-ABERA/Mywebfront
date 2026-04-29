import { createRouter, createWebHistory} from 'vue-router';

import MyIndex_body_view from '../components/MyIndex/MyIndex_body.vue';
import MyIndex_head_view from '../components/MyIndex/MyIndex_head.vue';
const routes = [
  {
    path: '/',
    name: 'Login',
    component: MyIndex_body_view, // 直接将登录组件放在根路径
  },
  {
    path: '/head',
    name: 'head',
    component: MyIndex_head_view, // 登录成功后跳转的主页
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;