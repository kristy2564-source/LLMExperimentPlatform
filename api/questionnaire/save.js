// api/questionnaire/save.js
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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Experiment-ID, X-Session-ID',
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const questionnaireData = req.body
    const experimentId = req.headers['x-experiment-id']
    const sessionId = req.headers['x-session-id']

    // 验证必要字段
    if (!sessionId) {
      return res.status(400).json({ error: '缺少会话ID' })
    }

    if (!questionnaireData.answers || questionnaireData.answers.length === 0) {
      return res.status(400).json({ error: '问卷数据不完整' })
    }

    console.log('接收问卷数据:', {
      sessionId,
      experimentId,
      answerCount: questionnaireData.answers.length,
    })

    // 连接数据库
    const client = await connectToDatabase()
    const db = client.db('llm_learning')
    const questionnaireCollection = db.collection('questionnaires')
    const conversationCollection = db.collection('conversations')

    // 检查是否已提交过问卷（防止重复提交）
    const existingQuestionnaire = await questionnaireCollection.findOne({
      sessionId,
      questionnaireType: 'post_test',
    })

    if (existingQuestionnaire) {
      console.log('检测到重复提交，返回已存在的问卷ID')
      return res.status(200).json({
        success: true,
        questionnaireId: existingQuestionnaire._id.toString(),
        message: '问卷已提交，无需重复提交',
      })
    }

    // 查找该用户的对话数据（用于关联）
    const userConversations = await conversationCollection
      .find({
        sessionId,
      })
      .toArray()

    // 计算该用户的行为统计
    const behaviorStats = calculateBehaviorStats(userConversations)

    // === 核心：构建扁平化的数据结构（便于导出） ===
    const flattenedData = flattenQuestionnaireData(
      questionnaireData,
      behaviorStats,
      sessionId,
      experimentId,
    )

    // 保存问卷数据（包含原始结构和扁平化数据）
    const questionnaireDocument = {
      // === 原始详细数据（用于深度分析） ===
      ...questionnaireData,

      // === 扁平化数据（所有字段在顶层，便于导出CSV） ===
      ...flattenedData,

      // === 关联数据 ===
      behaviorStats,
      conversationCount: userConversations.length,

      // === 数据库管理字段 ===
      createdAt: new Date(),
      updatedAt: new Date(),
      dataVersion: '1.0',

      // === 数据状态 ===
      status: 'completed',
      isValid: validateQuestionnaire(questionnaireData),
    }

    const result = await questionnaireCollection.insertOne(questionnaireDocument)

    console.log('问卷保存成功，ID:', result.insertedId)

    // 更新对话记录，添加问卷引用
    if (userConversations.length > 0) {
      await conversationCollection.updateMany(
        { sessionId },
        {
          $set: {
            questionnaireId: result.insertedId,
            questionnaireCompleted: true,
            updatedAt: new Date(),
          },
        },
      )
      console.log(`已更新 ${userConversations.length} 条对话记录的问卷关联`)
    }

    res.status(200).json({
      success: true,
      questionnaireId: result.insertedId.toString(),
      message: '问卷提交成功',
    })
  } catch (error) {
    console.error('保存问卷失败:', error)
    res.status(500).json({
      error: '保存问卷失败',
      details: error.message,
    })
  }
}

// === 扁平化问卷数据（核心函数） ===
function flattenQuestionnaireData(questionnaireData, behaviorStats, sessionId, experimentId) {
  const flattened = {
    // 基本标识信息
    session_id: sessionId,
    experiment_id: experimentId,
    experiment_type: questionnaireData.experimentType || 'smart-ventilation-system',

    // 时间信息
    started_at: questionnaireData.startedAt,
    completed_at: questionnaireData.completedAt,
    submitted_at: questionnaireData.submittedAt,
    completion_time_minutes: questionnaireData.metadata?.completionTimeMinutes || 0,

    // === 能力问卷（12题）===
    ability_q1: questionnaireData.flatAnswers?.ability_q1 || null,
    ability_q2: questionnaireData.flatAnswers?.ability_q2 || null,
    ability_q3: questionnaireData.flatAnswers?.ability_q3 || null,
    ability_q4: questionnaireData.flatAnswers?.ability_q4 || null,
    ability_q5: questionnaireData.flatAnswers?.ability_q5 || null,
    ability_q6: questionnaireData.flatAnswers?.ability_q6 || null,
    ability_q7: questionnaireData.flatAnswers?.ability_q7 || null,
    ability_q8: questionnaireData.flatAnswers?.ability_q8 || null,
    ability_q9: questionnaireData.flatAnswers?.ability_q9 || null,
    ability_q10: questionnaireData.flatAnswers?.ability_q10 || null,
    ability_q11: questionnaireData.flatAnswers?.ability_q11 || null,
    ability_q12: questionnaireData.flatAnswers?.ability_q12 || null,

    // === 人机协作问卷（12题）===
    collaboration_q1: questionnaireData.flatAnswers?.collaboration_q1 || null,
    collaboration_q2: questionnaireData.flatAnswers?.collaboration_q2 || null,
    collaboration_q3: questionnaireData.flatAnswers?.collaboration_q3 || null,
    collaboration_q4: questionnaireData.flatAnswers?.collaboration_q4 || null,
    collaboration_q5: questionnaireData.flatAnswers?.collaboration_q5 || null,
    collaboration_q6: questionnaireData.flatAnswers?.collaboration_q6 || null,
    collaboration_q7: questionnaireData.flatAnswers?.collaboration_q7 || null,
    collaboration_q8: questionnaireData.flatAnswers?.collaboration_q8 || null,
    collaboration_q9: questionnaireData.flatAnswers?.collaboration_q9 || null,
    collaboration_q10: questionnaireData.flatAnswers?.collaboration_q10 || null,
    collaboration_q11: questionnaireData.flatAnswers?.collaboration_q11 || null,
    collaboration_q12: questionnaireData.flatAnswers?.collaboration_q12 || null,

    // === 使用体验问卷（9题）===
    experience_q1: questionnaireData.flatAnswers?.experience_q1 || null,
    experience_q2: questionnaireData.flatAnswers?.experience_q2 || null,
    experience_q3: questionnaireData.flatAnswers?.experience_q3 || null,
    experience_q4: questionnaireData.flatAnswers?.experience_q4 || null,
    experience_q5: questionnaireData.flatAnswers?.experience_q5 || null,
    experience_q6: questionnaireData.flatAnswers?.experience_q6 || null,
    experience_q7: questionnaireData.flatAnswers?.experience_q7 || null,
    experience_q8: questionnaireData.flatAnswers?.experience_q8 || null,
    experience_q9: questionnaireData.flatAnswers?.experience_q9 || null,

    // === 分类得分统计 ===
    ability_score_total: questionnaireData.categoryScores?.ability?.total || 0,
    ability_score_average: questionnaireData.categoryScores?.ability?.average || 0,
    collaboration_score_total: questionnaireData.categoryScores?.collaboration?.total || 0,
    collaboration_score_average: questionnaireData.categoryScores?.collaboration?.average || 0,
    experience_score_total: questionnaireData.categoryScores?.experience?.total || 0,
    experience_score_average: questionnaireData.categoryScores?.experience?.average || 0,

    // === 行为数据统计 ===
    total_conversations: behaviorStats.totalConversations,
    total_messages: behaviorStats.totalMessages,
    user_messages: behaviorStats.userMessages,
    ai_messages: behaviorStats.aiMessages,
    avg_message_length: behaviorStats.avgMessageLength,
    help_requests: behaviorStats.helpRequests,
    time_spent_ms: behaviorStats.timeSpent,
    time_spent_minutes: Math.round((behaviorStats.timeSpent / 60000) * 10) / 10,

    // === 各步骤对话分布 ===
    step1_conversations: behaviorStats.stepDistribution['1'] || 0,
    step2_conversations: behaviorStats.stepDistribution['2'] || 0,
    step3_conversations: behaviorStats.stepDistribution['3'] || 0,
    step4_conversations: behaviorStats.stepDistribution['4'] || 0,
    step5_conversations: behaviorStats.stepDistribution['5'] || 0,
    step6_conversations: behaviorStats.stepDistribution['6'] || 0,
    step7_conversations: behaviorStats.stepDistribution['7'] || 0,

    // === 设备信息 ===
    device_user_agent: questionnaireData.metadata?.deviceInfo?.userAgent || '',
    device_platform: questionnaireData.metadata?.deviceInfo?.platform || '',
    device_screen_width: questionnaireData.metadata?.deviceInfo?.screenWidth || 0,
    device_screen_height: questionnaireData.metadata?.deviceInfo?.screenHeight || 0,

    // === 数据质量指标 ===
    total_questions: questionnaireData.metadata?.totalQuestions || 33,
    answered_questions: questionnaireData.metadata?.answeredQuestions || 0,
    completion_rate: questionnaireData.metadata?.completionRate || 0,
  }

  return flattened
}

// 计算用户行为统计
function calculateBehaviorStats(conversations) {
  const stats = {
    totalConversations: conversations.length,
    totalMessages: 0,
    userMessages: 0,
    aiMessages: 0,
    avgMessageLength: 0,
    stepDistribution: {},
    helpRequests: 0,
    timeSpent: 0,
  }

  let totalLength = 0
  const helpKeywords = ['帮助', '不懂', '不会', '怎么办', '求助', '提示']

  conversations.forEach((conv) => {
    if (conv.messages) {
      stats.totalMessages += conv.messages.length

      conv.messages.forEach((msg) => {
        if (msg.type === 'user') {
          stats.userMessages++
          const msgLength = msg.content?.length || 0
          totalLength += msgLength

          // 检测求助行为
          const hasHelpRequest = helpKeywords.some((keyword) => msg.content?.includes(keyword))
          if (hasHelpRequest) {
            stats.helpRequests++
          }
        } else if (msg.type === 'ai') {
          stats.aiMessages++
        }
      })
    }

    // 统计各步骤的对话数
    const step = String(conv.step || 0)
    stats.stepDistribution[step] = (stats.stepDistribution[step] || 0) + 1

    // 累计时间
    if (conv.createdAt && conv.updatedAt) {
      const start = new Date(conv.createdAt).getTime()
      const end = new Date(conv.updatedAt).getTime()
      const duration = end - start
      if (duration > 0 && duration < 3600000) {
        // 排除异常值（超过1小时）
        stats.timeSpent += duration
      }
    }
  })

  stats.avgMessageLength = stats.userMessages > 0 ? Math.round(totalLength / stats.userMessages) : 0

  return stats
}

// 验证问卷数据完整性
function validateQuestionnaire(data) {
  if (!data.answers || !Array.isArray(data.answers)) {
    return false
  }

  // 检查是否所有题目都已回答
  const expectedQuestions = 33 // 12 + 12 + 9
  if (data.answers.length !== expectedQuestions) {
    return false
  }

  // 检查答案值是否在有效范围内（1-5）
  const allValid = data.answers.every((answer) => {
    const value = answer.answerValue
    return typeof value === 'number' && value >= 1 && value <= 5
  })

  return allValid
}
