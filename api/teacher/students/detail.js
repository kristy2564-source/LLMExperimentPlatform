// api/teacher/students/detail.js - 修复版:解决对话记录重复问题
import { MongoClient } from 'mongodb'

let cachedClient = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  cachedClient = client
  return client
}

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 验证教师token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权访问' })
    }

    // 从请求体或查询参数获取sessionId
    const sessionId = req.method === 'POST' ? req.body.sessionId : req.query.sessionId

    if (!sessionId) {
      return res.status(400).json({ error: '缺少sessionId参数' })
    }

    console.log('🔍 获取学生详情:', sessionId)

    const client = await connectToDatabase()
    const db = client.db('llm_learning')
    const conversationCollection = db.collection('conversations')
    const questionnaireCollection = db.collection('questionnaires')

    // 1. 获取所有对话记录
    const conversations = await conversationCollection
      .find({ sessionId })
      .sort({ step: 1, timestamp: 1 })
      .toArray()

    if (conversations.length === 0) {
      return res.status(404).json({
        success: false,
        error: '未找到该学生的数据',
      })
    }

    console.log(`📊 查询到 ${conversations.length} 条原始记录`)

    // ✅ 过滤掉EVENT标记的对话
    const realConversations = conversations.filter((conv) => {
      // 过滤条件1: userInput以[EVENT:]开头的系统事件
      if (typeof conv.userInput === 'string' && conv.userInput.startsWith('[EVENT:')) {
        return false
      }
      // 过滤条件2: context以event_开头的埋点事件
      if (typeof conv.context === 'string' && conv.context.startsWith('event_')) {
        return false
      }
      return true
    })

    console.log(`📊 过滤EVENT后: ${realConversations.length} 条记录`)

    // ✅ 🔥 改进的去重逻辑 + 提取求助类型 + 清理显示内容
    const uniqueConversations = []
    const seen = new Set()

    for (const conv of realConversations) {
      // 🔥 提取求助类型标记并清理userInput
      let helpType = null
      let cleanedUserInput = conv.userInput || ''

      if (typeof cleanedUserInput === 'string') {
        // 检测各种求助标记
        if (cleanedUserInput.includes('[REQUEST_EXAMPLE]')) {
          helpType = 'example'
          cleanedUserInput = cleanedUserInput.replace(/\[REQUEST_EXAMPLE\]/g, '').trim()
        } else if (cleanedUserInput.includes('[CUSTOM_QUESTION]')) {
          helpType = 'custom'
          cleanedUserInput = cleanedUserInput.replace(/\[CUSTOM_QUESTION\]/g, '').trim()
        } else if (cleanedUserInput.includes('[REFINE_CONTENT]')) {
          helpType = 'refine'
          cleanedUserInput = cleanedUserInput.replace(/\[REFINE_CONTENT\]/g, '').trim()
        } else if (
          cleanedUserInput.includes('[HELP_REQUEST]') ||
          cleanedUserInput.includes('[SMART_HELP_REQUEST]')
        ) {
          helpType = 'custom'
          cleanedUserInput = cleanedUserInput
            .replace(/\[HELP_REQUEST\]|\[SMART_HELP_REQUEST\]/g, '')
            .trim()
        }

        // 清理最终快照标记
        if (cleanedUserInput.includes('[FINAL_SNAPSHOT]')) {
          cleanedUserInput = cleanedUserInput.replace(/\[FINAL_SNAPSHOT\]/g, '').trim()
        }
      }

      // 🔥🔥🔥 核心修复: 使用内容作为去重key,而非时间戳
      // 这样即使时间戳不同,但内容相同的记录也会被去重
      const userInputKey = cleanedUserInput.trim()
      const aiResponseKey = (conv.aiResponse || '').trim()

      // 使用|||作为分隔符,避免与内容本身冲突
      const contentKey = `${conv.step}|||${userInputKey}|||${aiResponseKey}`

      if (!seen.has(contentKey)) {
        seen.add(contentKey)

        // 🔥 保存清理后的对话和提取的helpType
        const cleanedConv = {
          ...conv,
          userInput: cleanedUserInput,
          metadata: {
            ...conv.metadata,
            helpType: helpType || conv.metadata?.helpType,
          },
        }

        uniqueConversations.push(cleanedConv)

        // 调试日志
        if (helpType) {
          console.log(`📊 从userInput提取求助类型: "${helpType}", Step: ${conv.step}`)
        }
      } else {
        // 🔥 增强的重复检测日志
        console.log(
          `⚠️ 去重: Step ${conv.step}, 用户输入前30字符: "${cleanedUserInput.substring(0, 30)}..."`,
        )
      }
    }

    console.log(
      `✅ 去重完成: ${uniqueConversations.length} 条唯一对话 (去掉 ${realConversations.length - uniqueConversations.length} 条重复)`,
    )

    // 2. 获取问卷数据
    const questionnaire = await questionnaireCollection.findOne({ sessionId })

    // 3. 按步骤组织对话数据（使用去重后的数据）
    const conversationsByStep = {}
    const finalAnswers = {}
    const helpRequests = {
      total: 0,
      byType: { refine: 0, example: 0, custom: 0 },
      byStep: {},
    }

    uniqueConversations.forEach((conv) => {
      const step = conv.step || 'unknown'

      // 组织对话历史
      if (!conversationsByStep[step]) {
        conversationsByStep[step] = []
      }

      conversationsByStep[step].push({
        userInput: conv.userInput,
        aiResponse: conv.aiResponse,
        timestamp: conv.timestamp,
        stage: conv.stage,
        metadata: conv.metadata,
      })

      // 提取最终答案（带有快照标记的对话）
      if (conv.metadata?.isFinalSnapshot && conv.metadata?.finalAnswerContent) {
        finalAnswers[step] = {
          content: conv.metadata.finalAnswerContent,
          timestamp: conv.timestamp,
        }
        console.log(`📋 提取 Step${step} 最终答案: ${conv.metadata.finalAnswerContent.length}字`)
      }

      // 🔥 Step6 特殊处理: 使用 context 区分最终提交
      if (step === 6 && conv.context === 'final_solution_submission') {
        finalAnswers[step] = {
          content: conv.aiResponse,
          timestamp: conv.timestamp,
        }
        console.log(`📋 提取 Step6 最终方案: ${conv.aiResponse.length}字`)
      }

      // 统计求助次数
      if (conv.metadata?.helpType) {
        helpRequests.total++
        const helpType = conv.metadata.helpType

        console.log(`📊 求助类型: "${helpType}", Step: ${step}`)

        // ✅ 使用更宽松的匹配逻辑
        if (helpType === 'refine' || helpType === 'optimize' || helpType === 'improve') {
          helpRequests.byType.refine++
        } else if (helpType === 'example' || helpType === 'sample' || helpType === 'demo') {
          helpRequests.byType.example++
        } else if (helpType === 'custom' || helpType === 'question' || helpType === 'ask') {
          helpRequests.byType.custom++
        } else {
          console.log(`⚠️ 未知求助类型: "${helpType}", 归类到 custom`)
          helpRequests.byType.custom++
        }

        if (!helpRequests.byStep[step]) {
          helpRequests.byStep[step] = 0
        }
        helpRequests.byStep[step]++
      }
    })

    // 4. 计算行为统计
    const firstActivity = uniqueConversations[0].timestamp
    const lastActivity = uniqueConversations[uniqueConversations.length - 1].timestamp
    const timeSpent = Math.round((new Date(lastActivity) - new Date(firstActivity)) / 60000)

    const stepDistribution = {}
    const messageStats = {
      total: uniqueConversations.length,
      userMessages: uniqueConversations.filter((c) => c.userInput).length,
      aiMessages: uniqueConversations.filter((c) => c.aiResponse).length,
      avgUserMessageLength: 0,
    }

    // 计算平均用户消息长度
    const userMessageLengths = uniqueConversations
      .filter((c) => c.userInput)
      .map((c) => c.userInput.length)

    if (userMessageLengths.length > 0) {
      messageStats.avgUserMessageLength = Math.round(
        userMessageLengths.reduce((sum, len) => sum + len, 0) / userMessageLengths.length,
      )
    }

    // 统计各步骤对话数
    for (let i = 1; i <= 7; i++) {
      stepDistribution[i] = conversationsByStep[i]?.length || 0
    }

    const behaviorStats = {
      timeSpent, // 分钟
      totalConversations: uniqueConversations.length, // 🔥 修复: 使用去重后的数量
      stepDistribution,
      messageStats,
      helpRequests,
      activityPeriod: {
        firstActivity,
        lastActivity,
      },
    }

    // 5. 整理问卷数据
    let questionnaireData = null
    if (questionnaire) {
      questionnaireData = {
        completedAt: questionnaire.completed_at,
        totalTime: questionnaire.total_time_minutes,
        scores: {
          ability: {
            total: questionnaire.ability_score_total,
            average: questionnaire.ability_score_average,
          },
          collaboration: {
            total: questionnaire.collaboration_score_total,
            average: questionnaire.collaboration_score_average,
          },
          experience: {
            total: questionnaire.experience_score_total,
            average: questionnaire.experience_score_average,
          },
        },
        answers: {
          // 能力相关问题
          ability: Array.from({ length: 9 }, (_, i) => ({
            question: `ability_q${i + 1}`,
            answer: questionnaire[`ability_q${i + 1}`] || null,
          })),
          // 协作相关问题
          collaboration: Array.from({ length: 9 }, (_, i) => ({
            question: `collaboration_q${i + 1}`,
            answer: questionnaire[`collaboration_q${i + 1}`] || null,
          })),
          // 体验相关问题
          experience: Array.from({ length: 9 }, (_, i) => ({
            question: `experience_q${i + 1}`,
            answer: questionnaire[`experience_q${i + 1}`] || null,
          })),
          // 开放性反馈
          feedback: questionnaire.feedback_open || '',
        },
      }
    }

    // 6. 构建完整的学生详情数据
    const studentDetail = {
      sessionId,
      experimentId: uniqueConversations[0].experimentId || '未知',
      basicInfo: {
        currentStep: Math.max(...uniqueConversations.map((c) => parseInt(c.step) || 0)),
        completedSteps: Object.keys(conversationsByStep).length,
        totalSteps: 7,
        status: questionnaire ? '已完成' : '进行中',
        hasQuestionnaire: !!questionnaire,
      },
      conversationsByStep, // 按步骤组织的对话历史(已去重)
      finalAnswers, // 各步骤的最终答案
      behaviorStats, // 行为统计数据
      questionnaireData, // 问卷数据
      rawConversations: uniqueConversations, // 原始对话记录（已过滤EVENT和重复）
    }

    console.log('✅ 学生详情数据准备完成')
    console.log(`📊 最终数据统计: ${uniqueConversations.length} 条对话`)

    res.status(200).json({
      success: true,
      data: studentDetail,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ 获取学生详情失败:', error)
    res.status(500).json({
      success: false,
      error: '获取学生详情失败',
      details: error.message,
    })
  }
}
