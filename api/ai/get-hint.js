// api/ai/get-hint.js - 更新版本适配新步骤结构
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

function getHintPrompt(step, stage = 1) {
  console.log(`💡 getHintPrompt 被调用，step: ${step}, stage: ${stage}`)

  if (step === 2) {
    // Step2 的两个子阶段（更新后只有两个阶段）
    if (stage === 1) {
      // 阶段1：因素识别
      return `你是通风节能学习助手，帮助学生识别影响教室环境的多维度因素。

      教室数据：40学生，60㎡，8:00(22℃)→16:00(35℃)，西南风2.1m/s，湿度65%，空调3.2kW

      给出简短的分析角度提示：
      - 环境因素（温度、湿度、CO₂等）
      - 人员因素（密度、活动状态）
      - 设备因素（空调、通风设备）
      - 时间因素（课程安排、使用规律）
      - 空间因素（布局、位置）

      格式：💡 + 简洁提示，30字内，启发思考，不给答案。`
          } else if (stage === 2) {
            // 阶段2：控制设计
            return `你是智能控制系统学习助手，帮助学生思考控制逻辑设计。

      已识别因素：环境、人员、设备、时间、空间等多维度因素

      给出控制设计提示：
      - 触发条件和阈值设定
      - 控制逻辑和优先级排序
      - 冲突处理和故障应对
      - 自动化程度和手动干预
      - 系统反馈和状态监控

      格式：💡 + 简洁提示，35字内，技术导向，不给答案。`
    }
  } else if (step === 3) {
    return `你是策略分析助手。给学生关于节能策略制定和对比分析的提示(30字内)。

    重点提示方向：
    - 多个策略的对比分析
    - 不同天气条件的适用性
    - 成本效益和可行性评估
    - 风险控制和适用场景
    - 策略组合和优化

    用💡开头，语言亲切，不直接给答案。`
  } else if (step === 4) {
    return `你是用户体验设计助手。给学生关于提示词设计的提示(30字内)。

    重点提示方向：
    - 用户交互场景识别
    - 提示词模板结构设计
    - 不同用户群体需求
    - 简洁性与准确性平衡
    - 错误处理和引导机制

    用💬开头，强调用户体验，不直接给答案。`
  } else if (step === 5) {
    return `你是应急助手。给学生关于极端情况应急方案的提示(30字内)。

    应急情境：60人，37℃，考试环境

    重点提示方向：
    - 应急降温措施
    - 人员密度管理
    - 考试环境限制
    - 预冷和分流策略
    - 成本效益平衡

用🚨开头，突出紧迫性，不直接给答案。`
  } else if (step === 6) {
    return `你是系统优化助手。给学生关于系统优化和持续改进的提示(30字内)。

重点提示方向：
- 数据驱动的优化方法
- 参数调优和算法改进
- 用户反馈收集利用
- 系统性能指标设定
- 迭代改进机制设计

用⚙️开头，强调优化思维，不直接给答案。`
  } else if (step === 7) {
    return `你是学习反思助手。给学生关于自我反思和经验总结的提示(30字内)。

重点提示方向：
- 学习过程回顾总结
- 能力提升和收获分析
- 改进建议和未来规划
- 跨学科思维体现
- 创新思考和批判性思维

用🤔开头，启发深度思考，不直接给答案。`
  }

  return `你是学习助手。给学生简短提示(30字内)，不要直接给答案。用💡开头，语言亲切。`
}

function getFallbackHint(step, stage = 1) {
  if (step === 2) {
    if (stage === 1) {
      return '💡 想想环境、人员、设备、时间、空间等因素如何影响教室温度。'
    } else if (stage === 2) {
      return '💡 考虑什么条件下触发控制、如何设定优先级、怎样处理冲突。'
    }
  } else if (step === 3) {
    return '💡 从成本、效果、可行性、适用场景等角度对比不同策略。'
  } else if (step === 4) {
    return '💬 考虑用户使用场景、提示词结构、表达方式、错误处理等。'
  } else if (step === 5) {
    return '🚨 考虑预冷策略、人员分流、应急降温、环境限制等措施。'
  } else if (step === 6) {
    return '⚙️ 思考数据分析、参数优化、算法改进、用户反馈等方面。'
  } else if (step === 7) {
    return '🤔 回顾学习过程、总结收获、分析能力提升、规划未来。'
  }

  return '💡 可以从多个角度来分析这个问题。'
}

export default async function handler(req, res) {
  console.log('💡 get-hint API handler 开始执行（新步骤结构版）')
  console.log('📥 请求体:', JSON.stringify(req.body, null, 2))

  // 设置CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Experiment-ID',
  )

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS 请求处理完成')
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    console.log('❌ 非 POST 请求')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { context, step, stage, userInput, sessionId } = req.body

    console.log(`💡 处理帮助请求 Step${step}${stage ? `-Stage${stage}` : ''}`)
    console.log(`👤 用户输入: "${userInput || '无'}"`)
    console.log(`🔑 SessionID: ${sessionId}`)

    // 构建上下文消息
    let contextMessage
    if (step === 2 && stage) {
      // Step2 的两阶段
      const stageNames = ['因素识别', '控制设计']
      const stageName = stageNames[stage - 1] || '未知阶段'

      contextMessage = userInput
        ? `学生在${stageName}阶段，当前输入："${userInput}"。给个针对性提示。`
        : `学生在${stageName}阶段需要帮助提示。`
    } else {
      // 其他步骤
      const stepNames = {
        3: '策略论证',
        4: '提示词设计',
        5: '应急处理',
        6: '系统优化',
        7: '自我反思',
      }
      const stepName = stepNames[step] || `第${step}步`

      contextMessage = userInput
        ? `学生在${stepName}阶段，当前输入："${userInput}"。给个针对性提示。`
        : `学生在${stepName}阶段需要帮助提示。`
    }

    console.log('📝 构建上下文消息完成')

    // 获取提示词
    const hintSystemPrompt = getHintPrompt(step, stage)
    console.log('📝 获取提示词完成，长度:', hintSystemPrompt.length)

    // 根据阶段调整token数量
    const maxTokens = (step === 2 && stage === 2) || step >= 4 ? 120 : 100
    console.log('🔢 设置最大 tokens:', maxTokens)

    // 优化的OpenAI API调用
    // 优化的DeepSeek API调用
    console.log('🤖 开始调用 DeepSeek API...')
    const openaiResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: hintSystemPrompt,
          },
          {
            role: 'user',
            content: contextMessage,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
      }),
    })

    console.log('🤖 DeepSeek API 响应状态:', openaiResponse.status)

    const aiData = await openaiResponse.json()

    if (!openaiResponse.ok) {
      console.error('❌ DeepSeek API Error:', aiData)
      throw new Error(`DeepSeek API Error: ${aiData.error?.message}`)
    }

    const hint = aiData.choices[0].message.content.trim()
    console.log('✅ AI 提示获取成功，长度:', hint.length)

    // 立即返回响应
    const responseData = {
      hint,
      step: step,
      stage: stage,
      metadata: {
        tokenUsage: aiData.usage,
        processingTime: new Date().toISOString(),
        stepName: getStepName(step),
        stageName: step === 2 ? getStageName(stage) : null,
      },
    }

    console.log('📤 返回提示响应')
    res.status(200).json(responseData)

    // 异步保存提示记录
    console.log('💾 开始异步保存提示记录...')
    setImmediate(async () => {
      try {
        console.log('🔗 连接数据库保存提示记录...')
        const client = await connectToDatabase()
        const db = client.db('llm_learning')
        const collection = db.collection('conversations')

        // 根据step和stage确定场景类型
        let scenario = 'classroom_hint'
        if (step === 2) {
          const stageScenarios = ['factor_identification_hint', 'control_design_hint']
          scenario = stageScenarios[stage - 1] || 'classroom_hint'
        } else if (step === 3) {
          scenario = 'strategy_analysis_hint'
        } else if (step === 4) {
          scenario = 'prompt_design_hint'
        } else if (step === 5) {
          scenario = 'emergency_response_hint'
        } else if (step === 6) {
          scenario = 'system_optimization_hint'
        } else if (step === 7) {
          scenario = 'self_reflection_hint'
        }

        const documentToInsert = {
          sessionId,
          step: parseInt(step),
          stage: parseInt(stage) || null,
          userInput: '[HELP_REQUEST]',
          aiResponse: hint,
          context: `hint_request_step${step}${stage ? `_stage${stage}` : ''}`,
          timestamp: new Date(),
          metadata: {
            scenario: scenario,
            tokenUsage: aiData.usage,
            hintContext: {
              userHadInput: !!userInput,
              inputLength: userInput ? userInput.length : 0,
              stepInfo: {
                stepNumber: step,
                stepName: getStepName(step),
                hasStages: step === 2,
                currentStage: stage,
                stageName: step === 2 ? getStageName(stage) : null,
              },
            },
            version: 'v2_new_step_structure',
          },
        }

        console.log('📄 准备插入提示记录')

        const result = await collection.insertOne(documentToInsert)
        console.log('✅ 提示记录保存成功，insertedId:', result.insertedId)
      } catch (dbError) {
        console.error('❌ MongoDB异步保存提示记录错误:', dbError)
        console.error('❌ 错误堆栈:', dbError.stack)
      }
    })
  } catch (error) {
    console.error('❌ Hint API错误:', error)
    console.error('❌ 错误堆栈:', error.stack)

    // 根据step和stage返回不同的fallback提示
    const fallbackHint = getFallbackHint(step, stage)

    console.log('📤 返回fallback提示响应')
    res.status(500).json({
      error: '服务器错误',
      fallbackHint: fallbackHint,
      step: step,
      stage: stage,
      debugInfo: {
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString(),
      },
    })
  }
}

// 辅助函数：获取步骤名称
function getStepName(step) {
  const stepNames = {
    2: '问题分析',
    3: '策略论证',
    4: '提示词设计',
    5: '应急处理',
    6: '系统优化',
    7: '自我反思',
  }
  return stepNames[step] || `Step${step}`
}

// 辅助函数：获取阶段名称（仅适用于Step2）
function getStageName(stage) {
  if (!stage) return null
  const stageNames = ['因素识别', '控制设计']
  return stageNames[stage - 1] || `Stage${stage}`
}
