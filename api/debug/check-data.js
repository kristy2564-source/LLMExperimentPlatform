// api/debug/check-data.js - 更新版本适配新步骤结构
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
    const { sessionId, action } = req.body

    console.log('🔍 调试API被调用:', { sessionId, action })

    if (action === 'check_conversations') {
      const client = await connectToDatabase()
      const db = client.db('llm_learning')
      const collection = db.collection('conversations')

      // 查询该sessionId的所有记录
      const allRecords = await collection.find({ sessionId }).toArray()
      console.log('📊 找到记录数量:', allRecords.length)

      // 按step分组统计
      const stepCounts = {}
      const stepSamples = {}

      allRecords.forEach((record) => {
        const step = record.step
        stepCounts[step] = (stepCounts[step] || 0) + 1

        // 收集每个step的样例数据
        if (!stepSamples[step]) {
          stepSamples[step] = []
        }
        if (stepSamples[step].length < 2) {
          stepSamples[step].push({
            userInput: record.userInput?.substring(0, 100) + '...',
            timestamp: record.timestamp,
            hasAiResponse: !!record.aiResponse,
            metadata: record.metadata,
            stage: record.stage || null,
          })
        }
      })

      // 获取最新记录
      const sortedRecords = allRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      const latestRecord = sortedRecords.length > 0 ? sortedRecords[0] : null

      // 检查数据库连接状态
      const dbStats = await db.stats()

      // 新步骤结构的统计
      const stepDescriptions = {
        2: '问题分析（因素识别与控制设计）',
        3: '策略论证（方案比较与分析）',
        4: '提示词设计（用户交互界面）',
        5: '应急处理（极端情况应对）',
        6: '系统优化（完善与改进）',
        7: '自我反思（学习总结）',
      }

      const debugResult = {
        success: true,
        queryInfo: {
          sessionId,
          databaseName: 'llm_learning',
          collectionName: 'conversations',
          queryTime: new Date().toISOString(),
          stepStructureVersion: 'v2_with_prompt_design',
        },
        databaseInfo: {
          connected: true,
          dbSize: dbStats.dataSize,
          collections: dbStats.collections,
        },
        dataAnalysis: {
          totalRecords: allRecords.length,
          stepCounts,
          // 更新步骤统计（支持字符串和数字类型）
          step2Count: (stepCounts[2] || 0) + (stepCounts['2'] || 0),
          step3Count: (stepCounts[3] || 0) + (stepCounts['3'] || 0),
          step4Count: (stepCounts[4] || 0) + (stepCounts['4'] || 0), // 新增：提示词设计
          step5Count: (stepCounts[5] || 0) + (stepCounts['5'] || 0), // 原Step4：应急处理
          step6Count: (stepCounts[6] || 0) + (stepCounts['6'] || 0), // 原Step5：系统优化
          step7Count: (stepCounts[7] || 0) + (stepCounts['7'] || 0), // 新增：自我反思
          stepSamples,
          stepDescriptions,
        },
        progressAnalysis: {
          completedSteps: [],
          missingSteps: [],
          progressPercentage: 0,
        },
        latestRecord: latestRecord
          ? {
              step: latestRecord.step,
              stepType: typeof latestRecord.step,
              stepDescription: stepDescriptions[latestRecord.step] || '未知步骤',
              stage: latestRecord.stage || null,
              timestamp: latestRecord.timestamp,
              userInput: latestRecord.userInput?.substring(0, 100),
              hasAiResponse: !!latestRecord.aiResponse,
              context: latestRecord.context,
              metadata: latestRecord.metadata,
            }
          : null,
        allSessionIds: await collection.distinct('sessionId'),
        recommendedActions: [],
      }

      // 分析进度和提供建议
      const steps = [2, 3, 4, 5, 6]
      const stepData = {}

      steps.forEach((stepNum) => {
        const count = (stepCounts[stepNum] || 0) + (stepCounts[stepNum.toString()] || 0)
        stepData[stepNum] = count
        if (count > 0) {
          debugResult.progressAnalysis.completedSteps.push({
            step: stepNum,
            description: stepDescriptions[stepNum],
            recordCount: count,
          })
        } else {
          debugResult.progressAnalysis.missingSteps.push({
            step: stepNum,
            description: stepDescriptions[stepNum],
          })
        }
      })

      // 计算完成百分比
      debugResult.progressAnalysis.progressPercentage = Math.round(
        (debugResult.progressAnalysis.completedSteps.length / steps.length) * 100,
      )

      // 生成建议
      if (debugResult.dataAnalysis.totalRecords === 0) {
        debugResult.recommendedActions.push('未找到任何记录，请检查SessionID是否正确')
      } else {
        if (stepData[2] === 0) {
          debugResult.recommendedActions.push(
            '缺少Step2数据，请完成问题分析阶段（因素识别与控制设计）',
          )
        }
        if (stepData[3] === 0) {
          debugResult.recommendedActions.push('缺少Step3数据，请完成策略论证阶段（方案比较与分析）')
        }
        if (stepData[4] === 0) {
          debugResult.recommendedActions.push('缺少Step4数据，请完成提示词设计阶段（用户交互界面）')
        }
        if (stepData[5] === 0) {
          debugResult.recommendedActions.push('缺少Step5数据，请完成应急处理阶段（极端情况应对）')
        }
        if (stepData[6] === 0) {
          debugResult.recommendedActions.push('缺少Step6数据，请完成系统优化阶段（完善与改进）')
        }

        if (debugResult.progressAnalysis.completedSteps.length >= 4) {
          debugResult.recommendedActions.push('数据较完整，可以生成完整方案')
        } else if (debugResult.progressAnalysis.completedSteps.length >= 2) {
          debugResult.recommendedActions.push('部分数据完整，可以生成基础方案')
        }

        if (stepData[7] > 0) {
          debugResult.recommendedActions.push('包含自我反思数据，可进行完整学习评估')
        }
      }

      // 检查Step2的阶段数据
      if (stepData[2] > 0) {
        const step2Records = allRecords.filter((r) => r.step === 2 || r.step === '2')
        const stage1Records = step2Records.filter((r) => r.stage === 1 || r.stage === '1')
        const stage2Records = step2Records.filter((r) => r.stage === 2 || r.stage === '2')

        debugResult.dataAnalysis.step2StageAnalysis = {
          totalStep2Records: step2Records.length,
          stage1Records: stage1Records.length, // 因素识别
          stage2Records: stage2Records.length, // 控制设计
          hasCompleteStages: stage1Records.length > 0 && stage2Records.length > 0,
        }

        if (!debugResult.dataAnalysis.step2StageAnalysis.hasCompleteStages) {
          if (stage1Records.length === 0) {
            debugResult.recommendedActions.push('Step2缺少因素识别阶段数据')
          }
          if (stage2Records.length === 0) {
            debugResult.recommendedActions.push('Step2缺少控制设计阶段数据')
          }
        }
      }

      console.log('📋 调试结果:', debugResult)

      res.status(200).json(debugResult)
    } else if (action === 'list_all_sessions') {
      // 列出所有会话ID
      const client = await connectToDatabase()
      const db = client.db('llm_learning')
      const collection = db.collection('conversations')

      const allSessions = await collection.distinct('sessionId')
      const sessionStats = {}

      for (const sid of allSessions) {
        const count = await collection.countDocuments({ sessionId: sid })
        const latest = await collection.findOne({ sessionId: sid }, { sort: { timestamp: -1 } })

        // 统计各步骤完成情况
        const stepProgress = {}
        for (let step = 2; step <= 7; step++) {
          const stepCount = await collection.countDocuments({
            sessionId: sid,
            $or: [{ step: step }, { step: step.toString() }],
          })
          stepProgress[step] = stepCount
        }

        sessionStats[sid] = {
          recordCount: count,
          latestActivity: latest?.timestamp,
          latestStep: latest?.step,
          stepProgress,
          completedSteps: Object.keys(stepProgress).filter((step) => stepProgress[step] > 0).length,
          progressPercentage: Math.round(
            (Object.keys(stepProgress).filter((step) => stepProgress[step] > 0).length / 5) * 100,
          ),
        }
      }

      res.status(200).json({
        success: true,
        totalSessions: allSessions.length,
        sessions: allSessions,
        sessionStats,
        stepStructure: {
          2: '问题分析（因素识别与控制设计）',
          3: '策略论证（方案比较与分析）',
          4: '提示词设计（用户交互界面）',
          5: '应急处理（极端情况应对）',
          6: '系统优化（完善与改进）',
          7: '自我反思（学习总结）',
        },
        version: 'v2_with_prompt_design',
      })
    } else if (action === 'analyze_step_distribution') {
      // 新增：分析步骤分布
      const client = await connectToDatabase()
      const db = client.db('llm_learning')
      const collection = db.collection('conversations')

      const pipeline = [
        { $match: { sessionId: sessionId } },
        {
          $group: {
            _id: '$step',
            count: { $sum: 1 },
            latestTimestamp: { $max: '$timestamp' },
            stages: { $addToSet: '$stage' },
          },
        },
        { $sort: { _id: 1 } },
      ]

      const stepDistribution = await collection.aggregate(pipeline).toArray()

      res.status(200).json({
        success: true,
        sessionId,
        stepDistribution,
        analysis: {
          totalSteps: stepDistribution.length,
          mostActiveStep: stepDistribution.reduce(
            (max, current) => (current.count > (max?.count || 0) ? current : max),
            null,
          ),
          timeline: stepDistribution.map((step) => ({
            step: step._id,
            lastActivity: step.latestTimestamp,
            recordCount: step.count,
            stages: step.stages.filter((s) => s != null),
          })),
        },
      })
    } else {
      res.status(400).json({
        error:
          'Unknown action. Use "check_conversations", "list_all_sessions", or "analyze_step_distribution"',
      })
    }
  } catch (error) {
    console.error('❌ 调试API错误:', error)
    res.status(500).json({
      success: false,
      error: '调试查询失败',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })
  }
}
