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
      // 🔥 新增：解构快照相关字段
      isFinalSnapshot,
      finalAnswerContent,
      ...conversationData
    } = req.body

    const experimentId = req.headers['x-experiment-id']

    console.log('💾 [保存对话] 开始:', {
      sessionId: conversationData.sessionId,
      step: conversationData.step,
      stage: conversationData.stage,
      experimentId,
      isFinalSnapshot: isFinalSnapshot || false,
      timestamp: new Date().toISOString(), // 🔥 新增时间戳
    })

    // 连接数据库
    const client = await connectToDatabase()
    const db = client.db('llm_learning')

    // ----------- 1️⃣ 保存对话记录（主业务） -----------
    const conversationCollection = db.collection('conversations')

    // 🔥 修改：构建包含快照信息的文档
    const conversationDoc = {
      ...conversationData,
      experimentId,
      // 🔥 新增：保存快照标记和内容到 metadata
      metadata: {
        isFinalSnapshot: isFinalSnapshot || false,
        finalAnswerContent: finalAnswerContent || null,
        // 保留原有的 metadata（如果有）
        ...(conversationData.metadata || {}),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await conversationCollection.insertOne(conversationDoc)

    console.log('✅ [保存对话] 成功, ID:', result.insertedId, {
      createdAt: conversationDoc.createdAt.toISOString(), // 🔥 新增
      updatedAt: conversationDoc.updatedAt.toISOString(), // 🔥 新增
      sessionId: conversationDoc.sessionId, // 🔥 新增：方便追踪
    })

    // 🔥 新增：如果是最终快照，额外记录日志
    if (isFinalSnapshot) {
      console.log(`📸 [最终快照] Step${conversationData.step} 快照已保存到数据库`)
      console.log(`📋 [快照内容] 长度: ${finalAnswerContent?.length || 0} 字符`)
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
          conversationId: result.insertedId, // 关联对话记录
          event_data: event_data || {}, // 自定义事件数据
          // 🔥 新增：如果是快照，在事件中也标记
          isFinalSnapshot: isFinalSnapshot || false,
          timestamp: new Date(),
        })
        console.log('📊 [事件埋点] 记录成功:', event_name)
      } catch (eventError) {
        // 埋点失败不影响主业务，只记录日志
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
      // 🔥 新增：返回快照保存状态
      snapshotSaved: isFinalSnapshot || false,
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
