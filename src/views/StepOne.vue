<template>
  <div class="step-one-container">
    <div class="chat-container">
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id" :class="['message', message.type]">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <div class="message-text" v-html="message.content"></div>
          </div>
        </div>
      </div>

      <!-- 开始按钮区域 -->
      <div class="start-task-area" :class="{ 'show-button': showStartButton }">
        <button class="start-button" @click="goToNextStep" :disabled="!showStartButton">
          开始分析 🚀
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

// 定义组件通信
const emit = defineEmits(['show-right-content', 'show-next-steps'])

interface Message {
  id: number
  type: 'assistant'
  content: string
}

const router = useRouter()
const messages = reactive<Message[]>([])
const messagesContainer = ref<HTMLElement | null>(null)
const showStartButton = ref(false)
const hasEmittedRightContent = ref(false)

const scriptedMessages = [
  `🏫 <strong>欢迎加入"绿色校园设计团队"！</strong><br>你好！随着夏季的到来，我们学校的教室变得越来越闷热，空调耗电量也在不断上升，学校的电费压力越来越大……`,

  `⚡ 校长特别委托我们团队提出一套<strong>"智能通风节能方案"</strong>，目标是在不影响学习舒适度的前提下，减少能源浪费，打造智慧节能的未来教室！`,

  `🧠 这是一项需要跨学科思维的挑战——你需要收集数据、分析教室热源和通风问题，借助大语言模型工具构思策略，设计出"听得懂你"的智能通风提示词与设备控制逻辑。`,

  `📋 <strong>你的核心任务包括：</strong><br>
   🔍 分析教室热源与通风情况，识别主要能耗问题<br>
   📊 收集气温、湿度、人数等信息，构建控制规则<br>
   🤖 设计GPT提示词，引导模型生成"控制指令"<br>
   ⚙️ 综合构思节能控制策略（何时开窗、空调、风扇）<br>
   📄 编写完整方案，提交至"校园绿色提案库"`,

  `🛠️ <strong>你可以使用的工具：</strong><br>
   💳 <strong>信息卡片</strong> - 查看教室结构图、环境数据和控制示例<br>
   💬 <strong>智能提问</strong> - 遇到困难时获得启发性问题引导<br>
   📊 <strong>实时数据面板</strong> - 模拟教室状态（温度、湿度、人数等）`,

  `准备好成为智能节能专家了吗？让我们开始分析教室的通风节能问题吧！💪`,
]

const displayScriptedMessages = async () => {
  for (let i = 0; i < scriptedMessages.length; i++) {
    messages.push({
      id: Date.now() + i,
      type: 'assistant',
      content: scriptedMessages[i],
    })
    await nextTick()
    scrollToBottom()
    await new Promise((resolve) => setTimeout(resolve, 1800)) // 稍微延长间隔
  }

  // 所有消息显示完毕后，延迟显示开始按钮
  setTimeout(() => {
    showStartButton.value = true
    // 触发右侧内容显示
    if (!hasEmittedRightContent.value) {
      emit('show-right-content')
      hasEmittedRightContent.value = true
    }
  }, 800)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const goToNextStep = () => {
  if (!showStartButton.value) return

  emit('show-next-steps')
  router.push('/experiment/step2')
}

onMounted(() => {
  displayScriptedMessages()
})
</script>

<style scoped>
.step-one-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: #ffffffdd;
  border-radius: 12px;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  margin-bottom: 1rem;
  padding-right: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

.message {
  display: flex;
  margin-bottom: 1.5rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(45deg, #4CAF50, #2196F3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.message-content {
  max-width: 85%;
  background: linear-gradient(135deg, #f6f8fa 0%, #e8f5e8 100%);
  padding: 1rem 1.25rem;
  border-radius: 18px;
  position: relative;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.message-content strong {
  font-weight: 700;
  color: #2E7D32;
}

.start-task-area {
  display: flex;
  justify-content: center;
  padding: 1.5rem 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  margin-top: 0.5rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.start-task-area.show-button {
  opacity: 1;
  transform: translateY(0);
}

.start-button {
  background: linear-gradient(45deg, #4CAF50, #2196F3);
  border: none;
  border-radius: 30px;
  padding: 1rem 3rem;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
}

.start-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
  background: linear-gradient(45deg, #45a049, #1976D2);
}

.start-button:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.start-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.start-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.start-button:hover:not(:disabled)::before {
  left: 100%;
}

.start-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.start-button:active:not(:disabled)::after {
  width: 300px;
  height: 300px;
}
</style>
