<template>
  <div class="teacher-analytics">
    <div class="coming-soon-container">
      <div class="coming-soon-icon">📈</div>
      <h2 class="coming-soon-title">数据分析功能</h2>
      <p class="coming-soon-desc">数据可视化与统计分析功能正在开发中...</p>
      <p class="coming-soon-features">即将支持:</p>
      <ul class="features-list">
        <li>整体统计图表</li>
        <li>步骤完成分析</li>
        <li>能力评分分析</li>
        <li>协作模式分析</li>
        <li>时长与行为分析</li>
      </ul>
      <button @click="goBack" class="back-button">返回学生列表</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/teacher/dashboard')
}
</script>

<style scoped>
.teacher-analytics {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.coming-soon-container {
  text-align: center;
  background: white;
  padding: 4rem 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  max-width: 500px;
}

.coming-soon-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.coming-soon-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.coming-soon-desc {
  color: #64748b;
  font-size: 1.125rem;
  margin-bottom: 2rem;
}

.coming-soon-features {
  color: #475569;
  font-weight: 600;
  margin-bottom: 1rem;
}

.features-list {
  text-align: left;
  display: inline-block;
  color: #64748b;
  margin-bottom: 2rem;
}

.features-list li {
  margin-bottom: 0.5rem;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.back-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}
</style>
