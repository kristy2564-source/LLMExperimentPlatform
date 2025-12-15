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
    const studentStats = await conversationCollection
      .aggregate([
        { $match: conversationQuery },
        {
          $group: {
            _id: '$sessionId',
            experimentId: { $first: '$experimentId' },
            firstActivity: { $min: '$timestamp' },
            lastActivity: { $max: '$timestamp' },
            totalConversations: { $sum: 1 },
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
            currentStep: { $max: '$steps' },
            completedSteps: { $size: '$steps' },
            metadata: 1,
            _id: 0,
          },
        },
      ])
      .toArray()

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
