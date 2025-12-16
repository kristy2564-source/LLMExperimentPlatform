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

    <!-- 批量选择工具栏 -->
    <div class="batch-select-toolbar">
      <div class="batch-select-left">
        <span class="info-text">
          共 <strong>{{ filteredStudents.length }}</strong> 个学生， 当前第
          <strong>{{ currentPage }}</strong> 页（每页 {{ pageSize }} 个）
        </span>
      </div>

      <div class="batch-select-actions">
        <!-- 快速选择下拉菜单 -->
        <div class="batch-select-dropdown">
          <button class="batch-select-btn" @click="showBatchSelectMenu = !showBatchSelectMenu">
            <span class="btn-icon">⚡</span>
            快速选择
            <span class="dropdown-arrow">{{ showBatchSelectMenu ? '▲' : '▼' }}</span>
          </button>

          <!-- 下拉菜单内容 -->
          <div v-if="showBatchSelectMenu" class="batch-select-menu">
            <button class="menu-item recommended" @click="smartBatchSelect">
              <span class="item-icon">⭐</span>
              <div class="item-content">
                <div class="item-title">推荐：选中前50个</div>
                <div class="item-desc">最佳导出速度</div>
              </div>
            </button>

            <button class="menu-item" @click="selectCurrentPage">
              <span class="item-icon">📄</span>
              <div class="item-content">
                <div class="item-title">选中本页全部</div>
                <div class="item-desc">{{ paginatedStudents.length }} 个学生</div>
              </div>
            </button>

            <button class="menu-item" @click="deselectCurrentPage">
              <span class="item-icon">❌</span>
              <div class="item-content">
                <div class="item-title">取消选中本页</div>
                <div class="item-desc">清除本页选择</div>
              </div>
            </button>

            <div class="menu-divider"></div>

            <button class="menu-item" @click="selectFirstN(25)">
              <span class="item-icon">📋</span>
              <div class="item-content">
                <div class="item-title">选中前25个</div>
                <div class="item-desc">小批量快速导出</div>
              </div>
            </button>

            <button class="menu-item" @click="selectFirstN(100)">
              <span class="item-icon">📦</span>
              <div class="item-content">
                <div class="item-title">选中前100个</div>
                <div class="item-desc">大批量导出（较慢）</div>
              </div>
            </button>
          </div>
        </div>

        <!-- 快捷按钮：选中本页 -->
        <button class="page-select-btn" @click="selectCurrentPage">选中本页</button>
      </div>
    </div>

    <!-- 批量操作工具栏 -->
    <div v-if="selectedStudents.length > 0" class="batch-toolbar">
      <div class="batch-info">
        <span class="batch-icon">✓</span>
        已选择 <strong>{{ selectedStudents.length }}</strong> 个学生
      </div>
      <div class="batch-actions">
        <button class="batch-export-btn" @click="openBatchExportDialog">
          <span class="btn-icon">💾</span>
          批量导出
        </button>
        <button class="batch-questionnaire-btn" @click="openQuestionnaireExportDialog">
          <span class="btn-icon">📊</span>
          批量导出问卷
        </button>
        <button class="batch-clear-btn" @click="selectedStudents = []">
          <span class="btn-icon">✕</span>
          取消选择
        </button>
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
            <th class="checkbox-col">
              <input
                type="checkbox"
                :checked="allStudentsSelected"
                :indeterminate.prop="someStudentsSelected"
                @change="toggleSelectAll"
                class="student-checkbox"
              />
            </th>
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
          <tr v-for="student in paginatedStudents" :key="student.sessionId" class="table-row">
            <td class="checkbox-col">
              <input
                type="checkbox"
                :checked="isStudentSelected(student.sessionId)"
                @change="toggleSelectStudent(student.sessionId)"
                class="student-checkbox"
              />
            </td>
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

    <!-- 分页控件 -->
    <div v-if="filteredStudents.length > 0" class="pagination-container">
      <div class="pagination-info">
        显示 {{ (currentPage - 1) * pageSize + 1 }} -
        {{ Math.min(currentPage * pageSize, filteredStudents.length) }}
        / 共 {{ filteredStudents.length }} 个学生
      </div>

      <div class="pagination-controls">
        <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">上一页</button>

        <div class="page-numbers">
          <button
            v-for="page in totalPages"
            :key="page"
            v-show="shouldShowPage(page)"
            class="page-number"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">
          下一页
        </button>
      </div>

      <div class="pagination-jump">
        <span>跳转到</span>
        <input
          type="number"
          v-model.number="jumpToPage"
          @keyup.enter="handleJumpToPage"
          @blur="handleJumpToPage"
          min="1"
          :max="totalPages"
          class="page-input"
          placeholder="页码"
        />
        <span>页</span>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-else class="empty-container">
      <div class="empty-icon">📭</div>
      <p>暂无学生数据</p>
    </div>
  </div>
  <!-- 批量导出对话框 -->
  <div v-if="showBatchExportDialog" class="dialog-overlay" @click.self="cancelBatchExport">
    <div class="batch-export-dialog">
      <div class="dialog-header">
        <h3 class="dialog-title">批量导出学生数据</h3>
        <button class="close-button" @click="cancelBatchExport">✕</button>
      </div>

      <div class="dialog-body">
        <div class="export-summary">
          <div class="summary-icon">📦</div>
          <div class="summary-text">
            即将导出 <strong>{{ selectedStudents.length }}</strong> 个学生的完整对话数据
          </div>
        </div>

        <!-- 导出格式选择 -->
        <div class="option-section">
          <h4 class="option-title">选择文件格式</h4>
          <div class="format-options">
            <label class="format-option" :class="{ active: batchExportFormat === 'word' }">
              <input
                type="radio"
                v-model="batchExportFormat"
                value="word"
                :disabled="isBatchExporting"
              />
              <div class="option-content">
                <div class="option-icon">📄</div>
                <div class="option-info">
                  <div class="option-title">Word文档</div>
                  <div class="option-desc">专业排版，包含完整格式</div>
                </div>
              </div>
            </label>

            <label class="format-option" :class="{ active: batchExportFormat === 'txt' }">
              <input
                type="radio"
                v-model="batchExportFormat"
                value="txt"
                :disabled="isBatchExporting"
              />
              <div class="option-content">
                <div class="option-icon">📝</div>
                <div class="option-info">
                  <div class="option-title">纯文本</div>
                  <div class="option-desc">简洁格式，便于快速查看</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- 导出方式选择 -->
        <div class="option-section">
          <h4 class="option-title">选择导出方式</h4>
          <div class="type-options">
            <label class="type-option" :class="{ active: batchExportType === 'merged' }">
              <input
                type="radio"
                v-model="batchExportType"
                value="merged"
                :disabled="isBatchExporting"
              />
              <div class="option-content">
                <div class="option-icon">📋</div>
                <div class="option-info">
                  <div class="option-title">合并导出</div>
                  <div class="option-desc">所有学生数据合并到一个文件</div>
                </div>
              </div>
            </label>

            <label class="type-option" :class="{ active: batchExportType === 'zip' }">
              <input
                type="radio"
                v-model="batchExportType"
                value="zip"
                :disabled="isBatchExporting"
              />
              <div class="option-content">
                <div class="option-icon">🗜️</div>
                <div class="option-info">
                  <div class="option-title">ZIP打包</div>
                  <div class="option-desc">每个学生一个文件，打包下载</div>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="cancel-button" @click="cancelBatchExport" :disabled="isBatchExporting">
          取消
        </button>
        <button class="confirm-button" @click="batchExportStudents" :disabled="isBatchExporting">
          <span v-if="isBatchExporting" class="loading-spinner">⏳</span>
          <span v-else class="button-icon">💾</span>
          {{ isBatchExporting ? '导出中...' : '开始导出' }}
        </button>
      </div>
    </div>
  </div>
  <!-- 批量问卷导出对话框 -->
  <div
    v-if="showQuestionnaireExportDialog"
    class="dialog-overlay"
    @click.self="cancelQuestionnaireExport"
  >
    <div class="questionnaire-export-dialog">
      <div class="dialog-header">
        <h3 class="dialog-title">批量导出问卷数据</h3>
        <button class="close-button" @click="cancelQuestionnaireExport">✕</button>
      </div>

      <div class="dialog-body">
        <div class="export-summary">
          <div class="summary-icon">📊</div>
          <div class="summary-text">
            即将导出 <strong>{{ selectedStudents.length }}</strong> 个学生的问卷数据
          </div>
        </div>

        <!-- 格式选择 -->
        <div class="option-section">
          <h4 class="option-title">选择导出格式</h4>
          <div class="format-options">
            <label class="format-option" :class="{ active: questionnaireExportFormat === 'csv' }">
              <input
                type="radio"
                v-model="questionnaireExportFormat"
                value="csv"
                :disabled="isQuestionnaireExporting"
              />
              <div class="option-content">
                <div class="option-icon">📄</div>
                <div class="option-info">
                  <div class="option-title">CSV表格 ⭐ 推荐</div>
                  <div class="option-desc">适合SPSS/Excel统计分析</div>
                </div>
              </div>
            </label>

            <label class="format-option" :class="{ active: questionnaireExportFormat === 'excel' }">
              <input
                type="radio"
                v-model="questionnaireExportFormat"
                value="excel"
                :disabled="isQuestionnaireExporting"
              />
              <div class="option-content">
                <div class="option-icon">📊</div>
                <div class="option-info">
                  <div class="option-title">Excel工作簿</div>
                  <div class="option-desc">多工作表，包含题目说明</div>
                </div>
              </div>
            </label>

            <label class="format-option" :class="{ active: questionnaireExportFormat === 'word' }">
              <input
                type="radio"
                v-model="questionnaireExportFormat"
                value="word"
                :disabled="isQuestionnaireExporting"
              />
              <div class="option-content">
                <div class="option-icon">📝</div>
                <div class="option-info">
                  <div class="option-title">Word文档</div>
                  <div class="option-desc">专业报告格式，便于打印</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- 数据说明 -->
        <div class="data-info-section">
          <h4 class="info-title">📋 导出内容说明</h4>
          <ul class="info-list">
            <li>✅ 基础信息（学生ID、实验组别、完成时间、用时）</li>
            <li>✅ 分数统计（能力、协作、体验 - 总分/平均分）</li>
            <li>✅ 详细答案（33道题目的完整答案）</li>
            <li>✅ 开放性反馈（学生的文字反馈）</li>
            <li>📊 <strong>CSV格式</strong>：一行一个学生，便于统计</li>
            <li>📊 <strong>Excel格式</strong>：包含汇总、详细答案、题目说明3个工作表</li>
            <li>📝 <strong>Word格式</strong>：每个学生独立页面，专业报告</li>
          </ul>
        </div>
      </div>

      <div class="dialog-footer">
        <button
          class="cancel-button"
          @click="cancelQuestionnaireExport"
          :disabled="isQuestionnaireExporting"
        >
          取消
        </button>
        <button
          class="confirm-button"
          @click="batchExportQuestionnaires"
          :disabled="isQuestionnaireExporting"
        >
          <span v-if="isQuestionnaireExporting" class="loading-spinner">⏳</span>
          <span v-else class="button-icon">💾</span>
          {{ isQuestionnaireExporting ? '导出中...' : '开始导出' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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

// 批量导出
const selectedStudents = ref<string[]>([])
const showBatchExportDialog = ref(false)
const isBatchExporting = ref(false)
const batchExportFormat = ref<'word' | 'txt'>('word')
const batchExportType = ref<'merged' | 'zip'>('merged')

const showQuestionnaireExportDialog = ref(false)
const isQuestionnaireExporting = ref(false)
const questionnaireExportFormat = ref<'csv' | 'excel' | 'word'>('csv')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(50)
const showBatchSelectMenu = ref(false)
const jumpToPage = ref(1)
const selectAllCheckbox = ref<HTMLInputElement | null>(null)

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

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredStudents.value.length / pageSize.value)
})

// 当前页的学生列表
const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredStudents.value.slice(start, end)
})

// 当前页的学生ID列表
const currentPageStudentIds = computed(() => {
  return paginatedStudents.value.map((s) => s.sessionId)
})

// 当前页是否全部选中
const allCurrentPageSelected = computed(() => {
  if (paginatedStudents.value.length === 0) return false
  return currentPageStudentIds.value.every((id) => selectedStudents.value.includes(id))
})

// 判断是否显示该页码
const shouldShowPage = (page: number) => {
  if (totalPages.value <= 7) return true
  if (page === 1 || page === totalPages.value) return true
  if (Math.abs(page - currentPage.value) <= 2) return true
  return false
}

// 全选状态
const allStudentsSelected = computed(() => {
  return (
    filteredStudents.value.length > 0 &&
    selectedStudents.value.length === filteredStudents.value.length
  )
})

// 部分选中状态
const someStudentsSelected = computed(() => {
  return (
    selectedStudents.value.length > 0 &&
    selectedStudents.value.length < filteredStudents.value.length
  )
})

// ==================== 方法 ====================

// 全选/取消全选
const toggleSelectAll = () => {
  if (allStudentsSelected.value) {
    selectedStudents.value = []
  } else {
    selectedStudents.value = filteredStudents.value.map((s) => s.sessionId)
  }
}

// 切换单个学生选择
const toggleSelectStudent = (sessionId: string) => {
  const index = selectedStudents.value.indexOf(sessionId)
  if (index > -1) {
    selectedStudents.value.splice(index, 1)
  } else {
    selectedStudents.value.push(sessionId)
  }
}

// 检查学生是否已选中
const isStudentSelected = (sessionId: string) => {
  return selectedStudents.value.includes(sessionId)
}

// 打开批量导出对话框
const openBatchExportDialog = () => {
  if (selectedStudents.value.length === 0) {
    alert('请先选择要导出的学生')
    return
  }

  if (selectedStudents.value.length > 100) {
    alert('一次最多导出100个学生的对话数据，请分批导出')
    return
  }

  showBatchExportDialog.value = true
}

// 批量导出学生数据
const batchExportStudents = async () => {
  if (selectedStudents.value.length === 0) {
    alert('请先选择要导出的学生')
    return
  }

  isBatchExporting.value = true

  try {
    const token = localStorage.getItem('teacherToken')
    if (!token) {
      router.push('/teacher/login')
      return
    }

    console.log(`📥 批量导出 ${selectedStudents.value.length} 个学生...`)

    const response = await fetch('/api/teacher/export/batch-students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionIds: selectedStudents.value,
        format: batchExportFormat.value,
        exportType: batchExportType.value,
      }),
    })

    if (!response.ok) {
      throw new Error('导出失败')
    }

    // 创建下载
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    let ext = batchExportFormat.value === 'word' ? 'docx' : 'txt'
    if (batchExportType.value === 'zip') {
      ext = 'zip'
    }

    a.download = `students_batch_${Date.now()}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    console.log('✅ 批量导出成功')
    showBatchExportDialog.value = false
  } catch (error) {
    console.error('❌ 批量导出失败:', error)
    alert('批量导出失败，请稍后重试')
  } finally {
    isBatchExporting.value = false
  }
}

// 取消批量导出
const cancelBatchExport = () => {
  showBatchExportDialog.value = false
}

// 打开问卷导出对话框
const openQuestionnaireExportDialog = () => {
  if (selectedStudents.value.length === 0) {
    alert('请先选择要导出问卷的学生')
    return
  }

  if (selectedStudents.value.length > 100) {
    alert('一次最多导出100个学生的问卷数据，请分批导出')
    return
  }

  showQuestionnaireExportDialog.value = true
}

// 批量导出问卷数据
const batchExportQuestionnaires = async () => {
  if (selectedStudents.value.length === 0) {
    alert('请先选择要导出问卷的学生')
    return
  }

  isQuestionnaireExporting.value = true

  try {
    const token = localStorage.getItem('teacherToken')
    if (!token) {
      router.push('/teacher/login')
      return
    }

    console.log(`📊 批量导出问卷 ${selectedStudents.value.length} 个学生...`)

    const response = await fetch('/api/teacher/export/batch-questionnaires', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionIds: selectedStudents.value,
        format: questionnaireExportFormat.value,
      }),
    })

    if (!response.ok) {
      throw new Error('导出失败')
    }

    // 创建下载
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    let ext = 'csv'
    if (questionnaireExportFormat.value === 'excel') {
      ext = 'xlsx'
    } else if (questionnaireExportFormat.value === 'word') {
      ext = 'docx'
    }

    a.download = `questionnaires_batch_${Date.now()}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    console.log('✅ 问卷批量导出成功')
    showQuestionnaireExportDialog.value = false
  } catch (error) {
    console.error('❌ 问卷批量导出失败:', error)
    alert('问卷批量导出失败，请稍后重试')
  } finally {
    isQuestionnaireExporting.value = false
  }
}

// 取消问卷导出
const cancelQuestionnaireExport = () => {
  showQuestionnaireExportDialog.value = false
}

// 加载学生列表
const loadStudentList = async () => {
  isLoading.value = true
  error.value = ''
  currentPage.value = 1

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
  currentPage.value = 1
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

  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

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

// 切换页码
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  jumpToPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

// 下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

// 选中本页所有学生
const selectCurrentPage = () => {
  const pageIds = currentPageStudentIds.value
  pageIds.forEach((id) => {
    if (!selectedStudents.value.includes(id)) {
      selectedStudents.value.push(id)
    }
  })
  showBatchSelectMenu.value = false
  console.log(`✅ 已选中本页 ${pageIds.length} 个学生`)
}

// 取消选中本页
const deselectCurrentPage = () => {
  const pageIds = currentPageStudentIds.value
  selectedStudents.value = selectedStudents.value.filter((id) => !pageIds.includes(id))
  showBatchSelectMenu.value = false
  console.log(`✅ 已取消选中本页`)
}

// 选中前N个学生
const selectFirstN = (n: number) => {
  const toSelect = filteredStudents.value.slice(0, n).map((s) => s.sessionId)
  selectedStudents.value = [...new Set([...selectedStudents.value, ...toSelect])]
  showBatchSelectMenu.value = false
  console.log(`✅ 已选中前 ${toSelect.length} 个学生`)
}

// 推荐：快速选择50个
const smartBatchSelect = () => {
  const recommended = Math.min(50, filteredStudents.value.length)
  const toSelect = filteredStudents.value.slice(0, recommended).map((s) => s.sessionId)
  selectedStudents.value = toSelect
  showBatchSelectMenu.value = false
  console.log(`✅ 推荐批量：已选中前 ${recommended} 个学生`)
}

// 处理跳转到指定页
const handleJumpToPage = () => {
  const page = jumpToPage.value
  if (page && page >= 1 && page <= totalPages.value) {
    goToPage(page)
  } else {
    jumpToPage.value = currentPage.value
  }
}

// ==================== 监听器 ====================

// 监听全选状态，更新 indeterminate
watch([allStudentsSelected, someStudentsSelected], () => {
  nextTick(() => {
    if (selectAllCheckbox.value) {
      selectAllCheckbox.value.indeterminate =
        someStudentsSelected.value && !allStudentsSelected.value
    }
  })
})

// 监听当前页变化，同步输入框
watch(currentPage, (newPage) => {
  jumpToPage.value = newPage
})

// ==================== 生命周期 ====================

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

/* 批量操作工具栏 */
.batch-toolbar {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  animation: slideDown 0.3s ease-out;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
}

.batch-icon {
  background: rgba(255, 255, 255, 0.2);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}

.batch-actions {
  display: flex;
  gap: 0.75rem;
}

.batch-export-btn,
.batch-clear-btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.batch-export-btn {
  background: white;
  color: #3b82f6;
}

.batch-export-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.batch-clear-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.batch-clear-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 表格复选框 */
.checkbox-col {
  width: 50px;
  text-align: center;
}

.student-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

/* 批量导出对话框 */
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

.batch-export-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.dialog-title {
  margin: 0;
  font-size: 1.375rem;
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

.export-summary {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-icon {
  font-size: 2.5rem;
}

.summary-text {
  flex: 1;
  color: #1e40af;
  font-size: 1.125rem;
}

.option-section {
  margin-bottom: 2rem;
}

.option-section:last-child {
  margin-bottom: 0;
}

.option-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.format-options,
.type-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.format-option,
.type-option {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: block;
}

.format-option:hover,
.type-option:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.format-option.active,
.type-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.format-option input[type='radio'],
.type-option input[type='radio'] {
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

.option-info .option-title {
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
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
  position: sticky;
  bottom: 0;
  background: white;
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
  transform: translateY(-1px);
}

.cancel-button:disabled,
.confirm-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
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

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 批量问卷导出按钮样式 */
.batch-questionnaire-btn {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.batch-questionnaire-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

/* 问卷导出对话框样式 */
.questionnaire-export-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

/* 数据说明区域 */
.data-info-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #10b981;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.info-title {
  font-size: 1rem;
  font-weight: 600;
  color: #047857;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  padding: 0.5rem 0;
  color: #065f46;
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.info-list li strong {
  color: #047857;
}

/* ========== 批量选择工具栏 ========== */
.batch-select-toolbar {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.batch-select-left {
  display: flex;
  align-items: center;
}

.info-text {
  font-size: 0.875rem;
  color: #64748b;
}

.info-text strong {
  color: #1e293b;
  font-weight: 600;
}

.batch-select-actions {
  display: flex;
  gap: 0.75rem;
}

.batch-select-dropdown {
  position: relative;
}

.batch-select-btn,
.page-select-btn {
  padding: 0.625rem 1.25rem;
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.batch-select-btn:hover,
.page-select-btn:hover {
  background: #eff6ff;
  transform: translateY(-1px);
}

.dropdown-arrow {
  font-size: 0.75rem;
}

.batch-select-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  z-index: 100;
  padding: 0.5rem;
  animation: slideDown 0.2s ease-out;
}

.menu-item {
  width: 100%;
  padding: 0.875rem 1rem;
  background: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  transition: all 0.2s;
  text-align: left;
  margin-bottom: 0.25rem;
}

.menu-item:hover {
  background: #f8fafc;
}

.menu-item.recommended {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #3b82f6;
}

.menu-item.recommended:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.item-icon {
  font-size: 1.5rem;
}

.item-content {
  flex: 1;
}

.item-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.item-desc {
  font-size: 0.75rem;
  color: #64748b;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}

/* ========== 分页控件 ========== */
.pagination-container {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #64748b;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  width: 36px;
  height: 36px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #64748b;
  transition: all 0.2s;
}

.page-number:hover {
  background: #f8fafc;
}

.page-number.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  font-weight: 600;
}

.pagination-jump {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.page-input {
  width: 60px;
  padding: 0.375rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  text-align: center;
  font-size: 0.875rem;
}

.page-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
