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
  console.log('🚀 [Step6提交] API 启动')
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
    const {
      sessionId,
      experimentId,
      studentName,
      step,
      solutionData,
      stepsDetails, // 🔥 接收各步骤详细信息
      editBehavior,
      similarityAnalysis,
      chatHistory,
      submittedAt,
    } = req.body

    console.log('📋 [Step6提交] SessionID:', sessionId)
    console.log('📊 [Step6提交] 最终方案长度:', solutionData?.finalPlan?.length || 0)
    console.log('📝 [Step2] 数据:', stepsDetails?.step2 ? '✅ 存在' : '❌ 缺失')
    console.log('📝 [Step3] 数据:', stepsDetails?.step3 ? '✅ 存在' : '❌ 缺失')
    console.log('📝 [Step4] 数据:', stepsDetails?.step4 ? '✅ 存在' : '❌ 缺失')
    console.log('📝 [Step5] 数据:', stepsDetails?.step5 ? '✅ 存在' : '❌ 缺失')
    console.log('💬 [对话] 历史数:', chatHistory?.length || 0)
    console.log('✏️ [编辑] 事件数:', editBehavior?.totalEditEvents || 0)
    console.log('📊 [相似度]:', similarityAnalysis?.overallSimilarity || 'N/A')

    // 验证必填字段
    if (!sessionId || !solutionData?.finalPlan) {
      return res.status(400).json({
        error: '缺少必填字段',
        required: ['sessionId', 'solutionData.finalPlan'],
      })
    }

    const client = await connectToDatabase()
    const db = client.db('llm_learning')
    const finalSolutionsCollection = db.collection('final_solutions')

    // 🔥 构建完整的文档（统一结构）
    const finalSolutionDoc = {
      // 基础信息
      sessionId,
      experimentId: experimentId || req.headers['x-experiment-id'],
      studentName: studentName || '未知',
      step: 6,

      // Step6 方案内容
      solutionData: {
        initialDraft: solutionData.initialDraft || '',
        finalPlan: solutionData.finalPlan, // ✅ 核心数据
        aiReference: solutionData.aiReference || null,
      },

      // 🔥 各步骤完整详细信息
      stepsDetails: {
        step2: stepsDetails?.step2 || null,
        step3: stepsDetails?.step3 || null,
        step4: stepsDetails?.step4 || null,
        step5: stepsDetails?.step5 || null,
      },

      // 编辑行为
      editBehavior: editBehavior || {
        editEvents: [],
        totalEditEvents: 0,
        hasUsedAIReference: false,
        aiReferenceUsageLog: [],
      },

      // 相似度分析
      similarityAnalysis: similarityAnalysis || null,

      // 对话历史
      chatHistory: chatHistory || [],

      // 元数据
      metadata: {
        // Step6 元数据
        finalPlanLength: solutionData.finalPlan?.length || 0,
        initialDraftLength: solutionData.initialDraft?.length || 0,
        aiReferenceLength: solutionData.aiReference?.length || 0,
        totalEditEvents: editBehavior?.totalEditEvents || 0,
        hasUsedAIReference: editBehavior?.hasUsedAIReference || false,
        chatHistoryCount: chatHistory?.length || 0,

        // 各步骤元数据
        step2: {
          hasContent: !!stepsDetails?.step2?.content,
          contentLength: stepsDetails?.step2?.content?.length || 0,
          hasStage1: !!stepsDetails?.step2?.stage1Content,
          hasStage2: !!stepsDetails?.step2?.stage2Content,
          wasConfirmed: stepsDetails?.step2?.wasConfirmed || false,
        },
        step3: {
          hasContent: !!stepsDetails?.step3?.content,
          contentLength: stepsDetails?.step3?.content?.length || 0,
          wasConfirmed: stepsDetails?.step3?.wasConfirmed || false,
        },
        step4: {
          hasContent: !!stepsDetails?.step4?.content,
          contentLength: stepsDetails?.step4?.content?.length || 0,
          wasConfirmed: stepsDetails?.step4?.wasConfirmed || false,
        },
        step5: {
          hasContent: !!stepsDetails?.step5?.content,
          contentLength: stepsDetails?.step5?.content?.length || 0,
          wasConfirmed: stepsDetails?.step5?.wasConfirmed || false,
        },

        // 相似度元数据
        hasSimilarityAnalysis: !!similarityAnalysis,
        overallSimilarity: similarityAnalysis?.overallSimilarity || null,
      },

      // 时间戳
      timestamps: {
        submittedAt: submittedAt || new Date().toISOString(),
        createdAt: new Date(),
        step2ConfirmedAt: stepsDetails?.step2?.confirmedAt || null,
        step3ConfirmedAt: stepsDetails?.step3?.confirmedAt || null,
        step4ConfirmedAt: stepsDetails?.step4?.confirmedAt || null,
        step5ConfirmedAt: stepsDetails?.step5?.confirmedAt || null,
      },
    }

    // 保存到数据库
    const result = await finalSolutionsCollection.insertOne(finalSolutionDoc)
    console.log('✅ [Step6提交] 已保存到 final_solutions, ID:', result.insertedId)

    // 返回成功响应
    res.status(200).json({
      success: true,
      message: 'Step6 方案已成功保存',
      data: {
        id: result.insertedId,
        sessionId,
        submittedAt: finalSolutionDoc.timestamps.submittedAt,
        metadata: finalSolutionDoc.metadata,
      },
    })
  } catch (error) {
    console.error('❌ [Step6提交] 失败:', error)
    res.status(500).json({
      error: '服务器错误',
      message: error.message,
    })
  }
}

// ==================== 处理 Step2 数据的辅助函数 ====================

/**
 * 处理 Step2 详细数据（保持原有逻辑）
 */
function processStep2Data(step2Details, componentSnapshots) {
  if (!step2Details && componentSnapshots?.step2Final) {
    return {
      stage1Content: '',
      stage2Content: '',
      completeContent: componentSnapshots.step2Final,
      wasConfirmed: false,
      wasEdited: false,
      hasTempSave: false,
      editCount: 0,
      editHistory: [],
      confirmedAt: null,
      lastEditedAt: null,
    }
  }

  if (!step2Details) {
    return {
      stage1Content: '',
      stage2Content: '',
      completeContent: '',
      wasConfirmed: false,
      wasEdited: false,
      hasTempSave: false,
      editCount: 0,
      editHistory: [],
      confirmedAt: null,
      lastEditedAt: null,
    }
  }

  return {
    stage1Content: step2Details.stage1Snapshot || step2Details.factorIdentification || '',
    stage2Content: step2Details.stage2Snapshot || step2Details.controlDesign || '',
    completeContent: step2Details.finalAnswerSnapshot || step2Details.completeAnalysis || '',
    wasConfirmed: step2Details.finalAnswerConfirmed || false,
    wasEdited: step2Details.wasEdited || false,
    hasTempSave: step2Details.hasTempSave || false,
    editCount: step2Details.editCount || 0,
    editHistory: step2Details.editHistory || [],
    confirmedAt: step2Details.confirmedAt || null,
    lastEditedAt: step2Details.lastEditedAt || null,
  }
}

// ==================== 🔥 新增：处理 Step3/4/5 数据的通用函数 ====================

/**
 * 处理 Step3/4/5 详细数据（通用）
 * @param {Object} stepDetails - 从前端传来的步骤详细信息
 * @param {string} fallbackContent - componentSnapshots 中的备用内容
 * @param {number} stepNumber - 步骤编号（用于日志）
 * @returns {Object} 处理后的步骤数据
 */
function processStepData(stepDetails, fallbackContent, stepNumber) {
  // 如果没有提供 stepDetails，尝试使用 fallbackContent
  if (!stepDetails && fallbackContent) {
    console.log(`📋 [Step${stepNumber}] 使用 fallback 内容`)
    return {
      content: fallbackContent,
      wasConfirmed: false,
      confirmedAt: null,
      contentLength: fallbackContent.length || 0,
    }
  }

  // 如果没有任何数据
  if (!stepDetails) {
    console.log(`⚠️ [Step${stepNumber}] 没有数据`)
    return {
      content: '',
      wasConfirmed: false,
      confirmedAt: null,
      contentLength: 0,
    }
  }

  // 处理完整的步骤数据
  const content = stepDetails.content || stepDetails.finalAnswerSnapshot || ''
  console.log(`✅ [Step${stepNumber}] 内容长度: ${content.length}`)

  return {
    content,
    wasConfirmed: stepDetails.wasConfirmed !== undefined ? stepDetails.wasConfirmed : true,
    confirmedAt: stepDetails.confirmedAt || null,
    contentLength: content.length,
  }
}
