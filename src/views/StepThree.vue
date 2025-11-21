<template>
  <div class="step-three-container">
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
            <div class="card-icon">⚡</div>
            <div class="card-title">
              基于Step2的问题分析，现在需要制定具体的节能策略。
              教室面临的主要挑战包括：40人产生的热量、35℃的高温、
              空调3.2kW的高耗电、以及有限的自然通风条件。 你能提出哪些切实可行的解决方案？
            </div>
          </div>

          <div class="card-content">
            <div class="chart-section">
              <h4>💡 策略制定参考数据：</h4>
              <div class="chart-container">
                <!-- 节能策略对比表 -->
                <div class="strategy-comparison">
                  <h5>⭐ 常见节能策略效果对比</h5>
                  <div class="strategy-table">
                    <div class="strategy-row header">
                      <div class="strategy-cell">策略类型</div>
                      <div class="strategy-cell">节能效果</div>
                      <div class="strategy-cell">实施成本</div>
                      <div class="strategy-cell">适用条件</div>
                    </div>
                    <div class="strategy-row">
                      <div class="strategy-cell"><span class="strategy-icon">🌬️</span>自然通风</div>
                      <div class="strategy-cell"><div class="effect-bar high">高</div></div>
                      <div class="strategy-cell"><div class="cost-indicator low">低</div></div>
                      <div class="strategy-cell">有风天气</div>
                    </div>
                    <div class="strategy-row">
                      <div class="strategy-cell"><span class="strategy-icon">❄️</span>智能空调</div>
                      <div class="strategy-cell"><div class="effect-bar medium">中</div></div>
                      <div class="strategy-cell"><div class="cost-indicator medium">中</div></div>
                      <div class="strategy-cell">全天候</div>
                    </div>
                    <div class="strategy-row">
                      <div class="strategy-cell"><span class="strategy-icon">🕐</span>错峰使用</div>
                      <div class="strategy-cell"><div class="effect-bar medium">中</div></div>
                      <div class="strategy-cell"><div class="cost-indicator low">低</div></div>
                      <div class="strategy-cell">可调度时</div>
                    </div>
                    <div class="strategy-row">
                      <div class="strategy-cell"><span class="strategy-icon">🌡️</span>节能分区</div>
                      <div class="strategy-cell"><div class="effect-bar high">高</div></div>
                      <div class="strategy-cell"><div class="cost-indicator high">高</div></div>
                      <div class="strategy-cell">改造期</div>
                    </div>
                  </div>
                </div>

                <!-- 决策要素分析 -->
                <div class="decision-factors">
                  <h5>🎯 策略选择要素</h5>
                  <div class="factors-grid">
                    <div class="factor-item">
                      <span class="factor-icon">🌤️</span>
                      <div class="factor-content">
                        <div class="factor-title">天气适应性</div>
                        <div class="factor-desc">不同天气条件下的有效性</div>
                      </div>
                    </div>
                    <div class="factor-item">
                      <span class="factor-icon">💰</span>
                      <div class="factor-content">
                        <div class="factor-title">成本效益</div>
                        <div class="factor-desc">初期投入vs长期节省</div>
                      </div>
                    </div>
                    <div class="factor-item">
                      <span class="factor-icon">⚡</span>
                      <div class="factor-content">
                        <div class="factor-title">能耗效率</div>
                        <div class="factor-desc">单位时间节能量</div>
                      </div>
                    </div>
                    <div class="factor-item">
                      <span class="factor-icon">🔧</span>
                      <div class="factor-content">
                        <div class="factor-title">实施难度</div>
                        <div class="factor-desc">技术要求和操作复杂度</div>
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
              <strong>论证与策略制定阶段：</strong>
              根据你获得的数据，能否提出两个可能的节能策略？它们分别的优劣是什么？ <br /><br />
              请考虑：效果、成本、适用性、可操作性等多个维度来分析你的方案。
            </div>
          </div>
        </div>

        <!-- 动态对话消息 - 过滤掉system类型 -->
        <div
          v-for="message in messages.filter((m) => m.type !== 'system')"
          :key="message.id"
          :class="['message', message.type]"
        >
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
              <div class="loading-text">AI正在分析策略方案，预计需要15-30秒...</div>
              <div class="loading-progress">
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <div class="progress-steps">
                  <span class="step active">📝 理解策略</span>
                  <span class="step" :class="{ active: loadingStep >= 2 }">⚖️ 对比分析</span>
                  <span class="step" :class="{ active: loadingStep >= 3 }">💡 优化建议</span>
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
              继续下一步 →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔥 帮助弹窗 -->
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

    <!-- 🔥 帮助次数用尽提示 -->
    <div v-if="showHelpLimitDialog" class="help-dialog-overlay" @click="closeHelpLimitDialog">
      <div class="help-limit-dialog" @click.stop>
        <div class="limit-dialog-icon">⚠️</div>
        <h3>帮助次数已用完</h3>
        <p>您已使用完所有的帮助次数（{{ helpSystem.maxCycles }} 次）。</p>
        <p class="limit-tip">请继续独立完成剩余的任务，或点击"提交回答"按钮提交您的答案。</p>
        <button class="limit-confirm-button" @click="closeHelpLimitDialog">知道了</button>
      </div>
    </div>

    <!-- 🔥 周期内帮助已用尽提示 -->
    <div v-if="showCycleLimitDialog" class="help-dialog-overlay" @click="closeCycleLimitDialog">
      <div class="help-limit-dialog" @click.stop>
        <div class="limit-dialog-icon">🔄</div>
        <h3>当前周期的帮助已全部使用</h3>
        <p>您已使用完当前周期的3种帮助方式。</p>
        <p class="limit-tip">
          请先提交您的答案，提交后将开启新的帮助周期。
          <br />
          剩余帮助周期：<strong>{{ helpSystem.maxCycles - helpSystem.totalCycles }}</strong> 次
        </p>
        <button class="limit-confirm-button" @click="closeCycleLimitDialog">知道了</button>
      </div>
    </div>

    <!-- 🔥 修改：确认弹窗 - 可编辑版本 -->
    <div v-if="showConfirmDialog" class="confirm-dialog-overlay" @click="closeConfirmDialog">
      <div class="confirm-dialog" @click.stop>
        <div class="dialog-header">
          <div class="dialog-icon">🎯</div>
          <h3>确认进入下一步</h3>
        </div>
        <div class="dialog-content">
          <p>您即将完成策略制定阶段，进入下一个学习环节。请确认或修改您的最终策略方案。</p>

          <!-- 🔥 新增：可编辑的快照区域 -->
          <div v-if="editableFinalAnswer" class="answer-preview">
            <div class="preview-header">
              <span class="preview-icon">📝</span>
              <span class="preview-title">本步骤的最终内容（可编辑）</span>
            </div>
            <div class="preview-body">
              <textarea
                v-model="editableFinalAnswer"
                class="preview-textarea"
                rows="10"
                placeholder="请输入或修改你的最终策略方案..."
              ></textarea>
              <p class="preview-hint">💡 这是您最后一次修改机会，请仔细检查后点击"确定继续"。</p>
              <div class="char-count">字数：{{ editableFinalAnswer.length }} 字符</div>
            </div>
          </div>

          <div class="completion-summary">
            <div class="summary-item">
              <span class="summary-icon">💬</span>
              <span>进行了 {{ conversationCount }} 轮策略讨论</span>
            </div>
            <div class="summary-item" v-if="answerSubmitted">
              <span class="summary-icon">✅</span>
              <span>已提交节能策略方案</span>
            </div>
            <div class="summary-item" v-if="isConversationLimitReached">
              <span class="summary-icon">⏰</span>
              <span>已达到最大对话轮次限制</span>
            </div>
          </div>
          <div class="dialog-warning">
            <span class="warning-icon">⚠️</span>
            <span>进入下一步后，您将无法返回修改当前的策略方案。</span>
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
import { trackStep3Event } from '../../src/utils/tracking'

// 🔥 新增：最终答案快照相关
const finalAnswerSnapshot = ref('') // 本步最终答案快照
const finalAnswerConfirmed = ref(false) // 是否已确认最终答案
const editableFinalAnswer = ref('') // 可编辑的最终答案（用于弹窗中编辑）

// 🔥 新增：帮助系统状态管理
const helpSystem = reactive({
  totalCycles: 0, // 已使用的周期数
  maxCycles: 4, // 最大周期数
  currentCycleUsed: {
    // 当前周期内已使用的模式
    refine: false,
    example: false,
    custom: false,
  },
  isInCycle: false, // 是否在帮助周期中
})

// 计算属性：帮助功能是否可用
const canUseHelp = computed(() => {
  return helpSystem.totalCycles < helpSystem.maxCycles
})

// 计算属性：当前周期剩余可用模式
const availableHelpModes = computed(() => {
  return {
    refine: !helpSystem.currentCycleUsed.refine,
    example: !helpSystem.currentCycleUsed.example,
    custom: !helpSystem.currentCycleUsed.custom,
  }
})

// 计算属性：当前周期是否还有可用模式
const hasAvailableModesInCycle = computed(() => {
  return Object.values(availableHelpModes.value).some((available) => available)
})

// 定义组件通信
const emit = defineEmits(['update-progress', 'show-next-steps'])

const router = useRouter()

// 帮助弹窗相关状态
const showHelpDialog = ref(false)
const helpMode = ref<'refine' | 'example' | 'custom' | null>(null)
const customQuestion = ref('')

// 🔥 新增：限制提示弹窗状态
const showHelpLimitDialog = ref(false)
const showCycleLimitDialog = ref(false)

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

// 🔥 新增：关闭限制提示弹窗的函数
const closeHelpLimitDialog = () => {
  showHelpLimitDialog.value = false
}

const closeCycleLimitDialog = () => {
  showCycleLimitDialog.value = false
}

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

// 定义API响应类型
interface APIResponse {
  response: string
  metadata?: {
    step?: number
    stage?: number
    guidanceMode?: string
    suggestsCompletion?: boolean
  }
}

// 🔥 定义 event_data 的类型
interface EventData {
  helpMode?: 'refine' | 'example' | 'custom'
  customQuestion?: string
  actualRequest?: string
  answerLength?: number
  stage?: number
  currentInputLength?: number
  hasInput?: boolean
  userDisplayMessage?: string
  helpCycle?: number
  availableModes?: string
  cycleUsedModes?: string
  remainingCycles?: number
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
  event_data?: EventData
}

// 🔥 定义 Step3 数据结构
interface Step3Data {
  sessionId: string
  conversationCount: number
  stageCompletionStatus: boolean[]
  messages: StoredMessage[]
  currentStage: number
  isCompleted: boolean
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
  // 🔥 新增快照字段
  finalAnswerSnapshot?: string
  finalAnswerConfirmed?: boolean
}

// 🔥 从存储中恢复或初始化对话数据
const rawStepData = simpleStorage.getStepData(3) as Step3Data | null

const conversationData = reactive<{
  sessionId: string
  conversationCount: number
  stageCompletionStatus: boolean[]
  messages: Message[]
  currentStage: number
  isCompleted: boolean
}>(
  rawStepData
    ? {
        sessionId: rawStepData.sessionId,
        conversationCount: rawStepData.conversationCount,
        stageCompletionStatus: rawStepData.stageCompletionStatus,
        messages: rawStepData.messages.map(
          (msg: StoredMessage): Message => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            step: msg.step || 3,
            stage: msg.stage || 1,
            timestamp: msg.timestamp,
          }),
        ),
        currentStage: 1, // Step3 始终为单阶段
        isCompleted: rawStepData.isCompleted || false,
      }
    : {
        sessionId: simpleStorage.getSessionId(),
        conversationCount: 0,
        stageCompletionStatus: [false],
        messages: [],
        currentStage: 1,
        isCompleted: false,
      },
)

// 🔥 恢复帮助系统状态
if (rawStepData?.helpSystem) {
  Object.assign(helpSystem, rawStepData.helpSystem)
}

// 🔥 新增：恢复快照数据
if (rawStepData?.finalAnswerSnapshot) {
  finalAnswerSnapshot.value = rawStepData.finalAnswerSnapshot
}
if (rawStepData?.finalAnswerConfirmed !== undefined) {
  finalAnswerConfirmed.value = rawStepData.finalAnswerConfirmed
}

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

// 🔥 对话轮次控制（修改为5）
const MAX_CONVERSATIONS = 5

// 计算属性
const conversationCount = computed(() => conversationData.conversationCount)
const currentStage = computed(() => conversationData.currentStage)
const messages = computed(() => conversationData.messages)

const canSubmit = computed(() => userAnswer.value.trim().length > 0)
const isConversationLimitReached = computed(() => conversationCount.value >= MAX_CONVERSATIONS)

const inputPlaceholder = computed(() => {
  if (isConversationLimitReached.value) {
    return '已达到最大对话轮次，请点击"继续下一步"进入下一阶段'
  }
  return '请提出两个具体的节能策略，并分析它们的优劣......'
})

// 滚动容器引用
const chatScrollArea = ref<HTMLElement | null>(null)

// 🔥 监听对话轮次变化（修改阈值为4）
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
    await trackStep3Event(
      'step3_conversation_limit_reached',
      conversationData.sessionId,
      currentStage.value,
      newCount,
      {
        finalStage: currentStage.value,
      },
    )
  }
})

// 🔥 保存帮助系统状态到 localStorage
function saveHelpSystemState() {
  const stepData = simpleStorage.getStepData(3) as Step3Data | null
  if (stepData) {
    stepData.helpSystem = {
      totalCycles: helpSystem.totalCycles,
      maxCycles: helpSystem.maxCycles,
      currentCycleUsed: { ...helpSystem.currentCycleUsed },
      isInCycle: helpSystem.isInCycle,
    }
    simpleStorage.saveStepData(3, stepData)
    console.log('💾 Step3 - 帮助系统状态已保存')
  }
}

// 🔥 核心提交函数
async function submitAnswer() {
  if (!canSubmit.value || isConversationLimitReached.value) return

  simpleStorage.updateConversationCount(3, conversationData.conversationCount + 1)
  conversationData.conversationCount += 1

  addMessage('user', userAnswer.value, currentStage.value)

  // 🔥 新增：保存本轮输入作为快照
  const currentAnswer = userAnswer.value
  finalAnswerSnapshot.value = currentAnswer

  // 🔥 重置帮助周期
  if (helpSystem.isInCycle) {
    console.log(`🔄 Step3 - 重置帮助周期，已使用周期数: ${helpSystem.totalCycles}`)
    helpSystem.isInCycle = false
    helpSystem.currentCycleUsed = {
      refine: false,
      example: false,
      custom: false,
    }
    saveHelpSystemState()
  }

  // 🔥 埋点 - 提交答案
  await trackStep3Event(
    'step3_answer_submit',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      answerLength: userAnswer.value.length,
      stage: currentStage.value,
    },
  )

  userAnswer.value = ''
  isGenerating.value = true
  loadingStep.value = 1

  const stepInterval = setInterval(() => {
    if (loadingStep.value < 3) {
      loadingStep.value++
    }
  }, 5000)

  try {
    const response = await callAIAPI(currentAnswer)
    clearInterval(stepInterval)

    addMessage('ai', response)

    answerSubmitted.value = true

    saveToStorage()

    emit('update-progress', 3)
    emit('show-next-steps')
  } catch (error) {
    clearInterval(stepInterval)
    console.error('❌ Step3 - AI API 调用失败:', error)
    addMessage('ai', '抱歉，系统暂时无法处理您的回答，请稍后重试。')
    saveToStorage()
  } finally {
    isGenerating.value = false
    loadingStep.value = 1
  }
}

// 🔥 打开帮助弹窗
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
    console.log(`🆕 Step3 - 开启第 ${helpSystem.totalCycles} 个帮助周期`)
  }

  // 检查当前周期是否还有可用模式
  if (!hasAvailableModesInCycle.value) {
    showCycleLimitDialog.value = true
    return
  }

  // 🔥 埋点 - 点击帮助按钮
  trackStep3Event(
    'step3_help_button_click',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      currentInputLength: userAnswer.value.length,
      hasInput: userAnswer.value.length > 0,
      helpCycle: helpSystem.totalCycles,
      availableModes: Object.entries(availableHelpModes.value)
        .filter(([_, available]) => available)
        .map(([mode]) => mode)
        .join(','),
    },
  )

  showHelpDialog.value = true
}

// 关闭帮助弹窗
function closeHelpDialog() {
  showHelpDialog.value = false
  helpMode.value = null
  customQuestion.value = ''
}

// 🔥 选择帮助模式
function selectHelpMode(mode: 'refine' | 'example' | 'custom') {
  if (!availableHelpModes.value[mode]) {
    console.log(`❌ Step3 - 模式 ${mode} 在当前周期已使用`)
    return
  }

  helpMode.value = mode

  if (mode !== 'custom') {
    executeHelp(mode)
  }
}

// 提交自定义问题
function submitCustomQuestion() {
  if (!customQuestion.value.trim()) {
    return
  }
  executeHelp('custom', customQuestion.value)
}

// 🔥 执行帮助请求
async function executeHelp(mode: 'refine' | 'example' | 'custom', customQuestionText?: string) {
  showHelpDialog.value = false

  // 标记该模式在当前周期已使用
  helpSystem.currentCycleUsed[mode] = true
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

  // 显示用户的帮助请求消息
  addMessage('user', userDisplayMessage, currentStage.value)

  // 增加对话计数
  simpleStorage.updateConversationCount(3, conversationData.conversationCount + 1)
  conversationData.conversationCount += 1

  // 🔥 埋点 - 使用帮助
  await trackStep3Event(
    'step3_help_request',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      helpMode: mode,
      helpCycle: helpSystem.totalCycles,
      cycleUsedModes: Object.entries(helpSystem.currentCycleUsed)
        .filter(([_, used]) => used)
        .map(([mode]) => mode)
        .join(','),
      remainingCycles: helpSystem.maxCycles - helpSystem.totalCycles,
    },
  )

  isGenerating.value = true
  loadingStep.value = 1

  const stepInterval = setInterval(() => {
    if (loadingStep.value < 2) {
      loadingStep.value++
    }
  }, 2000)

  try {
    const helpResponse = await callEnhancedHelpAPI(mode, customQuestionText, helpRequestContent)

    clearInterval(stepInterval)

    addMessage('ai', helpResponse, currentStage.value)

    await saveConversationToDB({
      sessionId: conversationData.sessionId,
      step: 3,
      stage: currentStage.value,
      userInput: userDisplayMessage,
      aiResponse: helpResponse,
      conversationCount: conversationData.conversationCount,
      timestamp: new Date(),
      context: `stage_${currentStage.value}_${helpContextType}`,
      event_data: {
        helpMode: mode,
        customQuestion: mode === 'custom' ? customQuestionText : undefined,
        actualRequest: helpRequestContent,
      },
    })

    saveToStorage()
  } catch (error) {
    clearInterval(stepInterval)
    console.error('❌ Step3 - 获取智能帮助失败:', error)

    const fallbackTexts: Record<string, string> = {
      refine: '试着从多个维度分析策略的优劣，比如成本、效果、适用性等。',
      example: '想想自然通风和智能空调各有什么特点？它们适合在什么情况下使用？',
      custom: '根据你的问题，建议从策略对比和实际应用场景的角度来思考。',
    }

    addMessage('ai', fallbackTexts[mode] || fallbackTexts.custom, currentStage.value)
    saveToStorage()
  } finally {
    isGenerating.value = false
    loadingStep.value = 1

    helpMode.value = null
    customQuestion.value = ''
  }
}

// 🔥 调用增强的帮助API
async function callEnhancedHelpAPI(
  helpMode: 'refine' | 'example' | 'custom' = 'custom',
  customQuestionText?: string,
  helpRequestContent?: string,
): Promise<string> {
  try {
    const conversationHistory = conversationData.messages
      .filter((msg) => msg.step === 3)
      .map((msg) => ({
        type: msg.type,
        content: msg.content,
        step: msg.step,
        stage: msg.stage || 1,
        timestamp: msg.timestamp,
      }))

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

    console.log('📤 Step3 智能帮助 - 发送对话历史:', {
      count: conversationHistory.length,
      helpMode,
      history: conversationHistory,
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
          recentQuestions: getRecentAIQuestions(conversationData.messages, 3),
          strategyFocus: true,
          currentStage: currentStage.value,
        },
        step: 3,
        stage: currentStage.value,
        sessionId: conversationData.sessionId,
        conversationHistory,
        followUpContext: {
          currentStage: currentStage.value,
          conversationCount: conversationData.conversationCount,
          isSmartHintRequest: true,
          helpType:
            helpMode === 'refine'
              ? 'refine_content'
              : helpMode === 'example'
                ? 'request_example'
                : 'custom_question',
          needsGuidance: true,
          needsContinuity: true,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()

    console.log('📥 Step3 智能帮助 - 收到响应:', {
      response: data.response,
      isSmartHint: data.metadata?.isSmartHint,
      helpMode,
    })

    return data.response || '根据你目前的思考，试着从策略对比和实施可行性的角度来分析。'
  } catch (error) {
    console.error('❌ Step3 - 智能帮助API调用失败:', error)
    throw error
  }
}

const handleInput = () => {
  // 输入处理
}

const handleNextStep = () => {
  // 🔥 初始化可编辑内容为当前快照
  editableFinalAnswer.value = finalAnswerSnapshot.value
  showConfirmDialog.value = true
}

const closeConfirmDialog = () => {
  showConfirmDialog.value = false
}

// 🔥 确认进入下一步
const confirmNextStep = async () => {
  // 🔥 使用编辑后的内容作为最终快照
  finalAnswerSnapshot.value = editableFinalAnswer.value.trim()
  finalAnswerConfirmed.value = true
  showConfirmDialog.value = false

  // 🔥 1. 保存到 localStorage（Step6 会读取）
  simpleStorage.setItem('step3_final_answer', {
    content: finalAnswerSnapshot.value,
    confirmedAt: new Date().toISOString(),
  })

  // 🔥 2. 埋点 - 点击继续下一步
  await trackStep3Event(
    'step3_next_step_click',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      answerSubmitted: answerSubmitted.value,
      finalAnswerLength: finalAnswerSnapshot.value.length,
      wasEdited: editableFinalAnswer.value !== finalAnswerSnapshot.value,
    },
  )

  // 🔥 3. 保存到 storage（包含快照）
  saveToStorage()

  // 🔥 4. 跳转下一步
  goToNextStep()
}

const goToNextStep = () => {
  simpleStorage.updateCurrentStep(4)
  saveProgressToLocal()
  router.push('/experiment/step4')
}

// 🔥 添加消息
const addMessage = (type: 'ai' | 'user' | 'system', content: string, stage?: number) => {
  const messageId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const message: Message = {
    id: messageId,
    type,
    content,
    step: 3,
    stage: stage || 1,
    timestamp: new Date(),
  }

  messages.value.push(message)

  simpleStorage.addMessage(3, type, content, stage || 1)

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
    completedAt: new Date().toISOString(),
  }

  localStorage.setItem('step3_progress', JSON.stringify(progressData))
}

// 🔥 获取最近问题用于上下文
const getRecentAIQuestions = (messages: Message[], count = 2): string => {
  return messages
    .filter((m) => m.type === 'ai')
    .slice(-count)
    .map((m) => m.content)
    .join('；')
}

// 🔥 API 调用函数
const callAIAPI = async (answer: string): Promise<string> => {
  try {
    const sessionId = simpleStorage.getSessionId()

    const conversationHistory = conversationData.messages
      .filter((msg) => msg.step === 3)
      .map((msg) => ({
        type: msg.type,
        content: msg.content,
        step: msg.step,
        stage: msg.stage || 1,
        timestamp: msg.timestamp,
      }))

    console.log('📤 Step3 - 发送给后端的对话历史:', {
      count: conversationHistory.length,
      history: conversationHistory,
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
          recentQuestions: getRecentAIQuestions(conversationData.messages, 3),
          isExam: false,
          requireQuiet: false,
          strategyFocus: true,
        },
        step: 3,
        stage: 1,
        sessionId: sessionId,
        conversationHistory,
        followUpContext: {
          conversationCount: conversationData.conversationCount,
          needsContinuity: true,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()

    console.log('📥 Step3 - 收到后端响应:', {
      response: data.response?.substring(0, 100) + (data.response?.length > 100 ? '...' : ''),
      metadata: data.metadata,
    })

    const aiResponse = data.response || '请继续阐述你的策略思路。'

    await saveConversationToDB({
      sessionId: conversationData.sessionId,
      step: 3,
      stage: 1,
      userInput: answer,
      aiResponse: aiResponse,
      conversationCount: conversationData.conversationCount,
      timestamp: new Date(),
      context: 'strategy_development',
    })

    return aiResponse
  } catch (error) {
    console.error('❌ Step3 - AI API 调用失败:', error)
    const fallbackResponse = '请继续阐述你的策略思路。'

    await saveConversationToDB({
      sessionId: conversationData.sessionId,
      step: 3,
      stage: 1,
      userInput: answer,
      aiResponse: fallbackResponse,
      conversationCount: conversationData.conversationCount,
      timestamp: new Date(),
      context: 'strategy_development_fallback',
    })

    return fallbackResponse
  }
}

// 🔥 保存对话到数据库
const saveConversationToDB = async (conversationDataPayload: ConversationData): Promise<void> => {
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
        ...conversationDataPayload,
        experimentId,
        studentName,
      }),
    })

    console.log('✅ Step3 - 对话已保存到数据库')
  } catch (error) {
    console.error('❌ Step3 - 保存对话失败:', error)
  }
}

const saveToStorage = () => {
  const stepData = {
    sessionId: conversationData.sessionId,
    conversationCount: conversationData.conversationCount,
    stageCompletionStatus: [answerSubmitted.value],
    messages: messages.value.map((msg) => ({
      id: msg.id || `msg_${Date.now()}`,
      type: msg.type,
      content: msg.content,
      timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString(),
      step: 3,
      stage: 1,
    })),
    currentStage: 1,
    isCompleted: answerSubmitted.value,
    helpSystem: {
      totalCycles: helpSystem.totalCycles,
      maxCycles: helpSystem.maxCycles,
      currentCycleUsed: { ...helpSystem.currentCycleUsed },
      isInCycle: helpSystem.isInCycle,
    },
    // 🔥 新增：保存快照
    finalAnswerSnapshot: finalAnswerSnapshot.value,
    finalAnswerConfirmed: finalAnswerConfirmed.value,
  }

  simpleStorage.saveStepData(3, stepData)

  console.log('💾 Step3 - 数据已保存到存储:', {
    conversationCount: stepData.conversationCount,
    messagesCount: stepData.messages.length,
    hasSnapshot: !!finalAnswerSnapshot.value,
    snapshotLength: finalAnswerSnapshot.value.length,
  })
}

// 生命周期
const showContentSequentially = async () => {
  const stepData = simpleStorage.getStepData(3) as Step3Data | null
  if (stepData) {
    conversationData.conversationCount = stepData.conversationCount || 0
    answerSubmitted.value = stepData.isCompleted || false

    conversationData.messages = stepData.messages.map(
      (msg: StoredMessage): Message => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        step: msg.step || 3,
        stage: msg.stage || 1,
        timestamp: msg.timestamp,
      }),
    )

    console.log('💾 Step3 - 从存储恢复数据:', {
      conversationCount: conversationData.conversationCount,
      messagesCount: conversationData.messages.length,
    })
  }

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

// 🔥 组件挂载时
onMounted(async () => {
  console.log('🎬 Step3 组件已挂载')

  // 🔥 埋点 - 进入 Step3
  await trackStep3Event(
    'step3_enter',
    conversationData.sessionId,
    conversationData.currentStage,
    conversationData.conversationCount,
    {
      initialStage: conversationData.currentStage,
      hasHistory: conversationData.messages.length > 0,
    },
  )

  showContentSequentially()
})
</script>

<style scoped>
/* ==================== 基础容器 ==================== */
.step-three-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffffdd;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

/* ==================== 对话轮次限制警告 ==================== */
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
  max-height: 0;
  overflow: hidden;
}

.conversation-limit-warning.warning-visible {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
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

/* ==================== 对话滚动区域 ==================== */
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

/* ==================== 对话消息区域 ==================== */
.chat-messages {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ==================== 信息卡片样式 ==================== */
.info-card-section {
  flex-shrink: 0;
}

.info-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 20px;
  padding: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
  position: relative;
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
  position: relative;
}

.card-icon {
  background: linear-gradient(45deg, #0ea5e9, #0284c7);
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.card-title {
  color: #0c4a6e;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 500;
  flex: 1;
}

.card-content h4 {
  color: #0c4a6e;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: flex-start;
}

/* 策略对比表 */
.strategy-comparison h5,
.decision-factors h5 {
  color: #374151;
  font-size: 0.85rem;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  text-align: center;
  padding: 0.5rem;
  background: rgba(14, 165, 233, 0.1);
  border-radius: 6px;
  border-left: 3px solid #0ea5e9;
}

.strategy-comparison {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.strategy-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.strategy-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 0.5rem;
  align-items: center;
}

.strategy-row.header {
  font-weight: 600;
  font-size: 0.75rem;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.strategy-cell {
  padding: 0.5rem 0.25rem;
  font-size: 0.75rem;
  text-align: center;
}

.strategy-icon {
  margin-right: 0.25rem;
}

.effect-bar,
.cost-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.7rem;
}

.effect-bar.high,
.cost-indicator.high {
  background: #fef3c7;
  color: #92400e;
}

.effect-bar.medium,
.cost-indicator.medium {
  background: #dbeafe;
  color: #1e40af;
}

.effect-bar.low,
.cost-indicator.low {
  background: #d1fae5;
  color: #065f46;
}

/* 决策要素分析 */
.decision-factors {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.factors-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.factor-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.factor-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.factor-content {
  flex: 1;
}

.factor-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.factor-desc {
  font-size: 0.7rem;
  color: #6b7280;
  line-height: 1.3;
}

/* ==================== 对话消息样式 ==================== */
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

/* ==================== 加载动画样式 ==================== */
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

/* ==================== 底部用户输入区域 ==================== */
.input-section {
  border-top: 1px solid #e2e8f0;
  background: white;
  padding: 1.5rem;
  flex-shrink: 0;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
  width: 100%;
}

.input-section.input-visible {
  opacity: 1;
  transform: translateY(0);
}

.input-container {
  width: 100%;
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
  box-sizing: border-box;
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
  width: 100%;
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

/* 🔥 修改：帮助按钮徽章 - 改为低调的蓝色 */
.help-badge {
  display: inline-block;
  background: linear-gradient(45deg, #0ea5e9, #0284c7); /* 改为蓝色 */
  color: white;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  margin-left: 0.5rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(14, 165, 233, 0.3); /* 改为蓝色阴影 */
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
  background: linear-gradient(45deg, #0ea5e9, #0284c7);
  color: white;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  position: relative;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
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

/* ==================== 帮助弹窗样式 ==================== */
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

/* ==================== 帮助限制提示弹窗 ==================== */
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
  font-size: 1.2rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.help-limit-dialog p {
  color: #475569;
  font-size: 0.95rem;
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
  margin-top: 1.5rem;
}

.limit-confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

/* ==================== 确认弹窗样式 ==================== */
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

.confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

/* ==================== 动画 ==================== */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .chart-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .factors-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .strategy-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
    text-align: left;
  }

  .strategy-row.header {
    display: none;
  }

  .strategy-cell {
    text-align: left;
    padding: 0.25rem;
  }

  .message-content {
    max-width: 85%;
  }

  .loading-content {
    max-width: 90%;
  }

  .input-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .action-buttons {
    justify-content: center;
  }

  .help-dialog {
    width: 95%;
    max-height: 90vh;
  }

  .help-dialog-header {
    padding: 1.25rem 1.5rem;
  }

  .help-dialog-content {
    padding: 1.5rem;
  }

  .help-option {
    padding: 1rem;
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

  .confirm-dialog {
    width: 95%;
    padding: 1.5rem;
  }

  .dialog-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .cancel-button,
  .confirm-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
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

/* 🔥 快照预览区域 */
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

/* 确保确认按钮禁用状态 */
.confirm-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
