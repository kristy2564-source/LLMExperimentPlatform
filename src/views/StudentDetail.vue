<template>
  <div class="student-detail">
    <!-- 返回按钮 -->
    <div class="back-navigation">
      <button @click="goBack" class="back-button">
        <span>←</span>
        返回列表
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载学生数据中...</p>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-container">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button @click="loadStudentDetail" class="retry-button">重试</button>
    </div>

    <!-- 学生详情内容 -->
    <div v-else-if="studentData" class="detail-content">
      <!-- 学生基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h2 class="card-title">
            <span class="icon">👤</span>
            学生基本信息
          </h2>
          <button @click="openExportDialog" class="export-button">
            <span class="button-icon">💾</span>
            导出数据
          </button>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">学生ID</span>
            <span class="info-value session-id">{{ studentData.sessionId }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">实验组别</span>
            <span class="info-value">{{ studentData.experimentId }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">当前步骤</span>
            <span class="info-value"
              >Step {{ studentData.basicInfo.currentStep }}/{{
                studentData.basicInfo.totalSteps
              }}</span
            >
          </div>
          <div class="info-item">
            <span class="info-label">完成状态</span>
            <span class="info-value">
              <span class="status-badge" :class="getStatusClass(studentData.basicInfo.status)">
                {{ studentData.basicInfo.status }}
              </span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">总对话数</span>
            <span class="info-value">{{ studentData.behaviorStats.totalConversations }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">总时长</span>
            <span class="info-value">{{ studentData.behaviorStats.timeSpent }} 分钟</span>
          </div>
          <div class="info-item">
            <span class="info-label">求助次数</span>
            <span class="info-value">{{ studentData.behaviorStats.helpRequests.total }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">问卷状态</span>
            <span class="info-value">
              <span
                class="questionnaire-badge"
                :class="{ completed: studentData.basicInfo.hasQuestionnaire }"
              >
                {{ studentData.basicInfo.hasQuestionnaire ? '已提交' : '未提交' }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs-container">
        <div class="tabs-nav">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="tab-button"
            :class="{ active: activeTab === tab.key }"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab 1: 对话历史 -->
        <div v-show="activeTab === 'conversations'" class="tab-content">
          <div class="conversations-section">
            <div class="section-header">
              <h3 class="section-title">对话历史</h3>
              <p class="section-desc">按步骤查看学生与AI的所有对话记录</p>
            </div>

            <!-- 步骤选择器 -->
            <div class="step-selector">
              <button
                v-for="step in 7"
                :key="step"
                @click="selectedStep = step"
                class="step-button"
                :class="{ active: selectedStep === step, hasData: hasConversationsInStep(step) }"
              >
                Step {{ step }}
                <span v-if="hasConversationsInStep(step)" class="conversation-count">
                  ({{ getStepConversationCount(step) }})
                </span>
              </button>
            </div>

            <!-- 对话列表 -->
            <div v-if="selectedStepConversations.length > 0" class="conversation-list">
              <div
                v-for="(conv, index) in selectedStepConversations"
                :key="index"
                class="conversation-item"
              >
                <div class="conversation-header">
                  <span class="conversation-index">#{{ index + 1 }}</span>
                  <span class="conversation-time">{{ formatTime(conv.timestamp) }}</span>
                  <span v-if="conv.metadata?.helpType" class="help-badge">
                    {{ getHelpTypeLabel(conv.metadata.helpType) }}
                  </span>
                </div>
                <div class="conversation-messages">
                  <div class="message user-message">
                    <div class="message-label">学生提问</div>
                    <div class="message-content">{{ conv.userInput }}</div>
                  </div>
                  <div class="message ai-message">
                    <div class="message-label">AI回复</div>
                    <div class="message-content">{{ conv.aiResponse }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-conversations">
              <p>Step {{ selectedStep }} 暂无对话记录</p>
            </div>
          </div>
        </div>

        <!-- Tab 2: 行为数据 -->
        <div v-show="activeTab === 'behavior'" class="tab-content">
          <div class="behavior-section">
            <h3 class="section-title">行为数据统计</h3>

            <!-- 统计卡片 -->
            <div v-if="studentData" class="stats-grid">
              <div class="stats-card">
                <div class="stats-icon">⏱️</div>
                <div class="stats-info">
                  <div class="stats-label">总时长</div>
                  <div class="stats-value">{{ studentData.behaviorStats.timeSpent }} 分钟</div>
                </div>
              </div>
              <div class="stats-card">
                <div class="stats-icon">💬</div>
                <div class="stats-info">
                  <div class="stats-label">总对话数</div>
                  <div class="stats-value">{{ studentData.behaviorStats.totalConversations }}</div>
                </div>
              </div>
              <div class="stats-card">
                <div class="stats-icon">📝</div>
                <div class="stats-info">
                  <div class="stats-label">平均消息长度</div>
                  <div class="stats-value">
                    {{ studentData.behaviorStats.messageStats.avgUserMessageLength }} 字符
                  </div>
                </div>
              </div>
              <div class="stats-card">
                <div class="stats-icon">🆘</div>
                <div class="stats-info">
                  <div class="stats-label">求助次数</div>
                  <div class="stats-value">{{ studentData.behaviorStats.helpRequests.total }}</div>
                </div>
              </div>
            </div>

            <!-- 各步骤对话分布 -->
            <div v-if="studentData" class="distribution-section">
              <h4 class="subsection-title">各步骤对话分布</h4>
              <div class="distribution-bars">
                <div v-for="step in 7" :key="step" class="distribution-bar-item">
                  <div class="distribution-label">Step {{ step }}</div>
                  <div class="distribution-bar-wrapper">
                    <div
                      class="distribution-bar-fill"
                      :style="{ width: getStepPercentage(step) + '%' }"
                    ></div>
                    <span class="distribution-value">{{
                      studentData.behaviorStats.stepDistribution[step] || 0
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 求助模式分析 -->
            <div v-if="studentData" class="help-analysis-section">
              <h4 class="subsection-title">求助模式分析</h4>
              <div class="help-stats">
                <div class="help-stat-item">
                  <span class="help-stat-label">Refine (优化引导):</span>
                  <span class="help-stat-value">{{
                    studentData.behaviorStats.helpRequests.byType.refine
                  }}</span>
                </div>
                <div class="help-stat-item">
                  <span class="help-stat-label">Example (示例):</span>
                  <span class="help-stat-value">{{
                    studentData.behaviorStats.helpRequests.byType.example
                  }}</span>
                </div>
                <div class="help-stat-item">
                  <span class="help-stat-label">Custom (自定义):</span>
                  <span class="help-stat-value">{{
                    studentData.behaviorStats.helpRequests.byType.custom
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: 最终答案 -->
        <div v-show="activeTab === 'answers'" class="tab-content">
          <div v-if="studentData" class="answers-section">
            <h3 class="section-title">各步骤最终答案</h3>
            <p class="section-desc">学生在每个步骤提交的最终答案内容</p>

            <div v-for="step in [2, 3, 4, 5, 6]" :key="step" class="answer-item">
              <div class="answer-header">
                <h4 class="answer-step-title">Step {{ step }} - {{ getStepName(step) }}</h4>
                <span v-if="studentData.finalAnswers[step]" class="answer-time">
                  {{ formatTime(studentData.finalAnswers[step].timestamp) }}
                </span>
              </div>
              <div v-if="studentData.finalAnswers[step]" class="answer-content">
                {{ studentData.finalAnswers[step].content }}
              </div>
              <div v-else class="answer-empty">暂无提交内容</div>
            </div>
          </div>
        </div>

        <!-- Tab 4: 问卷结果 -->
        <div v-show="activeTab === 'questionnaire'" class="tab-content">
          <div v-if="studentData?.questionnaireData" class="questionnaire-section">
            <h3 class="section-title">问卷结果</h3>
            <p class="section-desc">
              完成时间: {{ formatTime(studentData.questionnaireData.completedAt) }} | 用时:
              {{ studentData.questionnaireData.totalTime }} 分钟
            </p>

            <!-- 分数卡片 -->
            <div class="scores-grid">
              <div class="score-card">
                <div class="score-icon">🎯</div>
                <div class="score-info">
                  <div class="score-label">能力评分</div>
                  <div class="score-value">
                    {{ studentData.questionnaireData.scores.ability.average.toFixed(2) }}
                  </div>
                  <div class="score-sub">
                    总分: {{ studentData.questionnaireData.scores.ability.total }} / 60
                  </div>
                </div>
              </div>
              <div class="score-card">
                <div class="score-icon">🤝</div>
                <div class="score-info">
                  <div class="score-label">协作评分</div>
                  <div class="score-value">
                    {{ studentData.questionnaireData.scores.collaboration.average.toFixed(2) }}
                  </div>
                  <div class="score-sub">
                    总分: {{ studentData.questionnaireData.scores.collaboration.total }} / 60
                  </div>
                </div>
              </div>
              <div class="score-card">
                <div class="score-icon">⭐</div>
                <div class="score-info">
                  <div class="score-label">体验评分</div>
                  <div class="score-value">
                    {{ studentData.questionnaireData.scores.experience.average.toFixed(2) }}
                  </div>
                  <div class="score-sub">
                    总分: {{ studentData.questionnaireData.scores.experience.total }} / 45
                  </div>
                </div>
              </div>
            </div>

            <!-- 详细题目列表 -->
            <div
              v-if="studentData.questionnaireData.detailedAnswers"
              class="detailed-answers-container"
            >
              <!-- 能力问卷 -->
              <div class="question-category">
                <h4 class="category-title">
                  <span class="category-icon">🎯</span>
                  （一）能力问卷（12题）
                </h4>
                <div class="questions-list">
                  <div
                    v-for="q in studentData.questionnaireData.detailedAnswers.ability"
                    :key="q.id"
                    class="question-item"
                  >
                    <div class="question-header">
                      <span class="question-number">Q{{ q.number }}</span>
                      <span class="question-text">{{ q.text }}</span>
                    </div>
                    <div class="question-answer">
                      <span class="answer-value" :class="'score-' + q.answer">
                        {{ q.answer }} 分
                      </span>
                      <span class="answer-text">{{ q.answerText }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 人机协作问卷 -->
              <div class="question-category">
                <h4 class="category-title">
                  <span class="category-icon">🤝</span>
                  （二）人机协作模式问卷（12题）
                </h4>
                <div class="questions-list">
                  <div
                    v-for="q in studentData.questionnaireData.detailedAnswers.collaboration"
                    :key="q.id"
                    class="question-item"
                  >
                    <div class="question-header">
                      <span class="question-number">Q{{ q.number }}</span>
                      <span class="question-text">{{ q.text }}</span>
                    </div>
                    <div class="question-answer">
                      <span class="answer-value" :class="'score-' + q.answer">
                        {{ q.answer }} 分
                      </span>
                      <span class="answer-text">{{ q.answerText }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 使用体验问卷 -->
              <div class="question-category">
                <h4 class="category-title">
                  <span class="category-icon">⭐</span>
                  （三）使用体验问卷（9题）
                </h4>
                <div class="questions-list">
                  <div
                    v-for="q in studentData.questionnaireData.detailedAnswers.experience"
                    :key="q.id"
                    class="question-item"
                  >
                    <div class="question-header">
                      <span class="question-number">Q{{ q.number }}</span>
                      <span class="question-text">{{ q.text }}</span>
                    </div>
                    <div class="question-answer">
                      <span class="answer-value" :class="'score-' + q.answer">
                        {{ q.answer }} 分
                      </span>
                      <span class="answer-text">{{ q.answerText }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 如果没有详细答案数据，显示旧版本 -->
            <div v-else class="legacy-questionnaire-notice">
              <p>💡 此学生的问卷数据为旧版本，暂不支持显示详细题目。</p>
            </div>

            <!-- 开放性反馈 -->
            <div v-if="studentData.questionnaireData.feedback" class="feedback-section">
              <h4 class="subsection-title">📝 开放性反馈</h4>
              <div class="feedback-content">
                {{ studentData.questionnaireData.feedback }}
              </div>
            </div>
          </div>
          <div v-else class="questionnaire-empty">
            <p>学生尚未提交问卷</p>
          </div>
        </div>

        <!-- Tab 5: 能力评估 -->
        <div v-show="activeTab === 'evaluation'" class="tab-content">
          <div v-if="studentData?.evaluationData" class="evaluation-section">
            <h3 class="section-title">AI能力评估报告</h3>
            <p class="section-desc">基于学生在实验各阶段的表现，系统生成的个性化能力评估</p>

            <!-- 评估生成时间 -->
            <div class="evaluation-meta">
              <span class="meta-label">📅 评估生成时间：</span>
              <span class="meta-value">{{
                formatTime(studentData.evaluationData.generatedAt)
              }}</span>
            </div>

            <!-- 四个维度的能力评估 -->
            <div class="capability-assessments">
              <h4 class="subsection-title">📈 四维能力评估</h4>
              <div class="assessment-grid">
                <div
                  v-for="(assessment, index) in studentData.evaluationData.capabilityAssessments"
                  :key="index"
                  class="assessment-card"
                >
                  <div class="assessment-header">
                    <span class="assessment-name">{{ assessment.name }}</span>
                    <span class="assessment-level" :class="`level-${assessment.level}`">
                      Level {{ assessment.level }}
                    </span>
                  </div>
                  <div class="assessment-description">
                    {{ assessment.description }}
                  </div>
                  <div class="level-indicator">
                    <div
                      v-for="level in 3"
                      :key="level"
                      class="level-dot"
                      :class="{ active: level <= assessment.level }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 个性化建议 -->
            <div class="personalized-suggestions-section">
              <h4 class="subsection-title">💡 个性化发展建议</h4>
              <div class="suggestions-grid">
                <div
                  v-for="(suggestion, index) in studentData.evaluationData.personalizedSuggestions"
                  :key="index"
                  class="suggestion-card"
                >
                  <div class="suggestion-header">
                    <span class="suggestion-icon">{{ getSuggestionIcon(suggestion.title) }}</span>
                    <span class="suggestion-title">{{ suggestion.title }}</span>
                    <span class="suggestion-level" :class="`level-${suggestion.level}`">
                      Level {{ suggestion.level }}
                    </span>
                  </div>
                  <div class="suggestion-content">
                    {{ suggestion.content }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 对话参与度概览 -->
            <div v-if="studentData.evaluationData.conversationSummary" class="conversation-summary">
              <h4 class="subsection-title">📊 学习参与度概览</h4>
              <div class="summary-stats">
                <div class="summary-stat-item">
                  <span class="stat-label">总对话数：</span>
                  <span class="stat-value">
                    {{ studentData.evaluationData.conversationSummary.totalConversations || 0 }}
                  </span>
                </div>
                <div class="summary-stat-item">
                  <span class="stat-label">完成步骤：</span>
                  <span class="stat-value"> {{ stepsCompletedCount }}/5 </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 无评估数据提示 -->
          <div v-else class="empty-evaluation">
            <div class="empty-icon">🔍</div>
            <h4>暂无能力评估数据</h4>
            <p>该学生尚未完成Step7的自我反思，因此没有生成能力评估报告。</p>
            <p class="tip">学生需完成自我反思后，系统才会生成AI能力评估报告。</p>
          </div>
        </div>
        <div v-show="activeTab === 'operations'" class="tab-content">
          <div class="conversations-section">
            <div class="section-header">
              <h3 class="section-title">操作记录</h3>
              <p class="section-desc">展示点击事件与聊天发送的操作摘要</p>
            </div>
            <div v-if="studentData?.operationSummary" class="stats-grid">
              <div class="stats-card">
                <div class="stats-icon">🖱️</div>
                <div class="stats-info">
                  <div class="stats-label">总点击次数</div>
                  <div class="stats-value">
                    {{ studentData.operationSummary.totalClicks }}
                  </div>
                </div>
              </div>
              <div class="stats-card">
                <div class="stats-icon">💬</div>
                <div class="stats-info">
                  <div class="stats-label">总聊天发送</div>
                  <div class="stats-value">
                    {{ studentData.operationSummary.totalChats }}
                  </div>
                </div>
              </div>
              <div class="stats-card">
                <div class="stats-icon">🧩</div>
                <div class="stats-info">
                  <div class="stats-label">Step6 点击</div>
                  <div class="stats-value">{{ studentData.operationSummary.step6.clicks }}</div>
                </div>
              </div>
              <div class="stats-card">
                <div class="stats-icon">🧩</div>
                <div class="stats-info">
                  <div class="stats-label">Step6 聊天</div>
                  <div class="stats-value">{{ studentData.operationSummary.step6.chats }}</div>
                </div>
              </div>
            </div>
            <div
              v-if="studentData?.operationSummary && !studentData.operationSummary.hasClicks"
              class="empty-conversations"
            >
              <p>该学生无点击操作</p>
            </div>
            <div class="conversation-list">
              <div
                class="conversation-item"
                v-for="step in [1, 2, 3, 4, 5, 6, 7]"
                :key="'ops_' + step"
              >
                <div class="conversation-header">
                  <span class="conversation-index">Step {{ step }} - 操作记录</span>
                  <div class="conversation-meta">
                    <span class="meta-item">点击：{{ getStepClicks(step) }}</span>
                    <span class="meta-item">聊天：{{ getStepChats(step) }}</span>
                  </div>
                  <button class="toggle-button" @click="toggleStepExpand(step)">
                    {{ expandedSteps[step] ? '收起' : '展开' }}
                  </button>
                </div>
                <div v-if="expandedSteps[step]">
                  <div v-if="getStepEvents(step).length > 0">
                    <div
                      class="message ai-message"
                      v-for="(ev, idx) in getStepEvents(step)"
                      :key="'ev_' + step + '_' + idx"
                    >
                      <div class="message-label">{{ getEventLabel(ev.name) }}</div>
                      <div class="message-content">{{ formatTime(ev.timestamp as string) }}</div>
                    </div>
                  </div>
                  <div v-else class="empty-conversations">
                    <p>Step {{ step }} 无操作</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出对话框 -->
    <div v-if="showExportDialog" class="dialog-overlay" @click.self="showExportDialog = false">
      <div class="export-dialog">
        <div class="dialog-header">
          <h3 class="dialog-title">导出学生数据</h3>
          <button class="close-button" @click="showExportDialog = false">✕</button>
        </div>

        <div class="dialog-body">
          <p class="dialog-description">
            选择导出格式，将下载 <strong>{{ studentData?.sessionId }}</strong> 的完整对话数据
          </p>

          <div class="format-options">
            <label class="format-option" :class="{ active: exportFormat === 'word' }">
              <input type="radio" v-model="exportFormat" value="word" :disabled="isExporting" />
              <div class="option-content">
                <div class="option-icon">📄</div>
                <div class="option-info">
                  <div class="option-title">Word文档 (.docx)</div>
                  <div class="option-desc">专业排版，包含完整格式</div>
                </div>
              </div>
            </label>

            <label class="format-option" :class="{ active: exportFormat === 'txt' }">
              <input type="radio" v-model="exportFormat" value="txt" :disabled="isExporting" />
              <div class="option-content">
                <div class="option-icon">📝</div>
                <div class="option-info">
                  <div class="option-title">纯文本 (.txt)</div>
                  <div class="option-desc">简洁格式，便于快速查看</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="cancel-button" @click="showExportDialog = false" :disabled="isExporting">
            取消
          </button>
          <button
            class="confirm-button"
            @click="exportStudentData(exportFormat)"
            :disabled="isExporting"
          >
            <span v-if="isExporting" class="loading-spinner-small">⏳</span>
            <span v-else class="button-icon">💾</span>
            {{ isExporting ? '导出中...' : '确认导出' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// ==================== 类型定义 ====================
interface ConversationMessage {
  userInput: string
  aiResponse: string
  timestamp: string
  stage?: number
  metadata?: {
    helpType?: string
    isFinalSnapshot?: boolean
    finalAnswerContent?: string
    [key: string]: unknown
  }
}

interface FinalAnswer {
  content: string
  timestamp: string
}

interface HelpRequests {
  total: number
  byType: {
    refine: number
    example: number
    custom: number
  }
  byStep: Record<number, number>
}

interface MessageStats {
  total: number
  userMessages: number
  aiMessages: number
  avgUserMessageLength: number
}

interface BehaviorStats {
  timeSpent: number
  totalConversations: number
  stepDistribution: Record<number, number>
  messageStats: MessageStats
  helpRequests: HelpRequests
  activityPeriod: {
    firstActivity: string
    lastActivity: string
  }
}

interface QuestionAnswer {
  question: string
  answer: number | string | null
}

interface DetailedQuestionAnswer {
  id: string
  number: number
  text: string
  answer: number | null
  answerText: string
}

interface QuestionnaireScores {
  ability: {
    total: number
    average: number
  }
  collaboration: {
    total: number
    average: number
  }
  experience: {
    total: number
    average: number
  }
}

interface QuestionnaireData {
  completedAt: string
  totalTime: number
  scores: QuestionnaireScores
  answers: {
    ability: QuestionAnswer[]
    collaboration: QuestionAnswer[]
    experience: QuestionAnswer[]
    feedback: string
  }
  detailedAnswers?: {
    ability: DetailedQuestionAnswer[]
    collaboration: DetailedQuestionAnswer[]
    experience: DetailedQuestionAnswer[]
  }
  feedback?: string
}

interface BasicInfo {
  currentStep: number
  completedSteps: number
  totalSteps: number
  status: string
  hasQuestionnaire: boolean
}

interface StudentData {
  sessionId: string
  experimentId: string
  basicInfo: BasicInfo
  conversationsByStep: Record<number, ConversationMessage[]>
  finalAnswers: Record<number, FinalAnswer>
  behaviorStats: BehaviorStats
  questionnaireData: QuestionnaireData | null
  evaluationData: EvaluationData | null // 新增
  rawConversations?: ConversationMessage[]
  eventsByStep?: Record<
    number,
    { name: string; timestamp: string; stage?: number; data?: Record<string, unknown> }[]
  >
  operationSummary?: {
    totalClicks: number
    totalChats: number
    hasClicks: boolean
    hasChats: boolean
    step6: { clicks: number; chats: number }
  }
}

// 能力评估相关接口
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

interface ConversationSummary {
  totalConversations: number
  stepParticipation: Record<number, number>
  stepsCompleted: Array<number | string>
  lastActivity: string
}

interface EvaluationData {
  generatedAt: string // 修复：Date → string
  capabilityAssessments: CapabilityAssessment[]
  personalizedSuggestions: PersonalizedSuggestion[]
  conversationSummary: ConversationSummary
  metadata: Record<string, unknown>
}

// ==================== 组件状态 ====================
const router = useRouter()
const route = useRoute()

// 状态
const isLoading = ref(false)
const error = ref('')
const studentData = ref<StudentData | null>(null)
const activeTab = ref('conversations')
const selectedStep = ref(2)

// 导出相关状态
const showExportDialog = ref(false)
const isExporting = ref(false)
const exportFormat = ref<'word' | 'txt'>('word')

// 标签页配置
const tabs = [
  { key: 'conversations', label: '对话历史', icon: '💬' },
  { key: 'behavior', label: '行为数据', icon: '📊' },
  { key: 'answers', label: '最终答案', icon: '✍️' },
  { key: 'questionnaire', label: '问卷结果', icon: '📋' },
  { key: 'evaluation', label: '能力评估', icon: '🎯' },
  { key: 'operations', label: '操作记录', icon: '🖱️' },
]

// 计算属性
const selectedStepConversations = computed(() => {
  if (!studentData.value?.conversationsByStep) {
    return []
  }
  return studentData.value.conversationsByStep[selectedStep.value] || []
})

const stepsCompletedCount = computed(() => {
  const steps = studentData.value?.evaluationData?.conversationSummary?.stepsCompleted
  return Array.isArray(steps) ? steps.length : 0
})

// 方法
const loadStudentDetail = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const sessionId = route.params.sessionId as string
    const token = localStorage.getItem('teacherToken')

    if (!token) {
      router.push('/teacher/login')
      return
    }

    console.log('📊 加载学生详情:', sessionId)

    const response = await fetch(`/api/teacher/students/detail?sessionId=${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      localStorage.removeItem('teacherToken')
      router.push('/teacher/login')
      return
    }

    const result = await response.json()

    if (result.success) {
      studentData.value = result.data
      console.log('✅ 学生详情加载成功')
    } else {
      error.value = result.error || '加载失败'
    }
  } catch (err) {
    console.error('❌ 加载学生详情失败:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/teacher/dashboard')
}

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    已完成: 'status-completed',
    进行中: 'status-progress',
    未开始: 'status-notstarted',
  }
  return map[status] || ''
}

const hasConversationsInStep = (step: number) => {
  return (studentData.value?.conversationsByStep[step]?.length ?? 0) > 0
}

const getStepConversationCount = (step: number) => {
  return studentData.value?.conversationsByStep[step]?.length ?? 0
}

const getStepPercentage = (step: number) => {
  if (!studentData.value?.behaviorStats?.stepDistribution) return 0
  const distribution = studentData.value.behaviorStats.stepDistribution
  const max = Math.max(...Object.values(distribution))
  if (max === 0) return 0
  const count = distribution[step] ?? 0
  return (count / max) * 100
}

// 获取建议图标
const getSuggestionIcon = (title: string) => {
  const iconMap: Record<string, string> = {
    信息整合: '🔗',
    策略制定: '🎯',
    反思能力: '💭',
    综合能力: '🌟',
  }
  return iconMap[title] || '💡'
}

const getStepName = (step: number) => {
  const names: Record<number, string> = {
    2: '问题识别',
    3: '方案设计',
    4: '提示词设计',
    5: '应急调整',
    6: '方案整合',
  }
  return names[step] || `步骤${step}`
}

const getHelpTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    refine: '优化引导',
    example: '示例',
    custom: '自定义',
  }
  return labels[type] || type
}

const isClickEvent = (name: string) => {
  const keywords = [
    '_click',
    'open',
    'close',
    'toggle',
    'copy',
    'insert',
    'save',
    'attempt',
    'confirm',
    'cancel',
    'restore',
    'unsaved',
    'draft',
    'fullscreen',
    'guidance',
    'drawer',
    'tab_switch',
    'reference',
    'editor_clear',
    'collapse',
    'expand',
    'next_step',
    'confirm_dialog',
    'help_button',
  ]
  if (!name) return false
  if (name.includes('chat_send') || name.includes('chat_receive')) return false
  return keywords.some((kw) => name.includes(kw))
}

const getEventLabel = (name: string) => {
  const map: Record<string, string> = {
    step6_ai_drawer_open: '打开 AI 助手',
    step6_ai_drawer_close: '关闭 AI 助手',
    step6_ai_tab_switch: '切换 AI 标签',
    step6_reference_generate: '生成参考方案',
    step6_reference_regenerate: '重新生成参考方案',
    step6_reference_copy: '复制参考方案',
    step6_reference_insert: '插入参考方案',
    step6_draft_save: '保存草稿',
    step6_fullscreen_toggle: '切换全屏',
    step6_draft_preview_toggle: '切换初稿预览',
    step6_submit_attempt: '尝试提交',
    step6_submit_confirm: '确认提交',
    step6_submit_cancel: '取消提交',
    step6_unsaved_leave_prompt: '未保存离开提示',
    step6_unsaved_leave_saved: '离开前保存草稿',
    step6_unsaved_leave_discard: '离开前不保存',
    step6_chat_send: '聊天发送',
  }
  return map[name] || name
}

const expandedSteps = ref<Record<number, boolean>>({
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: true,
  7: false,
})

const getStepEvents = (step: number) => {
  const byStep = studentData.value?.eventsByStep || {}
  return byStep[step] || []
}

const getStepClicks = (step: number) => {
  return getStepEvents(step).filter((e) => isClickEvent(e.name)).length
}

const getStepChats = (step: number) => {
  return getStepEvents(step).filter(
    (e) => typeof e.name === 'string' && e.name.includes('chat_send'),
  ).length
}

const toggleStepExpand = (step: number) => {
  expandedSteps.value[step] = !expandedSteps.value[step]
}

const formatTime = (timestamp: string) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 打开导出对话框
const openExportDialog = () => {
  if (!studentData.value) {
    console.error('没有学生数据可导出')
    return
  }
  showExportDialog.value = true
}

// 导出学生数据
const exportStudentData = async (format: 'word' | 'txt') => {
  if (!studentData.value) {
    console.error('没有学生数据可导出')
    return
  }

  isExporting.value = true
  const sessionId = studentData.value.sessionId

  try {
    const token = localStorage.getItem('teacherToken')
    if (!token) {
      router.push('/teacher/login')
      return
    }

    console.log(`📥 开始导出 ${format} 格式数据...`)

    const response = await fetch('/api/teacher/export/student-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
        format,
      }),
    })

    if (!response.ok) {
      throw new Error('导出失败')
    }

    // 创建下载链接
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `student_${sessionId}_${Date.now()}.${format === 'word' ? 'docx' : 'txt'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    console.log('✅ 导出成功')
    showExportDialog.value = false
  } catch (error) {
    console.error('❌ 导出失败:', error)
    alert('导出失败，请稍后重试')
  } finally {
    isExporting.value = false
  }
}

onMounted(() => {
  loadStudentDetail()
})
</script>

<style scoped>
.student-detail {
  max-width: 100%;
}

/* 返回导航 */
.back-navigation {
  margin-bottom: 1.5rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
}

.back-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

/* 基本信息卡片 */
.info-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.icon {
  font-size: 1.75rem;
}

.export-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.export-button:hover {
  background: #059669;
  transform: translateY(-1px);
}

.button-icon {
  font-size: 1.1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 1.125rem;
  color: #1e293b;
  font-weight: 600;
}

.session-id {
  font-family: monospace;
  color: #3b82f6;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-progress {
  background: #fef3c7;
  color: #92400e;
}

.status-notstarted {
  background: #f1f5f9;
  color: #475569;
}

.questionnaire-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #f1f5f9;
  color: #64748b;
}

.questionnaire-badge.completed {
  background: #dbeafe;
  color: #1e40af;
}

/* 标签页 */
.tabs-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabs-nav {
  display: flex;
  border-bottom: 2px solid #f1f5f9;
  background: #f8fafc;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
  position: relative;
}

.tab-button:hover {
  background: #f1f5f9;
  color: #334155;
}

.tab-button.active {
  color: #3b82f6;
  background: white;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-content {
  padding: 2rem;
}

/* 对话历史 */
.conversations-section {
  max-width: 100%;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.section-desc {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.step-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.step-button {
  padding: 0.625rem 1.25rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
}

.step-button:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.step-button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.step-button.hasData {
  border-color: #3b82f6;
}

.conversation-count {
  font-size: 0.75rem;
  opacity: 0.8;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.conversation-item {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.conversation-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.conversation-index {
  font-weight: 700;
  color: #3b82f6;
  font-size: 0.875rem;
}

.conversation-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.meta-item {
  font-size: 0.875rem;
  color: #64748b;
}

.toggle-button {
  padding: 0.375rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #334155;
}

.toggle-button:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.conversation-time {
  color: #64748b;
  font-size: 0.875rem;
}

.help-badge {
  padding: 0.25rem 0.75rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.conversation-messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  padding: 1rem;
  border-radius: 8px;
}

.user-message {
  background: white;
  border-left: 3px solid #3b82f6;
}

.ai-message {
  background: white;
  border-left: 3px solid #10b981;
}

.message-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.message-content {
  color: #1e293b;
  line-height: 1.6;
  white-space: pre-wrap;
}

.empty-conversations {
  text-align: center;
  padding: 3rem 2rem;
  color: #64748b;
}

/* 行为数据 */
.behavior-section {
  max-width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stats-icon {
  font-size: 2.5rem;
  opacity: 0.9;
}

.stats-info {
  flex: 1;
}

.stats-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.stats-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.subsection-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 2rem 0 1rem 0;
}

.distribution-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.distribution-bar-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.distribution-label {
  min-width: 80px;
  font-weight: 500;
  color: #64748b;
}

.distribution-bar-wrapper {
  flex: 1;
  height: 30px;
  background: #e2e8f0;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.distribution-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s;
}

.distribution-value {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 600;
  color: #1e293b;
}

.help-analysis-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
}

.help-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.help-stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
}

.help-stat-label {
  color: #64748b;
  font-weight: 500;
}

.help-stat-value {
  color: #1e293b;
  font-weight: 700;
}

/* 最终答案 */
.answers-section {
  max-width: 100%;
}

.answer-item {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.answer-step-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.answer-time {
  color: #64748b;
  font-size: 0.875rem;
}

.answer-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  line-height: 1.6;
  color: #1e293b;
  white-space: pre-wrap;
}

.answer-empty {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-style: italic;
}

/* 问卷结果 */
.questionnaire-section {
  max-width: 100%;
}

.scores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.score-card {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-icon {
  font-size: 2.5rem;
  opacity: 0.9;
}

.score-info {
  flex: 1;
}

.score-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.score-value {
  font-size: 2rem;
  font-weight: 700;
}

.score-sub {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

.feedback-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
}

.feedback-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  line-height: 1.6;
  color: #1e293b;
  white-space: pre-wrap;
}

.questionnaire-empty {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

/* 加载和错误状态 */
.loading-container,
.error-container {
  background: white;
  padding: 4rem 2rem;
  border-radius: 12px;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.retry-button:hover {
  background: #2563eb;
}

/* 详细问卷答案样式 */
.detailed-answers-container {
  margin-top: 30px;
}

.question-category {
  margin-bottom: 40px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-icon {
  font-size: 24px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #e5e7eb;
  transition: all 0.3s ease;
}

.question-item:hover {
  border-left-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.question-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.question-number {
  background: #3b82f6;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.question-text {
  flex: 1;
  color: #374151;
  font-size: 15px;
  line-height: 1.6;
}

.question-answer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 55px;
}

.answer-value {
  font-weight: 700;
  font-size: 16px;
  padding: 4px 12px;
  border-radius: 6px;
  min-width: 60px;
  text-align: center;
}

.answer-value.score-1 {
  background: #fee2e2;
  color: #991b1b;
}

.answer-value.score-2 {
  background: #fed7aa;
  color: #9a3412;
}

.answer-value.score-3 {
  background: #fef3c7;
  color: #92400e;
}

.answer-value.score-4,
.answer-value.score-5 {
  background: #d1fae5;
  color: #065f46;
}

.answer-text {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.legacy-questionnaire-notice {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1.5rem;
}

.legacy-questionnaire-notice p {
  margin: 0;
  color: #92400e;
  font-weight: 500;
}

/* 导出对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

.export-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f1f5f9;
  color: #475569;
}

.dialog-body {
  padding: 2rem;
}

.dialog-description {
  color: #64748b;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.format-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.format-option {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: block;
}

.format-option:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.format-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.format-option input[type='radio'] {
  display: none;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.option-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.option-info {
  flex: 1;
}

.option-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.option-desc {
  font-size: 0.875rem;
  color: #64748b;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-button,
.confirm-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-button {
  background: #f1f5f9;
  color: #64748b;
}

.cancel-button:hover:not(:disabled) {
  background: #e2e8f0;
}

.confirm-button {
  background: #3b82f6;
  color: white;
}

.confirm-button:hover:not(:disabled) {
  background: #2563eb;
}

.cancel-button:disabled,
.confirm-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner-small {
  animation: spin 1s linear infinite;
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
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* ==================== 能力评估样式 ==================== */
.evaluation-section {
  max-width: 100%;
}

.evaluation-meta {
  background: #f8fafc;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  border-left: 4px solid #3b82f6;
}

.meta-label {
  font-weight: 600;
  color: #475569;
}

.meta-value {
  color: #64748b;
  margin-left: 0.5rem;
}

/* 能力评估卡片 */
.capability-assessments {
  margin-top: 2rem;
}

.subsection-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.assessment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.assessment-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.assessment-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.assessment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.assessment-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
}

.assessment-level {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.assessment-level.level-1 {
  background: #fee2e2;
  color: #b91c1c;
}

.assessment-level.level-2 {
  background: #fef3c7;
  color: #d97706;
}

.assessment-level.level-3 {
  background: #d1fae5;
  color: #059669;
}

.assessment-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.9375rem;
}

.level-indicator {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.level-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: all 0.3s;
}

.level-dot.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

/* 个性化建议 */
.personalized-suggestions-section {
  margin-top: 2.5rem;
}

.suggestions-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestion-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  transition: all 0.2s;
}

.suggestion-card:hover {
  background: white;
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.suggestion-icon {
  font-size: 1.5rem;
}

.suggestion-title {
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.suggestion-level {
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.75rem;
}

.suggestion-level.level-1 {
  background: #fee2e2;
  color: #b91c1c;
}

.suggestion-level.level-2 {
  background: #fef3c7;
  color: #d97706;
}

.suggestion-level.level-3 {
  background: #d1fae5;
  color: #059669;
}

.suggestion-content {
  color: #475569;
  line-height: 1.6;
  padding-left: 2.25rem;
}

/* 对话参与度概览 */
.conversation-summary {
  margin-top: 2.5rem;
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.summary-stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  color: #1e293b;
  font-weight: 700;
  font-size: 1.125rem;
}

/* 空评估状态 */
.empty-evaluation {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-evaluation h4 {
  color: #1e293b;
  font-size: 1.25rem;
  margin: 1rem 0 0.5rem 0;
}

.empty-evaluation p {
  color: #64748b;
  margin: 0.5rem 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.empty-evaluation .tip {
  background: #eff6ff;
  color: #1e40af;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  display: inline-block;
  font-weight: 500;
}
</style>
