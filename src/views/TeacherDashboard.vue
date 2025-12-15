<template>
  <div class="teacher-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">学生数据总览</h1>
      <button class="refresh-button" @click="loadStudentList" :disabled="isLoading">
        <span class="button-icon">🔄</span>
        刷新数据
      </button>
    </div>

    <!-- 统计卡片 -->
    <div v-if="statistics" class="statistics-cards">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-label">总学生数</div>
          <div class="stat-value">{{ statistics.totalStudents }}</div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-label">已完成</div>
          <div class="stat-value">{{ statistics.completedStudents }}</div>
          <div class="stat-sub">{{ completionRate }}%</div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <div class="stat-label">进行中</div>
          <div class="stat-value">{{ statistics.inProgressStudents }}</div>
        </div>
      </div>

      <div class="stat-card info">
        <div class="stat-icon">💬</div>
        <div class="stat-content">
          <div class="stat-label">平均对话数</div>
          <div class="stat-value">{{ statistics.averageConversations }}</div>
        </div>
      </div>

      <div class="stat-card primary">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-label">平均时长</div>
          <div class="stat-value">{{ statistics.averageTimeSpent }}</div>
          <div class="stat-sub">分钟</div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-group">
        <label class="filter-label">状态筛选:</label>
        <select v-model="filterStatus" @change="loadStudentList" class="filter-select">
          <option value="">全部</option>
          <option value="已完成">已完成</option>
          <option value="进行中">进行中</option>
          <option value="未开始">未开始</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">实验组别:</label>
        <input
          v-model="filterExperimentId"
          @input="loadStudentList"
          type="text"
          placeholder="输入实验ID筛选"
          class="filter-input"
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">搜索:</label>
        <input
          v-model="searchKeyword"
          @input="handleSearch"
          type="text"
          placeholder="搜索学生ID"
          class="filter-input"
        />
      </div>
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
      <button @click="loadStudentList" class="retry-button">重试</button>
    </div>

    <!-- 学生列表 -->
    <div v-else-if="filteredStudents.length > 0" class="students-table-container">
      <table class="students-table">
        <thead>
          <tr>
            <th>学生ID</th>
            <th>实验组别</th>
            <th>当前步骤</th>
            <th>状态</th>
            <th>对话数</th>
            <th>时长(分钟)</th>
            <th>问卷</th>
            <th>最后活跃</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in filteredStudents" :key="student.sessionId" class="table-row">
            <td class="session-id">{{ student.sessionId }}</td>
            <td>{{ student.experimentId }}</td>
            <td>
              <div class="step-progress">
                <span class="step-text"
                  >Step {{ student.currentStep }}/{{ student.totalSteps }}</span
                >
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: (student.currentStep / student.totalSteps) * 100 + '%' }"
                  ></div>
                </div>
              </div>
            </td>
            <td>
              <span class="status-badge" :class="getStatusClass(student.status)">
                {{ student.status }}
              </span>
            </td>
            <td>{{ student.totalConversations }}</td>
            <td>{{ student.timeSpent }}</td>
            <td>
              <span class="questionnaire-badge" :class="{ completed: student.hasQuestionnaire }">
                {{ student.hasQuestionnaire ? '已提交' : '未提交' }}
              </span>
            </td>
            <td>{{ formatTime(student.lastActivity) }}</td>
            <td>
              <button @click="viewStudentDetail(student.sessionId)" class="view-button">
                查看详情
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 无数据提示 -->
    <div v-else class="empty-container">
      <div class="empty-icon">📭</div>
      <p>暂无学生数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// ==================== 类型定义 ====================
interface QuestionnaireData {
  completedAt: string
  totalTime: number
  abilityScore: number
  collaborationScore: number
}

interface Student {
  sessionId: string
  experimentId: string
  currentStep: number
  completedSteps: number
  totalSteps: number
  status: '已完成' | '进行中' | '未开始'
  hasQuestionnaire: boolean
  totalConversations: number
  timeSpent: number
  firstActivity: string
  lastActivity: string
  questionnaireData: QuestionnaireData | null
}

interface Statistics {
  totalStudents: number
  completedStudents: number
  inProgressStudents: number
  notStartedStudents: number
  averageTimeSpent: number
  averageConversations: number
  questionnaireSubmissionRate: number
}

// ==================== 组件状态 ====================
const router = useRouter()

// 状态
const isLoading = ref(false)
const error = ref('')
const students = ref<Student[]>([])
const statistics = ref<Statistics | null>(null)

// 筛选条件
const filterStatus = ref('')
const filterExperimentId = ref('')
const searchKeyword = ref('')

// 计算完成率
const completionRate = computed(() => {
  if (!statistics.value || statistics.value.totalStudents === 0) return 0
  return Math.round((statistics.value.completedStudents / statistics.value.totalStudents) * 100)
})

// 过滤后的学生列表
const filteredStudents = computed(() => {
  let result = students.value

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (s) =>
        s.sessionId.toLowerCase().includes(keyword) ||
        s.experimentId.toLowerCase().includes(keyword),
    )
  }

  return result
})

// 方法
const loadStudentList = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('teacherToken')
    if (!token) {
      router.push('/teacher/login')
      return
    }

    const params = new URLSearchParams()
    if (filterStatus.value) params.append('status', filterStatus.value)
    if (filterExperimentId.value) params.append('experimentId', filterExperimentId.value)

    const response = await fetch(`/api/teacher/students/list?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      // Token无效，跳转到登录页
      localStorage.removeItem('teacherToken')
      router.push('/teacher/login')
      return
    }

    const result = await response.json()

    if (result.success) {
      students.value = result.data.students
      statistics.value = result.data.statistics
      console.log('✅ 学生列表加载成功:', students.value.length, '个学生')
    } else {
      error.value = result.error || '加载失败'
    }
  } catch (err) {
    console.error('❌ 加载学生列表失败:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  // 搜索是响应式的，不需要重新加载
}

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    已完成: 'status-completed',
    进行中: 'status-progress',
    未开始: 'status-notstarted',
  }
  return map[status] || ''
}

const formatTime = (timestamp: string) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  // 小于1天
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 大于1天
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const viewStudentDetail = (sessionId: string) => {
  router.push(`/teacher/student/${sessionId}`)
}

onMounted(() => {
  loadStudentList()
})
</script>

<style scoped>
.teacher-dashboard {
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-icon {
  font-size: 1.1rem;
}

/* 统计卡片 */
.statistics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-card.success {
  border-left: 4px solid #10b981;
}

.stat-card.warning {
  border-left: 4px solid #f59e0b;
}

.stat-card.info {
  border-left: 4px solid #3b82f6;
}

.stat-card.primary {
  border-left: 4px solid #8b5cf6;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-sub {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

/* 筛选区域 */
.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.filter-select,
.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 学生表格 */
.students-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.students-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.students-table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
}

.table-row:hover {
  background: #f8fafc;
}

.session-id {
  font-family: monospace;
  font-weight: 500;
  color: #3b82f6;
}

.step-progress {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.step-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.progress-bar {
  width: 100px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
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
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #f1f5f9;
  color: #64748b;
}

.questionnaire-badge.completed {
  background: #dbeafe;
  color: #1e40af;
}

.view-button {
  padding: 0.375rem 0.875rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.view-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* 加载和错误状态 */
.loading-container,
.error-container,
.empty-container {
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

.error-icon,
.empty-icon {
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
</style>
