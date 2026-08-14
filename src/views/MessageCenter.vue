<template>
  <div class="message-page">
    <ZhihuHeader :userInfo="userInfo" />

    <div class="message-container">
      <div class="message-header">
        <h2 class="page-title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          我的私信
        </h2>
        <span class="unread-badge" v-if="totalUnread > 0">{{ totalUnread }}条未读</span>
      </div>

      <div class="conversation-list">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="conversation-item"
          :class="{ unread: conv.unreadCount > 0 }"
          @click="$router.push(`/message/${conv.id}`)"
        >
          <div class="conv-avatar-wrap" @click.stop="$router.push(`/profile/${conv.user.id}`)">
            <img :src="conv.user.avatar" class="conv-avatar" style="cursor:pointer" />
            <span v-if="conv.isOnline" class="online-dot"></span>
          </div>
          <div class="conv-content">
            <div class="conv-top">
              <span class="conv-name">{{ conv.user.username }}</span>
              <span class="conv-time">{{ conv.lastTime }}</span>
            </div>
            <div class="conv-bottom">
              <span class="conv-last-msg">{{ conv.lastMessage }}</span>
              <span v-if="conv.unreadCount > 0" class="conv-unread">{{ conv.unreadCount }}</span>
            </div>
          </div>
        </div>

        <div v-if="conversations.length === 0" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <p>暂无私信</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import { fetchConversations, fetchUserInfo } from '@/utils/api'

const userInfo = ref({})
const conversations = ref([])

const totalUnread = computed(() => {
  return conversations.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
})

onMounted(async () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) userInfo.value = JSON.parse(saved)

  try {
    const r = await fetchUserInfo()
    if (r.data) userInfo.value = { ...userInfo.value, ...r.data }
  } catch (e) { /* ignore */ }

  const result = await fetchConversations()
  conversations.value = result.data || []
})
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background: #f6f7f8;
}

.message-container {
  max-width: 700px;
  margin: 20px auto;
  padding: 0 24px;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin: 0;
}

.title-icon {
  width: 24px;
  height: 24px;
  color: #0084ff;
}

.unread-badge {
  padding: 4px 12px;
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 500;
}

.conversation-list {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.conversation-item:last-child {
  border-bottom: none;
}

.conversation-item:hover {
  background: #fafafa;
}

.conversation-item.unread {
  background: #f0f9ff;
}

.conversation-item.unread:hover {
  background: #e6f4ff;
}

.conv-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.conv-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #52c41a;
  border-radius: 50%;
  border: 2px solid #fff;
}

.conv-content {
  flex: 1;
  min-width: 0;
}

.conv-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.conv-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.conv-time {
  font-size: 12px;
  color: #bbb;
}

.conv-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.conv-last-msg {
  font-size: 13px;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.conversation-item.unread .conv-last-msg {
  color: #555;
  font-weight: 500;
}

.conv-unread {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ff4d4f;
  color: #fff;
  font-size: 11px;
  border-radius: 10px;
  font-weight: 500;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #bbb;
  font-size: 14px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #ddd;
}

@media (max-width: 768px) {
  .message-container {
    padding: 0 12px;
    margin: 12px auto;
  }
}
</style>
