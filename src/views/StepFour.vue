<template>
  <div class="step-four-container">
    <!-- 🔥 新增：步骤锁定提示（仅在锁定时显示） -->
    <div v-if="isStepLocked" class="step-locked-banner">
      <span class="lock-icon">🔒</span>
      <span>此步骤已确认答案并锁定，仅查看。</span>
    </div>
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
            <div class="card-icon">💬</div>
            <div class="card-title">
              基于前面的问题分析和节能方案，为AI系统设计一条"工作提示词"，让AI准确理解节能任务。
              <br /><br />
              <strong>✨ 提交后，系统会：</strong>
              <br />
              🤖 根据你的提示词生成节能方案示例
              <br />
              💡 给出提示词的改进建议
              <br /><br />
              你可以根据反馈不断优化你的提示词设计！
            </div>
          </div>

          <!-- 🔥 修改：信息卡片内容 - 移除优秀示例 -->
          <div class="card-content">
            <div class="chart-section">
              <h4>💡 系统提示词设计指南：</h4>
              <div class="chart-container">
                <!-- 提示词要素分析 -->
                <div class="prompt-elements">
                  <h5>🎯 优质提示词的核心要素</h5>
                  <div class="elements-grid">
                    <div class="element-item">
                      <div class="element-header">
                        <span class="element-icon">🎪</span>
                        <span class="element-title">角色设定</span>
                      </div>
                      <div class="element-content">
                        <div class="element-desc">明确AI的身份和专业背景</div>
                        <div class="element-example">例：你是一位节能专家...</div>
                      </div>
                    </div>
                    <div class="element-item">
                      <div class="element-header">
                        <span class="element-icon">📋</span>
                        <span class="element-title">任务描述</span>
                      </div>
                      <div class="element-content">
                        <div class="element-desc">清晰说明需要完成的具体任务</div>
                        <div class="element-example">例：请分析当前教室状况并给出建议</div>
                      </div>
                    </div>
                    <div class="element-item">
                      <div class="element-header">
                        <span class="element-icon">📊</span>
                        <span class="element-title">上下文信息</span>
                      </div>
                      <div class="element-content">
                        <div class="element-desc">提供必要的背景数据和约束条件</div>
                        <div class="element-example">例：教室40人，温度35℃，预算有限</div>
                      </div>
                    </div>
                    <div class="element-item">
                      <div class="element-header">
                        <span class="element-icon">📝</span>
                        <span class="element-title">输出格式</span>
                      </div>
                      <div class="element-content">
                        <div class="element-desc">指定期望的回答结构和形式</div>
                        <div class="element-example">例：请按优先级列出3个方案</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 🔥 修改：常见问题与思考引导 - 紧凑版 -->
                <div class="prompt-examples">
                  <h5>⚠️ 常见问题与改进方向</h5>

                  <!-- 🔥 两个问题示例横向排列 -->
                  <div class="examples-grid">
                    <!-- 错误示例1 -->
                    <div class="example-item bad-example">
                      <div class="scenario-tag bad-tag">❌ 问题示例 1</div>
                      <div class="example-text">"帮我想个节能的办法"</div>
                      <div class="example-analysis">
                        <strong>问题分析：</strong>
                        <ul>
                          <li>没有明确AI的角色定位</li>
                          <li>任务描述过于模糊</li>
                          <li>缺少教室的具体情况</li>
                          <li>没有说明期望的输出格式</li>
                        </ul>
                      </div>
                    </div>

                    <!-- 错误示例2 -->
                    <div class="example-item bad-example">
                      <div class="scenario-tag bad-tag">❌ 问题示例 2</div>
                      <div class="example-text">"请给出教室节能方案"</div>
                      <div class="example-analysis">
                        <strong>问题分析：</strong>
                        <ul>
                          <li>缺少背景约束（人数、面积、温度等）</li>
                          <li>没有明确预算和实施难度要求</li>
                          <li>输出格式不明确</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- 🔥 思考引导 - 横向4列 -->
                  <div class="thinking-guide">
                    <div class="guide-header">
                      <span class="guide-icon">💭</span>
                      <span class="guide-title">设计提示词时，思考这些问题：</span>
                    </div>
                    <div class="guide-questions">
                      <div class="question-item">
                        <span class="q-icon">🎪</span>
                        <span>AI需要扮演什么角色？（专家、顾问、分析师...）</span>
                      </div>
                      <div class="question-item">
                        <span class="q-icon">📊</span>
                        <span>需要提供哪些关键数据？（人数、温度、空间...）</span>
                      </div>
                      <div class="question-item">
                        <span class="q-icon">🎯</span>
                        <span>期望得到什么样的答案？（方案数量、详细程度...）</span>
                      </div>
                      <div class="question-item">
                        <span class="q-icon">⚖️</span>
                        <span>有哪些约束条件？（成本、时间、技术难度...）</span>
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
              <strong>🎯 任务：设计系统提示词</strong>
              <br /><br />
              请为AI设计一条工作提示词，需包含：
              <br />
              • 🎪 <strong>角色定位</strong>（AI是什么专家？）
              <br />
              • 📋 <strong>任务目标</strong>（AI需要做什么？）
              <br />
              • 📊 <strong>背景约束</strong>（教室情况和限制）
              <br />
              • 📝 <strong>输出格式</strong>（期望如何组织答案） <br /><br />
              <strong>💡 提示：</strong>
              提交后，我会根据你的提示词生成一个节能方案示例，同时给出提示词的改进建议，帮你优化设计！
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
              <div class="loading-text">AI正在测试提示词并生成反馈，预计需要15-30秒...</div>
              <div class="loading-progress">
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <div class="progress-steps">
                  <span class="step active">🧪 测试提示词</span>
                  <span class="step" :class="{ active: loadingStep >= 2 }">📝 生成方案</span>
                  <span class="step" :class="{ active: loadingStep >= 3 }">💡 改进建议</span>
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
          @input="handleInput"
          :placeholder="isStepLocked ? '步骤已锁定，无法编辑' : inputPlaceholder"
          class="user-input"
          rows="4"
          :disabled="isStepLocked"
        ></textarea>
        <div class="input-toolbar">
          <button
            class="help-button"
            @click="requestHelp"
            :disabled="isStepLocked || !canUseHelp"
            :title="isStepLocked ? '步骤已锁定' : getHelpButtonTitle"
          >
            <span class="help-icon">💡</span>
            <span class="help-text">我想提问</span>
            <span class="help-counter"> {{ remainingCycles }}/{{ helpSystem.maxCycles }} </span>
          </button>
          <div class="action-buttons">
            <!-- 提交按钮 -->
            <button
              v-if="!isConversationLimitReached && !isStepLocked"
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
                测试中...
              </span>
              <span v-else>
                <span class="button-icon">🚀</span>
                <span>提交并测试</span>
              </span>
            </button>

            <!-- 下一步按钮 -->
            <button
              class="next-button"
              @click="handleNextStep"
              v-if="answerSubmitted || isConversationLimitReached || isStepLocked"
            >
              <span class="button-icon"></span>
              <span>下一步</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 帮助弹窗 -->
    <div v-if="showHelpDialog" class="help-dialog-overlay" @click="closeHelpDialog">
      <div class="help-dialog" @click.stop>
        <div class="help-dialog-header">
          <div class="help-dialog-icon">💬</div>
          <h3>选择帮助方式</h3>
          <button class="close-button" @click="closeHelpDialog">✕</button>
        </div>

        <div class="help-dialog-content">
          <p class="help-dialog-description">请选择你需要的帮助类型：</p>

          <div class="help-options">
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

          <div class="help-cycle-info">
            <span class="cycle-icon">🔄</span>
            <span>剩余帮助次数：{{ remainingCycles }} 次</span>
            <span v-if="helpSystem.isInCycle" class="cycle-tip">
              （当前周期已使用
              {{ Object.values(helpSystem.currentCycleUsed).filter(Boolean).length }}/3）
            </span>
          </div>

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

          <div v-if="helpMode === 'refine' && !userAnswer.trim()" class="help-tip">
            <span class="tip-icon">💡</span>
            <span>请先在下方输入框中写一些内容，然后我可以帮你完善。</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 帮助次数用尽提示 -->
    <div v-if="showHelpLimitDialog" class="help-dialog-overlay" @click="closeHelpLimitDialog">
      <div class="help-limit-dialog" @click.stop>
        <div class="limit-dialog-icon">⚠️</div>
        <h3>帮助次数已用完</h3>
        <p>您已使用完所有的帮助次数（{{ helpSystem.maxCycles }} 次）。</p>
        <p class="limit-tip">请继续独立完成剩余的任务，或点击"提交并测试"按钮提交您的答案。</p>
        <button class="limit-confirm-button" @click="closeHelpLimitDialog">知道了</button>
      </div>
    </div>

    <!-- 周期内帮助已用尽提示 -->
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
          <p>您即将完成提示词设计阶段，进入下一个学习环节。请确认或修改您的最终提示词。</p>

          <!-- 🔥 新增：可编辑的快照区域 -->
          <div v-if="editableFinalAnswer" class="answer-preview">
            <div class="preview-header">
              <span class="preview-icon">📝</span>
              <span class="preview-title">本步骤的最终内容（可编辑）</span>
            </div>
            <!-- 🔥 新增：任务标题（与 Step3 风格统一） -->
            <div class="task-title">
              <span class="task-icon">🔍</span>
              <span class="task-text">
                任务：为AI系统设计一条清晰的工作提示词，用于生成教室智能通风节能方案
              </span>
            </div>
            <div class="preview-body">
              <textarea
                v-model="editableFinalAnswer"
                class="preview-textarea"
                rows="10"
                placeholder="请输入或修改你的最终提示词..."
              ></textarea>
              <p class="preview-hint">💡 这是您最后一次修改机会，请仔细检查后点击"确定继续"。</p>
              <div class="char-count">字数：{{ editableFinalAnswer.length }} 字符</div>
            </div>
          </div>

          <div class="completion-summary">
            <div class="summary-item">
              <span class="summary-icon">💬</span>
              <span>进行了 {{ conversationCount }} 轮提示词设计讨论</span>
            </div>
            <div class="summary-item" v-if="answerSubmitted">
              <span class="summary-icon">✅</span>
              <span>已提交提示词设计方案</span>
            </div>
            <div class="summary-item" v-if="isConversationLimitReached">
              <span class="summary-icon">⏰</span>
              <span>已达到最大对话轮次限制</span>
            </div>
          </div>
          <div class="dialog-warning">
            <span class="warning-icon">⚠️</span>
            <span>进入下一步后，您将无法返回修改当前的提示词设计。</span>
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { simpleStorage } from '../../api/utils/simpleStorage'
import { trackStep4Event } from '../../src/utils/tracking'

// 🔥 新增：最终答案快照相关
const finalAnswerSnapshot = ref('') // 本步最终答案快照
const finalAnswerConfirmed = ref(false) // 是否已确认最终答案
const editableFinalAnswer = ref('') // 🔥 可编辑的最终答案（用于弹窗中编辑）

// 🔥 新增：帮助系统状态管理
const helpSystem = reactive({
  totalCycles: 0,
  maxCycles: 4,
  currentCycleUsed: {
    refine: false,
    example: false,
    custom: false,
  },
  isInCycle: false,
})

// 🔥 新增：步骤锁定状态
const isStepLocked = ref(false)

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

// 限制提示弹窗状态
const showHelpLimitDialog = ref(false)
const showCycleLimitDialog = ref(false)

// 帮助按钮 title 计算属性
const getHelpButtonTitle = computed(() => {
  if (!canUseHelp.value) {
    return '已达到帮助次数上限'
  }
  if (helpSystem.isInCycle && !hasAvailableModesInCycle.value) {
    return '当前周期的帮助已全部使用，请提交答案后再使用'
  }
  return '点击获取智能帮助'
})

// 关闭限制提示弹窗的函数
const closeHelpLimitDialog = () => {
  showHelpLimitDialog.value = false
}

const closeCycleLimitDialog = () => {
  showCycleLimitDialog.value = false
}

// 定义消息类型
interface Message {
  id: string
  type: 'ai' | 'user' | 'system'
  content: string
  timestamp: Date
  stage?: number
  step?: number
}

// 定义存储的消息类型
interface StoredMessage {
  id: string
  type: 'ai' | 'user' | 'system'
  content: string
  timestamp: string
  step?: number
  stage?: number
}

// 定义历史消息类型
interface HistoryMessage {
  type: 'ai' | 'user' | 'system'
  content: string
  timestamp: string
  step: number
  stage?: number
}

// 🔥 修改：定义步骤数据类型 - 添加快照字段
interface StepData {
  conversationCount?: number
  stageCompletionStatus?: boolean[]
  messages?: StoredMessage[]
  conversationHistory?: HistoryMessage[]
  currentStage?: number
  isCompleted?: boolean
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
  // 🔥 新增字段
  finalAnswerSnapshot?: string
  finalAnswerConfirmed?: boolean
  lockedAt?: string // 🔥 新增：锁定时间戳
}

// 定义 event_data 的类型
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
  wasEdited?: boolean
  finalAnswerLength?: number
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

// 🔥 从本地存储恢复或初始化对话数据
const rawStepData = simpleStorage.getStepData(4) as StepData | null

const conversationData = reactive<{
  sessionId: string
  conversationCount: number
  messages: Message[]
  conversationHistory: HistoryMessage[]
  isCompleted: boolean
}>(
  rawStepData
    ? {
        sessionId: simpleStorage.getSessionId(),
        conversationCount: rawStepData.conversationCount || 0,
        messages: rawStepData.messages
          ? rawStepData.messages.map(
              (msg: StoredMessage): Message => ({
                id: msg.id,
                type: msg.type,
                content: msg.content,
                step: msg.step || 4,
                stage: msg.stage || 1,
                timestamp: new Date(msg.timestamp),
              }),
            )
          : [],
        conversationHistory: rawStepData.conversationHistory || [],
        isCompleted: rawStepData.isCompleted || false,
      }
    : {
        sessionId: simpleStorage.getSessionId(),
        conversationCount: 0,
        messages: [],
        conversationHistory: [],
        isCompleted: false,
      },
)

// 🔥 添加验证（可选但推荐）
if (!conversationData.sessionId) {
  console.error('❌ Step4: conversationData.sessionId 为空！')
  conversationData.sessionId = simpleStorage.getSessionId()
}

console.log('🔍 Step4 初始化完成，sessionId:', conversationData.sessionId)

// 🔥 恢复帮助系统状态
if (rawStepData?.helpSystem) {
  Object.assign(helpSystem, rawStepData.helpSystem)
}

// 🔥 恢复快照数据
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

// 对话轮次控制
const MAX_CONVERSATIONS = 5

// 滚动容器引用
const chatScrollArea = ref<HTMLElement | null>(null)

// 计算属性
const conversationCount = computed(() => conversationData.conversationCount)
const messages = computed(() => conversationData.messages)

const canSubmit = computed(() => userAnswer.value.trim().length > 0)
// 🔥 新增：是否允许编辑
const canEdit = computed(() => !isStepLocked.value)

// 🔥 新增：是否允许使用帮助（结合锁定状态）
const canUseHelpWithLock = computed(() => {
  return canEdit.value && canUseHelp.value
})
const isConversationLimitReached = computed(() => conversationCount.value >= MAX_CONVERSATIONS)

const inputPlaceholder = computed(() => {
  if (isConversationLimitReached.value) {
    return '已达到最大对话轮次，请点击"继续下一步"进入下一阶段'
  }
  return `请设计你的系统提示词，包含角色、任务、约束和输出要求...`
})

// 🔥 新增：计算剩余次数
const remainingCycles = computed(() => {
  return helpSystem.maxCycles - helpSystem.totalCycles
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

  // 埋点 - 达到对话上限
  if (newCount === MAX_CONVERSATIONS) {
    await trackStep4Event(
      'step4_conversation_limit_reached',
      conversationData.sessionId,
      1,
      newCount,
      {
        finalStage: 1,
      },
    )
  }
})

// 保存帮助系统状态到 localStorage
function saveHelpSystemState() {
  const stepData = simpleStorage.getStepData(4) as StepData | null
  if (stepData) {
    stepData.helpSystem = {
      totalCycles: helpSystem.totalCycles,
      maxCycles: helpSystem.maxCycles,
      currentCycleUsed: { ...helpSystem.currentCycleUsed },
      isInCycle: helpSystem.isInCycle,
    }
    simpleStorage.saveStepData(4, stepData)
    console.log('💾 Step4 - 帮助系统状态已保存')
  }
}

// 方法
const handleInput = () => {
  // 输入处理
}

// 🔥 修改：核心提交函数 - 更新快照
const submitAnswer = async () => {
  if (!canSubmit.value || isConversationLimitReached.value) return

  simpleStorage.updateConversationCount(4, conversationData.conversationCount + 1)
  conversationData.conversationCount += 1

  addMessage('user', userAnswer.value)

  // 🔥 核心：保存本轮输入作为快照
  const currentAnswer = userAnswer.value
  finalAnswerSnapshot.value = currentAnswer

  // 重置帮助周期
  if (helpSystem.isInCycle) {
    console.log(`🔄 Step4 - 重置帮助周期，已使用周期数: ${helpSystem.totalCycles}`)
    helpSystem.isInCycle = false
    helpSystem.currentCycleUsed = {
      refine: false,
      example: false,
      custom: false,
    }
    saveHelpSystemState()
  }

  // 埋点 - 提交答案
  await trackStep4Event(
    'step4_answer_submit',
    conversationData.sessionId,
    1,
    conversationData.conversationCount,
    {
      answerLength: currentAnswer.length,
      stage: 1,
    },
  )

  // 保存到历史记录
  conversationData.conversationHistory.push({
    type: 'user',
    content: currentAnswer,
    timestamp: new Date().toISOString(),
    step: 4,
    stage: 1,
  })

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

    conversationData.conversationHistory.push({
      type: 'ai',
      content: response,
      timestamp: new Date().toISOString(),
      step: 4,
      stage: 1,
    })

    answerSubmitted.value = true

    saveToStorage()
    emit('update-progress', 4)
    emit('show-next-steps')
  } catch (error) {
    clearInterval(stepInterval)
    console.error('❌ Step4 - AI API 调用失败:', error)
    addMessage('ai', '抱歉，系统暂时无法处理您的回答，请稍后重试。')
    saveToStorage()
  } finally {
    isGenerating.value = false
    loadingStep.value = 1
  }
}

// 🔥 修改：执行帮助请求 - 在这里才真正消耗次数
async function executeHelp(mode: 'refine' | 'example' | 'custom', customQuestionText?: string) {
  showHelpDialog.value = false

  // 🔥 关键修改：在这里开启新周期（如果需要）
  if (!helpSystem.isInCycle) {
    helpSystem.totalCycles++
    helpSystem.isInCycle = true
    console.log(`🆕 Step4 - 开启第 ${helpSystem.totalCycles} 个帮助周期`)
  }

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
  addMessage('user', userDisplayMessage)

  // 增加对话计数
  simpleStorage.updateConversationCount(4, conversationData.conversationCount + 1)
  conversationData.conversationCount += 1

  // 埋点 - 使用帮助
  await trackStep4Event(
    'step4_help_request',
    conversationData.sessionId,
    1,
    conversationData.conversationCount,
    {
      helpMode: mode,
      helpCycle: helpSystem.totalCycles,
      cycleUsedModes: Object.entries(helpSystem.currentCycleUsed)
        .filter(([_, used]) => used)
        .map(([mode]) => mode)
        .join(','),
      remainingCycles: remainingCycles.value,
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

    addMessage('ai', helpResponse)

    await saveConversationToDB({
      sessionId: conversationData.sessionId,
      step: 4,
      stage: 1,
      userInput: userDisplayMessage,
      aiResponse: helpResponse,
      conversationCount: conversationData.conversationCount,
      timestamp: new Date(),
      context: `step4_${helpContextType}`,
      event_data: {
        helpMode: mode,
        customQuestion: mode === 'custom' ? customQuestionText : undefined,
        actualRequest: helpRequestContent,
      },
    })

    saveToStorage()
  } catch (error) {
    clearInterval(stepInterval)
    console.error('❌ Step4 - 获取智能帮助失败:', error)

    const fallbackTexts: Record<string, string> = {
      refine: '试着从多个角度分析提示词的设计,比如角色、任务、上下文等。',
      example: '想想一个好的提示词应该包含哪些要素？比如角色设定、任务描述等。',
      custom: '根据你的问题，建议从提示词的核心要素和实际应用场景的角度来思考。',
    }

    addMessage('ai', fallbackTexts[mode] || fallbackTexts.custom)
    saveToStorage()
  } finally {
    isGenerating.value = false
    loadingStep.value = 1

    helpMode.value = null
    customQuestion.value = ''
  }
}

// 🔥 修改：打开帮助弹窗 - 不再消耗次数
function requestHelp() {
  if (isGenerating.value || isConversationLimitReached.value) return

  // 检查是否还能使用帮助功能（基于总次数）
  if (!canUseHelp.value) {
    showHelpLimitDialog.value = true
    return
  }

  // 🔥 修改：如果当前在周期中且所有模式都用完了，显示周期限制提示
  if (helpSystem.isInCycle && !hasAvailableModesInCycle.value) {
    showCycleLimitDialog.value = true
    return
  }

  // 🔥 关键修改：不在这里增加 totalCycles，只打开弹窗
  // 埋点 - 点击帮助按钮
  trackStep4Event(
    'step4_help_button_click',
    conversationData.sessionId,
    1,
    conversationData.conversationCount,
    {
      currentInputLength: userAnswer.value.length,
      hasInput: userAnswer.value.length > 0,
      remainingCycles: remainingCycles.value,
      isInCycle: helpSystem.isInCycle,
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

// 选择帮助模式
function selectHelpMode(mode: 'refine' | 'example' | 'custom') {
  if (!availableHelpModes.value[mode]) {
    console.log(`❌ Step4 - 模式 ${mode} 在当前周期已使用`)
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

// 调用增强的帮助API
async function callEnhancedHelpAPI(
  helpMode: 'refine' | 'example' | 'custom' = 'custom',
  customQuestionText?: string,
  helpRequestContent?: string,
): Promise<string> {
  try {
    const conversationHistory = conversationData.conversationHistory
      .filter((msg) => msg.step === 4)
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

    console.log('📤 Step4 智能帮助 - 发送对话历史:', {
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
          promptDesignFocus: true,
          currentStage: 1,
        },
        step: 4,
        stage: 1,
        sessionId: conversationData.sessionId,
        conversationHistory,
        followUpContext: {
          currentStage: 1,
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

    console.log('📥 Step4 智能帮助 - 收到响应:', {
      response: data.response,
      isSmartHint: data.metadata?.isSmartHint,
      helpMode,
    })

    return data.response || '根据你目前的思考，试着从提示词设计的核心要素来分析。'
  } catch (error) {
    console.error('❌ Step4 - 智能帮助API调用失败:', error)
    throw error
  }
}

// 🔥 修改：打开确认弹窗 - 锁定后直接跳转
const handleNextStep = () => {
  // 如果已经锁定，直接跳转到下一步
  if (isStepLocked.value) {
    router.push('/experiment/step5')
    return
  }

  // 未锁定时，弹出编辑确认弹窗
  editableFinalAnswer.value = finalAnswerSnapshot.value
  showConfirmDialog.value = true
}

const closeConfirmDialog = () => {
  showConfirmDialog.value = false
  // 不清空 editableFinalAnswer，保留用户的编辑
}

// 🔥 重写：确认进入下一步 - 增加数据库快照保存
const confirmNextStep = async () => {
  // 使用编辑后的内容作为最终快照
  finalAnswerSnapshot.value = editableFinalAnswer.value.trim()
  finalAnswerConfirmed.value = true
  showConfirmDialog.value = false

  // 1. 🔥 修改：保存到 localStorage（添加 sessionId）
  simpleStorage.setItem('step4_final_answer', {
    content: finalAnswerSnapshot.value,
    sessionId: conversationData.sessionId, // 🔥 新增
    confirmedAt: new Date().toISOString(),
  })

  // 2. 🔥 新增：保存带 isFinalSnapshot 标志的记录到数据库
  await saveFinalSnapshotToDB({
    sessionId: conversationData.sessionId,
    step: 4,
    stage: 1,
    userInput: '[FINAL_SNAPSHOT]',
    aiResponse: '',
    conversationCount: conversationData.conversationCount,
    timestamp: new Date(),
    context: 'step4_final_confirmation',
    isFinalSnapshot: true, // 🔥 关键字段
    finalAnswerContent: finalAnswerSnapshot.value, // 🔥 完整内容
  })

  // 3. 埋点 - 点击继续下一步
  await trackStep4Event(
    'step4_next_step_click',
    conversationData.sessionId,
    1,
    conversationData.conversationCount,
    {
      answerSubmitted: answerSubmitted.value,
      finalAnswerLength: finalAnswerSnapshot.value.length,
      wasEdited: editableFinalAnswer.value !== finalAnswerSnapshot.value,
    },
  )

  // 4. 保存到 storage（包含快照和锁定标记）
  saveToStorage()

  // 5. 🔒 锁定当前步骤
  isStepLocked.value = true
  const updatedStepData = simpleStorage.getStepData(4) as StepData
  if (updatedStepData) {
    updatedStepData.lockedAt = new Date().toISOString()
    simpleStorage.saveStepData(4, updatedStepData)
  }

  // 6. 跳转到下一步
  router.push('/experiment/step5')
}

const goToNextStep = () => {
  simpleStorage.updateCurrentStep(5)
  saveProgressToLocal()
  router.push('/experiment/step5')
}

const addMessage = (type: 'ai' | 'user' | 'system', content: string) => {
  const messageId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const message: Message = {
    id: messageId,
    type,
    content,
    step: 4,
    stage: 1,
    timestamp: new Date(),
  }

  conversationData.messages.push(message)
  simpleStorage.addMessage(4, type, content, 1)

  nextTick(() => {
    scrollToBottom()
  })
}

const scrollToBottom = () => {
  if (chatScrollArea.value) {
    chatScrollArea.value.scrollTop = chatScrollArea.value.scrollHeight
  }
}

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', {
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
      timestamp: msg.timestamp.toISOString(),
    })),
    conversationHistory: [...conversationData.conversationHistory],
    completedAt: new Date().toISOString(),
  }

  localStorage.setItem('step4_progress', JSON.stringify(progressData))
}

// 获取最近问题用于上下文
const getRecentAIQuestions = (messages: Message[], count = 2): string => {
  return messages
    .filter((m) => m.type === 'ai')
    .slice(-count)
    .map((m) => m.content)
    .join('；')
}

// API 调用函数
const callAIAPI = async (answer: string): Promise<string> => {
  try {
    const conversationHistory = conversationData.conversationHistory
      .filter((msg) => msg.step === 4)
      .map((msg) => ({
        type: msg.type,
        content: msg.content,
        step: msg.step,
        stage: msg.stage || 1,
        timestamp: msg.timestamp,
      }))

    console.log('📤 Step4 - 发送给后端的对话历史:', {
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
          promptDesignPhase: 'user_interface_design',
          currentRound: conversationData.conversationCount,
          totalMessages: conversationHistory.length,
          step4Context: {
            focusArea: '提示词设计',
            userRole: '普通用户',
            systemGoal: '简化AI使用',
          },
        },
        step: 4,
        stage: 1,
        sessionId: conversationData.sessionId,
        conversationHistory,
        followUpContext: {
          conversationRound: conversationData.conversationCount,
          conversationCount: conversationData.conversationCount,
          needsContinuity: true,
          previousUserAnswers: conversationHistory
            .filter((msg) => msg.type === 'user')
            .map((msg) => msg.content)
            .slice(-3),
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()

    console.log('📥 Step4 - 收到后端响应:', {
      response: data.response?.substring(0, 100) + (data.response?.length > 100 ? '...' : ''),
      metadata: data.metadata,
    })

    const aiResponse = data.response || '请继续阐述你的设计思路。'

    await saveConversationToDB({
      sessionId: conversationData.sessionId,
      step: 4,
      stage: 1,
      userInput: answer,
      aiResponse: aiResponse,
      conversationCount: conversationData.conversationCount,
      timestamp: new Date(),
      context: 'prompt_design_development',
    })

    return aiResponse
  } catch (error) {
    console.error('❌ Step4 - AI API 调用失败:', error)
    const fallbackResponse = '请继续阐述你的设计思路。'

    await saveConversationToDB({
      sessionId: conversationData.sessionId,
      step: 4,
      stage: 1,
      userInput: answer,
      aiResponse: fallbackResponse,
      conversationCount: conversationData.conversationCount,
      timestamp: new Date(),
      context: 'prompt_design_fallback',
    })

    return fallbackResponse
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

    console.log('✅ Step4 - 对话已保存到数据库')
  } catch (error) {
    console.error('❌ Step4 - 保存对话失败:', error)
  }
}

// 🔥 新增：保存最终快照到数据库
const saveFinalSnapshotToDB = async (payload: {
  sessionId: string
  step: number
  stage: number
  userInput: string
  aiResponse: string
  conversationCount: number
  timestamp: Date
  context: string
  isFinalSnapshot: boolean
  finalAnswerContent: string
}): Promise<void> => {
  try {
    const experimentId = localStorage.getItem('experimentId')
    const studentName = localStorage.getItem('studentName')

    const response = await fetch('/api/conversations/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': experimentId || '',
      },
      body: JSON.stringify({
        ...payload,
        experimentId,
        studentName,
      }),
    })

    if (response.ok) {
      console.log(`✅ Step${payload.step} - 最终快照已保存到数据库`)
    } else {
      console.error(`❌ Step${payload.step} - 保存最终快照失败:`, response.statusText)
    }
  } catch (error) {
    console.error(`❌ Step${payload.step} - 保存最终快照失败:`, error)
  }
}

// 🔥 修改：保存到存储 - 包含快照
const saveToStorage = () => {
  const stepData: StepData = {
    conversationCount: conversationData.conversationCount,
    stageCompletionStatus: [answerSubmitted.value],
    messages: messages.value.map((msg) => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      step: 4,
      stage: 1,
    })),
    conversationHistory: conversationData.conversationHistory,
    currentStage: 1,
    isCompleted: answerSubmitted.value,
    helpSystem: {
      totalCycles: helpSystem.totalCycles,
      maxCycles: helpSystem.maxCycles,
      currentCycleUsed: { ...helpSystem.currentCycleUsed },
      isInCycle: helpSystem.isInCycle,
    },
    finalAnswerSnapshot: finalAnswerSnapshot.value,
    finalAnswerConfirmed: finalAnswerConfirmed.value,
  }

  simpleStorage.saveStepData(4, stepData)

  console.log('💾 Step4 - 数据已保存到存储（包含快照）:', {
    conversationCount: stepData.conversationCount,
    messagesCount: stepData.messages?.length || 0,
    hasSnapshot: !!finalAnswerSnapshot.value,
    snapshotLength: finalAnswerSnapshot.value.length,
  })
}

// 生命周期
const showContentSequentially = async () => {
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

// 🔥 重写：组件挂载时
onMounted(async () => {
  console.log('🎬 Step4 组件已挂载')

  // 🔥 ========== 智能清理 + 恢复数据（合并逻辑） ==========
  const currentSessionId = simpleStorage.getSessionId()

  // 🔥 检查确认数据（只定义一次）
  let confirmedData = simpleStorage.getItem<{
    content: string
    confirmedAt?: string
    sessionId?: string
  }>('step4_final_answer')

  // 🔥 情况1：存在确认数据，但是不同的 sessionId（说明是新实验）
  if (confirmedData && confirmedData.sessionId && confirmedData.sessionId !== currentSessionId) {
    console.log('🧹 Step4 - 检测到新实验，清除旧的锁定状态')
    console.log('  旧 sessionId:', confirmedData.sessionId)
    console.log('  新 sessionId:', currentSessionId)

    // 清除所有锁定相关数据
    simpleStorage.removeItem('step4_final_answer')

    // 更新 step4_data，移除 lockedAt
    const stepData = simpleStorage.getStepData(4) as StepData | null
    if (stepData) {
      delete stepData.lockedAt
      stepData.finalAnswerConfirmed = false
      stepData.finalAnswerSnapshot = ''
      simpleStorage.saveStepData(4, stepData)
    }

    // 🔥 埋点 - 自动清理旧数据
    await trackStep4Event('step4_auto_unlock', currentSessionId, 1, 0, {
      reason: 'new_session_detected',
      oldSessionId: confirmedData.sessionId,
      newSessionId: currentSessionId,
    })

    console.log('✅ Step4 - 旧锁定状态已自动清除')

    // 🔥 关键：清除后重置 confirmedData 为 null
    confirmedData = null
  }

  // 🔥 ========== 恢复数据（只有在没被清除的情况下才恢复） ==========

  // 第一步：恢复帮助系统状态（最优先）
  const stepData = simpleStorage.getStepData(4) as StepData | null
  if (stepData?.helpSystem) {
    Object.assign(helpSystem, stepData.helpSystem)
    console.log('💾 Step4 - 帮助系统状态已恢复:', helpSystem)
  }

  // 第二步：检查是否已最终确认（锁定检查）- 使用 confirmedData
  if (confirmedData && stepData?.finalAnswerConfirmed) {
    finalAnswerConfirmed.value = true
    finalAnswerSnapshot.value = stepData.finalAnswerSnapshot || ''

    // 🔒 如果已确认，锁定步骤
    isStepLocked.value = true
    console.log('🔒 Step4 - 步骤已锁定，不可编辑')
  }

  // 第三步：埋点 - 进入 Step4
  await trackStep4Event(
    'step4_enter',
    conversationData.sessionId,
    1,
    conversationData.conversationCount,
    {
      initialStage: 1,
      hasHistory: conversationData.messages.length > 0,
      hasSnapshot: !!finalAnswerSnapshot.value,
      isLocked: isStepLocked.value,
    },
  )

  // 第四步：显示内容动画
  showContentSequentially()
})

// 🔥 新增：watch 监听帮助系统状态 - 自动保存
watch(
  () => ({ ...helpSystem }),
  (newState) => {
    if (!isStepLocked.value) {
      // 只在未锁定时保存
      saveHelpSystemState()
      console.log('🔄 Step4 - 帮助系统状态自动保存:', newState)
    }
  },
  { deep: true },
)

// 🔥 新增：组件卸载前保存状态
onBeforeUnmount(() => {
  if (!isStepLocked.value) {
    saveHelpSystemState()
    console.log('👋 Step4 - 组件卸载前保存帮助系统状态')
  }
})
</script>

<style scoped>
/* ==================== 基础容器 ==================== */
.step-four-container {
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
  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
}

.chat-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.chat-scroll-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.chat-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 3px;
}

.chat-scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.5);
}

/* ==================== 对话消息区域 ==================== */
.chat-messages {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ==================== 信息卡片样式 - 提示词设计主题 ==================== */
.info-card-section {
  flex-shrink: 0;
}

.info-card {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border: 2px solid #8b5cf6;
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
  background: linear-gradient(45deg, #8b5cf6, #7c3aed);
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.card-title {
  color: #581c87;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 500;
  flex: 1;
}

.card-content h4 {
  color: #581c87;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

/* 🔥 chart-container 上下布局 */
.chart-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ==================== 提示词要素分析 ==================== */
.prompt-elements {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 题注样式 */
.prompt-elements h5,
.prompt-examples h5 {
  color: #374151;
  font-size: 0.85rem;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  text-align: center;
  padding: 0.5rem;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 6px;
  border-left: 3px solid #8b5cf6;
}

.elements-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.element-item {
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.element-item:hover {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  border-color: #c4b5fd;
}

.element-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.element-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.element-title {
  font-size: 0.8rem;
  font-weight: 600;
}

.element-content {
  padding: 0.75rem;
}

.element-desc {
  font-size: 0.75rem;
  color: #374151;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.element-example {
  font-size: 0.7rem;
  color: #6b7280;
  font-style: italic;
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 2px solid #8b5cf6;
}

/* ==================== 紧凑版 prompt-examples 样式 ==================== */
.prompt-examples {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 🔥 核心：两个问题示例横向排列 */
.examples-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

/* 问题示例卡片 - 更紧凑 */
.example-item {
  padding: 0.6rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.example-item.bad-example {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
}

.scenario-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.4rem;
}

.scenario-tag.bad-tag {
  background: #dc2626;
  color: white;
}

.example-text {
  font-size: 0.8rem;
  color: #334155;
  font-style: italic;
  padding: 0.4rem;
  background: white;
  border-radius: 4px;
  margin-bottom: 0.4rem;
  border-left: 2px solid #f87171;
}

.example-analysis {
  font-size: 0.7rem;
  color: #dc2626;
}

.example-analysis strong {
  display: block;
  margin-bottom: 0.25rem;
}

.example-analysis ul {
  margin: 0;
  padding-left: 1rem;
  line-height: 1.4;
}

.example-analysis li {
  margin-bottom: 0.15rem;
  color: #64748b;
}

/* 🔥 思考引导 - 更紧凑 */
.thinking-guide {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 0.6rem;
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.guide-icon {
  font-size: 1rem;
}

.guide-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #92400e;
}

/* 🔥 4个问题横向排列 */
.guide-questions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.question-item {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  padding: 0.4rem;
  background: white;
  border-radius: 6px;
  font-size: 0.7rem;
  color: #334155;
  line-height: 1.3;
}

.q-icon {
  font-size: 0.85rem;
  flex-shrink: 0;
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
  background: linear-gradient(45deg, #8b5cf6, #7c3aed);
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
  background: linear-gradient(45deg, #8b5cf6, #7c3aed);
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
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border: 2px solid #8b5cf6;
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
  background: #8b5cf6;
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
  color: #7c3aed;
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
  background: #f3e8ff;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
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
  color: #7c3aed;
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
  min-height: 100px;
  font-family: inherit;
  transition:
    border-color 0.3s ease,
    background-color 0.3s ease;
  box-sizing: border-box;
}

.user-input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
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

/* 🔥 帮助按钮徽章 - 低调蓝色 */
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
  background: linear-gradient(45deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  position: relative;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
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
/* 修改帮助弹窗overlay */
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

/* ==================== AI组合响应样式 ==================== */
.ai-response-combined {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

/* 测试结果区域 */
.test-result-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 1.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: #0369a1;
  font-weight: 600;
}

.section-header .icon {
  font-size: 1.2rem;
}

.result-content {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #334155;
  border-left: 3px solid #0ea5e9;
}

/* 分隔线 */
.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent);
  margin: 0.5rem 0;
}

/* 反馈建议区域 */
.feedback-section {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 1.25rem;
}

.feedback-content {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #334155;
  border-left: 3px solid #f59e0b;
}

.feedback-content ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.feedback-content li {
  margin-bottom: 0.5rem;
}

.feedback-content strong {
  color: #92400e;
}

/* 优秀/需改进示例样式 */
.good-example {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #22c55e;
}

.good-tag {
  background: linear-gradient(45deg, #22c55e, #16a34a);
}

.good-note {
  color: #166534;
  background: rgba(34, 197, 94, 0.1);
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.bad-note {
  color: #991b1b;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

/* ==================== 确认弹窗统一样式 ==================== */
/* 修改确认弹窗overlay */
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

/* 任务标题样式 */
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
@media (max-width: 1024px) {
  .guide-questions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .chart-container {
    gap: 1rem;
  }

  .elements-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .examples-grid {
    grid-template-columns: 1fr;
  }

  .guide-questions {
    grid-template-columns: 1fr;
  }

  .element-header {
    padding: 0.5rem;
  }

  .element-content {
    padding: 0.5rem;
  }

  .element-desc {
    font-size: 0.7rem;
  }

  .element-example {
    font-size: 0.65rem;
    padding: 0.4rem;
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

  .ai-response-combined {
    gap: 1rem;
  }

  .test-result-section,
  .feedback-section {
    padding: 1rem;
  }

  .section-header {
    font-size: 0.85rem;
  }

  .result-content,
  .feedback-content {
    font-size: 0.85rem;
    padding: 0.75rem;
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
}

/* 🔥 新增：步骤锁定提示样式 */
.step-locked-banner {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 0 0 12px 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  animation: slideDown 0.5s ease-out;
}

.lock-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.step-locked-banner span:last-child {
  color: #92400e;
  font-weight: 600;
  font-size: 0.95rem;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 禁用状态的输入框样式 */
textarea:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 🔥 新增：步骤锁定提示样式 */
.step-locked-banner {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 0 0 12px 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  animation: slideDown 0.5s ease-out;
}

.lock-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.step-locked-banner span:last-child {
  color: #92400e;
  font-weight: 600;
  font-size: 0.95rem;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 禁用状态的输入框样式 */
textarea:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
