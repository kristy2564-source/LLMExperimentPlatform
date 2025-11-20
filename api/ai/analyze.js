// api/ai/analyze.js
// 增强版苏格拉底式引导 - 支持完整对话历史格式，改进Step6整合引导，优化语气自然度
// 🔧 v2: 智能提示增强 - 包含之前步骤的历史上下文
// 🔧 v3: 支持三种帮助模式 - refine/example/custom
// 🔧 v4: 清理未使用函数，修复帮助提示词
import { MongoClient } from 'mongodb'

let cachedClient = null

console.log('analyze.js version: 2025-11-16-cleaned-and-fixed')

async function connectToDatabase() {
  console.log('🔍 connectToDatabase 函数被调用')
  if (cachedClient) {
    console.log('✅ 使用缓存的数据库连接')
    return cachedClient
  }
  try {
    console.log('🔌 创建新的 MongoDB 连接...')
    console.log('📍 MONGODB_URI 是否存在:', !!process.env.MONGODB_URI)
    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    cachedClient = client

    console.log('✅ MongoDB 连接成功')
    return client
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error)
    throw error
  }
}

/* ============================== 对话历史标准化 ============================== */
function normalizeConversationHistory(conversationHistory) {
  if (!Array.isArray(conversationHistory)) {
    console.warn('⚠️ conversationHistory 不是数组:', typeof conversationHistory)
    return []
  }
  const normalized = conversationHistory
    .map((msg, index) => {
      // 如果已经是标准格式，直接返回
      if (msg.type && msg.content && msg.step !== undefined) {
        return {
          type: msg.type,
          content: msg.content,
          step: parseInt(msg.step) || 6,
          stage: msg.stage ? parseInt(msg.stage) : 1,
          timestamp: msg.timestamp || new Date(),
        }
      }
      // 尝试转换旧格式
      return {
        type: msg.type || 'user',
        content: msg.content || msg.userInput || msg.aiResponse || '',
        step: parseInt(msg.step) || 6,
        stage: parseInt(msg.stage) || 1,
        timestamp: msg.timestamp || new Date(),
      }
    })
    .filter((msg) => msg.content && msg.content.trim().length > 0) // 过滤空消息

  console.log(
    `📊 对话历史标准化: 原始${conversationHistory.length}条 -> 有效${normalized.length}条`,
  )

  // 打印最近几条历史供调试
  if (normalized.length > 0) {
    console.log('📝 最近的对话历史样例:')
    normalized.slice(-3).forEach((msg, idx) => {
      console.log(
        `  ${idx + 1}. [${msg.type}] Step${msg.step}${msg.stage ? `-Stage${msg.stage}` : ''}: ${msg.content.substring(0, 50)}...`,
      )
    })
  }
  return normalized
}

function getRecentConversationContext(conversationHistory, step, stage) {
  const recentMessages = conversationHistory
    .filter((msg) => msg.step === step && msg.stage === stage)
    .slice(-4) // 最近4条

  if (recentMessages.length === 0) {
    return { isEmpty: true, summary: '本阶段刚开始' }
  }

  const userMessages = recentMessages.filter((msg) => msg.type === 'user')
  const aiMessages = recentMessages.filter((msg) => msg.type === 'ai')

  return {
    isEmpty: false,
    count: recentMessages.length,
    userCount: userMessages.length,
    aiCount: aiMessages.length,
    lastUserMessage: userMessages[userMessages.length - 1]?.content || '',
    lastAiMessage: aiMessages[aiMessages.length - 1]?.content || '',
    summary: `已进行${Math.floor(recentMessages.length / 2)}轮对话`,
  }
}

/* ============================== 阶段完成判断逻辑 ============================== */
function shouldCompleteStage(step, stage, conversationHistory, userAnswer) {
  console.log(`🎯 检查阶段完成状态 - Step${step}${stage ? `-Stage${stage}` : ''}`)

  if (step === 2) {
    if (stage === 1) {
      // 第一阶段：因素识别
      const userText = userAnswer.toLowerCase()
      const mentionedFactors = [
        /温度/.test(userText),
        /湿度/.test(userText),
        /(co2|二氧化碳|空气质量)/.test(userText),
        /(人数|密度|布局)/.test(userText),
      ].filter(Boolean).length

      const isComplete = mentionedFactors >= 2
      console.log(`📊 因素识别评估: 提到${mentionedFactors}个因素, 完成状态:${isComplete}`)
      return isComplete
    } else if (stage === 2) {
      // 第二阶段：控制设计
      const userText = userAnswer.toLowerCase()

      const hasTemperatureThreshold = /(温度.*?度|度.*?温度|\d+度)/.test(userText)
      const hasAction = /(开窗|空调|风扇|通风)/.test(userText)
      const hasCondition = /(当|如果|超过|高于|低于)/.test(userText)
      const hasDetailedLogic = userText.length > 50

      const isComplete = hasTemperatureThreshold && hasAction && hasCondition && hasDetailedLogic
      console.log(
        `📊 控制逻辑评估: 温度阈值:${hasTemperatureThreshold}, 行动:${hasAction}, 条件:${hasCondition}, 详细度:${hasDetailedLogic}, 完成状态:${isComplete}`,
      )
      return isComplete
    }
  }
  return false
}

function hasRepeatedQuestion(recentQuestions) {
  if (!recentQuestions) return false

  // 检查是否包含明显的重复问题标志词
  const frustratedWords = ['重复', '已经说了', '问过了', '一直问']
  if (frustratedWords.some((word) => recentQuestions.includes(word))) {
    console.log('🚨 检测到学生困扰信号')
    return true
  }

  // 检查问题相似度
  const questionLines = recentQuestions
    .split('🤖')
    .filter((q) => q.trim())
    .slice(-3)

  if (questionLines.length >= 2) {
    const lastTwo = questionLines.slice(-2)
    const similarity = calculateSimilarity(lastTwo[0], lastTwo[1])
    console.log(`📊 问题相似度检测: ${similarity.toFixed(2)}`)
    return similarity > 0.6
  }
  return false
}

function calculateSimilarity(str1, str2) {
  const words1 = str1
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1)
  const words2 = str2
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1)

  if (words1.length === 0 || words2.length === 0) return 0

  const common = words1.filter((word) => words2.includes(word))
  return common.length / Math.max(words1.length, words2.length)
}

/* ============================== Step4 专用：提示词测试与评估 ============================== */
function analyzeStep4Progress(userMessages, allContent) {
  console.log('🎯 进行Step4提示词设计分析')

  // === 提示词核心要素检测 ===
  const promptElements = {
    角色设定: ['角色', '专家', '身份', '你是', '作为', '扮演'],
    任务描述: ['任务', '目标', '需要', '请', '帮助', '分析', '给出'],
    上下文信息: ['背景', '条件', '情况', '环境', '数据', '当前', '教室'],
    输出格式: ['格式', '结构', '列出', '按照', '分析', '方案', '优先级', '排序'],
    约束条件: ['预算', '限制', '要求', '不能', '避免', '注意'],
  }

  const identifiedElements = Object.entries(promptElements)
    .filter(([name, keywords]) => keywords.some((k) => allContent.includes(k)))
    .map(([name]) => name)

  // === 提示词质量评估 ===
  const qualityIndicators = {
    具体性: /\d+人|\d+℃|\d+㎡/.test(allContent),
    清晰性: allContent.length > 30,
    结构化: /第一|第二|首先|其次|列出|按照/.test(allContent),
    引导性: /请|帮助|分析|给出|建议/.test(allContent),
    完整性: identifiedElements.length >= 3,
  }

  // === 提示词问题诊断 ===
  const issues = []
  if (!qualityIndicators.具体性) issues.push('缺少具体参数')
  if (!qualityIndicators.结构化) issues.push('缺少输出格式要求')
  if (!qualityIndicators.完整性) issues.push('核心要素不完整')
  if (allContent.length < 20) issues.push('描述过于简短')

  // === 提示词类型识别 ===
  let promptType = 'unknown'
  if (/查询|什么是|如何|怎么/.test(allContent)) {
    promptType = 'query'
  } else if (/分析|评估|判断|比较/.test(allContent)) {
    promptType = 'analysis'
  } else if (/设计|制定|给出|推荐/.test(allContent)) {
    promptType = 'generation'
  } else if (/优化|改进|调整/.test(allContent)) {
    promptType = 'optimization'
  }

  const progress = {
    type: 'step4',
    identifiedElements,
    missingElements: Object.keys(promptElements).filter((e) => !identifiedElements.includes(e)),
    qualityIndicators,
    qualityScore: Object.values(qualityIndicators).filter(Boolean).length,
    issues,
    promptType,
    conversationCount: userMessages.length,
    hasExample: allContent.length > 50,
  }

  console.log('📊 Step4分析结果:', JSON.stringify(progress, null, 2))
  return progress
}

async function testPromptAndGenerate(studentPrompt) {
  console.log('🧪 Step4 - 测试学生提示词:', studentPrompt.substring(0, 50) + '...')

  const testScenario = {
    classroom: '40人',
    area: '60㎡',
    temperature: '35℃',
    season: '夏季',
    budget: '有限',
  }

  const testMessages = [
    {
      role: 'system',
      content: `你现在要扮演学生设计的AI助手角色。

学生设计的提示词是：
"${studentPrompt}"

请严格按照这个提示词的要求，生成节能方案。
注意：
1. 严格控制在100字以内（约等于150个token）
2. 如果提示词要求列出方案，就列出方案
3. 如果提示词要求特定格式，就按照格式输出
4. 模拟真实AI助手的输出效果`,
    },
    {
      role: 'user',
      content: `当前教室情况：${testScenario.classroom}、${testScenario.area}、温度${testScenario.temperature}、${testScenario.season}、预算${testScenario.budget}。请给出节能建议。`,
    },
  ]

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: testMessages,
        max_tokens: 150,
        temperature: 0.7,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error('AI测试调用失败')
    }

    const data = await response.json()
    let generatedSolution = data.choices?.[0]?.message?.content?.trim() || ''

    if (generatedSolution.length > 100) {
      generatedSolution = generatedSolution.substring(0, 97) + '...'
    }

    console.log('✅ Step4 - 生成的方案示例:', generatedSolution)
    return generatedSolution
  } catch (error) {
    console.error('❌ Step4 - 提示词测试失败:', error)
    return '建议采用自然通风结合空调的方式。开窗通风可降温3-5℃，配合空调设定27℃节能20%。预算有限可优先使用自然通风。'
  }
}

function evaluatePromptQuality(studentPrompt, progress) {
  console.log('📊 Step4 - 评估提示词质量')

  const evaluation = {
    strengths: [],
    weaknesses: [],
    score: 0,
  }

  const hasRole = /你是|作为|扮演/.test(studentPrompt)
  const hasTask = /请|分析|设计|生成|推荐|给出/.test(studentPrompt)
  const hasContext = /教室|40人|60|㎡|温度|35|℃/.test(studentPrompt)
  const hasFormat = /列出|按照|方案|优先级|排序|包含/.test(studentPrompt)
  const hasConstraints = /预算|限制|成本|不超过|要求/.test(studentPrompt)

  if (hasRole) {
    evaluation.strengths.push('✅ 角色设定明确')
    evaluation.score++
  }
  if (hasTask) {
    evaluation.strengths.push('✅ 任务描述清晰')
    evaluation.score++
  }
  if (hasContext) {
    evaluation.strengths.push('✅ 背景信息充分')
    evaluation.score++
  }
  if (hasFormat) {
    evaluation.strengths.push('✅ 输出格式明确')
    evaluation.score++
  }
  if (hasConstraints) {
    evaluation.strengths.push('✅ 约束条件说明')
    evaluation.score++
  }

  if (!hasRole) {
    evaluation.weaknesses.push({
      aspect: '角色设定',
      suggestion: '建议明确AI的身份，如"你是教室节能专家"',
    })
  }
  if (!hasTask) {
    evaluation.weaknesses.push({
      aspect: '任务描述',
      suggestion: '建议清晰说明任务，如"请分析教室环境并设计节能方案"',
    })
  }
  if (!hasContext) {
    evaluation.weaknesses.push({
      aspect: '背景信息',
      suggestion: '建议添加具体数据，如"教室40人、60㎡、温度35℃"',
    })
  }
  if (!hasFormat) {
    evaluation.weaknesses.push({
      aspect: '输出格式',
      suggestion: '建议明确输出结构，如"按优先级列出3个方案"',
    })
  }
  if (!hasConstraints) {
    evaluation.weaknesses.push({
      aspect: '约束条件',
      suggestion: '建议说明限制条件，如"预算有限"或"2000元以内"',
    })
  }

  if (studentPrompt.length < 20) {
    evaluation.weaknesses.push({
      aspect: '描述详细度',
      suggestion: '提示词过于简短，建议提供更多细节',
    })
  }

  if (!/\d+/.test(studentPrompt)) {
    evaluation.weaknesses.push({
      aspect: '具体性',
      suggestion: '建议加入具体数字参数，让AI的建议更精准',
    })
  }

  console.log(`📊 Step4 - 评估得分: ${evaluation.score}/5`)
  console.log(`✅ 优点: ${evaluation.strengths.length}个`)
  console.log(`📌 待改进: ${evaluation.weaknesses.length}个`)

  return evaluation
}

function generateStep4CombinedResponse(generatedSolution, evaluation, conversationCount) {
  console.log('🎨 Step4 - 生成组合响应HTML')

  let feedbackContent = ''

  if (evaluation.score >= 4) {
    feedbackContent += `<strong>🌟 太棒了！你的提示词已经很完善了！</strong><br><br>`
  } else if (evaluation.score >= 3) {
    feedbackContent += `<strong>👍 不错的开始！你的提示词包含了核心要素。</strong><br><br>`
  } else if (evaluation.score >= 2) {
    feedbackContent += `<strong>💡 有了基础，让我们一起完善它！</strong><br><br>`
  } else {
    feedbackContent += `<strong>🎯 让我们一步步打造一个好提示词！</strong><br><br>`
  }

  if (evaluation.strengths.length > 0) {
    feedbackContent += `<strong>✅ 包含要素：</strong><br>`
    evaluation.strengths.forEach((strength) => {
      feedbackContent += `• ${strength}<br>`
    })
    feedbackContent += `<br>`
  }

  if (evaluation.weaknesses.length > 0) {
    feedbackContent += `<strong>📌 可以改进的地方：</strong><br><br>`
    evaluation.weaknesses.slice(0, 3).forEach((weakness, index) => {
      feedbackContent += `<strong>${index + 1}️⃣ ${weakness.aspect}</strong><br>`
      feedbackContent += `${weakness.suggestion}<br><br>`
    })
  }

  if (conversationCount === 1) {
    feedbackContent += `<br><strong>💭 提示：</strong>好的提示词能让AI给出更精准、更实用的建议。试着根据反馈优化你的设计吧！`
  } else if (conversationCount >= 3 && evaluation.score >= 4) {
    feedbackContent += `<br><strong>🎉 很棒！</strong>你已经掌握了提示词设计的技巧。如果满意，可以提交继续下一步。`
  }

  const combinedHTML = `
<div class="ai-response-combined">
  <div class="test-result-section">
    <div class="section-header">
      <span class="icon">🤖</span>
      <strong>根据你的提示词生成的方案示例</strong>
    </div>
    <div class="result-content">
      ${generatedSolution}
    </div>
  </div>

  <div class="divider"></div>

  <div class="feedback-section">
    <div class="section-header">
      <span class="icon">💡</span>
      <strong>提示词改进建议</strong>
    </div>
    <div class="feedback-content">
      ${feedbackContent}
    </div>
  </div>
</div>
`

  return combinedHTML.trim()
}

/* ============================== 常量定义 ============================== */
const STEP_OBJECTIVES = {
  2: {
    1: {
      focus: '多元化影响因素识别',
      goal: '发现环境、人为、设备、时间等多维度因素',
      avoidTopics: ['重复询问已确定的参数'],
    },
    2: {
      focus: '控制决策逻辑设计',
      goal: '制定if-then规则、优先级策略、冲突处理',
      avoidTopics: ['再次确认具体数值'],
    },
  },
  3: {
    focus: '策略论证与比较分析',
    goal: '成本效益、适用场景、实施可行性、风险评估',
    avoidTopics: ['重复基础参数设定'],
  },
  4: {
    focus: '用户界面提示词设计',
    goal: '设计清晰、准确、引导性的交互提示词模板，让普通用户能简单使用AI系统',
    avoidTopics: ['技术实现细节', '节能方案优劣', '具体温度阈值', '设备参数设置'],
    evaluationCriteria: [
      '角色设定是否明确',
      '任务描述是否清晰',
      '背景信息是否充分',
      '输出格式是否明确',
      '约束条件是否说明',
      '是否易于普通用户理解',
    ],
  },
  5: {
    focus: '极端情况适应创新',
    goal: '应急调整、资源重配、创新措施、快速响应',
    avoidTopics: ['常规参数重复确认'],
  },
  6: {
    focus: '系统整合与方案优化',
    goal: '整合前期分析、补充遗漏点、优化完善、生成完整方案',
    avoidTopics: ['重复已讨论的基础功能'],
  },
  7: {
    focus: '自我反思与总结',
    goal: '学习过程反思、经验总结、能力评估',
    avoidTopics: ['重复之前的技术细节'],
  },
}

/* ============================== 系统提示词函数 ============================== */
function getSocraticSystemPrompt(step, stage = 1) {
  const stepObj = STEP_OBJECTIVES[step]
  const currentStage = stepObj?.[stage] || stepObj

  if (!currentStage) {
    return getGenericSystemPrompt(step)
  }

  const baseRules = `你是一位善于启发思考的教学引导者，像朋友一样和学生讨论通风节能问题。

【语气风格 - 重要】
- 用自然的对话语气，像面对面交流一样
- 多用"看来"、"有意思"、"这个想法不错"等过渡词
- 避免评价性词汇（如"质量高"、"正确"、"很好"）
- 用引导性的问题代替直接评判
- 保持温和、鼓励的态度

【回复结构】
1. 先用3-8个字自然回应学生的想法（如"有道理"、"这个角度很实用"）
2. 用一个承接性的短句（如"基于这个思路"、"顺着这个方向"）
3. 提出下一个引导性问题（25字内）

【关键原则 - 避免重复问题】
- 每个具体参数最多只能问1-2次
- 一旦学生给出答案，不要再重复确认
- 如果学生表示厌烦重复，立即道歉并转向新角度
- 每次提问都要推进到新的思维维度

【当前目标】${currentStage.focus}
【具体任务】${currentStage.goal}
【严格避免】${currentStage.avoidTopics?.join('、') || '无'}

【示例对比】
❌ 差："回答全面。如何根据这些参数设计控制策略？"
✅ 好："看来你已经识别了主要因素，那基于这些参数，你会怎么设计自动控制的规则呢？"

❌ 差："好问题。若教室不同区域温度差异大，如何统一决策？"
✅ 好："这是个实际会遇到的情况。如果靠窗和靠门的位置温度差5度，你觉得系统应该以哪边为准？"`

  if (step === 4) {
    return (
      baseRules +
      `

【Step 4 特别要求】
- 聚焦在"提示词设计"而不是"节能方案"
- 当学生给出提示词示例时，评价其设计质量
- 从提示词的角度提问：角色、任务、背景、格式、约束
- 不要追问"哪个方案更好"、"温度多少合适"这类技术问题
- 引导学生思考：如何让普通用户更容易使用AI系统
- 评价标准：${currentStage.evaluationCriteria?.join('、') || '完整性和清晰度'}

【教室场景】40人/60㎡，夏季，外温22-35℃，空调3.2kW`
    )
  }

  if (step === 6) {
    return (
      baseRules +
      `

【Step 6 特别要求】
- 引导学生整合Step2-5的关键发现
- 识别前期讨论中的遗漏点和可优化之处
- 当学生表示"没有补充"或"可以开始"时，确认并鼓励生成方案
- 不要重复前面步骤已经详细讨论过的内容
- 聚焦在"完善整体方案"而非"重新讨论技术细节"

【教室场景】40人/60㎡，夏季，外温22-35℃，空调3.2kW`
    )
  }

  const stepSpecificGuidance = getStepSpecificGuidance(step, stage)
  return baseRules + '\n\n' + stepSpecificGuidance
}

function getStepSpecificGuidance(step, stage) {
  const stepGuidance = {
    2: {
      1: `【问题方向轮换】环境参数→人为因素→设备状态→外部条件→时间因素→空间布局
【推进重点】从单一参数监测转向多因素综合考虑`,
      2: `【问题方向轮换】触发条件→优先级排序→冲突处理→自动化程度→手动干预→故障预案
【推进重点】从简单if-then转向复杂决策逻辑`,
    },
    3: `【问题方向轮换】成本分析→效果评估→场景适用性→实施可行性→风险控制→组合优化
【推进重点】从策略罗列转向深度对比分析`,
    4: `【问题方向轮换】角色设定→任务描述→上下文信息→输出格式→约束条件→用户引导→场景适配
【推进重点】从功能需求转向提示词设计质量，评估：清晰性、具体性、结构化、可用性
【评价维度】
- 角色是否明确（专家身份）
- 任务是否清晰（做什么）
- 背景是否充分（教室情况）
- 格式是否明确（如何组织答案）
- 约束是否说明（预算、限制等）

【引导策略】
- 如果学生给出提示词示例，先评价其质量（指出优点和可改进之处）
- 然后从缺失要素或薄弱环节提出改进建议
- 避免追问节能方案的具体细节（那是Step 2/3的内容）
- 聚焦在"如何设计更好的提示词"而不是"如何解决节能问题"`,
    5: `【问题方向轮换】应急调整→资源调配→紧急措施→效果验证→经验总结→预案完善
【推进重点】从常规方案转向极端情况的创新适应`,
    6: `【问题方向轮换】前期总结→遗漏补充→优化改进→技术细节→用户体验→系统集成
【推进重点】从分散讨论转向整体方案整合与完善
【引导策略】
- 帮助学生回顾Step2-5的关键要点
- 识别尚未涉及或不够详细的部分
- 引导补充和优化建议
- 当学生准备好时，鼓励生成完整方案`,
    7: `【问题方向轮换】学习收获→能力提升→改进建议→未来规划→方法总结→经验分享
【推进重点】从完成任务转向深度反思和成长`,
  }

  return stepGuidance[step]?.[stage] || stepGuidance[step] || ''
}

function getGenericSystemPrompt(step) {
  return `你是一位善于启发思考的教学引导者，像朋友一样帮助学生深入思考Step${step}的学习内容。

【基本原则】
- 每个回复最多35字，聚焦核心问题
- 用自然、温和的语气，避免"质量高"、"正确"等评价词
- 根据学生回答推进思考深度
- 避免重复已讨论的内容
- 保持自然对话语调

【教室场景】40人/60㎡，夏季，外温22-35℃，空调3.2kW`
}

/* ============================== Step专用帮助提示词生成 ============================== */
function getStepSpecificHelpPrompt(step, helpType, actualInput) {
  // === Step 2: 问题分析阶段 ===
  if (step === 2) {
    const step2HelpPrompts = {
      refine: `学生希望你帮助完善当前的问题分析。
${actualInput ? `学生当前的输入：${actualInput}` : '学生当前输入框的内容需要完善。'}

请：
1. 用自然语气肯定学生的想法（5-8字）
2. 从问题分析的角度，指出1-2个可以补充的维度
3. 给出具体建议（控制在35字内）

直接输出帮助内容。`,

      example: `学生需要一个问题分析的参考示例（Step2）。
${actualInput ? `学生的问题：${actualInput}` : ''}

请：
1. 用自然语气回应（5-8字，如"给你举个例子"）
2. 提供一个问题分析的示例（不超过35字）
3. 示例要具体、可操作

示例格式（参考）：
"比如分析影响因素时：温度、湿度、CO2、人数密度、窗户朝向都会影响通风需求。"
或
"比如设计控制逻辑时：当温度超过28℃且CO2>800ppm时，优先开窗通风。"

根据学生当前所在阶段（因素识别或控制设计）给出合适的示例。
直接输出帮助内容。`,

      custom: `学生有关于问题分析的具体问题（Step2）。
学生的问题：${actualInput || '需要具体指导'}

请：
1. 直接回答学生的问题
2. 回答聚焦在问题分析（影响因素、控制逻辑）
3. 回答清晰、准确（控制在100字内）
4. 用自然友好的语气

直接输出帮助内容。`,

      general: `学生请求智能帮助（Step2问题分析）。
${actualInput ? `学生的输入：${actualInput}` : '学生点击了帮助按钮。'}

请：
1. 用自然语气回应（5-8字）
2. 从问题分析角度，提出引导性问题（25字内）
3. 引导学生思考：影响因素、控制逻辑、优先级

直接输出帮助内容。`,
    }
    return step2HelpPrompts[helpType] || step2HelpPrompts.general
  }

  // === Step 3: 策略设计阶段 ===
  if (step === 3) {
    const step3HelpPrompts = {
      refine: `学生希望你帮助完善当前的策略设计。
${actualInput ? `学生当前的输入：${actualInput}` : '学生当前输入框的内容需要完善。'}

请：
1. 用自然语气肯定学生的想法（5-8字）
2. 从策略设计的角度，指出1-2个可以深化的方面
3. 给出具体建议（控制在35字内）

直接输出帮助内容。`,

      example: `学生需要一个策略设计的参考示例（Step3）。
${actualInput ? `学生的问题：${actualInput}` : ''}

请：
1. 用自然语气回应（5-8字，如"给你举个例子"）
2. 提供一个策略对比分析的示例（不超过40字）
3. 示例要具体、可操作

示例格式（参考）：
"比如对比自然通风和空调：自然通风成本低但效果受限，空调效果稳定但能耗高，可根据温度分时使用。"

直接输出帮助内容。`,

      custom: `学生有关于策略设计的具体问题（Step3）。
学生的问题：${actualInput || '需要具体指导'}

请：
1. 直接回答学生的问题
2. 回答聚焦在策略设计（成本、效果、可行性、适用场景）
3. 回答清晰、准确（控制在100字内）
4. 用自然友好的语气

直接输出帮助内容。`,

      general: `学生请求智能帮助（Step3策略设计）。
${actualInput ? `学生的输入：${actualInput}` : '学生点击了帮助按钮。'}

请：
1. 用自然语气回应（5-8字）
2. 从策略设计角度，提出引导性问题（25字内）
3. 引导学生思考：成本、效果、可行性、风险

直接输出帮助内容。`,
    }
    return step3HelpPrompts[helpType] || step3HelpPrompts.general
  }

  // === Step 4: 提示词设计阶段 ===
  if (step === 4) {
    const step4HelpPrompts = {
      refine: `学生希望你帮助完善当前的提示词设计。
${actualInput ? `学生当前的输入：${actualInput}` : '学生当前输入框的内容需要完善。'}

请：
1. 用自然语气肯定学生的想法（5-8字）
2. 从提示词设计的角度，指出1-2个可以补充的要素
3. 给出具体建议（控制在35字内）
4. 聚焦在：角色、任务、背景、格式、约束这5个要素

直接输出帮助内容。`,

      example: `学生需要一个提示词设计的参考示例（Step4）。
${actualInput ? `学生的问题：${actualInput}` : ''}

请：
1. 用自然语气回应（5-8字，如"给你举个例子"）
2. 提供一个完整的提示词示例（包含角色、任务、背景、格式）
3. 示例要具体、可操作、不超过50字

示例格式（参考）：
"比如：你是教室节能专家。请根据40人、60㎡、35℃的教室，设计3个节能方案，按成本排序，每个方案包含措施和效果。"

直接输出帮助内容。`,

      custom: `学生有关于提示词设计的具体问题（Step4）。
学生的问题：${actualInput || '需要具体指导'}

请：
1. 直接回答学生的问题
2. 回答聚焦在提示词设计（角色、任务、背景、格式、约束）
3. 回答清晰、准确（控制在100字内）
4. 用自然友好的语气

直接输出帮助内容。`,

      general: `学生请求智能帮助（Step4提示词设计）。
${actualInput ? `学生的输入：${actualInput}` : '学生点击了帮助按钮。'}

请：
1. 用自然语气回应（5-8字）
2. 从提示词设计角度，提出引导性问题（25字内）
3. 引导学生思考：角色、任务、背景、格式、约束

直接输出帮助内容。`,
    }
    return step4HelpPrompts[helpType] || step4HelpPrompts.general
  }

  // === Step 5: 应急调整阶段 ===
  if (step === 5) {
    const step5HelpPrompts = {
      refine: `学生希望你帮助完善当前的应急方案。
${actualInput ? `学生当前的输入：${actualInput}` : '学生当前输入框的内容需要完善。'}

请：
1. 用自然语气肯定学生的想法（5-8字）
2. 从应急方案的角度，指出1-2个可以补充的方面
3. 给出具体建议（控制在35字内）

直接输出帮助内容。`,

      example: `学生需要一个应急方案的参考示例（Step5）。
${actualInput ? `学生的问题：${actualInput}` : ''}

请：
1. 用自然语气回应（5-8字，如"给你举个例子"）
2. 提供一个应急方案的示例（不超过35字）
3. 示例要具体、可操作

示例格式（参考）：
"比如：考试期间人数增多时，提前1小时预冷教室，考试时关闭空调开窗通风，保持静音。"

直接输出帮助内容。`,

      custom: `学生有关于应急方案的具体问题（Step5）。
学生的问题：${actualInput || '需要具体指导'}

请：
1. 直接回答学生的问题
2. 回答聚焦在应急方案（极端情况、创新措施、快速响应）
3. 回答清晰、准确（控制在100字内）
4. 用自然友好的语气

直接输出帮助内容。`,

      general: `学生请求智能帮助（Step5应急调整）。
${actualInput ? `学生的输入：${actualInput}` : '学生点击了帮助按钮。'}

请：
1. 用自然语气回应（5-8字）
2. 从应急方案角度，提出引导性问题（25字内）
3. 引导学生思考：极端情况、创新措施、实施可行性

直接输出帮助内容。`,
    }
    return step5HelpPrompts[helpType] || step5HelpPrompts.general
  }

  // === Step 6: 方案整合阶段 ===
  if (step === 6) {
    const step6HelpPrompts = {
      refine: `学生希望你帮助完善当前的方案整合。
${actualInput ? `学生当前的输入：${actualInput}` : '学生当前输入框的内容需要完善。'}

请：
1. 用自然语气肯定学生的想法（5-8字）
2. 从方案整合的角度，指出1-2个可以补充的方面
3. 给出具体建议（控制在35字内）

直接输出帮助内容。`,

      example: `学生需要一个方案整合的参考示例（Step6）。
${actualInput ? `学生的问题：${actualInput}` : ''}

请：
1. 用自然语气回应（5-8字，如"给你举个例子"）
2. 提供一个方案整合的示例（不超过40字）
3. 示例要具体、可操作

示例格式（参考）：
"比如整合前面的讨论：基于温度和CO2监测，优先自然通风，必要时空调辅助，极端情况预冷+分流。"

直接输出帮助内容。`,

      custom: `学生有关于方案整合的具体问题（Step6）。
学生的问题：${actualInput || '需要具体指导'}

请：
1. 直接回答学生的问题
2. 回答聚焦在方案整合（总结、补充、优化、完善）
3. 回答清晰、准确（控制在100字内）
4. 用自然友好的语气

直接输出帮助内容。`,

      general: `学生请求智能帮助（Step6方案整合）。
${actualInput ? `学生的输入：${actualInput}` : '学生点击了帮助按钮。'}

请：
1. 用自然语气回应（5-8字）
2. 从方案整合角度，提出引导性问题（25字内）
3. 引导学生思考：整合、补充、优化、完善

直接输出帮助内容。`,
    }
    return step6HelpPrompts[helpType] || step6HelpPrompts.general
  }

  // === 通用（其他步骤） ===
  const genericHelpPrompts = {
    refine: `学生希望你帮助完善当前的回答内容。
${actualInput ? `学生当前的输入：${actualInput}` : '学生当前输入框的内容需要完善。'}

请：
1. 用自然语气肯定学生的想法（5-8字）
2. 指出1-2个可以补充或深化的具体方面
3. 给出具体建议（控制在35字内）

直接输出帮助内容。`,

    example: `学生需要一个参考示例来启发思路。
${actualInput ? `学生的问题：${actualInput}` : ''}

请：
1. 用自然语气回应（5-8字，如"给你举个例子"）
2. 提供一个简洁实用的示例（不超过30字）
3. 示例要具体、可操作

直接输出帮助内容。`,

    custom: `学生有具体问题想咨询。
学生的问题：${actualInput || '需要具体指导'}

请：
1. 直接回答学生的问题
2. 回答清晰、准确（控制在100字内）
3. 用自然友好的语气

直接输出帮助内容。`,

    general: `学生请求智能帮助。
${actualInput ? `学生的输入：${actualInput}` : '学生点击了帮助按钮。'}

请：
1. 用自然语气回应（5-8字）
2. 提出引导性问题（25字内）
3. 基于对话历史，推进思考

直接输出帮助内容。`,
  }

  return genericHelpPrompts[helpType] || genericHelpPrompts.general
}

/* ============================== 用户提示词构建函数 ============================== */
function buildUserPrompt(userAnswer, step, stage, recentQuestions, conversationHistory = []) {
  const normalizedHistory = normalizeConversationHistory(conversationHistory)

  // 检测各种帮助请求类型
  const helpRequestPatterns = {
    refine: /^\[REFINE_CONTENT\]/,
    example: /^\[REQUEST_EXAMPLE\]/,
    custom: /^\[CUSTOM_QUESTION\]/,
    general: /^\[HELP_REQUEST\]|\[SMART_HELP_REQUEST\]/,
  }

  let helpType = null
  for (const [type, pattern] of Object.entries(helpRequestPatterns)) {
    if (pattern.test(userAnswer)) {
      helpType = type
      break
    }
  }

  // 如果是帮助请求，生成简化的提示
  if (helpType) {
    console.log(`🆘 检测到智能帮助请求，Step${step}，类型: ${helpType}`)
    const actualInput = userAnswer.replace(/^\[.*?\]/, '').trim()
    return getStepSpecificHelpPrompt(step, helpType, actualInput)
  }

  const recentContext = getRecentConversationContext(normalizedHistory, step, stage)

  // 检查是否需要阶段推进提示
  if (shouldCompleteStage(step, stage, normalizedHistory, userAnswer)) {
    const stageName = step === 2 && stage === 1 ? '关键影响因素' : '基本控制逻辑'
    const nextAction = step === 2 && stage === 1 ? '引导进入控制设计阶段' : '总结当前阶段，准备推进'

    return `学生回答："${userAnswer}"

这个回答已经包含了${stageName}。

要求：
1. 用自然语气确认学生的回答（8字内，如"看来你已经考虑得很全面"）
2. ${nextAction}(25字内)
3. 为下一步骤做铺垫`
  }

  // 检测学生困扰情绪
  const frustrated = ['重复', '已经说了', '不是回答过了吗', '为什么一直问'].some((signal) =>
    userAnswer.includes(signal),
  )

  if (frustrated) {
    return `学生对重复提问表示困扰："${userAnswer}"

要求：
1. 简短道歉并确认理解(8字内，如"抱歉，我理解了")
2. 立即转向全新分析角度(25字内)
3. 避免任何已讨论的话题`
  }

  // 检测是否有重复询问
  const hasRepeated = hasRepeatedQuestion(recentQuestions)
  if (hasRepeated) {
    return `学生回答："${userAnswer}"

注意：检测到重复询问问题，必须转向新角度

要求：用自然语气确认学生观点后，从新的维度提问(30字内)`
  }

  return buildStepSpecificPrompt(
    userAnswer,
    step,
    stage,
    recentQuestions,
    normalizedHistory,
    recentContext,
  )
}

/* ============================== 步骤专用提示词构建 ============================== */
function buildStepSpecificPrompt(
  userAnswer,
  step,
  stage,
  recentQuestions,
  conversationHistory = [],
  recentContext = { isEmpty: true },
) {
  const stepObj = STEP_OBJECTIVES[step]
  const currentStage = stepObj?.[stage] || stepObj

  const currentStageMessages = conversationHistory.filter(
    (m) => m.step === step && m.stage === stage,
  )
  const currentStageUserAnswers = currentStageMessages
    .filter((m) => m.type === 'user')
    .map((m) => m.content)

  const hasContext = currentStageUserAnswers.length > 0
  const contextInfo = hasContext
    ? `用户在本阶段已有${currentStageUserAnswers.length}次回答`
    : '用户首次回答本阶段问题'

  let conversationSummary = ''
  if (currentStageMessages.length > 0) {
    const recentDialogues = currentStageMessages.slice(-6)
    if (recentDialogues.length > 0) {
      conversationSummary = '\n\n【最近对话历史】\n'
      recentDialogues.forEach((msg, index) => {
        const speaker = msg.type === 'user' ? '👤学生' : '🤖AI'
        const content =
          msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content
        conversationSummary += `${speaker}: ${content}\n`
      })
      conversationSummary +=
        '\n注意：基于以上对话历史，确保你的提问是自然承接的，避免重复已讨论的内容。'
    }
  }

  let contextualInfo = contextInfo
  if (!recentContext.isEmpty && recentContext.lastAiMessage) {
    contextualInfo += `\n上一轮AI提问：${recentContext.lastAiMessage.substring(0, 50)}...`
  }

  // Step 6 特殊处理
  if (step === 6) {
    const step2to5Messages = conversationHistory.filter(
      (msg) => msg.step >= 2 && msg.step <= 5 && msg.type === 'user',
    )
    const hasRichHistory = step2to5Messages.length > 5

    if (hasRichHistory) {
      contextualInfo += `\n学生已完成Step2-5的讨论，现在进行方案整合和补充`
    }

    return `学生回答："${userAnswer}"

【当前目标】${currentStage.focus}
【上下文】${contextualInfo}
${conversationSummary}
【对话连贯要求】基于学生的回答内容和前面步骤的讨论，给出自然承接的引导

【引导要求 - 语气非常重要】
1. 用自然语气确认学生观点（5-8字，如"看来你想得很周到"）
2. 结合前面步骤的分析，提出整合性问题（25字内）
3. 引导学生思考如何完善整体方案
4. 保持对话的自然流畅性，像朋友间的讨论

${hasRichHistory ? '提示：学生已在Step2-5中讨论了因素识别、策略设计、提示词、应急模式，现在应引导其进行整合和优化。' : ''}`
  }

  // Step 4 特殊处理
  if (step === 4) {
    const isPromptExample =
      userAnswer.length > 30 &&
      (/你是|请|帮助|分析|给出/.test(userAnswer) || /专家|角色/.test(userAnswer))

    if (isPromptExample) {
      return `学生提供了一个提示词示例："${userAnswer}"

【当前目标】${currentStage.focus}
【上下文】${contextualInfo}
${conversationSummary}

【Step 4 特别要求 - 语气非常重要】
1. 用自然语气评价这个提示词的优点（5-8字，如"这个角色设定很明确"）
2. 从提示词设计的角度，指出一个可以改进的方面（25字内）
3. 评价维度：角色设定、任务描述、背景信息、输出格式、约束条件
4. 不要追问节能方案的细节，聚焦在提示词设计本身
5. 保持对话的自然流畅性

示例语气：
❌ "提示词质量高。建议：补充输出格式要求。"
✅ "角色和任务都很清楚，如果能明确一下希望AI怎么组织回答就更好了。"`
    }
  }

  // Step 5 特殊处理
  if (step === 5) {
    return `学生回答："${userAnswer}"

【当前目标】${currentStage.focus}
【情境】极端情况：60人 + 37℃ + 考试环境
【上下文】${contextualInfo}
${conversationSummary}
【对话连贯要求】基于学生的具体回答内容，给出自然承接的引导

【引导要求 - 语气非常重要】
1. 用自然语气确认学生的应急方案（5-8字，如"这个想法挺实用"）
2. 基于学生提到的具体措施，提出深化思考的问题（25字内）
3. 引导学生考虑：静音需求、成本控制、实施可行性、效果评估
4. 保持对话的自然流畅性，避免重复已讨论的内容

示例语气：
❌ "方案可行。下一步：考虑成本因素。"
✅ "预冷策略听起来不错，这样操作的话电费开支会增加多少呢？"`
  }

  // 通用提示词
  return `学生回答："${userAnswer}"

【当前目标】${currentStage.focus}
【上下文】${contextualInfo}
${conversationSummary}
【对话连贯要求】基于学生的回答内容，给出自然承接的引导

【引导要求 - 语气非常重要】
1. 用自然语气确认学生观点（5-8字，如"有道理"、"这个角度不错"）
2. 基于学生具体回答内容，提出深化思考的问题（25字内）
3. 确保问题推进整体解决方案的完整性
4. 保持对话的自然流畅性，像朋友间的讨论

示例语气：
❌ "回答全面。下一步：设计控制逻辑。"
✅ "看来你已经想到了主要因素，那基于这些，你会怎么设计自动控制呢？"
${step === 4 ? '5. Step 4特别：聚焦提示词设计质量，而非节能技术方案' : ''}
${step === 6 ? '5. Step 6特别：引导学生整合前面步骤的分析，完善整体方案' : ''}

【避免】
- 不要重复已讨论过的问题
- 不要忽略学生刚才提到的具体内容
- 不要突然跳转到完全无关的话题
- 不要用"质量高"、"正确"、"很好"等评价词`
}

/* ============================== 辅助函数 ============================== */
function extractDiscussedTopics(recentQuestions) {
  const topicKeywords = {
    温度: ['温度', '度数', '℃'],
    湿度: ['湿度', '%'],
    'CO₂': ['co2', '二氧化碳', 'ppm'],
    人数: ['人数', '人员', '密度'],
    通风设备: ['风扇', '排风', '通风'],
    空调: ['空调', '制冷'],
    开窗: ['开窗', '窗户'],
    节能: ['节能', '能耗', '电费'],
    提示词: ['提示词', '模板', '设计'],
    应急: ['应急', '紧急', '故障'],
    优化: ['优化', '改进', '提升'],
    整合: ['整合', '综合', '完整'],
  }

  const discussedTopics = []
  const questionsText = recentQuestions.toLowerCase()

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some((keyword) => questionsText.includes(keyword))) {
      discussedTopics.push(topic)
    }
  })

  return discussedTopics
}

function buildEnhancedSystemPrompt(step, stage, userAnswer, context) {
  let systemPrompt = getSocraticSystemPrompt(step, stage)

  systemPrompt += `\n\n【教室场景】40人/60㎡，夏季，外温22-35℃，空调3.2kW`

  if (context.isExam || context.requireQuiet) {
    systemPrompt += `\n\n【特殊约束】考试环境，优先静音方案`
  }

  if (context.recentQuestions) {
    const discussedTopics = extractDiscussedTopics(context.recentQuestions)
    if (discussedTopics.length > 0) {
      systemPrompt += `\n\n【避免重复】已讨论：${discussedTopics.join('、')}，必须转向新角度`
    }
  }

  if (context.needsContinuity) {
    systemPrompt += `\n\n【连贯性要求】必须基于学生的具体回答内容进行自然承接，避免突兀的话题跳转`
  }

  return systemPrompt
}

function getFallbackResponse(step, stage = 1) {
  const fallbackResponses = {
    2: {
      1: '除了环境参数，还有哪些人为因素影响通风需求？',
      2: '多个因素同时触发时，如何设定处理优先级？',
    },
    3: '这两个策略在极端天气下还有效吗？',
    4: '这个提示词如果给非专业用户用，他们能理解吗？',
    5: '除了调整设备参数，还有什么创新的应急措施？',
    6: '回顾前面的讨论，还有哪些要点需要补充或强调？',
    7: '通过这次学习，你觉得自己哪方面能力提升最大？',
  }

  return fallbackResponses[step]?.[stage] || fallbackResponses[step] || '请继续分享你的想法。'
}

/* ============================== 主处理函数 ============================== */
export default async function handler(req, res) {
  console.log('🚀 增强版API handler 开始执行 (v4 - 清理并修复)')
  console.log('📥 请求方法:', req.method)

  // CORS设置
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Experiment-ID',
  )

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS 请求处理完成')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    console.log('❌ 非POST请求')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      userAnswer,
      userInput,
      answer,
      context = {},
      step,
      stage,
      sessionId,
      followUpContext,
      conversationHistory = [],
    } = req.body

    const actualUserInput = userAnswer || userInput || answer

    if (!actualUserInput?.trim()) {
      return res.status(400).json({ error: '用户回答不能为空' })
    }

    const stepNum = parseInt(step)
    const stageNum = stage ? parseInt(stage) : undefined

    if (![2, 3, 4, 5, 6, 7].includes(stepNum)) {
      return res.status(400).json({ error: '无效的步骤参数' })
    }

    if (stepNum === 2 && stageNum && (stageNum < 1 || stageNum > 2)) {
      return res.status(400).json({ error: 'Step2的阶段参数必须为1-2' })
    }

    console.log(`🎯 处理 Step${stepNum}${stageNum ? `-Stage${stageNum}` : ''}`)
    console.log(
      `👤 用户回答: "${actualUserInput.substring(0, 50)}${actualUserInput.length > 50 ? '...' : ''}"`,
    )
    console.log(`📚 对话历史记录数: ${conversationHistory.length}`)

    const normalizedHistory = normalizeConversationHistory(conversationHistory)
    const recentQuestions = context.recentQuestions || ''

    const enhancedContext = {
      ...context,
      needsContinuity: followUpContext?.needsContinuity || true,
      previousUserAnswers: followUpContext?.previousUserAnswers || [],
      stageProgress: followUpContext?.stageProgress || {},
    }

    const systemPrompt = buildEnhancedSystemPrompt(
      stepNum,
      stageNum,
      actualUserInput,
      enhancedContext,
    )

    const userPrompt = buildUserPrompt(
      actualUserInput,
      stepNum,
      stageNum,
      recentQuestions,
      normalizedHistory,
    )

    console.log(`🤖 调用增强版AI引导`)
    console.log(`📝 系统提示词长度: ${systemPrompt.length}`)
    console.log(`📝 用户提示词: ${userPrompt.substring(0, 150)}...`)

    // Step4 特殊处理
    if (stepNum === 4 && !actualUserInput.startsWith('[')) {
      console.log('🧪 Step4 - 进入提示词测试与评估流程')

      const conversationCount =
        followUpContext?.conversationCount ||
        normalizedHistory.filter((m) => m.step === 4 && m.type === 'user').length

      const progress = analyzeStep4Progress(
        normalizedHistory.filter((m) => m.type === 'user'),
        actualUserInput.toLowerCase(),
      )

      const generatedSolution = await testPromptAndGenerate(actualUserInput)
      const evaluation = evaluatePromptQuality(actualUserInput, progress)
      const combinedResponse = generateStep4CombinedResponse(
        generatedSolution,
        evaluation,
        conversationCount,
      )

      console.log('✅ Step4 - 组合响应生成完成')

      const responseData = {
        response: combinedResponse,
        metadata: {
          step: stepNum,
          stage: stageNum || null,
          responseLength: combinedResponse.length,
          processingTime: new Date().toISOString(),
          guidanceMode: 'step4_prompt_test_and_feedback',
          promptQuality: {
            score: evaluation.score,
            maxScore: 5,
            strengths: evaluation.strengths.length,
            weaknesses: evaluation.weaknesses.length,
          },
          generatedSolutionLength: generatedSolution.length,
          conversationCount,
          version: 'step4_v2',
        },
      }

      res.status(200).json(responseData)

      setImmediate(async () => {
        try {
          await saveConversationToDatabase({
            sessionId,
            stepNum,
            stageNum,
            userAnswer: actualUserInput,
            aiResponse: combinedResponse,
            context: {
              ...context,
              step4PromptTest: {
                generatedSolution,
                evaluation,
                conversationCount,
              },
            },
            followUpContext,
            tokenUsage: null,
            conversationHistory: normalizedHistory.slice(-5),
            suggestsCompletion: evaluation.score >= 4,
            helpType: null,
          })
          console.log('✅ Step4 - 数据库异步保存完成')
        } catch (dbError) {
          console.error('❌ Step4 - 数据库保存失败:', dbError)
        }
      })

      return
    }

    // 构建messages
    const messages = [{ role: 'system', content: systemPrompt }]

    const currentStageHistory = normalizedHistory
      .filter((msg) => msg.step === stepNum && msg.stage === stageNum)
      .slice(-10)

    console.log(
      `📝 当前阶段(Step${stepNum}${stageNum ? `-Stage${stageNum}` : ''})的历史: ${currentStageHistory.length}条`,
    )

    currentStageHistory.forEach((msg, idx) => {
      messages.push({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })
      console.log(`  ${idx + 1}. [${msg.type}] ${msg.content.substring(0, 30)}...`)
    })

    messages.push({ role: 'user', content: userPrompt })

    console.log(
      `📨 最终messages数组: ${messages.length}条 (system: 1, history: ${currentStageHistory.length}, current: 1)`,
    )

    // 调用 DeepSeek API
    const openaiResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 150,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.6,
        presence_penalty: 0.4,
        stream: false,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('❌ DeepSeek API错误:', errorData)
      throw new Error(`DeepSeek API Error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const aiData = await openaiResponse.json()
    let aiResponse = aiData.choices?.[0]?.message?.content?.trim()

    if (!aiResponse) {
      throw new Error('AI响应为空')
    }

    // 清理格式标签
    if (aiResponse.includes('<thinking>') || aiResponse.includes('<response>')) {
      const responseMatch = aiResponse.match(/<response>([\s\S]*?)<\/response>/)
      if (responseMatch) {
        aiResponse = responseMatch[1].trim()
      }
    }

    console.log('✅ AI回复:', aiResponse)

    const suggestsCompletion = shouldCompleteStage(
      stepNum,
      stageNum,
      normalizedHistory,
      actualUserInput,
    )

    const helpType = actualUserInput.match(/^\[(REFINE_CONTENT|REQUEST_EXAMPLE|CUSTOM_QUESTION)\]/)
      ? actualUserInput.match(/^\[(REFINE_CONTENT|REQUEST_EXAMPLE|CUSTOM_QUESTION)\]/)[1]
      : actualUserInput.match(/^\[(HELP_REQUEST|SMART_HELP_REQUEST)\]/)
        ? 'GENERAL'
        : null

    const responseData = {
      response: aiResponse,
      metadata: {
        step: stepNum,
        stage: stageNum || null,
        responseLength: aiResponse.length,
        tokenUsage: aiData.usage,
        processingTime: new Date().toISOString(),
        guidanceMode: 'enhanced_v4',
        discussedTopics: extractDiscussedTopics(recentQuestions),
        isSmartHint: !!helpType,
        helpType: helpType || null,
        suggestsCompletion,
        historyLength: conversationHistory.length,
        currentStageHistoryLength: currentStageHistory.length,
        version: 'v4_cleaned_and_fixed',
      },
    }

    res.status(200).json(responseData)

    setImmediate(async () => {
      try {
        await saveConversationToDatabase({
          sessionId,
          stepNum,
          stageNum,
          userAnswer: actualUserInput,
          aiResponse,
          context: enhancedContext,
          followUpContext,
          tokenUsage: aiData.usage,
          conversationHistory: normalizedHistory.slice(-5),
          suggestsCompletion,
          helpType,
        })
        console.log('✅ 数据库异步保存完成')
      } catch (dbError) {
        console.error('❌ 数据库保存失败:', dbError)
      }
    })
  } catch (error) {
    console.error('❌ API处理错误:', error)
    const fallbackResponse = getFallbackResponse(
      parseInt(req.body?.step),
      parseInt(req.body?.stage),
    )

    res.status(500).json({
      error: '服务暂时不可用，请稍后重试',
      response: fallbackResponse,
      metadata: {
        step: req.body?.step,
        stage: req.body?.stage || null,
        isFallback: true,
        timestamp: new Date().toISOString(),
      },
    })
  }
}

/* ============================== 数据库保存辅助函数 ============================== */
async function saveConversationToDatabase({
  sessionId,
  stepNum,
  stageNum,
  userAnswer,
  aiResponse,
  context,
  followUpContext,
  tokenUsage,
  conversationHistory,
  suggestsCompletion,
  helpType,
}) {
  const client = await connectToDatabase()
  const db = client.db('llm_learning')
  const collection = db.collection('conversations')

  const document = {
    sessionId,
    step: stepNum,
    stage: stageNum || null,
    userInput: userAnswer,
    aiResponse,
    context,
    timestamp: new Date(),
    metadata: {
      scenario: 'enhanced_v4',
      tokenUsage,
      guidanceMode: 'socratic_v4',
      isSmartHint: !!helpType,
      helpType: helpType || null,
      suggestsCompletion,
      stageInfo:
        stepNum === 2 && stageNum
          ? {
              currentStage: stageNum,
              totalStages: 2,
              stageName: STEP_OBJECTIVES[2][stageNum]?.focus,
              stageGoal: STEP_OBJECTIVES[2][stageNum]?.goal,
            }
          : null,
      contextInfo: {
        followUp: followUpContext || null,
        recentConversation: conversationHistory || [],
        version: 'v4_cleaned_and_fixed',
      },
    },
  }

  const result = await collection.insertOne(document)
  return result.insertedId
}
