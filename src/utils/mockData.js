// Mock 数据 - 校园论坛功能演示

// 模拟用户数据
export const mockUsers = [
  {
    id: 1,
    username: '张三',
    avatar: 'https://mywebpro.oss-cn-beijing.aliyuncs.com/ac052700-4c99-48a0-8e11-57d95c025220.jpg',
    bio: '全栈开发工程师 | 热爱开源',
    location: '北京',
    followers: 1234,
    following: 56,
    articles: 89
  },
  {
    id: 2,
    username: '李四',
    avatar: 'https://mywebpro.oss-cn-beijing.aliyuncs.com/ac052700-4c99-48a0-8e11-57d95c025220.jpg',
    bio: '产品经理 | 分享产品思维',
    location: '上海',
    followers: 5678,
    following: 123,
    articles: 45
  },
  {
    id: 3,
    username: '王五',
    avatar: 'https://mywebpro.oss-cn-beijing.aliyuncs.com/ac052700-4c99-48a0-8e11-57d95c025220.jpg',
    bio: 'UI/UX 设计师',
    location: '深圳',
    followers: 2345,
    following: 89,
    articles: 67
  }
]

// 模拟文章数据
export const mockArticles = [
  {
    id: 101,
    title: 'Vue 3 Composition API 最佳实践',
    content: 'Vue 3 引入了 Composition API，这是一种全新的组织组件逻辑的方式。相比 Options API，它提供了更灵活的代码组织方式...\n\n## 为什么使用 Composition API？\n\n1. 更好的逻辑复用\n2. 更灵活的代码组织\n3. 更好的类型推导\n\n让我们来看一些实际的使用场景...',
    summary: 'Vue 3 引入了 Composition API，这是一种全新的组织组件逻辑的方式。相比 Options API，它提供了更灵活的代码组织方式...',
    author: mockUsers[0],
    cover: 'https://via.placeholder.com/800x400/2575fc/ffffff?text=Vue+3',
    images: 'https://via.placeholder.com/600x400/2575fc/ffffff?text=Code+Example',
    videos: '',
    tags: ['Vue.js', '前端开发', 'JavaScript'],
    likes: 234,
    comments: 45,
    views: 5678,
    createTime: '2024-01-15 10:30',
    isLiked: false
  },
  {
    id: 102,
    title: '如何设计一个优秀的用户界面',
    content: '用户界面设计是产品开发中至关重要的一环。一个好的 UI 设计可以提升用户体验，增加用户粘性...\n\n## 设计原则\n\n1. 简洁性\n2. 一致性\n3. 可用性\n4. 反馈性\n\n本文将详细介绍这些原则的实际应用...',
    summary: '用户界面设计是产品开发中至关重要的一环。一个好的 UI 设计可以提升用户体验，增加用户粘性...',
    author: mockUsers[2],
    cover: 'https://via.placeholder.com/800x400/52c41a/ffffff?text=UI+Design',
    images: 'https://via.placeholder.com/600x400/52c41a/ffffff?text=Design+Principles,https://via.placeholder.com/600x400/52c41a/ffffff?text=UI+Mockup',
    videos: '',
    tags: ['UI设计', '产品设计', '用户体验'],
    likes: 567,
    comments: 89,
    views: 12345,
    createTime: '2024-01-14 15:20',
    isLiked: true
  },
  {
    id: 103,
    title: '产品需求分析的 5 个步骤',
    content: '需求分析是产品开发的起点，直接决定了后续开发的方向和质量...\n\n## 步骤一：用户调研\n\n通过问卷、访谈等方式了解目标用户的真实需求...\n\n## 步骤二：竞品分析\n\n分析同类产品的优缺点，找到差异化机会...',
    summary: '需求分析是产品开发的起点，直接决定了后续开发的方向和质量...',
    author: mockUsers[1],
    cover: '',
    images: '',
    videos: '',
    tags: ['产品管理', '需求分析'],
    likes: 123,
    comments: 23,
    views: 3456,
    createTime: '2024-01-13 09:15',
    isLiked: false
  }
]

// 模拟评论数据
export const mockComments = [
  {
    id: 1001,
    articleId: 101,
    author: mockUsers[1],
    content: '写得非常好！Composition API 确实让代码组织更灵活了',
    likes: 23,
    createTime: '2024-01-15 12:00',
    isLiked: false,
    replies: [
      {
        id: 10011,
        author: mockUsers[0],
        content: '谢谢支持！后续还会分享更多实战技巧',
        likes: 5,
        createTime: '2024-01-15 13:30',
        isLiked: false
      }
    ]
  },
  {
    id: 1002,
    articleId: 101,
    author: mockUsers[2],
    content: '请问在大型项目中，如何更好地组织 composables？',
    likes: 12,
    createTime: '2024-01-15 14:20',
    isLiked: false,
    replies: []
  }
]

// 模拟热榜数据
export const mockHotTopics = [
  { id: 1, title: 'Vue 3.4 发布，性能提升 30%', hot: 1234567 },
  { id: 2, title: '2024 年前端技术趋势预测', hot: 987654 },
  { id: 3, title: '如何优雅地处理异步错误', hot: 876543 },
  { id: 4, title: 'TypeScript 5.0 新特性解读', hot: 765432 },
  { id: 5, title: 'React vs Vue：如何选择', hot: 654321 }
]

// 模拟标签数据
export const mockTags = [
  { id: 1, name: 'Vue.js', articles: 1234 },
  { id: 2, name: 'React', articles: 987 },
  { id: 3, name: 'JavaScript', articles: 2345 },
  { id: 4, name: 'TypeScript', articles: 876 },
  { id: 5, name: 'Node.js', articles: 654 },
  { id: 6, name: '前端开发', articles: 3456 },
  { id: 7, name: 'UI设计', articles: 432 },
  { id: 8, name: '产品管理', articles: 321 }
]

// 模拟通知数据
export const mockNotifications = [
  {
    id: 1,
    type: 'like',
    user: mockUsers[1],
    article: { id: 101, title: 'Vue 3 Composition API 最佳实践' },
    createTime: '2024-01-15 15:30',
    isRead: false
  },
  {
    id: 2,
    type: 'comment',
    user: mockUsers[2],
    article: { id: 101, title: 'Vue 3 Composition API 最佳实践' },
    content: '写得非常好！',
    createTime: '2024-01-15 14:20',
    isRead: false
  },
  {
    id: 3,
    type: 'follow',
    user: mockUsers[1],
    createTime: '2024-01-14 10:00',
    isRead: true
  }
]

// 模拟二手交易商品数据
export const mockTradeItems = [
  {
    id: 1001,
    title: '九成新 iPad Air 5 256GB  WiFi版',
    description: '去年买的，平时贴膜带壳使用，没有任何划痕和磕碰，电池健康度95%以上，配件齐全含原装充电器和数据线。',
    price: 2800,
    originalPrice: 4799,
    images: [
      'https://via.placeholder.com/400x400/0084ff/ffffff?text=iPad+Air',
      'https://via.placeholder.com/400x400/0084ff/ffffff?text=iPad+Side',
      'https://via.placeholder.com/400x400/0084ff/ffffff?text=iPad+Back'
    ],
    category: '数码电子',
    condition: '9成新',
    seller: mockUsers[0],
    views: 342,
    likes: 28,
    createTime: '2024-01-15 10:30',
    location: '东区宿舍',
    status: 'on_sale'
  },
  {
    id: 1002,
    title: '考研英语全套教材 含真题解析',
    description: '2024考研英语一全套资料，包括张剑黄皮书、恋练有词、王江涛作文书等，书内有少量笔记标注，不影响使用。',
    price: 45,
    originalPrice: 280,
    images: [
      'https://via.placeholder.com/400x400/52c41a/ffffff?text=English+Books',
      'https://via.placeholder.com/400x400/52c41a/ffffff?text=Book+Detail'
    ],
    category: '教材书籍',
    condition: '8成新',
    seller: mockUsers[1],
    views: 156,
    likes: 12,
    createTime: '2024-01-14 14:20',
    location: '图书馆一楼',
    status: 'on_sale'
  },
  {
    id: 1003,
    title: '捷安特ATX 860山地自行车',
    description: '骑了一年多，正常磨损，变速顺畅，刹车灵敏，前后轮胎都换过新的，适合日常通勤和周末骑行。',
    price: 800,
    originalPrice: 2698,
    images: [
      'https://via.placeholder.com/400x400/ff7a45/ffffff?text=Bike',
      'https://via.placeholder.com/400x400/ff7a45/ffffff?text=Bike+Wheel'
    ],
    category: '运动户外',
    condition: '7成新',
    seller: mockUsers[2],
    views: 289,
    likes: 35,
    createTime: '2024-01-13 09:15',
    location: '西区车棚',
    status: 'on_sale'
  },
  {
    id: 1004,
    title: '小米台灯Pro 护眼灯',
    description: '毕业带不走，台灯功能完好，色温亮度可调，护眼效果好，适合宿舍学习使用。',
    price: 60,
    originalPrice: 179,
    images: [
      'https://via.placeholder.com/400x400/faad14/ffffff?text=Desk+Lamp'
    ],
    category: '生活日用',
    condition: '9成新',
    seller: mockUsers[0],
    views: 87,
    likes: 6,
    createTime: '2024-01-12 16:40',
    location: '南区宿舍',
    status: 'on_sale'
  },
  {
    id: 1005,
    title: 'Nike Air Force 1 白色 42码',
    description: '穿了两次，尺码不合适出掉，鞋底几乎全新，有购买凭证，正品保证。',
    price: 350,
    originalPrice: 799,
    images: [
      'https://via.placeholder.com/400x400/333333/ffffff?text=Nike+AF1',
      'https://via.placeholder.com/400x400/333333/ffffff?text=Sole+Detail'
    ],
    category: '服饰鞋包',
    condition: '95成新',
    seller: mockUsers[1],
    views: 421,
    likes: 52,
    createTime: '2024-01-11 11:00',
    location: '北区宿舍',
    status: 'on_sale'
  },
  {
    id: 1006,
    title: '罗技G304无线游戏鼠标',
    description: '用了半年，手感依然很好，无线连接稳定，电池耐用，送鼠标垫。',
    price: 120,
    originalPrice: 249,
    images: [
      'https://via.placeholder.com/400x400/722ed1/ffffff?text=Mouse'
    ],
    category: '数码电子',
    condition: '8成新',
    seller: mockUsers[2],
    views: 198,
    likes: 15,
    createTime: '2024-01-10 20:30',
    location: '东区宿舍',
    status: 'on_sale'
  }
]

// 模拟跑腿接单任务数据
export const mockErrandTasks = [
  {
    id: 2001,
    title: '帮取菜鸟驿站快递',
    description: '菜鸟驿站取一个中等大小的包裹，取件码到了发你，送到东区3号楼下就行。',
    reward: 5,
    category: '代取快递',
    publisher: mockUsers[0],
    runner: null,
    fromLocation: '菜鸟驿站（校门口）',
    toLocation: '东区3号楼',
    deadline: '2024-01-16 18:00',
    createTime: '2024-01-15 13:00',
    status: 'pending',
    tags: ['快递代取', '轻松简单']
  },
  {
    id: 2002,
    title: '帮带一份食堂午饭到宿舍',
    description: '想吃二食堂的黄焖鸡米饭，到宿舍楼下打电话就行，餐费另算。',
    reward: 3,
    category: '代买餐食',
    publisher: mockUsers[1],
    runner: null,
    fromLocation: '第二食堂',
    toLocation: '南区5号楼',
    deadline: '2024-01-16 12:30',
    createTime: '2024-01-15 11:30',
    status: 'pending',
    tags: ['代买餐食', '午高峰']
  },
  {
    id: 2003,
    title: '帮忙打印毕业论文资料',
    description: '大概50页A4纸双面打印，文件发你微信，打印好送到图书馆一楼。',
    reward: 8,
    category: '代办事务',
    publisher: mockUsers[2],
    runner: null,
    fromLocation: '任意打印店',
    toLocation: '图书馆一楼服务台',
    deadline: '2024-01-17 10:00',
    createTime: '2024-01-15 09:00',
    status: 'pending',
    tags: ['打印资料', '有时间弹性']
  },
  {
    id: 2004,
    title: '帮搬宿舍行李到新区',
    description: '换宿舍需要搬东西，大概2个行李箱+3个纸箱，有电梯，不会太重。',
    reward: 20,
    category: '搬运帮忙',
    publisher: mockUsers[0],
    runner: null,
    fromLocation: '西区6号楼',
    toLocation: '新区12号楼',
    deadline: '2024-01-18 14:00',
    createTime: '2024-01-14 20:00',
    status: 'pending',
    tags: ['搬运', '需要体力']
  },
  {
    id: 2005,
    title: '帮占图书馆考研自习座位',
    description: '明天早上7点前去图书馆三楼考研区占一个靠窗的位置，帮到8点半就行。',
    reward: 10,
    category: '代办事务',
    publisher: mockUsers[1],
    runner: null,
    fromLocation: '图书馆三楼考研区',
    toLocation: '图书馆三楼考研区',
    deadline: '2024-01-16 08:30',
    createTime: '2024-01-14 22:00',
    status: 'pending',
    tags: ['占座', '早起任务']
  }
]

// 交易分类数据
export const mockTradeCategories = [
  { id: 0, name: '全部', icon: '🏷️' },
  { id: 1, name: '数码电子', icon: '📱' },
  { id: 2, name: '教材书籍', icon: '📚' },
  { id: 3, name: '服饰鞋包', icon: '👟' },
  { id: 4, name: '运动户外', icon: '🚲' },
  { id: 5, name: '生活日用', icon: '🏠' },
  { id: 6, name: '美妆护肤', icon: '💄' },
  { id: 7, name: '其他', icon: '📦' }
]

// 跑腿分类数据
export const mockErrandCategories = [
  { id: 0, name: '全部', icon: '📋' },
  { id: 1, name: '代取快递', icon: '📦' },
  { id: 2, name: '代买餐食', icon: '🍜' },
  { id: 3, name: '代办事务', icon: '✅' },
  { id: 4, name: '搬运帮忙', icon: '📦' },
  { id: 5, name: '其他', icon: '🔧' }
]

// 模拟私信会话列表
export const mockConversations = [
  {
    id: 5001,
    user: mockUsers[0],
    lastMessage: '好的，明天下午在图书馆一楼见！',
    lastTime: '2024-01-15 16:30',
    unreadCount: 2,
    isOnline: true
  },
  {
    id: 5002,
    user: mockUsers[1],
    lastMessage: '那本书还在吗？我想买',
    lastTime: '2024-01-15 14:20',
    unreadCount: 0,
    isOnline: false
  },
  {
    id: 5003,
    user: mockUsers[2],
    lastMessage: '跑腿任务已经完成了，请确认',
    lastTime: '2024-01-14 18:00',
    unreadCount: 1,
    isOnline: true
  }
]

// 模拟私信消息记录
export const mockMessages = {
  5001: [
    { id: 10001, senderId: 1, content: '你好，你的iPad还在吗？', time: '2024-01-15 14:00', isRead: true },
    { id: 10002, senderId: 0, content: '在的，九成新，2800出', time: '2024-01-15 14:05', isRead: true },
    { id: 10003, senderId: 1, content: '能便宜点吗？2500怎么样', time: '2024-01-15 14:10', isRead: true },
    { id: 10004, senderId: 0, content: '最低2600，配件齐全', time: '2024-01-15 14:15', isRead: true },
    { id: 10005, senderId: 1, content: '好的，明天下午在图书馆一楼见！', time: '2024-01-15 16:30', isRead: false }
  ],
  5002: [
    { id: 10006, senderId: 0, content: '你好，请问考研英语资料还在吗？', time: '2024-01-15 10:00', isRead: true },
    { id: 10007, senderId: 2, content: '在的，全套45元', time: '2024-01-15 10:30', isRead: true },
    { id: 10008, senderId: 0, content: '那本书还在吗？我想买', time: '2024-01-15 14:20', isRead: true }
  ],
  5003: [
    { id: 10009, senderId: 0, content: '你好，可以帮我取个快递吗？', time: '2024-01-14 12:00', isRead: true },
    { id: 10010, senderId: 3, content: '可以的，取件码发我', time: '2024-01-14 12:10', isRead: true },
    { id: 10011, senderId: 0, content: '取件码：8-2-1024', time: '2024-01-14 12:15', isRead: true },
    { id: 10012, senderId: 3, content: '跑腿任务已经完成了，请确认', time: '2024-01-14 18:00', isRead: false }
  ]
}

// 扩展评论数据（为不同文章添加评论）
export const mockCommentsExtended = [
  // 文章 102 的评论
  {
    id: 2001,
    articleId: 102,
    author: mockUsers[0],
    content: 'UI 设计确实很重要，这篇文章总结得很全面！',
    likes: 15,
    createTime: '2024-01-14 16:00',
    isLiked: false,
    replies: []
  },
  {
    id: 2002,
    articleId: 102,
    author: mockUsers[1],
    content: '简洁性是最难做到的，但也是最重要的',
    likes: 8,
    createTime: '2024-01-14 17:30',
    isLiked: false,
    replies: [
      {
        id: 20021,
        author: mockUsers[2],
        content: '同意！少即是多',
        likes: 3,
        createTime: '2024-01-14 18:00',
        isLiked: false
      }
    ]
  },
  // 文章 103 的评论
  {
    id: 3001,
    articleId: 103,
    author: mockUsers[2],
    content: '需求分析确实是产品开发的关键步骤',
    likes: 6,
    createTime: '2024-01-13 10:00',
    isLiked: false,
    replies: []
  }
]
