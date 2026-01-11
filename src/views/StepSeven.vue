<template>
  <div class="step-seven-container">
    <!-- 后测问卷弹窗 -->
    <div class="questionnaire-modal" v-if="showQuestionnaire">
      <div class="questionnaire-content">
        <div class="questionnaire-header">
          <div class="header-icon">📋</div>
          <h2>实验后测问卷</h2>
          <!-- ✅ 修复：使用新的进度变量 -->
          <div class="progress-indicator">{{ answeredCount }} / {{ totalRequiredQuestions }}</div>
        </div>

        <div class="questionnaire-body">
          <!-- 问卷说明页 -->
          <div class="questionnaire-intro" v-if="!questionnaireStarted">
            <div class="intro-content">
              <h3>亲爱的同学：</h3>
              <p>您好！本问卷旨在了解您在使用智能体进行问题解决过程中的体验。</p>
              <p>
                问卷<strong>匿名</strong>并且所有题目<strong>没有对错之分</strong>，请根据您的实际情况和真实感受作答。
              </p>

              <div class="scale-instruction">
                <h4>📊 评分标准（5点Likert量表）</h4>
                <div class="scale-legend">
                  <div class="scale-item">
                    <span class="scale-num">1</span>
                    <span class="scale-text">非常不同意</span>
                  </div>
                  <div class="scale-item">
                    <span class="scale-num">2</span>
                    <span class="scale-text">不同意</span>
                  </div>
                  <div class="scale-item">
                    <span class="scale-num">3</span>
                    <span class="scale-text">一般/不确定</span>
                  </div>
                  <div class="scale-item">
                    <span class="scale-num">4</span>
                    <span class="scale-text">同意</span>
                  </div>
                  <div class="scale-item">
                    <span class="scale-num">5</span>
                    <span class="scale-text">非常同意</span>
                  </div>
                </div>
              </div>

              <div class="intro-stats">
                <div class="stat-item">
                  <span class="stat-icon">📝</span>
                  <span class="stat-text"
                    >共 <strong>{{ totalRequiredQuestions }}</strong> 题（必答）+
                    <strong>1</strong> 题（选答）</span
                  >
                </div>
                <div class="stat-item">
                  <span class="stat-icon">⏱️</span>
                  <span class="stat-text">预计 <strong>5-8</strong> 分钟</span>
                </div>
              </div>

              <p class="intro-note">请您在答题时尽量保持真实与直观的判断，感谢您的配合！</p>
            </div>
            <!-- ✅ 统一在Footer显示按钮 -->
          </div>

          <!-- ⭐ 全部问题展示 -->
          <div class="all-questions-container" v-else>
            <!-- 进度提示 -->
            <div class="progress-summary">
              <div class="progress-bar-wrapper">
                <div class="progress-text">
                  已完成 {{ answeredCount }} / {{ totalRequiredQuestions }} 题
                  <span v-if="!isQuestionnaireComplete" class="warning-text">
                    ⚠️ 还有 {{ incompleteQuestions.length }} 题未完成
                  </span>
                  <span v-else class="complete-text">✓ 已全部完成</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${(answeredCount / totalRequiredQuestions) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 循环渲染所有问题 -->
            <div
              v-for="(question, index) in questions"
              :key="question.id"
              :id="`question-${question.id}`"
              class="question-card"
              :class="{
                answered: isQuestionAnswered(question.id),
                unanswered: !isQuestionAnswered(question.id) && question.type !== 'textarea',
                'is-textarea': question.type === 'textarea',
              }"
            >
              <!-- 分类标题 -->
              <div v-if="question.isFirstInCategory" class="category-header">
                <div class="category-icon">{{ question.categoryIcon }}</div>
                <div class="category-info">
                  <h3>{{ question.categoryTitle }}</h3>
                  <p>{{ question.categoryDesc }}</p>
                </div>
              </div>

              <!-- 题目编号和内容 -->
              <div class="question-header">
                <span class="question-number">第 {{ index + 1 }} 题</span>
                <span v-if="isQuestionAnswered(question.id)" class="answered-badge">✓ 已作答</span>
                <span v-else-if="question.required !== false" class="unanswered-badge"
                  >⚠️ 未作答</span
                >
                <span v-else class="optional-badge">选填</span>
              </div>

              <div class="question-content">
                <p class="question-text">{{ question.question }}</p>
              </div>

              <!-- 选择题 - 五点量表 -->
              <div v-if="question.type !== 'textarea'" class="answer-options">
                <div
                  v-for="option in 5"
                  :key="option"
                  class="option-item"
                  :class="{ selected: answers[question.id] === option }"
                  @click="answers[question.id] = option"
                >
                  <div class="option-radio">
                    <span v-if="answers[question.id] === option">●</span>
                    <span v-else>○</span>
                  </div>
                  <div class="option-label">
                    <div class="option-number">{{ option }}</div>
                    <div class="option-text">{{ getScaleLabel(option) }}</div>
                  </div>
                </div>
              </div>

              <!-- 开放性问题 - 文本框 -->
              <div v-else class="textarea-container">
                <textarea
                  v-model="answers[question.id]"
                  :placeholder="question.placeholder || '请输入您的想法...'"
                  class="feedback-textarea"
                  rows="6"
                ></textarea>
                <!-- ✅ 修复：显式转换为字符串 -->
                <div class="char-count">
                  已输入 {{ String(answers[question.id] || '').length }} 字
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="questionnaire-footer">
          <button v-if="!questionnaireStarted" @click="startQuestionnaire" class="btn-primary">
            开始作答
          </button>
          <button
            v-else
            @click="submitQuestionnaire"
            class="btn-submit"
            :class="{ disabled: !isQuestionnaireComplete }"
          >
            <span v-if="isQuestionnaireComplete">提交问卷</span>
            <span v-else>⚠️ 完成所有题目后提交 ({{ incompleteQuestions.length }}题未答)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 在对话区域顶部添加完成卡片 -->
    <div v-if="experimentCompleted" class="experiment-completed-card">
      <div class="completed-card-content">
        <div class="completed-header">
          <div class="completed-icon">🎉</div>
          <div class="completed-info">
            <h3>实验已完成！</h3>
            <p>恭喜你完成了智能通风节能方案设计实验</p>
          </div>
        </div>

        <div class="completed-status">
          <div class="status-item">
            <span class="status-label">完成时间</span>
            <span class="status-value">{{ formatCompletionTime() }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">自动退出倒计时</span>
            <span class="status-value countdown-time">{{ formattedCountdown }}</span>
          </div>
        </div>

        <div class="completed-actions">
          <button class="action-btn primary-btn" @click="openEvaluationModal">
            <span class="btn-icon">📊</span>
            查看评估报告
          </button>
          <button class="action-btn secondary-btn" @click="extendCountdown">
            <span class="btn-icon">⏰</span>
            延长时间
          </button>
          <button class="action-btn danger-btn" @click="handleAutoLogout">
            <span class="btn-icon">🚪</span>
            立即退出
          </button>
        </div>

        <div class="completed-tip">
          <span class="tip-icon">💡</span>
          <span>教师检查完毕后，请点击"立即退出"清空数据</span>
        </div>
      </div>
    </div>

    <!-- ✅ 关键修复：对话滚动区域 - 使用 v-show 而不是 v-if -->
    <div class="chat-scroll-area" ref="chatScrollArea" v-show="!showQuestionnaire">
      <!-- 信息卡片区域 -->
      <div class="info-card-section">
        <div class="info-card" :class="{ 'card-visible': showInfoCard }">
          <div class="card-header">
            <div class="card-icon">🎯</div>
            <div class="card-title">
              经过前面几个阶段的分析和方案制定，你已经完成了教室智能通风节能方案的设计。
              从最初发现40人教室35℃高温问题,到制定节能策略，再到应对60人考试的极端情况，
              整个过程体现了跨学科思维和问题解决能力。现在让我们回顾整个学习过程...
            </div>
          </div>

          <div class="card-content">
            <div class="chart-section">
              <h4>🏆 项目完成情况总览</h4>
              <div class="evaluation-summary">
                <p>{{ evaluationSummary.overview }}</p>
                <p>优点：{{ evaluationSummary.advantage }}</p>
                <p>可改进的地方：{{ evaluationSummary.disadvantage }}</p>
              </div>
              <div class="chart-container">
                <!-- 项目进度展示 -->
                <div class="project-progress">
                  <h5>智能通风节能方案设计进度</h5>
                  <div class="progress-timeline">
                    <div class="timeline-item completed">
                      <div class="timeline-icon">🔍</div>
                      <div class="timeline-content">
                        <div class="timeline-title">问题识别</div>
                        <div class="timeline-desc">分析教室热源与通风问题</div>
                      </div>
                    </div>
                    <div class="timeline-item completed">
                      <div class="timeline-icon">💡</div>
                      <div class="timeline-content">
                        <div class="timeline-title">策略制定</div>
                        <div class="timeline-desc">提出节能解决方案</div>
                      </div>
                    </div>
                    <div class="timeline-item completed">
                      <div class="timeline-icon">🚨</div>
                      <div class="timeline-content">
                        <div class="timeline-title">应急处理</div>
                        <div class="timeline-desc">应对极端情况挑战</div>
                      </div>
                    </div>
                    <div class="timeline-item completed">
                      <div class="timeline-icon">📋</div>
                      <div class="timeline-content">
                        <div class="timeline-title">方案整合</div>
                        <div class="timeline-desc">形成完整解决方案</div>
                      </div>
                    </div>
                    <div class="timeline-item current">
                      <div class="timeline-icon">🎯</div>
                      <div class="timeline-content">
                        <div class="timeline-title">自我反思</div>
                        <div class="timeline-desc">总结学习收获</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 成果展示 -->
                <div class="achievement-summary">
                  <h5>📊 项目成果数据</h5>
                  <div class="achievement-grid">
                    <div class="achievement-item">
                      <span class="achievement-icon">⚡</span>
                      <div class="achievement-info">
                        <span class="achievement-value">30-50%</span>
                        <span class="achievement-label">预期节能效果</span>
                      </div>
                    </div>
                    <div class="achievement-item">
                      <span class="achievement-icon">🌡️</span>
                      <div class="achievement-info">
                        <span class="achievement-value">25-27℃</span>
                        <span class="achievement-label">目标室温范围</span>
                      </div>
                    </div>
                    <div class="achievement-item">
                      <span class="achievement-icon">👥</span>
                      <div class="achievement-info">
                        <span class="achievement-value">40-60人</span>
                        <span class="achievement-label">适应人数范围</span>
                      </div>
                    </div>
                    <div class="achievement-item">
                      <span class="achievement-icon">🎯</span>
                      <div class="achievement-info">
                        <span class="achievement-value">智能化</span>
                        <span class="achievement-label">控制方式</span>
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
              现在让我们进行自我反思：<br />
              ✨ 你在哪一环节做得最满意？<br />
              ✨ 有没有哪里还可以改进？<br />
              ✨ 下次遇到类似问题你会怎么做？
            </div>
          </div>
        </div>

        <!-- 统一的消息循环 -->
        <div v-for="message in messages" :key="message.id" :class="['message', message.type]">
          <!-- 普通消息（AI / User） -->
          <template v-if="message.type !== 'system'">
            <div class="message-avatar">
              {{ message.type === 'ai' ? '🤖' : '👤' }}
            </div>
            <div class="message-content">
              <div class="message-text" v-html="message.content"></div>
              <div class="message-time">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </template>

          <!-- 系统消息：评估生成进度 -->
          <template v-else-if="message.systemType === 'evaluation-progress'">
            <div class="message-avatar">📊</div>
            <div class="message-content evaluation-progress-card">
              <div class="evaluation-generating">
                <h3>🎯 正在生成你的个性化评估报告</h3>

                <div class="generating-warning">
                  <span class="warning-icon">⚠️</span>
                  <span class="warning-text">请耐心等待，<strong>请勿刷新页面</strong></span>
                </div>

                <div class="progress-ring-container">
                  <svg class="progress-ring-svg" width="140" height="140" viewBox="0 0 140 140">
                    <circle
                      class="progress-ring-bg"
                      cx="70"
                      cy="70"
                      r="60"
                      fill="none"
                      stroke="#e2e8f0"
                      stroke-width="8"
                    />
                    <circle
                      class="progress-ring-circle"
                      cx="70"
                      cy="70"
                      r="60"
                      fill="none"
                      stroke="url(#progressGradient)"
                      stroke-width="8"
                      stroke-linecap="round"
                      :stroke-dasharray="progressCircumference"
                      :stroke-dashoffset="progressDashOffset"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#667eea" />
                        <stop offset="100%" stop-color="#764ba2" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div class="progress-text">
                    <div class="progress-percentage">{{ Math.round(evaluationProgress) }}%</div>
                    <div class="progress-label">{{ evaluationStatusText }}</div>
                  </div>
                </div>

                <div class="evaluation-steps">
                  <div
                    class="step-item"
                    :class="{ active: evaluationStage >= 1, completed: evaluationStage > 1 }"
                  >
                    <div class="step-circle">
                      <span v-if="evaluationStage > 1">✓</span>
                      <span v-else>1</span>
                    </div>
                    <div class="step-label">收集数据</div>
                  </div>
                  <div class="step-line" :class="{ active: evaluationStage >= 2 }"></div>
                  <div
                    class="step-item"
                    :class="{ active: evaluationStage >= 2, completed: evaluationStage > 2 }"
                  >
                    <div class="step-circle">
                      <span v-if="evaluationStage > 2">✓</span>
                      <span v-else>2</span>
                    </div>
                    <div class="step-label">AI分析</div>
                  </div>
                  <div class="step-line" :class="{ active: evaluationStage >= 3 }"></div>
                  <div
                    class="step-item"
                    :class="{ active: evaluationStage >= 3, completed: evaluationStage > 3 }"
                  >
                    <div class="step-circle">
                      <span v-if="evaluationStage > 3">✓</span>
                      <span v-else>3</span>
                    </div>
                    <div class="step-label">生成报告</div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 系统消息：评估完成卡片 -->
          <template v-else-if="message.systemType === 'evaluation-complete'">
            <div class="message-avatar">✅</div>
            <div class="message-content evaluation-complete-card">
              <div class="evaluation-complete">
                <div class="complete-icon">🎉</div>
                <h3>评估报告已生成完成！</h3>
                <p>你的个性化学习评估报告已经准备好了，点击下方按钮查看详细内容。</p>
                <button class="view-report-btn" @click="openEvaluationModal">
                  <span class="btn-icon">📊</span>
                  查看评估报告
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 底部用户输入区域 -->
    <div
      class="input-section"
      :class="{ 'input-visible': showAnswerArea }"
      v-show="!showQuestionnaire"
    >
      <div class="input-container">
        <!-- ✅ 新增：生成报告提示区域 -->
        <div v-if="showGenerateReportButton && !evaluationGenerated" class="generate-report-hint">
          <div class="hint-icon">💡</div>
          <div class="hint-content">
            <p class="hint-title">反思对话已进行了 {{ conversationRound }} 轮</p>
            <p class="hint-text">如果你觉得已经充分反思，可以点击下方按钮生成评估报告</p>
          </div>
          <button
            class="generate-report-button"
            @click="handleGenerateReport"
            :disabled="isGeneratingEvaluation"
          >
            <span class="btn-icon">📊</span>
            <span v-if="isGeneratingEvaluation">生成中...</span>
            <span v-else>分析并生成报告</span>
          </button>
        </div>

        <textarea
          v-model="userAnswer"
          placeholder="请分享你的思考和反思..."
          class="user-input"
          :disabled="isGenerating"
          @input="handleInput"
          rows="4"
        ></textarea>
        <div class="input-toolbar">
          <button class="help-button" @click="requestHelp" :disabled="isGenerating">
            <span class="help-icon">💬</span>
            我想提问
          </button>
          <div class="action-buttons">
            <button
              class="submit-button"
              @click="submitAnswer"
              :disabled="!canSubmit || isGenerating"
            >
              <span v-if="isGenerating">分析中...</span>
              <span v-else>提交反思</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统测评反馈弹窗 -->
    <div class="evaluation-modal" v-if="showEvaluationModal" @click="closeEvaluationModal">
      <div class="evaluation-modal-content" @click.stop>
        <div class="evaluation-header">
          <div class="evaluation-icon">📊</div>
          <h2>系统测评反馈</h2>
          <button class="close-btn" @click="closeEvaluationModal">×</button>
        </div>

        <div class="evaluation-body">
          <div v-if="evaluationGenerated">
            <!-- 能力等级评估 -->
            <div class="capability-assessment" v-if="capabilityAssessments.length > 0">
              <h3>📈 能力等级评估</h3>
              <div class="assessment-grid">
                <div
                  class="assessment-item"
                  v-for="(assessment, index) in capabilityAssessments"
                  :key="index"
                >
                  <div class="assessment-name">{{ assessment.name }}</div>
                  <div class="assessment-level" :class="`level-${assessment.level}`">
                    Level {{ assessment.level }}
                  </div>
                  <div class="assessment-description">{{ assessment.description }}</div>
                </div>
              </div>
            </div>

            <!-- 个性化建议 -->
            <div class="personalized-suggestions" v-if="personalizedSuggestions.length > 0">
              <h3>💡 个性化建议</h3>
              <div class="suggestions-list">
                <div
                  class="suggestion-item"
                  v-for="(suggestion, index) in personalizedSuggestions"
                  :key="index"
                >
                  <div class="suggestion-header">
                    <span class="suggestion-title">{{ suggestion.title }}</span>
                    <span class="suggestion-level" :class="`level-${suggestion.level}`">
                      Level {{ suggestion.level }}
                    </span>
                  </div>
                  <div class="suggestion-content">{{ suggestion.content }}</div>
                </div>
              </div>
            </div>

            <!-- 实验完成提示 -->
            <div class="experiment-completion">
              <div class="completion-celebration">
                <div class="completion-icon">🎉</div>
                <h3>恭喜完成实验！</h3>
                <p>你已经成功完成了教室智能通风节能方案的设计，展现了优秀的跨学科问题解决能力！</p>
              </div>
            </div>
          </div>

          <!-- 错误状态 -->
          <div v-else class="evaluation-error">
            <div class="error-icon">⚠️</div>
            <h3>评估生成失败</h3>
            <p>抱歉，系统暂时无法生成评估结果，请稍后重试。</p>
            <button class="retry-btn" @click="generateEvaluationFromHistory">重新生成</button>
          </div>
        </div>

        <div class="evaluation-footer" v-if="evaluationGenerated">
          <button class="finish-btn" @click="finishExperiment">完成实验 🎯</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { simpleStorage } from '../../api/utils/simpleStorage'

const emit = defineEmits(['update-progress', 'experiment-complete'])
const router = useRouter()

// ========== 新增：评估生成进度相关状态 ==========
const evaluationProgress = ref(0)
const evaluationStage = ref(0)
const evaluationStatusText = ref('准备分析学习数据...')
const progressInterval = ref<number | null>(null)

// ========== 新增：完成实验状态管理 ==========
const experimentCompleted = ref(false) // 实验是否已完成
const autoLogoutCountdown = ref(15 * 60) // 倒计时秒数(默认15分钟)
const countdownInterval = ref<number | null>(null)
const showCountdownWarning = ref(false) // 显示倒计时警告

const showGenerateReportButton = ref(false) // 是否显示"生成报告"按钮

// 🔥 新增：定义全局函数接口，避免使用 any
interface WindowWithCountdown extends Window {
  extendCountdown?: () => void
  logoutNow?: () => void
}

// ========== 类型定义 ==========
interface Message {
  id: string
  type: 'ai' | 'user' | 'system'
  content: string
  timestamp: Date
  systemType?: 'evaluation-progress' | 'evaluation-complete'
}

interface CapabilityAssessment {
  name: string
  level: number
  description: string
}

interface PersonalizedSuggestion {
  title: string
  level: number
  content: string
}

interface StoredMessage {
  id: string
  type: string
  content: string
  timestamp: string
  stage?: number
  systemType?: string
}

interface StepData {
  conversationCount?: number
  stageCompletionStatus?: boolean[]
  messages?: StoredMessage[]
  currentStage?: number
  isCompleted?: boolean
  questionnaireCompleted?: boolean
  questionnaireSubmittedAt?: string
  questionnaireId?: string
}

// ========== 问卷状态 ==========
const showQuestionnaire = ref(true)
const questionnaireStarted = ref(false)
// ✅ 修复：支持字符串和数字类型
const answers = reactive<Record<string, number | string>>({})
const questionnaireStartTime = ref(0)

// ========== 原有Step7状态 ==========
const showInfoCard = ref(false)
const showPrompt = ref(false)
const showAnswerArea = ref(false)
const answerSubmitted = ref(false)
const isGenerating = ref(false)
const showEvaluationModal = ref(false)
const isGeneratingEvaluation = ref(false)
const evaluationGenerated = ref(false)
const conversationHistory = ref<string[]>([])

const capabilityAssessments = reactive<CapabilityAssessment[]>([])
const personalizedSuggestions = reactive<PersonalizedSuggestion[]>([])
const messages = reactive<Message[]>([])

const chatScrollArea = ref<HTMLElement | null>(null)
const userAnswer = ref('')
const conversationRound = ref(1)
interface EvaluationSummary {
  overview: string
  advantage: string
  disadvantage: string
}
const evaluationSummary = reactive<EvaluationSummary>({
  overview: '',
  advantage: '',
  disadvantage: '',
})

function computeEvaluationSummary() {
  const grade = simpleStorage.getItem<{ letter?: string; score?: number; breakdown?: unknown }>(
    'step6_grade',
  )
  const draft = simpleStorage.getItem<{ content?: string }>('step6_draft')
  const content = draft?.content || ''
  const hasTemp = /温度|℃|度/.test(content)
  const hasHumidity = /湿度|湿/.test(content)
  const hasCO2 = /CO2|二氧化碳|ppm/i.test(content)
  const core =
    hasTemp && hasCO2
      ? '温度阈值与CO₂联动的通风控制'
      : hasTemp && hasHumidity
        ? '温湿度协同的分层控制'
        : hasTemp
          ? '温度阈值为核心的控制策略'
          : '通风与设备调节的基础策略'
  const letter = grade?.letter || ''
  const overviewBase = `你的方案围绕${core}展开，结构清晰，可执行性较强。`
  let advantageBase = ''
  if (letter === 'A' || letter === 'B') {
    advantageBase = '阈值设定明确、触发条件清晰，能覆盖典型课堂场景。'
  } else if (letter === 'C') {
    advantageBase = '具备可操作的规则，兼顾舒适与节能的基本需求。'
  } else {
    advantageBase = '核心思路明确，基础执行路径已有雏形。'
  }
  const lacks: string[] = []
  if (!hasHumidity) lacks.push('湿度与体感的协同')
  if (!hasCO2) lacks.push('CO₂与通风的联动')
  let disadvantageBase = ''
  if (lacks.length > 0) {
    disadvantageBase = `未充分考虑${lacks.join('、')}，极端天气下适应性不足。`
  } else {
    disadvantageBase = '极端场景的边界条件与回退策略仍需细化。'
  }
  evaluationSummary.overview = overviewBase
  evaluationSummary.advantage = advantageBase
  evaluationSummary.disadvantage = disadvantageBase
  simpleStorage.setItem('step7_evaluation_summary', {
    overview: evaluationSummary.overview,
    advantage: evaluationSummary.advantage,
    disadvantage: evaluationSummary.disadvantage,
  })
}

onMounted(() => {
  computeEvaluationSummary()
})
watch(evaluationGenerated, (val) => {
  if (val) computeEvaluationSummary()
})

// ========== 问卷题目定义 ==========
const questions = ref([
  // === 第一部分：能力问卷 (12题) ===
  {
    id: 'ability_q1',
    category: '能力问卷',
    categoryTitle: '（一）能力问卷',
    categoryDesc: '以下问题旨在了解您的问题解决能力',
    categoryIcon: '🎯',
    isFirstInCategory: true,
    question: '我能快速判断任务中哪些信息是最重要的。',
  },
  {
    id: 'ability_q2',
    category: '能力问卷',
    question: '我善于从多个信息来源中整合相关内容。',
  },
  {
    id: 'ability_q3',
    category: '能力问卷',
    question: '当信息分散时，我也能组织出解决思路。',
  },
  {
    id: 'ability_q4',
    category: '能力问卷',
    question: '我愿意尝试不同的策略来构思哪种效果更好。',
  },
  {
    id: 'ability_q5',
    category: '能力问卷',
    question: '我认为自己设计的方案是可行且易于实施的。',
  },
  {
    id: 'ability_q6',
    category: '能力问卷',
    question: '如果原策略效果不好，我会立刻尝试新方法。',
  },
  {
    id: 'ability_q7',
    category: '能力问卷',
    question: '我总是确保我的每一步都与问题目标一致。',
  },
  {
    id: 'ability_q8',
    category: '能力问卷',
    question: '我在解决问题时会考虑所有环境条件之间的关系。',
  },
  {
    id: 'ability_q9',
    category: '能力问卷',
    question: '我倾向于从整体上把握问题，而非只看细节。',
  },
  {
    id: 'ability_q10',
    category: '能力问卷',
    question: '我在完成任务后会回顾哪些地方做得不够好。',
  },
  {
    id: 'ability_q11',
    category: '能力问卷',
    question: '我能察觉到自己是否需要帮助。',
  },
  {
    id: 'ability_q12',
    category: '能力问卷',
    question: '如果发现问题，我会重新评估并修改我的思路。',
  },

  // === 第二部分：人机协作模式问卷 (12题) ===
  {
    id: 'collaboration_q1',
    category: '人机协作模式',
    categoryTitle: '（二）人机协作模式问卷',
    categoryDesc: '以下问题旨在了解您与AI的协作方式',
    categoryIcon: '🤝',
    isFirstInCategory: true,
    question: '在确定问题时，我依赖AI来生成或解释任务说明。',
  },
  {
    id: 'collaboration_q2',
    category: '人机协作模式',
    question: '我觉得AI比我更擅长快速识别任务的核心问题。',
  },
  {
    id: 'collaboration_q3',
    category: '人机协作模式',
    question: '我认为AI在提供解决问题所需的信息上比我发挥了更大作用。',
  },
  {
    id: 'collaboration_q4',
    category: '人机协作模式',
    question: '我常直接采用AI生成的方案作为解决方案的一部分。',
  },
  {
    id: 'collaboration_q5',
    category: '人机协作模式',
    question: '我会在没有太多修改的情况下使用AI的输出。',
  },
  {
    id: 'collaboration_q6',
    category: '人机协作模式',
    question: '在解决问题时，我主要依靠自己的判断和知识，而不是AI。',
  },
  {
    id: 'collaboration_q7',
    category: '人机协作模式',
    question: '即使AI能够提供帮助，我也倾向于独立完成任务。',
  },
  {
    id: 'collaboration_q8',
    category: '人机协作模式',
    question: '我完成复杂问题解决任务时几乎不使用AI。',
  },
  {
    id: 'collaboration_q9',
    category: '人机协作模式',
    question: '我会自己提出策略，引导AI帮助我澄清问题情境。',
  },
  {
    id: 'collaboration_q10',
    category: '人机协作模式',
    question: '我会根据AI的反馈修改我的问题定义和策略，使之更符合目标。',
  },
  {
    id: 'collaboration_q11',
    category: '人机协作模式',
    question: '我会批判性地阅读AI生成的信息，而不是完全接受。',
  },
  {
    id: 'collaboration_q12',
    category: '人机协作模式',
    question: '当AI的建议不适合时，我会果断放弃它。',
  },

  // === 第三部分：使用体验问卷 (9题) ===
  {
    id: 'experience_q1',
    category: '使用体验',
    categoryTitle: '（三）使用体验问卷',
    categoryDesc: '以下问题旨在了解您对智能体的使用体验',
    categoryIcon: '⭐',
    isFirstInCategory: true,
    question: '我觉得使用该智能体是容易理解和操作的。',
  },
  {
    id: 'experience_q2',
    category: '使用体验',
    question: '我在学习任务中使用该智能体时，几乎不需要额外的技术支持。',
  },
  {
    id: 'experience_q3',
    category: '使用体验',
    question: '我认为快速掌握该智能体的操作对我来说是一件容易的事情。',
  },
  {
    id: 'experience_q4',
    category: '使用体验',
    question: '我觉得该智能体对我的学习和问题解决提供了实际帮助。',
  },
  {
    id: 'experience_q5',
    category: '使用体验',
    question: '使用该智能体让我更容易完成复杂问题解决任务。',
  },
  {
    id: 'experience_q6',
    category: '使用体验',
    question: '我认为该智能体能有效支持我对学习过程的反思与改进。',
  },
  {
    id: 'experience_q7',
    category: '使用体验',
    question: '使用与智能体的对话让我在学习过程中感到更有动力。',
  },
  {
    id: 'experience_q8',
    category: '使用体验',
    question: '我对与智能体一起问题解决的过程使用体验感到满意。',
  },
  {
    id: 'experience_q9',
    category: '使用体验',
    question: '如果有机会，我愿意在未来的学习任务中继续使用智能体。',
  },

  // === 第四部分：开放性反馈 (1题) ===
  {
    id: 'feedback_open',
    category: '反馈',
    categoryTitle: '（四）反馈',
    categoryIcon: '💬',
    isFirstInCategory: true,
    question: '如果您在使用过程中遇到任何问题或建议，欢迎在此反馈，畅所欲言',
    type: 'textarea',
    placeholder: '请输入您的建议或遇到的问题...',
    required: false,
  },
])

// ========== 计算属性 ==========
const totalQuestions = computed(() => questions.value.length)
const canSubmit = computed(() => userAnswer.value.trim().length > 0)

// ✅ 新增计算属性
const totalRequiredQuestions = computed(() => {
  return questions.value.filter((q) => q.type !== 'textarea').length
})

const answeredCount = computed(() => {
  return questions.value.filter((q) => q.type !== 'textarea' && answers[q.id] !== undefined).length
})

const isQuestionnaireComplete = computed(() => {
  return answeredCount.value >= totalRequiredQuestions.value
})

const incompleteQuestions = computed(() => {
  return questions.value.filter((q) => q.type !== 'textarea' && !answers[q.id]).map((q) => q.id)
})

// ========== 计算属性：格式化倒计时 ==========
const formattedCountdown = computed(() => {
  const minutes = Math.floor(autoLogoutCountdown.value / 60)
  const seconds = autoLogoutCountdown.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// ========== 问卷相关方法 ==========
const isQuestionAnswered = (questionId: string) => {
  return answers[questionId] !== undefined
}

const getScaleLabel = (value: number): string => {
  const labels = ['', '非常不同意', '不同意', '一般', '同意', '非常同意']
  return labels[value] || ''
}

const startQuestionnaire = () => {
  questionnaireStarted.value = true
  questionnaireStartTime.value = Date.now()
}

const highlightIncompleteQuestions = () => {
  if (incompleteQuestions.value.length === 0) return

  const firstIncompleteId = incompleteQuestions.value[0]
  const questionElement = document.getElementById(`question-${firstIncompleteId}`)

  if (questionElement) {
    questionElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })

    questionElement.classList.add('highlight-incomplete')

    setTimeout(() => {
      questionElement.classList.remove('highlight-incomplete')
    }, 3000)
  }
}

const validateBeforeSubmit = () => {
  if (!isQuestionnaireComplete.value) {
    alert(`还有 ${incompleteQuestions.value.length} 道题未完成，请完成所有题目后再提交！`)
    highlightIncompleteQuestions()
    return false
  }
  return true
}

const calculateCategoryScores = (answersData: Record<string, number | string>) => {
  const categories = {
    ability: { total: 0, count: 0, average: 0 },
    collaboration: { total: 0, count: 0, average: 0 },
    experience: { total: 0, count: 0, average: 0 },
  }

  questions.value.forEach((q) => {
    const answer = answersData[q.id]
    if (typeof answer === 'number') {
      if (q.id.startsWith('ability_')) {
        categories.ability.total += answer
        categories.ability.count++
      } else if (q.id.startsWith('collaboration_')) {
        categories.collaboration.total += answer
        categories.collaboration.count++
      } else if (q.id.startsWith('experience_')) {
        categories.experience.total += answer
        categories.experience.count++
      }
    }
  })

  Object.keys(categories).forEach((key) => {
    const cat = categories[key as keyof typeof categories]
    cat.average = cat.count > 0 ? Math.round((cat.total / cat.count) * 100) / 100 : 0
  })

  return categories
}

const generateExperimentId = () => {
  const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  localStorage.setItem('experimentId', id)
  return id
}

const submitQuestionnaire = async () => {
  if (!validateBeforeSubmit()) {
    return
  }

  try {
    const sessionId = simpleStorage.getSessionId()
    const experimentId = localStorage.getItem('experimentId') || generateExperimentId()
    const completionTime = Date.now() - questionnaireStartTime.value
    const categoryScores = calculateCategoryScores(answers)

    const questionnaireData = {
      sessionId,
      experimentId,
      experimentType: 'smart-ventilation-system',
      step: 7,
      questionnaireType: 'post_test',
      startedAt: new Date(questionnaireStartTime.value).toISOString(),
      completedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      answers: questions.value.map((q) => ({
        questionId: q.id,
        category: q.category,
        questionText: q.question,
        answerValue: answers[q.id],
        answerLabel:
          typeof answers[q.id] === 'number' ? getScaleLabel(answers[q.id] as number) : '',
        answeredAt: new Date().toISOString(),
      })),
      flatAnswers: { ...answers },
      categoryScores,
      metadata: {
        completionTimeMs: completionTime,
        completionTimeMinutes: Math.round((completionTime / 60000) * 10) / 10,
        totalQuestions: totalQuestions.value,
        answeredQuestions: answeredCount.value,
        completionRate: 100,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
        },
      },
    }

    const response = await fetch('/api/questionnaire/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': experimentId,
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify(questionnaireData),
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorText = await response.text()
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorMessage
          } catch {
            errorMessage = errorText
          }
        }
      } catch (e) {
        console.error('❌ 无法读取错误响应:', e)
      }
      throw new Error(errorMessage)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('服务器返回了非JSON格式的响应')
    }

    const result = await response.json()
    console.log('✅ 问卷提交成功:', result)

    const stepData = simpleStorage.getStepData(7) || {
      conversationCount: 0,
      stageCompletionStatus: [false, false, false],
      messages: [],
      currentStage: 1,
      isCompleted: false,
    }
    stepData.questionnaireCompleted = true
    stepData.questionnaireSubmittedAt = new Date().toISOString()
    stepData.questionnaireId = result.questionnaireId
    simpleStorage.saveStepData(7, stepData)

    showSuccessMessage()

    setTimeout(() => {
      showQuestionnaire.value = false
      showContentSequentially()
    }, 1500)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    console.error('❌ 提交问卷失败:', error)
    alert(
      `问卷提交失败：${errorMessage}\n\n请检查：\n1. 网络连接是否正常\n2. 浏览器控制台是否有更多错误信息\n3. 尝试刷新页面后重试`,
    )
  }
}

const showSuccessMessage = () => {
  const toast = document.createElement('div')
  toast.className = 'success-toast'
  toast.innerHTML = `
    <div class="toast-icon">✓</div>
    <div class="toast-message">问卷提交成功！</div>
  `
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.classList.add('toast-show')
  }, 100)

  setTimeout(() => {
    toast.classList.remove('toast-show')
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 2000)
}

// ========== 原有Step7方法 ==========
const progressCircumference = computed(() => 2 * Math.PI * 60)
const progressDashOffset = computed(() => {
  return progressCircumference.value * (1 - evaluationProgress.value / 100)
})

const addSystemMessage = (systemType: 'evaluation-progress' | 'evaluation-complete') => {
  const messageId = `system_${systemType}_${Date.now()}`
  const message: Message = {
    id: messageId,
    type: 'system',
    content: '',
    timestamp: new Date(),
    systemType: systemType,
  }

  messages.push(message)

  nextTick(() => {
    scrollToBottom()
  })

  console.log(`✅ 添加系统消息: ${systemType}`)
}

const removeSystemMessage = (systemType: 'evaluation-progress' | 'evaluation-complete') => {
  const index = messages.findIndex((msg) => msg.systemType === systemType)
  if (index !== -1) {
    messages.splice(index, 1)
    console.log(`✅ 移除系统消息: ${systemType}`)
  }
}

const openEvaluationModal = () => {
  showEvaluationModal.value = true
  console.log('📊 打开评估结果弹窗')
}

const restoreFromStorage = () => {
  const stepData = simpleStorage.getStepData(7)
  if (stepData) {
    answerSubmitted.value = stepData.stageCompletionStatus?.[0] || false
    messages.length = 0
    if (stepData.messages) {
      stepData.messages.forEach((msg) => {
        messages.push({
          id: msg.id,
          type: msg.type as 'ai' | 'user' | 'system',
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          systemType: msg.systemType as 'evaluation-progress' | 'evaluation-complete' | undefined,
        })
      })
    }
    conversationHistory.value = messages.filter((m) => m.type === 'user').map((m) => m.content)
    conversationRound.value = stepData.conversationCount || 0
  }
}

const saveToStorage = () => {
  const stepData = {
    conversationCount: conversationRound.value,
    stageCompletionStatus: [answerSubmitted.value, false, false],
    messages: messages.map((msg) => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      stage: 1,
      systemType: msg.systemType,
    })),
    currentStage: 1,
    isCompleted: answerSubmitted.value && showEvaluationModal.value,
    questionnaireCompleted: true,
  }
  simpleStorage.saveStepData(7, stepData)
}

const handleInput = () => {
  // 输入处理
}

// ========== 修改 submitAnswer 函数（去掉自动触发评估）==========
const submitAnswer = async () => {
  if (!canSubmit.value) return

  conversationRound.value += 1
  addMessage('user', userAnswer.value)
  conversationHistory.value.push(userAnswer.value)

  const currentAnswer = userAnswer.value
  userAnswer.value = ''
  isGenerating.value = true

  try {
    const response = await callAIAPI(
      currentAnswer,
      conversationRound.value,
      conversationHistory.value,
    )

    addMessage('ai', response)
    answerSubmitted.value = true
    saveToStorage()

    // ✅ 关键改动：去掉自动触发评估，改为显示生成报告按钮
    // 在对话2轮以上后显示生成报告按钮
    if (conversationRound.value >= 2) {
      showGenerateReportButton.value = true
    }

    emit('update-progress', 7)
  } catch (error) {
    console.error('AI API 调用失败:', error)
    addMessage('ai', '抱歉，系统暂时无法处理您的回答，请稍后重试。')
    saveToStorage()
  } finally {
    isGenerating.value = false
  }
}

// ========== 新增：手动触发生成报告的函数 ==========
const handleGenerateReport = async () => {
  if (isGeneratingEvaluation.value) return

  showGenerateReportButton.value = false // 隐藏按钮

  setTimeout(async () => {
    addSystemMessage('evaluation-progress')
    await generateEvaluationFromHistory()
    removeSystemMessage('evaluation-progress')
    addSystemMessage('evaluation-complete')
  }, 500)
}

const generateEvaluationFromHistory = async () => {
  isGeneratingEvaluation.value = true
  evaluationGenerated.value = false

  evaluationProgress.value = 0
  evaluationStage.value = 0
  startProgressSimulation()

  try {
    const sessionId = simpleStorage.getSessionId()
    const userReflection = messages.filter((msg) => msg.type === 'user').pop()?.content || ''

    const response = await fetch('/api/ai/generate-evaluation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': localStorage.getItem('experimentId') || '',
      },
      body: JSON.stringify({
        sessionId: sessionId,
        reflectionAnswer: userReflection,
        experimentType: 'smart-ventilation-system',
        overviewSummary: {
          overview: evaluationSummary.overview,
          advantage: evaluationSummary.advantage,
          disadvantage: evaluationSummary.disadvantage,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`评估API调用失败: ${response.status}`)
    }

    const evaluationData = await response.json()
    completeProgressSimulation()

    capabilityAssessments.length = 0
    personalizedSuggestions.length = 0

    if (
      evaluationData.capabilityAssessments &&
      Array.isArray(evaluationData.capabilityAssessments)
    ) {
      capabilityAssessments.push(...evaluationData.capabilityAssessments)
    }

    if (
      evaluationData.personalizedSuggestions &&
      Array.isArray(evaluationData.personalizedSuggestions)
    ) {
      personalizedSuggestions.push(...evaluationData.personalizedSuggestions)
    }

    if (capabilityAssessments.length === 0 && personalizedSuggestions.length === 0) {
      throw new Error('API返回的评估数据为空')
    }

    simpleStorage.addConversationPair(
      7,
      '[GENERATE_EVALUATION]',
      JSON.stringify({ capabilityAssessments, personalizedSuggestions }),
      1,
      'evaluation_generation',
    )

    evaluationGenerated.value = true
  } catch (error) {
    console.error('生成评估失败:', error)
    completeProgressSimulation()

    // Fallback 数据
    capabilityAssessments.length = 0
    personalizedSuggestions.length = 0

    capabilityAssessments.push(
      { name: '问题识别与信息整合', level: 2, description: '能识别任务条件并主动提取多源信息' },
      { name: '策略制定与执行', level: 2, description: '能给出两个以上策略，并考虑情境变化调整' },
      { name: '元认知与反思', level: 1, description: '有自我评价意识，但缺乏结构化表达' },
      { name: '综合能力协同应用', level: 3, description: '方案中体现多学科整合，表达具有创新性' },
    )

    personalizedSuggestions.push(
      {
        title: '信息整合',
        level: 3,
        content: '你在整合多源信息方面表现出色，建议继续保持这种系统性思维。',
      },
      {
        title: '策略制定',
        level: 2,
        content: '你的策略思维能力不错，建议进一步加强对实施条件的判断。',
      },
      {
        title: '反思能力',
        level: 1,
        content: '建议在反思时使用更结构化的方法，如"做得好的地方-需要改进的地方-下次的计划"。',
      },
    )

    evaluationGenerated.value = true
  } finally {
    isGeneratingEvaluation.value = false
    stopProgressSimulation()
    saveToStorage()
  }
}

const startProgressSimulation = () => {
  evaluationStage.value = 1
  evaluationStatusText.value = '正在收集你的学习数据...'

  progressInterval.value = window.setInterval(() => {
    if (evaluationProgress.value < 100) {
      if (evaluationProgress.value < 20) {
        evaluationProgress.value += 2
      } else if (evaluationProgress.value < 60) {
        if (evaluationStage.value === 1) {
          evaluationStage.value = 2
          evaluationStatusText.value = 'AI正在分析你的能力表现...'
        }
        evaluationProgress.value += 1
      } else if (evaluationProgress.value < 90) {
        if (evaluationStage.value === 2) {
          evaluationStage.value = 3
          evaluationStatusText.value = '正在生成个性化评估报告...'
        }
        evaluationProgress.value += 0.8
      } else {
        evaluationProgress.value += 0.3
      }
    }
  }, 1000)
}

const completeProgressSimulation = () => {
  evaluationProgress.value = 100
  evaluationStage.value = 3
  evaluationStatusText.value = '评估报告生成完成！'
  stopProgressSimulation()
}

const stopProgressSimulation = () => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
    progressInterval.value = null
  }
}

const closeEvaluationModal = () => {
  showEvaluationModal.value = false
  saveToStorage()
}

// ========== 新增：自动退出倒计时 ==========
const startAutoLogoutCountdown = () => {
  // 清除之前的倒计时
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }

  console.log('⏱️ 启动自动退出倒计时: 15分钟')

  countdownInterval.value = window.setInterval(() => {
    autoLogoutCountdown.value--

    // 剩余2分钟时显示警告
    if (autoLogoutCountdown.value === 120 && !showCountdownWarning.value) {
      showCountdownWarning.value = true
      showCountdownWarningDialog()
    }

    // 倒计时结束
    if (autoLogoutCountdown.value <= 0) {
      handleAutoLogout()
    }
  }, 1000)
}

// ========== 新增：显示倒计时警告弹窗 ==========
const showCountdownWarningDialog = () => {
  const warningDialog = document.createElement('div')

  warningDialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
  `

  warningDialog.innerHTML = `
    <div style="
      background: white;
      border-radius: 20px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    ">
      <div style="font-size: 4rem; margin-bottom: 1rem;">⏰</div>
      <h3 style="margin: 0 0 1rem 0; color: #dc2626; font-size: 1.5rem;">即将自动退出</h3>
      <p style="margin: 0 0 1.5rem 0; color: #64748b; font-size: 1rem;">
        还有 <strong>2分钟</strong> 将自动退出登录并清空数据
      </p>
      <div style="display: flex; gap: 1rem;">
        <button
          onclick="window.extendCountdown()"
          style="
            flex: 1;
            padding: 0.75rem 1rem;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          "
        >
          延长15分钟
        </button>
        <button
          onclick="window.logoutNow()"
          style="
            flex: 1;
            padding: 0.75rem 1rem;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          "
        >
          立即退出
        </button>
      </div>
    </div>
  `

  document.body.appendChild(warningDialog)

  interface WindowWithCountdown extends Window {
    extendCountdown?: () => void
    logoutNow?: () => void
  }

  const windowWithFunctions = window as WindowWithCountdown

  windowWithFunctions.extendCountdown = () => {
    extendCountdown()
    if (document.body.contains(warningDialog)) {
      document.body.removeChild(warningDialog)
    }
  }

  windowWithFunctions.logoutNow = () => {
    if (document.body.contains(warningDialog)) {
      document.body.removeChild(warningDialog)
    }
    handleAutoLogout()
  }
}

// ========== 新增:延长倒计时 ==========
const extendCountdown = () => {
  autoLogoutCountdown.value += 15 * 60 // 延长15分钟
  showCountdownWarning.value = false
  console.log('⏱️ 倒计时已延长15分钟')

  // 显示延长成功提示
  showToast('✅ 已延长15分钟', 'success')
}

// ========== 新增：自动退出处理 ==========
const handleAutoLogout = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }

  console.log('🚪 自动退出登录并清空数据')

  // 清除所有本地数据
  simpleStorage.clearSession()
  localStorage.removeItem('experimentId')
  localStorage.removeItem('studentName')
  localStorage.removeItem('loginTime')

  // 显示退出提示
  showAutoLogoutMessage()

  // 2秒后跳转到登录页
  setTimeout(() => {
    router.push('/login')
  }, 2000)
}

// ========== 新增：显示自动退出消息 ==========
const showAutoLogoutMessage = () => {
  const messageOverlay = document.createElement('div')

  messageOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `

  messageOverlay.innerHTML = `
    <div style="
      background: white;
      border-radius: 20px;
      padding: 3rem;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    ">
      <div style="font-size: 4rem; margin-bottom: 1rem;">👋</div>
      <h3 style="margin: 0 0 1rem 0; color: #1e293b; font-size: 1.5rem;">自动退出登录</h3>
      <p style="margin: 0; color: #64748b; font-size: 1rem;">你的实验数据已保存，正在返回登录页...</p>
    </div>
  `

  document.body.appendChild(messageOverlay)
}

// ========== 新增：Toast 提示 ==========
const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
  const toast = document.createElement('div')

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 9999;
    font-size: 1rem;
    font-weight: 600;
  `

  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast)
    }
  }, 3000)
}

// ========== 修改 finishExperiment 函数 ==========
const finishExperiment = () => {
  showEvaluationModal.value = false
  experimentCompleted.value = true // 🔥 标记实验完成

  // 保存完成状态
  simpleStorage.updateCurrentStep(8)
  simpleStorage.addConversationPair(
    7,
    '[EXPERIMENT_COMPLETED]',
    '用户完成了整个实验',
    1,
    'experiment_completion',
  )

  // 保存完成时间戳
  simpleStorage.setItem('experiment_completed_at', new Date().toISOString())

  // 显示庆祝动画
  showCelebrationAnimation()
  emit('experiment-complete')

  // 🔥 启动自动退出倒计时
  startAutoLogoutCountdown()

  // 🔥 不再自动跳转到首页
  // setTimeout(() => {
  //   router.push('/')
  // }, 3000)
}

const showCelebrationAnimation = () => {
  const celebrationOverlay = document.createElement('div')
  celebrationOverlay.className = 'celebration-overlay'
  celebrationOverlay.innerHTML = `
    <div class="celebration-content">
      <div class="big-celebration-icon">🎉</div>
      <h1 class="celebration-title">恭喜完成实验！</h1>
      <div class="celebration-subtitle">你真是太棒了！</div>
    </div>
  `

  celebrationOverlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: 9999; display: flex; align-items: center; justify-content: center;
    animation: celebrationFadeIn 0.5s ease-out;
  `

  const style = document.createElement('style')
  style.textContent = `
    .celebration-content { text-align: center; color: white; animation: celebrationBounceIn 1s ease-out; }
    .big-celebration-icon { font-size: 8rem; margin-bottom: 1rem; animation: celebrationSpin 2s ease-in-out infinite; }
    .celebration-title { font-size: 3rem; font-weight: bold; margin: 0 0 1rem 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
    .celebration-subtitle { font-size: 1.5rem; opacity: 0.9; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
    @keyframes celebrationFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes celebrationBounceIn { 0% { transform: scale(0.3) rotate(-10deg); opacity: 0; } 50% { transform: scale(1.1) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
    @keyframes celebrationSpin { 0%, 100% { transform: rotate(0deg) scale(1); } 25% { transform: rotate(10deg) scale(1.1); } 50% { transform: rotate(0deg) scale(1.2); } 75% { transform: rotate(-10deg) scale(1.1); } }
    @keyframes celebrationFadeOut { from { opacity: 1; } to { opacity: 0; } }
  `

  document.head.appendChild(style)
  document.body.appendChild(celebrationOverlay)

  setTimeout(() => {
    celebrationOverlay.style.animation = 'celebrationFadeOut 0.5s ease-out'
    setTimeout(() => {
      if (document.body.contains(celebrationOverlay)) document.body.removeChild(celebrationOverlay)
      if (document.head.contains(style)) document.head.removeChild(style)
    }, 500)
  }, 3000)
}

const requestHelp = async () => {
  if (isGenerating.value) return
  conversationRound.value += 1
  isGenerating.value = true

  try {
    const helpResponse = await getHelpFromAI()
    addMessage('ai', helpResponse)
    saveToStorage()
  } catch (error) {
    console.error('获取帮助失败:', error)
    addMessage(
      'ai',
      '反思时可以从这些角度考虑：学到了什么新知识？哪个环节最有挑战性？如果重来会怎么改进？',
    )
    saveToStorage()
  } finally {
    isGenerating.value = false
  }
}

const addMessage = (type: 'ai' | 'user' | 'system', content: string) => {
  const messageId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const message: Message = {
    id: messageId,
    type,
    content,
    timestamp: new Date(),
  }

  messages.push(message)
  simpleStorage.addMessage(7, type, content, 1)

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

const formatCompletionTime = () => {
  const completedAt = simpleStorage.getItem<string>('experiment_completed_at')
  if (completedAt) {
    const date = new Date(completedAt)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return '刚刚'
}

const callAIAPI = async (answer: string, round: number, history: string[]): Promise<string> => {
  try {
    const sessionId = simpleStorage.getSessionId()

    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': localStorage.getItem('experimentId') || '',
      },
      body: JSON.stringify({
        sessionId: sessionId,
        step: 7,
        userAnswer: answer,
        conversationRound: round,
        conversationHistory: (history || []).map((h) => ({
          type: 'user',
          content: h,
          step: 7,
          stage: 1,
          timestamp: new Date().toISOString(),
        })),
        context: {
          mode: 'self_reflection',
          topic: 'final_analysis',
        },
        reflectionContext: {
          phase: 'final_reflection',
          experimentCompleted: true,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.response || generateContextualResponse(answer)

    simpleStorage.addConversationPair(7, answer, aiResponse, 1, 'self_reflection')

    return aiResponse
  } catch (error) {
    console.error('Failed to call AI API:', error)
    const fallbackResponse = generateContextualResponse(answer)
    simpleStorage.addConversationPair(7, answer, fallbackResponse, 1, 'self_reflection_fallback')
    return fallbackResponse
  }
}

const generateContextualResponse = (answer: string): string => {
  if (answer.includes('最好') || answer.includes('擅长') || answer.includes('成功')) {
    return '很棒的自我认知！<strong>认识自己的优势</strong>是持续成长的基础。'
  } else if (answer.includes('困难') || answer.includes('难') || answer.includes('挑战')) {
    return '能够诚实面对困难是很好的反思态度！<strong>困难往往是成长的机会</strong>。'
  } else if (answer.includes('改进') || answer.includes('不同') || answer.includes('更好')) {
    return '有改进意识太棒了！<strong>持续改进</strong>是专家级思维的特征。'
  } else if (answer.includes('学到') || answer.includes('收获') || answer.includes('体会')) {
    return '你的学习收获很丰富！<strong>从经验中学习</strong>是最重要的能力之一。'
  } else {
    return '你的反思很深入！通过这次实验，你展现了<strong>系统思考能力</strong>、<strong>创新解决方案</strong>和<strong>灵活应变能力</strong>。'
  }
}

const getHelpFromAI = async (): Promise<string> => {
  try {
    const sessionId = simpleStorage.getSessionId()

    const response = await fetch('/api/ai/get-hint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': localStorage.getItem('experimentId') || '',
      },
      body: JSON.stringify({
        sessionId: sessionId,
        step: 7,
        context: 'self_reflection_help',
        currentPhase: 'final_reflection',
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const helpResponse = data.hint || generateHelpResponse()

    simpleStorage.addConversationPair(7, '[HELP_REQUEST]', helpResponse, 1, 'self_reflection_help')

    return helpResponse
  } catch (error) {
    console.error('获取帮助失败:', error)
    const fallbackHelp = generateHelpResponse()
    simpleStorage.addConversationPair(
      7,
      '[HELP_REQUEST]',
      fallbackHelp,
      1,
      'self_reflection_help_fallback',
    )
    return fallbackHelp
  }
}

const generateHelpResponse = (): string => {
  const hints = [
    '💡 提示：回想一下整个过程，哪个环节你感觉最有成就感？',
    '💡 提示：遇到困难时，你用了什么方法来解决？这个方法有效吗？',
    '💡 提示：如果你的朋友也要做这个实验，你会给他什么建议？',
    '💡 提示：通过这次实验，你对解决问题有了什么新的认识？',
  ]

  return hints[Math.floor(Math.random() * hints.length)]
}

const showContentSequentially = async () => {
  restoreFromStorage()
  showInfoCard.value = true
  await new Promise((resolve) => setTimeout(resolve, 800))
  showPrompt.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  showAnswerArea.value = true
  if (messages.length > 0) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// ========== 修改 onMounted，恢复倒计时状态 ==========
onMounted(() => {
  const stepData = simpleStorage.getStepData(7)

  // 检查是否已完成实验
  const completedAt = simpleStorage.getItem<string>('experiment_completed_at')
  if (completedAt && stepData?.questionnaireCompleted) {
    experimentCompleted.value = true

    // 计算剩余时间
    const completedTime = new Date(completedAt).getTime()
    const now = Date.now()
    const elapsedSeconds = Math.floor((now - completedTime) / 1000)
    const remainingSeconds = 15 * 60 - elapsedSeconds

    if (remainingSeconds > 0) {
      autoLogoutCountdown.value = remainingSeconds
      startAutoLogoutCountdown()
      console.log(`⏱️ 恢复倒计时，剩余 ${remainingSeconds} 秒`)
    } else {
      // 时间已过，立即退出
      handleAutoLogout()
      return
    }
  }

  if (stepData?.questionnaireCompleted) {
    showQuestionnaire.value = false
    showContentSequentially()
  } else {
    showQuestionnaire.value = true
  }
})

// ========== 清理倒计时 ==========
onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
})
</script>

<style scoped>
/* ========== 问卷弹窗样式 ========== */
.questionnaire-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.questionnaire-content {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.4s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.questionnaire-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.75rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.header-icon {
  font-size: 2rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.questionnaire-header h2 {
  flex: 1;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.progress-indicator {
  background: rgba(255, 255, 255, 0.25);
  padding: 0.5rem 1.25rem;
  border-radius: 25px;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.questionnaire-body {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

.questionnaire-body::-webkit-scrollbar {
  width: 6px;
}

.questionnaire-body::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

/* ========== 问卷说明页样式 ========== */
.questionnaire-intro {
  text-align: center;
  max-width: 650px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out;
}

.questionnaire-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  background: white;
}

/* ⭐ 统一按钮样式 - 只显示Footer中的按钮 */
.questionnaire-footer .btn-primary,
.questionnaire-footer .btn-submit {
  width: 100%;
  max-width: 400px;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.questionnaire-footer .btn-primary:hover,
.questionnaire-footer .btn-submit:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
}

.intro-content h3 {
  color: #1e293b;
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.intro-content p {
  font-size: 1rem;
  line-height: 1.8;
  color: #475569;
  margin: 1rem 0;
  text-align: left;
}

.intro-content strong {
  color: #667eea;
  font-weight: 600;
}

.scale-instruction {
  background: linear-gradient(135deg, #f0f4ff 0%, #e6edff 100%);
  border: 2px solid #c7d2fe;
  border-radius: 16px;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: left;
}

.scale-instruction h4 {
  color: #3730a3;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.scale-legend {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
}

.scale-item {
  background: white;
  border: 1.5px solid #c7d2fe;
  border-radius: 10px;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.scale-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.scale-num {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.scale-text {
  color: #475569;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
}

.intro-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #475569;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-text strong {
  color: #667eea;
  font-size: 1.1rem;
}

.intro-note {
  font-size: 0.95rem;
  color: #64748b;
  font-style: italic;
  margin-top: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-left: 4px solid #667eea;
  border-radius: 8px;
  text-align: left;
}

/* ========== 全部问题容器 ========== */
.all-questions-container {
  max-height: 65vh;
  overflow-y: auto;
  padding: 1rem 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.4) transparent;
}

.all-questions-container::-webkit-scrollbar {
  width: 8px;
}

.all-questions-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}

.all-questions-container::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.4);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.all-questions-container::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.6);
}

/* ========== ⭐ 进度提示优化 ========== */
.progress-summary {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e0e7ff;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  z-index: 10;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.progress-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* ⭐ 改这里 */
  align-items: stretch; /* ⭐ 新增这行 */
}

.progress-bar {
  height: 14px;
  border-radius: 7px;
  overflow: hidden;
  border: 1px solid #c7d2fe;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.6); /* 浅色进度条底 */
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.5s ease;
  border-radius: 7px;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.warning-text {
  color: #f59e0b;
  font-weight: 700;
  animation: pulse 2s ease-in-out infinite;
}

.complete-text {
  color: #10b981;
  font-weight: 700;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* ========== 问题卡片优化 ========== */
.question-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 已作答状态 - 增强绿色效果 */
.question-card.answered {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
}

/* 未作答状态 - 增强黄色效果 */
.question-card.unanswered {
  border-color: #fbbf24;
  background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
}

/* 开放性问题卡片 - 增强紫色效果 */
.question-card.is-textarea {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, #faf5ff 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.15);
}

/* 高亮动画（未完成题目） */
.question-card.highlight-incomplete {
  animation: highlightPulse 1s ease-in-out 3;
  border-color: #ef4444 !important;
}

@keyframes highlightPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    transform: scale(1.02);
  }
}

/* ========== ⭐ 分类标题优化 - 白色文字 ========== */
.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.category-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.category-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-info p {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500;
}

/* ========== 题目头部 ========== */
.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.question-number {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.answered-badge {
  color: #10b981;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.unanswered-badge {
  color: #f59e0b;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(245, 158, 11, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.optional-badge {
  color: #8b5cf6;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(139, 92, 246, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

/* ========== 题目内容 ========== */
.question-content {
  margin-bottom: 1rem;
}

.question-text {
  font-size: 1rem;
  color: #1e293b;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

/* ========== ⭐ 选项样式 - 大幅缩小版本（50%+）========== */
.answer-options {
  display: flex;
  gap: 0.3rem;
  justify-content: space-between;
}

.option-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.4rem 0.2rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.option-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.option-item.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f4ff 0%, #e6edff 100%);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
}

.option-radio {
  font-size: 0.8rem;
  color: #667eea;
  line-height: 1;
}

.option-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.option-number {
  font-size: 0.65rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.option-text {
  font-size: 0.55rem;
  color: #475569;
  text-align: center;
  line-height: 1.1;
  font-weight: 500;
  word-break: keep-all;
}

/* ========== 开放性问题文本框 ========== */
.textarea-container {
  margin-top: 1rem;
}

.feedback-textarea {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 2px solid #c7d2fe;
  border-radius: 10px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1e293b;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: inherit;
}

.feedback-textarea:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.feedback-textarea::placeholder {
  color: #94a3b8;
}

.char-count {
  text-align: right;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.5rem;
}

/* ========== 提交按钮优化 ========== */
.btn-submit {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.btn-submit:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-submit.disabled {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  cursor: not-allowed;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
}

.btn-submit.disabled:hover {
  transform: none;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
}

/* 成功提示Toast */
.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 3000;
  opacity: 0;
  transform: translateX(100px);
  transition: all 0.3s ease;
}

.success-toast.toast-show {
  opacity: 1;
  transform: translateX(0);
}

.toast-icon {
  width: 24px;
  height: 24px;
  background: white;
  color: #059669;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.toast-message {
  font-size: 1rem;
  font-weight: 600;
}

/* ========== Step 7 主容器 ========== */
.step-seven-container {
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
  padding: 0 32px;
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

/* 信息卡片样式 */
.info-card-section {
  flex-shrink: 0;
  padding: 32px 32px 0 32px;
}

.info-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  padding: 28px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.info-card.card-visible {
  opacity: 1;
  transform: translateY(0);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 28px;
}

.card-icon {
  background: linear-gradient(135deg, #ff6b6b, #ffd93d);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
}

.card-title {
  color: #1e293b;
  font-size: 16px;
  line-height: 1.7;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.card-content h4 {
  color: #334155;
  font-size: 18px;
  margin: 0 0 20px 0;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}

/* 项目进度时间线 */
.project-progress {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.project-progress h5 {
  color: #475569;
  font-size: 15px;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
}

.progress-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.timeline-item.completed {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border: 1px solid #86efac;
}

.timeline-item.current {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fbbf24;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px rgba(251, 191, 36, 0.5);
  }
  to {
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
  }
}

.timeline-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-title {
  font-weight: 600;
  color: #334155;
  font-size: 14px;
  margin-bottom: 4px;
}

.timeline-desc {
  color: #64748b;
  font-size: 13px;
  line-height: 1.4;
}

/* 成果数据展示 */
.achievement-summary {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.achievement-summary h5 {
  color: #475569;
  font-size: 15px;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
}

.achievement-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.achievement-item {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1.5px solid #bae6fd;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.achievement-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.achievement-icon {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}

.achievement-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.achievement-value {
  font-weight: 700;
  color: #1e40af;
  font-size: 16px;
}

.achievement-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}

/* 对话消息区域 */
.chat-messages {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 对话消息样式 */
.message {
  display: flex;
  margin-bottom: 20px;
  animation: slideIn 0.5s ease-out;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message.ai .message-avatar {
  background: linear-gradient(135deg, #ff6b6b, #ffd93d);
  margin-right: 16px;
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  margin-left: 16px;
}

.message-content {
  max-width: 75%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 20px 24px;
  position: relative;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
}

.message-text {
  font-size: 15px;
  line-height: 1.6;
  color: #334155;
  margin-bottom: 8px;
}

.message.user .message-text {
  color: white;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  text-align: right;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

/* 底部用户输入区域 */
.input-section {
  border-top: 1px solid #e2e8f0;
  background: white;
  padding: 24px 32px;
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
  border-radius: 16px;
  padding: 16px 20px;
  font-size: 15px;
  line-height: 1.5;
  color: #334155;
  background: #f8fafc;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.user-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.user-input::placeholder {
  color: #94a3b8;
  font-size: 15px;
}

.user-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  gap: 16px;
}

.help-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}

.help-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  border-color: #94a3b8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.help-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.help-icon {
  font-size: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.submit-button {
  padding: 12px 28px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 120px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 系统测评弹窗样式 */
.evaluation-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.evaluation-modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

.evaluation-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 20px 20px 0 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.evaluation-icon {
  font-size: 2rem;
}

.evaluation-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.evaluation-body {
  padding: 2rem;
}

/* 加载状态样式 */
.evaluation-loading {
  text-align: center;
  padding: 3rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.evaluation-loading p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.capability-assessment {
  margin-bottom: 2rem;
}

.capability-assessment h3 {
  color: #334155;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.assessment-grid {
  display: grid;
  gap: 1rem;
}

.assessment-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.assessment-name {
  flex: 1;
  font-weight: 500;
  color: #334155;
}

.assessment-level {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 70px;
  text-align: center;
}

.level-1 {
  background: #fef3c7;
  color: #92400e;
}

.level-2 {
  background: #dbeafe;
  color: #1e40af;
}

.level-3 {
  background: #d1fae5;
  color: #065f46;
}

.assessment-description {
  flex: 2;
  color: #64748b;
  font-size: 0.875rem;
}

.personalized-suggestions h3 {
  color: #334155;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestion-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.suggestion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.suggestion-title {
  font-weight: 600;
  color: #334155;
  font-size: 1rem;
}

.suggestion-level {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.suggestion-content {
  color: #64748b;
  line-height: 1.6;
  font-size: 0.9rem;
}

/* 实验完成提示样式 */
.experiment-completion {
  margin-top: 2rem;
  text-align: center;
}

.completion-celebration {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.2);
}

.completion-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out infinite alternate;
}

.completion-celebration h3 {
  color: #92400e;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.completion-celebration p {
  color: #92400e;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

/* 错误状态样式 */
.evaluation-error {
  text-align: center;
  padding: 3rem 2rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.evaluation-error h3 {
  color: #dc2626;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.evaluation-error p {
  color: #64748b;
  font-size: 1rem;
  margin: 0 0 2rem 0;
}

.retry-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.evaluation-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
}

.finish-btn {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  animation: pulse 2s infinite;
}

.finish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
  animation: none;
}

/* 动画定义 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 系统消息样式 */
.message.system {
  display: flex;
  margin-bottom: 20px;
  animation: slideIn 0.5s ease-out;
}

.message.system .message-avatar {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  margin-right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message.system .message-content {
  max-width: 85%;
}

/* 评估进度卡片 */
.evaluation-progress-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
  border: 2px solid #38bdf8 !important;
  border-radius: 20px !important;
  padding: 2.5rem !important;
}

.evaluation-generating h3 {
  color: #0c4a6e;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* 静态警告提示 */
.generating-warning {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
}

.warning-icon {
  font-size: 1.5rem;
}

.warning-text {
  color: #92400e;
  font-size: 0.95rem;
  font-weight: 500;
}

.warning-text strong {
  color: #dc2626;
  font-weight: 700;
}

/* 进度环容器 */
.progress-ring-container {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 2rem auto;
}

/* 🔥 修正后的进度文本样式 - 绝对定位居中 */
.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
  pointer-events: none; /* 防止阻挡SVG的点击事件 */
}

.progress-percentage {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.progress-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap; /* 防止文字换行导致布局问题 */
}

/* 分步指示器 */
.evaluation-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-top: 2rem;
  flex-wrap: nowrap; /* 防止在小屏幕上换行 */
}

.progress-ring-svg {
  transform: rotate(-90deg);
  filter: drop-shadow(0 8px 16px rgba(102, 126, 234, 0.3));
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.5s ease;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.step-item.active {
  opacity: 1;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  border: 3px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: #64748b;
  transition: all 0.3s ease;
}

.step-item.active .step-circle {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
  color: white;
  animation: pulse 1.5s ease-in-out infinite;
}

.step-item.completed .step-circle {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
  color: white;
}

.step-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.step-item.active .step-label {
  color: #334155;
}

.step-line {
  width: 60px;
  height: 3px;
  background: #e2e8f0;
  margin: 0 -5px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.step-line.active {
  background: linear-gradient(90deg, #667eea, #764ba2);
}

/* 评估完成卡片 */
.evaluation-complete-card {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
  border: 2px solid #86efac !important;
  border-radius: 20px !important;
  padding: 2.5rem !important;
}

.evaluation-complete {
  text-align: center;
}

.complete-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out infinite alternate;
}

.evaluation-complete h3 {
  color: #14532d;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.evaluation-complete p {
  color: #166534;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.view-report-btn {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(5, 150, 105, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  animation: pulse 2s infinite;
}

.view-report-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(5, 150, 105, 0.5);
  animation: none;
}

.view-report-btn .btn-icon {
  font-size: 1.3rem;
}

.evaluation-summary {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0 16px;
  color: #334155;
  font-size: 0.95rem;
}
.evaluation-summary p {
  margin: 0.25rem 0;
}

/* ========== 响应式设计 ========== */
@media (max-width: 1200px) {
  .chart-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .achievement-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .questionnaire-content {
    width: 95%;
    max-height: 95vh;
    border-radius: 16px;
  }

  .questionnaire-header {
    padding: 1.25rem 1.5rem;
  }

  .questionnaire-header h2 {
    font-size: 1.25rem;
  }

  .header-icon {
    font-size: 1.5rem;
  }

  .progress-indicator {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }

  .questionnaire-body {
    padding: 1.5rem;
  }

  .scale-legend {
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
  }

  .scale-item {
    padding: 0.5rem 0.25rem;
  }

  .scale-num {
    width: 28px;
    height: 28px;
    font-size: 0.95rem;
  }

  .scale-text {
    font-size: 0.7rem;
  }

  .intro-stats {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .question-card {
    padding: 1.5rem;
  }

  .question-text {
    font-size: 1.05rem;
  }

  .answer-options {
    gap: 0.25rem;
  }

  .option-item {
    padding: 0.35rem 0.15rem;
  }

  .option-radio {
    font-size: 0.75rem;
  }

  .option-number {
    font-size: 0.6rem;
  }

  .option-text {
    font-size: 0.5rem;
  }

  .category-header {
    padding: 1rem;
  }

  .category-icon {
    font-size: 2rem;
  }

  .category-info h3 {
    font-size: 1.1rem;
  }

  .category-info p {
    font-size: 0.85rem;
  }

  .info-card-section {
    padding: 20px 20px 0 20px;
  }

  .chat-scroll-area {
    padding: 0 20px;
  }

  .input-section {
    padding: 20px;
  }

  .message-content {
    max-width: 90%;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .submit-button {
    width: 100%;
  }

  .chart-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .achievement-grid {
    grid-template-columns: 1fr;
  }

  .message {
    margin-bottom: 16px;
  }

  .evaluation-modal-content {
    width: 95%;
    max-width: none;
  }

  .evaluation-header {
    padding: 1rem 1.5rem;
  }

  .evaluation-header h2 {
    font-size: 1.25rem;
  }

  .evaluation-body {
    padding: 1.5rem;
  }

  .assessment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .assessment-name {
    font-size: 0.9rem;
  }

  .assessment-level {
    align-self: flex-start;
    min-width: auto;
  }

  .assessment-description {
    font-size: 0.8rem;
  }

  .suggestion-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .suggestion-level {
    align-self: flex-start;
  }

  .evaluation-progress-card,
  .evaluation-complete-card {
    padding: 1.5rem !important;
  }

  .progress-ring-container {
    width: 120px;
    height: 120px;
  }

  .progress-percentage {
    font-size: 1.75rem;
  }

  .evaluation-steps {
    gap: 0;
  }

  .step-circle {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .step-line {
    width: 40px;
  }

  .step-label {
    font-size: 0.7rem;
  }

  .view-report-btn {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .scale-legend {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .scale-item {
    flex-direction: row;
    justify-content: flex-start;
    padding: 0.75rem;
  }

  .scale-num {
    flex-shrink: 0;
  }

  .scale-text {
    text-align: left;
    font-size: 0.85rem;
  }

  .answer-options {
    gap: 0.2rem;
  }

  .option-item {
    padding: 0.3rem 0.1rem;
  }

  .option-radio {
    font-size: 0.7rem;
  }

  .option-number {
    font-size: 0.55rem;
  }

  .option-text {
    font-size: 0.48rem;
  }
}

/* ========== 完成实验卡片样式 ========== */
.experiment-completed-card {
  margin: 1rem;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 2px solid #10b981;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.2);
  animation: slideInDown 0.5s ease-out;
}

.completed-card-content {
  padding: 1.5rem;
}

.completed-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.completed-icon {
  font-size: 3rem;
  animation: bounce 2s ease-in-out infinite;
}

.completed-info h3 {
  margin: 0 0 0.5rem 0;
  color: #065f46;
  font-size: 1.5rem;
  font-weight: 700;
}

.completed-info p {
  margin: 0;
  color: #047857;
  font-size: 1rem;
}

.completed-status {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-label {
  font-size: 0.875rem;
  color: #059669;
  font-weight: 500;
}

.status-value {
  font-size: 1.125rem;
  color: #065f46;
  font-weight: 600;
}

.countdown-time {
  font-size: 1.5rem;
  color: #dc2626;
  font-family: 'Courier New', monospace;
}

.completed-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.secondary-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.danger-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.danger-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.completed-tip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid #fbbf24;
  border-radius: 10px;
  color: #92400e;
  font-size: 0.875rem;
}

.tip-icon {
  font-size: 1.25rem;
}

/* ========== 倒计时警告弹窗 ========== */
.countdown-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
}

.countdown-warning-box {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.3s ease-out;
}

.warning-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: shake 0.5s ease-in-out infinite;
}

.countdown-warning-box h3 {
  margin: 0 0 1rem 0;
  color: #dc2626;
  font-size: 1.5rem;
}

.countdown-warning-box p {
  margin: 0 0 1.5rem 0;
  color: #64748b;
  font-size: 1rem;
}

.warning-actions {
  display: flex;
  gap: 1rem;
}

.extend-btn,
.logout-now-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.extend-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.extend-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.logout-now-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.logout-now-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

/* ========== 自动退出提示 ========== */
.auto-logout-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.5s ease-out;
}

.auto-logout-box {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.logout-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.auto-logout-box h3 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.5rem;
}

.auto-logout-box p {
  margin: 0;
  color: #64748b;
  font-size: 1rem;
}

/* ========== 动画 ========== */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* ========== 生成报告提示区域 ========== */
.generate-report-hint {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.2);
  animation: slideIn 0.4s ease-out;
}

.hint-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.hint-content {
  flex: 1;
}

.hint-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #78350f;
  margin: 0 0 0.5rem 0;
}

.hint-text {
  font-size: 0.95rem;
  color: #92400e;
  margin: 0;
  line-height: 1.5;
}

.generate-report-button {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.generate-report-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.generate-report-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.generate-report-button .btn-icon {
  font-size: 1.2rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .generate-report-hint {
    flex-direction: column;
    text-align: center;
    padding: 1.25rem;
  }

  .hint-icon {
    font-size: 2rem;
  }

  .generate-report-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
