<template>
  <div class="login-page-container">
    <!-- 背景动效 -->
    <div class="background-animation">
      <div class="floating-shapes">
        <div v-for="i in 20" :key="i" class="shape" :style="getShapeStyle(i)"></div>
      </div>
    </div>

    <!-- 主要登录卡片 -->
    <div class="login-card" :class="{ 'card-visible': showCard }">
      <div class="login-header">
        <div class="logo-section">
          <div class="logo-icon">🧠</div>
          <h1 class="platform-title">小小跨学科问题解决专家工作台</h1>
          <p class="platform-subtitle">欢迎来到智慧学习平台</p>
        </div>
      </div>

      <div class="login-form">
        <!-- 实验编号输入 -->
        <div class="form-group">
          <label for="experimentId" class="form-label">
            <span class="label-icon">🎯</span>
            实验编号
          </label>
          <div class="input-wrapper">
            <input
              id="experimentId"
              v-model="experimentId"
              type="text"
              class="form-input"
              placeholder="请输入您的实验编号"
              :disabled="isLoading"
              @keyup.enter="handleLogin"
              @input="clearError"
            />
            <div class="input-icon">
              <span v-if="!isLoading">📝</span>
              <div v-else class="loading-spinner"></div>
            </div>
          </div>
          <div v-if="inputError" class="error-message">
            {{ inputError }}
          </div>
        </div>

        <!-- 学生姓名输入（可选） -->
        <div class="form-group">
          <label for="studentName" class="form-label">
            <span class="label-icon">👨‍🎓</span>
            姓名 <span class="optional">(可选)</span>
          </label>
          <div class="input-wrapper">
            <input
              id="studentName"
              v-model="studentName"
              type="text"
              class="form-input"
              placeholder="请输入您的姓名"
              :disabled="isLoading"
              @keyup.enter="handleLogin"
            />
            <div class="input-icon">
              <span>👤</span>
            </div>
          </div>
        </div>

        <!-- 登录按钮 -->
        <button class="login-button" :disabled="!canLogin || isLoading" @click="handleLogin">
          <span v-if="isLoading" class="button-loading">
            <div class="button-spinner"></div>
            连接中...
          </span>
          <span v-else class="button-text">
            <span class="button-icon">🚀</span>
            开始实验
          </span>
        </button>

        <!-- 帮助信息 -->
        <div class="help-section">
          <div class="help-item">
            <span class="help-icon">💡</span>
            <span class="help-text">实验编号由老师提供，请确保输入正确</span>
          </div>
          <div class="help-item">
            <span class="help-icon">🔒</span>
            <span class="help-text">您的学习数据将被安全保存</span>
          </div>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="login-footer">
        <p class="footer-text">
          © 2025 跨学科问题解决专家工作台 |
          <span class="footer-link" @click="showAbout = true">关于平台</span>
        </p>
      </div>
    </div>

    <!-- 关于平台弹窗 -->
    <div v-if="showAbout" class="about-modal" @click="showAbout = false">
      <div class="about-content" @click.stop>
        <div class="about-header">
          <h3>关于平台</h3>
          <button class="close-button" @click="showAbout = false">×</button>
        </div>
        <div class="about-body">
          <p>🎯 <strong>教学目标</strong>：培养学生跨学科问题解决能力</p>
          <p>🧠 <strong>核心理念</strong>：通过真实情境训练系统思维</p>
          <p>📊 <strong>数据追踪</strong>：实时记录学习过程和成果</p>
          <p>🔧 <strong>智能引导</strong>：AI助手提供个性化学习支持</p>
        </div>
      </div>
    </div>

    <!-- 连接状态提示 -->
    <div v-if="connectionStatus" class="connection-status" :class="connectionStatus.type">
      <span class="status-icon">{{ connectionStatus.icon }}</span>
      <span class="status-text">{{ connectionStatus.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 定义组件通信
const emit = defineEmits(['login-success'])

const router = useRouter()

// 状态管理
const showCard = ref(false)
const showAbout = ref(false)
const experimentId = ref('')
const studentName = ref('')
const isLoading = ref(false)
const inputError = ref('')
const connectionStatus = ref<{
  type: 'success' | 'error' | 'warning'
  icon: string
  message: string
} | null>(null)

// 计算属性
const canLogin = computed(() => experimentId.value.trim().length >= 3)

// 方法
const clearError = () => {
  inputError.value = ''
}

const showConnectionStatus = (type: 'success' | 'error' | 'warning', message: string) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
  }

  connectionStatus.value = {
    type,
    icon: icons[type],
    message,
  }

  // 3秒后自动隐藏
  setTimeout(() => {
    connectionStatus.value = null
  }, 3000)
}

const handleLogin = async () => {
  if (!canLogin.value || isLoading.value) return

  // 清除之前的错误
  clearError()
  isLoading.value = true

  try {
    // 验证实验编号格式
    if (!validateExperimentId(experimentId.value)) {
      throw new Error('实验编号格式不正确，请检查后重新输入')
    }

    // 调用登录API
    const loginResult = await loginToDatabase({
      experimentId: experimentId.value.trim(),
      studentName: studentName.value.trim() || null,
    })

    if (loginResult.success) {
      // 登录成功
      showConnectionStatus('success', '登录成功！正在进入实验平台...')

      // 保存用户信息到本地存储
      localStorage.setItem('experimentId', experimentId.value.trim())
      localStorage.setItem('loginTime', new Date().toISOString())
      if (studentName.value.trim()) {
        localStorage.setItem('studentName', studentName.value.trim())
      }

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        emit('login-success', loginResult.userData)

        // 登录成功后跳转到首页，而不是直接进入实验
        const redirect = router.currentRoute.value.query.redirect as string
        router.push(redirect || '/home')
      }, 1500)
    } else {
      throw new Error(loginResult.message || '登录失败，请重试')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    inputError.value = error.message || '登录失败，请检查网络连接后重试'
    showConnectionStatus('error', '连接失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 验证实验编号格式
const validateExperimentId = (id: string): boolean => {
  // 基本格式验证：至少3位，可以包含字母数字和连字符
  const pattern = /^[A-Za-z0-9\-]{3,20}$/
  return pattern.test(id.trim())
}

// 登录数据库API（保留接口供后续对接）
const loginToDatabase = async (loginData: {
  experimentId: string
  studentName: string | null
}): Promise<{
  success: boolean
  message?: string
  userData?: any
}> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // 这里后续替换为真实的云数据库API调用
  // const response = await fetch('/api/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(loginData)
  // })
  // const result = await response.json()
  // return result

  // 模拟登录逻辑
  const { experimentId, studentName } = loginData

  // 模拟一些无效的实验编号
  const invalidIds = ['test', '123', 'invalid']
  if (invalidIds.includes(experimentId.toLowerCase())) {
    return {
      success: false,
      message: '实验编号无效，请联系老师获取正确的编号',
    }
  }

  // 模拟成功登录
  return {
    success: true,
    message: '登录成功',
    userData: {
      experimentId,
      studentName,
      loginTime: new Date().toISOString(),
      sessionId: generateSessionId(),
    },
  }
}

// 生成会话ID
const generateSessionId = (): string => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
}

// 背景动画相关
const getShapeStyle = (index: number) => {
  const size = 20 + Math.random() * 60
  const left = Math.random() * 100
  const animationDelay = Math.random() * 10
  const animationDuration = 10 + Math.random() * 20

  return {
    width: size + 'px',
    height: size + 'px',
    left: left + '%',
    animationDelay: animationDelay + 's',
    animationDuration: animationDuration + 's',
  }
}

// 生命周期
onMounted(() => {
  // 检查是否已有登录信息
  const savedExperimentId = localStorage.getItem('experimentId')
  const savedStudentName = localStorage.getItem('studentName')

  if (savedExperimentId) {
    experimentId.value = savedExperimentId
  }
  if (savedStudentName) {
    studentName.value = savedStudentName
  }

  // 显示登录卡片
  setTimeout(() => {
    showCard.value = true
  }, 300)
})
</script>

<style scoped>
.login-page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

/* 背景动效 */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-shapes {
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float linear infinite;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* 登录卡片 */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-card.card-visible {
  transform: translateY(0);
  opacity: 1;
}

/* 头部区域 */
.login-header {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-section {
  animation: logoFloat 3s ease-in-out infinite;
}

.logo-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

.platform-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.platform-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
}

/* 表单样式 */
.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.label-icon {
  font-size: 1.1rem;
}

.optional {
  font-weight: 400;
  color: #9ca3af;
  font-size: 0.85rem;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #9ca3af;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message::before {
  content: '⚠️';
}

/* 登录按钮 */
.login-button {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.button-loading,
.button-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.button-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.button-icon {
  font-size: 1.2rem;
}

/* 帮助信息 */
.help-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.help-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.help-text {
  font-size: 0.9rem;
  color: #4b5563;
  line-height: 1.4;
}

/* 底部信息 */
.login-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.footer-text {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.footer-link {
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
}

.footer-link:hover {
  color: #4f46e5;
}

/* 关于平台弹窗 */
.about-modal {
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
  animation: fadeIn 0.3s ease-out;
}

.about-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: modalSlideIn 0.4s ease-out;
}

.about-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.about-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.3rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.about-body p {
  margin: 0 0 1rem 0;
  line-height: 1.6;
  color: #4b5563;
}

.about-body p:last-child {
  margin-bottom: 0;
}

/* 连接状态提示 */
.connection-status {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  z-index: 1001;
  animation: slideInRight 0.4s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.connection-status.success {
  background: #10b981;
  color: white;
}

.connection-status.error {
  background: #ef4444;
  color: white;
}

.connection-status.warning {
  background: #f59e0b;
  color: white;
}

.status-icon {
  font-size: 1.2rem;
}

/* 动画定义 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .login-page-container {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem;
  }

  .platform-title {
    font-size: 1.5rem;
  }

  .logo-icon {
    font-size: 3rem;
  }

  .connection-status {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    right: auto;
  }
}
</style>
