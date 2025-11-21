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
    const {
      sessionId,
      finalSolution,
      studentInitialDraft,
      componentSnapshots,
      submittedAt,
      // 🔥 各步骤详细数据
      step2Details,
      step3Details,
      step4Details,
      step5Details,
    } = req.body

    console.log('📋 [提交最终方案] SessionID:', sessionId)
    console.log('📊 [提交最终方案] 方案长度:', finalSolution?.length)
    console.log('📝 [Step2详情] 是否包含:', !!step2Details)
    console.log('📝 [Step3详情] 是否包含:', !!step3Details)
    console.log('📝 [Step4详情] 是否包含:', !!step4Details)
    console.log('📝 [Step5详情] 是否包含:', !!step5Details)

    // 验证必填字段
    if (!sessionId || !finalSolution) {
      return res.status(400).json({
        error: '缺少必填字段',
        required: ['sessionId', 'finalSolution'],
      })
    }

    const client = await connectToDatabase()
    const db = client.db('llm_learning')

    // 🔥 处理各步骤详细数据
    const step2ProcessedData = processStep2Data(step2Details, componentSnapshots)
    const step3ProcessedData = processStepData(step3Details, componentSnapshots?.step3Final, 3)
    const step4ProcessedData = processStepData(step4Details, componentSnapshots?.step4Final, 4)
    const step5ProcessedData = processStepData(step5Details, componentSnapshots?.step5Final, 5)

    // 1. 保存到 final_solutions 集合（完整记录）
    const finalSolutionsCollection = db.collection('final_solutions')

    const finalSolutionDoc = {
      sessionId,
      step: 6,
      studentInitialDraft: studentInitialDraft || null,
      studentFinalPlan: finalSolution,
      componentSnapshots: componentSnapshots || {},

      // 🔥 Step2 详细信息（因素识别 + 控制设计）
      step2Analysis: {
        factorIdentification: step2ProcessedData.stage1Content,
        controlDesign: step2ProcessedData.stage2Content,
        completeAnalysis: step2ProcessedData.completeContent,
        wasConfirmed: step2ProcessedData.wasConfirmed,
        editHistory: step2ProcessedData.editHistory || [],
        editCount: step2ProcessedData.editCount || 0,
        lastEditedAt: step2ProcessedData.lastEditedAt,
      },

      // 🔥 Step3 详细信息（方案设计）
      step3Analysis: {
        content: step3ProcessedData.content,
        wasConfirmed: step3ProcessedData.wasConfirmed,
        confirmedAt: step3ProcessedData.confirmedAt,
        contentLength: step3ProcessedData.contentLength,
      },

      // 🔥 Step4 详细信息（提示词设计）
      step4Analysis: {
        content: step4ProcessedData.content,
        wasConfirmed: step4ProcessedData.wasConfirmed,
        confirmedAt: step4ProcessedData.confirmedAt,
        contentLength: step4ProcessedData.contentLength,
      },

      // 🔥 Step5 详细信息（应急调整）
      step5Analysis: {
        content: step5ProcessedData.content,
        wasConfirmed: step5ProcessedData.wasConfirmed,
        confirmedAt: step5ProcessedData.confirmedAt,
        contentLength: step5ProcessedData.contentLength,
      },

      metadata: {
        finalSolutionLength: finalSolution.length,
        initialDraftLength: studentInitialDraft?.length || 0,
        hasStep2: !!componentSnapshots?.step2Final || !!step2ProcessedData.completeContent,
        hasStep3: !!componentSnapshots?.step3Final || !!step3ProcessedData.content,
        hasStep4: !!componentSnapshots?.step4Final || !!step4ProcessedData.content,
        hasStep5: !!componentSnapshots?.step5Final || !!step5ProcessedData.content,

        // Step2 元数据
        step2Metadata: {
          stage1Length: step2ProcessedData.stage1Content?.length || 0,
          stage2Length: step2ProcessedData.stage2Content?.length || 0,
          totalEditCount: step2ProcessedData.editCount || 0,
          wasManuallyEdited: step2ProcessedData.wasEdited || false,
          hasTempSave: step2ProcessedData.hasTempSave || false,
        },

        // 🔥 Step3-5 元数据
        step3Metadata: {
          contentLength: step3ProcessedData.contentLength || 0,
          wasConfirmed: step3ProcessedData.wasConfirmed || false,
        },
        step4Metadata: {
          contentLength: step4ProcessedData.contentLength || 0,
          wasConfirmed: step4ProcessedData.wasConfirmed || false,
        },
        step5Metadata: {
          contentLength: step5ProcessedData.contentLength || 0,
          wasConfirmed: step5ProcessedData.wasConfirmed || false,
        },
      },

      timestamps: {
        submittedAt: submittedAt || new Date().toISOString(),
        createdAt: new Date(),
        // Step2 相关时间
        step2ConfirmedAt: step2ProcessedData.confirmedAt || null,
        step2LastEditedAt: step2ProcessedData.lastEditedAt || null,
        // 🔥 Step3-5 相关时间
        step3ConfirmedAt: step3ProcessedData.confirmedAt || null,
        step4ConfirmedAt: step4ProcessedData.confirmedAt || null,
        step5ConfirmedAt: step5ProcessedData.confirmedAt || null,
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

        // 🔥 各步骤分析摘要
        stepAnalysisSummary: {
          step2: {
            factorIdentification: step2ProcessedData.stage1Content,
            controlDesign: step2ProcessedData.stage2Content,
          },
          step3: {
            content: step3ProcessedData.content,
          },
          step4: {
            content: step4ProcessedData.content,
          },
          step5: {
            content: step5ProcessedData.content,
          },
        },
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
        // 🔥 返回各步骤处理结果
        stepsProcessed: {
          step2: {
            hasFactorIdentification: !!step2ProcessedData.stage1Content,
            hasControlDesign: !!step2ProcessedData.stage2Content,
            wasEdited: step2ProcessedData.wasEdited,
            editCount: step2ProcessedData.editCount,
          },
          step3: {
            hasContent: !!step3ProcessedData.content,
            contentLength: step3ProcessedData.contentLength,
            wasConfirmed: step3ProcessedData.wasConfirmed,
          },
          step4: {
            hasContent: !!step4ProcessedData.content,
            contentLength: step4ProcessedData.contentLength,
            wasConfirmed: step4ProcessedData.wasConfirmed,
          },
          step5: {
            hasContent: !!step5ProcessedData.content,
            contentLength: step5ProcessedData.contentLength,
            wasConfirmed: step5ProcessedData.wasConfirmed,
          },
        },
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
