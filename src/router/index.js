import { createRouter, createWebHistory} from 'vue-router';

import MyIndex_body_view from '../components/MyIndex/MyIndex_body.vue';
import MyIndex_head_view from '../components/MyIndex/MyIndex_head.vue';
import HomePage from '../views/HomePage.vue';
import ArticleDetail from '../views/ArticleDetail.vue';
import UserProfile from '../views/UserProfile.vue';
import SearchPage from '../views/SearchPage.vue';
import WritePage from '../views/WritePage.vue';
import DiscoverPage from '../views/DiscoverPage.vue';
import TradeMarket from '../views/TradeMarket.vue';
import TradeItemDetail from '../views/TradeItemDetail.vue';
import TradePublish from '../views/TradePublish.vue';
import ErrandTaskDetail from '../views/ErrandTaskDetail.vue';
import ErrandPublish from '../views/ErrandPublish.vue';
import MessageCenter from '../views/MessageCenter.vue';
import ChatDetail from '../views/ChatDetail.vue';
import OrderPage from '../views/OrderPage.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: MyIndex_body_view,
  },
  {
    path: '/head',
    name: 'head',
    component: MyIndex_head_view,
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail,
  },
  {
    path: '/profile/:id?',
    name: 'UserProfile',
    component: UserProfile,
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchPage,
  },
  {
    path: '/explore',
    name: 'Explore',
    component: DiscoverPage,
  },
  {
    path: '/tag/:tagName',
    name: 'Tag',
    component: HomePage,
  },
  {
    path: '/write',
    name: 'Write',
    component: WritePage,
  },
  {
    path: '/trade',
    name: 'Trade',
    component: TradeMarket,
  },
  {
    path: '/trade/item/:id',
    name: 'TradeItemDetail',
    component: TradeItemDetail,
  },
  {
    path: '/trade/publish',
    name: 'TradePublish',
    component: TradePublish,
  },
  {
    path: '/errand/task/:id',
    name: 'ErrandTaskDetail',
    component: ErrandTaskDetail,
  },
  {
    path: '/errand/publish',
    name: 'ErrandPublish',
    component: ErrandPublish,
  },
  {
    path: '/messages',
    name: 'MessageCenter',
    component: MessageCenter,
  },
  {
    path: '/message/:id',
    name: 'ChatDetail',
    component: ChatDetail,
  },
  {
    path: '/order',
    name: 'OrderPage',
    component: OrderPage,
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
