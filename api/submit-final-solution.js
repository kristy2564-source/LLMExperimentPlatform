// api/submit-final-solution.js
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
  console.log('🚀 [提交最终方案] API 启动')
  console.log('⏰ 时间:', new Date().toISOString())

  // CORS 设置
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type, X-Experiment-ID',
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { sessionId, finalSolution, studentInitialDraft, componentSnapshots, submittedAt } =
      req.body

    console.log('📋 [提交最终方案] SessionID:', sessionId)
    console.log('📊 [提交最终方案] 方案长度:', finalSolution?.length)

    // 验证必填字段
    if (!sessionId || !finalSolution) {
      return res.status(400).json({
        error: '缺少必填字段',
        required: ['sessionId', 'finalSolution'],
      })
    }

    const client = await connectToDatabase()
    const db = client.db('llm_learning')

    // 1. 保存到 final_solutions 集合（完整记录）
    const finalSolutionsCollection = db.collection('final_solutions')

    const finalSolutionDoc = {
      sessionId,
      step: 6,
      studentInitialDraft: studentInitialDraft || null,
      studentFinalPlan: finalSolution,
      componentSnapshots: componentSnapshots || {},
      metadata: {
        finalSolutionLength: finalSolution.length,
        initialDraftLength: studentInitialDraft?.length || 0,
        hasStep2: !!componentSnapshots?.step2Final,
        hasStep3: !!componentSnapshots?.step3Final,
        hasStep4: !!componentSnapshots?.step4Final,
        hasStep5: !!componentSnapshots?.step5Final,
      },
      timestamps: {
        submittedAt: submittedAt || new Date().toISOString(),
        createdAt: new Date(),
      },
      experimentId: req.headers['x-experiment-id'] || null,
    }

    const result1 = await finalSolutionsCollection.insertOne(finalSolutionDoc)
    console.log('✅ [提交最终方案] 已保存到 final_solutions, ID:', result1.insertedId)

    // 2. 同时保存到 conversations 集合（保持一致性）
    const conversationsCollection = db.collection('conversations')

    const conversationDoc = {
      sessionId,
      step: 6,
      stage: 1,
      userInput: '[SUBMIT_FINAL_SOLUTION]',
      aiResponse: finalSolution,
      conversationCount: 999, // 标识为最终提交
      timestamp: new Date(),
      context: 'final_solution_submission',
      experimentId: req.headers['x-experiment-id'] || null,
      metadata: {
        type: 'student_final_solution',
        isFinalSubmission: true,
        componentSnapshots: componentSnapshots || {},
      },
    }

    const result2 = await conversationsCollection.insertOne(conversationDoc)
    console.log('✅ [提交最终方案] 已同步到 conversations, ID:', result2.insertedId)

    // 3. 返回成功响应
    res.status(200).json({
      success: true,
      message: '最终方案已成功保存',
      data: {
        finalSolutionId: result1.insertedId,
        conversationId: result2.insertedId,
        sessionId,
        submittedAt: finalSolutionDoc.timestamps.submittedAt,
      },
    })
  } catch (error) {
    console.error('❌ [提交最终方案] 失败:', error)
    res.status(500).json({
      error: '服务器错误',
      message: error.message,
    })
  }
}
