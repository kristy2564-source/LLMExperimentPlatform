<template>
  <div class="learning-platform">
    <div class="intro-page">
      <div class="intro-content">
        <div class="intro-sections">
          <div class="intro-section" :class="{ 'fade-in': currentIntroStep >= 1 }">
            <div class="intro-icon">🧠</div>
            <h1>欢迎来到「智能问题解决工作台」！</h1>
            <p>
              你好呀！从现在开始，你将成为一名跨学科问题解决专家。为了帮助学校或社区，你需要用科学、数学、常识和逻辑思考，找到最好的解决办法。
            </p>
          </div>

          <div class="intro-section" :class="{ 'fade-in': currentIntroStep >= 2 }">
            <div class="intro-icon">🤔</div>
            <h2>你要做什么？</h2>
            <div class="intro-list">
              <p>先读懂问题，发现关键人物和条件；</p>
              <p>提出方案，学会判断好坏；</p>
              <p>遇到变化，灵活调整；</p>
              <p>最后总结出最棒的解决计划。</p>
            </div>
          </div>

          <div class="intro-section" :class="{ 'fade-in': currentIntroStep >= 3 }">
            <div class="intro-icon">🤝</div>
            <h2>在这里，你不是一个人在战斗！</h2>
            <p>我是你的智慧小助手，会在关键时刻提醒你，但最终的思考还是要靠你自己哦！</p>
          </div>

          <div class="intro-section" :class="{ 'fade-in': currentIntroStep >= 4 }">
            <div class="intro-icon">✨</div>
            <h2>准备好了吗？</h2>
            <p>点击按钮，开始探索跨学科问题解决的世界吧！</p>
          </div>
        </div>

        <div class="start-button-container" :class="{ 'fade-in': currentIntroStep >= 4 }">
          <button @click="startPlatform" class="start-button" :disabled="currentIntroStep < 4">
            <div class="button-content">
              <span class="button-text">开始探索</span>
              <div class="button-icon">▶</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentIntroStep = ref(0)

const startIntroAnimation = () => {
  let step = 1
  const showNext = () => {
    currentIntroStep.value = step
    step++
    if (step <= 4) setTimeout(showNext, 1500)
  }
  setTimeout(showNext, 500)
}

const startPlatform = () => {
  router.push('/experiment/step1')
}

onMounted(() => {
  startIntroAnimation()
})
</script>

<style scoped>
.learning-platform {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;
}

.intro-page {
  padding: 4rem 2rem; /* 增加上下 padding，留出空间 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
}

.intro-content {
  max-width: 800px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.intro-sections {
  margin-bottom: 3rem;
}

.intro-section {
  margin-bottom: 2.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease;
}

.intro-section.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.intro-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}

.intro-section h1 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 600;
}

.intro-section h2 {
  color: #667eea;
  font-size: 1.4rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.intro-section p {
  color: #555;
  line-height: 1.6;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.intro-list p {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.8rem;
}

.intro-list p:before {
  content: '•';
  color: #667eea;
  font-size: 1.2rem;
  position: absolute;
  left: 0;
  top: 0;
}

.start-button-container {
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease;
}

.start-button-container.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.start-button {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border: none;
  border-radius: 50px;
  padding: 1rem 2rem;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
  position: relative;
  overflow: hidden;
}

.start-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
}

.start-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.button-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.start-button:hover .button-icon {
  transform: translateX(5px);
}
</style>
