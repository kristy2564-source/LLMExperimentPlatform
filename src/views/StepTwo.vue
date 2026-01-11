<template>
  <div class="step-two-container">
    <!-- 🔥 新增：步骤锁定提示（仅在锁定时显示） -->
    <div v-if="isStepLocked" class="step-locked-banner">
      <span class="lock-icon">🔒</span>
      <span>此步骤已确认答案并锁定，仅查看。</span>
    </div>
    <!-- 对话轮次限制提示 -->
    <div
      v-if="conversationCount >= 7"
      class="conversation-limit-warning"
      :class="{ 'warning-visible': showConversationWarning }"
    >
      <div class="warning-content">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <span v-if="conversationCount === 7">您已经进行了7轮对话，还有1次提交机会</span>
          <span v-else>您已达到最大对话次数（8轮），请点击"继续下一步"按钮进入下一阶段</span>
        </div>
      </div>
    </div>

    <!-- 对话滚动区域 -->
    <div class="chat-scroll-area" ref="chatScrollArea">
      <!-- 信息卡片区域 -->
      <div class="info-card-section">
        <div class="info-card" :class="{ 'card-visible': showInfoCard }">
          <div class="card-header">
            <div class="card-icon">🌡️</div>
            <div class="card-title">
              随着夏季来临，学校教室变得越来越闷热。你们班有40个学生，教室面积约60㎡，
              每天上午10点后教室温度就超过28℃，下午最高能达到35℃。空调一开就是整天，
              电费直线上升。老师说如果继续这样下去，学校的电费预算会超支，
              可能影响其他教学设备的购买...
            </div>
          </div>

          <div class="card-content">
            <div class="chart-section">
              <h4>教室环境监测数据：</h4>
              <div class="chart-container">
                <!-- 温度变化图表 -->
                <div class="temperature-chart">
                  <h5>🌡️ 教室温度变化趋势图</h5>
                  <svg viewBox="0 0 400 120" class="chart-svg">
                    <!-- 背景网格 -->
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path
                          d="M 20 0 L 0 0 0 20"
                          fill="none"
                          stroke="#e0e4e7"
                          stroke-width="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    <!-- 温度上升曲线 -->
                    <path
                      d="M 30 90 Q 100 85 150 70 T 250 45 T 350 25"
                      fill="none"
                      stroke="#ef4444"
                      stroke-width="3"
                    />

                    <!-- 舒适温度线 -->
                    <line
                      x1="30"
                      y1="75"
                      x2="350"
                      y2="75"
                      stroke="#22c55e"
                      stroke-width="2"
                      stroke-dasharray="5,5"
                    />

                    <!-- 数据点 -->
                    <circle cx="30" cy="90" r="4" fill="#22c55e" />
                    <circle cx="150" cy="70" r="4" fill="#f59e0b" />
                    <circle cx="250" cy="45" r="4" fill="#ef4444" />
                    <circle cx="350" cy="25" r="4" fill="#dc2626" />

                    <!-- 标签 -->
                    <text x="30" y="110" text-anchor="middle" class="chart-label">8:00</text>
                    <text x="150" y="110" text-anchor="middle" class="chart-label">10:00</text>
                    <text x="250" y="110" text-anchor="middle" class="chart-label">14:00</text>
                    <text x="350" y="110" text-anchor="middle" class="chart-label">16:00</text>

                    <!-- 温度标签 -->
                    <text x="380" y="95" class="temp-label">22℃</text>
                    <text x="380" y="75" class="temp-label">25℃</text>
                    <text x="380" y="50" class="temp-label">30℃</text>
                    <text x="380" y="30" class="temp-label">35℃</text>
                  </svg>
                </div>

                <!-- 教室状态面板 -->
                <div class="classroom-status">
                  <h5>🏫 教室环境实时监测数据</h5>
                  <div class="status-grid">
                    <div class="status-item">
                      <span class="status-icon">👥</span>
                      <span class="status-value">40人</span>
                      <span class="status-label">在座学生</span>
                    </div>
                    <div class="status-item">
                      <span class="status-icon">📐</span>
                      <span class="status-value">60㎡</span>
                      <span class="status-label">教室面积</span>
                    </div>
                    <div class="status-item">
                      <span class="status-icon">🌬️</span>
                      <span class="status-value">2.1m/s</span>
                      <span class="status-label">室外风速</span>
                    </div>
                    <div class="status-item">
                      <span class="status-icon">🧭</span>
                      <span class="status-value">西南风</span>
                      <span class="status-label">风向</span>
                    </div>
                    <div class="status-item">
                      <span class="status-icon">💨</span>
                      <span class="status-value">65%</span>
                      <span class="status-label">湿度</span>
                    </div>
                    <div class="status-item">
                      <span class="status-icon">⚡</span>
                      <span class="status-value">3.2kW</span>
                      <span class="status-label">空调功率</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 环境标准参考 -->
              <div class="reference-standards">
                <h4>💡 环境舒适度参考标准：</h4>
                <div class="standards-grid">
                  <div class="standard-item">
                    <span class="standard-icon">🌡️</span>
                    <span class="standard-range">20-26℃</span>
                    <span class="standard-label">舒适温度</span>
                  </div>
                  <div class="standard-item">
                    <span class="standard-icon">💧</span>
                    <span class="standard-range">40-70%</span>
                    <span class="standard-label">适宜湿度</span>
                  </div>
                  <div class="standard-item">
                    <span class="standard-icon">🌊</span>
                    <span class="standard-range">≤1000ppm</span>
                    <span class="standard-label">CO₂浓度</span>
                  </div>
                  <div class="standard-item">
                    <span class="standard-icon">💨</span>
                    <span class="standard-range">0.1-0.3m/s</span>
                    <span class="standard-label">室内风速</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 阶段进度指示器 -->
      <div class="stage-progress" :class="{ 'stage-visible': showStageProgress }">
        <div class="progress-container">
          <div class="progress-header">
            <h3>问题分析进度</h3>
            <div class="progress-info">
              <span class="stage-info">{{ currentStage }}/2</span>
              <span class="conversation-counter">对话: {{ conversationCount }}/8</span>
            </div>
          </div>
          <div class="progress-stages">
            <div
              v-for="(stage, index) in stageConfig"
              :key="index"
              class="progress-stage"
              :class="{
                completed: stageCompletionStatus[index] || index + 1 < currentStage,
                active: index + 1 === currentStage && !stageCompletionStatus[index],
                pending: index + 1 > currentStage && !stageCompletionStatus[index],
              }"
            >
              <div class="stage-icon">
                <span v-if="stageCompletionStatus[index] || index + 1 < currentStage">✓</span>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="stage-label">{{ stage.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 对话消息区域 -->
      <!-- 🔥 核心改动：所有对话内容放在 chat-messages 内 -->
      <div class="chat-messages">
        <!-- 初始 AI 引导消息 -->
        <div class="message ai" v-if="showPrompt">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <div class="message-text">
              问题识别和控制设计阶段：
              我们先从第一步【问题识别】开始：你觉得影响教室闷热与耗电的<strong>关键因素</strong>有哪些？<br />
              可以从环境、设备、人三个角度想想
            </div>
          </div>
        </div>

        <!-- 🔥 新增：因素选择面板（阶段1且未提交时显示） -->
        <div v-if="currentStage === 1 && !stage1SelectionSubmitted" class="factor-selection-panel">
          <!-- 🔥 根据步骤显示不同内容 -->
          <div v-if="selectionStep === 'select'" class="selection-content">
            <div class="selection-header">
              <div class="header-icon">🔍</div>
              <h3>步骤1：选择影响因素</h3>
              <p class="selection-hint">
                请勾选你认为重要的因素（最少3个，最多{{ MAX_SELECTION }}个）
              </p>
            </div>

            <div class="factor-categories">
              <!-- 环境因素 -->
              <div class="factor-category">
                <h4 class="category-title">
                  <span class="category-icon">🌤️</span>
                  环境因素
                </h4>
                <div class="factor-options">
                  <label
                    v-for="factor in factorOptions.environment"
                    :key="factor.id"
                    class="factor-option"
                    :class="{ selected: factor.selected }"
                  >
                    <input type="checkbox" v-model="factor.selected" class="factor-checkbox" />
                    <div class="factor-content">
                      <span class="factor-label">{{ factor.label }}</span>
                      <span class="factor-desc" v-if="factor.description">{{
                        factor.description
                      }}</span>
                    </div>
                    <span class="checkmark">✓</span>
                  </label>
                </div>
              </div>

              <!-- 人员因素 -->
              <div class="factor-category">
                <h4 class="category-title">
                  <span class="category-icon">👥</span>
                  人员因素
                </h4>
                <div class="factor-options">
                  <label
                    v-for="factor in factorOptions.people"
                    :key="factor.id"
                    class="factor-option"
                    :class="{ selected: factor.selected }"
                  >
                    <input type="checkbox" v-model="factor.selected" class="factor-checkbox" />
                    <div class="factor-content">
                      <span class="factor-label">{{ factor.label }}</span>
                      <span class="factor-desc" v-if="factor.description">{{
                        factor.description
                      }}</span>
                    </div>
                    <span class="checkmark">✓</span>
                  </label>
                </div>
              </div>

              <!-- 设备因素 -->
              <div class="factor-category">
                <h4 class="category-title">
                  <span class="category-icon">⚙️</span>
                  设备因素
                </h4>
                <div class="factor-options">
                  <label
                    v-for="factor in factorOptions.equipment"
                    :key="factor.id"
                    class="factor-option"
                    :class="{ selected: factor.selected }"
                  >
                    <input type="checkbox" v-model="factor.selected" class="factor-checkbox" />
                    <div class="factor-content">
                      <span class="factor-label">{{ factor.label }}</span>
                      <span class="factor-desc" v-if="factor.description">{{
                        factor.description
                      }}</span>
                    </div>
                    <span class="checkmark">✓</span>
                  </label>
                </div>
              </div>

              <!-- 其他因素 -->
              <div class="factor-category">
                <h4 class="category-title">
                  <span class="category-icon">💡</span>
                  其他因素
                </h4>
                <div class="factor-options">
                  <label
                    v-for="factor in factorOptions.others"
                    :key="factor.id"
                    class="factor-option"
                    :class="{ selected: factor.selected }"
                  >
                    <input type="checkbox" v-model="factor.selected" class="factor-checkbox" />
                    <div class="factor-content">
                      <span class="factor-label">{{ factor.label }}</span>
                      <span class="factor-desc" v-if="factor.description">{{
                        factor.description
                      }}</span>
                    </div>
                    <span class="checkmark">✓</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 自定义补充区域 -->
            <div class="custom-factors-section">
              <h4 class="custom-title">
                <span class="custom-icon">💭</span>
                你还想到其他因素吗？（可选）
              </h4>
              <textarea
                v-model="customFactorInput"
                class="custom-input"
                placeholder="例如：天气预报、课间开窗习惯、学生座位调整等..."
                rows="3"
                maxlength="200"
              ></textarea>
              <div class="custom-char-count">{{ customFactorInput.length }}/200</div>
            </div>

            <!-- 选择统计和按钮 - 修改 -->
            <div class="selection-summary">
              <div class="summary-stat">
                <span class="stat-icon">📊</span>
                <span class="stat-text">
                  已选择: <strong class="stat-number">{{ selectedCount }}</strong> /
                  {{ MAX_SELECTION }} 个
                </span>
                <span v-if="selectedCount < 3" class="warning-text">（至少需要3个）</span>
                <span v-else-if="selectedCount > MAX_SELECTION" class="error-text"
                  >（超过上限！）</span
                >
                <span v-else class="success-text">✓ 满足要求</span>
              </div>
              <div class="summary-actions">
                <button
                  class="next-step-button"
                  :class="{ disabled: !canProceedToRank }"
                  :disabled="!canProceedToRank"
                  @click="goToRankingStep"
                >
                  <span class="button-icon">➡️</span>
                  <span>继续排序</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 🔥 新增：排序界面 -->
          <div v-else-if="selectionStep === 'rank'" class="ranking-content">
            <div class="ranking-header">
              <div class="header-icon">📊</div>
              <h3>步骤2：重要性排序</h3>
              <p class="ranking-hint">请对选中的因素按重要性排序（越重要越靠前）</p>
            </div>

            <div class="ranking-list">
              <div v-for="(factor, index) in rankedFactors" :key="factor.id" class="ranking-item">
                <div class="rank-number">{{ index + 1 }}</div>
                <div class="factor-info">
                  <div class="factor-label">{{ factor.label }}</div>
                  <div class="factor-desc">{{ factor.description }}</div>
                </div>
                <div class="rank-controls">
                  <button class="rank-btn up" :disabled="index === 0" @click="moveUp(index)">
                    ↑
                  </button>
                  <button
                    class="rank-btn down"
                    :disabled="index === rankedFactors.length - 1"
                    @click="moveDown(index)"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>

            <!-- 自定义因素显示（如果有） -->
            <div v-if="customFactorInput.trim()" class="custom-factor-display">
              <h4>💭 你补充的因素：</h4>
              <p>{{ customFactorInput }}</p>
            </div>

            <div class="ranking-actions">
              <button class="back-button" @click="backToSelection">
                <span>⬅️</span>
                <span>重新选择</span>
              </button>
              <button class="confirm-ranking-button" @click="confirmFactorSelection">
                <span class="button-icon">✓</span>
                <span>确认提交</span>
              </button>
            </div>

            <div class="ranking-tip">
              <span class="tip-icon">💡</span>
              <span>提示：前3个因素将被视为"关键因素"，其他为"次要因素"</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 动态对话消息 - 过滤掉system类型 -->
      <div
        v-for="message in messages.filter((m) => m.type !== 'system')"
        :key="message.id"
        :class="['message', message.type]"
      >
        <div class="message-avatar">
          {{ message.type === 'ai' ? '🤖' : '👤' }}
        </div>
        <div class="message-content">
          <div class="message-text" v-html="message.content"></div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>

      <!-- AI思考加载动画 -->
      <div v-if="isGenerating" class="message ai loading-message">
        <div class="message-avatar">🤖</div>
        <div class="message-content loading-content">
          <div class="loading-animation">
            <div class="loading-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
            <div class="loading-text">AI正在分析您的回答，预计需要15-30秒...</div>
            <div class="loading-progress">
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
              <div class="progress-steps">
                <span class="step active">📝 理解问题</span>
                <span class="step" :class="{ active: loadingStep >= 2 }">🔍 分析数据</span>
                <span class="step" :class="{ active: loadingStep >= 3 }">💡 生成建议</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 底部用户输入区域 -->
  <div class="input-section" :class="{ 'input-visible': showAnswerArea }">
    <div class="input-container">
      <textarea
        v-model="userAnswer"
        :placeholder="currentStagePlaceholder"
        class="user-input"
        :disabled="isStepLocked || isGenerating || isConversationLimitReached"
        @input="handleInput"
        rows="3"
      ></textarea>
      <div class="input-toolbar">
        <button
          class="help-button"
          @click="requestHelp"
          :disabled="isStepLocked || isGenerating || isConversationLimitReached || !canUseHelp"
          :title="isStepLocked ? '步骤已锁定' : getHelpButtonTitle"
        >
          <span class="help-icon">💡</span>
          <span class="help-text">我想提问</span>
          <span class="help-counter"> {{ remainingCycles }}/{{ helpSystem.maxCycles }} </span>
        </button>
        <div class="action-buttons">
          <button
            v-if="!isConversationLimitReached"
            class="submit-button"
            @click="submitAnswer"
            :disabled="isStepLocked || !canSubmit || isGenerating"
          >
            <span v-if="isGenerating">
              <span class="button-loading-dots">
                <span class="button-dot"></span>
                <span class="button-dot"></span>
                <span class="button-dot"></span>
              </span>
              分析中...
            </span>
            <span v-else>{{ currentSubmitButtonText }}</span>
          </button>
          <!-- 关键修改：当第二阶段完成或对话达到限制时显示下一步按钮 -->
          <button
            class="next-button"
            @click="handleNextStep"
            v-if="allStagesCompleted || isConversationLimitReached"
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 🔥 帮助弹窗 -->
  <div v-if="showHelpDialog" class="help-dialog-overlay" @click="closeHelpDialog">
    <div class="help-dialog" @click.stop>
      <div class="help-dialog-header">
        <div class="help-dialog-icon">💬</div>
        <h3>选择帮助方式</h3>
        <button class="close-button" @click="closeHelpDialog">✕</button>
      </div>

      <div class="help-dialog-content">
        <p class="help-dialog-description">请选择你需要的帮助类型：</p>

        <!-- 帮助选项 -->
        <div class="help-options">
          <!-- 选项1：完善内容 -->
          <button
            class="help-option"
            :class="{
              active: helpMode === 'refine',
              disabled: !availableHelpModes.refine,
            }"
            @click="selectHelpMode('refine')"
            :disabled="!userAnswer.trim() || !availableHelpModes.refine"
          >
            <div class="option-icon">🗣</div>
            <div class="option-content">
              <div class="option-title">
                帮我完善内容
                <span v-if="!availableHelpModes.refine" class="used-badge">已使用</span>
              </div>
              <div class="option-description">
                "我好像写得不太清楚，帮我完善一下吧。"（请先在输入框中写下答案，再点击该按钮）
              </div>
            </div>
            <div class="option-arrow">→</div>
          </button>

          <!-- 选项2：给示例 -->
          <button
            class="help-option"
            :class="{
              active: helpMode === 'example',
              disabled: !availableHelpModes.example,
            }"
            @click="selectHelpMode('example')"
            :disabled="!availableHelpModes.example"
          >
            <div class="option-icon">💡</div>
            <div class="option-content">
              <div class="option-title">
                给我看看例子
                <span v-if="!availableHelpModes.example" class="used-badge">已使用</span>
              </div>
              <div class="option-description">"我有点不确定怎么做，能给个参考例子吗？"</div>
            </div>
            <div class="option-arrow">→</div>
          </button>

          <!-- 选项3：自定义提问 -->
          <button
            class="help-option"
            :class="{
              active: helpMode === 'custom',
              disabled: !availableHelpModes.custom,
            }"
            @click="selectHelpMode('custom')"
            :disabled="!availableHelpModes.custom"
          >
            <div class="option-icon">✍️</div>
            <div class="option-content">
              <div class="option-title">
                我想自己提问
                <span v-if="!availableHelpModes.custom" class="used-badge">已使用</span>
              </div>
              <div class="option-description">"我有具体的问题想问。"</div>
            </div>
            <div class="option-arrow">→</div>
          </button>
        </div>

        <!-- 🔥 周期提示 -->
        <div class="help-cycle-info">
          <span class="cycle-icon">🔄</span>
          <span>剩余帮助次数：{{ helpSystem.maxCycles - helpSystem.totalCycles }} 次</span>
          <span v-if="helpSystem.isInCycle" class="cycle-tip">
            （当前周期已使用
            {{ Object.values(helpSystem.currentCycleUsed).filter(Boolean).length }}/3）
          </span>
        </div>

        <!-- 自定义问题输入框 -->
        <div v-if="helpMode === 'custom'" class="custom-question-section">
          <textarea
            v-model="customQuestion"
            placeholder="请输入你的问题..."
            class="custom-question-input"
            rows="3"
            autofocus
          ></textarea>
          <div class="custom-question-actions">
            <button class="cancel-custom-button" @click="helpMode = null">取消</button>
            <button
              class="submit-custom-button"
              @click="submitCustomQuestion"
              :disabled="!customQuestion.trim()"
            >
              提交问题
            </button>
          </div>
        </div>

        <!-- 完善内容提示 -->
        <div v-if="helpMode === 'refine' && !userAnswer.trim()" class="help-tip">
          <span class="tip-icon">💡</span>
          <span>请先在下方输入框中写一些内容，然后我可以帮你完善。</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 🔥 帮助次数用尽提示 -->
  <div v-if="showHelpLimitDialog" class="help-dialog-overlay" @click="closeHelpLimitDialog">
    <div class="help-limit-dialog" @click.stop>
      <div class="limit-dialog-icon">⚠️</div>
      <h3>帮助次数已用完</h3>
      <p>您已使用完所有的帮助次数（{{ helpSystem.maxCycles }} 次）。</p>
      <p class="limit-tip">请继续独立完成剩余的任务，或点击"提交回答"按钮提交您的答案。</p>
      <button class="limit-confirm-button" @click="closeHelpLimitDialog">知道了</button>
    </div>
  </div>

  <!-- 🔥 周期内帮助已用尽提示 -->
  <div v-if="showCycleLimitDialog" class="help-dialog-overlay" @click="closeCycleLimitDialog">
    <div class="help-limit-dialog" @click.stop>
      <div class="limit-dialog-icon">🔄</div>
      <h3>当前周期的帮助已全部使用</h3>
      <p>您已使用完当前周期的3种帮助方式。</p>
      <p class="limit-tip">
        请先提交您的答案，提交后将开启新的帮助周期。
        <br />
        剩余帮助周期：<strong>{{ helpSystem.maxCycles - helpSystem.totalCycles }}</strong> 次
      </p>
      <button class="limit-confirm-button" @click="closeCycleLimitDialog">知道了</button>
    </div>
  </div>

  <!-- 🔥 修改：确认弹窗 - 统一风格版本 -->
  <div v-if="showConfirmDialog" class="confirm-dialog-overlay" @click="closeConfirmDialog">
    <div class="confirm-dialog" @click.stop>
      <div class="dialog-header">
        <div class="dialog-icon">🎯</div>
        <h3>确认进入下一步</h3>
      </div>

      <!-- 🔥 保存成功提示条（独立显示） -->
      <transition name="fade">
        <div v-if="tempSaveStatus" class="save-success-banner">
          <span class="save-icon">✅</span>
          <span>{{ tempSaveStatus }}</span>
          <span class="save-time">{{ lastTempSaveTime }}</span>
        </div>
      </transition>

      <div class="dialog-content">
        <p>您即将完成问题分析阶段，进入下一个学习环节。请确认或修改您的最终内容。</p>

        <!-- 可编辑的快照区域 -->
        <div v-if="editableFinalAnswer" class="answer-preview">
          <div class="preview-header">
            <span class="preview-icon">📝</span>
            <span class="preview-title">本步骤的最终内容（可编辑）</span>
          </div>

          <!-- 🔥 新增：任务标题 -->
          <div class="task-title">
            <span class="task-icon">🔍</span>
            <span class="task-text">任务：识别影响教室通风的关键因素，并设计控制策略</span>
          </div>

          <div class="preview-body">
            <textarea
              v-model="editableFinalAnswer"
              class="preview-textarea"
              rows="15"
              placeholder="请输入或修改你的最终内容..."
            ></textarea>

            <p class="preview-hint">💡 这是您最后一次修改机会，请仔细检查后点击"确定继续"。</p>

            <div class="char-count">字数：{{ editableFinalAnswer.length }} 字符</div>
          </div>
        </div>

        <!-- 完成情况摘要 -->
        <div class="completion-summary">
          <div class="summary-item">
            <span class="summary-icon">💬</span>
            <span>进行了 {{ conversationCount }} 轮问题分析讨论</span>
          </div>
          <div class="summary-item" v-if="stage1Completed">
            <span class="summary-icon">✅</span>
            <span>已完成因素识别阶段</span>
          </div>
          <div class="summary-item" v-if="stage2Completed">
            <span class="summary-icon">✅</span>
            <span>已完成控制设计阶段</span>
          </div>
          <div class="summary-item" v-if="helpSystem.totalCycles > 0">
            <span class="summary-icon">💡</span>
            <span>使用了 {{ helpSystem.totalCycles }} 次智能帮助</span>
          </div>
        </div>

        <div class="dialog-warning">
          <span class="warning-icon">⚠️</span>
          <span>点击"确定继续"后，您将无法返回修改当前的问题分析内容。</span>
        </div>
      </div>

      <!-- 弹窗按钮区域 -->
      <div class="dialog-actions">
        <!-- 返回对话按钮 -->
        <button class="cancel-button" @click="closeConfirmDialog">返回对话</button>

        <!-- 临时保存按钮 -->
        <button
          class="temp-save-button"
          @click="handleTempSaveInDialog"
          :disabled="!isContentModified || !editableFinalAnswer.trim()"
          :class="{ saved: isSaved }"
        >
          <span class="save-icon">{{ isSaved ? '✅' : '💾' }}</span>
          <span>{{ isSaved ? '已保存' : '临时保存' }}</span>
        </button>

        <!-- 确认按钮 -->
        <button
          class="confirm-button"
          @click="confirmNextStep"
          :disabled="!editableFinalAnswer.trim()"
        >
          确定继续
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { simpleStorage } from '../../api/utils/simpleStorage'
import { trackStep2Event } from '../../src/utils/tracking'

// 新增
interface Factor {
  id: string
  label: string
  description: string
  selected: boolean
}

interface FactorCategories {
  environment: Factor[]
  people: Factor[]
  equipment: Factor[]
  others: Factor[]
}

interface RankedFactorsData {
  isRanked: boolean
  keyFactors: Array<{ text: string; description: string }>
  secondaryFactors: string[]
  customFactors: string
  totalCount: number
}

// 新增响应式数据
const factorOptions = reactive<FactorCategories>({
  environment: [
    { id: 'outdoor_temp', label: '室外温度变化', description: '早晨22℃→下午35℃', selected: false },
    { id: 'indoor_temp', label: '室内温度', description: '学生感受到的温度', selected: false },
    { id: 'humidity', label: '空气湿度', description: '影响体感温度', selected: false },
    { id: 'co2', label: 'CO2浓度', description: '影响空气质量', selected: false },
    { id: 'wind', label: '室外风速', description: '影响自然通风', selected: false },
  ],
  people: [
    { id: 'student_count', label: '学生人数', description: '40人产热', selected: false },
    { id: 'activity', label: '活动强度', description: '上课vs体育课', selected: false },
    { id: 'duration', label: '课程时长', description: '连续上课时间', selected: false },
  ],
  equipment: [
    { id: 'ac_power', label: '空调功率', description: '3.2kW制冷', selected: false },
    { id: 'windows', label: '窗户位置', description: '通风路径', selected: false },
    { id: 'fans', label: '风扇/排气扇', description: '辅助通风', selected: false },
  ],
  others: [
    { id: 'orientation', label: '教室朝向', description: '影响日晒', selected: false },
    { id: 'curtains', label: '窗帘遮光', description: '减少热辐射', selected: false },
    { id: 'layout', label: '座位布局', description: '影响流通', selected: false },
  ],
})

const customFactorInput = ref<string>('')
const stage1SelectionSubmitted = ref<boolean>(false)

const selectedCount = computed(() => {
  return Object.values(factorOptions)
    .flat()
    .filter((f) => f.selected).length
})

const selectionStep = ref<'select' | 'rank' | 'submitted'>('select')
const rankedFactors = ref<Factor[]>([]) // 排序后的因素列表

const MAX_SELECTION = 8 // 最大选择数量

// 修改计算属性
const canProceedToRank = computed(() => {
  return selectedCount.value >= 3 && selectedCount.value <= MAX_SELECTION
})

// ==================== 🔥 新增：确认选择函数 ====================

const confirmFactorSelection = async () => {
  if (rankedFactors.value.length < 3) {
    alert('请至少选择3个影响因素')
    return
  }

  // 🔥 区分关键因素和次要因素
  const keyFactors = rankedFactors.value.slice(0, 3)
  const secondaryFactors = rankedFactors.value.slice(3)

  // 🔥 构建提交内容（带排序）
  let submittedContent = '【我认为最重要的3个关键因素是】\n'
  keyFactors.forEach((factor, index) => {
    submittedContent += `${index + 1}. ${factor.label}（${factor.description}）\n`
  })

  if (secondaryFactors.length > 0) {
    submittedContent += '\n【其他需要考虑的因素】\n'
    secondaryFactors.forEach((factor, index) => {
      submittedContent += `${index + 4}. ${factor.label}\n`
    })
  }

  if (customFactorInput.value.trim()) {
    submittedContent += `\n【我补充的因素】\n${customFactorInput.value.trim()}`
  }

  const rankedData: RankedFactorsData = {
    isRanked: true,
    keyFactors: keyFactors.map((f) => ({
      text: f.label,
      description: f.description,
    })),
    secondaryFactors: secondaryFactors.map((f) => f.label),
    customFactors: customFactorInput.value.trim(),
    totalCount: rankedFactors.value.length,
  }

  // 添加用户消息
  addMessage('user', submittedContent, 1)

  // 标记阶段1已提交选择
  stage1SelectionSubmitted.value = true
  selectionStep.value = 'submitted'

  // 埋点
  await trackStep2Event(
    'step2_stage1_factors_ranked_submitted',
    conversationData.sessionId,
    1,
    conversationCount.value,
    {
      totalCount: rankedFactors.value.length,
      keyFactors: keyFactors.map((f) => f.label).join(','),
      secondaryFactors: secondaryFactors.map((f) => f.label).join(','),
      hasCustomFactors: !!customFactorInput.value.trim(),
    },
  )

  // 🔥 显示加载动画
  isGenerating.value = true
  loadingStep.value = 0

  const stepInterval = setInterval(() => {
    if (loadingStep.value < 3) loadingStep.value++
  }, 3000)

  try {
    // 🔥 调用 AI API（只为了获取反馈）
    const result = await callAIAPI(submittedContent, 1, rankedData)
    clearInterval(stepInterval)

    // 添加 AI 回复
    addMessage('ai', result.response, 1)

    // 🔥 核心修改：直接完成 Stage1 并推进到 Stage2
    await completeStage1AndAdvanceToStage2()

    // 🔥 保存对话到数据库（包含因素数据）
    await saveConversationToDB({
      sessionId: conversationData.sessionId,
      step: 2,
      stage: 1,
      userInput: submittedContent,
      aiResponse: result.response,
      conversationCount: conversationData.conversationCount,
      timestamp: new Date(),
      context: 'step2_stage1_factor_selection_ranked',
      // 🔥 新增：传递因素数据到后端
      rankedFactorsData: rankedData,
    })
  } catch (error) {
    clearInterval(stepInterval)
    console.error('AI响应失败:', error)
    addMessage('ai', '抱歉，系统暂时无法处理，请重试', 1)
  } finally {
    isGenerating.value = false
    loadingStep.value = 0
  }

  saveToStorage()
  nextTick(() => scrollToBottom())
}

/**
 * 完成 Stage1 并推进到 Stage2
 * 因素选择+排序提交后直接推进，无需判断
 */
const completeStage1AndAdvanceToStage2 = async () => {
  console.log('✅ Step2-Stage1 因素选择完成，推进到 Stage2')

  // 1. 标记 Stage1 完成
  stage1Completed.value = true
  simpleStorage.updateStageStatus(2, 1, true)
  conversationData.stageCompletionStatus[0] = true

  // 2. 埋点 - Stage1 完成
  await trackStep2Event(
    'step2_stage_complete',
    conversationData.sessionId,
    1,
    conversationData.conversationCount,
    {
      stageNumber: 1,
      completionMethod: 'factor_selection_ranked', // 标记完成方式
      totalInteractions: conversationData.messages.filter((m) => m.stage === 1).length,
    },
  )

  // 3. 延迟1秒后推进到 Stage2（让用户看到AI反馈）
  setTimeout(() => {
    // 更新到 Stage2
    simpleStorage.updateCurrentStage(2, 2)

    // 重新加载数据
    const newData = simpleStorage.getStep2Data()
    if (newData) {
      conversationData.messages = newData.messages.map(
        (msg: StoredMessage): Message => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          step: msg.step || 2,
          stage: msg.stage,
          timestamp: new Date(msg.timestamp),
        }),
      )
      conversationData.conversationCount = newData.conversationCount || 0
      conversationData.currentStage = newData.currentStage || 2
      conversationData.stageCompletionStatus = newData.stageCompletionStatus || [true, false]
    }

    // 4. 检查是否需要添加 Stage2 的系统指令
    const stage2Messages = conversationData.messages.filter((m) => m.stage === 2)
    if (stage2Messages.length === 0) {
      addSystemInstruction(2)
    }

    console.log('✅ 已推进到 Stage2（控制设计阶段）')
  }, 1000)
}

// ==================== 类型定义 ====================
interface Message {
  id: string
  type: 'ai' | 'user' | 'system'
  content: string
  timestamp: Date
  stage?: number
  step?: number
}

interface StoredMessage {
  id: string
  type: 'ai' | 'user' | 'system'
  content: string
  timestamp: string
  step?: number
  stage?: number
}

interface Step2Data {
  conversationCount?: number
  stageCompletionStatus?: boolean[]
  messages?: StoredMessage[]
  currentStage?: number
  // 🔥 新增快照字段
  finalAnswerSnapshot?: string
  finalAnswerConfirmed?: boolean
  lockedAt?: string // 🔥 新增
}

interface ConversationData {
  sessionId: string
  step: number
  stage: number
  userInput: string
  aiResponse: string
  conversationCount: number
  timestamp: Date
  context: string
}

interface APIResponse {
  response: string
  metadata?: {
    step?: number
    stage?: number
    guidanceMode?: string
    suggestsCompletion?: boolean
  }
  fallbackResponse?: string
}

// ==================== 基础状态 ====================
const router = useRouter()

// 🔥 从存储恢复 Step2 数据（完整版本）
const restoreStep2Data = () => {
  const stepData = simpleStorage.getStep2Data()

  if (stepData) {
    console.log('📂 Step2: 从存储恢复数据', {
      sessionId: stepData.sessionId,
      currentStage: stepData.currentStage,
      conversationCount: stepData.conversationCount,
      messagesCount: stepData.messages.length,
    })

    return {
      messages: stepData.messages.map(
        (msg: StoredMessage): Message => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          stage: msg.stage,
          step: msg.step || 2,
        }),
      ),
      conversationCount: stepData.conversationCount,
      currentStage: stepData.currentStage,
      stageCompletionStatus: stepData.stageCompletionStatus,
      sessionId: stepData.sessionId || simpleStorage.getSessionId(), // 🔥 防御性获取
      initialInstructions: stepData.initialInstructions || {
        1: '根据监测数据，你认为影响教室舒适度和能耗的关键因素有哪些？',
        2: '基于这些关键因素，你会设计什么样的自动控制规则？',
      },
    }
  }

  // 没有历史数据，创建新的
  console.log('✨ Step2: 初始化新数据')
  const sessionId = simpleStorage.getSessionId()

  if (!sessionId) {
    console.error('⚠️ Step2: sessionId 获取失败，创建新 session')
    simpleStorage.initSession()
  }

  return {
    messages: [] as Message[],
    conversationCount: 0,
    currentStage: 1,
    stageCompletionStatus: [false, false],
    sessionId: simpleStorage.getSessionId(),
    initialInstructions: {
      1: '根据监测数据，你认为影响教室舒适度和能耗的关键因素有哪些？',
      2: '基于这些关键因素，你会设计什么样的自动控制规则？',
    },
  }
}

// 🔥 使用恢复函数初始化（关键修改！）
const conversationData = reactive(restoreStep2Data())

// 🔥 最终验证 sessionId
if (!conversationData.sessionId) {
  console.error('❌ Step2: conversationData.sessionId 为空！强制获取...')
  conversationData.sessionId = simpleStorage.getSessionId()

  if (!conversationData.sessionId) {
    console.error('❌ Step2: 仍然无法获取 sessionId，创建新 session')
    conversationData.sessionId = simpleStorage.initSession()
  }
}

console.log('✅ Step2 初始化完成，sessionId:', conversationData.sessionId)
console.log('📊 Step2 完整初始化数据:', {
  sessionId: conversationData.sessionId,
  currentStage: conversationData.currentStage,
  conversationCount: conversationData.conversationCount,
  messagesCount: conversationData.messages.length,
  stageCompletionStatus: conversationData.stageCompletionStatus,
})

// UI状态
const showInfoCard = ref(false)
const showStageProgress = ref(false)
const showAnswerArea = ref(false)
const showConversationWarning = ref(false)
const showConfirmDialog = ref(false)
const isGenerating = ref(false)
const loadingStep = ref(0)

// 输入状态
const userAnswer = ref('')
const chatScrollArea = ref<HTMLElement | null>(null)

// 阶段完成状态
const stage1Completed = ref(false)
const stage2Completed = ref(false)

// 帮助系统状态
const showHelpDialog = ref(false)
const helpMode = ref<'refine' | 'example' | 'custom' | null>(null)
const customQuestion = ref('')
const isRequestingHelp = ref(false)
const showPrompt = ref(false) // 已有
// 新增：确保只出现一次
const promptShown = ref(false)

// 🔥 新增：快照相关状态
const finalAnswerSnapshot = ref('')
const finalAnswerConfirmed = ref(false)
const isStepLocked = ref(false) // 🔥 新增：步骤锁定状态
const remainingCycles = computed(() => {
  // 🔥 新增：计算剩余帮助次数
  return helpSystem.maxCycles - helpSystem.totalCycles
})
const editableFinalAnswer = ref('')
const stage1Snapshot = ref('')
const stage2Snapshot = ref('')

// 🔥 新增：临时保存相关
const tempSaveStatus = ref('')
const lastTempSaveTime = ref('')
const isSaved = ref(false)
const originalContent = ref('')

// 🔥 新增：计算属性 - 内容是否被修改
const isContentModified = computed(() => {
  return editableFinalAnswer.value !== originalContent.value
})

// 🔥 新增：帮助系统状态管理
const helpSystem = reactive({
  totalCycles: 0,
  maxCycles: 4,
  currentCycleUsed: {
    refine: false,
    example: false,
    custom: false,
  },
  isInCycle: false,
})

// 🔥 新增：限制提示弹窗状态
const showHelpLimitDialog = ref(false)
const showCycleLimitDialog = ref(false)

// 计算属性：帮助功能是否可用
const canUseHelp = computed(() => {
  return helpSystem.totalCycles < helpSystem.maxCycles
})

// 计算属性：当前周期剩余可用模式
const availableHelpModes = computed(() => {
  return {
    refine: !helpSystem.currentCycleUsed.refine,
    example: !helpSystem.currentCycleUsed.example,
    custom: !helpSystem.currentCycleUsed.custom,
  }
})

// 计算属性：当前周期是否还有可用模式
const hasAvailableModesInCycle = computed(() => {
  return Object.values(availableHelpModes.value).some((available) => available)
})

// 帮助按钮 title 计算属性
const getHelpButtonTitle = computed(() => {
  if (!canUseHelp.value) {
    return '已达到帮助次数上限'
  }
  if (helpSystem.isInCycle && !hasAvailableModesInCycle.value) {
    return '当前周期的帮助已全部使用，请提交答案后再使用'
  }
  return '点击获取智能帮助'
})

// 关闭限制提示弹窗的函数
const closeHelpLimitDialog = () => {
  showHelpLimitDialog.value = false
}

const closeCycleLimitDialog = () => {
  showCycleLimitDialog.value = false
}

// ==================== 常量配置 ====================
const MAX_CONVERSATIONS = 8

const stageConfig = [
  {
    label: '因素识别',
    title: '阶段一：因素识别',
    description: '识别影响教室通风节能的关键因素',
    placeholder: '请输入你识别到的关键因素...',
    helpText: '需要帮助',
    submitText: '提交回答',
  },
  {
    label: '控制设计',
    title: '阶段二：控制设计',
    description: '设计自动控制的决策逻辑',
    placeholder: '请输入你的控制设计方案...',
    helpText: '需要帮助',
    submitText: '提交回答',
  },
]

const constraints = {
  roomSize: '60㎡',
  capacity: '40人',
  season: '夏季',
  outdoorTemp: '22-35℃',
  acPower: '3.2kW',
}

// ==================== 计算属性 ====================
const currentStage = computed(() => conversationData.currentStage)
const conversationCount = computed(() => conversationData.conversationCount)
const stageCompletionStatus = computed(() => conversationData.stageCompletionStatus)
const messages = computed(() => conversationData.messages)
const canSubmit = computed(() => userAnswer.value.trim().length > 0)
const isConversationLimitReached = computed(() => conversationCount.value >= MAX_CONVERSATIONS)

const currentStagePlaceholder = computed(() => {
  if (isStepLocked.value) {
    return '此步骤已锁定，无法编辑'
  }
  if (isConversationLimitReached.value) {
    return '已达到最大对话轮次，请点击"继续下一步"进入下一阶段'
  }
  return stageConfig[currentStage.value - 1]?.placeholder || ''
})

const currentSubmitButtonText = computed(() => {
  return stageConfig[currentStage.value - 1]?.submitText || '提交回答'
})

const allStagesCompleted = computed(() => canProceedToNextStep.value)

// ==================== 🔥 新增：排序相关函数 ====================

// 进入排序步骤
const goToRankingStep = () => {
  // 收集已选择的因素
  const selected = Object.values(factorOptions)
    .flat()
    .filter((f) => f.selected)

  // 初始化排序列表（保持选择顺序）
  rankedFactors.value = [...selected]

  selectionStep.value = 'rank'

  // 埋点
  trackStep2Event(
    'step2_stage1_proceed_to_ranking',
    conversationData.sessionId,
    1,
    conversationCount.value,
    {
      selectedCount: selected.length,
      factorIds: selected.map((f) => f.id).join(','),
    },
  )
}

// 返回选择步骤
const backToSelection = () => {
  selectionStep.value = 'select'

  trackStep2Event(
    'step2_stage1_back_to_selection',
    conversationData.sessionId,
    1,
    conversationCount.value,
    {},
  )
}

// 向上移动
const moveUp = (index: number) => {
  if (index === 0) return

  const temp = rankedFactors.value[index]
  rankedFactors.value[index] = rankedFactors.value[index - 1]
  rankedFactors.value[index - 1] = temp
}

// 向下移动
const moveDown = (index: number) => {
  if (index === rankedFactors.value.length - 1) return

  const temp = rankedFactors.value[index]
  rankedFactors.value[index] = rankedFactors.value[index + 1]
  rankedFactors.value[index + 1] = temp
}

// ==================== 🔥 快照生成函数 ====================

// ===== 1. generateStage1Snapshot =====
const generateStage1Snapshot = (): string => {
  const helpRequestPatterns = [
    /^💬\s*帮我完善/,
    /^💡\s*能给我看看例子/,
    /^✍️\s*我想问/,
    /帮我完善内容/,
    /看看例子/,
    /我想问：/,
  ]

  const stage1UserMessages = conversationData.messages.filter((m) => {
    if (m.stage !== 1 || m.type !== 'user') return false
    const isHelpRequest = helpRequestPatterns.some((pattern) => pattern.test(m.content))
    return !isHelpRequest
  })

  if (stage1UserMessages.length === 0) {
    return '【阶段一：因素识别】\n（尚未完成）'
  }

  let content = '【阶段一：因素识别】\n\n'

  stage1UserMessages.forEach((msg, index) => {
    content += `回答${index + 1}：\n${msg.content}\n\n`
  })

  return content.trim()
}

// ===== 2. generateStage2Snapshot =====
const generateStage2Snapshot = (): string => {
  const helpRequestPatterns = [
    /^💬\s*帮我完善/,
    /^💡\s*能给我看看例子/,
    /^✍️\s*我想问/,
    /帮我完善内容/,
    /看看例子/,
    /我想问：/,
  ]

  const stage2UserMessages = conversationData.messages.filter((m) => {
    if (m.stage !== 2 || m.type !== 'user') return false
    const isHelpRequest = helpRequestPatterns.some((pattern) => pattern.test(m.content))
    return !isHelpRequest
  })

  if (stage2UserMessages.length === 0) {
    return '【阶段二：控制设计】\n（尚未完成）'
  }

  const lastValidMessage = [...stage2UserMessages].reverse().find((msg) => {
    return msg.content.trim().length > 20
  })

  if (lastValidMessage) {
    return `【阶段二：控制设计】\n\n我的最终方案：\n${lastValidMessage.content}`
  }

  return '【阶段二：控制设计】\n（尚未提交有效内容）'
}

// ===== 3. generateCompleteSnapshot =====
const generateCompleteSnapshot = (): string => {
  stage1Snapshot.value = generateStage1Snapshot()
  stage2Snapshot.value = generateStage2Snapshot()

  return `${stage1Snapshot.value}\n\n════════════════════════════════\n\n${stage2Snapshot.value}`
}

// ==================== 🔥 临时保存功能 ====================

//在弹窗中临时保存（不确认下一步）

const handleTempSaveInDialog = async () => {
  simpleStorage.setItem('step2_temp_snapshot', {
    content: editableFinalAnswer.value,
    stage1: stage1Snapshot.value,
    stage2: stage2Snapshot.value,
    savedAt: new Date().toISOString(),
  })

  // 🔥 埋点 - 临时保存
  await trackStep2Event(
    'step2_temp_save',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      contentLength: editableFinalAnswer.value.length,
      stage1Length: stage1Snapshot.value.length,
      stage2Length: stage2Snapshot.value.length,
      wasModified: editableFinalAnswer.value !== originalContent.value,
      saveTimestamp: new Date().toISOString(),
    },
  )

  isSaved.value = true
  originalContent.value = editableFinalAnswer.value

  tempSaveStatus.value = '✅ 保存成功'
  lastTempSaveTime.value = new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  setTimeout(() => {
    tempSaveStatus.value = ''
  }, 3000)

  console.log('💾 Step2 - 临时保存成功，内容长度:', editableFinalAnswer.value.length)
}

// ==================== 弹窗控制 ====================

/**
 * 打开确认弹窗时，检查是否有临时保存的内容
 */
const handleNextStep = async () => {
  // 🔥 如果已经锁定，直接跳转到下一步
  if (isStepLocked.value) {
    router.push('/experiment/step3')
    return
  }

  // 🔥 埋点 - 打开确认弹窗
  await trackStep2Event(
    'step2_confirm_dialog_open',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      hasStage1Complete: stage1Completed.value,
      hasStage2Complete: stage2Completed.value,
      totalConversations: conversationData.conversationCount,
    },
  )

  const tempSaved = simpleStorage.getItem<{
    content: string
    savedAt: string
  }>('step2_temp_snapshot')

  if (tempSaved?.content) {
    editableFinalAnswer.value = tempSaved.content
    lastTempSaveTime.value = new Date(tempSaved.savedAt).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    console.log('📂 Step2 - 加载临时保存的内容')
  } else {
    finalAnswerSnapshot.value = generateCompleteSnapshot()
    editableFinalAnswer.value = finalAnswerSnapshot.value
  }

  originalContent.value = editableFinalAnswer.value
  isSaved.value = false

  showConfirmDialog.value = true
  console.log('📝 Step2 - 打开确认弹窗')
}

const closeConfirmDialog = async () => {
  // 🔥 埋点 - 关闭确认弹窗
  await trackStep2Event(
    'step2_confirm_dialog_cancel',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      hadEdits: editableFinalAnswer.value !== originalContent.value,
      contentLength: editableFinalAnswer.value.length,
    },
  )

  showConfirmDialog.value = false
}

// 🔥 新增：保存最终快照到数据库的函数
const saveFinalSnapshotToDB = async (snapshotData: {
  sessionId: string
  step: number
  stage: number
  userInput: string
  aiResponse: string
  conversationCount: number
  timestamp: Date
  context: string
  isFinalSnapshot: boolean
  finalAnswerContent: string
}): Promise<void> => {
  try {
    const experimentId = localStorage.getItem('experimentId')
    const studentName = localStorage.getItem('studentName')

    await fetch('/api/conversations/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': experimentId || '',
      },
      body: JSON.stringify({
        ...snapshotData,
        experimentId,
        studentName,
      }),
    })

    console.log('✅ Step2 - 最终快照已保存到数据库')
  } catch (error) {
    console.error('❌ Step2 - 保存最终快照失败:', error)
  }
}

// 🔥 确认进入下一步（添加数据库快照保存）
const confirmNextStep = async () => {
  // 使用编辑后的内容作为最终快照
  finalAnswerSnapshot.value = editableFinalAnswer.value.trim()
  finalAnswerConfirmed.value = true
  showConfirmDialog.value = false

  // 🔥 内容验证
  if (!finalAnswerSnapshot.value || finalAnswerSnapshot.value.length < 10) {
    alert('请至少填写一些内容后再继续')
    finalAnswerConfirmed.value = false
    showConfirmDialog.value = true
    return
  }

  // 🔥 防御性编程：确保sessionId存在
  const currentSessionId = conversationData.sessionId || simpleStorage.getSessionId()

  if (!currentSessionId) {
    console.error('❌ Step2 - sessionId 为空，无法保存确认数据！')
    return
  }

  // 1. 保存到 localStorage（Step6 会读取）
  simpleStorage.setItem('step2_final_answer_confirmed', {
    finalAnswerSnapshot: finalAnswerSnapshot.value,
    finalAnswerConfirmed: true,
    sessionId: conversationData.sessionId,
    savedAt: new Date().toISOString(),
  })

  // 同时更新另一个存储位置
  simpleStorage.setItem('step2_final_answer', {
    content: finalAnswerSnapshot.value,
    stage1: stage1Snapshot.value,
    stage2: stage2Snapshot.value,
    sessionId: conversationData.sessionId,
    confirmedAt: new Date().toISOString(),
  })

  // 2. 🔥 新增：保存带 isFinalSnapshot 标志的记录到数据库
  await saveFinalSnapshotToDB({
    sessionId: conversationData.sessionId,
    step: 2,
    stage: currentStage.value,
    userInput: '[FINAL_SNAPSHOT]',
    aiResponse: '',
    conversationCount: conversationData.conversationCount,
    timestamp: new Date(),
    context: 'step2_final_confirmation',
    isFinalSnapshot: true, // 🔥 关键字段
    finalAnswerContent: finalAnswerSnapshot.value, // 🔥 完整内容
  })

  // 3. 🔥 埋点 - 点击继续下一步
  await trackStep2Event(
    'step2_next_step_click',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      completedStages: conversationData.stageCompletionStatus.filter((s) => s).length,
      stage1Complete: stage1Completed.value,
      stage2Complete: stage2Completed.value,
      finalAnswerLength: finalAnswerSnapshot.value.length,
      wasEdited: editableFinalAnswer.value !== generateCompleteSnapshot(),
    },
  )

  // 4. 清除临时保存
  simpleStorage.removeItem('step2_temp_snapshot')

  // 5. 保存到 storage（包含快照）
  saveToStorage()

  // 🔥 6. 锁定当前步骤（修复：使用 getStepData 而不是 getStep2Data）
  isStepLocked.value = true
  const updatedStepData = simpleStorage.getStepData(2)
  if (updatedStepData) {
    const step2ExtendedData = updatedStepData as typeof updatedStepData & {
      lockedAt?: string
    }
    step2ExtendedData.lockedAt = new Date().toISOString()
    simpleStorage.saveStepData(2, updatedStepData)

    console.log('🔒 Step2 - 步骤已锁定，lockedAt:', step2ExtendedData.lockedAt)
  }

  // 7. 跳转到下一步
  router.push('/experiment/step3')
}

// ==================== 对话提交 ====================

const submitAnswer = async () => {
  if (!canSubmit.value || isGenerating.value || isConversationLimitReached.value) {
    console.log('❌ 无法提交：', {
      canSubmit: canSubmit.value,
      isGenerating: isGenerating.value,
      limitReached: isConversationLimitReached.value,
    })
    return
  }

  const currentAnswer = userAnswer.value.trim()
  const currentStageNum = conversationData.currentStage

  // 🔥 埋点 - 提交答案
  await trackStep2Event(
    'step2_answer_submit',
    conversationData.sessionId,
    currentStageNum,
    conversationData.conversationCount + 1,
    {
      answerLength: currentAnswer.length,
      currentStage: currentStageNum,
    },
  )

  addMessage('user', currentAnswer, currentStageNum)
  userAnswer.value = ''

  // 🔥 重置帮助周期
  if (helpSystem.isInCycle) {
    console.log(`🔄 Step2 - 重置帮助周期，已使用周期数: ${helpSystem.totalCycles}`)
    helpSystem.isInCycle = false
    helpSystem.currentCycleUsed = {
      refine: false,
      example: false,
      custom: false,
    }
    saveHelpSystemState()
  }

  conversationData.conversationCount++
  simpleStorage.updateConversationCount(2, conversationData.conversationCount)

  isGenerating.value = true
  loadingStep.value = 0

  const stepInterval = setInterval(() => {
    if (loadingStep.value < 3) {
      loadingStep.value++
    }
  }, 3000)

  try {
    const result: APIResponse = await callAIAPI(currentAnswer, currentStageNum)
    clearInterval(stepInterval)

    addMessage('ai', result.response, currentStageNum)

    const conversationHistory: Message[] = conversationData.messages
    const frontendShouldAdvance = shouldAdvanceStage(
      currentStageNum,
      conversationHistory,
      result.response,
    )
    const backendSuggestsCompletion = result.metadata?.suggestsCompletion || false

    const shouldAdvance = frontendShouldAdvance || backendSuggestsCompletion

    console.log(`阶段${currentStageNum}推进判断:`, {
      当前阶段对话数: conversationHistory.filter(
        (m) => m.type === 'user' && m.stage === currentStageNum,
      ).length,
      前端判断: frontendShouldAdvance,
      后端建议: backendSuggestsCompletion,
      最终决策: shouldAdvance,
    })

    if (shouldAdvance) {
      const stageCompleted = await checkStageCompletion(
        currentStageNum,
        currentAnswer,
        result.response,
      )

      if (stageCompleted && currentStageNum === 1 && !isConversationLimitReached.value) {
        setTimeout(() => {
          simpleStorage.updateCurrentStage(2, 2)
          const newData = simpleStorage.getStep2Data() as Step2Data | null
          if (newData) {
            conversationData.messages = newData.messages!.map(
              (msg: StoredMessage): Message => ({
                id: msg.id,
                type: msg.type,
                content: msg.content,
                step: msg.step || 2,
                stage: msg.stage,
                timestamp: new Date(msg.timestamp),
              }),
            )
            conversationData.conversationCount = newData.conversationCount || 0
            conversationData.currentStage = newData.currentStage || 2
            conversationData.stageCompletionStatus = newData.stageCompletionStatus || [false, false]
          }

          const stage2Messages = conversationData.messages.filter((m) => m.stage === 2)
          if (stage2Messages.length === 0) {
            addSystemInstruction(2)
          }

          console.log(`已推进到阶段2`)
        }, 1000)
      } else if (stageCompleted && currentStageNum === 2) {
        console.log('🎉 Step2-Stage2 完成，显示继续下一步按钮')
      }
    }
  } catch (error) {
    clearInterval(stepInterval)
    console.error('AI API 调用失败:', error)
    addMessage('ai', '抱歉，系统暂时无法处理您的回答，请稍后重试。', currentStageNum)
  } finally {
    isGenerating.value = false
    loadingStep.value = 0
    saveToStorage()
  }
}

// ==================== 帮助系统 ====================
// 🔥 保存帮助系统状态到 localStorage
const saveHelpSystemState = () => {
  const stepData = simpleStorage.getStep2Data() as Step2Data | null
  if (stepData) {
    ;(stepData as Step2Data & { helpSystem?: typeof helpSystem }).helpSystem = {
      totalCycles: helpSystem.totalCycles,
      maxCycles: helpSystem.maxCycles,
      currentCycleUsed: { ...helpSystem.currentCycleUsed },
      isInCycle: helpSystem.isInCycle,
    }
    simpleStorage.saveStepData(2, stepData)
    console.log('💾 Step2 - 帮助系统状态已保存')
  }
}

const requestHelp = () => {
  if (isGenerating.value || isConversationLimitReached.value) return

  // 检查是否还能使用帮助功能
  if (!canUseHelp.value) {
    showHelpLimitDialog.value = true
    return
  }

  // ✅ 修改：不在这里开启周期，只是检查
  // 如果已经在周期中，检查当前周期是否还有可用模式
  if (helpSystem.isInCycle && !hasAvailableModesInCycle.value) {
    showCycleLimitDialog.value = true
    return
  }

  // 🔥 埋点 - 点击帮助按钮（但还没使用）
  trackStep2Event(
    'step2_help_button_click',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      currentInputLength: userAnswer.value.length,
      hasInput: userAnswer.value.length > 0,
      helpCycle: helpSystem.totalCycles, // 当前已使用的周期数
      availableModes: Object.entries(availableHelpModes.value)
        .filter(([, available]) => available)
        .map(([mode]) => mode)
        .join(','),
    },
  )

  // ✅ 只是打开弹窗
  showHelpDialog.value = true
}

const closeHelpDialog = () => {
  showHelpDialog.value = false
  helpMode.value = null
  customQuestion.value = ''
}

const selectHelpMode = (mode: 'refine' | 'example' | 'custom') => {
  // 🔥 检查该模式是否可用
  if (!availableHelpModes.value[mode]) {
    console.log(`❌ Step2 - 模式 ${mode} 在当前周期已使用`)
    return
  }

  helpMode.value = mode
  if (mode !== 'custom') {
    executeHelp(mode)
  }
}

const submitCustomQuestion = () => {
  if (!customQuestion.value.trim()) return
  executeHelp('custom', customQuestion.value)
}

const executeHelp = async (mode: 'refine' | 'example' | 'custom', customQuestionText?: string) => {
  if (isRequestingHelp.value) return

  isRequestingHelp.value = true
  showHelpDialog.value = false

  // ✅ 关键修改：在这里开启新周期并减少次数
  // 只有真正使用了某个具体求助方式时才会减少次数
  if (!helpSystem.isInCycle) {
    helpSystem.totalCycles++ // ✅ 在这里才-1
    helpSystem.isInCycle = true
    console.log(`🆕 Step2 - 开启第 ${helpSystem.totalCycles} 个帮助周期`)
  }

  // 🔥 标记该模式在当前周期已使用
  helpSystem.currentCycleUsed[mode] = true
  saveHelpSystemState()

  // 🔥 根据帮助模式生成可读的用户消息和上下文类型
  let userDisplayMessage = ''
  let helpRequestContent = ''
  let helpContextType = ''

  switch (mode) {
    case 'refine':
      userDisplayMessage = `💬 帮我完善内容：${userAnswer.value || '（当前输入内容）'}`
      helpRequestContent = '[REFINE_CONTENT]' + (userAnswer.value || '当前输入内容需要完善')
      helpContextType = 'refine_content'
      break
    case 'example':
      userDisplayMessage = '💡 能给我看看例子吗？'
      helpRequestContent = '[REQUEST_EXAMPLE]' + '需要一个参考示例'
      helpContextType = 'request_example'
      break
    case 'custom':
      userDisplayMessage = `✍️ 我想问：${customQuestionText || '需要具体指导'}`
      helpRequestContent = '[CUSTOM_QUESTION]' + (customQuestionText || '需要具体指导')
      helpContextType = 'custom_question'
      break
  }

  // 🔥 先显示用户的帮助请求消息
  addMessage('user', userDisplayMessage, conversationData.currentStage)

  // 🔥 增加对话计数
  conversationData.conversationCount++
  simpleStorage.updateConversationCount(2, conversationData.conversationCount)

  // 🔥 埋点 - 请求帮助（补充完整信息）
  await trackStep2Event(
    'step2_help_request',
    conversationData.sessionId,
    currentStage.value,
    conversationData.conversationCount,
    {
      helpMode: mode,
      helpCycle: helpSystem.totalCycles,
      cycleUsedModes: Object.entries(helpSystem.currentCycleUsed)
        .filter(([_, used]) => used)
        .map(([m]) => m)
        .join(','),
      remainingCycles: helpSystem.maxCycles - helpSystem.totalCycles,
      hasUserInput: userAnswer.value.length > 0,
      customQuestion: mode === 'custom' ? customQuestionText : undefined,
    },
  )

  // 🔥 显示加载状态
  isGenerating.value = true
  loadingStep.value = 0

  const stepInterval = setInterval(() => {
    if (loadingStep.value < 3) {
      loadingStep.value++
    }
  }, 3000)

  try {
    const helpResponse = await getSmartHelp(mode, customQuestionText)

    clearInterval(stepInterval)

    // 🔥 添加AI回复
    addMessage('ai', helpResponse, conversationData.currentStage)

    // 🔥 保存到数据库（补充 event_data）
    await saveConversationToDB({
      sessionId: conversationData.sessionId,
      step: 2,
      stage: conversationData.currentStage,
      userInput: userDisplayMessage,
      aiResponse: helpResponse,
      conversationCount: conversationData.conversationCount,
      timestamp: new Date(),
      context: `step2_stage${conversationData.currentStage}_${helpContextType}`,
    })

    saveToStorage()
  } catch (error) {
    clearInterval(stepInterval)
    console.error('❌ 智能帮助请求失败:', error)

    // 🔥 错误回退消息
    const fallbackTexts: Record<string, string> = {
      refine: '试着从多个角度分析影响因素，比如环境参数、人为因素、设备状态等。',
      example: '比如分析影响因素时：温度、湿度、CO2浓度、人员密度和窗户朝向都会改变通风策略。',
      custom: '根据你的问题，建议从教室环境和节能目标的角度来思考。',
    }

    addMessage('ai', fallbackTexts[mode] || fallbackTexts.custom, conversationData.currentStage)
    saveToStorage()
  } finally {
    isRequestingHelp.value = false
    isGenerating.value = false
    loadingStep.value = 0
    helpMode.value = null
    customQuestion.value = ''
  }
}

// ==================== API调用 ====================

async function callAIAPI(
  answer: string,
  stage: number,
  rankedFactorsData?: RankedFactorsData,
): Promise<{
  response: string
  metadata?: {
    step?: number
    stage?: number
    guidanceMode?: string
    suggestsCompletion?: boolean
  }
  fallbackResponse?: string
}> {
  try {
    const currentStageUserAnswers = conversationData.messages
      .filter((m) => m.type === 'user' && m.stage === stage)
      .map((m) => m.content)

    const recentQuestions = getRecentAIQuestions(conversationData.messages)

    const conversationHistory = conversationData.messages
      .filter((msg: Message) => msg.step === 2 && msg.stage === stage)
      .map((msg: Message) => ({
        type: msg.type,
        content: msg.content,
        step: msg.step || 2, // 添加默认值
        stage: msg.stage,
        timestamp: msg.timestamp,
      }))

    console.log('📤 Step2 - 发送给后端的对话历史:', {
      count: conversationHistory.length,
      stage,
      currentStageOnly: true,
      history: conversationHistory,
      userAnswer: answer.substring(0, 50) + (answer.length > 50 ? '...' : ''),
    })

    const payload = {
      userAnswer: answer,
      context: {
        ...constraints,
        recentQuestions,
        ventilationFocus: true,
        currentStage: stage,
        stageProgress: {
          currentStageAnswers: currentStageUserAnswers,
          totalAnswersInStage: currentStageUserAnswers.length + 1,
        },
      },
      step: 2,
      stage,
      conversationCount: conversationData.conversationCount,
      sessionId: conversationData.sessionId,
      conversationHistory,
      followUpContext: {
        currentStage: stage,
        conversationCount: conversationData.conversationCount,
        previousUserAnswers: currentStageUserAnswers,
        needsContinuity: true,
      },
    }
    if (stage === 1 && rankedFactorsData) {
      ;(payload as any).rankedFactorsData = rankedFactorsData
    }

    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': localStorage.getItem('experimentId') || '',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error(`API Error: ${res.statusText}`)
    const data = await res.json()

    console.log('📥 Step2 - 收到后端响应:', {
      response: data.response?.substring(0, 100) + (data.response?.length > 100 ? '...' : ''),
      metadata: data.metadata,
    })

    await saveConversationToDB({
      sessionId: conversationData.sessionId,
      step: 2,
      stage,
      userInput: answer,
      aiResponse: data.response || data.fallbackResponse,
      conversationCount: conversationData.conversationCount,
      timestamp: new Date(),
      context: `stage_${stage}_enhanced_continuity`,
    })

    return {
      response:
        data.response || data.fallbackResponse || '抱歉，系统暂时无法处理您的回答，请稍后重试。',
      metadata: data.metadata,
      fallbackResponse: data.fallbackResponse,
    }
  } catch (error) {
    console.error('❌ Step2 - AI API 调用失败:', error)
    return {
      response: '抱歉，系统暂时无法处理您的回答，请稍后重试。',
      metadata: { guidanceMode: 'fallback' },
    }
  }
}

async function getSmartHelp(
  mode: 'refine' | 'example' | 'custom',
  customQuestionText?: string,
): Promise<string> {
  try {
    // 🔥 根据模式添加相应的前缀标记
    const modePrefix = {
      refine: '[REFINE_CONTENT]',
      example: '[REQUEST_EXAMPLE]',
      custom: '[CUSTOM_QUESTION]',
    }

    const actualInput = customQuestionText || userAnswer.value || ''
    const userAnswerWithPrefix = `${modePrefix[mode]}${actualInput}`

    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': localStorage.getItem('experimentId') || '',
      },
      body: JSON.stringify({
        userAnswer: userAnswerWithPrefix, // 🔥 添加前缀
        step: 2,
        stage: conversationData.currentStage,
        context: {
          ...constraints,
          helpMode: mode,
          currentInput: actualInput,
          helpType:
            mode === 'refine'
              ? 'refine_content'
              : mode === 'example'
                ? 'request_example'
                : 'custom_question',
          needsGuidance: true,
          previousUserAnswers: conversationData.messages
            .filter((m) => m.type === 'user' && m.stage === conversationData.currentStage)
            .map((m) => m.content),
          needsContinuity: true,
        },
        // 🔥 添加对话历史
        conversationHistory: conversationData.messages
          .filter((msg: Message) => msg.step === 2 && msg.stage === conversationData.currentStage)
          .map((msg: Message) => ({
            type: msg.type,
            content: msg.content,
            step: 2,
            stage: conversationData.currentStage,
            timestamp: msg.timestamp,
          })),
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()

    console.log('📥 Step2 智能帮助 - 收到响应:', {
      response: data.response,
      isSmartHint: data.metadata?.isSmartHint,
      helpMode: mode,
    })

    return data.response || '根据你目前的思考，试着从另一个角度来看这个问题。'
  } catch (error) {
    console.error('❌ Step2 - 智能帮助API调用失败:', error)
    throw error
  }
}
// ==================== 🔥 新增：过滤帮助请求，统计真实用户交互 ====================

/**
 * 判断消息是否为帮助请求
 */
const isHelpRequest = (message: Message): boolean => {
  const helpPatterns = [
    /^\[REFINE_CONTENT\]/,
    /^\[REQUEST_EXAMPLE\]/,
    /^\[CUSTOM_QUESTION\]/,
    /^\[HELP_REQUEST\]/,
    /^\[SMART_HELP_REQUEST\]/,
    /^💬\s*帮我完善/,
    /^💡\s*能给我看看例子/,
    /^✍️\s*我想问/,
  ]

  return helpPatterns.some((pattern) => pattern.test(message.content))
}

/**
 * 统计真实用户交互次数（排除帮助请求）
 * @param messages 消息列表
 * @param stage 可选，指定阶段
 * @returns 真实交互次数
 */
const getRealUserInteractionCount = (messages: Message[], stage?: number): number => {
  const filteredMessages = messages.filter((m) => {
    if (m.type !== 'user') return false
    if (stage && m.stage !== stage) return false
    return !isHelpRequest(m)
  })

  console.log(`📊 真实用户交互统计 (Stage${stage || 'All'}): ${filteredMessages.length}次`)
  return filteredMessages.length
}

// ==================== 辅助函数 ====================

// ==================== 🔥 完全重写：Stage推进判断逻辑 ====================

/**
 * 判断是否应该推进到下一阶段
 * 新规则：
 * - Stage1: 累计3个因素 OR 第4轮自动跳转（至少1次真实回答）
 * - Stage2: 真实交互2轮自动完成
 */
const shouldAdvanceStage = (
  stage: number,
  conversationHistory: Message[],
  latestAIResponse: string,
): boolean => {
  // 🔥 Stage1：不再需要判断（已通过 confirmFactorSelection 直接推进）
  if (stage === 1) {
    console.log('⚠️ Stage1 推进逻辑已移至 confirmFactorSelection 函数')
    return false // 始终返回 false，因为推进由 completeStage1AndAdvanceToStage2 完成
  }

  // 🔥 Stage2：保持原有判断逻辑
  if (stage === 2) {
    const realUserAnswers = conversationHistory.filter(
      (m) => m.type === 'user' && m.stage === stage && !isHelpRequest(m),
    )
    const realInteractionCount = realUserAnswers.length

    // 规则1: 真实交互2轮自动完成
    if (realInteractionCount >= 2) {
      console.log(`✅ Stage2 完成：真实交互${realInteractionCount}轮，达到2轮门槛`)
      return true
    }

    // 规则2: 第1轮就包含完整控制逻辑
    const userText = realUserAnswers.map((m) => m.content.toLowerCase()).join(' ')
    const hasTemperatureThreshold = /(\d+度|26|24|25|28|30)/.test(userText)
    const hasAction = /(开窗|关窗|空调|风扇|排风|通风)/.test(userText)
    const hasCondition = /(当|如果|若|超过|高于|低于|大于|小于)/.test(userText)

    if (realInteractionCount >= 1 && hasAction && (hasCondition || hasTemperatureThreshold)) {
      console.log('✅ Stage2 完成：第1轮已包含完整控制逻辑')
      return true
    }

    console.log(`⏳ Stage2 进行中：第${realInteractionCount}轮，等待第2轮或完整内容`)
    return false
  }

  return false
}

// ==================== 🔥 新增：整体Step2完成判断 ====================

/**
 * 判断是否可以进入下一步
 * 规则：
 * 1. 两个阶段都完成 OR
 * 2. 累计真实交互达到6次
 */
const canProceedToNextStep = computed(() => {
  // 规则1: 两个阶段都完成
  if (stage1Completed.value && stage2Completed.value) {
    console.log('✅ 可以进入下一步：两个阶段都已完成')
    return true
  }

  // 规则2: 累计真实交互达到6次（兜底机制）
  const totalRealInteractions = getRealUserInteractionCount(conversationData.messages)
  if (totalRealInteractions >= 6) {
    console.log(`✅ 可以进入下一步：累计真实交互${totalRealInteractions}次，达到6次门槛`)
    return true
  }

  console.log(
    `⏳ 暂不能进入下一步：Stage1=${stage1Completed.value}, Stage2=${stage2Completed.value}, 真实交互=${totalRealInteractions}/6`,
  )
  return false
})

const checkStageCompletion = async (
  stage: number,
  userAnswer: string,
  aiResponse: string,
): Promise<boolean> => {
  const shouldComplete = shouldAdvanceStage(stage, conversationData.messages, aiResponse)

  if (shouldComplete) {
    if (stage === 1) {
      stage1Completed.value = true
      simpleStorage.updateStageStatus(2, 1, true)
      conversationData.stageCompletionStatus[0] = true

      await trackStep2Event(
        'step2_stage_complete',
        conversationData.sessionId,
        stage,
        conversationData.conversationCount,
        {
          stageNumber: 1,
          totalInteractions: conversationData.messages.filter((m) => m.stage === 1).length,
        },
      )
    } else if (stage === 2) {
      stage2Completed.value = true
      simpleStorage.updateStageStatus(2, 2, true)
      conversationData.stageCompletionStatus[1] = true

      await trackStep2Event(
        'step2_stage_complete',
        conversationData.sessionId,
        stage,
        conversationData.conversationCount,
        {
          stageNumber: 2,
          totalInteractions: conversationData.messages.filter((m) => m.stage === 2).length,
        },
      )
    }

    return true
  }

  return false
}

const addMessage = (type: 'ai' | 'user' | 'system', content: string, stage?: number) => {
  simpleStorage.addMessage(2, type, content, stage)

  const newData = simpleStorage.getStep2Data() as Step2Data | null
  if (newData) {
    conversationData.messages = newData.messages!.map(
      (msg: StoredMessage): Message => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        step: msg.step || 2,
        stage: msg.stage,
        timestamp: new Date(msg.timestamp),
      }),
    )
    conversationData.conversationCount = newData.conversationCount || 0
    conversationData.currentStage = newData.currentStage || 1
    conversationData.stageCompletionStatus = newData.stageCompletionStatus || [false, false]
  }

  nextTick(() => {
    scrollToBottom()
  })
}

const addSystemInstruction = (stage: number) => {
  const instructions = {
    1: '现在开始阶段一：请识别影响教室通风节能的关键因素。思考环境参数、人为因素、设备状态等。',
    2: '现在开始阶段二：基于你识别的因素，请设计自动控制的决策逻辑。考虑触发条件、优先级、冲突处理等。',
  }

  // 🔥 检查是否已存在该阶段的 system 消息
  const existingSystemMsg = conversationData.messages.find(
    (m) => m.type === 'system' && m.stage === stage,
  )
  if (existingSystemMsg) {
    console.log(`阶段${stage}已有系统指令，跳过添加`)
    return
  }

  const instruction = instructions[stage as keyof typeof instructions]
  if (instruction) {
    addMessage('system', instruction, stage)
  }
}

const getRecentAIQuestions = (messages: Message[]): string => {
  const aiMessages = messages.filter((m) => m.type === 'ai')
  const recent = aiMessages.slice(-3)
  return recent.map((m) => m.content).join(' | ')
}

const saveConversationToDB = async (conversationDataPayload: {
  sessionId: string
  step: number
  stage: number
  userInput: string
  aiResponse: string
  conversationCount: number
  timestamp: Date
  context: string
  // 🔥 新增：因素数据（可选）
  rankedFactorsData?: {
    isRanked: boolean
    keyFactors: Array<{ text: string; description: string }>
    secondaryFactors: string[]
    customFactors: string
    totalCount: number
  }
}): Promise<void> => {
  try {
    const experimentId = localStorage.getItem('experimentId')
    const studentName = localStorage.getItem('studentName')

    await fetch('/api/conversations/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experiment-ID': experimentId || '',
      },
      body: JSON.stringify({
        ...conversationDataPayload,
        experimentId,
        studentName,
      }),
    })

    console.log('✅ Step2 - 对话已保存到数据库')
  } catch (error) {
    console.error('❌ Step2 - 保存对话失败:', error)
  }
}

const saveToStorage = () => {
  // 🔥 保存因素选择数据
  if (currentStage.value === 1) {
    simpleStorage.setItem('step2_stage1_factors', {
      selections: factorOptions,
      customFactors: customFactorInput.value,
      submitted: stage1SelectionSubmitted.value,
      selectedCount: selectedCount.value,
    })
  }

  // 🔥 保存快照数据到 localStorage
  if (finalAnswerConfirmed.value) {
    simpleStorage.setItem('step2_final_answer_confirmed', {
      finalAnswerSnapshot: finalAnswerSnapshot.value,
      finalAnswerConfirmed: finalAnswerConfirmed.value,
      sessionId: conversationData.sessionId,
      savedAt: new Date().toISOString(),
    })
  }

  // 🔥 保存帮助系统状态
  saveHelpSystemState()

  console.log('💾 Step2 - 数据已自动保存到本地存储')
}

const scrollToBottom = () => {
  if (chatScrollArea.value) {
    chatScrollArea.value.scrollTop = chatScrollArea.value.scrollHeight
  }
}

const formatTime = (timestamp: string | Date) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleInput = () => {
  // 输入内容时不需要额外处理
}

// ==================== 生命周期 ====================

const showContentSequentially = async () => {
  showInfoCard.value = true
  await new Promise((resolve) => setTimeout(resolve, 800))

  showStageProgress.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))

  showAnswerArea.value = true
}

onMounted(async () => {
  console.log('🎬 Step2 组件已挂载')

  // 🔥 恢复因素选择状态
  const savedFactors = simpleStorage.getItem<{
    selections: FactorCategories
    customFactors: string
    submitted: boolean
    selectedCount: number
  }>('step2_stage1_factors')
  if (savedFactors) {
    Object.assign(factorOptions, savedFactors.selections)
    customFactorInput.value = savedFactors.customFactors || ''
    stage1SelectionSubmitted.value = savedFactors.submitted || false
  }

  // 🔥 ========== 智能清理 + 恢复数据（修复版） ==========
  const currentSessionId = simpleStorage.getSessionId()

  // 🔥 检查确认数据（简化类型定义）
  let confirmedData = simpleStorage.getItem<{
    finalAnswerSnapshot: string
    finalAnswerConfirmed: boolean
    sessionId?: string
    savedAt?: string
  }>('step2_final_answer_confirmed')

  // 🔥 判断是否需要清理：新实验或无 sessionId
  const shouldClearOldData =
    confirmedData && (!confirmedData.sessionId || confirmedData.sessionId !== currentSessionId)

  if (shouldClearOldData) {
    const reason = !confirmedData?.sessionId ? 'no_session_id' : 'session_mismatch'

    console.log('🧹 Step2 - 检测到需要清理的旧数据，原因:', reason)
    console.log('  旧数据:', confirmedData)
    console.log('  当前 sessionId:', currentSessionId)

    // 1. 清除所有锁定相关的 localStorage
    simpleStorage.removeItem('step2_final_answer_confirmed')
    simpleStorage.removeItem('step2_final_answer')
    simpleStorage.removeItem('step2_temp_snapshot')

    // 2. 🔥 修复：使用 getStepData + 类型扩展
    const stepData = simpleStorage.getStepData(2)
    if (stepData) {
      // 使用类型断言来访问 Step2 特有字段
      const step2ExtendedData = stepData as typeof stepData & {
        lockedAt?: string
        finalAnswerConfirmed?: boolean
        finalAnswerSnapshot?: string
        stage1Snapshot?: string
        stage2Snapshot?: string
      }

      // 清除所有锁定相关字段
      delete step2ExtendedData.lockedAt
      step2ExtendedData.finalAnswerConfirmed = false
      step2ExtendedData.finalAnswerSnapshot = ''
      step2ExtendedData.stage1Snapshot = ''
      step2ExtendedData.stage2Snapshot = ''

      simpleStorage.saveStepData(2, stepData)
    }

    // 3. 埋点 - 自动清理旧数据
    await trackStep2Event('step2_auto_unlock', currentSessionId, 1, 0, {
      reason,
      oldSessionId: confirmedData?.sessionId || 'unknown',
      newSessionId: currentSessionId,
    })

    console.log('✅ Step2 - 旧锁定状态已自动清除')

    // 重置 confirmedData
    confirmedData = null
  }

  // 🔥 恢复快照数据（只有在没被清除的情况下才恢复）
  if (confirmedData) {
    finalAnswerSnapshot.value = confirmedData.finalAnswerSnapshot || ''
    finalAnswerConfirmed.value = confirmedData.finalAnswerConfirmed || false

    // 如果已确认，锁定步骤
    if (confirmedData.finalAnswerConfirmed) {
      isStepLocked.value = true
      console.log('🔒 Step2 - 步骤已锁定，不可编辑（同一实验继续）')
    }
  }

  // 🔥 兜底保护：如果被标记为锁定，但当前没有任何对话记录，视为脏数据，自动解锁
  if (
    isStepLocked.value &&
    conversationData.messages.length === 0 &&
    conversationData.conversationCount === 0
  ) {
    console.warn('⚠️ Step2 - 检测到锁定状态但无对话记录，自动解锁（可能是切换账号或新实验）')

    // 重置本地状态
    isStepLocked.value = false
    finalAnswerConfirmed.value = false
    finalAnswerSnapshot.value = ''

    // 清除锁定相关的 localStorage
    simpleStorage.removeItem('step2_final_answer_confirmed')
    simpleStorage.removeItem('step2_final_answer')
    simpleStorage.removeItem('step2_temp_snapshot')
  }

  // 验证 sessionId
  if (!conversationData.sessionId) {
    console.error('⚠️ Step2 onMounted: sessionId 仍为空，紧急修复')
    conversationData.sessionId = simpleStorage.getSessionId()
  }

  console.log('🔍 Step2: 准备发送埋点，sessionId =', conversationData.sessionId)

  // 埋点 - 进入 Step2
  await trackStep2Event(
    'step2_enter',
    conversationData.sessionId,
    conversationData.currentStage,
    conversationData.conversationCount,
    {
      initialStage: conversationData.currentStage,
      hasHistory: conversationData.messages.length > 0,
      isLocked: isStepLocked.value,
    },
  )

  // 恢复其他状态...
  const stepData = simpleStorage.getStep2Data() as Step2Data | null
  if (stepData) {
    stage1Completed.value = stepData.stageCompletionStatus?.[0] || false
    stage2Completed.value = stepData.stageCompletionStatus?.[1] || false

    // 恢复帮助系统状态
    const stepDataWithHelp = stepData as Step2Data & { helpSystem?: typeof helpSystem }
    if (stepDataWithHelp.helpSystem) {
      Object.assign(helpSystem, stepDataWithHelp.helpSystem)
      console.log('💾 Step2 - 帮助系统状态已恢复:', helpSystem)
    }

    // 恢复快照数据（防御性编程）
    if (stepData.finalAnswerSnapshot && !finalAnswerSnapshot.value) {
      finalAnswerSnapshot.value = stepData.finalAnswerSnapshot
      finalAnswerConfirmed.value = stepData.finalAnswerConfirmed || false
    }
  }

  showContentSequentially()

  // 第一条 AI 口语引导（仅第一次）
  if (conversationData.messages.length === 0 && !promptShown.value) {
    addMessage(
      'ai',
      '问题识别和控制设计阶段：我们先完成第1步的<strong>选择与排序</strong>。<br />选出你认为最重要的3个因素并按重要性排序。<br />如有其他问题，可在下方与AI助手对话。',
      1,
    )
    promptShown.value = true
  }
})

// ==================== 监听器 ====================

// 监听编辑框内容变化，添加埋点
let editStartTracked = false

watch(editableFinalAnswer, async (newValue, oldValue) => {
  if (newValue !== originalContent.value) {
    isSaved.value = false

    // 首次编辑时记录
    if (!editStartTracked && oldValue === originalContent.value) {
      editStartTracked = true
      await trackStep2Event(
        'step2_content_edit_start',
        conversationData.sessionId,
        currentStage.value,
        conversationData.conversationCount,
        {
          originalLength: originalContent.value.length,
        },
      )
    }
  }
})

// 重置编辑追踪（在弹窗关闭时）
watch(showConfirmDialog, (newValue) => {
  if (!newValue) {
    editStartTracked = false
  }
})

watch(conversationCount, async (newCount) => {
  if (newCount >= 7) {
    showConversationWarning.value = true
    nextTick(() => {
      if (chatScrollArea.value) {
        chatScrollArea.value.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
    })
  }

  if (newCount === MAX_CONVERSATIONS) {
    await trackStep2Event(
      'step2_conversation_limit_reached',
      conversationData.sessionId,
      currentStage.value,
      newCount,
      {
        finalStage: currentStage.value,
      },
    )
  }
})

watch(currentStage, async (newStage, oldStage) => {
  if (oldStage && newStage !== oldStage) {
    await trackStep2Event(
      'step2_stage_change',
      conversationData.sessionId,
      newStage,
      conversationData.conversationCount,
      {
        fromStage: oldStage,
        toStage: newStage,
      },
    )
  }
})
</script>

<style scoped>
.step-two-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffffdd;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

/* 对话轮次限制警告 - 修复显示问题 */
.conversation-limit-warning {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 0 0 12px 12px;
  margin: 0;
  opacity: 0;
  transform: translateY(-100%);
  transition: all 0.5s ease-out;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  /* 修复：初始状态隐藏但不占用空间 */
  max-height: 0;
  overflow: hidden;
}

.conversation-limit-warning.warning-visible {
  opacity: 1;
  transform: translateY(0);
  /* 修复：显示时设置足够的最大高度 */
  max-height: 200px;
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  animation: warningPulse 2s infinite;
}

.warning-text {
  color: #92400e;
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.4;
}

@keyframes warningPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* 对话滚动区域 */
.chat-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
  /* 确保从顶部开始 */
  padding-top: 1.5rem;
}

.chat-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.chat-scroll-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.chat-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

.chat-scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* 阶段进度指示器 */
.stage-progress {
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.6s ease-out;
  margin-bottom: 1rem;
  max-height: 0;
  overflow: hidden;
}

.stage-progress.stage-visible {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}

.progress-container {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 16px;
  padding: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header h3 {
  color: #0369a1;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 600;
}

.progress-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stage-info {
  background: #0ea5e9;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
}

.conversation-counter {
  background: linear-gradient(45deg, #8b5cf6, #a855f7);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.progress-stages {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.progress-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  transition: all 0.3s ease;
}

.stage-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.progress-stage.completed .stage-icon {
  background: #22c55e;
  color: white;
}

.progress-stage.active .stage-icon {
  background: #0ea5e9;
  color: white;
  animation: pulse 2s infinite;
}

.progress-stage.pending .stage-icon {
  background: #e2e8f0;
  color: #64748b;
}

.stage-label {
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  transition: color 0.3s ease;
}

.progress-stage.completed .stage-label {
  color: #22c55e;
}

.progress-stage.active .stage-label {
  color: #0369a1;
}

.progress-stage.pending .stage-label {
  color: #64748b;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(14, 165, 233, 0);
  }
}

/* 对话消息区域 */
.chat-messages {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 信息卡片样式 */
.info-card-section {
  flex-shrink: 0;
}

.info-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 20px;
  padding: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.info-card.card-visible {
  opacity: 1;
  transform: translateY(0);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card-icon {
  background: linear-gradient(45deg, #ef4444, #f59e0b);
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.card-title {
  color: #92400e;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 500;
}

.card-content h4 {
  color: #92400e;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
}

/* 题注样式 */
.temperature-chart h5,
.classroom-status h5 {
  color: #374151;
  font-size: 0.85rem;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  text-align: center;
  padding: 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

/* 温度图表样式 */
.temperature-chart {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-svg {
  width: 100%;
  height: auto;
}

.chart-label {
  font-size: 10px;
  fill: #64748b;
  font-weight: 500;
}

.temp-label {
  font-size: 9px;
  fill: #ef4444;
  font-weight: 600;
}

/* 教室状态面板 */
.classroom-status {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.status-icon {
  font-size: 1.2rem;
}

.status-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.status-label {
  font-size: 0.7rem;
  color: #64748b;
  text-align: center;
}

/* 环境标准参考 */
.reference-standards {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.reference-standards h4 {
  color: #0369a1;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
  text-align: center;
}

.standards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.standard-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(14, 165, 233, 0.2);
  transition: transform 0.2s ease;
}

.standard-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.95);
}

.standard-icon {
  font-size: 1.1rem;
}

.standard-range {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0369a1;
}

.standard-label {
  font-size: 0.7rem;
  color: #64748b;
  text-align: center;
}

/* 底部用户输入区域 */
.input-section {
  border-top: 1px solid #e2e8f0;
  background: white;
  padding: 1.5rem;
  flex-shrink: 0;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
  width: 100%;
}

.input-section.input-visible {
  opacity: 1;
  transform: translateY(0);
}

.input-container {
  width: 100%;
}

.user-input {
  width: 100%;
  box-sizing: border-box;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #334155;
  background: #f8fafc;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition:
    border-color 0.3s ease,
    background-color 0.3s ease;
}

.user-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.user-input::placeholder {
  color: #94a3b8;
}

.user-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
  width: 100%;
}

.help-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #f1f5f9, #e2e8f0);
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  color: #475569;
  font-weight: 500;
}

.help-button:hover:not(:disabled) {
  background: linear-gradient(45deg, #e2e8f0, #cbd5e1);
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.help-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.help-icon {
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.submit-button,
.next-button {
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.submit-button {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  position: relative;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.next-button {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  animation: slideInFromRight 0.5s ease-out;
}

.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 按钮内加载动画 */
.button-loading-dots {
  display: inline-flex;
  gap: 3px;
  margin-right: 8px;
}

.button-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  animation: buttonBounce 1.4s infinite ease-in-out;
}

.button-dot:nth-child(1) {
  animation-delay: -0.32s;
}
.button-dot:nth-child(2) {
  animation-delay: -0.16s;
}
.button-dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes buttonBounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 对话消息样式 */
.message {
  display: flex;
  margin-bottom: 1.5rem;
  animation: slideIn 0.3s ease-out;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message.ai .message-avatar {
  background: linear-gradient(45deg, #4caf50, #2196f3);
  margin-right: 0.75rem;
}

.message.user .message-avatar {
  background: linear-gradient(45deg, #667eea, #764ba2);
  margin-left: 0.75rem;
}

.message-content {
  max-width: 70%;
  background: #f1f5f9;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  position: relative;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.message.user .message-content {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
}

.message-text {
  margin-bottom: 0.5rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  text-align: right;
  margin-top: 0.25rem;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

/* 加载动画样式 */
.loading-message {
  animation: slideIn 0.3s ease-out;
}

.loading-content {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  max-width: 80%;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0ea5e9;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}
.dot:nth-child(2) {
  animation-delay: -0.16s;
}
.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.loading-text {
  color: #0369a1;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 500;
}

.loading-progress {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e0f2fe;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9, #0284c7);
  border-radius: 3px;
  animation: progressAnimation 3s ease-in-out infinite;
}

@keyframes progressAnimation {
  0% {
    width: 0%;
  }
  50% {
    width: 60%;
  }
  100% {
    width: 90%;
  }
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.step {
  color: #94a3b8;
  transition: color 0.3s ease;
}

.step.active {
  color: #0369a1;
  font-weight: 600;
}

/* 阶段过渡动画 */
.stage-transition {
  animation: stageTransition 0.5s ease-in-out;
}

@keyframes stageTransition {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 0.5;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-scroll-area {
    padding: 1rem;
  }

  .chart-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .status-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .standards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .standard-item {
    padding: 0.5rem;
  }

  .standard-range {
    font-size: 0.8rem;
  }

  .standard-label {
    font-size: 0.65rem;
  }

  .progress-stages {
    gap: 1rem;
  }

  .stage-icon {
    width: 2rem;
    height: 2rem;
    font-size: 0.9rem;
  }

  .stage-label {
    font-size: 0.8rem;
  }

  .progress-container {
    padding: 1rem;
  }

  .progress-header h3 {
    font-size: 1rem;
  }

  .progress-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }

  .stage-info {
    font-size: 0.8rem;
    padding: 0.2rem 0.6rem;
  }

  .conversation-counter {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
  }

  .message-content {
    max-width: 85%;
  }

  .loading-content {
    max-width: 90%;
  }

  .input-section {
    padding: 1rem;
  }

  .input-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .action-buttons {
    justify-content: center;
  }

  .submit-button,
  .next-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }

  .help-button {
    font-size: 0.8rem;
    padding: 0.6rem 0.8rem;
  }

  .loading-text {
    font-size: 0.8rem;
  }

  .progress-steps {
    font-size: 0.7rem;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .user-input {
    font-size: 0.9rem;
    min-height: 70px;
  }

  .card-title {
    font-size: 0.9rem;
  }

  .card-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.1rem;
  }

  .confirm-dialog {
    width: 95%;
    padding: 1.5rem;
    max-height: 85vh;
  }

  .dialog-header h3 {
    font-size: 1.1rem;
  }

  .dialog-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.3rem;
  }

  .dialog-content p {
    font-size: 0.9rem;
  }

  .completion-summary {
    padding: 1rem;
  }

  .summary-item {
    font-size: 0.85rem;
  }

  .dialog-warning {
    font-size: 0.8rem;
    padding: 0.75rem;
  }
  .warning-content {
    padding: 0.75rem 1rem;
  }

  .warning-text {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .progress-stages {
    flex-direction: column;
    gap: 1rem;
  }

  .progress-stage {
    flex-direction: row;
    gap: 1rem;
  }

  .stage-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .stage-label {
    font-size: 0.9rem;
  }

  .status-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .status-item {
    flex-direction: row;
    justify-content: space-between;
    padding: 1rem;
  }

  .standards-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .standard-item {
    flex-direction: row;
    justify-content: space-between;
    padding: 0.75rem;
  }

  .chart-container {
    gap: 1.5rem;
  }

  .progress-info {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .conversation-counter {
    font-size: 0.7rem;
  }

  .stage-info {
    font-size: 0.75rem;
  }

  .confirm-dialog {
    padding: 1rem;
  }

  .dialog-header {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .summary-item {
    font-size: 0.8rem;
  }

  .warning-content {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .warning-icon {
    font-size: 1.3rem;
  }

  .warning-text {
    font-size: 0.8rem;
  }
}

/* 帮助弹窗样式 */
.help-dialog-overlay {
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

.help-dialog {
  background: white;
  border-radius: 20px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.help-dialog-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  border-radius: 20px 20px 0 0;
}

.help-dialog-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.help-dialog-header h3 {
  color: #1e293b;
  font-size: 1.3rem;
  margin: 0;
  font-weight: 600;
  flex: 1;
}

.close-button {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-button:hover {
  background: #e2e8f0;
  color: #334155;
}

.help-dialog-content {
  padding: 2rem;
}

.help-dialog-description {
  color: #475569;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.help-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.help-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.help-option:hover:not(:disabled) {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.help-option.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.help-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.option-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.option-description {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.option-arrow {
  font-size: 1.5rem;
  color: #94a3b8;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.help-option:hover:not(:disabled) .option-arrow {
  transform: translateX(4px);
  color: #3b82f6;
}

/* 自定义问题输入区域 */
.custom-question-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-question-input {
  width: 100%;
  box-sizing: border-box;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #334155;
  background: white;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.custom-question-input:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.custom-question-input::placeholder {
  color: #94a3b8;
}

.custom-question-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.cancel-custom-button,
.submit-custom-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cancel-custom-button {
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.cancel-custom-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.submit-custom-button {
  background: linear-gradient(45deg, #f59e0b, #f97316);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.submit-custom-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

.submit-custom-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 提示信息 */
.help-tip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #92400e;
  animation: slideDown 0.3s ease-out;
}

.tip-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .help-dialog {
    width: 95%;
    max-height: 90vh;
  }

  .help-dialog-header {
    padding: 1.25rem 1.5rem;
  }

  .help-dialog-header h3 {
    font-size: 1.1rem;
  }

  .help-dialog-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.3rem;
  }

  .help-dialog-content {
    padding: 1.5rem;
  }

  .help-option {
    padding: 1rem;
  }

  .option-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1.1rem;
  }

  .option-title {
    font-size: 0.9rem;
  }

  .option-description {
    font-size: 0.8rem;
  }

  .custom-question-section {
    padding: 1rem;
  }

  .custom-question-actions {
    flex-direction: column;
  }

  .cancel-custom-button,
  .submit-custom-button {
    width: 100%;
  }
}

/* 已使用标记 */
.used-badge {
  display: inline-block;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  margin-left: 0.5rem;
  font-weight: 500;
}

.help-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.help-option.disabled:hover {
  transform: none;
  border-color: #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* 周期信息 */
.help-cycle-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #0369a1;
  font-weight: 500;
}

.cycle-icon {
  font-size: 1.1rem;
}

.cycle-tip {
  font-size: 0.85rem;
  color: #64748b;
}

/* 临时保存按钮 */
.temp-save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.save-icon {
  font-size: 1.1rem;
}

.temp-save-button .save-icon {
  font-size: 1.1rem;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .dialog-actions {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch; /* 🔥 移动端按钮拉伸 */
  }

  .cancel-button,
  .temp-save-button,
  .confirm-button {
    width: 100%; /* 🔥 移动端按钮全宽 */
  }

  .save-success-banner {
    margin: 0 1.5rem 1rem 1.5rem;
    font-size: 0.85rem;
  }
}

/* ==================== 确认弹窗统一样式 ==================== */
.confirm-dialog-overlay {
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

.confirm-dialog {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

/* 🔥 统一为蓝色主题 */
.dialog-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(45deg, #0ea5e9, #0284c7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.dialog-header h3 {
  color: #1e293b;
  font-size: 1.3rem;
  margin: 0;
  font-weight: 600;
}

.dialog-content {
  margin-bottom: 2rem;
}

.dialog-content p {
  color: #475569;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* 快照预览区域 */
.answer-preview {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 1rem;
  margin: 1.5rem 0;
  animation: slideIn 0.3s ease-out;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(14, 165, 233, 0.2);
}

.preview-icon {
  font-size: 1.2rem;
}

.preview-title {
  font-weight: 600;
  color: #0369a1;
  font-size: 0.95rem;
}

/* 🔥 新增：任务标题样式 */
.task-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e0f2fe;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.task-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.task-text {
  font-size: 0.9rem;
  color: #334155;
  font-weight: 500;
  line-height: 1.4;
}

.preview-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-textarea {
  width: 100%;
  border: 2px solid #0ea5e9;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #334155;
  background: white;
  resize: vertical;
  min-height: 300px; /* Step2内容较多 */
  font-family: inherit;
  transition: all 0.3s ease;
}

.preview-textarea:focus {
  outline: none;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.preview-hint {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0;
  font-style: italic;
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: #94a3b8;
}

/* 完成摘要 */
.completion-summary {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: #334155;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* 警告提示 */
.dialog-warning {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.9rem;
  color: #92400e;
}

.warning-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* 按钮区域 - Step2特殊：有3个按钮 */
.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.cancel-button,
.confirm-button,
.temp-save-button {
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-button {
  background: #f1f5f9;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.cancel-button:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.temp-save-button {
  background: linear-gradient(45deg, #f59e0b, #f97316);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.temp-save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

.temp-save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.temp-save-button.saved {
  background: linear-gradient(45deg, #22c55e, #16a34a);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.confirm-button {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.confirm-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.confirm-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 保存成功提示条 */
.save-success-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border: 1px solid #22c55e;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #166534;
  font-weight: 500;
}

.save-success-banner .save-icon {
  font-size: 1rem;
}

.save-success-banner .save-time {
  margin-left: auto;
  font-size: 0.8rem;
  color: #4ade80;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .dialog-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .cancel-button,
  .confirm-button,
  .temp-save-button {
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .task-title {
    padding: 0.5rem 0.75rem;
  }

  .task-text {
    font-size: 0.85rem;
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 🔥 新增：步骤锁定提示样式 */
.step-locked-banner {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 0 0 12px 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  animation: slideDown 0.5s ease-out;
}

.lock-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.step-locked-banner span:last-child {
  color: #92400e;
  font-weight: 600;
  font-size: 0.95rem;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* ==================== 因素选择面板样式 ==================== */
.factor-selection-panel {
  padding: 24px;
  background: white;
  border-radius: 12px;
  margin: 20px 0;
  animation: slideIn 0.4s ease;
}

.selection-header {
  text-align: center;
  margin-bottom: 32px;
}

.header-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.selection-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.selection-hint {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* 因素分类容器 */
.factor-categories {
  display: grid;
  gap: 24px;
  margin-bottom: 24px;
}

.factor-category {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #e2e8f0;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 16px 0;
}

.category-icon {
  font-size: 20px;
}

/* 因素选项 */
.factor-options {
  display: grid;
  gap: 12px;
}

.factor-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.factor-option:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
  transform: translateX(4px);
}

.factor-option.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.factor-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.factor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.factor-label {
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
}

.factor-desc {
  font-size: 12px;
  color: #64748b;
}

.checkmark {
  font-size: 20px;
  color: #3b82f6;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.factor-option.selected .checkmark {
  opacity: 1;
}

/* 自定义补充区域 */
.custom-factors-section {
  background: #fffbeb;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.custom-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 12px 0;
}

.custom-icon {
  font-size: 18px;
}

.custom-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #fbbf24;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.custom-input:focus {
  outline: none;
  border-color: #f59e0b;
  background: white;
}

.custom-char-count {
  text-align: right;
  font-size: 12px;
  color: #92400e;
  margin-top: 4px;
}

/* 选择统计和按钮 */
.selection-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border: 2px solid #0ea5e9;
}

.summary-stat {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 24px;
}

.stat-text {
  font-size: 15px;
  color: #0c4a6e;
}

.stat-number {
  font-size: 20px;
  color: #0284c7;
}

.warning-text {
  font-size: 13px;
  color: #dc2626;
  font-weight: 500;
}

.success-text {
  font-size: 13px;
  color: #16a34a;
  font-weight: 600;
}

.confirm-selection-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.confirm-selection-button:hover:not(.disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.confirm-selection-button.disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}

.button-icon {
  font-size: 18px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 排序界面样式 ==================== */
.ranking-content {
  animation: slideIn 0.4s ease;
}

.ranking-header {
  text-align: center;
  margin-bottom: 32px;
}

.ranking-hint {
  font-size: 14px;
  color: #64748b;
  margin: 12px 0 0 0;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* 前3名高亮 */
.ranking-item:nth-child(-n + 3) {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
}

.ranking-item:nth-child(1) .rank-number {
  background: linear-gradient(45deg, #ef4444, #dc2626);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.ranking-item:nth-child(2) .rank-number {
  background: linear-gradient(45deg, #f59e0b, #d97706);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.ranking-item:nth-child(3) .rank-number {
  background: linear-gradient(45deg, #10b981, #059669);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.rank-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #3b82f6, #2563eb);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.factor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rank-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rank-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #f0f9ff;
  transform: scale(1.1);
}

.rank-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.custom-factor-display {
  background: #fffbeb;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.custom-factor-display h4 {
  font-size: 14px;
  color: #92400e;
  margin: 0 0 8px 0;
}

.custom-factor-display p {
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
  margin: 0;
}

.ranking-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 16px;
}

.back-button,
.confirm-ranking-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.back-button {
  background: #f1f5f9;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.back-button:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.confirm-ranking-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.confirm-ranking-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.ranking-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  color: #0369a1;
}

.tip-icon {
  font-size: 18px;
}

/* 下一步按钮样式 */
.next-step-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.next-step-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.next-step-button.disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}

.error-text {
  font-size: 13px;
  color: #dc2626;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 768px) {
  .ranking-item {
    padding: 12px;
    gap: 12px;
  }

  .rank-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .rank-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .ranking-actions {
    flex-direction: column;
  }

  .back-button,
  .confirm-ranking-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
