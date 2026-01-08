// api/conversations/save.js
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
    const {
      event_name,
      event_data,
      isFinalSnapshot,
      finalAnswerContent,
      rankedFactorsData, // 🔥 新增：接收因素数据
      ...conversationData
    } = req.body

    const experimentId = req.headers['x-experiment-id']

    console.log('💾 [保存对话] 开始:', {
      sessionId: conversationData.sessionId,
      step: conversationData.step,
      stage: conversationData.stage,
      experimentId,
      isFinalSnapshot: isFinalSnapshot || false,
      hasRankedFactorsData: !!rankedFactorsData, // 🔥 新增日志
      timestamp: new Date().toISOString(),
    })

    // 连接数据库
    const client = await connectToDatabase()
    const db = client.db('llm_learning')

    // ----------- 1️⃣ 保存对话记录（主业务） -----------
    const conversationCollection = db.collection('conversations')

    // 🔥 修改：构建包含因素数据的文档
    const conversationDoc = {
      ...conversationData,
      experimentId,
      metadata: {
        isFinalSnapshot: isFinalSnapshot || false,
        finalAnswerContent: finalAnswerContent || null,
        // 🔥 新增：保存因素数据到 metadata
        factorSelectionData: rankedFactorsData || null,
        ...(conversationData.metadata || {}),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await conversationCollection.insertOne(conversationDoc)

    console.log('✅ [保存对话] 成功, ID:', result.insertedId, {
      createdAt: conversationDoc.createdAt.toISOString(),
      updatedAt: conversationDoc.updatedAt.toISOString(),
      sessionId: conversationDoc.sessionId,
    })

    // 🔥 新增：如果是最终快照，额外记录日志
    if (isFinalSnapshot) {
      console.log(`📸 [最终快照] Step${conversationData.step} 快照已保存到数据库`)
      console.log(`📋 [快照内容] 长度: ${finalAnswerContent?.length || 0} 字符`)
    }

    // 🔥 新增：如果有因素数据，保存到专门的集合
    if (rankedFactorsData && conversationData.step === 2 && conversationData.stage === 1) {
      try {
        await saveFactorSelectionToCollection(db, {
          sessionId: conversationData.sessionId,
          experimentId,
          conversationId: result.insertedId,
          rankedFactorsData,
          userInput: conversationData.userInput,
          timestamp: new Date(),
        })
        console.log('✅ [因素选择] 已保存到 factor_selections 集合')
      } catch (factorError) {
        // 因素保存失败不阻塞主流程
        console.error('⚠️ [因素选择] 保存失败 (非关键):', factorError.message)
      }
    }

    // ----------- 2️⃣ 记录事件埋点（可选，不阻塞主业务） -----------
    if (event_name) {
      try {
        const eventsCollection = db.collection('events')
        await eventsCollection.insertOne({
          event_name,
          sessionId: conversationData.sessionId,
          experimentId,
          step: conversationData.step,
          stage: conversationData.stage,
          conversationId: result.insertedId,
          event_data: event_data || {},
          isFinalSnapshot: isFinalSnapshot || false,
          // 🔥 新增：如果有因素数据，在事件中也记录
          hasFactorSelection: !!rankedFactorsData,
          timestamp: new Date(),
        })
        console.log('📊 [事件埋点] 记录成功:', event_name)
      } catch (eventError) {
        console.error('⚠️ [事件埋点] 失败 (非关键):', eventError.message)
      }
    }

    // 🔥 新增：如果是 Step6 的最终方案提交，额外标记
    if (conversationData.step === 6 && conversationData.context === 'final_solution_submission') {
      console.log('🎯 [Step6] 检测到最终方案提交')
    }

    res.status(200).json({
      success: true,
      id: result.insertedId,
      snapshotSaved: isFinalSnapshot || false,
      factorSelectionSaved: !!rankedFactorsData, // 🔥 新增：返回因素保存状态
    })
  } catch (error) {
    console.error('❌ [保存对话] 失败:', error)
    res.status(500).json({
      error: '保存对话失败',
      details: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * 🔥 新增函数：保存因素选择到专门的集合
 * @param {Object} db - 数据库实例
 * @param {Object} data - 因素数据
 */
async function saveFactorSelectionToCollection(db, data) {
  const factorCollection = db.collection('factor_selections')

  const { sessionId, experimentId, conversationId, rankedFactorsData, userInput, timestamp } = data

  // 构建因素选择文档
  const factorDoc = {
    sessionId,
    experimentId,
    conversationId, // 关联到对话记录
    step: 2,
    stage: 1,

    // ===== 核心因素数据 =====
    isRanked: rankedFactorsData.isRanked,
    totalCount: rankedFactorsData.totalCount,

    // 关键因素（前3个）
    keyFactors: rankedFactorsData.keyFactors.map((f, index) => ({
      rank: index + 1,
      text: f.text,
      description: f.description,
      category: categorizeFactor(f.text), // 🔥 自动分类
    })),

    // 次要因素（第4个及以后）
    secondaryFactors: rankedFactorsData.secondaryFactors.map((text, index) => ({
      rank: index + 4, // 继续排序
      text,
      category: categorizeFactor(text),
    })),

    // 自定义因素
    customFactors: rankedFactorsData.customFactors || null,
    hasCustomFactors: !!rankedFactorsData.customFactors,

    // ===== 统计信息 =====
    statistics: {
      keyFactorsCount: rankedFactorsData.keyFactors.length,
      secondaryFactorsCount: rankedFactorsData.secondaryFactors.length,
      customFactorsLength: rankedFactorsData.customFactors?.length || 0,

      // 按类别统计
      categoryDistribution: calculateCategoryDistribution(
        rankedFactorsData.keyFactors,
        rankedFactorsData.secondaryFactors,
      ),
    },

    // ===== 原始用户输入 =====
    rawUserInput: userInput,

    // ===== 时间戳 =====
    submittedAt: timestamp,
    createdAt: new Date(),
  }

  // 保存到数据库
  const result = await factorCollection.insertOne(factorDoc)

  console.log('📊 [因素统计]:', {
    sessionId,
    totalFactors: factorDoc.totalCount,
    keyFactors: factorDoc.keyFactors.map((f) => f.text).join(', '),
    categoryDistribution: factorDoc.statistics.categoryDistribution,
  })

  return result.insertedId
}

/**
 * 🔥 新增函数：自动分类因素
 * @param {string} factorText - 因素文本
 * @returns {string} - 类别名称
 */
function categorizeFactor(factorText) {
  const text = factorText.toLowerCase()

  // 环境因素
  if (
    text.includes('温度') ||
    text.includes('湿度') ||
    text.includes('co2') ||
    text.includes('风速') ||
    text.includes('风向') ||
    text.includes('天气') ||
    text.includes('气候')
  ) {
    return 'environment'
  }

  // 人员因素
  if (
    text.includes('人数') ||
    text.includes('学生') ||
    text.includes('活动') ||
    text.includes('课程') ||
    text.includes('时长') ||
    text.includes('人员')
  ) {
    return 'people'
  }

  // 设备因素
  if (
    text.includes('空调') ||
    text.includes('窗户') ||
    text.includes('风扇') ||
    text.includes('排气') ||
    text.includes('功率') ||
    text.includes('设备')
  ) {
    return 'equipment'
  }

  // 建筑因素
  if (
    text.includes('朝向') ||
    text.includes('窗帘') ||
    text.includes('面积') ||
    text.includes('布局') ||
    text.includes('座位') ||
    text.includes('教室')
  ) {
    return 'building'
  }

  // 其他
  return 'others'
}

/**
 * 🔥 新增函数：计算类别分布
 * @param {Array} keyFactors - 关键因素
 * @param {Array} secondaryFactors - 次要因素
 * @returns {Object} - 类别统计
 */
function calculateCategoryDistribution(keyFactors, secondaryFactors) {
  const distribution = {
    environment: 0,
    people: 0,
    equipment: 0,
    building: 0,
    others: 0,
  }

  // 统计关键因素
  keyFactors.forEach((f) => {
    const category = categorizeFactor(f.text)
    distribution[category]++
  })

  // 统计次要因素
  secondaryFactors.forEach((text) => {
    const category = categorizeFactor(text)
    distribution[category]++
  })

  return distribution
}
