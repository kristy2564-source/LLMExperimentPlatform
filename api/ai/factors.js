// api/ai/factors.js - Step2 因素选择数据分析 API
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

/**
 * 因素分析 API
 * 支持多种查询模式：
 * - GET /api/ai/factors?mode=frequency - 因素频率统计
 * - GET /api/ai/factors?mode=category - 类别分布统计
 * - GET /api/ai/factors?mode=student&sessionId=xxx - 单个学生数据
 * - GET /api/ai/factors?mode=custom - 自定义因素分析
 * - GET /api/ai/factors?mode=ranking - 排序分析（关键vs次要）
 */
export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Experiment-ID',
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { mode, sessionId, experimentId, limit = 20 } = req.query

    console.log('📊 [因素分析] 请求:', { mode, sessionId, experimentId, limit })

    const client = await connectToDatabase()
    const db = client.db('llm_learning')
    const factorCollection = db.collection('factor_selections')

    let result

    switch (mode) {
      case 'frequency':
        result = await getFactorFrequency(factorCollection, experimentId, parseInt(limit))
        break

      case 'category':
        result = await getCategoryDistribution(factorCollection, experimentId)
        break

      case 'student':
        if (!sessionId) {
          return res.status(400).json({ error: '缺少 sessionId 参数' })
        }
        result = await getStudentFactors(factorCollection, sessionId)
        break

      case 'custom':
        result = await getCustomFactorsAnalysis(factorCollection, experimentId)
        break

      case 'ranking':
        result = await getRankingAnalysis(factorCollection, experimentId)
        break

      case 'summary':
        result = await getSummaryStatistics(factorCollection, experimentId)
        break

      default:
        return res.status(400).json({ error: '无效的 mode 参数' })
    }

    console.log('✅ [因素分析] 查询成功:', { mode, resultLength: result?.data?.length || 0 })

    res.status(200).json({
      success: true,
      mode,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ [因素分析] 失败:', error)
    res.status(500).json({
      error: '数据分析失败',
      details: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * 1️⃣ 因素频率统计
 * 统计所有学生选择每个因素的频率
 */
async function getFactorFrequency(collection, experimentId, limit) {
  const matchStage = experimentId ? { experimentId } : {}

  // 关键因素频率
  const keyFactorsFreq = await collection
    .aggregate([
      { $match: matchStage },
      { $unwind: '$keyFactors' },
      {
        $group: {
          _id: '$keyFactors.text',
          count: { $sum: 1 },
          category: { $first: '$keyFactors.category' },
          descriptions: { $addToSet: '$keyFactors.description' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          factor: '$_id',
          count: 1,
          category: 1,
          descriptions: 1,
          type: { $literal: 'key' },
        },
      },
    ])
    .toArray()

  // 次要因素频率
  const secondaryFactorsFreq = await collection
    .aggregate([
      { $match: matchStage },
      { $unwind: '$secondaryFactors' },
      {
        $group: {
          _id: '$secondaryFactors.text',
          count: { $sum: 1 },
          category: { $first: '$secondaryFactors.category' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          factor: '$_id',
          count: 1,
          category: 1,
          type: { $literal: 'secondary' },
        },
      },
    ])
    .toArray()

  // 合并并计算总数
  const totalStudents = await collection.countDocuments(matchStage)

  return {
    data: {
      keyFactors: keyFactorsFreq.map((f) => ({
        ...f,
        percentage: ((f.count / totalStudents) * 100).toFixed(1) + '%',
      })),
      secondaryFactors: secondaryFactorsFreq.map((f) => ({
        ...f,
        percentage: ((f.count / totalStudents) * 100).toFixed(1) + '%',
      })),
    },
    statistics: {
      totalStudents,
      uniqueKeyFactors: keyFactorsFreq.length,
      uniqueSecondaryFactors: secondaryFactorsFreq.length,
    },
  }
}

/**
 * 2️⃣ 类别分布统计
 * 统计环境、人员、设备、建筑、其他类别的分布
 */
async function getCategoryDistribution(collection, experimentId) {
  const matchStage = experimentId ? { experimentId } : {}

  const result = await collection
    .aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          avgEnvironment: { $avg: '$statistics.categoryDistribution.environment' },
          avgPeople: { $avg: '$statistics.categoryDistribution.people' },
          avgEquipment: { $avg: '$statistics.categoryDistribution.equipment' },
          avgBuilding: { $avg: '$statistics.categoryDistribution.building' },
          avgOthers: { $avg: '$statistics.categoryDistribution.others' },
          totalFactors: { $sum: '$totalCount' },
          totalKeyFactors: { $sum: '$statistics.keyFactorsCount' },
          totalSecondaryFactors: { $sum: '$statistics.secondaryFactorsCount' },
        },
      },
    ])
    .toArray()

  if (result.length === 0) {
    return {
      data: null,
      message: '暂无数据',
    }
  }

  const stats = result[0]

  return {
    data: {
      categoryAverages: {
        environment: parseFloat(stats.avgEnvironment.toFixed(2)),
        people: parseFloat(stats.avgPeople.toFixed(2)),
        equipment: parseFloat(stats.avgEquipment.toFixed(2)),
        building: parseFloat(stats.avgBuilding.toFixed(2)),
        others: parseFloat(stats.avgOthers.toFixed(2)),
      },
      totals: {
        students: stats.totalStudents,
        factors: stats.totalFactors,
        keyFactors: stats.totalKeyFactors,
        secondaryFactors: stats.totalSecondaryFactors,
        avgFactorsPerStudent: parseFloat((stats.totalFactors / stats.totalStudents).toFixed(2)),
      },
    },
  }
}

/**
 * 3️⃣ 单个学生数据查询
 * 查询特定学生的因素选择详情
 */
async function getStudentFactors(collection, sessionId) {
  const studentData = await collection.findOne({ sessionId })

  if (!studentData) {
    return {
      data: null,
      message: '未找到该学生的数据',
    }
  }

  return {
    data: {
      sessionId: studentData.sessionId,
      experimentId: studentData.experimentId,
      submittedAt: studentData.submittedAt,

      keyFactors: studentData.keyFactors,
      secondaryFactors: studentData.secondaryFactors,
      customFactors: studentData.customFactors,

      statistics: studentData.statistics,

      summary: {
        totalSelected: studentData.totalCount,
        hasCustomFactors: studentData.hasCustomFactors,
        categories: studentData.statistics.categoryDistribution,
      },
    },
  }
}

/**
 * 4️⃣ 自定义因素分析
 * 分析学生补充的自定义因素
 */
async function getCustomFactorsAnalysis(collection, experimentId) {
  const matchStage = experimentId
    ? { experimentId, hasCustomFactors: true }
    : { hasCustomFactors: true }

  const customFactors = await collection
    .find(matchStage, {
      projection: {
        sessionId: 1,
        customFactors: 1,
        'statistics.customFactorsLength': 1,
        submittedAt: 1,
      },
    })
    .sort({ 'statistics.customFactorsLength': -1 })
    .toArray()

  const totalStudents = await collection.countDocuments(experimentId ? { experimentId } : {})
  const studentsWithCustom = customFactors.length

  return {
    data: {
      customFactors: customFactors.map((doc) => ({
        sessionId: doc.sessionId,
        content: doc.customFactors,
        length: doc.statistics.customFactorsLength,
        submittedAt: doc.submittedAt,
      })),
    },
    statistics: {
      totalStudents,
      studentsWithCustom,
      percentage: ((studentsWithCustom / totalStudents) * 100).toFixed(1) + '%',
      avgLength:
        customFactors.length > 0
          ? (
              customFactors.reduce((sum, doc) => sum + doc.statistics.customFactorsLength, 0) /
              customFactors.length
            ).toFixed(1)
          : 0,
    },
  }
}

/**
 * 5️⃣ 排序分析
 * 分析因素排序规律（关键因素 vs 次要因素）
 */
async function getRankingAnalysis(collection, experimentId) {
  const matchStage = experimentId ? { experimentId } : {}

  // 分析哪些因素经常被排在前3
  const top3Factors = await collection
    .aggregate([
      { $match: matchStage },
      { $unwind: '$keyFactors' },
      {
        $group: {
          _id: '$keyFactors.text',
          count: { $sum: 1 },
          avgRank: { $avg: '$keyFactors.rank' },
          category: { $first: '$keyFactors.category' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          factor: '$_id',
          timesAsKey: '$count',
          avgRank: { $round: ['$avgRank', 2] },
          category: 1,
        },
      },
    ])
    .toArray()

  // 分析哪些因素经常被选为次要因素
  const secondaryFactors = await collection
    .aggregate([
      { $match: matchStage },
      { $unwind: '$secondaryFactors' },
      {
        $group: {
          _id: '$secondaryFactors.text',
          count: { $sum: 1 },
          category: { $first: '$secondaryFactors.category' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          factor: '$_id',
          timesAsSecondary: '$count',
          category: 1,
        },
      },
    ])
    .toArray()

  return {
    data: {
      topKeyFactors: top3Factors,
      topSecondaryFactors: secondaryFactors,
    },
    insights: {
      mostPopularKey: top3Factors[0]?.factor || null,
      mostPopularSecondary: secondaryFactors[0]?.factor || null,
    },
  }
}

/**
 * 6️⃣ 综合统计摘要
 * 提供整体数据概览
 */
async function getSummaryStatistics(collection, experimentId) {
  const matchStage = experimentId ? { experimentId } : {}

  const summary = await collection
    .aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          totalFactors: { $sum: '$totalCount' },
          avgFactorsPerStudent: { $avg: '$totalCount' },
          studentsWithCustom: {
            $sum: { $cond: ['$hasCustomFactors', 1, 0] },
          },
          avgKeyFactors: { $avg: '$statistics.keyFactorsCount' },
          avgSecondaryFactors: { $avg: '$statistics.secondaryFactorsCount' },
        },
      },
    ])
    .toArray()

  if (summary.length === 0) {
    return {
      data: null,
      message: '暂无数据',
    }
  }

  const stats = summary[0]

  // 获取最早和最晚提交时间
  const timeRange = await collection
    .aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          firstSubmission: { $min: '$submittedAt' },
          lastSubmission: { $max: '$submittedAt' },
        },
      },
    ])
    .toArray()

  return {
    data: {
      overview: {
        totalStudents: stats.totalStudents,
        totalFactors: stats.totalFactors,
        avgFactorsPerStudent: parseFloat(stats.avgFactorsPerStudent.toFixed(2)),
        avgKeyFactors: parseFloat(stats.avgKeyFactors.toFixed(2)),
        avgSecondaryFactors: parseFloat(stats.avgSecondaryFactors.toFixed(2)),
      },
      customFactors: {
        studentsWithCustom: stats.studentsWithCustom,
        percentage: ((stats.studentsWithCustom / stats.totalStudents) * 100).toFixed(1) + '%',
      },
      timeRange:
        timeRange.length > 0
          ? {
              first: timeRange[0].firstSubmission,
              last: timeRange[0].lastSubmission,
            }
          : null,
    },
  }
}
