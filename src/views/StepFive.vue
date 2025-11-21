<template>
  <div class="step-five-container">
    <!-- 对话轮次限制提示 -->
    <div
      v-if="conversationCount >= 4"
      class="conversation-limit-warning"
      :class="{ 'warning-visible': showConversationWarning }"
    >
      <div class="warning-content">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <span v-if="conversationCount === 4">您已经进行了4轮对话，还有1次提交机会</span>
          <span v-else>您已达到最大对话次数（5轮），请点击"继续下一步"按钮进入下一阶段</span>
        </div>
      </div>
    </div>

    <!-- 对话滚动区域 -->
    <div class="chat-scroll-area" ref="chatScrollArea">
      <!-- 信息卡片区域 -->
      <div class="info-card-section">
        <div class="info-card" :class="{ 'card-visible': showInfoCard }">
          <div class="card-header">
            <div class="card-icon">🚨</div>
            <div class="card-title">
              突发情况！今天下午有重要考试，学生人数临时增加15人，
              现在教室里坐满了60个学生，而且室外气温达到了37℃。
              这种极端情况下，原有的通风节能方案还适用吗？
            </div>
          </div>

          <div class="card-content">
            <div class="chart-section">
              <h4>⚠️ 应急状态监测数据：</h4>
              <div class="chart-container">
                <!-- 人数密度对比图 -->
                <div class="density-comparison">
                  <h5>💥 人数密度变化</h5>
                  <div class="comparison-bars">
                    <div class="bar-group">
                      <div class="bar-label">平时</div>
                      <div class="bar normal">
                        <div class="bar-fill" style="height: 67%"></div>
                        <span class="bar-value">40人</span>
                      </div>
                      <div class="bar-note">0.67人/㎡</div>
                    </div>
                    <div class="bar-group">
                      <div class="bar-label">考试时</div>
                      <div class="bar emergency">
                        <div class="bar-fill" style="height: 100%"></div>
                        <span class="bar-value">60人</span>
                      </div>
                      <div class="bar-note critical">1.0人/㎡</div>
                    </div>
                  </div>
                  <div class="impact-note">💥 产热量增加：4000W → 6000W (+50%)</div>
                </div>

                <!-- 应急状态面板 -->
                <div class="emergency-status">
                  <h5>🔥 极端条件警报</h5>
                  <div class="status-grid">
                    <div class="status-item critical">
                      <span class="status-icon">👥</span>
                      <div class="status-info">
                        <span class="status-value">60人</span>
                        <span class="status-label">学生总数</span>
                        <span class="status-alert">+15人</span>
                      </div>
                    </div>
                    <div class="status-item critical">
                      <span class="status-icon">🌡️</span>
                      <div class="status-info">
                        <span class="status-value">37℃</span>
                        <span class="status-label">室外温度</span>
                        <span class="status-alert">+2℃</span>
                      </div>
                    </div>
                    <div class="status-item warning">
                      <span class="status-icon">🔥</span>
                      <div class="status-info">
                        <span class="status-value">6000W</span>
                        <span class="status-label">人体产热</span>
                        <span class="status-alert">+50%</span>
                      </div>
                    </div>
                    <div class="status-item critical">
                      <span class="status-icon">📐</span>
                      <div class="status-info">
                        <span class="status-value">1.0人/㎡</span>
                        <span class="status-label">人数密度</span>
                        <span class="status-alert">超标</span>
                      </div>
                    </div>
                    <div class="status-item warning">
                      <span class="status-icon">⏱️</span>
                      <div class="status-info">
                        <span class="status-value">2小时</span>
                        <span class="status-label">考试时长</span>
                        <span class="status-alert">持续</span>
                      </div>
                    </div>
                    <div class="status-item">
                      <span class="status-icon">💨</span>
                      <div class="status-info">
                        <span class="status-value">1.8m/s</span>
                        <span class="status-label">室外风速</span>
                        <span class="status-alert">减弱</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 对话消息区域 -->
      <div class="chat-messages">
        <!-- 初始 AI 引导消息 -->
        <div class="message ai" v-if="showPrompt">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <div class="message-text">
              <strong>情境变化阶段：</strong>面对这种突发的极端情况，你觉得应该触发什么"应急模式"？
              <br /><br />
              考虑一下：60人 + 37℃高温 + 考试环境，原来的方案还够用吗？需要什么特殊措施？
            </div>
          </div>
        </div>

        <!-- 动态对话消息 -->
        <div v-for="message in messages" :key="message.id" :class="['message', message.type]">
          <div class="message-avatar">
            {{ message.type === 'ai' ? '🤖' : '👤' }}
          </div>
          <div class="message-content">
            <div class="message-text" v-html="message.content"></div>
            <div class="message-time">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>

        <!-- AI思考加载动画 -->
        <div v-if="isGenerating" class="message ai loading-message">
          <div class="message-avatar">🤖</div>
          <div class="message-content loading-content">
            <div class="loading-animation">
              <div class="loading-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
              <div class="loading-text">AI正在分析应急方案，预计需要15-30秒...</div>
              <div class="loading-progress">
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <div class="progress-steps">
                  <span class="step active">🚨 评估风险</span>
                  <span class="step" :class="{ active: loadingStep >= 2 }">⚡ 应急策略</span>
                  <span class="step" :class="{ active: loadingStep >= 3 }">🎯 优化方案</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部用户输入区域 -->
    <div class="input-section" :class="{ 'input-visible': showAnswerArea }">
      <div class="input-container">
        <textarea
          v-model="userAnswer"
          :placeholder="inputPlaceholder"
          class="user-input"
          :disabled="isGenerating || isConversationLimitReached"
          @input="handleInput"
          rows="3"
        ></textarea>
        <div class="input-toolbar">
          <button
            class="help-button"
            @click="requestHelp"
            :disabled="isGenerating || isConversationLimitReached || !canUseHelp"
            :title="getHelpButtonTitle"
          >
            <span class="help-icon">💬</span>
            我想提问
            <!-- 🔥 新增：显示剩余次数 -->
            <span v-if="canUseHelp" class="help-badge">
              {{ helpSystem.maxCycles - helpSystem.totalCycles }}
            </span>
          </button>
          <div class="action-buttons">
            <button
              v-if="!isConversationLimitReached"
              class="submit-button"
              @click="submitAnswer"
              :disabled="!canSubmit || isGenerating"
            >
              <span v-if="isGenerating">
                <span class="button-loading-dots">
                  <span class="button-dot"></span>
                  <span class="button-dot"></span>
                  <span class="button-dot"></span>
                </span>
                分析中...
              </span>
              <span v-else>提交</span>
            </button>
            <button
              class="next-button"
              @click="handleNextStep"
              v-if="answerSubmitted || isConversationLimitReached"
            >
              下一步
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔥 新增：帮助弹窗 -->
    <div v-if="showHelpDialog" class="help-dialog-overlay" @click="closeHelpDialog">
      <div class="help-dialog" @click.stop>
        <div class="help-dialog-header">
          <div class="help-dialog-icon">💬</div>
          <h3>选择帮助方式</h3>
          <button class="close-button" @click="closeHelpDialog">✕</button>
        </div>

        <div class="help-dialog-content">
          <p class="help-dialog-description">请选择你需要的帮助类型：</p>

          <!-- 帮助选项 -->
          <div class="help-options">
            <!-- 选项1：完善内容 -->
            <button
              class="help-option"
              :class="{
                active: helpMode === 'refine',
                disabled: !availableHelpModes.refine,
              }"
              @click="selectHelpMode('refine')"
              :disabled="!userAnswer.trim() || !availableHelpModes.refine"
            >
              <div class="option-icon">🗣</div>
              <div class="option-content">
                <div class="option-title">
                  帮我完善内容
                  <span v-if="!availableHelpModes.refine" class="used-badge">已使用</span>
                </div>
                <div class="option-description">
                  "我好像写得不太清楚，帮我完善一下吧。"（请先在输入框中写下答案，再点击该按钮）
                </div>
              </div>
              <div class="option-arrow">→</div>
            </button>

            <!-- 选项2：给示例 -->
            <button
              class="help-option"
              :class="{
                active: helpMode === 'example',
                disabled: !availableHelpModes.example,
              }"
              @click="selectHelpMode('example')"
              :disabled="!availableHelpModes.example"
            >
              <div class="option-icon">💡</div>
              <div class="option-content">
                <div class="option-title">
                  给我看看例子
                  <span v-if="!availableHelpModes.example" class="used-badge">已使用</span>
                </div>
                <div class="option-description">"我有点不确定怎么做，能给个参考例子吗？"</div>
              </div>
              <div class="option-arrow">→</div>
            </button>

            <!-- 选项3：自定义提问 -->
            <button
              class="help-option"
              :class="{
                active: helpMode === 'custom',
                disabled: !availableHelpModes.custom,
              }"
              @click="selectHelpMode('custom')"
              :disabled="!availableHelpModes.custom"
            >
              <div class="option-icon">✍️</div>
              <div class="option-content">
                <div class="option-title">
                  我想自己提问
                  <span v-if="!availableHelpModes.custom" class="used-badge">已使用</span>
                </div>
                <div class="option-description">"我有具体的问题想问。"</div>
              </div>
              <div class="option-arrow">→</div>
            </button>
          </div>

          <!-- 🔥 周期提示 -->
          <div class="help-cycle-info">
            <span class="cycle-icon">🔄</span>
            <span>剩余帮助次数：{{ helpSystem.maxCycles - helpSystem.totalCycles }} 次</span>
            <span v-if="helpSystem.isInCycle" class="cycle-tip">
              （当前周期已使用
              {{ Object.values(helpSystem.currentCycleUsed).filter(Boolean).length }}/3）
            </span>
          </div>

          <!-- 自定义问题输入框 -->
          <div v-if="helpMode === 'custom'" class="custom-question-section">
            <textarea
              v-model="customQuestion"
              placeholder="请输入你的问题..."
              class="custom-question-input"
              rows="3"
              autofocus
            ></textarea>
            <div class="custom-question-actions">
              <button class="cancel-custom-button" @click="helpMode = null">取消</button>
              <button
                class="submit-custom-button"
                @click="submitCustomQuestion"
                :disabled="!customQuestion.trim()"
              >
                提交问题
              </button>
            </div>
          </div>

          <!-- 完善内容提示 -->
          <div v-if="helpMode === 'refine' && !userAnswer.trim()" class="help-tip">
            <span class="tip-icon">💡</span>
            <span>请先在下方输入框中写一些内容，然后我可以帮你完善。</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔥 新增：帮助次数用尽提示 -->
    <div v-if="showHelpLimitDialog" class="help-dialog-overlay" @click="closeHelpLimitDialog">
      <div class="help-limit-dialog" @click.stop>
        <div class="limit-dialog-icon">⚠️</div>
        <h3>帮助次数已用完</h3>
        <p>您已使用完所有的帮助次数（{{ helpSystem.maxCycles }} 次）。</p>
        <p class="limit-tip">请继续独立完成剩余的任务，或点击"提交"按钮提交您的应急策略。</p>
        <button class="limit-confirm-button" @click="closeHelpLimitDialog">知道了</button>
      </div>
    </div>

    <!-- 🔥 新增：周期内帮助已用尽提示 -->
    <div v-if="showCycleLimitDialog" class="help-dialog-overlay" @click="closeCycleLimitDialog">
      <div class="help-limit-dialog" @click.stop>
        <div class="limit-dialog-icon">🔄</div>
        <h3>当前周期的帮助已全部使用</h3>
        <p>您已使用完当前周期的3种帮助方式。</p>
        <p class="limit-tip">
          请先提交您的应急策略，提交后将开启新的帮助周期。
          <br />
          剩余帮助周期：<strong>{{ helpSystem.maxCycles - helpSystem.totalCycles }}</strong> 次
        </p>
        <button class="limit-confirm-button" @click="closeCycleLimitDialog">知道了</button>
      </div>
    </div>

    <!-- 🔥 修改：确认弹窗 - 统一风格版本 -->
    <div v-if="showConfirmDialog" class="confirm-dialog-overlay" @click="closeConfirmDialog">
      <div class="confirm-dialog" @click.stop>
        <div class="dialog-header">
          <div class="dialog-icon">🎯</div>
          <h3>确认进入下一步</h3>
        </div>
        <div class="dialog-content">
          <p>您即将完成应急策略分析阶段，进入下一个学习环节。请确认或修改您的最终应急方案。</p>

          <!-- 可编辑的快照区域 -->
          <div v-if="editableFinalAnswer" class="answer-preview">
            <div class="preview-header">
              <span class="preview-icon">📝</span>
              <span class="preview-title">本步骤的最终内容（可编辑）</span>
            </div>

            <!-- 🔥 新增：任务标题 -->
            <div class="task-title">
              <span class="task-icon">🚨</span>
              <span class="task-text">任务：制定突发情况下的应急通风策略（60人+37℃高温场景）</span>
            </div>

            <div class="preview-body">
              <textarea
                v-model="editableFinalAnswer"
                class="preview-textarea"
                rows="10"
                placeholder="请输入或修改你的最终应急方案..."
              ></textarea>
              <p class="preview-hint">💡 这是您最后一次修改机会，请仔细检查后点击"确定继续"。</p>
              <div class="char-count">字数：{{ editableFinalAnswer.length }} 字符</div>
            </div>
          </div>

          <div class="completion-summary">
            <div class="summary-item">
              <span class="summary-icon">💬</span>
              <span>进行了 {{ conversationCount }} 轮应急策略讨论</span>
            </div>
            <div class="summary-item" v-if="answerSubmitted">
              <span class="summary-icon">✅</span>
              <span>已提交应急处理方案</span>
            </div>
            <div class="summary-item" v-if="isConversationLimitReached">
              <span class="summary-icon">⏰</span>
              <span>已达到最大对话轮次限制</span>
            </div>
            <div class="summary-item" v-if="helpSystem.totalCycles > 0">
              <span class="summary-icon">💡</span>
              <span>使用了 {{ helpSystem.totalCycles }} 次智能帮助</span>
            </div>
          </div>
          <div class="dialog-warning">
            <span class="warning-icon">⚠️</span>
            <span>进入下一步后，您将无法返回修改当前的应急策略。</span>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="cancel-button" @click="closeConfirmDialog">返回对话</button>
          <button
            class="confirm-button"
            @click="confirmNextStep"
            :disabled="!editableFinalAnswer.trim()"
          >
            确定继续
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { simpleStorage } from '../../api/utils/simpleStorage'
import { trackStep5Event } from '../../src/utils/tracking.ts'

// 定义组件通信
const emit = defineEmits(['update-progress', 'show-next-steps'])

const router = useRouter()

// 🔥 新增：最终答案快照相关
const finalAnswerSnapshot = ref('') // 本步最终答案快照
const finalAnswerConfirmed = ref(false) // 是否已确认最终答案
const editableFinalAnswer = ref('') // 可编辑的最终答案（用于弹窗中编辑）

// 🔥 定义消息类型
interface Message {
  id?: string
  type: 'user' | 'ai' | 'system'
  content: string
  step: number
  stage?: number
  timestamp: string | Date
}

// 🔥 定义存储的消息类型
interface StoredMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: string
  stage?: number
  step?: number
}

// 🔥 定义 Step5 数据结构
interface Step5Data {
  conversationCount: number
  stageCompletionStatus: boolean[]
  messages: StoredMessage[]
  currentStage: number
  isCompleted: boolean
  // 🔥 新增：帮助系统状态
  helpSystem?: {
    totalCycles: number
    maxCycles: number
    currentCycleUsed: {
      refine: boolean
      example: boolean
      custom: boolean
    }
    isInCycle: boolean
  }
  // 🔥 新增：应急方案元数据
  emergencyStrategyMetadata?: {
    mentionedFactors: string[]
    hasQuantitativeAnalysis: boolean
    hasCostBenefit: boolean
    submittedAt?: string
  }
}

// 🔥 定义 event_data 的类型
interface Step5EventData {
  helpMode?: 'refine' | 'example' | 'custom'
  customQuestion?: string
  actualRequest?: string
  helpCycle?: number
  remainingHelps?: number
  cycleUsedModes?: string
  strategyLength?: number
  mentionedFactors?: string
  hasEmergencyMeasures?: boolean
  hasCostAnalysis?: boolean
  currentInputLength?: number
  hasInput?: boolean
  conversationCount?: number
  isCompleted?: boolean
  totalConversations?: number
  helpUsed?: number
  hasHistory?: boolean
  conversationRound?: number
  [key: string]: string | number | boolean | undefined
}

// 定义数据库保存的数据结构
interface ConversationData {
  sessionId: string
  step: number
  stage: number
  userInput: string
  aiResponse: string
  conversationCount: number
  timestamp: Date
  context: string
  experimentId?: string
  studentName?: string
  event_name?: string
  event_data?: Step5EventData
}

// 🔥 新增：帮助系统状态管理
const helpSystem = reactive({
  totalCycles: 0,
  maxCycles: 4, // 🔥 保持4个周期
  currentCycleUsed: {
    refine: false,
    example: false,
    custom: false,
  },
  isInCycle: false,
})

// 🔥 新增：计算属性 - 帮助功能是否可用
const canUseHelp = computed(() => {
  return helpSystem.totalCycles < helpSystem.maxCycles
})

// 🔥 新增：计算属性 - 当前周期剩余可用模式
const availableHelpModes = computed(() => {
  return {
    refine: !helpSystem.currentCycleUsed.refine,
    example: !helpSystem.currentCycleUsed.example,
    custom: !helpSystem.currentCycleUsed.custom,
  }
})

// 🔥 新增：计算属性 - 当前周期是否还有可用模式
const hasAvailableModesInCycle = computed(() => {
  return Object.values(availableHelpModes.value).some((available) => available)
})

// 🔥 新增：帮助按钮 title 计算属性
const getHelpButtonTitle = computed(() => {
  if (!canUseHelp.value) {
    return '已达到帮助次数上限'
  }
  if (helpSystem.isInCycle && !hasAvailableModesInCycle.value) {
    return '当前周期的帮助已全部使用，请提交答案后再使用'
  }
  return '点击获取智能帮助'
})

// 🔥 新增：帮助弹窗相关状态
const showHelpDialog = ref(false)
const helpMode = ref<'refine' | 'example' | 'custom' | null>(null)
const customQuestion = ref('')
const showHelpLimitDialog = ref(false)
const showCycleLimitDialog = ref(false)

// 状态管理
const showInfoCard = ref(false)
const showPrompt = ref(false)
const showAnswerArea = ref(false)
const showConversationWarning = ref(false)
const showConfirmDialog = ref(false)
const userAnswer = ref('')
const answerSubmitted = ref(false)
const isGenerating = ref(false)
const loadingStep = ref(1)

// 对话轮次控制
const conversationCount = ref(0)
const MAX_CONVERSATIONS = 5

// 对话轮次追踪
const conversationRound = ref(0)

// 对话历史存储为 Message 数组
const messages = ref<Message[]>([])
const conversationHistory = ref<Message[]>([])

// 滚动容器引用
const chatScrollArea = ref<HTMLElement | null>(null)

// 计算属性
const canSubmit = computed(() => userAnswer.value.trim().length > 0)

const isConversationLimitReached = computed(() => conversationCount.value >= MAX_CONVERSATIONS)

const inputPlaceholder = computed(() => {
  if (isConversationLimitReached.value) {
    return '已达到最大对话轮次，请点击"继续下一步"进入下一阶段'
  }
  return '分析这种极端情况需要什么应急措施......'
})

// 🔥 监听对话轮次变化（添加埋点）
watch(conversationCount, async (newCount) => {
  if (newCount >= 4) {
    showConversationWarning.value = true
    nextTick(() => {
      if (chatScrollArea.value) {
        chatScrollArea.value.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
    })
  }

  // 🔥 埋点 - 达到对话上限
  if (newCount === MAX_CONVERSATIONS) {
    await trackStep5Event('step5_conversation_limit_reached', getSessionId(), newCount, {
      isCompleted: answerSubmitted.value,
      helpUsed: helpSystem.totalCycles,
    })
  }
})

// 🔥 从本地存储恢复数据
const restoreFromStorage = () => {
  const stepData = simpleStorage.getStepData(5) as Step5Data | null
  if (stepData) {
    conversationCount.value = stepData.conversationCount || 0
    answerSubmitted.value = stepData.stageCompletionStatus?.[0] || false

    messages.value = stepData.messages.map(
      (msg: StoredMessage): Message => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        step: msg.step || 5,
        stage: msg.stage,
        timestamp: msg.timestamp,
      }),
    )

    conversationHistory.value = messages.value.filter((msg) => msg.type !== 'system')
    conversationRound.value = conversationCount.value

    // 🔥 恢复帮助系统状态
    if (stepData.helpSystem) {
      Object.assign(helpSystem, stepData.helpSystem)
    }

    console.log('💾 Step5 - 从存储恢复数据:', {
      conversationCount: conversationCount.value,
      messagesCount: messages.value.length,
      historyCount: conversationHistory.value.length,
      helpSystem: helpSystem,
    })
  }
}

// 🔥 保存当前状态到本地存储
const saveToStorage = () => {
  const stepData = {
    conversationCount: conversationCount.value,
    stageCompletionStatus: [answerSubmitted.value, false, false],
    messages: messages.value.map(
      (msg): StoredMessage => ({
        id: msg.id || `msg_${Date.now()}`,
        type: msg.type,
        content: msg.content,
        timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString(),
        step: 5,
        stage: 1,
      }),
    ),
    currentStage: 1,
    isCompleted: answerSubmitted.value,
    helpSystem: {
      totalCycles: helpSystem.totalCycles,
      maxCycles: helpSystem.maxCycles,
      currentCycleUsed: { ...helpSystem.currentCycleUsed },
      isInCycle: helpSystem.isInCycle,
    },
    emergencyStrategyMetadata: extractEmergencyMetadata(),
    // 🔥 新增：快照字段
    finalAnswerSnapshot: finalAnswerSnapshot.value,
    finalAnswerConfirmed: finalAnswerConfirmed.value,
  }

  simpleStorage.saveStepData(5, stepData)

  console.log('💾 Step5 - 保存数据到存储:', {
    conversationCount: stepData.conversationCount,
    messagesCount: stepData.messages.length,
    helpSystem: stepData.helpSystem,
  })
}

// 🔥 新增：保存帮助系统状态到 localStorage
function saveHelpSystemState() {
  const stepData = simpleStorage.getStepData(5) as Step5Data | null
  if (stepData) {
    stepData.helpSystem = {
      totalCycles: helpSystem.totalCycles,
      maxCycles: helpSystem.maxCycles,
      currentCycleUsed: { ...helpSystem.currentCycleUsed },
      isInCycle: helpSystem.isInCycle,
    }
    stepData.emergencyStrategyMetadata = extractEmergencyMetadata()
    localStorage.setItem('step5_data', JSON.stringify(stepData))
    console.log('💾 Step5 帮助系统状态已保存')
  }
}

// 🔥 修改：生成应急方案快照 - 去掉markdown格式
const generateEmergencySnapshot = (): string => {
  const userMessages = messages.value.filter((msg) => msg.type === 'user').map((msg) => msg.content)

  if (userMessages.length === 0) {
    return '（尚未提交应急方案内容）'
  }

  const validMessages = userMessages.filter((content) => content.trim().length > 20)

  if (validMessages.length === 0) {
    return '（尚未提交有效的应急方案内容）'
  }

  // 🔥 简化格式，去掉markdown
  return validMessages.join('\n\n')
}

// 🔥 新增：提取应急方案元数据
function extractEmergencyMetadata() {
  const allUserInputs = messages.value
    .filter((m) => m.type === 'user')
    .map((m) => m.content)
    .join(' ')

  return {
    mentionedFactors: detectMentionedFactors(allUserInputs),
    hasQuantitativeAnalysis: /\d+/.test(allUserInputs),
    hasCostBenefit: /(成本|费用|能耗)/.test(allUserInputs),
    submittedAt: answerSubmitted.value ? new Date().toISOString() : undefined,
  }
}

// 🔥 新增：检测提到的应急要素
function detectMentionedFactors(text: string): string[] {
  const factors = []
  if (/(人数|60人|学生)/.test(text)) factors.push('人数')
  if (/(温度|37|高温|炎热)/.test(text)) factors.push('温度')
  if (/(通风|开窗|排风)/.test(text)) factors.push('通风')
  if (/(空调|制冷|降温)/.test(text)) factors.push('空调')
  if (/(时间|2小时|考试)/.test(text)) factors.push('时长')
  if (/(预冷|提前)/.test(text)) factors.push('预冷')
  if (/(分流|分批)/.test(text)) factors.push('人员管理')
  return factors
}

// 方法
const handleInput = () => {
  // 输入处理
}

// 🔥 修改：提交答案函数（添加周期重置和埋点）
const submitAnswer = async () => {
  if (!canSubmit.value || isConversationLimitReached.value) return

  conversationCount.value += 1
  conversationRound.value = conversationCount.value

  addMessage('user', userAnswer.value)

  const currentAnswer = userAnswer.value
  userAnswer.value = ''

  // 🔥 重置帮助周期
  if (helpSystem.isInCycle) {
    console.log(`🔄 重置帮助周期，已使用周期数: ${helpSystem.totalCycles}`)
    helpSystem.isInCycle = false
    helpSystem.currentCycleUsed = {
      refine: false,
      example: false,
      custom: false,
    }
    saveHelpSystemState()
  }

  // 🔥 埋点 - 提交应急方案
  await trackStep5Event(
    'step5_emergency_strategy_submit',
    getSessionId(),
    conversationCount.value,
    {
      strategyLength: currentAnswer.length,
      mentionedFactors: detectMentionedFactors(currentAnswer).join(','),
      conversationRound: conversationRound.value,
    },
  )

  isGenerating.value = true
  loadingStep.value = 1

  const stepInterval = setInterval(() => {
    if (loadingStep.value < 3) {
      loadingStep.value++
    }
  }, 5000)

  try {
    const response = await callAIAPI(currentAnswer, conversationRound.value)
    clearInterval(stepInterval)

    addMessage('ai', response)

    answerSubmitted.value = true

    saveToStorage()

    emit('update-progress', 5)
    emit('show-next-steps')
  } catch (error) {
    clearInterval(stepInterval)
    console.error('❌ Step5 - AI API 调用失败:', error)
    addMessage('ai', '抱歉，系统暂时无法处理您的回答，请稍后重试。')
    saveToStorage()
  } finally {
    isGenerating.value = false
    loadingStep.value = 1
  }
}

// 🔥 新增：打开帮助弹窗（添加埋点和周期管理）
function requestHelp() {
  if (isGenerating.value || isConversationLimitReached.value) return

  // 检查是否还能使用帮助功能
  if (!canUseHelp.value) {
    showHelpLimitDialog.value = true
    return
  }

  // 如果不在周期中，开启新周期
  if (!helpSystem.isInCycle) {
    helpSystem.totalCycles++
    helpSystem.isInCycle = true
    console.log(`🆕 开启第 ${helpSystem.totalCycles} 个帮助周期`)
  }

  // 检查当前周期是否还有可用模式
  if (!hasAvailableModesInCycle.value) {
    showCycleLimitDialog.value = true
    return
  }

  // 🔥 埋点 - 点击帮助按钮
  trackStep5Event('step5_help_button_click', getSessionId(), conversationCount.value, {
    currentInputLength: userAnswer.value.length,
    hasInput: userAnswer.value.length > 0,
    helpCycle: helpSystem.totalCycles,
    availableModes: Object.entries(availableHelpModes.value)
      .filter(([_, available]) => available)
      .map(([mode]) => mode)
      .join(','),
  })

  showHelpDialog.value = true
}

// 🔥 新增：关闭帮助弹窗
function closeHelpDialog() {
  showHelpDialog.value = false
  helpMode.value = null
  customQuestion.value = ''
}

// 🔥 新增：关闭限制提示弹窗
const closeHelpLimitDialog = () => {
  showHelpLimitDialog.value = false
}

const closeCycleLimitDialog = () => {
  showCycleLimitDialog.value = false
}

// 🔥 新增：选择帮助模式
function selectHelpMode(mode: 'refine' | 'example' | 'custom') {
  // 检查该模式在当前周期是否已使用
  if (!availableHelpModes.value[mode]) {
    console.log(`❌ 模式 ${mode} 在当前周期已使用`)
    return
  }

  helpMode.value = mode

  // 如果不是自定义提问，直接执行
  if (mode !== 'custom') {
    executeHelp(mode)
  }
}

// 🔥 新增：提交自定义问题
function submitCustomQuestion() {
  if (!customQuestion.value.trim()) {
    return
  }
  executeHelp('custom', customQuestion.value)
}

// 🔥 新增：执行帮助请求（添加埋点和周期管理）
async function executeHelp(mode: 'refine' | 'example' | 'custom', customQuestionText?: string) {
  // 关闭弹窗
  showHelpDialog.value = false

  // 标记该模式在当前周期已使用
  helpSystem.currentCycleUsed[mode] = true

  // 保存帮助系统状态
  saveHelpSystemState()

  // 根据帮助模式生成可读的用户消息
  let userDisplayMessage = ''
  let helpRequestContent = ''
  let helpContextType = ''

  switch (mode) {
    case 'refine':
      userDisplayMessage = `💬 帮我完善内容：${userAnswer.value || '（当前输入内容）'}`
      helpRequestContent = '[REFINE_CONTENT]' + (userAnswer.value || '当前输入内容需要完善')
      helpContextType = 'refine_content'
      break
    case 'example':
      userDisplayMessage = '💡 能给我看看例子吗？'
      helpRequestContent = '[REQUEST_EXAMPLE]' + '需要一个参考示例'
      helpContextType = 'request_example'
      break
    case 'custom':
      userDisplayMessage = `✍️ 我想问：${customQuestionText || '需要具体指导'}`
      helpRequestContent = '[CUSTOM_QUESTION]' + (customQuestionText || '需要具体指导')
      helpContextType = 'custom_question'
      break
  }

  // 1. 先显示用户的帮助请求消息
  addMessage('user', userDisplayMessage)

  // 增加对话计数
  conversationCount.value += 1

  // 🔥 埋点 - 使用帮助
  await trackStep5Event('step5_help_request', getSessionId(), conversationCount.value, {
    helpMode: mode,
    helpCycle: helpSystem.totalCycles,
    cycleUsedModes: Object.entries(helpSystem.currentCycleUsed)
      .filter(([_, used]) => used)
      .map(([mode]) => mode)
      .join(','),
    remainingHelps: helpSystem.maxCycles - helpSystem.totalCycles,
  })

  isGenerating.value = true
  loadingStep.value = 1

  const stepInterval = setInterval(() => {
    if (loadingStep.value < 2) {
      loadingStep.value++
    }
  }, 2000)

  try {
    // 2. 调用 API
    const helpResponse = await callEnhancedHelpAPI(mode, customQuestionText, helpRequestContent)

    clearInterval(stepInterval)

    // 3. 显示 AI 回复
    addMessage('ai', helpResponse)

    // 4. 保存到数据库
    await saveConversationToDB(
      userDisplayMessage,
      helpResponse,
      `emergency_strategy_${helpContextType}`,
      {
        helpMode: mode,
        customQuestion: mode === 'custom' ? customQuestionText : undefined,
        actualRequest: helpRequestContent,
      },
    )

    saveToStorage()
  } catch (error) {
    clearInterval(stepInterval)
    console.error('❌ Step5 - 获取帮助失败:', error)

    const fallbackTexts: Record<string, string> = {
      refine: '试着把你的应急方案更具体地表达出来，比如可以加上具体的数值或操作步骤。',
      example: '想想在这种极端情况下（60人+37℃），通常会采取哪些应急措施？',
      custom: '根据你的问题，建议从应急降温、人员分流、预冷策略等角度来思考。',
    }

    addMessage('ai', fallbackTexts[mode] || fallbackTexts.custom)
    saveToStorage()
  } finally {
    isGenerating.value = false
    loadingStep.value = 1

    // 重置弹窗状态
    helpMode.value = null
    customQuestion.value = ''
  }
}

// 🔥 新增：调用增强版帮助 API
async function callEnhancedHelpAPI(
  helpMode: 'refine' | 'example' | 'custom' = 'custom',
  customQuestionText?: string,
  helpRequestContent?: string,
): Promise<string> {
  try {
    // ✅ 修复：重命名局部变量，避免与 ref 同名
    const formattedHistory = conversationHistory.value
      .filter((msg: Message) => msg.step === 5) // ✅ 添加类型注解
      .map((msg: Message) => ({
        // ✅ 添加类型注解
        type: msg.type,
        content: msg.content,
        step: msg.step,
        stage: msg.stage,
        timestamp: msg.timestamp,
      }))

    // 如果没有传入 helpRequestContent，则生成
    let actualHelpRequest = helpRequestContent
    if (!actualHelpRequest) {
      switch (helpMode) {
        case 'refine':
          actualHelpRequest = '[REFINE_CONTENT]' + (userAnswer.value || '当前输入内容需要完善')
          break
        case 'example':
          actualHelpRequest = '[REQUEST_EXAMPLE]' + '需要一个参考示例'
          break
        case 'custom':
          actualHelpRequest = '[CUSTOM_QUESTION]' + (customQuestionText || '需要具体指导')
          break
      }
    }

    console.log('📤 Step5 智能帮助 - 发送对话历史:', {
      count: formattedHistory.length,
      helpMode,
      history: formattedHistory,
    })

    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': localStorage.getItem('experimentId') || '',
      },
      body: JSON.stringify({
        userAnswer: actualHelpRequest,
        context: {
          isHelpRequest: true,
          helpMode,
          customQuestion: customQuestionText,
          currentUserInput: userAnswer.value,
          recentQuestions: getRecentQuestions(),
          isExam: true,
          requireQuiet: true,
        },
        step: 5,
        stage: 1,
        sessionId: getSessionId(),
        conversationHistory: formattedHistory, // ✅ 使用新变量名
        followUpContext: {
          conversationCount: conversationCount.value,
          isSmartHintRequest: true,
          helpType:
            helpMode === 'refine'
              ? 'refine_content'
              : helpMode === 'example'
                ? 'request_example'
                : 'custom_question',
          needsGuidance: true,
          needsContinuity: true,
          emergencyContext: {
            studentCount: 60,
            temperature: 37,
            duration: '2小时考试',
            heatGeneration: '6000W',
            density: '1.0人/㎡',
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()

    console.log('📥 Step5 智能帮助 - 收到响应:', {
      response: data.response,
      isSmartHint: data.metadata?.isSmartHint,
      helpMode,
    })

    return (
      data.response ||
      '💡 可以从这几个角度思考：<br>• 应急制冷措施<br>• 人员分流策略<br>• 紧急通风方案<br>• 考试环境保障'
    )
  } catch (error) {
    console.error('❌ Step5 - 智能帮助API调用失败:', error)
    throw error
  }
}

// 🔥 修改：打开确认弹窗 - 初始化可编辑内容
const handleNextStep = () => {
  // 生成快照
  finalAnswerSnapshot.value = generateEmergencySnapshot()
  // 初始化可编辑内容为当前快照
  editableFinalAnswer.value = finalAnswerSnapshot.value
  showConfirmDialog.value = true
}

const closeConfirmDialog = () => {
  showConfirmDialog.value = false
}

// 🔥 修改：确认进入下一步 - 保存编辑后的快照
const confirmNextStep = async () => {
  // 使用编辑后的内容作为最终快照
  finalAnswerSnapshot.value = editableFinalAnswer.value.trim()
  finalAnswerConfirmed.value = true
  showConfirmDialog.value = false

  // 1. 保存到 localStorage（Step6 会读取）
  simpleStorage.setItem('step5_final_answer', {
    content: finalAnswerSnapshot.value,
    confirmedAt: new Date().toISOString(),
  })

  // 2. 埋点 - 点击继续下一步
  await trackStep5Event('step5_next_step_click', getSessionId(), conversationCount.value, {
    isCompleted: answerSubmitted.value,
    totalConversations: conversationCount.value,
    helpUsed: helpSystem.totalCycles,
    finalAnswerLength: finalAnswerSnapshot.value.length,
    wasEdited: editableFinalAnswer.value !== generateEmergencySnapshot(),
  })

  // 3. 保存到 storage（包含快照）
  saveToStorage()

  // 4. 跳转下一步
  goToNextStep()
}

const goToNextStep = () => {
  simpleStorage.updateCurrentStep(6)
  saveProgressToLocal()
  router.push('/experiment/step6')
}

// addMessage 函数，添加 step
const addMessage = (type: 'ai' | 'user' | 'system', content: string) => {
  const messageId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const message: Message = {
    id: messageId,
    type,
    content,
    step: 5,
    stage: 1,
    timestamp: new Date(),
  }

  messages.value.push(message)

  if (type !== 'system') {
    conversationHistory.value.push(message)
  }

  simpleStorage.addMessage(5, type, content, 1)

  nextTick(() => {
    scrollToBottom()
  })
}

const scrollToBottom = () => {
  if (chatScrollArea.value) {
    chatScrollArea.value.scrollTop = chatScrollArea.value.scrollHeight
  }
}

const formatTime = (timestamp: Date | string) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const saveProgressToLocal = () => {
  const progressData = {
    conversationCount: conversationCount.value,
    answerSubmitted: answerSubmitted.value,
    messages: messages.value.map((msg) => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString(),
    })),
    conversationHistory: conversationHistory.value.map((msg) => ({
      type: msg.type,
      content: msg.content,
      step: msg.step,
      stage: msg.stage,
      timestamp: msg.timestamp,
    })),
    completedAt: new Date().toISOString(),
  }

  localStorage.setItem('step5_progress', JSON.stringify(progressData))
}

// 获取最近问题用于上下文
const getRecentQuestions = (): string => {
  return conversationHistory.value
    .filter((msg) => msg.type === 'ai')
    .slice(-3)
    .map((msg) => msg.content)
    .join('；')
}

// API 调用函数
const callAIAPI = async (answer: string, round: number): Promise<string> => {
  try {
    const sessionId = getSessionId()

    const formattedHistory = conversationHistory.value
      .filter((msg) => msg.step === 5)
      .map((msg) => ({
        type: msg.type,
        content: msg.content,
        step: msg.step,
        stage: msg.stage || 1,
        timestamp: msg.timestamp,
      }))

    console.log('📤 Step5 - 发送给后端的对话历史:', {
      count: formattedHistory.length,
      history: formattedHistory,
      userAnswer: answer.substring(0, 50) + (answer.length > 50 ? '...' : ''),
    })

    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': localStorage.getItem('experimentId') || '',
      },
      body: JSON.stringify({
        userAnswer: answer,
        context: {
          recentQuestions: getRecentQuestions(),
          isExam: true,
          requireQuiet: true,
        },
        step: 5,
        stage: 1,
        sessionId: sessionId,
        conversationHistory: formattedHistory,
        followUpContext: {
          conversationRound: round,
          conversationCount: conversationCount.value,
          emergencyContext: {
            studentCount: 60,
            temperature: 37,
            duration: '2小时考试',
            heatGeneration: '6000W',
            density: '1.0人/㎡',
          },
          needsContinuity: true,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()

    console.log('📥 Step5 - 收到后端响应:', {
      response: data.response?.substring(0, 100) + (data.response?.length > 100 ? '...' : ''),
      metadata: data.metadata,
    })

    const aiResponse = data.response || generateContextualResponse(answer, round)

    await saveConversationToDB(answer, aiResponse, 'emergency_strategy_development')

    return aiResponse
  } catch (error) {
    console.error('❌ Step5 - AI API 调用失败:', error)
    const fallbackResponse = generateContextualResponse(answer, round)

    await saveConversationToDB(answer, fallbackResponse, 'emergency_strategy_fallback')

    return fallbackResponse
  }
}

// 生成上下文相关的回复
const generateContextualResponse = (answer: string, round: number): string => {
  const answerLower = answer.toLowerCase()
  const history = conversationHistory.value.map((msg) => msg.content)

  if (round === 1) {
    if (answerLower.includes('应急') || answerLower.includes('紧急')) {
      return `
        <div class="ai-response-structured">
          <div class="response-header">
            <span class="response-icon">🚨</span>
            <strong>应急模式分析</strong>
          </div>

          <div class="analysis-section">
            <h4>🎯 应急策略要点</h4>
            <ul class="analysis-list">
              <li><strong>立即降温：</strong>空调功率调至最大，温度设定22-24℃</li>
              <li><strong>强制通风：</strong>开启所有可用通风设备</li>
              <li><strong>人员管理：</strong>考虑分批考试或更换更大教室</li>
            </ul>
          </div>

          <div class="analysis-section">
            <h4>⚡ 能耗与效果平衡</h4>
            <ul class="challenge-list">
              <li><strong>能耗激增：</strong>可能达到5-6kW，比平时增加50%以上</li>
              <li><strong>降温速度：</strong>需要15-20分钟达到目标温度</li>
              <li><strong>维持成本：</strong>2小时考试期间的高功率运行</li>
            </ul>
          </div>

          <div class="follow-up-question">
            <span class="question-icon">🤔</span>
            <em>你觉得这种应急措施在实际执行中会遇到什么困难？</em>
          </div>
        </div>
      `
    } else if (answerLower.includes('空调') || answerLower.includes('制冷')) {
      return `
        <div class="ai-response-structured">
          <div class="response-header">
            <span class="response-icon">❄️</span>
            <strong>极限制冷方案</strong>
          </div>

          <div class="analysis-section">
            <h4>🔥 挑战分析</h4>
            <p>60人产生6000W热量，相当于1.9倍原有空调功率！</p>
            <ul class="analysis-list">
              <li><strong>制冷负荷：</strong>6000W人体热 + 外界37℃热传导</li>
              <li><strong>设备能力：</strong>现有3.2kW空调可能无法应对</li>
              <li><strong>时间要求：</strong>必须在考试开始前达到舒适温度</li>
            </ul>
          </div>

          <div class="challenge-section">
            <h4>💡 可能的解决方案</h4>
            <p>你有没有考虑过<strong>预冷策略</strong>？比如提前2小时开始降温，或者借调临时制冷设备？</p>
          </div>
        </div>
      `
    } else {
      return `
        <div class="ai-response-structured">
          <div class="response-header">
            <span class="response-icon">🔍</span>
            <strong>极端条件分析</strong>
          </div>

          <div class="analysis-section">
            <h4>📊 数据对比</h4>
            <ul class="analysis-list">
              <li><strong>人数增长：</strong>40人 → 60人（+50%）</li>
              <li><strong>热量产生：</strong>4000W → 6000W（+50%）</li>
              <li><strong>密度增加：</strong>0.67人/㎡ → 1.0人/㎡（+49%）</li>
              <li><strong>外界温度：</strong>35℃ → 37℃（+2℃）</li>
            </ul>
          </div>

          <div class="insight-box">
            <span class="insight-icon">⚠️</span>
            <strong>关键思考：</strong>原来的节能方案在这种极端条件下还适用吗？需要什么样的"应急预案"？
          </div>
        </div>
      `
    }
  } else {
    if (answerLower.includes('预冷') || answerLower.includes('提前')) {
      return `
        <div class="ai-response-structured">
          <div class="response-header">
            <span class="response-icon">⏰</span>
            <strong>预冷策略很有前瞻性！</strong>
          </div>

          <div class="analysis-section">
            <p>结合你之前提到的想法，预冷确实是应对极端情况的有效方法：</p>

            <h4>🎯 预冷时间规划</h4>
            <div class="timeline-analysis">
              <div class="time-slot">
                <strong>考试前3小时：</strong>空调开始预冷至20℃
              </div>
              <div class="time-slot">
                <strong>考试前1小时：</strong>学生入场，温度上升但有缓冲
              </div>
              <div class="time-slot">
                <strong>考试期间：</strong>维持24-26℃舒适温度
              </div>
            </div>
          </div>

          <div class="follow-up-question">
            <span class="question-icon">💭</span>
            <em>这种预冷策略的能耗成本你有考虑过吗？可能需要多少额外电费？</em>
          </div>
        </div>
      `
    } else if (answerLower.includes('分批') || answerLower.includes('分流')) {
      return `
        <div class="ai-response-structured">
          <div class="response-header">
            <span class="response-icon">👥</span>
            <strong>人员分流管理思路</strong>
          </div>

          <div class="analysis-section">
            <p>这是一个很实用的管理策略！基于你的思路：</p>

            <h4>📋 分流方案对比</h4>
            <ul class="analysis-list">
              <li><strong>时间分批：</strong>30人+30人，分两个时段</li>
              <li><strong>空间分流：</strong>使用2个教室，降低密度</li>
              <li><strong>混合方案：</strong>重要考试正常进行，其他活动调整</li>
            </ul>
          </div>

          <div class="challenge-section">
            <h4>🤔 实施挑战</h4>
            <p>但是分流也有限制：<strong>考试公平性、监考人员安排、题目保密</strong>等问题。你觉得在保证公平的前提下，哪种分流方式最可行？</p>
          </div>
        </div>
      `
    } else {
      return `
        <div class="ai-response-structured">
          <div class="response-header">
            <span class="response-icon">🎯</span>
            <strong>深入分析你的想法</strong>
          </div>

          <div class="analysis-section">
            <p>基于前面的讨论和你现在的观点，我看到了很全面的考虑：</p>

            <h4>🔍 综合评估</h4>
            <ul class="analysis-list">
              <li><strong>技术可行性：</strong>方案在技术上是否可实现</li>
              <li><strong>成本效益：</strong>短期成本vs长期效果</li>
              <li><strong>应急性：</strong>能否快速部署和执行</li>
            </ul>
          </div>

          <div class="insight-box">
            <span class="insight-icon">💡</span>
            <strong>思考延伸：</strong>如果这种极端情况经常发生，你会建议学校做哪些长期的基础设施改进？
          </div>
        </div>
      `
    }
  }
}

// 保存对话到数据库
const saveConversationToDB = async (
  userInput: string,
  aiResponse: string,
  context: string,
  eventData?: Step5EventData,
): Promise<void> => {
  try {
    const experimentId = localStorage.getItem('experimentId')
    const studentName = localStorage.getItem('studentName')

    await fetch('/api/conversations/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': experimentId || '',
      },
      body: JSON.stringify({
        sessionId: getSessionId(),
        step: 5,
        stage: 1,
        userInput,
        aiResponse,
        conversationCount: conversationCount.value,
        timestamp: new Date(),
        context,
        experimentId,
        studentName,
        event_data: eventData,
      }),
    })

    console.log('✅ Step5 - 对话已保存到数据库')
  } catch (error) {
    console.error('❌ Step5 - 保存对话失败:', error)
  }
}

const getSessionId = () => {
  return simpleStorage.getSessionId()
}

// 生命周期
const showContentSequentially = async () => {
  restoreFromStorage()

  showInfoCard.value = true
  await new Promise((resolve) => setTimeout(resolve, 800))

  showPrompt.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))

  showAnswerArea.value = true

  if (messages.value.length > 0) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 🔥 组件挂载时（添加埋点）
onMounted(async () => {
  console.log('🎬 Step5 组件已挂载')

  // 🔥 埋点 - 进入 Step5
  await trackStep5Event('step5_enter', getSessionId(), conversationCount.value, {
    hasHistory: messages.value.length > 0,
  })

  showContentSequentially()
})
</script>

<style scoped>
/* 对话轮次限制警告 */
.conversation-limit-warning {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 0 0 12px 12px;
  margin: 0;
  opacity: 0;
  transform: translateY(-100%);
  transition: all 0.5s ease-out;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.conversation-limit-warning.warning-visible {
  opacity: 1;
  transform: translateY(0);
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  animation: warningPulse 2s infinite;
}

.warning-text {
  color: #92400e;
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.4;
}

@keyframes warningPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.step-five-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffffdd;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

/* 对话滚动区域 */
.chat-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

.chat-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.chat-scroll-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.chat-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

.chat-scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* 对话消息区域 */
.chat-messages {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 信息卡片样式 - 应急主题 */
.info-card-section {
  flex-shrink: 0;
}

.info-card {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #ef4444;
  border-radius: 20px;
  padding: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.info-card.card-visible {
  opacity: 1;
  transform: translateY(0);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card-icon {
  background: linear-gradient(45deg, #ef4444, #dc2626);
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.card-title {
  color: #991b1b;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 500;
}

.card-content h4 {
  color: #991b1b;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: flex-start;
}

/* 题注样式 */
.density-comparison h5,
.emergency-status h5 {
  color: #991b1b;
  font-size: 0.85rem;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  text-align: center;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
  border-left: 3px solid #ef4444;
}

/* 人数密度对比图 */
.density-comparison {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.density-comparison h5 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 0.85rem;
  font-weight: 600;
}

.comparison-bars {
  display: flex;
  justify-content: space-around;
  align-items: end;
  height: 120px;
  margin-bottom: 1rem;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar {
  width: 40px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 4px;
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  border-radius: 4px;
  transition: height 0.6s ease-out;
}

.bar.normal .bar-fill {
  background: linear-gradient(to top, #22c55e, #16a34a);
}

.bar.emergency .bar-fill {
  background: linear-gradient(to top, #ef4444, #dc2626);
}

.bar-value {
  position: absolute;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  bottom: 4px;
}

.bar-label {
  font-size: 0.75rem;
  color: #374151;
  font-weight: 500;
}

.bar-note {
  font-size: 0.65rem;
  color: #6b7280;
}

.bar-note.critical {
  color: #ef4444;
  font-weight: 600;
}

.impact-note {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 0.75rem;
  color: #92400e;
  font-weight: 500;
  text-align: center;
}

/* 应急状态面板 */
.emergency-status {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.emergency-status h5 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  position: relative;
  transition: all 0.3s ease;
}

.status-item.warning {
  background: #fef3c7;
  border-color: #f59e0b;
}

.status-item.critical {
  background: #fee2e2;
  border-color: #ef4444;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%,
  50%,
  100% {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0.7;
  }
}

.status-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
}

.status-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.status-label {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
  line-height: 1.2;
}

.status-alert {
  font-size: 0.65rem;
  color: #ef4444;
  font-weight: 600;
  background: #fee2e2;
  padding: 1px 4px;
  border-radius: 3px;
  align-self: flex-start;
  margin-top: 0.1rem;
}

/* 对话消息样式 */
.message {
  display: flex;
  margin-bottom: 1.5rem;
  animation: slideIn 0.3s ease-out;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message.ai .message-avatar {
  background: linear-gradient(45deg, #4caf50, #2196f3);
  margin-right: 0.75rem;
}

.message.user .message-avatar {
  background: linear-gradient(45deg, #667eea, #764ba2);
  margin-left: 0.75rem;
}

.message-content {
  max-width: 70%;
  background: #f1f5f9;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  position: relative;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.message.user .message-content {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
}

.message-text {
  margin-bottom: 0.5rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  text-align: right;
  margin-top: 0.25rem;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

/* 加载动画样式 */
.loading-message {
  animation: slideIn 0.3s ease-out;
}

.loading-content {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  max-width: 80%;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0ea5e9;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}
.dot:nth-child(2) {
  animation-delay: -0.16s;
}
.dot:nth-child(3) {
  animation-delay: 0s;
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

.loading-text {
  color: #0369a1;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 500;
}

.loading-progress {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e0f2fe;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9, #0284c7);
  border-radius: 3px;
  animation: progressAnimation 3s ease-in-out infinite;
}

@keyframes progressAnimation {
  0% {
    width: 0%;
  }
  50% {
    width: 60%;
  }
  100% {
    width: 90%;
  }
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.step {
  color: #94a3b8;
  transition: color 0.3s ease;
}

.step.active {
  color: #0369a1;
  font-weight: 600;
}

/* 底部用户输入区域 */
.input-section {
  border-top: 1px solid #e2e8f0;
  background: white;
  padding: 1.5rem;
  flex-shrink: 0;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.input-section.input-visible {
  opacity: 1;
  transform: translateY(0);
}

.input-container {
  max-width: 100%;
}

.user-input {
  width: 100%;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #334155;
  background: #f8fafc;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition:
    border-color 0.3s ease,
    background-color 0.3s ease;
}

.user-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.user-input::placeholder {
  color: #94a3b8;
}

.user-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
}

.help-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #f1f5f9, #e2e8f0);
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  color: #475569;
  font-weight: 500;
}

.help-button:hover:not(:disabled) {
  background: linear-gradient(45deg, #e2e8f0, #cbd5e1);
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.help-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.help-icon {
  font-size: 1rem;
}

/* 🔥 新增：帮助按钮徽章 - 使用蓝色主题 */
.help-badge {
  display: inline-block;
  background: linear-gradient(45deg, #0ea5e9, #0284c7);
  color: white;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  margin-left: 0.5rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(14, 165, 233, 0.3);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.submit-button,
.next-button {
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.submit-button {
  background: linear-gradient(45deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  position: relative;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.next-button {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

/* 按钮内加载动画 */
.button-loading-dots {
  display: inline-flex;
  gap: 3px;
  margin-right: 8px;
}

.button-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  animation: buttonBounce 1.4s infinite ease-in-out;
}

.button-dot:nth-child(1) {
  animation-delay: -0.32s;
}
.button-dot:nth-child(2) {
  animation-delay: -0.16s;
}
.button-dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes buttonBounce {
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

/* 🔥 新增：帮助弹窗样式 */
.help-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.help-dialog {
  background: white;
  border-radius: 20px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.help-dialog-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  border-radius: 20px 20px 0 0;
}

.help-dialog-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.help-dialog-header h3 {
  color: #1e293b;
  font-size: 1.3rem;
  margin: 0;
  font-weight: 600;
  flex: 1;
}

.close-button {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-button:hover {
  background: #e2e8f0;
  color: #334155;
}

.help-dialog-content {
  padding: 2rem;
}

.help-dialog-description {
  color: #475569;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.help-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.help-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.help-option:hover:not(:disabled) {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.help-option.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.help-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.help-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.help-option.disabled:hover {
  transform: none;
  border-color: #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.option-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.option-description {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.option-arrow {
  font-size: 1.5rem;
  color: #94a3b8;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.help-option:hover:not(:disabled) .option-arrow {
  transform: translateX(4px);
  color: #3b82f6;
}

/* 🔥 新增：已使用标记 */
.used-badge {
  display: inline-block;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  margin-left: 0.5rem;
  font-weight: 500;
}

/* 🔥 新增：周期信息 */
.help-cycle-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #0369a1;
  font-weight: 500;
}

.cycle-icon {
  font-size: 1.1rem;
}

.cycle-tip {
  font-size: 0.85rem;
  color: #64748b;
}

/* 自定义问题输入区域 */
.custom-question-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-question-input {
  width: 100%;
  box-sizing: border-box;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #334155;
  background: white;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.custom-question-input:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.custom-question-input::placeholder {
  color: #94a3b8;
}

.custom-question-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.cancel-custom-button,
.submit-custom-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cancel-custom-button {
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.cancel-custom-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.submit-custom-button {
  background: linear-gradient(45deg, #f59e0b, #f97316);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.submit-custom-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

.submit-custom-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 提示信息 */
.help-tip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #92400e;
  animation: slideDown 0.3s ease-out;
}

.tip-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* 🔥 新增：限制提示弹窗 */
.help-limit-dialog {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.limit-dialog-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.help-limit-dialog h3 {
  color: #1e293b;
  font-size: 1.3rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.help-limit-dialog p {
  color: #475569;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.limit-tip {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-top: 1rem;
}

.limit-confirm-button {
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.limit-confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .chart-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .step-five-container {
    border-radius: 8px;
  }

  .chat-scroll-area {
    padding: 1rem;
  }

  .info-card {
    padding: 1rem;
    border-radius: 12px;
  }

  .card-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
  }

  .card-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.1rem;
  }

  .chart-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .status-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .status-item {
    padding: 0.75rem;
  }

  .status-icon {
    font-size: 1rem;
  }

  .status-value {
    font-size: 0.85rem;
  }

  .status-label {
    font-size: 0.7rem;
  }

  .message-content {
    max-width: 85%;
  }

  .loading-content {
    max-width: 90%;
  }

  .input-section {
    padding: 1rem;
  }

  .input-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .action-buttons {
    justify-content: center;
  }

  .loading-text {
    font-size: 0.8rem;
  }

  .progress-steps {
    font-size: 0.7rem;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .comparison-bars {
    height: 100px;
  }

  .bar {
    width: 30px;
    height: 60px;
  }

  .submit-button,
  .next-button {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }

  .confirm-dialog {
    width: 95%;
    padding: 1.5rem;
    max-height: 85vh;
  }

  .dialog-header h3 {
    font-size: 1.1rem;
  }

  .dialog-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.3rem;
  }

  .dialog-content p {
    font-size: 0.9rem;
  }

  .completion-summary {
    padding: 1rem;
  }

  .summary-item {
    font-size: 0.85rem;
  }

  .dialog-warning {
    font-size: 0.8rem;
    padding: 0.75rem;
  }

  .dialog-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .cancel-button,
  .confirm-button {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .warning-content {
    padding: 0.75rem 1rem;
  }

  .warning-text {
    font-size: 0.85rem;
  }

  .help-dialog {
    width: 95%;
    max-height: 90vh;
  }

  .help-dialog-header {
    padding: 1.25rem 1.5rem;
  }

  .help-dialog-header h3 {
    font-size: 1.1rem;
  }

  .help-dialog-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.3rem;
  }

  .help-dialog-content {
    padding: 1.5rem;
  }

  .help-option {
    padding: 1rem;
  }

  .option-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1.1rem;
  }

  .option-title {
    font-size: 0.9rem;
  }

  .option-description {
    font-size: 0.8rem;
  }

  .custom-question-section {
    padding: 1rem;
  }

  .custom-question-actions {
    flex-direction: column;
  }

  .cancel-custom-button,
  .submit-custom-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .chat-scroll-area {
    padding: 0.75rem;
  }

  .input-section {
    padding: 0.75rem;
  }

  .status-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .status-item {
    padding: 0.75rem;
  }

  .card-title {
    font-size: 0.9rem;
  }

  .status-value {
    font-size: 0.8rem;
  }

  .status-label {
    font-size: 0.65rem;
  }

  .confirm-dialog {
    padding: 1rem;
  }

  .dialog-header {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .summary-item {
    font-size: 0.8rem;
  }

  .warning-content {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .warning-icon {
    font-size: 1.3rem;
  }

  .warning-text {
    font-size: 0.8rem;
  }
}

/* ==================== 确认弹窗统一样式 ==================== */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.confirm-dialog {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.dialog-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(45deg, #0ea5e9, #0284c7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.dialog-header h3 {
  color: #1e293b;
  font-size: 1.3rem;
  margin: 0;
  font-weight: 600;
}

.dialog-content {
  margin-bottom: 2rem;
}

.dialog-content p {
  color: #475569;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* 快照预览区域 */
.answer-preview {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 1rem;
  margin: 1.5rem 0;
  animation: slideIn 0.3s ease-out;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(14, 165, 233, 0.2);
}

.preview-icon {
  font-size: 1.2rem;
}

.preview-title {
  font-weight: 600;
  color: #0369a1;
  font-size: 0.95rem;
}

/* 🔥 新增：任务标题样式 */
.task-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e0f2fe;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.task-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.task-text {
  font-size: 0.9rem;
  color: #334155;
  font-weight: 500;
  line-height: 1.4;
}

.preview-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-textarea {
  width: 100%;
  border: 2px solid #0ea5e9;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #334155;
  background: white;
  resize: vertical;
  min-height: 200px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.preview-textarea:focus {
  outline: none;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.preview-hint {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0;
  font-style: italic;
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: #94a3b8;
}

/* 完成摘要 */
.completion-summary {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: #334155;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* 警告提示 */
.dialog-warning {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.9rem;
  color: #92400e;
}

.warning-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* 按钮区域 */
.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-button,
.confirm-button {
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cancel-button {
  background: #f1f5f9;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.cancel-button:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.confirm-button {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.confirm-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.confirm-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .confirm-dialog {
    width: 95%;
    padding: 1.5rem;
    max-height: 85vh;
  }

  .dialog-header h3 {
    font-size: 1.1rem;
  }

  .dialog-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.3rem;
  }

  .dialog-content p {
    font-size: 0.9rem;
  }

  .completion-summary {
    padding: 1rem;
  }

  .summary-item {
    font-size: 0.85rem;
  }

  .dialog-warning {
    font-size: 0.8rem;
    padding: 0.75rem;
  }

  .dialog-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .cancel-button,
  .confirm-button {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .task-title {
    padding: 0.5rem 0.75rem;
  }

  .task-text {
    font-size: 0.85rem;
  }
}
</style>
