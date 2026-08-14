<template>
  <div class="chat-page">
    <ZhihuHeader :userInfo="userInfo" />

    <div class="chat-container">
      <!-- 顶部：返回 + 对方信息 -->
      <div class="chat-header">
        <button class="back-btn" @click="$router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="back-icon">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="chat-user-info" v-if="conversation" @click="$router.push(`/profile/${conversation.user.id}`)">
          <img :src="conversation.user.avatar" class="chat-user-avatar" style="cursor:pointer" />
          <div class="chat-user-detail">
            <span class="chat-user-name">{{ conversation.user.username }}</span>
            <span class="chat-user-status" :class="{ online: conversation.isOnline }">
              {{ conversation.isOnline ? '在线' : '离线' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(msg, idx) in messages"
          :key="msg.id"
          class="message-row"
          :class="{ 'message-self': msg.senderId === currentUserId }"
        >
          <!-- 对方头像（仅左侧显示） -->
          <img
            v-if="msg.senderId !== currentUserId"
            :src="conversation?.user.avatar"
            class="msg-avatar"
            style="cursor:pointer"
            @click="$router.push(`/profile/${conversation?.user.id}`)"
          />
          <div class="msg-bubble-wrap">
            <div class="msg-bubble">
              <span class="msg-text">{{ msg.content }}</span>
            </div>
            <div class="msg-meta">
              <span class="msg-time">{{ msg.time }}</span>
              <!-- 自己发送的消息显示已读状态 -->
              <span v-if="msg.senderId === currentUserId" class="msg-read-status" :class="{ read: msg.isRead }">
                {{ msg.isRead ? '已读' : '未读' }}
              </span>
            </div>
          </div>
          <!-- 右侧不显示本人头像 -->
        </div>

        <div v-if="messages.length === 0" class="empty-chat">
          <p>暂无消息，开始聊天吧</p>
        </div>
      </div>

      <!-- 底部输入栏 -->
      <div class="chat-input-bar">
        <input
          v-model="inputText"
          class="chat-input"
          placeholder="输入消息..."
          @keyup.enter="sendMessage"
        />
        <button class="send-btn" :class="{ disabled: !inputText.trim() }" @click="sendMessage">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="send-icon">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import ZhihuHeader from '@/components/ZhihuHeader.vue'
import { fetchConversations, fetchMessageHistory, fetchSendMessage, fetchUserInfo } from '@/utils/api'

const route = useRoute()
const userInfo = ref({})
const conversations = ref([])
const messages = ref([])
const inputText = ref('')
const messagesContainer = ref(null)
const defaultAvatar = 'https://mywebpro.oss-cn-beijing.aliyuncs.com/ac052700-4c99-48a0-8e11-57d95c025220.jpg'

const conversation = computed(() => {
  return conversations.value.find(c => c.id === parseInt(route.params.id))
})

const currentUserId = computed(() => userInfo.value.id || 0)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text) return

  const msg = {
    id: Date.now(),
    senderId: currentUserId.value,
    content: text,
    time: new Date().toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isRead: false
  }

  messages.value.push(msg)
  inputText.value = ''
  scrollToBottom()

  await fetchSendMessage({
    conversationId: parseInt(route.params.id),
    content: text
  })
}

onMounted(async () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) userInfo.value = JSON.parse(saved)

  try {
    const r = await fetchUserInfo()
    if (r.data) userInfo.value = { ...userInfo.value, ...r.data }
  } catch (e) { /* ignore */ }

  const convResult = await fetchConversations()
  conversations.value = convResult.data || []

  const msgResult = await fetchMessageHistory(route.params.id)
  messages.value = msgResult.data || []

  scrollToBottom()
})
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: #f6f7f8;
  display: flex;
  flex-direction: column;
}

.chat-container {
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
}

/* 顶部 */
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f5;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #e8e8e8;
}

.back-icon {
  width: 16px;
  height: 16px;
  color: #555;
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.chat-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-user-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat-user-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.chat-user-status {
  font-size: 11px;
  color: #bbb;
}

.chat-user-status.online {
  color: #52c41a;
}

/* 消息列表 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-row.message-self {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.msg-bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: 65%;
}

.message-self .msg-bubble-wrap {
  align-items: flex-end;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message-self .msg-bubble {
  background: #0084ff;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-row:not(.message-self) .msg-bubble {
  background: #fff;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.msg-time {
  font-size: 11px;
  color: #ccc;
  margin-top: 4px;
}

.msg-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.message-self .msg-meta {
  flex-direction: row-reverse;
}

.msg-read-status {
  font-size: 11px;
  color: #bbb;
}

.msg-read-status.read {
  color: #0084ff;
}

.empty-chat {
  text-align: center;
  padding: 40px 20px;
  color: #bbb;
  font-size: 14px;
}

/* 输入栏 */
.chat-input-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #0084ff;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #0084ff;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(.disabled) {
  background: #0077e6;
  transform: scale(1.05);
}

.send-btn.disabled {
  background: #ccc;
  cursor: default;
}

.send-icon {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 50px);
  }

  .chat-messages {
    padding: 12px;
  }

  .chat-input-bar {
    padding: 10px 12px;
  }
}
</style>
