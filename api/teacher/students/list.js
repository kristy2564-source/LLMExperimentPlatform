// api/teacher/students/list.js
// 获取学生列表API
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
    // 验证教师token（简单验证，实际项目中应使用JWT）
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权访问' })
    }

    console.log('📊 获取学生列表请求')

    const client = await connectToDatabase()
    const db = client.db('llm_learning')

    // 从请求体或查询参数获取筛选条件
    const { experimentId, status, startDate, endDate } =
      req.method === 'POST' ? req.body : req.query

    // 构建查询条件
    const conversationQuery = {}
    if (experimentId) {
      conversationQuery.experimentId = experimentId
    }

    // 1. 获取所有会话的基本信息
    const conversationCollection = db.collection('conversations')
    const questionnaireCollection = db.collection('questionnaires')

    // 聚合查询：按sessionId分组，获取每个学生的统计数据
    let studentStats
    try {
      studentStats = await conversationCollection
        .aggregate([
          { $match: conversationQuery },
          {
            $addFields: {
              safeUserInput: {
                $cond: [{ $eq: [{ $type: '$userInput' }, 'string'] }, '$userInput', ''],
              },
              safeContext: {
                $cond: [{ $eq: [{ $type: '$context' }, 'string'] }, '$context', ''],
              },
              isEventUser: {
                $regexMatch: { input: '$safeUserInput', regex: /^\[EVENT:/ },
              },
              isEventContext: {
                $regexMatch: { input: '$safeContext', regex: /^event_/ },
              },
            },
          },
          {
            $group: {
              _id: '$sessionId',
              experimentId: { $first: '$experimentId' },
              firstActivity: { $min: '$timestamp' },
              lastActivity: { $max: '$timestamp' },
              totalConversations: {
                $sum: {
                  $cond: [
                    {
                      $and: [{ $not: ['$isEventUser'] }, { $not: ['$isEventContext'] }],
                    },
                    1,
                    0,
                  ],
                },
              },
              totalClicks: {
                $sum: {
                  $cond: [
                    {
                      $or: ['$isEventUser', '$isEventContext'],
                    },
                    1,
                    0,
                  ],
                },
              },
              steps: { $addToSet: '$step' },
              metadata: { $first: '$metadata' },
            },
          },
          {
            $project: {
              sessionId: '$_id',
              experimentId: 1,
              firstActivity: 1,
              lastActivity: 1,
              totalConversations: 1,
              totalClicks: 1,
              hasChats: { $gt: ['$totalConversations', 0] },
              hasClicks: { $gt: ['$totalClicks', 0] },
              currentStep: { $max: '$steps' },
              completedSteps: { $size: '$steps' },
              metadata: 1,
              _id: 0,
            },
          },
        ])
        .toArray()
    } catch (aggError) {
      const allConvs = await conversationCollection.find(conversationQuery).toArray()
      const bySession = new Map()
      for (const conv of allConvs) {
        const sid = conv.sessionId
        if (!sid) continue
        if (!bySession.has(sid)) {
          bySession.set(sid, {
            sessionId: sid,
            experimentId: conv.experimentId,
            firstActivity: conv.timestamp,
            lastActivity: conv.timestamp,
            totalConversations: 0,
            totalClicks: 0,
            stepsSet: new Set(),
            metadata: conv.metadata,
          })
        }
        const s = bySession.get(sid)
        if (conv.timestamp && (!s.firstActivity || conv.timestamp < s.firstActivity)) {
          s.firstActivity = conv.timestamp
        }
        if (conv.timestamp && (!s.lastActivity || conv.timestamp > s.lastActivity)) {
          s.lastActivity = conv.timestamp
        }
        s.stepsSet.add(conv.step)
        const ui = conv.userInput
        const ctx = conv.context
        const isEventUser = typeof ui === 'string' && /^\[EVENT:/.test(ui)
        const isEventContext = typeof ctx === 'string' && /^event_/.test(ctx)
        if (isEventUser || isEventContext) {
          s.totalClicks += 1
        } else {
          s.totalConversations += 1
        }
      }
      studentStats = Array.from(bySession.values()).map((s) => ({
        sessionId: s.sessionId,
        experimentId: s.experimentId,
        firstActivity: s.firstActivity,
        lastActivity: s.lastActivity,
        totalConversations: s.totalConversations,
        totalClicks: s.totalClicks,
        hasChats: s.totalConversations > 0,
        hasClicks: s.totalClicks > 0,
        currentStep: Math.max(...Array.from(s.stepsSet.values()).map((x) => x || 0)),
        completedSteps: s.stepsSet.size,
        metadata: s.metadata,
      }))
    }

    console.log(`📋 找到 ${studentStats.length} 个学生会话`)

    // 2. 获取问卷提交情况
    const questionnaires = await questionnaireCollection
      .find(
        {},
        {
          projection: {
            sessionId: 1,
            completed_at: 1,
            total_time_minutes: 1,
            ability_score_average: 1,
            collaboration_score_average: 1,
          },
        },
      )
      .toArray()

    // 创建问卷映射
    const questionnaireMap = new Map()
    questionnaires.forEach((q) => {
      questionnaireMap.set(q.sessionId, q)
    })

    // 3. 合并数据
    const studentList = studentStats.map((student) => {
      const questionnaire = questionnaireMap.get(student.sessionId)
      const hasQuestionnaire = !!questionnaire

      // 计算总时长（分钟）
      const timeSpent =
        student.lastActivity && student.firstActivity
          ? Math.round((new Date(student.lastActivity) - new Date(student.firstActivity)) / 60000)
          : 0

      // 判断完成状态
      let status = '未开始'
      if (student.currentStep >= 7 && hasQuestionnaire) {
        status = '已完成'
      } else if (student.currentStep > 0) {
        status = '进行中'
      }

      return {
        sessionId: student.sessionId,
        experimentId: student.experimentId || '未知',
        currentStep: student.currentStep || 0,
        completedSteps: student.completedSteps || 0,
        totalSteps: 7,
        status,
        hasQuestionnaire,
        totalConversations: student.totalConversations,
        totalClicks: student.totalClicks || 0,
        hasClicks: !!student.hasClicks,
        hasChats: !!student.hasChats,
        timeSpent, // 分钟
        firstActivity: student.firstActivity,
        lastActivity: student.lastActivity,
        questionnaireData: hasQuestionnaire
          ? {
              completedAt: questionnaire.completed_at,
              totalTime: questionnaire.total_time_minutes,
              abilityScore: questionnaire.ability_score_average,
              collaborationScore: questionnaire.collaboration_score_average,
            }
          : null,
      }
    })

    // 4. 应用状态筛选
    let filteredList = studentList
    if (status) {
      filteredList = studentList.filter((s) => s.status === status)
    }

    // 5. 应用时间范围筛选
    if (startDate || endDate) {
      filteredList = filteredList.filter((s) => {
        const lastActivity = new Date(s.lastActivity)
        if (startDate && lastActivity < new Date(startDate)) return false
        if (endDate && lastActivity > new Date(endDate)) return false
        return true
      })
    }

    // 6. 按最后活跃时间降序排序
    filteredList.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))

    // 7. 计算统计数据
    const statistics = {
      totalStudents: filteredList.length,
      completedStudents: filteredList.filter((s) => s.status === '已完成').length,
      inProgressStudents: filteredList.filter((s) => s.status === '进行中').length,
      notStartedStudents: filteredList.filter((s) => s.status === '未开始').length,
      averageTimeSpent: Math.round(
        filteredList.reduce((sum, s) => sum + s.timeSpent, 0) / filteredList.length || 0,
      ),
      averageConversations: Math.round(
        filteredList.reduce((sum, s) => sum + s.totalConversations, 0) / filteredList.length || 0,
      ),
      questionnaireSubmissionRate: filteredList.length
        ? Math.round(
            (filteredList.filter((s) => s.hasQuestionnaire).length / filteredList.length) * 100,
          )
        : 0,
    }

    console.log('✅ 学生列表统计:', statistics)

    res.status(200).json({
      success: true,
      data: {
        students: filteredList,
        statistics,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('❌ 获取学生列表失败:', error)
    res.status(500).json({
      success: false,
      error: '获取学生列表失败',
      details: error.message,
    })
  }
}
