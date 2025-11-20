<template>
  <div class="step-two-container">
    <!-- 对话轮次限制提示 -->
    <div
      v-if="conversationCount >= 7"
      class="conversation-limit-warning"
      :class="{ 'warning-visible': showConversationWarning }"
    >
      <div class="warning-content">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <span v-if="conversationCount === 7">您已经进行了7轮对话，还有1次提交机会</span>
          <span v-else>您已达到最大对话次数（8轮），请点击"继续下一步"按钮进入下一阶段</span>
        </div>
      </div>
    </div>

    <!-- 对话滚动区域 -->
    <div class="chat-scroll-area" ref="chatScrollArea">
      <!-- 信息卡片区域 -->
      <div class="info-card-section">
        <div class="info-card" :class="{ 'card-visible': showInfoCard }">
          <div class="card-header">
            <div class="card-icon">🌡️</div>
            <div class="card-title">
              随着夏季来临，学校教室变得越来越闷热。你们班有40个学生，教室面积约60㎡，
              每天上午10点后教室温度就超过28℃，下午最高能达到35℃。空调一开就是整天，
              电费直线上升。老师说如果继续这样下去，学校的电费预算会超支，
              可能影响其他教学设备的购买...
            </div>
          </div>

          <div class="card-content">
            <div class="chart-section">
              <h4>教室环境监测数据：</h4>
              <div class="chart-container">
                <!-- 温度变化图表 -->
                <div class="temperature-chart">
                  <h5>🌡️ 教室温度变化趋势图</h5>
                  <svg viewBox="0 0 400 120" class="chart-svg">
                    <!-- 背景网格 -->
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path
                          d="M 20 0 L 0 0 0 20"
                          fill="none"
                          stroke="#e0e4e7"
                          stroke-width="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    <!-- 温度上升曲线 -->
                    <path
                      d="M 30 90 Q 100 85 150 70 T 250 45 T 350 25"
                      fill="none"
                      stroke="#ef4444"
                      stroke-width="3"
                    />

                    <!-- 舒适温度线 -->
                    <line
                      x1="30"
                      y1="75"
                      x2="350"
                      y2="75"
                      stroke="#22c55e"
                      stroke-width="2"
                      stroke-dasharray="5,5"
                    />

                    <!-- 数据点 -->
                    <circle cx="30" cy="90" r="4" fill="#22c55e" />
                    <circle cx="150" cy="70" r="4" fill="#f59e0b" />
                    <circle cx="250" cy="45" r="4" fill="#ef4444" />
                    <circle cx="350" cy="25" r="4" fill="#dc2626" />

                    <!-- 标签 -->
                    <text x="30" y="110" text-anchor="middle" class="chart-label">8:00</text>
                    <text x="150" y="110" text-anchor="middle" class="chart-label">10:00</text>
                    <text x="250" y="110" text-anchor="middle" class="chart-label">14:00</text>
                    <text x="350" y="110" text-anchor="middle" class="chart-label">16:00</text>

                    <!-- 温度标签 -->
                    <text x="380" y="95" class="temp-label">22℃</text>
                    <text x="380" y="75" class="temp-label">25℃</text>
                    <text x="380" y="50" class="temp-label">30℃</text>
                    <text x="380" y="30" class="temp-label">35℃</text>
                  </svg>
                </div>

                <!-- 教室状态面板 -->
                <div class="classroom-status">
                  <h5>🏫 教室环境实时监测数据</h5>
                  <div class="status-grid">
                    <div class="status-item">
                      <span class="status-icon">👥</span>
                      <span class="status-value">40人</span>
                      <span class="status-label">在座学生</span>
                    </div>
                    <div class="status-item">
                      <span class="status-icon">📐</span>
                      <span class="status-value">60㎡</span>
                      <span class="status-label">教室面积</span>
                    </div>
                    <div class="status-item">
                      <span class="status-icon">🌬️</span>
                      <span class="status-value">2.1m/s</span>
                      <span class="status-label">室外风速</span>
                    </div>
                    <div class="status-item">
                      <span class="status-icon">🧭</span>
                      <span class="status-value">西南风</span>
                      <span class="status-label">风向</span>
                    </div>
                    <div class="status-item">
                      <span class="status-icon">💨</span>
                      <span class="status-value">65%</span>
                      <span class="status-label">湿度</span>
                    </div>
                    <div class="status-item">
                      <span class="status-icon">⚡</span>
                      <span class="status-value">3.2kW</span>
                      <span class="status-label">空调功率</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 环境标准参考 -->
              <div class="reference-standards">
                <h4>💡 环境舒适度参考标准：</h4>
                <div class="standards-grid">
                  <div class="standard-item">
                    <span class="standard-icon">🌡️</span>
                    <span class="standard-range">20-26℃</span>
                    <span class="standard-label">舒适温度</span>
                  </div>
                  <div class="standard-item">
                    <span class="standard-icon">💧</span>
                    <span class="standard-range">40-70%</span>
                    <span class="standard-label">适宜湿度</span>
                  </div>
                  <div class="standard-item">
                    <span class="standard-icon">🌊</span>
                    <span class="standard-range">≤1000ppm</span>
                    <span class="standard-label">CO₂浓度</span>
                  </div>
                  <div class="standard-item">
                    <span class="standard-icon">💨</span>
                    <span class="standard-range">0.1-0.3m/s</span>
                    <span class="standard-label">室内风速</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 阶段进度指示器 -->
      <div class="stage-progress" :class="{ 'stage-visible': showStageProgress }">
        <div class="progress-container">
          <div class="progress-header">
            <h3>问题分析进度</h3>
            <div class="progress-info">
              <span class="stage-info">{{ currentStage }}/2</span>
              <span class="conversation-counter">对话: {{ conversationCount }}/8</span>
            </div>
          </div>
          <div class="progress-stages">
            <div
              v-for="(stage, index) in stageConfig"
              :key="index"
              class="progress-stage"
              :class="{
                completed: stageCompletionStatus[index] || index + 1 < currentStage,
                active: index + 1 === currentStage && !stageCompletionStatus[index],
                pending: index + 1 > currentStage && !stageCompletionStatus[index],
              }"
            >
              <div class="stage-icon">
                <span v-if="stageCompletionStatus[index] || index + 1 < currentStage">✓</span>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="stage-label">{{ stage.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 对话消息区域 -->
      <div class="chat-messages">
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
              <div class="loading-text">AI正在分析您的回答，预计需要15-30秒...</div>
              <div class="loading-progress">
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <div class="progress-steps">
                  <span class="step active">📝 理解问题</span>
                  <span class="step" :class="{ active: loadingStep >= 2 }">🔍 分析数据</span>
                  <span class="step" :class="{ active: loadingStep >= 3 }">💡 生成建议</span>
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
          :placeholder="currentStagePlaceholder"
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
            {{ currentHelpButtonText }}
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
              <span v-else>{{ currentSubmitButtonText }}</span>
            </button>
            <!-- 关键修改：当第二阶段完成或对话达到限制时显示下一步按钮 -->
            <button
              class="next-button"
              @click="handleNextStep"
              v-if="stage2Completed || allStagesCompleted || isConversationLimitReached"
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
                <div class="option-description">"我好像写得不太清楚，帮我完善一下吧。"</div>
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

    <!-- 确认弹窗 -->
    <div v-if="showConfirmDialog" class="confirm-dialog-overlay" @click="closeConfirmDialog">
      <div class="confirm-dialog" @click.stop>
        <div class="dialog-header">
          <div class="dialog-icon">🎯</div>
          <h3>确认进入下一步</h3>
        </div>
        <div class="dialog-content">
          <p>您即将进入下一个学习阶段。请确认您已经完成了当前阶段的所有思考和分析。</p>
          <div class="completion-summary">
            <div class="summary-item">
              <span class="summary-icon">✅</span>
              <span>已完成 {{ completedStagesCount }}/2 个分析阶段</span>
            </div>
            <div class="summary-item">
              <span class="summary-icon">💬</span>
              <span>进行了 {{ conversationCount }} 轮对话交流</span>
            </div>
            <div class="summary-item" v-if="stage2Completed">
              <span class="summary-icon">🎯</span>
              <span>控制逻辑设计已完成</span>
            </div>
            <div class="summary-item" v-if="isConversationLimitReached">
              <span class="summary-icon">⏰</span>
              <span>已达到最大对话轮次限制</span>
            </div>
          </div>
          <div class="dialog-warning">
            <span class="warning-icon">⚠️</span>
            <span>进入下一步后，您将无法返回修改当前阶段的答案。</span>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="cancel-button" @click="closeConfirmDialog">再想想</button>
          <button class="confirm-button" @click="confirmNextStep">确定继续</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { simpleStorage } from '../../api/utils/simpleStorage.ts'
import { trackStep2Event } from '../../src/utils/tracking.ts'

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

// 🔥 修改：定义消息类型
interface Message {
  id?: string // 可选，因为有些消息可能没有 id
  type: 'user' | 'ai' | 'system'
  content: string
  step: number
  stage?: number
  timestamp: string | Date
}

// 🔥 新增：定义存储的消息类型（从 localStorage 读取的格式）
interface StoredMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: string
  stage?: number
  step?: number // 可选，因为旧数据可能没有
}

// 🔥 新增：定义 Step2 数据结构（添加帮助系统字段）
interface Step2Data {
  sessionId: string
  currentStage: number
  conversationCount: number
  stageCompletionStatus: boolean[]
  messages: StoredMessage[]
  initialInstructions: {
    [key: number]: string
  }
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
  completedStages?: number
  stage1Complete?: boolean
  stage2Complete?: boolean
  finalStage?: number
  fromStage?: number
  toStage?: number
  totalMessages?: number
  helpCycle?: number
  // 🔥 修改：这些字段改为 string 类型（逗号分隔）
  availableModes?: string
  cycleUsedModes?: string
  remainingCycles?: number
  [key: string]: string | number | boolean | undefined // 索引签名
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
  // 🔥 埋点和元数据字段
  event_name?: string
  event_data?: EventData // 🔥 使用明确的类型
}

// 🔥 修改：从存储中恢复或初始化对话数据
const rawStepData = simpleStorage.getStep2Data() as Step2Data | null

const conversationData = reactive<{
  sessionId: string
  currentStage: number
  conversationCount: number
  stageCompletionStatus: boolean[]
  messages: Message[]
  initialInstructions: {
    [key: number]: string
  }
}>(
  rawStepData
    ? {
        sessionId: rawStepData.sessionId,
        currentStage: rawStepData.currentStage,
        conversationCount: rawStepData.conversationCount,
        stageCompletionStatus: rawStepData.stageCompletionStatus,
        messages: rawStepData.messages.map(
          (msg: StoredMessage): Message => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            step: msg.step || 2,
            stage: msg.stage,
            timestamp: msg.timestamp,
          }),
        ),
        initialInstructions: rawStepData.initialInstructions,
      }
    : {
        sessionId: simpleStorage.getSessionId(),
        currentStage: 1,
        conversationCount: 0,
        stageCompletionStatus: [false, false],
        messages: [],
        initialInstructions: {
          1: '根据监测数据，你认为影响教室舒适度和能耗的关键因素有哪些？',
          2: '基于这些关键因素，你会设计什么样的自动控制规则？',
        },
      },
)

// 🔥 恢复帮助系统状态
if (rawStepData?.helpSystem) {
  Object.assign(helpSystem, rawStepData.helpSystem)
}

// 阶段配置 - 简化版本
const stageConfig = [
  {
    label: '因素识别',
    question:
      '根据监测数据，你认为影响教室舒适度和能耗的关键因素有哪些？(注：“教室的能耗”即为教室一天中“花掉的电和能量”，能耗高就说明电用得多、浪费多，能耗低就说明更节能、更环保。)',
    placeholder: '请简要分析影响通风节能的关键因素（如温度、湿度、人数密度等）...',
    helpText: '我想提问',
    submitText: '提交',
  },
  {
    label: '控制设计',
    question: '基于这些关键因素，你会设计什么样的自动控制规则？',
    placeholder: '请设计基本的控制逻辑（如什么条件下开窗、启动空调等）...',
    helpText: '我想提问',
    submitText: '提交',
  },
]

// 场景约束
const constraints = reactive({
  isExam: false,
  timeLimitMinutes: 10,
  allowedDevices: ['空调', '窗户', '风扇'],
})

// 状态管理
const showInfoCard = ref(false)
const showAnswerArea = ref(false)
const showStageProgress = ref(false)
const showConversationWarning = ref(false)
const showConfirmDialog = ref(false)
const userAnswer = ref('')
const isGenerating = ref(false)
const loadingStep = ref(1)

// 新增：阶段完成状态追踪
const stage1Completed = ref(false)
const stage2Completed = ref(false)

// 对话轮次控制
const MAX_CONVERSATIONS = 8

// 计算属性
const conversationCount = computed(() => conversationData.conversationCount)
const currentStage = computed({
  get: () => conversationData.currentStage,
  set: (val) => {
    conversationData.currentStage = val
    simpleStorage.updateCurrentStage(2, val)
  },
})
const stageCompletionStatus = computed(() => conversationData.stageCompletionStatus)
const messages = computed(() => conversationData.messages)

const canSubmit = computed(() => userAnswer.value.trim().length > 0)
const isConversationLimitReached = computed(() => conversationCount.value >= MAX_CONVERSATIONS)
const completedStagesCount = computed(
  () => stageCompletionStatus.value.filter((status) => status).length,
)

const currentStagePlaceholder = computed(() => {
  if (isConversationLimitReached.value) {
    return '已达到最大对话轮次，请点击"继续下一步"进入下一阶段'
  }
  return stageConfig[currentStage.value - 1]?.placeholder || ''
})

const currentHelpButtonText = computed(() => {
  return stageConfig[currentStage.value - 1]?.helpText || '我想提问'
})

const currentSubmitButtonText = computed(() => {
  return stageConfig[currentStage.value - 1]?.submitText || '提交回答'
})

const allStagesCompleted = computed(() => {
  return stageCompletionStatus.value.every((status) => status) || stage2Completed.value
})

// 滚动容器引用
const chatScrollArea = ref<HTMLElement | null>(null)

// 🔥 监听对话轮次变化（添加埋点）
watch(conversationCount, async (newCount) => {
  if (newCount >= 7) {
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
    await trackStep2Event(
      'step2_conversation_limit_reached',
      conversationData.sessionId,
      currentStage.value,
      newCount,
      {
        finalStage: currentStage.value,
      },
    )
  }
})

// 🔥 监听阶段切换（添加埋点）
watch(currentStage, async (newStage, oldStage) => {
  if (oldStage && newStage !== oldStage) {
    await trackStep2Event(
      'step2_stage_change',
      conversationData.sessionId,
      newStage,
      conversationData.conversationCount,
      {
        fromStage: oldStage,
        toStage: newStage,
      },
    )
  }
})

// 🔥 添加阶段完成检测（添加埋点）
const checkStageCompletion = async (stage: number, userAnswer: string, aiResponse: string) => {
  const shouldComplete = shouldAdvanceStage(stage, conversationData.messages, aiResponse)

  if (shouldComplete) {
    if (stage === 1) {
      stage1Completed.value = true
      simpleStorage.updateStageStatus(2, 1, true)
      conversationData.stageCompletionStatus[0] = true

      // 🔥 埋点 - 阶段1完成
      await trackStep2Event(
        'step2_stage_complete',
        conversationData.sessionId,
        1,
        conversationData.conversationCount,
        {
          stage: 1,
          totalMessages: conversationData.messages.filter((m) => m.stage === 1).length,
        },
      )
    } else if (stage === 2) {
      stage2Completed.value = true
      simpleStorage.updateStageStatus(2, 2, true)
      conversationData.stageCompletionStatus[1] = true

      // 🔥 埋点 - 阶段2完成
      await trackStep2Event(
        'step2_stage_complete',
        conversationData.sessionId,
        2,
        conversationData.conversationCount,
        {
          stage: 2,
          totalMessages: conversationData.messages.filter((m) => m.stage === 2).length,
        },
      )

      emit('update-progress', 2)
      emit('show-next-steps')
    }
  }

  return shouldComplete
}

// 添加AI引导问题
function addSystemInstruction(stage: number) {
  const ventilationFocusedQuestions: Record<1 | 2, string> = {
    1: '根据监测数据，你认为影响教室舒适度和能耗的关键因素有哪些？(注：“教室的能耗”即为教室一天中“花掉的电和能量”，能耗高就说明电用得多、浪费多，能耗低就说明更节能、更环保。)',
    2: '基于这些关键因素，你会设计什么样的自动控制规则？',
  }

  const currentStageMessages = conversationData.messages.filter((m) => m.stage === stage)

  if (currentStageMessages.length > 0) {
    console.log(`阶段${stage}已有${currentStageMessages.length}条消息，跳过系统指令`)
    return
  }

  if (stage === 1 || stage === 2) {
    const questionText = ventilationFocusedQuestions[stage as 1 | 2]
    addMessage('ai', questionText, stage)

    saveConversationToDB({
      sessionId: conversationData.sessionId,
      step: 2,
      stage,
      userInput: '[SYSTEM_INSTRUCTION]',
      aiResponse: questionText,
      conversationCount: conversationData.conversationCount,
      timestamp: new Date(),
      context: `stage_${stage}_system_instruction`,
    })

    console.log(`✅ 已添加阶段${stage}的系统指令`)
  }
}

// 改进的阶段推进判断 - 与后端保持一致
function shouldAdvanceStage(
  stage: number,
  conversationHistory: Message[],
  aiResponse: string,
): boolean {
  const currentStageAnswers = conversationHistory.filter(
    (m) => m.type === 'user' && m.stage === stage,
  )

  if (stage === 1) {
    const userText = currentStageAnswers.map((m) => m.content.toLowerCase()).join(' ')
    const mentionedFactors = [
      /温度/.test(userText),
      /湿度/.test(userText),
      /(co2|二氧化碳|空气质量)/.test(userText),
      /(人数|密度|布局)/.test(userText),
    ].filter(Boolean).length

    const isComplete = currentStageAnswers.length >= 1 && mentionedFactors >= 2
    console.log(`📊 因素识别评估: 提到${mentionedFactors}个因素, 完成状态:${isComplete}`)
    return isComplete
  } else if (stage === 2) {
    const userText = currentStageAnswers.map((m) => m.content.toLowerCase()).join(' ')

    const hasTemperatureThreshold = /(\d+度|26|24|25|28|30)/.test(userText)
    const hasAction = /(开窗|关窗|空调|风扇|排风|通风)/.test(userText)
    const hasCondition = /(当|如果|若|超过|高于|低于|大于|小于)/.test(userText)
    const hasDetailedLogic = userText.length > 40
    const hasMultipleDevices = (userText.match(/(开窗|空调|风扇|排风)/g) || []).length >= 2

    const isComplete =
      currentStageAnswers.length >= 1 &&
      hasTemperatureThreshold &&
      hasAction &&
      hasCondition &&
      hasDetailedLogic &&
      hasMultipleDevices

    console.log(
      `📊 控制逻辑评估: 温度阈值:${hasTemperatureThreshold}, 行动:${hasAction}, 条件:${hasCondition}, 详细度:${hasDetailedLogic}, 多设备:${hasMultipleDevices}, 完成状态:${isComplete}`,
    )
    return isComplete
  }

  return false
}

// 获取最近AI问题用于防重复
function getRecentAIQuestions(messages: Message[], count = 2): string {
  return messages
    .filter((m) => m.type === 'ai')
    .slice(-count)
    .map((m) => m.content)
    .join('；')
}

// 🔥 核心提交函数（添加埋点）
async function submitAnswer() {
  if (!canSubmit.value || isConversationLimitReached.value) return

  simpleStorage.updateConversationCount(2, conversationData.conversationCount + 1)
  conversationData.conversationCount += 1

  addMessage('user', userAnswer.value, currentStage.value)

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

  // 🔥 埋点 - 提交答案
  await trackStep2Event(
    'step2_answer_submit',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      answerLength: userAnswer.value.length,
      stage: currentStage.value,
    },
  )

  const currentAnswer = userAnswer.value
  const currentStageNum = currentStage.value
  userAnswer.value = ''
  isGenerating.value = true
  loadingStep.value = 1

  const stepInterval = setInterval(() => {
    if (loadingStep.value < 3) {
      loadingStep.value++
    }
  }, 3000)

  try {
    const result: APIResponse = await callAIAPI(currentAnswer, currentStageNum)
    clearInterval(stepInterval)

    addMessage('ai', result.response, currentStageNum)

    const conversationHistory: Message[] = conversationData.messages
    const frontendShouldAdvance = shouldAdvanceStage(
      currentStageNum,
      conversationHistory,
      result.response,
    )
    const backendSuggestsCompletion = result.metadata?.suggestsCompletion || false

    const shouldAdvance = frontendShouldAdvance || backendSuggestsCompletion

    console.log(`阶段${currentStageNum}推进判断:`, {
      当前阶段对话数: conversationHistory.filter(
        (m) => m.type === 'user' && m.stage === currentStageNum,
      ).length,
      前端判断: frontendShouldAdvance,
      后端建议: backendSuggestsCompletion,
      最终决策: shouldAdvance,
    })

    if (shouldAdvance) {
      const stageCompleted = await checkStageCompletion(
        currentStageNum,
        currentAnswer,
        result.response,
      )

      if (stageCompleted && currentStageNum === 1 && !isConversationLimitReached.value) {
        setTimeout(() => {
          simpleStorage.updateCurrentStage(2, 2)
          const newData = simpleStorage.getStep2Data() as Step2Data | null
          if (newData) {
            // 🔥 转换消息格式
            conversationData.messages = newData.messages.map(
              (msg: StoredMessage): Message => ({
                id: msg.id,
                type: msg.type,
                content: msg.content,
                step: msg.step || 2,
                stage: msg.stage,
                timestamp: msg.timestamp,
              }),
            )
            conversationData.conversationCount = newData.conversationCount
            conversationData.currentStage = newData.currentStage
            conversationData.stageCompletionStatus = newData.stageCompletionStatus
          }

          const stage2Messages = conversationData.messages.filter((m) => m.stage === 2)
          if (stage2Messages.length === 0) {
            addSystemInstruction(2)
          }

          console.log(`已推进到阶段2`)
        }, 1000)
      } else if (stageCompleted && currentStageNum === 2) {
        console.log('🎉 Step2-Stage2 完成，显示继续下一步按钮')
      }
    }
  } catch (error) {
    clearInterval(stepInterval)
    console.error('AI API 调用失败:', error)
    addMessage('ai', '抱歉，系统暂时无法处理您的回答，请稍后重试。', currentStageNum)
  } finally {
    isGenerating.value = false
    loadingStep.value = 1
  }
}

// 🔥 保存帮助系统状态到 localStorage
function saveHelpSystemState() {
  const stepData = simpleStorage.getStep2Data() as Step2Data | null
  if (stepData) {
    stepData.helpSystem = {
      totalCycles: helpSystem.totalCycles,
      maxCycles: helpSystem.maxCycles,
      currentCycleUsed: { ...helpSystem.currentCycleUsed },
      isInCycle: helpSystem.isInCycle,
    }
    localStorage.setItem('step2_data', JSON.stringify(stepData))
    console.log('💾 帮助系统状态已保存')
  }
}

// 🔥 打开帮助弹窗（添加埋点）（添加周期管理）
function requestHelp() {
  if (isGenerating.value || isConversationLimitReached.value) return

  // 🔥 检查是否还能使用帮助功能
  if (!canUseHelp.value) {
    showHelpLimitDialog.value = true
    return
  }

  // 🔥 如果不在周期中，开启新周期
  if (!helpSystem.isInCycle) {
    helpSystem.totalCycles++
    helpSystem.isInCycle = true
    console.log(`🆕 开启第 ${helpSystem.totalCycles} 个帮助周期`)
  }

  // 🔥 检查当前周期是否还有可用模式
  if (!hasAvailableModesInCycle.value) {
    showCycleLimitDialog.value = true
    return
  }

  // 🔥 埋点 - 点击帮助按钮
  trackStep2Event(
    'step2_help_button_click',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      currentInputLength: userAnswer.value.length,
      hasInput: userAnswer.value.length > 0,
      helpCycle: helpSystem.totalCycles,
      // 🔥 修改：将数组转为逗号分隔的字符串
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

// 🔥 选择帮助模式（检查是否可用）
function selectHelpMode(mode: 'refine' | 'example' | 'custom') {
  // 🔥 检查该模式在当前周期是否已使用
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

// 提交自定义问题
function submitCustomQuestion() {
  if (!customQuestion.value.trim()) {
    return
  }
  executeHelp('custom', customQuestion.value)
}

// 🔥 执行帮助请求（添加埋点）（标记模式已使用）
async function executeHelp(mode: 'refine' | 'example' | 'custom', customQuestionText?: string) {
  // 关闭弹窗
  showHelpDialog.value = false

  // 🔥 标记该模式在当前周期已使用
  helpSystem.currentCycleUsed[mode] = true

  // 🔥 保存帮助系统状态
  saveHelpSystemState()

  // 🔥 根据帮助模式生成可读的用户消息
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

  // 🔥 1. 先显示用户的帮助请求消息
  addMessage('user', userDisplayMessage, currentStage.value)

  // 增加对话计数
  simpleStorage.updateConversationCount(2, conversationData.conversationCount + 1)
  conversationData.conversationCount += 1

  // 🔥 埋点 - 使用帮助
  await trackStep2Event(
    'step2_help_request',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      helpMode: mode,
      helpCycle: helpSystem.totalCycles,
      // 🔥 修改：将数组转为逗号分隔的字符串
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
    // 🔥 2. 调用 API（传递带标记的请求）
    const helpResponse = await callEnhancedHelpAPI(mode, customQuestionText, helpRequestContent)

    clearInterval(stepInterval)

    // 🔥 3. 显示 AI 回复
    addMessage('ai', helpResponse, currentStage.value)

    // 🔥 4. 保存到数据库（包含用户显示消息和实际请求）
    await saveConversationToDB({
      sessionId: conversationData.sessionId,
      step: 2,
      stage: currentStage.value,
      userInput: userDisplayMessage, // 🔥 保存可读的用户消息
      aiResponse: helpResponse,
      conversationCount: conversationData.conversationCount,
      timestamp: new Date(),
      context: `stage_${currentStage.value}_${helpContextType}`,
      event_data: {
        helpMode: mode,
        customQuestion: mode === 'custom' ? customQuestionText : undefined,
        actualRequest: helpRequestContent, // 🔥 同时保存实际的请求内容
      },
    })

    saveToStorage()
  } catch (error) {
    clearInterval(stepInterval)
    console.error('获取智能帮助失败:', error)

    const fallbackTexts: Record<string, string> = {
      refine: '试着把你的想法更具体地表达出来，比如可以加上具体的数值或条件。',
      example: '想想哪些环境参数会直接影响通风需求和能耗？',
      custom: '根据你的问题，建议从实际的教室环境数据出发来思考。',
    }

    addMessage('ai', fallbackTexts[mode] || fallbackTexts.custom, currentStage.value)
    saveToStorage()
  } finally {
    isGenerating.value = false
    loadingStep.value = 1

    // 重置弹窗状态
    helpMode.value = null
    customQuestion.value = ''
  }
}

// 🔥 修改：callEnhancedHelpAPI 函数 - 支持三种帮助模式
// 🔥 修改：callEnhancedHelpAPI 函数 - 接收预生成的请求内容
async function callEnhancedHelpAPI(
  helpMode: 'refine' | 'example' | 'custom' = 'custom',
  customQuestionText?: string,
  helpRequestContent?: string, // 🔥 新增参数
): Promise<string> {
  try {
    const currentStageUserAnswers = conversationData.messages
      .filter((m) => m.type === 'user' && m.stage === currentStage.value)
      .map((m) => m.content)

    const conversationHistory = conversationData.messages
      .filter((msg) => msg.step === 2 && msg.stage === currentStage.value)
      .map((msg) => ({
        type: msg.type,
        content: msg.content,
        step: msg.step,
        stage: msg.stage,
        timestamp: msg.timestamp,
      }))

    // 🔥 如果没有传入 helpRequestContent，则按原逻辑生成
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

    console.log('📤 Step2 智能帮助 - 发送对话历史:', {
      count: conversationHistory.length,
      currentStage: currentStage.value,
      helpMode,
      currentStageOnly: true,
      history: conversationHistory,
    })

    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': localStorage.getItem('experimentId') || '',
      },
      body: JSON.stringify({
        userAnswer: actualHelpRequest, // 🔥 使用带标记的请求
        context: {
          isHelpRequest: true,
          helpMode,
          customQuestion: customQuestionText,
          currentUserInput: userAnswer.value,
          recentQuestions: getRecentAIQuestions(conversationData.messages, 3),
          ventilationFocus: true,
          currentStage: currentStage.value,
          helpContext: {
            stageName: stageConfig[currentStage.value - 1]?.label,
            stageQuestion: stageConfig[currentStage.value - 1]?.question,
            userProgress: currentStageUserAnswers,
          },
        },
        step: 2,
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
          previousUserAnswers: currentStageUserAnswers,
          needsContinuity: true,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()

    console.log('📥 Step2 智能帮助 - 收到响应:', {
      response: data.response,
      isSmartHint: data.metadata?.isSmartHint,
      helpMode,
    })

    return data.response || '根据你目前的思考，试着从另一个角度来看这个问题。'
  } catch (error) {
    console.error('❌ Step2 - 智能帮助API调用失败:', error)
    throw error
  }
}

const handleInput = () => {
  // 输入内容时不需要额外处理
}

const handleNextStep = () => {
  showConfirmDialog.value = true
}

const closeConfirmDialog = () => {
  showConfirmDialog.value = false
}

// 🔥 确认进入下一步（添加埋点）
const confirmNextStep = async () => {
  // 🔥 埋点 - 点击继续下一步
  await trackStep2Event(
    'step2_next_step_click',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      completedStages: conversationData.stageCompletionStatus.filter((s) => s).length,
      stage1Complete: stage1Completed.value,
      stage2Complete: stage2Completed.value,
    },
  )

  showConfirmDialog.value = false
  goToNextStep()
}

const goToNextStep = () => {
  router.push('/experiment/step3')
}

// 🔥 修改：addMessage 函数，确保正确转换格式
const addMessage = (type: 'ai' | 'user', content: string, stage?: number) => {
  simpleStorage.addMessage(2, type, content, stage)

  // 🔥 修改：重新同步数据时转换格式
  const newData = simpleStorage.getStep2Data() as Step2Data | null
  if (newData) {
    // 转换消息格式
    conversationData.messages = newData.messages.map(
      (msg: StoredMessage): Message => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        step: msg.step || 2, // 确保有 step
        stage: msg.stage,
        timestamp: msg.timestamp,
      }),
    )
    conversationData.conversationCount = newData.conversationCount
    conversationData.currentStage = newData.currentStage
    conversationData.stageCompletionStatus = newData.stageCompletionStatus
  }

  nextTick(() => {
    scrollToBottom()
  })
}

const scrollToBottom = () => {
  if (chatScrollArea.value) {
    chatScrollArea.value.scrollTop = chatScrollArea.value.scrollHeight
  }
}

const formatTime = (timestamp: string | Date) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 🔥 修改：API调用函数
async function callAIAPI(
  answer: string,
  stage: number,
): Promise<{
  response: string
  metadata?: {
    step?: number
    stage?: number
    guidanceMode?: string
    suggestsCompletion?: boolean
  }
  fallbackResponse?: string
}> {
  try {
    const currentStageUserAnswers = conversationData.messages
      .filter((m) => m.type === 'user' && m.stage === stage)
      .map((m) => m.content)

    const recentQuestions = getRecentAIQuestions(conversationData.messages)

    // 🔥 修改：传递当前阶段的完整历史，而不是只取最近6条
    const conversationHistory = conversationData.messages
      .filter((msg) => msg.step === 2 && msg.stage === stage) // 只传递当前阶段的消息
      .map((msg) => ({
        type: msg.type,
        content: msg.content,
        step: msg.step,
        stage: msg.stage,
        timestamp: msg.timestamp,
      }))

    console.log('📤 Step2 - 发送给后端的对话历史:', {
      count: conversationHistory.length,
      stage,
      currentStageOnly: true, // 标记只传递当前阶段
      history: conversationHistory,
      userAnswer: answer.substring(0, 50) + (answer.length > 50 ? '...' : ''),
    })

    const payload = {
      userAnswer: answer,
      context: {
        ...constraints,
        recentQuestions,
        ventilationFocus: true,
        currentStage: stage,
        stageProgress: {
          currentStageAnswers: currentStageUserAnswers,
          totalAnswersInStage: currentStageUserAnswers.length + 1,
        },
      },
      step: 2,
      stage,
      conversationCount: conversationData.conversationCount,
      sessionId: conversationData.sessionId,
      conversationHistory, // 🔥 完整的当前阶段历史
      followUpContext: {
        currentStage: stage,
        conversationCount: conversationData.conversationCount,
        previousUserAnswers: currentStageUserAnswers,
        needsContinuity: true,
      },
    }

    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': localStorage.getItem('experimentId') || '',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error(`API Error: ${res.statusText}`)
    const data = await res.json()

    console.log('📥 Step2 - 收到后端响应:', {
      response: data.response?.substring(0, 100) + (data.response?.length > 100 ? '...' : ''),
      metadata: data.metadata,
    })

    await saveConversationToDB({
      sessionId: conversationData.sessionId,
      step: 2,
      stage,
      userInput: answer,
      aiResponse: data.response || data.fallbackResponse,
      conversationCount: conversationData.conversationCount,
      timestamp: new Date(),
      context: `stage_${stage}_enhanced_continuity`,
    })

    return {
      response:
        data.response || data.fallbackResponse || '抱歉，系统暂时无法处理您的回答，请稍后重试。',
      metadata: data.metadata,
      fallbackResponse: data.fallbackResponse,
    }
  } catch (error) {
    console.error('❌ Step2 - AI API 调用失败:', error)
    return {
      response: '抱歉，系统暂时无法处理您的回答，请稍后重试。',
      metadata: { guidanceMode: 'fallback' },
    }
  }
}

// 保存对话到数据库
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

    console.log('✅ Step2 - 对话已保存到数据库')
  } catch (error) {
    console.error('❌ Step2 - 保存对话失败:', error)
  }
}

const saveToStorage = () => {
  console.log('💾 Step2 - 数据已自动保存到本地存储')
}

const getSessionId = () => {
  return simpleStorage.getSessionId()
}

// 生命周期
const showContentSequentially = async () => {
  showInfoCard.value = true
  await new Promise((resolve) => setTimeout(resolve, 800))

  showStageProgress.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))

  showAnswerArea.value = true
}

// 🔥 组件挂载时（添加埋点）
onMounted(async () => {
  console.log('🎬 Step2 组件已挂载')

  // 🔥 埋点 - 进入 Step2
  await trackStep2Event(
    'step2_enter',
    conversationData.sessionId,
    conversationData.currentStage,
    conversationData.conversationCount,
    {
      initialStage: conversationData.currentStage,
      hasHistory: conversationData.messages.length > 0,
    },
  )

  const stepData = simpleStorage.getStep2Data() as Step2Data | null
  if (stepData) {
    stage1Completed.value = stepData.stageCompletionStatus[0] || false
    stage2Completed.value = stepData.stageCompletionStatus[1] || false
  }

  addSystemInstruction(conversationData.currentStage)
  showContentSequentially()
})
</script>

<style scoped>
.step-two-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffffdd;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

/* 对话轮次限制警告 - 修复显示问题 */
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
  /* 修复：初始状态隐藏但不占用空间 */
  max-height: 0;
  overflow: hidden;
}

.conversation-limit-warning.warning-visible {
  opacity: 1;
  transform: translateY(0);
  /* 修复：显示时设置足够的最大高度 */
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
  /* 确保从顶部开始 */
  padding-top: 1.5rem;
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

/* 阶段进度指示器 */
.stage-progress {
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.6s ease-out;
  margin-bottom: 1rem;
  max-height: 0;
  overflow: hidden;
}

.stage-progress.stage-visible {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}

.progress-container {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 16px;
  padding: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header h3 {
  color: #0369a1;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 600;
}

.progress-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stage-info {
  background: #0ea5e9;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
}

.conversation-counter {
  background: linear-gradient(45deg, #8b5cf6, #a855f7);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.progress-stages {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.progress-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  transition: all 0.3s ease;
}

.stage-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.progress-stage.completed .stage-icon {
  background: #22c55e;
  color: white;
}

.progress-stage.active .stage-icon {
  background: #0ea5e9;
  color: white;
  animation: pulse 2s infinite;
}

.progress-stage.pending .stage-icon {
  background: #e2e8f0;
  color: #64748b;
}

.stage-label {
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  transition: color 0.3s ease;
}

.progress-stage.completed .stage-label {
  color: #22c55e;
}

.progress-stage.active .stage-label {
  color: #0369a1;
}

.progress-stage.pending .stage-label {
  color: #64748b;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(14, 165, 233, 0);
  }
}

/* 确认弹窗样式 */
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
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
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

.warning-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
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

/* 对话消息区域 */
.chat-messages {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 信息卡片样式 */
.info-card-section {
  flex-shrink: 0;
}

.info-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
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
  background: linear-gradient(45deg, #ef4444, #f59e0b);
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.card-title {
  color: #92400e;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 500;
}

.card-content h4 {
  color: #92400e;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
}

/* 题注样式 */
.temperature-chart h5,
.classroom-status h5 {
  color: #374151;
  font-size: 0.85rem;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  text-align: center;
  padding: 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

/* 温度图表样式 */
.temperature-chart {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-svg {
  width: 100%;
  height: auto;
}

.chart-label {
  font-size: 10px;
  fill: #64748b;
  font-weight: 500;
}

.temp-label {
  font-size: 9px;
  fill: #ef4444;
  font-weight: 600;
}

/* 教室状态面板 */
.classroom-status {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.status-icon {
  font-size: 1.2rem;
}

.status-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.status-label {
  font-size: 0.7rem;
  color: #64748b;
  text-align: center;
}

/* 环境标准参考 */
.reference-standards {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.reference-standards h4 {
  color: #0369a1;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
  text-align: center;
}

.standards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.standard-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(14, 165, 233, 0.2);
  transition: transform 0.2s ease;
}

.standard-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.95);
}

.standard-icon {
  font-size: 1.1rem;
}

.standard-range {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0369a1;
}

.standard-label {
  font-size: 0.7rem;
  color: #64748b;
  text-align: center;
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
  box-sizing: border-box;
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
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  position: relative;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
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
  animation: slideInFromRight 0.5s ease-out;
}

.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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

/* 阶段过渡动画 */
.stage-transition {
  animation: stageTransition 0.5s ease-in-out;
}

@keyframes stageTransition {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 0.5;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-scroll-area {
    padding: 1rem;
  }

  .chart-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .status-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .standards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .standard-item {
    padding: 0.5rem;
  }

  .standard-range {
    font-size: 0.8rem;
  }

  .standard-label {
    font-size: 0.65rem;
  }

  .progress-stages {
    gap: 1rem;
  }

  .stage-icon {
    width: 2rem;
    height: 2rem;
    font-size: 0.9rem;
  }

  .stage-label {
    font-size: 0.8rem;
  }

  .progress-container {
    padding: 1rem;
  }

  .progress-header h3 {
    font-size: 1rem;
  }

  .progress-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }

  .stage-info {
    font-size: 0.8rem;
    padding: 0.2rem 0.6rem;
  }

  .conversation-counter {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
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

  .submit-button,
  .next-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }

  .help-button {
    font-size: 0.8rem;
    padding: 0.6rem 0.8rem;
  }

  .loading-text {
    font-size: 0.8rem;
  }

  .progress-steps {
    font-size: 0.7rem;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .user-input {
    font-size: 0.9rem;
    min-height: 70px;
  }

  .card-title {
    font-size: 0.9rem;
  }

  .card-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.1rem;
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
}

@media (max-width: 480px) {
  .progress-stages {
    flex-direction: column;
    gap: 1rem;
  }

  .progress-stage {
    flex-direction: row;
    gap: 1rem;
  }

  .stage-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .stage-label {
    font-size: 0.9rem;
  }

  .status-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .status-item {
    flex-direction: row;
    justify-content: space-between;
    padding: 1rem;
  }

  .standards-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .standard-item {
    flex-direction: row;
    justify-content: space-between;
    padding: 0.75rem;
  }

  .chart-container {
    gap: 1.5rem;
  }

  .progress-info {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .conversation-counter {
    font-size: 0.7rem;
  }

  .stage-info {
    font-size: 0.75rem;
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

/* 帮助弹窗样式 */
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

/* 响应式设计 */
@media (max-width: 768px) {
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

/* 已使用标记 */
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

.help-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.help-option.disabled:hover {
  transform: none;
  border-color: #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* 周期信息 */
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
</style>
