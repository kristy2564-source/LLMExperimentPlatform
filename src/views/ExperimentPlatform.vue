<template>
  <div class="learning-platform">
    <!-- 顶部导航 -->
    <header class="platform-header">
      <div class="header-content">
        <h1>🧠 智能通风节能专家工作台</h1>
        <div class="header-right">
          <div class="progress-indicator">
            <span>进度: {{ currentStep }}/{{ totalSteps }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout" title="退出登录">
            <span class="logout-icon">👋</span>
            <span class="logout-text">退出</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="main-content">
      <!-- 左侧任务面板 -->
      <aside class="task-panel">
        <div class="panel-header">
          <h3>任务步骤</h3>
        </div>
        <div class="task-steps">
          <!-- Step 1 - 始终显示 -->
          <div
            :class="[
              'step-item',
              {
                active: currentStep === 1,
                completed: currentStep > 1,
              },
            ]"
            @click="goToStep(0)"
          >
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>问题理解</h4>
              <p>分析和理解复杂问题的核心要素</p>
            </div>
          </div>

          <!-- Step 2-7 - 根据当前步骤动态显示 -->
          <div
            v-for="(step, index) in visibleSteps"
            :key="index + 1"
            :class="[
              'step-item',
              {
                active: index + 2 === currentStep,
                completed: index + 2 < currentStep,
              },
            ]"
            @click="goToStep(index + 1)"
          >
            <div class="step-number">{{ index + 2 }}</div>
            <div class="step-content">
              <h4>{{ step.title }}</h4>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中部交互视图区域（由子路由加载） -->
      <main class="interaction-area">
        <router-view
          @show-right-content="startRightContentAnimation"
          @show-next-steps="handleShowNextSteps"
        />
      </main>

      <!-- 右侧信息面板 - 始终显示框架 -->
      <aside class="info-panel">
        <div class="panel-section">
          <h3>📋 主要任务</h3>
          <div
            class="current-task"
            v-if="showRightContent"
            :class="{ 'task-content-visible': taskContentReady }"
          >
            <h4>📝 制定<strong>智能通风节能方案</strong></h4>
            <div class="task-description-container">
              <p>{{ typedTaskDescription }}</p>
            </div>
          </div>
        </div>
        <!-- 只有在主要任务显示后才显示后续内容 -->
        <div
          class="panel-section"
          v-if="showRightContent"
          :class="{ 'section-visible': showMainContent }"
        >
          <h3>🎯 关键目标</h3>
          <ul class="learning-objectives">
            <li
              v-for="(objective, index) in learningObjectives"
              :key="objective"
              :class="{ 'fade-in': showObjectives }"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              {{ objective }}
            </li>
          </ul>
        </div>
        <div
          class="panel-section"
          v-if="showRightContent"
          :class="{ 'section-visible': showMainContent }"
        >
          <h3>🔧 可用工具</h3>
          <div class="thinking-tools">
            <div
              v-for="(tool, index) in tools"
              :key="index"
              class="tool-description clickable-tool"
              :class="{ 'fade-in': showTools }"
              :style="{ animationDelay: `${index * 0.15}s` }"
              @click="handleToolClick(tool)"
            >
              <strong>{{ tool.title }}</strong
              ><br />
              <span>{{ tool.description }}</span>
              <div class="tool-click-hint">点击使用</div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- 信息卡片模态框 -->
    <div v-if="showInfoModal" class="modal-overlay" @click="closeInfoModal">
      <!-- 🔥 修改：外层容器负责圆角和阴影 -->
      <div class="info-modal" @click.stop>
        <div class="modal-header">
          <h3>🏫 教室环境信息</h3>
          <button class="close-button" @click="closeInfoModal">×</button>
        </div>
        <!-- 🔥 新增：可滚动内容容器 -->
        <div class="modal-content-scroll">
          <div class="modal-content">
            <!-- 教室布局图 -->
            <div class="classroom-layout">
              <h4>📐 教室布局示意图</h4>
              <div class="layout-diagram">
                <svg viewBox="0 0 300 200" class="classroom-svg">
                  <!-- 教室外框 -->
                  <rect
                    x="20"
                    y="20"
                    width="260"
                    height="160"
                    fill="none"
                    stroke="#64748b"
                    stroke-width="2"
                  />

                  <!-- 讲台 -->
                  <rect x="40" y="30" width="220" height="20" fill="#3b82f6" opacity="0.3" />
                  <text x="150" y="44" text-anchor="middle" class="svg-label">讲台</text>

                  <!-- 学生座位 (5行8列) -->
                  <g class="desks">
                    <!-- 第一排 -->
                    <rect x="50" y="70" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="75" y="70" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="100" y="70" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="125" y="70" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="163" y="70" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="188" y="70" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="213" y="70" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="238" y="70" width="12" height="8" fill="#10b981" opacity="0.6" />

                    <!-- 其他排座位 -->
                    <rect x="50" y="90" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="75" y="90" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="100" y="90" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="125" y="90" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="163" y="90" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="188" y="90" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="213" y="90" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="238" y="90" width="12" height="8" fill="#10b981" opacity="0.6" />

                    <rect x="50" y="110" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="75" y="110" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="100" y="110" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="125" y="110" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="163" y="110" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="188" y="110" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="213" y="110" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="238" y="110" width="12" height="8" fill="#10b981" opacity="0.6" />

                    <rect x="50" y="130" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="75" y="130" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="100" y="130" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="125" y="130" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="163" y="130" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="188" y="130" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="213" y="130" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="238" y="130" width="12" height="8" fill="#10b981" opacity="0.6" />

                    <rect x="50" y="150" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="75" y="150" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="100" y="150" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="125" y="150" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="163" y="150" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="188" y="150" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="213" y="150" width="12" height="8" fill="#10b981" opacity="0.6" />
                    <rect x="238" y="150" width="12" height="8" fill="#10b981" opacity="0.6" />
                  </g>

                  <!-- 空调位置 -->
                  <rect x="30" y="25" width="15" height="8" fill="#ef4444" opacity="0.7" />
                  <text x="37" y="38" text-anchor="middle" class="svg-small-label">空调</text>

                  <!-- 窗户 -->
                  <rect x="280" y="60" width="3" height="80" fill="#60a5fa" opacity="0.8" />
                  <text x="290" y="105" class="svg-small-label">窗</text>

                  <!-- 门 -->
                  <rect x="15" y="140" width="8" height="15" fill="#8b5cf6" opacity="0.7" />
                  <text x="12" y="152" class="svg-small-label">门</text>

                  <!-- 图例 -->
                  <g class="legend">
                    <rect x="40" y="190" width="8" height="6" fill="#10b981" opacity="0.6" />
                    <text x="52" y="196" class="svg-small-label">学生座位(40人)</text>

                    <rect x="140" y="190" width="8" height="6" fill="#ef4444" opacity="0.7" />
                    <text x="152" y="196" class="svg-small-label">空调(3.2kW)</text>

                    <rect x="220" y="190" width="8" height="6" fill="#60a5fa" opacity="0.8" />
                    <text x="232" y="196" class="svg-small-label">通风窗</text>
                  </g>
                </svg>
              </div>
            </div>

            <!-- 环境数据详情 -->
            <div class="environment-details">
              <h4>🌡️ 详细环境数据</h4>
              <div class="data-grid">
                <div class="data-item">
                  <span class="data-label">教室面积</span>
                  <span class="data-value">60㎡</span>
                </div>
                <div class="data-item">
                  <span class="data-label">学生人数</span>
                  <span class="data-value">40人</span>
                </div>
                <div class="data-item">
                  <span class="data-label">人员密度</span>
                  <span class="data-value">0.67人/㎡</span>
                </div>
                <div class="data-item">
                  <span class="data-label">空调功率</span>
                  <span class="data-value">3.2kW</span>
                </div>
                <div class="data-item">
                  <span class="data-label">室外温度</span>
                  <span class="data-value">22-35℃</span>
                </div>
                <div class="data-item">
                  <span class="data-label">室外风速</span>
                  <span class="data-value">2.1m/s</span>
                </div>
                <div class="data-item">
                  <span class="data-label">风向</span>
                  <span class="data-value">西南风</span>
                </div>
                <div class="data-item">
                  <span class="data-label">室外湿度</span>
                  <span class="data-value">65%</span>
                </div>
              </div>
            </div>

            <!-- 环境舒适度参考标准 -->
            <div class="reference-standards">
              <h4>💡 环境舒适度参考标准</h4>
              <div class="standards-grid">
                <div class="standard-item">
                  <span class="standard-icon">🌡️</span>
                  <div class="standard-info">
                    <span class="standard-range">20-26℃</span>
                    <span class="standard-label">舒适温度</span>
                  </div>
                </div>
                <div class="standard-item">
                  <span class="standard-icon">💧</span>
                  <div class="standard-info">
                    <span class="standard-range">40-70%</span>
                    <span class="standard-label">适宜湿度</span>
                  </div>
                </div>
                <div class="standard-item">
                  <span class="standard-icon">🌊</span>
                  <div class="standard-info">
                    <span class="standard-range">≤1000ppm</span>
                    <span class="standard-label">CO₂浓度</span>
                  </div>
                </div>
                <div class="standard-item">
                  <span class="standard-icon">💨</span>
                  <div class="standard-info">
                    <span class="standard-range">0.1-0.3m/s</span>
                    <span class="standard-label">室内风速</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { logout } from '@/router' // 导入退出登录函数
import { simpleStorage } from '../../api/utils/simpleStorage'

interface TaskStep {
  title: string
  description: string
}

interface Tool {
  title: string
  description: string
}

const router = useRouter()
const route = useRoute()

const currentStep = ref(1)
const totalSteps = ref(7) // 更新为7步
const maxVisibleStep = ref(1)
// 控制右侧内容的显示
const showRightContent = ref(false)
const taskContentReady = ref(false) // 新增：控制任务内容的动画状态
const showMainContent = ref(false)
const showObjectives = ref(false)
const showTools = ref(false)

// 打字效果相关
const typedTaskDescription = ref('')
const fullTaskDescription =
  '为学校设计一套智能通风节能方案，包括问题分析、控制策略、GPT提示词设计和实施步骤，目标是在保证学习舒适度的前提下减少能源浪费。'

const taskSteps = reactive<TaskStep[]>([
  { title: '问题理解', description: '分析教室热源和通风情况' },
  { title: '问题识别', description: '收集环境数据和识别主要能耗问题' },
  { title: '方案设计', description: '设计智能控制策略和节能方案' },
  { title: '提示词设计', description: '设计用户界面提示词模板' }, // 新增Step4
  { title: '应急调整', description: '应对突发情况调整控制逻辑' }, // 原Step4变为Step5
  { title: '方案整合', description: '整合完整的节能控制方案' }, // 原Step5变为Step6
  { title: '自我评估', description: '反思和评估方案效果' }, // 原Step6变为Step7
])

const learningObjectives = reactive([
  '分析教室热源与通风情况',
  '收集气温、湿度、人数等关键数据',
  '设计GPT提示词生成控制指令',
  '制定何时开窗、空调、风扇的策略',
  '应对突发情况的应急预案',
  '完成智能通风节能方案展示',
])

const tools = reactive<Tool[]>([
  { title: '💳 信息卡片', description: '查看教室结构图和环境数据' },
  { title: '💬 我想提问', description: '遇到困难时获得启发引导' },
])

// 添加工具点击处理相关状态
const showInfoModal = ref(false)

// 计算属性：根据当前步骤显示对应的步骤
const visibleSteps = computed(() => {
  return taskSteps.slice(1, maxVisibleStep.value)
})

// 工具点击处理函数
const handleToolClick = (tool: Tool) => {
  if (tool.title.includes('信息卡片')) {
    showInfoModal.value = true
  } else if (tool.title.includes('我想提问')) {
    // 显示提示信息
    showHelpTip()
  }
}

// 显示帮助提示
const showHelpTip = () => {
  // 创建一个临时提示框
  const tipElement = document.createElement('div')
  tipElement.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      color: #333;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      animation: fadeInScale 0.3s ease-out;
    ">
      <!-- 固定的标题部分 -->
      <div style="
        text-align: center;
        padding: 2rem 2rem 1rem;
        flex-shrink: 0;
      ">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">💬</div>
        <h3 style="margin: 0; color: #667eea; font-size: 1.5rem;">我想提问 - 使用说明</h3>
      </div>

      <!-- 可滚动的内容部分 -->
      <div style="
        flex: 1;
        overflow-y: auto;
        padding: 0 2rem;
        scrollbar-width: thin;
        scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
      " class="help-tip-scroll">
        <div style="text-align: left; line-height: 1.6; color: #555;">
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                      padding: 1rem; border-radius: 12px; margin-bottom: 1rem;
                      border-left: 4px solid #0ea5e9;">
            <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #0369a1;">
              📍 位置
            </p>
            <p style="margin: 0; font-size: 0.9rem;">
              在对话框左下角，您可以随时点击<strong>"我想提问"</strong>按钮获取智能帮助。
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                      padding: 1rem; border-radius: 12px; margin-bottom: 1rem;
                      border-left: 4px solid #f59e0b;">
            <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #92400e;">
              🎯 三种帮助方式
            </p>
            <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem; font-size: 0.9rem;">
              <li style="margin-bottom: 0.5rem;">
                <strong>🗣 帮我完善内容：</strong>AI 会帮你改进当前的输入框中的内容（请先在输入框中写下答案，再点击该按钮）
              </li>
              <li style="margin-bottom: 0.5rem;">
                <strong>💡 给我看看例子：</strong>AI 会提供一个参考示例来启发你
              </li>
              <li style="margin-bottom: 0;">
                <strong>✍️ 我想自己提问：</strong>你可以输入具体问题，AI 会针对性回答
              </li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
                      padding: 1rem; border-radius: 12px; margin-bottom: 1rem;
                      border-left: 4px solid #ec4899;">
            <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #9f1239;">
              🔢 使用限制
            </p>
            <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem; font-size: 0.9rem;">
              <li style="margin-bottom: 0.5rem;">
                <strong>总次数限制：</strong>每个step最多可使用 <strong style="color: #ec4899;">4 次</strong>"我想提问"
              </li>
              <li style="margin-bottom: 0.5rem;">
                <strong>单周期限制：</strong>每次点击后，三种方式各只能用一次
              </li>
              <li style="margin-bottom: 0;">
                <strong>周期重置：</strong>提交答案后，自动重置，可再次使用
              </li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                      padding: 1rem; border-radius: 12px;
                      border-left: 4px solid #22c55e;">
            <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #15803d;">
              💡 使用建议
            </p>
            <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem; font-size: 0.9rem;">
              <li style="margin-bottom: 0.5rem;">
                先独立思考，遇到困难时再使用帮助
              </li>
              <li style="margin-bottom: 0.5rem;">
                根据实际需求选择最合适的帮助方式
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 固定的按钮部分 -->
      <div style="
        text-align: center;
        padding: 1.5rem 2rem 2rem;
        flex-shrink: 0;
      ">
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(102, 126, 234, 0.4)'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.3)'">
          明白了，开始使用
        </button>
      </div>
    </div>
    <div onclick="this.parentElement.remove()" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 999;
    "></div>
  `

  // 添加动画和滚动条样式
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    /* 自定义滚动条样式 */
    .help-tip-scroll::-webkit-scrollbar {
      width: 8px;
    }

    .help-tip-scroll::-webkit-scrollbar-track {
      background: transparent;
      margin: 10px 0;
    }

    .help-tip-scroll::-webkit-scrollbar-thumb {
      background: rgba(102, 126, 234, 0.3);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }

    .help-tip-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(102, 126, 234, 0.5);
      border: 2px solid transparent;
      background-clip: padding-box;
    }
  `
  document.head.appendChild(style)

  document.body.appendChild(tipElement)
}

// 关闭信息模态框
const closeInfoModal = () => {
  showInfoModal.value = false
}

// 登出
const handleLogout = () => {
  // 可以添加确认对话框
  if (confirm('确定要退出登录吗？当前用户的所有实验数据将被清除，下次登录将重新开始实验。')) {
    try {
      // 1. 清除所有实验相关的本地存储数据
      simpleStorage.clearSession()

      // 2. 调用原有的登出函数（清除登录状态、token等）
      logout()

      // 3. 重置当前组件的状态（可选）
      currentStep.value = 1
      showRightContent.value = false
      taskContentReady.value = false
      showMainContent.value = false
      showObjectives.value = false
      showTools.value = false
      typedTaskDescription.value = ''

      // 4. 跳转到登录页
      router.push('/login')

      console.log('✅ 用户已登出，所有本地数据已清除')
    } catch (error) {
      console.error('登出过程中发生错误:', error)
      // 即使出错也要跳转到登录页
      logout()
      router.push('/login')
    }
  }
}

// 打字效果函数
const typeWriter = (text: string, target: Ref<string>, speed: number = 50): Promise<void> => {
  return new Promise((resolve) => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        target.value += text.charAt(i)
        i++
      } else {
        clearInterval(timer)
        resolve()
      }
    }, speed)
  })
}

// 开始右侧内容动画
const startRightContentAnimation = async () => {
  if (showRightContent.value) return // 防止重复触发

  showRightContent.value = true
  typedTaskDescription.value = '' // 先清空，避免重复打字

  // 等待一小段时间让DOM更新，然后开始动画
  await new Promise((resolve) => setTimeout(resolve, 100))

  // 标记任务内容准备就绪，触发CSS动画
  taskContentReady.value = true

  // 开始打字效果
  await typeWriter(fullTaskDescription, typedTaskDescription, 30)

  // 打字完成后，显示其他内容
  setTimeout(() => {
    showMainContent.value = true
    setTimeout(() => {
      showObjectives.value = true
    }, 200)
    setTimeout(() => {
      showTools.value = true
    }, 600)
  }, 300)
}

const goToStep = (index: number) => {
  currentStep.value = index + 1
  router.push(`/experiment/step${index + 1}`)
}

// 根据当前路由更新步骤
const updateCurrentStepFromRoute = () => {
  const path = route.path
  const stepMatch = path.match(/step(\d+)/)
  if (stepMatch) {
    const step = parseInt(stepMatch[1])
    currentStep.value = step

    // 如果maxVisibleStep小于当前步骤，说明是直接访问的URL，重置为当前步骤
    if (maxVisibleStep.value < step) {
      maxVisibleStep.value = step
    }

    // 如果不是第一步，需要显示右侧内容
    if (step > 1 && !showRightContent.value) {
      initializeRightContent()
    }
  }
}

// 处理子组件的show-next-steps事件 - 确保只递增一步
const handleShowNextSteps = () => {
  // 只有当前步骤完成时才显示下一步
  const nextStep = currentStep.value + 1
  if (nextStep <= taskSteps.length && maxVisibleStep.value < nextStep) {
    maxVisibleStep.value = nextStep
  }
}

// 初始化右侧内容（用于刷新恢复状态）
const initializeRightContent = async () => {
  showRightContent.value = true
  taskContentReady.value = true

  // 直接设置完整文本，无需打字效果
  typedTaskDescription.value = fullTaskDescription

  // 显示其他内容
  setTimeout(() => {
    showMainContent.value = true
    setTimeout(() => {
      showObjectives.value = true
    }, 100)
    setTimeout(() => {
      showTools.value = true
    }, 200)
  }, 100)
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    updateCurrentStepFromRoute()
  },
  { immediate: true },
)
</script>

<style scoped>
.learning-platform {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.platform-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header-content h1 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-indicator {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.logout-btn:hover {
  background: linear-gradient(45deg, #5a6fd8, #6b42a0);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.logout-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.logout-icon {
  font-size: 1rem;
}

.logout-text {
  font-size: 0.9rem;
}

.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 1rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  min-height: 0;
}

.task-panel,
.info-panel,
.interaction-area {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.task-panel,
.info-panel {
  padding: 1.5rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

/* Webkit浏览器滚动条样式 */
.task-panel::-webkit-scrollbar,
.info-panel::-webkit-scrollbar,
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.task-panel::-webkit-scrollbar-track,
.info-panel::-webkit-scrollbar-track,
.chat-messages::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.task-panel::-webkit-scrollbar-thumb,
.info-panel::-webkit-scrollbar-thumb,
.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

.task-panel::-webkit-scrollbar-thumb:hover,
.info-panel::-webkit-scrollbar-thumb:hover,
.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

.panel-header h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  flex-shrink: 0;
}

.task-steps {
  flex: 1;
  overflow-y: auto;
}

.step-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.step-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.step-item.active {
  background: rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.step-item.completed {
  background: rgba(76, 175, 80, 0.1);
  border-color: #4caf50;
}

.step-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.step-item.completed .step-number {
  background: #4caf50;
}

.step-content h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 0.9rem;
}

.step-content p {
  margin: 0;
  color: #666;
  font-size: 0.8rem;
  line-height: 1.4;
}

.interaction-area {
  overflow: hidden;
}

.panel-section {
  margin-bottom: 2rem;
  flex-shrink: 0;
}

.panel-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
}

/* 修改任务内容的动画 */
.current-task {
  min-height: 5em;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  opacity: 0;
  transform: translateY(20px);
}

.current-task.task-content-visible {
  animation: fadeInUp 0.6s ease-out 0.2s forwards;
}

.current-task h4 {
  margin: 0 0 0.5rem 0;
  color: #667eea;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.task-description-container {
  min-height: 3.5em;
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.current-task p {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
  flex: 1;
}

.learning-objectives {
  list-style: none;
  padding: 0;
  margin: 0;
}

.learning-objectives li {
  padding: 0.5rem 0;
  color: #666;
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  opacity: 0;
  transform: translateX(-20px);
}

.learning-objectives li:before {
  content: '✓';
  color: #4caf50;
  margin-right: 0.5rem;
  font-weight: bold;
}

.learning-objectives li.fade-in {
  animation: fadeInRight 0.4s ease-out forwards;
}

.thinking-tools {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tool-description {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.85rem;
  line-height: 1.4;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  position: relative;
}

.tool-description.clickable-tool {
  cursor: pointer;
  border: 2px solid rgba(102, 126, 234, 0.2);
}

.tool-description.clickable-tool:hover {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.tool-description.fade-in {
  animation: fadeInUp 0.4s ease-out forwards;
}

.tool-description strong {
  color: #667eea;
}

.tool-description span {
  color: #666;
}

.tool-click-hint {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.7rem;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tool-description.clickable-tool:hover .tool-click-hint {
  opacity: 1;
}

/* 🔥 信息模态框样式 - 修复滚动条位置 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.info-modal {
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 90%;
  max-height: 85vh;
  /* 🔥 移除 overflow-y: auto; */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 1rem;
  border-bottom: 2px solid #e2e8f0;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: #f1f5f9;
  color: #64748b;
}

/* 🔥 新增：可滚动内容容器 */
.modal-content-scroll {
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

.modal-content-scroll::-webkit-scrollbar {
  width: 8px;
}

.modal-content-scroll::-webkit-scrollbar-track {
  background: transparent;
  margin: 10px 0;
}

.modal-content-scroll::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.modal-content-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.modal-content {
  padding: 1.5rem 2rem 2rem;
}

.classroom-layout {
  margin-bottom: 2rem;
}

.classroom-layout h4 {
  color: #333;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.layout-diagram {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.classroom-svg {
  width: 100%;
  height: auto;
}

.svg-label {
  font-size: 10px;
  fill: #374151;
  font-weight: 600;
}

.svg-small-label {
  font-size: 8px;
  fill: #64748b;
  font-weight: 500;
}

.environment-details h4 {
  color: #333;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.data-item:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.data-value {
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 600;
}

/* 环境舒适度参考标准 */
.reference-standards {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e2e8f0;
}

.reference-standards h4 {
  color: #333;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.standards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.standard-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.standard-item:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.2);
}

.standard-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.standard-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.standard-range {
  font-size: 0.95rem;
  color: #0369a1;
  font-weight: 700;
}

.standard-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

/* 动画定义 */
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
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 250px 1fr 250px;
  }
}

@media (max-width: 768px) {
  .info-modal {
    width: 95%;
    max-height: 90vh;
  }

  .modal-header,
  .modal-content {
    padding: 1rem;
  }

  .data-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .data-item {
    padding: 0.5rem;
  }

  .data-label,
  .data-value {
    font-size: 0.8rem;
  }

  .layout-diagram {
    padding: 0.5rem;
  }

  .standards-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .standard-item {
    padding: 0.5rem;
  }

  .standard-icon {
    font-size: 1.2rem;
  }

  .standard-range {
    font-size: 0.85rem;
  }

  .standard-label {
    font-size: 0.75rem;
  }

  .reference-standards {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
  }

  .tool-click-hint {
    display: none;
  }

  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    gap: 0.5rem;
  }

  .task-panel,
  .info-panel {
    height: auto;
    max-height: 200px;
  }

  .interaction-area {
    height: auto;
  }

  .header-right {
    flex-direction: column;
    gap: 0.5rem;
  }

  .logout-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .logout-text {
    display: none;
  }
}

.info-panel {
  min-height: 320px;
  display: flex;
  flex-direction: column;
}

.panel-section:first-child {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-section:first-child h3 {
  flex-shrink: 0;
}

.panel-section:first-child .current-task {
  flex: 1;
  justify-content: center;
}
</style>
