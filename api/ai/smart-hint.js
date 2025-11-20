// api/ai/smart-hint.js
// 整合的智能提示API - 支持不同步骤的针对性帮助
import { MongoClient } from 'mongodb'

let cachedClient = null

async function connectToDatabase() {
  if (cachedClient) return cachedClient

  try {
    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    cachedClient = client
    return client
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error)
    throw error
  }
}

export default async function handler(req, res) {
  console.log('💡 智能提示API开始处理')

  // CORS设置
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      sessionId,
      step,
      stage,
      currentInput = '',
      conversationHistory = [],
      context = {},
    } = req.body

    // 参数验证
    if (!sessionId || !step) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    const stepNum = parseInt(step)
    console.log(`🎯 为Step${stepNum}${stage ? `-Stage${stage}` : ''}生成智能提示`)
    console.log(`📊 对话历史: ${conversationHistory.length}条, 当前输入: "${currentInput}"`)

    // 根据步骤选择分析方法
    const analysis =
      stepNum === 3
        ? analyzeStep3Conversation(conversationHistory, currentInput)
        : analyzeConversation(conversationHistory, stepNum, stage, currentInput)

    // 构建智能提示的系统提示词
    const systemPrompt = buildSmartHintSystemPrompt(stepNum, stage, analysis)

    // 构建用户提示词
    const userPrompt = buildSmartHintUserPrompt(
      conversationHistory,
      currentInput,
      analysis,
      stepNum,
    )

    console.log('🤖 调用OpenAI API生成智能提示')

    // 调用OpenAI API https://api.openai.com/v1/chat/completions
    // 调用deepseek API
    const openaiResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',  // 或使用 'deepseek-reasoner'
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: stepNum === 3 ? 120 : 150,
        temperature: stepNum === 3 ? 0.8 : 0.7,
        frequency_penalty: 0.5,
        presence_penalty: 0.3,
        stream: false,  // 非流式输出
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      // 建议更新错误提示
      console.error('❌ DeepSeek API错误:', errorData)
      throw new Error(`DeepSeek API Error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const aiData = await openaiResponse.json()
    let hint = aiData.choices?.[0]?.message?.content?.trim()

    if (!hint) {
      throw new Error('AI响应为空')
    }

    // 清理格式标签
    hint = hint.replace(/<[^>]*>/g, '').trim()

    console.log('✅ 智能提示生成:', hint)

    // 构建响应
    const responseData = {
      hint,
      analysis:
        stepNum === 3
          ? {
              strategiesIdentified: analysis.strategiesIdentified,
              analysisDepth: analysis.analysisDepth,
              missingDimensions: analysis.missingDimensions,
              comparisonLevel: analysis.comparisonLevel,
            }
          : {
              conversationLength: conversationHistory.length,
              currentStage: stage,
              missingTopics: analysis.missingTopics,
              studentProgress: analysis.studentProgress,
            },
      metadata: {
        step: stepNum,
        stage,
        timestamp: new Date().toISOString(),
        type: stepNum === 3 ? 'step3_strategy_hint' : 'smart_contextual_hint',
      },
    }

    res.status(200).json(responseData)

    // 异步保存提示请求记录
    setImmediate(async () => {
      try {
        await logSmartHint(sessionId, stepNum, stage, conversationHistory, hint)
        console.log('✅ 智能提示记录保存完成')
      } catch (error) {
        console.error('❌ 智能提示记录保存失败:', error)
      }
    })
  } catch (error) {
    console.error('❌ 智能提示生成失败:', error)

    // 返回备用提示
    const fallbackHint = getFallbackHint(parseInt(req.body?.step), parseInt(req.body?.stage))

    res.status(200).json({
      hint: fallbackHint,
      analysis: null,
      metadata: {
        step: req.body?.step,
        stage: req.body?.stage,
        isFallback: true,
        error: '智能分析暂时不可用',
        timestamp: new Date().toISOString(),
      },
    })
  }
}

// Step2的对话分析（原有逻辑）
function analyzeConversation(conversationHistory, step, stage, currentInput) {
  const userMessages = conversationHistory.filter((msg) => msg.type === 'user')
  const aiMessages = conversationHistory.filter((msg) => msg.type === 'ai')

  // 分析学生回答的话题覆盖
  const allUserContent = userMessages
    .map((msg) => msg.content)
    .join(' ')
    .toLowerCase()

  // 根据不同阶段定义关键话题
  const stageTopics = {
    1: ['温度', '湿度', 'co2', '人数', '密度', '通风', '节能', '环境', '监测', '舒适'],
    2: ['控制', '规则', '条件', '自动', '开窗', '空调', '温度', '湿度', '阈值', '逻辑'],
    3: ['界面', '显示', '用户', '操作', '状态', '信息', '提示', '反馈', '可视化', '体验'],
  }

  const relevantTopics = stageTopics[stage] || []
  const coveredTopics = relevantTopics.filter((topic) => allUserContent.includes(topic))
  const missingTopics = relevantTopics.filter((topic) => !allUserContent.includes(topic))

  // 分析学生进度
  const avgMessageLength =
    userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / (userMessages.length || 1)
  const hasDetailedThinking = userMessages.some(
    (msg) => msg.content.length > 50 && /因为|所以|比如|例如|具体|详细/.test(msg.content),
  )

  let studentProgress = 'beginning'
  if (avgMessageLength > 80 && hasDetailedThinking) studentProgress = 'advanced'
  else if (avgMessageLength > 40) studentProgress = 'moderate'
  else if (avgMessageLength < 15) studentProgress = 'struggling'

  // 分析是否卡顿
  const isStuck = userMessages
    .slice(-2)
    .some(
      (msg) => msg.content.length < 15 || /不知道|想不出|不确定|应该|大概|也许/.test(msg.content),
    )

  return {
    conversationLength: conversationHistory.length,
    userMessageCount: userMessages.length,
    aiMessageCount: aiMessages.length,
    coveredTopics,
    missingTopics,
    studentProgress,
    isStuck,
    avgMessageLength,
    currentInputLength: currentInput.length,
    lastUserMessage: userMessages[userMessages.length - 1]?.content || '',
  }
}

// Step3专用对话分析
function analyzeStep3Conversation(conversationHistory, currentInput) {
  const userMessages = conversationHistory.filter((msg) => msg.type === 'user')
  const allUserContent = userMessages
    .map((msg) => msg.content)
    .join(' ')
    .toLowerCase()

  // 识别策略类型
  const strategyKeywords = {
    自然通风: ['自然通风', '开窗', '窗户', '自然风', '通风窗'],
    空调控制: ['空调', '制冷', '调温', '温控', '冷气'],
    时间管理: ['时间', '分时', '错峰', '时段', '定时'],
    人员管理: ['人员', '分批', '分组', '轮换', '分流'],
    设备优化: ['设备', '风扇', '排风', '新风', '换气'],
    温度分区: ['分区', '区域', '局部', '定向', '重点'],
  }

  const strategiesIdentified = []
  Object.entries(strategyKeywords).forEach(([strategy, keywords]) => {
    if (keywords.some((keyword) => allUserContent.includes(keyword))) {
      strategiesIdentified.push(strategy)
    }
  })

  // 分析维度覆盖
  const analysisDimensions = {
    成本分析: ['成本', '费用', '价格', '经济', '投资', '预算'],
    效果评估: ['效果', '效率', '节能', '降温', '改善'],
    适用性分析: ['适用', '条件', '环境', '场景', '情况'],
    可行性评估: ['可行', '实现', '操作', '实施', '执行'],
    风险评估: ['风险', '问题', '困难', '挑战', '限制'],
  }

  const coveredDimensions = []
  const missingDimensions = []

  Object.entries(analysisDimensions).forEach(([dimension, keywords]) => {
    if (keywords.some((keyword) => allUserContent.includes(keyword))) {
      coveredDimensions.push(dimension)
    } else {
      missingDimensions.push(dimension)
    }
  })

  // 判断比较分析水平
  const hasComparison = /比较|对比|相比|vs|优于|劣于|更好|更差/.test(allUserContent)
  const hasQuantification = /\d+%|百分比|倍|程度|大幅|显著/.test(allUserContent)

  let comparisonLevel = 'none'
  if (hasComparison && hasQuantification) comparisonLevel = 'quantified'
  else if (hasComparison) comparisonLevel = 'qualitative'

  // 分析深度
  const avgLength =
    userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / (userMessages.length || 1)
  const hasReasoning = /因为|所以|导致|由于|如果|那么/.test(allUserContent)

  let analysisDepth = 'shallow'
  if (avgLength > 100 && hasReasoning) analysisDepth = 'deep'
  else if (avgLength > 50 || hasReasoning) analysisDepth = 'moderate'

  return {
    strategiesIdentified,
    coveredDimensions,
    missingDimensions: missingDimensions.slice(0, 3),
    comparisonLevel,
    analysisDepth,
    conversationLength: conversationHistory.length,
    currentInputLength: currentInput.length,
  }
}

// 构建系统提示词（支持不同步骤）
function buildSmartHintSystemPrompt(step, stage, analysis) {
  if (step === 3) {
    // Step3专用系统提示词
    return `你是策略分析专家，专门帮助学生深入分析通风节能策略的优缺点。

【当前任务】策略论证与比较分析阶段
- 目标: 评估不同节能策略的效果、成本、适用性、可行性
- 场景: 40人教室，60㎡，夏季35℃，3.2kW空调

【学生当前状态】
- 已识别策略: ${analysis.strategiesIdentified.join('、') || '较少'}
- 已分析维度: ${analysis.coveredDimensions.join('、') || '基础层面'}
- 待深化维度: ${analysis.missingDimensions.join('、') || '无'}
- 比较分析水平: ${analysis.comparisonLevel}
- 分析深度: ${analysis.analysisDepth}

【提示原则】
1. 引导学生进行多维度对比分析，而非简单罗列
2. 重点关注策略的权衡取舍(trade-off)
3. 鼓励量化分析和具体场景应用
4. 语言简洁，控制在25字内
5. 避免重复学生已充分分析的维度

【回复格式】直接给出分析建议，聚焦策略比较`
  }

  // Step2原有逻辑
  const basePrompt = `你是教学助手，帮助学生思考通风节能方案设计问题。

【当前任务】Step${step}${stage ? `-Stage${stage}` : ''}: ${getStageDescription(step, stage)}

【学生当前状态】
- 对话轮数: ${analysis.userMessageCount}
- 回答深度: ${analysis.studentProgress}
- 已涵盖话题: ${analysis.coveredTopics.join('、') || '较少'}
- 待探索话题: ${analysis.missingTopics.slice(0, 3).join('、') || '无'}
${analysis.isStuck ? '- ⚠️ 学生可能遇到思维障碍' : ''}

【提示原则】
1. 基于学生已有想法，给出具体的下一步思考建议
2. 优先引导学生思考遗漏的重要方面
3. 语言简洁友好，控制在30字以内
4. 不要重复学生已经充分讨论的内容
5. 聚焦通风节能主题，避免偏离

【回复格式】直接给出提示建议，不要解释或总结`

  return basePrompt
}

// 构建用户提示词（支持不同步骤）
function buildSmartHintUserPrompt(conversationHistory, currentInput, analysis, step) {
  const recentMessages = conversationHistory.slice(step === 3 ? -4 : -6)
  const conversationSummary = recentMessages
    .map(
      (msg) =>
        `${msg.type === 'user' ? '学生' : 'AI'}: ${msg.content.substring(0, step === 3 ? 100 : 200)}`,
    )
    .join('\n')

  let prompt = `【最近对话】\n${conversationSummary}\n\n`

  if (currentInput.trim()) {
    prompt += `【学生当前输入】${currentInput}\n\n`
  }

  if (step === 3) {
    // Step3专用提示策略
    if (analysis.strategiesIdentified.length < 2) {
      prompt += `【情况】学生策略数量不足，需要引导提出更多策略选项\n`
    } else if (analysis.missingDimensions.length > 2) {
      prompt += `【建议方向】引导分析: ${analysis.missingDimensions[0]}或${analysis.missingDimensions[1]}\n`
    } else if (analysis.comparisonLevel === 'none') {
      prompt += `【情况】缺乏对比分析，需要引导比较不同策略的优劣\n`
    } else if (analysis.analysisDepth === 'shallow') {
      prompt += `【情况】分析较浅，需要引导更深入的原因分析和量化评估\n`
    } else {
      prompt += `【情况】分析较好，可以引导考虑策略组合或极端情况应对\n`
    }
  } else {
    // Step2原有逻辑
    if (analysis.isStuck) {
      prompt += `【情况】学生似乎遇到思维障碍，需要换个角度启发\n`
    } else if (analysis.missingTopics.length > 0) {
      prompt += `【建议方向】引导学生思考: ${analysis.missingTopics.slice(0, 2).join('或')}\n`
    } else if (analysis.studentProgress === 'advanced') {
      prompt += `【情况】学生思考较深入，可以提供更高层次的引导\n`
    } else {
      prompt += `【情况】基于当前进展，提供合适的推进建议\n`
    }
  }

  prompt += `\n请给出${step === 3 ? '策略分析' : '针对性学习'}提示:`

  return prompt
}

// 获取阶段描述
function getStageDescription(step, stage) {
  const descriptions = {
    2: {
      1: '识别影响通风节能的关键因素',
      2: '设计自动通风控制逻辑',
      3: '设计用户界面和交互方式',
    },
    3: '深入分析通风策略的优缺点',
    4: '设计极端情况的应急通风方案',
  }

  return descriptions[step]?.[stage] || descriptions[step] || '继续学习思考'
}

// 备用提示（支持不同步骤）
function getFallbackHint(step, stage) {
  if (step === 3) {
    const step3Fallbacks = [
      '试着比较不同策略的成本效益和适用场景',
      '这两个策略在极端天气下还有效吗？',
      '如何量化评估这些策略的实际节能效果？',
      '实施时可能遇到什么意想不到的障碍？',
      '这些策略能否组合使用？会产生什么协同效应？',
    ]
    return step3Fallbacks[Math.floor(Math.random() * step3Fallbacks.length)]
  }

  const fallbacks = {
    2: {
      1: '从环境监测的角度，你觉得还有哪些因素会影响通风效果？',
      2: '如果温度和CO2同时超标，系统应该如何智能决策？',
      3: '想象你在使用这个系统，最希望看到什么信息？',
    },
    4: '如果设备突然故障，你会采取什么应急通风措施？',
  }

  return fallbacks[step]?.[stage] || fallbacks[step] || '继续思考，你一定能想出好方案！'
}

// 记录智能提示
async function logSmartHint(sessionId, step, stage, conversationHistory, hint) {
  try {
    const client = await connectToDatabase()
    const db = client.db('llm_learning')
    const collection = db.collection('smart_hints')

    await collection.insertOne({
      sessionId,
      step,
      stage,
      conversationHistoryLength: conversationHistory.length,
      generatedHint: hint,
      timestamp: new Date(),
      metadata: {
        hintType: step === 3 ? 'step3_strategy_hint' : 'contextual_smart_hint',
        version: 'integrated_v1.0',
      },
    })
  } catch (error) {
    console.error('记录智能提示失败:', error)
  }
}
