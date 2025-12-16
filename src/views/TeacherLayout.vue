<template>
  <div class="teacher-layout">
    <!-- 顶部导航栏 -->
    <header class="teacher-header">
      <div class="header-content">
        <div class="logo-section">
          <span class="logo-icon">👨‍🏫</span>
          <span class="logo-text">教师管理端</span>
        </div>

        <nav class="nav-menu">
          <router-link to="/teacher/dashboard" class="nav-item" active-class="nav-item-active">
            <span class="nav-icon">📊</span>
            学生列表
          </router-link>
          <router-link to="/teacher/analytics" class="nav-item" active-class="nav-item-active">
            <span class="nav-icon">📈</span>
            数据分析
          </router-link>
        </nav>

        <div class="user-section">
          <span class="user-name">{{ teacherName }}</span>
          <button class="logout-button" @click="handleLogout">
            <span>退出</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="teacher-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const teacherName = ref('')

onMounted(() => {
  teacherName.value = localStorage.getItem('teacherName') || '教师'
})

const handleLogout = () => {
  // 清除教师登录信息
  localStorage.removeItem('teacherToken')
  localStorage.removeItem('teacherId')
  localStorage.removeItem('teacherName')
  localStorage.removeItem('teacherRole')
  localStorage.removeItem('teacherLoginTime')

  console.log('✅ 教师已退出登录')

  // 跳转到教师登录页
  router.push('/teacher/login')
}
</script>

<style scoped>
.teacher-layout {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.teacher-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e3a8a;
}

.logo-icon {
  font-size: 2rem;
}

.nav-menu {
  display: flex;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #3b82f6;
}

.nav-item-active {
  background: #dbeafe;
  color: #3b82f6;
}

.nav-icon {
  font-size: 1.1rem;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: #374151;
  font-weight: 500;
}

.logout-button {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.logout-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.teacher-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}
</style>
