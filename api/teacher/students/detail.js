// api/teacher/students/detail.js - 修复版:添加能力评估数据
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
    const evaluationCollection = db.collection('student_evaluations') // 🔥 新增：能力评估集合
    const eventsCollection = db.collection('events')
    const finalSolutionsCollection = db.collection('final_solutions') // 🔥 新增：Step6最终方案集合

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
        const helpMatch = cleanedUserInput.match(/\[HELP_TYPE:(\w+)\]/)
        if (helpMatch) {
          helpType = helpMatch[1]
          cleanedUserInput = cleanedUserInput.replace(/\[HELP_TYPE:\w+\]\s*/, '')
        }
      }

      // 创建唯一键用于去重
      const key = `${conv.step}_${conv.timestamp}_${cleanedUserInput}`

      if (!seen.has(key)) {
        seen.add(key)
        uniqueConversations.push({
          ...conv,
          userInput: cleanedUserInput,
          metadata: {
            ...conv.metadata,
            helpType: helpType || conv.metadata?.helpType,
          },
        })
      }
    }

    console.log(`📊 去重后: ${uniqueConversations.length} 条记录`)

    // 2. 获取问卷数据
    const questionnaire = await questionnaireCollection.findOne({ sessionId })

    // 🔥 新增：3. 获取能力评估数据
    const evaluation = await evaluationCollection.findOne({ sessionId })
    const events = await eventsCollection.find({ sessionId }).sort({ timestamp: 1 }).toArray()
    const finalSolutionDocs = await finalSolutionsCollection
      .find({ sessionId })
      .sort({ 'timestamps.submittedAt': -1 })
      .limit(1)
      .toArray()
    const finalSolution = finalSolutionDocs[0] || null
    const eventsByStep = {}
    const clickKeywords = [
      '_click',
      'open',
      'close',
      'toggle',
      'copy',
      'insert',
      'save',
      'attempt',
      'confirm',
      'cancel',
      'restore',
      'unsaved',
      'draft',
      'fullscreen',
      'guidance',
      'drawer',
      'tab_switch',
      'reference',
      'editor_clear',
      'collapse',
      'expand',
      'next_step',
      'confirm_dialog',
      'help_button',
    ]
    let totalClicks = 0
    let totalChats = 0
    let step6Clicks = 0
    let step6Chats = 0
    for (const ev of events) {
      const step = ev.step || 0
      if (!eventsByStep[step]) {
        eventsByStep[step] = []
      }
      eventsByStep[step].push({
        name: ev.event_name,
        timestamp: ev.timestamp,
        stage: ev.stage,
        data: ev.event_data || {},
      })
      const name = String(ev.event_name || '')
      const isChat = name.includes('chat_send')
      const isClick =
        clickKeywords.some((kw) => name.includes(kw)) && !isChat && !name.includes('chat_receive')
      if (isChat) {
        totalChats++
        if (step === 6) step6Chats++
      } else if (isClick) {
        totalClicks++
        if (step === 6) step6Clicks++
      }
    }

    // 4. 按步骤组织对话数据（使用去重后的数据）
    const conversationsByStep = {}
    const finalAnswers = {}
    const helpRequests = {
      total: 0,
      byType: { refine: 0, example: 0, custom: 0 },
      byStep: {},
    }

    const stepSeenPairs = new Map()
    uniqueConversations.forEach((conv) => {
      const step = conv.step || 'unknown'

      // 组织对话历史
      if (!conversationsByStep[step]) {
        conversationsByStep[step] = []
      }

      const isContentFinal =
        typeof conv.userInput === 'string' && conv.userInput.includes('[FINAL_SNAPSHOT]')
      const isFinalSnapshot = !!(conv.metadata && conv.metadata.isFinalSnapshot) || isContentFinal
      const isFinalSubmit = step === 6 && conv.context === 'final_solution_submission'
      if (!isFinalSnapshot && !isFinalSubmit) {
        const ui = String(conv.userInput || '')
          .trim()
          .replace(/\s+/g, ' ')
        const ai = String(conv.aiResponse || '')
          .trim()
          .replace(/\s+/g, ' ')
        const pairKey = `${ui}::${ai}`
        let seenSet = stepSeenPairs.get(step)
        if (!seenSet) {
          seenSet = new Set()
          stepSeenPairs.set(step, seenSet)
        }
        if (!seenSet.has(pairKey)) {
          seenSet.add(pairKey)
          conversationsByStep[step].push({
            userInput: conv.userInput,
            aiResponse: conv.aiResponse,
            timestamp: conv.timestamp,
            stage: conv.stage,
            metadata: conv.metadata,
          })
        }
      }

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

    // 5. 计算各步骤对话分布
    const stepDistribution = {}
    Object.keys(conversationsByStep).forEach((step) => {
      stepDistribution[step] = conversationsByStep[step].length
    })

    // 6. 统计消息数据
    const messageStats = {
      totalUserMessages: uniqueConversations.filter((c) => c.userInput).length,
      totalAiMessages: uniqueConversations.filter((c) => c.aiResponse).length,
      avgUserMessageLength: 0,
      avgAiMessageLength: 0,
    }

    let totalUserLength = 0
    let totalAiLength = 0

    uniqueConversations.forEach((conv) => {
      if (conv.userInput) {
        totalUserLength += conv.userInput.length
      }
      if (conv.aiResponse) {
        totalAiLength += conv.aiResponse.length
      }
    })

    // 🔥 若存在最终方案文档，则覆盖/补充 Step6 的最终答案
    let step6Grade = null
    if (finalSolution && finalSolution.solutionData?.finalPlan) {
      finalAnswers[6] = {
        content: finalSolution.solutionData.finalPlan,
        timestamp: finalSolution.timestamps?.submittedAt || new Date().toISOString(),
      }
      if (finalSolution.grade) {
        step6Grade = {
          letter: finalSolution.grade.letter,
          score: finalSolution.grade.score,
          rubricVersion: finalSolution.grade.rubricVersion,
          breakdown: finalSolution.grade.breakdown,
        }
      }
      console.log(
        `✅ 来自 final_solutions 的 Step6 最终方案: ${finalSolution.solutionData.finalPlan.length}字`,
      )
    } else {
      console.log('ℹ️ 未在 final_solutions 集合中找到该学生的最终方案文档')
    }

    if (messageStats.totalUserMessages > 0) {
      messageStats.avgUserMessageLength = Math.round(
        totalUserLength / messageStats.totalUserMessages,
      )
    }

    if (messageStats.totalAiMessages > 0) {
      messageStats.avgAiMessageLength = Math.round(totalAiLength / messageStats.totalAiMessages)
    }

    // 7. 计算时间相关数据
    const firstActivity = uniqueConversations[0]?.timestamp
    const lastActivity = uniqueConversations[uniqueConversations.length - 1]?.timestamp

    let timeSpent = 0
    if (firstActivity && lastActivity) {
      const start = new Date(firstActivity).getTime()
      const end = new Date(lastActivity).getTime()
      timeSpent = Math.round((end - start) / 60000) // 转换为分钟
    }

    // 8. 组织行为统计数据
    const behaviorStats = {
      totalConversations: uniqueConversations.length,
      timeSpent,
      helpRequests,
      stepDistribution,
      messageStats,
    }

    // 9. 整理问卷数据（包含每道题的完整信息）
    let questionnaireData = null
    if (questionnaire) {
      // 🔥 定义所有题目的文本
      const questionTexts = {
        // 能力问卷（12题）
        ability_q1: '我能快速判断任务中哪些信息是最重要的。',
        ability_q2: '我善于从多个信息来源中整合相关内容。',
        ability_q3: '当信息分散时,我也能组织出解决思路。',
        ability_q4: '我愿意尝试不同的策略来构思哪种效果更好。',
        ability_q5: '我认为自己设计的方案是可行且易于实施的。',
        ability_q6: '如果原策略效果不好,我会立刻尝试新方法。',
        ability_q7: '我总是确保我的每一步都与问题目标一致。',
        ability_q8: '我在解决问题时会考虑所有环境条件之间的关系。',
        ability_q9: '我倾向于从整体上把握问题,而非只看细节。',
        ability_q10: '我在完成任务后会回顾哪些地方做得不够好。',
        ability_q11: '我能察觉到自己是否需要帮助。',
        ability_q12: '如果发现问题,我会重新评估并修改我的思路。',

        // 人机协作问卷（12题）
        collaboration_q1: '在确定问题时,我依赖AI来生成或解释任务说明。',
        collaboration_q2: '我觉得AI比我更擅长快速识别任务的核心问题。',
        collaboration_q3: '我认为AI在提供解决问题所需的信息上比我发挥了更大作用。',
        collaboration_q4: '我常直接采用AI生成的方案作为解决方案的一部分。',
        collaboration_q5: '我会在没有太多修改的情况下使用AI的输出。',
        collaboration_q6: '在解决问题时,我主要依靠自己的判断和知识,而不是AI。',
        collaboration_q7: '即使AI能够提供帮助,我也倾向于独立完成任务。',
        collaboration_q8: '我完成复杂问题解决任务时几乎不使用AI。',
        collaboration_q9: '我会自己提出策略,引导AI帮助我澄清问题情境。',
        collaboration_q10: '我会根据AI的反馈修改我的问题定义和策略,使之更符合目标。',
        collaboration_q11: '我会批判性地阅读AI生成的信息,而不是完全接受。',
        collaboration_q12: '当AI的建议不适合时,我会果断放弃它。',

        // 使用体验问卷（9题）
        experience_q1: '我觉得使用该智能体是容易理解和操作的。',
        experience_q2: '我在学习任务中使用该智能体时,几乎不需要额外的技术支持。',
        experience_q3: '我觉得智能体能够很好地理解我的提问意图。',
        experience_q4: '我觉得智能体给出的帮助与我的需求是匹配的。',
        experience_q5: '我觉得智能体的解释对我有用。',
        experience_q6: '我认为使用该智能体能够让我更有效地完成任务。',
        experience_q7: '我认为使用智能体能够提升我的问题解决能力。',
        experience_q8: '总体而言,我对该智能体的使用体验是满意的。',
        experience_q9: '我愿意在未来的学习中继续使用这类智能体。',
      }

      // 🔥 答案选项文本
      const optionTexts = {
        1: '非常不同意',
        2: '不同意',
        3: '一般',
        4: '同意',
        5: '非常同意',
      }

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
        // 🔥 返回每道题的详细信息
        detailedAnswers: {
          ability: Array.from({ length: 12 }, (_, i) => {
            const qId = `ability_q${i + 1}`
            const answerValue = questionnaire[qId]
            return {
              id: qId,
              number: i + 1,
              text: questionTexts[qId],
              answer: answerValue,
              answerText: answerValue ? optionTexts[answerValue] : '未回答',
            }
          }),
          collaboration: Array.from({ length: 12 }, (_, i) => {
            const qId = `collaboration_q${i + 1}`
            const answerValue = questionnaire[qId]
            return {
              id: qId,
              number: i + 1,
              text: questionTexts[qId],
              answer: answerValue,
              answerText: answerValue ? optionTexts[answerValue] : '未回答',
            }
          }),
          experience: Array.from({ length: 9 }, (_, i) => {
            const qId = `experience_q${i + 1}`
            const answerValue = questionnaire[qId]
            return {
              id: qId,
              number: i + 1,
              text: questionTexts[qId],
              answer: answerValue,
              answerText: answerValue ? optionTexts[answerValue] : '未回答',
            }
          }),
        },
        // 开放性反馈
        feedback: questionnaire.feedback_open || '',
      }
    }

    // 🔥 新增：10. 整理能力评估数据
    let evaluationData = null
    if (evaluation && evaluation.evaluationResult) {
      evaluationData = {
        generatedAt: evaluation.timestamp,
        capabilityAssessments: evaluation.evaluationResult.capabilityAssessments || [],
        personalizedSuggestions: evaluation.evaluationResult.personalizedSuggestions || [],
        conversationSummary: evaluation.conversationSummary || {},
        metadata: evaluation.metadata || {},
      }
      console.log('✅ 找到能力评估数据:', evaluationData.capabilityAssessments.length, '个维度')
    } else {
      console.log('⚠️ 该学生暂无能力评估数据')
    }

    // 11. 构建完整的学生详情数据
    const studentDetail = {
      sessionId,
      experimentId: uniqueConversations[0].experimentId || '未知',
      basicInfo: {
        currentStep: Math.max(...uniqueConversations.map((c) => parseInt(c.step) || 0)),
        completedSteps: Object.keys(conversationsByStep).length,
        totalSteps: 7,
        status: questionnaire ? '已完成' : '进行中',
        hasQuestionnaire: !!questionnaire,
        hasEvaluation: !!evaluation, // 🔥 新增：是否有能力评估
        step6Grade, // 🔥 新增：Step6 评分与评价
        step6Submitted: !!finalAnswers[6]?.content,
      },
      conversationsByStep, // 按步骤组织的对话历史(已去重)
      finalAnswers, // 各步骤的最终答案
      behaviorStats, // 行为统计数据
      questionnaireData, // 问卷数据
      evaluationData, // 🔥 新增：能力评估数据
      rawConversations: uniqueConversations, // 原始对话记录（已过滤EVENT和重复）
      eventsByStep,
      operationSummary: {
        totalClicks,
        totalChats,
        hasClicks: totalClicks > 0,
        hasChats: totalChats > 0,
        step6: {
          clicks: step6Clicks,
          chats: step6Chats,
        },
      },
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
