// api/questionnaire/query.js
import { MongoClient, ObjectId } from 'mongodb'

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
  // CORS设置
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type',
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const client = await connectToDatabase()
    const db = client.db('llm_learning')
    const questionnaireCollection = db.collection('questionnaires')
    const conversationCollection = db.collection('conversations')

    // 根据不同的查询类型处理
    const { queryType, sessionId, experimentId, startDate, endDate } = req.body || req.query

    let result

    switch (queryType) {
      case 'bySession':
        // 根据sessionId查询特定用户的问卷和行为数据
        if (!sessionId) {
          return res.status(400).json({ error: '缺少sessionId参数' })
        }

        const questionnaire = await questionnaireCollection.findOne({ sessionId })
        const conversations = await conversationCollection.find({ sessionId }).toArray()

        result = {
          questionnaire,
          conversations,
          summary: {
            hasQuestionnaire: !!questionnaire,
            conversationCount: conversations.length,
            totalMessages: conversations.reduce(
              (sum, conv) => sum + (conv.messages?.length || 0),
              0,
            ),
          },
        }
        break

      case 'statistics':
        // 统计分析
        const allQuestionnaires = await questionnaireCollection.find({}).toArray()

        result = {
          total: allQuestionnaires.length,
          categoryAverages: calculateCategoryAverages(allQuestionnaires),
          completionRates: calculateCompletionRates(allQuestionnaires),
          behaviorCorrelations: calculateCorrelations(allQuestionnaires),
        }
        break

      case 'export':
        // 导出所有数据
        const exportData = await questionnaireCollection.find({}).toArray()
        result = {
          count: exportData.length,
          data: exportData.map((q) => ({
            sessionId: q.sessionId,
            experimentId: q.experimentId,
            submittedAt: q.submittedAt,
            flatAnswers: q.flatAnswers,
            categoryScores: q.categoryScores,
            behaviorStats: q.behaviorStats,
          })),
        }
        break

      default:
        return res.status(400).json({ error: '无效的查询类型' })
    }

    res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('查询问卷数据失败:', error)
    res.status(500).json({
      error: '查询失败',
      details: error.message,
    })
  }
}

// 计算各分类平均分
function calculateCategoryAverages(questionnaires) {
  const totals = {
    ability: { sum: 0, count: 0 },
    collaboration: { sum: 0, count: 0 },
    experience: { sum: 0, count: 0 },
  }

  questionnaires.forEach((q) => {
    if (q.categoryScores) {
      Object.keys(totals).forEach((cat) => {
        if (q.categoryScores[cat]) {
          totals[cat].sum += q.categoryScores[cat].average
          totals[cat].count++
        }
      })
    }
  })

  return Object.keys(totals).reduce((acc, cat) => {
    const { sum, count } = totals[cat]
    acc[cat] = count > 0 ? Math.round((sum / count) * 100) / 100 : 0
    return acc
  }, {})
}

// 计算完成率
function calculateCompletionRates(questionnaires) {
  const total = questionnaires.length
  const completed = questionnaires.filter((q) => q.metadata?.completionRate === 100).length
  return {
    total,
    completed,
    rate: total > 0 ? Math.round((completed / total) * 10000) / 100 : 0,
  }
}

// 计算行为与问卷的相关性
function calculateCorrelations(questionnaires) {
  // 简化示例：计算消息数量与满意度的关系
  const data = questionnaires.map((q) => ({
    messageCount: q.behaviorStats?.totalMessages || 0,
    satisfaction: q.categoryScores?.experience?.average || 0,
  }))

  return {
    sampleSize: data.length,
    avgMessages: data.reduce((sum, d) => sum + d.messageCount, 0) / data.length,
    avgSatisfaction: data.reduce((sum, d) => sum + d.satisfaction, 0) / data.length,
  }
}
