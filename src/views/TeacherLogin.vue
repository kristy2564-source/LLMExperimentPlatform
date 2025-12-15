<template>
  <div class="teacher-login-container">
    <!-- 背景动效 -->
    <div class="background-animation">
      <div class="floating-shapes">
        <div v-for="i in 15" :key="i" class="shape" :style="getShapeStyle()"></div>
      </div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card" :class="{ 'card-visible': showCard }">
      <div class="login-header">
        <div class="logo-section">
          <div class="logo-icon">👨‍🏫</div>
          <h1 class="platform-title">教师管理端</h1>
          <p class="platform-subtitle">学生数据分析与管理系统</p>
        </div>
      </div>

      <div class="login-form">
        <!-- 教师ID输入 -->
        <div class="form-group">
          <label for="teacherId" class="form-label">
            <span class="label-icon">🆔</span>
            教师ID
          </label>
          <div class="input-wrapper">
            <input
              id="teacherId"
              v-model="teacherId"
              type="text"
              class="form-input"
              placeholder="请输入教师ID"
              :disabled="isLoading"
              @keyup.enter="handleLogin"
              @input="clearError"
            />
          </div>
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label for="password" class="form-label">
            <span class="label-icon">🔐</span>
            密码
          </label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="请输入密码"
              :disabled="isLoading"
              @keyup.enter="handleLogin"
              @input="clearError"
            />
            <button class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 登录按钮 -->
        <button class="login-button" :disabled="!canLogin || isLoading" @click="handleLogin">
          <span v-if="isLoading" class="button-loading">
            <div class="button-spinner"></div>
            登录中...
          </span>
          <span v-else class="button-text">
            <span class="button-icon">🚀</span>
            登录管理端
          </span>
        </button>

        <!-- 帮助信息 -->
        <div class="help-section">
          <div class="help-item">
            <span class="help-icon">💡</span>
            <span class="help-text">默认测试账号: teacher001 / teacher123</span>
          </div>
        </div>
      </div>

      <!-- 返回学生端 -->
      <div class="back-link">
        <router-link to="/login">← 返回学生登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态管理
const showCard = ref(false)
const teacherId = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// 计算属性
const canLogin = computed(() => {
  return teacherId.value.trim().length > 0 && password.value.length > 0
})

// 方法
const clearError = () => {
  errorMessage.value = ''
}

const getShapeStyle = () => {
  const size = Math.random() * 60 + 20
  const left = Math.random() * 100
  const duration = Math.random() * 10 + 15
  const delay = Math.random() * 5

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  }
}

const handleLogin = async () => {
  if (!canLogin.value || isLoading.value) return

  clearError()
  isLoading.value = true

  try {
    // 调用教师登录API
    const response = await fetch('/api/teacher/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teacherId: teacherId.value.trim(),
        password: password.value,
      }),
    })

    const result = await response.json()

    if (result.success) {
      // 保存教师信息到localStorage
      localStorage.setItem('teacherToken', result.data.token)
      localStorage.setItem('teacherId', result.data.teacherId)
      localStorage.setItem('teacherName', result.data.teacherName)
      localStorage.setItem('teacherRole', result.data.role)
      localStorage.setItem('teacherLoginTime', new Date().toISOString())

      console.log('✅ 教师登录成功')

      // 跳转到学生列表页面
      setTimeout(() => {
        router.push('/teacher/dashboard')
      }, 500)
    } else {
      errorMessage.value = result.message || '登录失败，请检查账号密码'
    }
  } catch (error) {
    console.error('❌ 登录错误:', error)
    errorMessage.value = '登录失败，请检查网络连接'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // 检查是否已登录
  const token = localStorage.getItem('teacherToken')
  if (token) {
    // 已登录，直接跳转
    router.push('/teacher/dashboard')
  }

  // 显示登录卡片
  setTimeout(() => {
    showCard.value = true
  }, 300)
})
</script>

<style scoped>
.teacher-login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.floating-shapes {
  position: relative;
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
  from {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 0.3;
  }
  to {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transform: scale(0.9) translateY(20px);
  transition: all 0.6s ease-out;
}

.login-card.card-visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 4rem;
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.platform-title {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(45deg, #1e3a8a, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.platform-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
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

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.password-toggle:hover {
  opacity: 1;
}

.error-message {
  margin-top: -0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fee2e2;
  border-radius: 8px;
}

.error-message::before {
  content: '⚠️';
}

.login-button {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #1e3a8a, #3b82f6);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.login-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-loading,
.button-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.help-section {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.help-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
}

.help-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

.back-link {
  margin-top: 1.5rem;
  text-align: center;
}

.back-link a {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.back-link a:hover {
  color: #1e3a8a;
  text-decoration: underline;
}
</style>
