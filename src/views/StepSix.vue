<template>
  <div class="step-six-wrapper">
    <!-- ==================== 任务引导卡片（修复版） ==================== -->
    <div class="task-guidance-section">
      <!-- 完整展开状态 -->
      <div v-if="!guidanceCollapsed" class="guidance-card">
        <div class="card-badge">
          <span class="badge-icon">📋</span>
          <span class="badge-text">Step 6 - 方案整合与完善</span>
        </div>

        <div class="card-main">
          <h3 class="card-title">任务目标</h3>
          <p class="card-desc">
            基于前面步骤(Step 2-5)的分析结果，整合形成一套完整的智能通风节能系统方案
          </p>

          <div class="process-steps">
            <div class="process-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>查看方案初稿</h4>
                <p>系统已自动整理了你在前面步骤的回答</p>
              </div>
            </div>

            <div class="process-arrow">→</div>

            <div class="process-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>完善最终方案</h4>
                <p>在编辑器中完善内容，可参考AI生成的方案</p>
              </div>
            </div>

            <div class="process-arrow">→</div>

            <div class="process-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>提交方案</h4>
                <p>完成编辑后提交，提交后将无法修改</p>
              </div>
            </div>
          </div>
        </div>

        <button class="collapse-btn" @click="collapseGuidance">
          <span>我知道了，收起 ▲</span>
        </button>
      </div>

      <!-- 折叠状态 -->
      <div v-else class="guidance-card-collapsed">
        <div class="collapsed-content">
          <span class="collapsed-icon">📋</span>
          <span class="collapsed-text">Step 6 - 方案整合与完善</span>
        </div>
        <button class="expand-btn" @click="expandGuidance">
          <span>查看任务说明 ▼</span>
        </button>
      </div>
    </div>

    <!-- ==================== 固定顶栏 ==================== -->
    <div class="fixed-toolbar">
      <div class="toolbar-left">
        <span class="step-title">📝 方案整合</span>
        <span class="status-badge" :class="{ submitted: finalSubmitted }">
          {{ finalSubmitted ? '已提交' : '编辑中' }}
        </span>
      </div>

      <div class="toolbar-right">
        <button class="tool-btn" @click="toggleDraftPreview">
          <span>📋</span>
          <span class="btn-text">{{ showDraftPreview ? '隐藏' : '查看' }}初稿</span>
        </button>
        <button class="tool-btn primary" @click="openAIAssistant('chat')">
          <span>🤖</span>
          <span class="btn-text">AI助手</span>
        </button>
        <button class="tool-btn" @click="toggleFullscreen">
          <span>⛶</span>
          <span class="btn-text">全屏</span>
        </button>
      </div>
    </div>

    <!-- ==================== 方案初稿面板（可折叠） ==================== -->
    <transition name="slide-down">
      <div v-show="showDraftPreview" class="draft-preview-panel">
        <div class="panel-header">
          <h4>📋 方案初稿（自动生成）</h4>
          <button @click="closeDraftPreview" class="close-btn">✕</button>
        </div>

        <div class="panel-content">
          <pre class="draft-text">{{ studentInitialDraft }}</pre>
          <p class="draft-hint">💡 这是基于Step2-5的回答自动整理的初稿</p>

          <div class="panel-actions">
            <button @click="copyDraftToEditor" class="action-btn">📋 复制到编辑器</button>
            <button @click="closeDraftPreview" class="action-btn secondary">好的，我知道了</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ==================== 主编辑器区域 ==================== -->
    <div class="main-content" :class="{ fullscreen: isFullscreen }">
      <div class="editor-container">
        <!-- 编辑器头部 -->
        <div class="editor-header">
          <h3>✏️ 我的最终方案</h3>
          <div class="editor-meta">
            <span class="word-count">{{ wordCount }} 字</span>
            <span v-if="lastSaveTime" class="last-save">💾 {{ lastSaveTime }}</span>
          </div>
        </div>

        <!-- 编辑器主体 -->
        <div class="editor-wrapper">
          <textarea
            ref="editorTextarea"
            v-model="studentFinalPlan"
            class="main-editor"
            :disabled="finalSubmitted"
            placeholder="在这里编辑你的最终方案...&#10;&#10;💡 提示：&#10;• 可以参考方案初稿和AI生成的参考方案&#10;• 点击右上角「AI助手」获取帮助&#10;• Ctrl+S 保存草稿"
            @keydown.ctrl.s.prevent="saveDraft"
          ></textarea>
        </div>

        <!-- 全屏模式关闭按钮 -->
        <button v-if="isFullscreen" @click="toggleFullscreen" class="exit-fullscreen-btn">
          ✕ 退出全屏
        </button>
      </div>
    </div>

    <!-- ==================== 固定底栏 ==================== -->
    <div class="fixed-bottom-bar">
      <div class="action-group-left">
        <button class="secondary-btn" @click="resetFromDraft" :disabled="finalSubmitted">
          🔄 重置为初稿
        </button>
        <button class="secondary-btn" @click="saveDraft">💾 保存草稿</button>
      </div>

      <div class="action-group-right">
        <button
          class="primary-btn"
          @click="submitFinalSolution"
          :disabled="!studentFinalPlan.trim() || finalSubmitted"
        >
          ✅ 提交最终方案
        </button>
        <span v-if="finalSubmitted" class="submitted-tag">✅ 已提交</span>
      </div>
    </div>

    <!-- ==================== AI助手抽屉（简化为2个标签） ==================== -->
    <Teleport to="body">
      <transition name="slide-left">
        <div v-if="showAIAssistant" class="ai-assistant-drawer">
          <!-- 抽屉头部 -->
          <div class="drawer-header">
            <h3>🤖 AI助手</h3>
            <button @click="closeAIAssistant" class="close-btn">✕</button>
          </div>

          <!-- 标签页（只保留2个） -->
          <div class="drawer-tabs">
            <button
              v-for="tab in aiTabs"
              :key="tab.id"
              @click="activeAITab = tab.id"
              :class="['tab-btn', { active: activeAITab === tab.id }]"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <div class="tab-text-group">
                <span class="tab-label">{{ tab.label }}</span>
                <span class="tab-desc">{{ tab.desc }}</span>
              </div>
            </button>
          </div>

          <!-- 💬 对话模式 -->
          <div v-show="activeAITab === 'chat'" class="tab-content chat-content">
            <div class="chat-messages" ref="chatArea">
              <!-- 欢迎消息（优化后） -->
              <div class="welcome-message">
                <div class="message-icon">💬</div>
                <div class="message-text">
                  <p><strong>欢迎使用对话助手！</strong></p>
                  <p>我可以帮你：</p>
                  <ul>
                    <li>💡 解答方案编写中的具体问题</li>
                    <li>🔍 提供某个模块的设计建议</li>
                    <li>✨ 帮你分析和优化特定内容</li>
                  </ul>
                  <p class="hint-text">
                    💡 <strong>提示：</strong>如需完整的参考方案，请切换到"参考方案"标签
                  </p>
                </div>
              </div>

              <!-- 对话历史 -->
              <div v-for="msg in chatMessages" :key="msg.id" :class="['chat-message', msg.type]">
                <div class="message-avatar">{{ msg.type === 'ai' ? '🤖' : '👤' }}</div>
                <div class="message-bubble">
                  <div class="bubble-content" v-html="msg.content"></div>
                  <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                </div>
              </div>

              <!-- AI思考中 -->
              <div v-if="isAIThinking" class="thinking-indicator">
                <div class="thinking-dots"><span></span><span></span><span></span></div>
                <span class="thinking-text">AI正在思考...</span>
              </div>
            </div>

            <div class="chat-input-area">
              <textarea
                v-model="chatInput"
                placeholder="请提出任何问题...&#10;例如：&#10;• 传感器配置部分应该包含哪些内容？&#10;• 如何设计CO2浓度的触发阈值？&#10;• 成本效益分析要怎么写？"
                rows="3"
                @keydown.ctrl.enter="sendChatMessage"
                :disabled="isAIThinking"
              ></textarea>
              <button
                @click="sendChatMessage"
                class="send-btn"
                :disabled="!chatInput.trim() || isAIThinking"
              >
                <span v-if="isAIThinking">发送中...</span>
                <span v-else>发送 (Ctrl+Enter)</span>
              </button>
            </div>
          </div>

          <!-- 🔍 参考方案 -->
          <div v-show="activeAITab === 'reference'" class="tab-content reference-content">
            <!-- 未生成状态（优化后） -->
            <div v-if="!aiReferenceSolution" class="empty-state">
              <div class="empty-icon">🔍</div>
              <p class="empty-title">生成AI参考方案</p>
              <p class="empty-desc">
                基于你在Step 2-5的回答，AI将生成一份完整的智能通风节能系统方案，
                包含<strong>系统目标、传感器配置、控制策略、用户交互、应急处理、成本效益、预期效果</strong>等7个核心部分。
              </p>
              <p class="empty-hint">⏱️ 预计生成时间：30-60秒</p>
              <button class="generate-btn" @click="generateReference" :disabled="isGenerating">
                <span v-if="isGenerating">
                  <span class="loading-dots"> <span></span><span></span><span></span> </span>
                  生成中...
                </span>
                <span v-else>🔍 开始生成</span>
              </button>
            </div>

            <!-- 已生成状态 -->
            <div v-else class="reference-display">
              <div class="reference-header">
                <span class="version-badge">AI参考方案 v{{ solutionVersion }}</span>
                <span class="generated-time">{{ solutionGeneratedAt }}</span>
              </div>

              <div class="reference-actions">
                <button @click="copyReference" class="action-btn"><span>📋</span> 复制全文</button>
                <button @click="insertReference" class="action-btn">
                  <span>➕</span> 插入到编辑器
                </button>
                <button @click="regenerateReference" class="action-btn warning">
                  <span>🔄</span> 重新生成
                </button>
              </div>

              <div class="reference-body">
                <div class="markdown-content" v-html="renderMarkdown(aiReferenceSolution)"></div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 遮罩层 -->
      <transition name="fade">
        <div v-if="showAIAssistant" class="drawer-overlay" @click="closeAIAssistant"></div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { simpleStorage } from '../../api/utils/simpleStorage'
import { marked } from 'marked'

// ==================== 类型定义 ====================
interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

// ==================== 基础状态 ====================
const router = useRouter()
const editorTextarea = ref<HTMLTextAreaElement | null>(null)
const chatArea = ref<HTMLElement | null>(null)

// 引导卡片状态（新增）
const guidanceCollapsed = ref(false)

// 方案数据
const studentInitialDraft = ref('')
const studentFinalPlan = ref('')
const finalSubmitted = ref(false)
const lastSaveTime = ref('')

// UI状态
const showDraftPreview = ref(false)
const isFullscreen = ref(false)
const showAIAssistant = ref(false)
const activeAITab = ref('chat')

// AI标签页配置（简化为2个）
const aiTabs = [
  {
    id: 'chat',
    icon: '💬',
    label: '对话助手',
    desc: '提问、讨论、获取建议',
  },
  {
    id: 'reference',
    icon: '🔍',
    label: '参考方案',
    desc: '生成完整的AI参考方案',
  },
]

// 对话功能
const chatMessages = ref<Message[]>([])
const chatInput = ref('')
const isAIThinking = ref(false)

// 参考方案
const aiReferenceSolution = ref('')
const solutionVersion = ref(0)
const solutionGeneratedAt = ref('')
const isGenerating = ref(false)

// ==================== 计算属性 ====================
const wordCount = computed(() => {
  return studentFinalPlan.value.replace(/\s/g, '').length
})

// ==================== 引导卡片操作（新增） ====================
const collapseGuidance = () => {
  guidanceCollapsed.value = true
  simpleStorage.setItem('step6_guidance_collapsed', true)
}

const expandGuidance = () => {
  guidanceCollapsed.value = false
  simpleStorage.setItem('step6_guidance_collapsed', false)
}

// ==================== 工具栏操作 ====================
const toggleDraftPreview = () => {
  showDraftPreview.value = !showDraftPreview.value
}

const closeDraftPreview = () => {
  showDraftPreview.value = false
}

const copyDraftToEditor = () => {
  studentFinalPlan.value = studentInitialDraft.value
  closeDraftPreview()
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  document.body.style.overflow = isFullscreen.value ? 'hidden' : 'auto'
}

// ==================== 编辑器操作 ====================
const resetFromDraft = () => {
  if (confirm('确定要重置为初稿内容吗？当前编辑的内容将丢失。')) {
    studentFinalPlan.value = studentInitialDraft.value
  }
}

const saveDraft = () => {
  simpleStorage.setItem('step6_draft', {
    content: studentFinalPlan.value,
    savedAt: new Date().toISOString(),
  })
  lastSaveTime.value = formatTime(new Date())

  // 显示保存提示
  showSaveToast()
}

const showSaveToast = () => {
  // 简单的保存提示（可以用更好的toast组件替代）
  const toast = document.createElement('div')
  toast.textContent = '✓ 草稿已保存'
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 24px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    font-size: 14px;
    font-weight: 600;
    animation: slideInRight 0.3s ease;
  `
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.remove()
  }, 2000)
}

const submitFinalSolution = async () => {
  if (!studentFinalPlan.value.trim()) {
    alert('请先编辑你的最终方案')
    return
  }

  // 用户点击取消时，直接返回，不执行后续代码
  if (!confirm('确定要提交最终方案吗？提交后将无法修改。')) {
    return // 🔥 点击取消时停止执行
  }

  // 以下代码只有在点击"确定"时才会执行
  finalSubmitted.value = true

  try {
    await submitToServer(studentFinalPlan.value)

    // 🔥 提交成功后的提示和跳转
    alert('✅ 最终方案已成功提交！\n\n即将进入下一步：自我评估与反思')

    setTimeout(() => {
      router.push({
        path: '/experiment/step7',
        query: {
          from: 'step6',
          submitted: 'true',
          timestamp: Date.now().toString(),
        },
      })
    }, 800)
  } catch (error) {
    console.error('提交失败:', error)
    alert('提交失败，但已保存在本地')
    finalSubmitted.value = false // 🔥 提交失败时恢复状态
  }
}

const submitToServer = async (content: string) => {
  const sessionId = getSessionId()

  // 收集Step2-5的最终快照
  const componentSnapshots = {
    step2Final: simpleStorage.getItem('step2_final_answer')?.content || null,
    step3Final: simpleStorage.getItem('step3_final_answer')?.content || null,
    step4Final: simpleStorage.getItem('step4_final_answer')?.content || null,
    step5Final: simpleStorage.getItem('step5_final_answer')?.content || null,
  }

  const response = await fetch('/api/submit-final-solution', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Experiment-ID': localStorage.getItem('experimentId') || '',
    },
    body: JSON.stringify({
      sessionId,
      finalSolution: content,
      studentInitialDraft: studentInitialDraft.value,
      componentSnapshots,
      submittedAt: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`提交失败: ${response.status}`)
  }

  return await response.json()
}

// ==================== AI助手抽屉 ====================
const openAIAssistant = (tab: string = 'chat') => {
  showAIAssistant.value = true
  activeAITab.value = tab
  document.body.style.overflow = 'hidden'
}

const closeAIAssistant = () => {
  showAIAssistant.value = false
  document.body.style.overflow = 'auto'
}

// ==================== 对话功能 ====================
const sendChatMessage = async () => {
  if (!chatInput.value.trim()) return

  const userMessage = chatInput.value.trim()
  addChatMessage('user', userMessage)
  chatInput.value = ''

  isAIThinking.value = true

  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAnswer: userMessage,
        step: 6,
        stage: 1,
        sessionId: getSessionId(),
        context: {
          type: 'step6_chat_assistance',
          currentPlan: studentFinalPlan.value, // 提供当前方案上下文
        },
      }),
    })

    const data = await response.json()
    addChatMessage('ai', data.response || '抱歉，我暂时无法回答。')
  } catch (error) {
    console.error('对话失败:', error)
    addChatMessage('ai', '抱歉，我暂时无法回答，请稍后重试。')
  } finally {
    isAIThinking.value = false
  }
}

const addChatMessage = (type: 'user' | 'ai', content: string) => {
  chatMessages.value.push({
    id: `chat_${Date.now()}`,
    type,
    content,
    timestamp: new Date(),
  })
  scrollChatToBottom()
}

const scrollChatToBottom = () => {
  nextTick(() => {
    if (chatArea.value) {
      chatArea.value.scrollTop = chatArea.value.scrollHeight
    }
  })
}

// ==================== 参考方案 ====================
const generateReference = async () => {
  isGenerating.value = true

  try {
    const response = await fetch('/api/ai/generate-solution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: getSessionId(),
      }),
    })

    const data = await response.json()

    solutionVersion.value = (solutionVersion.value || 0) + 1
    aiReferenceSolution.value = data.integratedSolution || data.fallbackSolution || ''
    solutionGeneratedAt.value = formatTime(new Date())
  } catch (error) {
    console.error('生成失败:', error)
    alert('生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

const regenerateReference = async () => {
  if (confirm('确定要重新生成参考方案吗？当前的参考方案将被替换。')) {
    await generateReference()
  }
}

const copyReference = () => {
  navigator.clipboard.writeText(aiReferenceSolution.value)
  alert('📋 已复制到剪贴板')
}

const insertReference = () => {
  if (studentFinalPlan.value.trim()) {
    if (confirm('确定要插入参考方案吗？这会添加到当前内容之后。')) {
      studentFinalPlan.value += '\n\n' + aiReferenceSolution.value
    }
  } else {
    studentFinalPlan.value = aiReferenceSolution.value
  }
}

// ==================== 工具方法 ====================
const formatTime = (timestamp: Date | string) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getSessionId = (): string => {
  return simpleStorage.getSessionId()
}

const renderMarkdown = (content: string): string => {
  try {
    marked.setOptions({ breaks: true, gfm: true })
    return marked.parse(content) as string
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return content
  }
}

const generateInitialDraft = (): string => {
  const s2 = simpleStorage.getItem<{ content: string }>('step2_final_answer')
  const s3 = simpleStorage.getItem<{ content: string }>('step3_final_answer')
  const s4 = simpleStorage.getItem<{ content: string }>('step4_final_answer')
  const s5 = simpleStorage.getItem<{ content: string }>('step5_final_answer')

  return `# 智能通风节能系统完整方案

## 一、问题分析与目标
${s2?.content || '（Step2 尚未确认最终内容）'}

## 二、资源与策略
${s3?.content || '（Step3 尚未确认最终内容）'}

## 三、用户界面与提示词
${s4?.content || '（Step4 尚未确认最终内容）'}

## 四、应急处理方案
${s5?.content || '（Step5 尚未确认最终内容）'}

---
**说明**：以上内容根据你在前4个步骤的最终回答自动整理，请修改完善。
  `.trim()
}

// ==================== 生命周期 ====================
onMounted(() => {
  // 恢复引导卡片状态
  const collapsed = simpleStorage.getItem<boolean>('step6_guidance_collapsed')
  if (collapsed !== null) {
    guidanceCollapsed.value = collapsed
  }

  // 生成初稿
  studentInitialDraft.value = generateInitialDraft()

  // 恢复草稿或使用初稿
  const savedDraft = simpleStorage.getItem<{ content: string }>('step6_draft')
  if (savedDraft?.content && !finalSubmitted.value) {
    const useOldDraft = confirm('检测到未提交的编辑内容，是否恢复？')
    studentFinalPlan.value = useOldDraft ? savedDraft.content : studentInitialDraft.value
  } else {
    studentFinalPlan.value = studentInitialDraft.value
  }

  // 键盘事件
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (showAIAssistant.value) {
        closeAIAssistant()
      } else if (isFullscreen.value) {
        toggleFullscreen()
      }
    }
  })
})

// 自动保存
watch(studentFinalPlan, () => {
  if (finalSubmitted.value) return

  const timer = setTimeout(() => {
    simpleStorage.setItem('step6_draft', {
      content: studentFinalPlan.value,
      savedAt: new Date().toISOString(),
    })
  }, 2000)

  return () => clearTimeout(timer)
})
</script>

<style scoped>
/* ==================== 基础样式 ==================== */
* {
  box-sizing: border-box;
}

.step-six-wrapper {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ==================== 任务引导卡片（新增） ==================== */
.task-guidance-section {
  margin: 20px 24px;
  animation: slideDown 0.4s ease;
}

.guidance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  position: relative;
}

.card-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.badge-icon {
  font-size: 16px;
}

.card-main {
  margin-bottom: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.card-desc {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.95;
  margin: 0 0 20px 0;
}

.process-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.process-item {
  flex: 1;
  text-align: center;
}

.step-number {
  width: 44px;
  height: 44px;
  background: white;
  color: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  margin: 0 auto 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.step-content h4 {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
}

.step-content p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.4;
}

.process-arrow {
  font-size: 24px;
  font-weight: 300;
  opacity: 0.7;
  padding: 0 16px;
}

/* ✅ 收起按钮 - 占满宽度 */
.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; /* 保持占满宽度 */
  padding: 10px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

/* ✅ 展开按钮 - 紧凑型 */
.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px; /* 更紧凑 */
  /* 注意：没有 width: 100% */
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.collapse-icon,
.expand-icon {
  font-size: 12px;
}

/* ==================== 固定顶栏 ==================== */
.fixed-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 60px;
  background: white;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: #fef3c7;
  color: #92400e;
}

.status-badge.submitted {
  background: #d1fae5;
  color: #065f46;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.tool-btn.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
}

.tool-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.tool-btn span {
  font-size: 14px;
}

/* ==================== 初稿面板 ==================== */
.draft-preview-panel {
  background: #fffbeb;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  margin: 16px 24px;
  overflow: hidden;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #fbbf24;
  background: #fef3c7;
}

.panel-header h4 {
  margin: 0;
  font-size: 15px;
  color: #78350f;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #78350f;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(120, 53, 15, 0.1);
}

.panel-content {
  padding: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.draft-text {
  margin: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #1e293b;
}

.draft-hint {
  margin: 12px 0 16px 0;
  font-size: 12px;
  color: #92400e;
}

.panel-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: #f59e0b;
  color: white;
}

.action-btn.secondary {
  background: white;
  color: #78350f;
  border: 2px solid #fbbf24;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* ==================== 主编辑器 ==================== */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  min-height: 0;
}

.main-content.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: white;
  padding: 24px;
}

.editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.editor-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1e293b;
}

.editor-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #64748b;
}

.word-count {
  font-weight: 600;
}

.last-save {
  font-size: 12px;
}

.editor-wrapper {
  flex: 1;
  position: relative;
  min-height: 0;
}

.main-editor {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  font-size: 15px;
  line-height: 1.8;
  color: #1e293b;
  background: #f8fafc;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
}

.main-editor:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.main-editor:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.exit-fullscreen-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.exit-fullscreen-btn:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* ==================== 固定底栏 ==================== */
.fixed-bottom-bar {
  position: sticky;
  bottom: 0;
  z-index: 10;
  height: 80px;
  background: white;
  border-top: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.action-group-left,
.action-group-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.secondary-btn,
.primary-btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.secondary-btn {
  background: #f1f5f9;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.secondary-btn:hover:not(:disabled) {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.primary-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 3px 12px rgba(16, 185, 129, 0.3);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(16, 185, 129, 0.4);
}

.primary-btn:disabled,
.secondary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.submitted-tag {
  color: #059669;
  font-weight: 600;
  padding: 8px 16px;
  background: #d1fae5;
  border-radius: 8px;
  font-size: 13px;
}

/* ==================== AI助手抽屉 ==================== */
.ai-assistant-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.2);
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 998;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid #e2e8f0;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1e293b;
}

.drawer-tabs {
  display: flex;
  border-bottom: 2px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px 14px;
  background: #f8fafc;
  border: none;
  border-right: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:last-child {
  border-right: none;
}

.tab-btn:hover {
  background: #f1f5f9;
}

.tab-btn.active {
  background: white;
  color: #667eea;
  font-weight: 600;
}

.tab-icon {
  font-size: 20px;
}

.tab-text-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.tab-label {
  font-size: 13px;
  font-weight: 600;
}

.tab-desc {
  font-size: 11px;
  opacity: 0.7;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 0;
}

/* ==================== 对话内容 ==================== */
.chat-content {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 0;
}

.welcome-message {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.welcome-message .message-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.welcome-message .message-text {
  font-size: 14px;
  line-height: 1.6;
  color: #1e293b;
}

.welcome-message p {
  margin: 8px 0;
}

.welcome-message ul {
  margin: 8px 0;
  padding-left: 20px;
}

.welcome-message li {
  margin: 4px 0;
}

.hint-text {
  background: rgba(251, 191, 36, 0.2);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #f59e0b;
  font-size: 13px !important;
}

.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  background: #f1f5f9;
}

.message-bubble {
  max-width: 70%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
}

.chat-message.user .message-bubble {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
}

.bubble-content {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 6px;
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
}

.chat-message.user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f1f5f9;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.thinking-dots {
  display: flex;
  gap: 4px;
}

.thinking-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #667eea;
  animation: bounce 1.4s infinite ease-in-out;
}

.thinking-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.thinking-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.thinking-text {
  font-size: 14px;
  color: #64748b;
}

.chat-input-area {
  border-top: 2px solid #e2e8f0;
  padding: 16px;
  background: white;
}

.chat-input-area textarea {
  width: 100%;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #334155;
  background: #f8fafc;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 12px;
}

.chat-input-area textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.send-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==================== 参考方案 ==================== */
.reference-content {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.empty-desc {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
  line-height: 1.7;
}

.empty-hint {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 24px;
  font-style: italic;
}

.generate-btn {
  padding: 14px 28px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-dots {
  display: inline-flex;
  gap: 3px;
  margin-right: 6px;
}

.loading-dots span {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  animation: bounce 1.4s infinite ease-in-out;
}

.reference-display {
}

.reference-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.version-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.generated-time {
  font-size: 12px;
  color: #94a3b8;
}

.reference-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.reference-actions .action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reference-actions .action-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.reference-actions .action-btn.warning {
  color: #f59e0b;
  border-color: #f59e0b;
}

.reference-actions .action-btn.warning:hover {
  background: #f59e0b;
  color: white;
}

.reference-body {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.markdown-content {
  font-size: 14px;
  line-height: 1.7;
  color: #1e293b;
}

/* ==================== 动画 ==================== */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from {
  max-height: 0;
  opacity: 0;
}

.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 响应式 ==================== */
@media (max-width: 1024px) {
  .ai-assistant-drawer {
    width: 400px;
  }

  .process-steps {
    flex-direction: column;
    gap: 16px;
  }

  .process-arrow {
    transform: rotate(90deg);
  }
}

@media (max-width: 768px) {
  .fixed-toolbar,
  .fixed-bottom-bar {
    padding: 0 16px;
  }

  .tool-btn .btn-text {
    display: none;
  }

  .main-content {
    padding: 16px;
  }

  .ai-assistant-drawer {
    width: 100%;
    height: 80vh;
    top: auto;
    bottom: 0;
    border-radius: 16px 16px 0 0;
  }

  .task-guidance-section {
    margin: 16px;
  }

  .process-steps {
    padding: 16px;
  }

  .step-content h4 {
    font-size: 14px;
  }

  .step-content p {
    font-size: 12px;
  }
}

/* 折叠状态样式 */
.guidance-card-collapsed {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 12px 20px;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.guidance-card-collapsed:hover {
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.collapsed-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapsed-icon {
  font-size: 20px;
}

.collapsed-text {
  font-size: 15px;
  font-weight: 600;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
