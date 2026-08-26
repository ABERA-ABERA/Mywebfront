const http = require('http')
const BASE = 'http://127.0.0.1:8090'

function request(method, path, body = null, token = '', isFormData = false) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE)
    const headers = { 'token': token }
    if (!isFormData) headers['Content-Type'] = 'application/json'
    
    const options = {
      hostname: url.hostname, port: url.port,
      path: url.pathname + url.search,
      method, timeout: 5000, headers
    }
    
    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, ok: true, data: JSON.parse(data) }) }
        catch (e) { resolve({ status: res.statusCode, ok: true, data: null, body: data }) }
      })
    })
    req.on('error', (e) => resolve({ status: 0, ok: false, error: e.message }))
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, ok: false, error: 'TIMEOUT' }) })
    if (body && !isFormData) req.write(JSON.stringify(body))
    req.end()
  })
}

async function main() {
  console.log('===== 登录获取 Token =====')
  const loginRes = await request('POST', '/admin/user/login', { username: 'root', password: 'zx20040225' })
  let token = ''
  if (loginRes.data && loginRes.data.data && loginRes.data.data.token) {
    token = loginRes.data.data.token
    console.log('✅ 登录成功, Token:', token.substring(0, 30) + '...')
  } else {
    console.log('❌ 登录失败:', JSON.stringify(loginRes.data))
    return
  }

  const tests = [
    // 用户模块
    { name: '获取用户信息', method: 'GET', path: '/admin/user/info', cat: '用户' },
    { name: '修改用户信息', method: 'POST', path: '/admin/user/change', body: { username: 'root', bio: '学习ing....' }, cat: '用户' },
    { name: '搜索用户', method: 'GET', path: '/admin/user/search?keyword=root', cat: '用户' },
    { name: '关注/取消关注(带action)', method: 'POST', path: '/admin/user/follow', body: { userId: 3, action: 'follow' }, cat: '用户' },
    { name: '获取关注列表', method: 'GET', path: '/admin/user/following', cat: '用户' },
    { name: '获取粉丝列表', method: 'GET', path: '/admin/user/followers', cat: '用户' },
    { name: '获取用户点赞文章', method: 'GET', path: '/admin/user/like/2', cat: '用户' },

    // 文章模块
    { name: '获取文章列表', method: 'GET', path: '/admin/article/list', cat: '文章' },
    { name: '获取文章详情(id=1)', method: 'GET', path: '/admin/article/1', cat: '文章' },
    { name: '发布文章', method: 'POST', path: '/admin/article/add', body: { title: 'API测试文章', content: '测试内容<body>hello</body>', type: 'article' }, cat: '文章' },
    { name: '修改文章', method: 'POST', path: '/admin/article/update', body: { id: 1, title: '修改测试标题' }, cat: '文章' },
    { name: '删除文章(id=99999)', method: 'DELETE', path: '/admin/article/delete/99999', cat: '文章' },
    { name: '点赞(带action)', method: 'POST', path: '/admin/article/like', body: { articleId: 1, action: 'like' }, cat: '文章' },
    { name: '增加浏览量', method: 'POST', path: '/admin/article/view', body: { articleId: 1 }, cat: '文章' },
    { name: '获取热榜', method: 'GET', path: '/admin/article/hot', cat: '文章' },
    { name: '获取随机文章', method: 'GET', path: '/admin/article/random', cat: '文章' },
    { name: '收藏/取消收藏', method: 'POST', path: '/admin/article/collect', body: { articleId: 1 }, cat: '文章' },
    { name: '保存草稿', method: 'POST', path: '/admin/article/draft', body: { title: '草稿', content: '草稿内容' }, cat: '文章' },
    { name: '加载草稿', method: 'GET', path: '/admin/article/draft', cat: '文章' },

    // 评论模块
    { name: '获取文章评论', method: 'GET', path: '/admin/article/comment/1', cat: '评论' },
    { name: '发表评论(带userId)', method: 'POST', path: '/admin/article/comment', body: { articleId: 1, userId: 2, content: '测试评论', image: '' }, cat: '评论' },
    { name: '点赞评论(带action)', method: 'POST', path: '/admin/comment/like', body: { commentId: 1, action: 'like' }, cat: '评论' },

    // 搜索模块
    { name: '搜索文章', method: 'GET', path: '/admin/search?q=test&type=articles', cat: '搜索' },

    // 上传模块
    { name: '上传文件', method: 'POST', path: '/admin/upload', cat: '上传' },

    // 通知模块
    { name: '获取通知列表', method: 'GET', path: '/admin/notification/list', cat: '通知' },

    // 热榜模块
    { name: '获取热榜(list)', method: 'GET', path: '/admin/hot/list', cat: '热榜' },

    // 交易模块
    { name: '获取商品列表', method: 'GET', path: '/admin/trade/item/list', cat: '交易' },
    { name: '获取商品详情', method: 'GET', path: '/admin/trade/item/1', cat: '交易' },
    { name: '发布商品', method: 'POST', path: '/admin/trade/item/add', body: { title: '测试商品', description: '描述', price: 99, category: '数码' }, cat: '交易' },

    // 跑腿模块
    { name: '获取任务列表', method: 'GET', path: '/admin/errand/task/list', cat: '跑腿' },
    { name: '获取任务详情', method: 'GET', path: '/admin/errand/task/1', cat: '跑腿' },
    { name: '接单任务', method: 'POST', path: '/admin/errand/task/accept', body: { taskId: 1 }, cat: '跑腿' },
    { name: '发布任务', method: 'POST', path: '/admin/errand/task/add', body: { title: '取快递', reward: 5, category: '代取快递' }, cat: '跑腿' },

    // 私信模块
    { name: '获取会话列表', method: 'GET', path: '/admin/message/conversations', cat: '私信' },
    { name: '获取消息记录', method: 'GET', path: '/admin/message/history/1', cat: '私信' },
    { name: '发送私信', method: 'POST', path: '/admin/message/send', body: { toUserId: 3, content: '你好' }, cat: '私信' },
    { name: '获取未读消息数', method: 'GET', path: '/admin/message/unread', cat: '私信' },
    { name: '标记消息已读', method: 'POST', path: '/admin/message/read', body: { conversationId: 1 }, cat: '私信' },
  ]

  const results = { success: [], bug: [], notFound: [], error: [] }

  for (const test of tests) {
    const res = await request(test.method, test.path, test.body, token)
    const item = { name: test.name, method: test.method, path: test.path, cat: test.cat }

    if (res.ok && res.data && (res.data.code === 1 || res.data.code === 200)) {
      item.status = '✅'
      item.detail = `code=${res.data.code}`
      results.success.push(item)
      console.log(`✅ [${test.cat}] ${test.name}`)
    } else if (res.ok && res.status === 404) {
      item.status = '❌'
      item.detail = '404 Not Found'
      results.notFound.push(item)
      console.log(`❌ [${test.cat}] ${test.name} => 404`)
    } else if (res.ok && (res.status === 500 || res.status === 400)) {
      item.status = '⚠️'
      item.detail = `HTTP ${res.status}`
      results.bug.push(item)
      console.log(`⚠️ [${test.cat}] ${test.name} => HTTP ${res.status}`)
    } else if (res.ok && res.data) {
      item.status = '⚠️'
      item.detail = `code=${res.data.code}, msg=${res.data.msg || ''}`
      results.bug.push(item)
      console.log(`⚠️ [${test.cat}] ${test.name} => ${item.detail}`)
    } else {
      item.status = '❌'
      item.detail = res.error || `HTTP ${res.status}`
      results.error.push(item)
      console.log(`❌ [${test.cat}] ${test.name} => ${item.detail}`)
    }
  }

  console.log('\n========================================')
  console.log('         API 接口测试报告')
  console.log('========================================')
  console.log(`总计: ${tests.length} 个接口`)
  console.log(`✅ 已完成: ${results.success.length}`)
  console.log(`⚠️ 有Bug: ${results.bug.length}`)
  console.log(`❌ 未实现: ${results.notFound.length + results.error.length}`)
  console.log(`完成率: ${(results.success.length / tests.length * 100).toFixed(1)}%`)

  console.log('\n--- ✅ 已完成 ---')
  results.success.forEach(r => console.log(`  ✅ [${r.cat}] ${r.name} (${r.method} ${r.path})`))

  console.log('\n--- ⚠️ 有Bug ---')
  results.bug.forEach(r => console.log(`  ⚠️ [${r.cat}] ${r.name} => ${r.detail}`))

  console.log('\n--- ❌ 未实现 ---')
  ;[...results.notFound, ...results.error].forEach(r => console.log(`  ❌ [${r.cat}] ${r.name} => ${r.detail}`))

  const fs = require('fs')
  fs.writeFileSync('api_test_report.json', JSON.stringify(results, null, 2))
}

main().catch(console.error)
