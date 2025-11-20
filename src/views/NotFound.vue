<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-animation">
        <div class="error-icon">🤔</div>
        <div class="error-code">404</div>
      </div>

      <h1 class="error-title">页面未找到</h1>
      <p class="error-description">抱歉，您访问的页面不存在或已被移动。</p>

      <div class="action-buttons">
        <button class="back-button" @click="goBack">
          <span class="button-icon">←</span>
          返回上页
        </button>
        <button class="home-button" @click="goHome">
          <span class="button-icon">🏠</span>
          返回首页
        </button>
      </div>

      <div class="help-info">
        <p>如果您是通过链接访问的，请检查链接是否正确</p>
        <p>或者联系管理员获取帮助</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/login')
  }
}

const goHome = () => {
  // 检查是否已登录
  const experimentId = localStorage.getItem('experimentId')
  if (experimentId) {
    router.push('/experiment')
  } else {
    router.push('/login')
  }
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.not-found-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.error-animation {
  margin-bottom: 2rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

.error-code {
  font-size: 4rem;
  font-weight: bold;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2rem;
  color: #1e293b;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.error-description {
  color: #64748b;
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.back-button,
.home-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button {
  background: #6b7280;
  color: white;
}

.back-button:hover {
  background: #4b5563;
  transform: translateY(-2px);
}

.home-button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.button-icon {
  font-size: 1.1rem;
}

.help-info {
  color: #9ca3af;
  font-size: 0.9rem;
  line-height: 1.5;
}

.help-info p {
  margin: 0.25rem 0;
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translateY(0);
  }
  40%,
  43% {
    transform: translateY(-10px);
  }
  70% {
    transform: translateY(-5px);
  }
  90% {
    transform: translateY(-2px);
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .not-found-content {
    padding: 2rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .back-button,
  .home-button {
    width: 100%;
    justify-content: center;
  }

  .error-code {
    font-size: 3rem;
  }

  .error-title {
    font-size: 1.5rem;
  }
}
</style>
