// api/ai/generate-evaluation.js - 更新版本适配新步骤结构
import { MongoClient } from 'mongodb'

let cachedClient = null

async function connectToDatabase() {
  if (cachedClient) {
    console.log('✅ 使用缓存的数据库连接')
    return cachedClient
  }

  try {
    console.log('🔌 创建新的 MongoDB 连接...')
    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    })
    await client.connect()
    cachedClient = client
    console.log('✅ MongoDB 连接成功')
    return client
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error)
    throw error
  }
}

// 获取对话历史 - 更新为Step2-6的所有记录
async function getConversationHistory(sessionId) {
  try {
    console.log('🔍 开始查询对话历史，SessionID:', sessionId)

    const client = await connectToDatabase()
    const db = client.db('llm_learning')
    const collection = db.collection('conversations')

    const allRecords = await collection.find({ sessionId }).toArray()
    console.log('🗂️ 该 SessionID 的所有记录:', allRecords.length)

    // 更新：查询Step2-6的所有对话记录
    const conversations = await collection
      .find({
        sessionId,
        $or: [
          { step: { $in: [2, 3, 4, 5, 6] } }, // 数字类型
          { step: { $in: ['2', '3', '4', '5', '6'] } }, // 字符串类型
        ],
      })
      .sort({ step: 1, timestamp: 1 }) // 按步骤和时间排序
      .toArray()

    console.log('✅ 过滤后的对话记录:', conversations.length)

    // 按步骤分组整理对话记录
    return conversations.map((conv) => ({
      role: 'student',
      step: parseInt(conv.step),
      message: `Step${conv.step}: ${conv.userInput}`,
      aiResponse: conv.aiResponse,
      timestamp: conv.timestamp,
    }))
  } catch (error) {
    console.error('❌ 获取对话历史失败:', error)
    return []
  }
}

// 重新设计的AI评估生成函数 - 适配新步骤结构
async function generateEvaluationWithAI(conversationHistory, reflectionAnswer, experimentType) {
  console.log('🤖 开始调用 AI 生成评估')

  // 按步骤整理对话内容
  const stepGroups = {
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  }

  conversationHistory.forEach((conv) => {
    if (stepGroups[conv.step]) {
      stepGroups[conv.step].push(conv)
    }
  })

  const prompt = `你是专业的教育评估专家，需要从四个关键能力维度来评估学生在智能通风节能系统设计实验中的表现。

学生的分阶段学习过程：

Step2 - 问题分析阶段（因素识别与控制设计）：
${stepGroups[2].map((conv) => `学生：${conv.message.replace('Step2: ', '')}\nAI：${conv.aiResponse}`).join('\n\n')}

Step3 - 策略论证阶段（方案比较与分析）：
${stepGroups[3].map((conv) => `学生：${conv.message.replace('Step3: ', '')}\nAI：${conv.aiResponse}`).join('\n\n')}

Step4 - 提示词设计阶段（用户交互界面）：
${stepGroups[4].map((conv) => `学生：${conv.message.replace('Step4: ', '')}\nAI：${conv.aiResponse}`).join('\n\n')}

Step5 - 应急处理阶段（极端情况应对）：
${stepGroups[5].map((conv) => `学生：${conv.message.replace('Step5: ', '')}\nAI：${conv.aiResponse}`).join('\n\n')}

Step6 - 方案优化阶段（系统完善与改进）：
${stepGroups[6].map((conv) => `学生：${conv.message.replace('Step6: ', '')}\nAI：${conv.aiResponse}`).join('\n\n')}

学生的自我反思：
${reflectionAnswer}

请从以下四个维度分别进行分析评估：

维度一：问题识别与信息整合
- 评估要点：学生是否能准确识别教室环境问题？是否能从多个信息源中提取关键信息？
- 重点关注Step2中学生对环境因素识别和控制逻辑的分析
- Level 1: 能识别基本问题
- Level 2: 能识别问题并提取多源信息
- Level 3: 能深度分析问题间的关联性

维度二：策略制定与执行
- 评估要点：学生是否能提出多个可行策略？是否考虑了不同情境下的适用性？
- 重点关注Step3策略论证和Step5应急处理中的方案设计
- Level 1: 能提出基本策略
- Level 2: 能提出2个以上策略并考虑情境变化
- Level 3: 策略全面且具有创新性和可操作性

维度三：元认知与反思
- 评估要点：学生是否具有学习过程的自我监控能力？反思是否具有结构化特征？
- 结合学生的自我反思内容和整个学习过程中的表现
- Level 1: 有基本的自我评价意识
- Level 2: 能进行结构化反思
- Level 3: 具有深度的元认知调节能力

维度四：综合能力协同应用
- 评估要点：学生是否能整合多学科知识？方案是否体现了系统性思维？
- 综合评估Step4提示词设计和Step6系统优化中的跨领域整合表现
- Level 1: 基本的知识整合
- Level 2: 较好的多学科整合
- Level 3: 优秀的系统性思维和创新表达

请严格按照以下JSON格式返回评估结果，必须包含所有四个维度：

{
  "capabilityAssessments": [
    {
      "name": "问题识别与信息整合",
      "level": [基于上述分析给出1-3的等级],
      "description": "[基于学生具体表现的详细描述，50字以内]"
    },
    {
      "name": "策略制定与执行",
      "level": [基于上述分析给出1-3的等级],
      "description": "[基于学生具体表现的详细描述，50字以内]"
    },
    {
      "name": "元认知与反思",
      "level": [基于上述分析给出1-3的等级],
      "description": "[基于学生具体表现的详细描述，50字以内]"
    },
    {
      "name": "综合能力协同应用",
      "level": [基于上述分析给出1-3的等级],
      "description": "[基于学生具体表现的详细描述，50字以内]"
    }
  ],
  "personalizedSuggestions": [
    {
      "title": "信息整合",
      "level": [对应维度一的等级],
      "content": "[针对性建议，60字以内]"
    },
    {
      "title": "策略制定",
      "level": [对应维度二的等级],
      "content": "[针对性建议，60字以内]"
    },
    {
      "title": "反思能力",
      "level": [对应维度三的等级],
      "content": "[针对性建议，60字以内]"
    }
  ]
}

重要要求：
1. 必须逐一分析四个维度，不能遗漏
2. 每个维度的等级要有具体依据
3. 描述要基于学生在各步骤的实际表现
4. 特别关注学生在Step4提示词设计和Step6系统优化中的创新思维
5. 只返回JSON格式，不要任何解释文字`

  // ✅ 在 try 块外定义变量
  let cleanedResponse = ''

  try {
    console.log('🔄 调用 DeepSeek API...')
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'system',
            content:
              '你是专业的教育评估专家,擅长分析学生的学习过程。请严格按照要求分析四个维度并返回JSON格式的结果。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4500,
        stream: false,
      }),
    })

    console.log('🤖 DeepSeek API 响应状态:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ DeepSeek API Error:', errorData)
      throw new Error(`DeepSeek API调用失败: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content.trim()

    console.log('📝 AI 原始回复长度:', aiResponse.length)
    console.log('📝 AI 原始回复前200字:', aiResponse.substring(0, 200) + '...')

    // 清理JSON响应
    cleanedResponse = aiResponse
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
    }
    if (cleanedResponse.includes('```')) {
      cleanedResponse = cleanedResponse.replace(/```[\s\S]*?```/g, '').trim()
    }

    console.log('📝 清理后的完整响应:', cleanedResponse)
    console.log('📏 响应长度:', cleanedResponse.length)

    const evaluationResult = JSON.parse(cleanedResponse)
    console.log('✅ AI 评估解析成功，维度数量:', evaluationResult.capabilityAssessments?.length)
    return evaluationResult
  } catch (error) {
    console.error('❌ AI评估生成失败:', error)
    console.error('❌ 错误类型:', error.constructor.name)

    // ✅ 安全地输出错误内容
    if (cleanedResponse && cleanedResponse.length > 0) {
      console.error('❌ 解析失败的内容(前500字):', cleanedResponse.substring(0, 500))
    } else {
      console.error('❌ 未获取到AI响应或响应为空')
    }

    if (error.message.includes('JSON')) {
      console.error('💡 提示: JSON解析失败，可能是max_tokens不足或格式问题')
    }

    return generateIntelligentFallback(conversationHistory, reflectionAnswer)
  }
}

// 更新的智能备用评估 - 适配新步骤结构
function generateIntelligentFallback(conversationHistory, reflectionAnswer) {
  console.log('🔄 生成智能备用评估（新步骤结构版）')

  const conversationCount = conversationHistory.length
  const hasReflection = reflectionAnswer && reflectionAnswer.length > 10
  const conversationText = conversationHistory
    .map((c) => c.message)
    .join(' ')
    .toLowerCase()

  // 按步骤分析参与情况
  const stepParticipation = {
    2: conversationHistory.filter((c) => c.step === 2).length,
    3: conversationHistory.filter((c) => c.step === 3).length,
    4: conversationHistory.filter((c) => c.step === 4).length,
    5: conversationHistory.filter((c) => c.step === 5).length,
    6: conversationHistory.filter((c) => c.step === 6).length,
  }

  // 问题识别评估（基于Step2参与度）
  let problemIdentificationLevel = 1
  if (stepParticipation[2] >= 2) problemIdentificationLevel = 2
  if (stepParticipation[2] >= 4) problemIdentificationLevel = 3

  // 策略制定评估（基于Step3和Step5）
  let strategyLevel = 1
  const strategyKeywords = ['策略', '方案', '方法', '应急', '预案']
  const hasStrategyContent = strategyKeywords.some((keyword) => conversationText.includes(keyword))
  if (hasStrategyContent && stepParticipation[3] + stepParticipation[5] >= 2) {
    strategyLevel = 2
  }
  if (hasStrategyContent && stepParticipation[3] + stepParticipation[5] >= 4) {
    strategyLevel = 3
  }

  // 反思评估
  let reflectionLevel = 1
  if (hasReflection) {
    reflectionLevel = reflectionAnswer.length > 50 ? 2 : 1
    if (
      reflectionAnswer.length > 100 &&
      (reflectionAnswer.includes('学到') ||
        reflectionAnswer.includes('改进') ||
        reflectionAnswer.includes('思考'))
    ) {
      reflectionLevel = 3
    }
  }

  // 综合能力评估（基于Step4和Step6的参与度）
  let integrationLevel = 1
  const integrationKeywords = ['综合', '整合', '系统', '提示词', '优化', '改进']
  const hasIntegrationContent = integrationKeywords.some((keyword) =>
    conversationText.includes(keyword),
  )
  if (hasIntegrationContent && stepParticipation[4] + stepParticipation[6] >= 1) {
    integrationLevel = 2
  }
  if (hasIntegrationContent && stepParticipation[4] + stepParticipation[6] >= 3) {
    integrationLevel = 3
  }

  return {
    capabilityAssessments: [
      {
        name: '问题识别与信息整合',
        level: problemIdentificationLevel,
        description: `基于Step2的${stepParticipation[2]}次互动，展现${problemIdentificationLevel === 3 ? '优秀' : problemIdentificationLevel === 2 ? '良好' : '基础'}的问题分析能力`,
      },
      {
        name: '策略制定与执行',
        level: strategyLevel,
        description: `在策略论证和应急处理阶段表现${strategyLevel === 3 ? '出色' : strategyLevel === 2 ? '良好' : '基础'}，${strategyLevel >= 2 ? '能提出多种可行方案' : '需要加强方案多样性'}`,
      },
      {
        name: '元认知与反思',
        level: reflectionLevel,
        description: hasReflection
          ? `具有${reflectionLevel === 3 ? '深度' : reflectionLevel === 2 ? '良好' : '基本'}的自我反思能力，能评价学习过程`
          : '建议加强学习过程的自我监控和反思',
      },
      {
        name: '综合能力协同应用',
        level: integrationLevel,
        description: `在提示词设计和系统优化中展现${integrationLevel === 3 ? '出色' : integrationLevel === 2 ? '良好' : '基础'}的跨学科整合能力`,
      },
    ],
    personalizedSuggestions: [
      {
        title: '信息整合',
        level: problemIdentificationLevel,
        content:
          problemIdentificationLevel >= 2
            ? '在问题识别方面表现不错，建议继续保持系统性思维，关注因素间的相互关系'
            : '建议多角度分析问题，注重环境因素的识别和关联性分析',
      },
      {
        title: '策略制定',
        level: strategyLevel,
        content:
          strategyLevel >= 2
            ? '策略思维能力良好，建议进一步考虑实施条件和风险评估，提升方案可操作性'
            : '建议在制定策略时考虑多种情境，提出备选方案和应急预案',
      },
      {
        title: '反思能力',
        level: reflectionLevel,
        content: hasReflection
          ? '保持反思习惯很好，可尝试结构化反思方法，如"收获-挑战-改进计划"'
          : '建议定期总结学习过程，思考每个阶段的收获和可改进之处',
      },
    ],
  }
}

// 保存评估结果 - 更新元数据
async function saveEvaluationToDB(sessionId, evaluationResult, conversationHistory, overviewSummary) {
  try {
    console.log('💾 开始保存评估结果到数据库')

    const client = await connectToDatabase()
    const db = client.db('llm_learning')
    const collection = db.collection('student_evaluations')

    // 统计各步骤参与情况
    const stepStats = {
      2: conversationHistory.filter((c) => c.step === 2).length,
      3: conversationHistory.filter((c) => c.step === 3).length,
      4: conversationHistory.filter((c) => c.step === 4).length,
      5: conversationHistory.filter((c) => c.step === 5).length,
      6: conversationHistory.filter((c) => c.step === 6).length,
    }

    const result = await collection.insertOne(
      {
        sessionId,
        evaluationResult,
        overviewSummary: overviewSummary || null,
        conversationSummary: {
          totalConversations: conversationHistory.length,
          stepParticipation: stepStats,
          stepsCompleted: Object.keys(stepStats).filter((step) => stepStats[step] > 0),
          lastActivity: new Date(),
        },
        timestamp: new Date(),
        metadata: {
          evaluationType: 'ai_generated_v2',
          context: 'intelligent_ventilation_system_v2',
          stepsIncluded: [2, 3, 4, 5, 6],
          stepDescriptions: {
            2: '问题分析：因素识别与控制设计',
            3: '策略论证：方案比较与分析',
            4: '提示词设计：用户交互界面',
            5: '应急处理：极端情况应对',
            6: '方案优化：系统完善与改进',
          },
        },
      },
      {
        maxTimeMS: 10000,
      },
    )

    console.log('✅ 评估结果已保存到数据库, ID:', result.insertedId)
  } catch (error) {
    console.error('❌ 保存评估结果失败:', error)
  }
}

export default async function handler(req, res) {
  console.log('🚀 评估生成 API 开始执行（新步骤结构版）')

  // 设置CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Experiment-ID',
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { sessionId, reflectionAnswer, experimentType, overviewSummary } = req.body

    console.log('📍 SessionID:', sessionId)
    console.log('📝 反思回答长度:', reflectionAnswer?.length || 0)

    if (!sessionId) {
      return res.status(400).json({ error: '缺少sessionId参数' })
    }

    // 获取Step2-6的所有对话历史
    const conversationHistory = await getConversationHistory(sessionId)
    console.log('📚 获取到历史记录数量:', conversationHistory.length)

    // 按步骤统计参与情况
    const stepStats = {
      2: conversationHistory.filter((c) => c.step === 2).length,
      3: conversationHistory.filter((c) => c.step === 3).length,
      4: conversationHistory.filter((c) => c.step === 4).length,
      5: conversationHistory.filter((c) => c.step === 5).length,
      6: conversationHistory.filter((c) => c.step === 6).length,
    }
    console.log('📊 各步骤参与统计:', stepStats)

    // 生成AI评估
    const evaluationResult = await generateEvaluationWithAI(
      conversationHistory,
      reflectionAnswer || '',
      experimentType || 'intelligent_ventilation_system_v2',
    )

    console.log('✅ 评估生成完成，维度数量:', evaluationResult.capabilityAssessments?.length)

    // 立即返回响应
    res.status(200).json({
      ...evaluationResult,
      overviewSummary: overviewSummary || null,
      metadata: {
        totalConversations: conversationHistory.length,
        stepParticipation: stepStats,
        stepsIncluded: [2, 3, 4, 5, 6],
        hasReflection: !!(reflectionAnswer && reflectionAnswer.length > 0),
        generationTime: new Date().toISOString(),
        version: 'v2_with_new_steps',
      },
    })

    // 异步保存评估结果
    setImmediate(async () => {
      await saveEvaluationToDB(sessionId, evaluationResult, conversationHistory, overviewSummary)
    })
  } catch (error) {
    console.error('❌ 生成评估失败:', error)

    const fallbackResult = generateIntelligentFallback([], '')

    res.status(500).json({
      ...fallbackResult,
      error: '评估生成部分失败，已提供备用评估',
      debugInfo: {
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
      },
    })
  }
}
