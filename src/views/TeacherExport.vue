<template>
  <div class="teacher-export">
    <div class="coming-soon-container">
      <div class="coming-soon-icon">💾</div>
      <h2 class="coming-soon-title">数据导出功能</h2>
      <p class="coming-soon-desc">批量数据导出功能正在开发中...</p>
      <p class="coming-soon-features">即将支持:</p>
      <ul class="features-list">
        <li>所有学生汇总表 (Excel)</li>
        <li>对话记录合集 (ZIP)</li>
        <li>问卷数据汇总 (CSV)</li>
        <li>统计报表导出 (PDF)</li>
        <li>可视化图表 (PNG/SVG)</li>
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
.teacher-export {
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
