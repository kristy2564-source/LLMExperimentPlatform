// api/ai/generate-solution.js - 修复版：纯文本输出 + 重试机制
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

// 从数据库获取完整对话历史（Step2-6）
// 🔥 返回对象包含 stepGroups 和 finalSnapshots
async function getCompleteConversationHistory(sessionId) {
  try {
    console.log('📚 [获取历史] 开始查询 SessionID:', sessionId)

    const client = await connectToDatabase()
    const db = client.db('llm_learning')
    const conversationsCollection = db.collection('conversations')

    // 1. 查询 Step2-6 的所有对话
    const conversations = await conversationsCollection
      .find({
        sessionId,
        step: { $in: [2, 3, 4, 5, 6] },
      })
      .sort({ step: 1, timestamp: 1 })
      .toArray()

    console.log('✅ [获取历史] 找到对话记录数:', conversations.length)

    // 2. 按步骤分组
    const stepGroups = {
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    }

    // 3. 🔥 同时提取最终快照（如果有）
    const finalSnapshots = {
      2: null,
      3: null,
      4: null,
      5: null,
    }

    conversations.forEach((conv) => {
      const step = parseInt(conv.step)

      if (stepGroups[step]) {
        stepGroups[step].push({
          userInput: conv.userInput,
          aiResponse: conv.aiResponse,
          timestamp: conv.timestamp,
        })
      }

      // 🔥 提取标记为最终快照的记录
      if (conv.metadata?.isFinalSnapshot && conv.metadata?.finalAnswerContent) {
        finalSnapshots[step] = conv.metadata.finalAnswerContent
      }
    })

    console.log('📊 [获取历史] 各步骤对话数:', {
      step2: stepGroups[2].length,
      step3: stepGroups[3].length,
      step4: stepGroups[4].length,
      step5: stepGroups[5].length,
      step6: stepGroups[6].length,
    })

    console.log('📸 [获取历史] 找到最终快照:', {
      step2: !!finalSnapshots[2],
      step3: !!finalSnapshots[3],
      step4: !!finalSnapshots[4],
      step5: !!finalSnapshots[5],
    })

    return {
      stepGroups,
      finalSnapshots,
    }
  } catch (error) {
    console.error('❌ [获取历史] 失败:', error)
    return null
  }
}

// 🔥 核心函数：生成方案（带重试）
// 🔥 修复：正确解构 getCompleteConversationHistory 的返回值
async function generateSolutionWithRetry(sessionId, maxRetries = 2) {
  console.log('🔄 [方案生成] 开始，最大重试次数:', maxRetries)

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n${'='.repeat(60)}`)
      console.log(`🎯 [尝试 ${attempt + 1}/${maxRetries + 1}] 开始生成方案...`)
      console.log('='.repeat(60))

      // 🔥 修复：正确解构返回值
      const historyResult = await getCompleteConversationHistory(sessionId)

      if (!historyResult) {
        throw new Error('无法获取对话历史')
      }

      // 🔥 修复：解构出 stepGroups 和 finalSnapshots
      const { stepGroups, finalSnapshots } = historyResult

      // 🔥 修复：传递正确的三个参数
      const prompt = buildTextPrompt(stepGroups, finalSnapshots, attempt)

      // 调用 AI API
      let solution = await callDeepSeekAPI(prompt, attempt)

      // 验证内容
      const validation = validateSolutionContent(solution)

      if (validation.isValid) {
        console.log('✅ [方案生成] 内容验证通过')
        console.log('📊 [方案生成] 匹配关键词:', validation.matchedKeywords)

        // 🔥 在返回前做服务端清洗
        solution = serverNormalize(solution)
        console.log('✅ [方案生成] 服务端清洗完成')

        return solution
      }

      console.warn(`⚠️ [尝试 ${attempt + 1}] 内容验证失败:`, validation.reason)
      console.warn('📊 匹配到的关键词:', validation.matchedKeywords)

      if (attempt === maxRetries) {
        console.error('❌ [方案生成] 所有重试均失败')
        throw new Error('内容验证失败，已达最大重试次数')
      }

      // 等待后重试
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`❌ [尝试 ${attempt + 1}] 失败:`, error.message)

      if (attempt === maxRetries) {
        throw error
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
}

// 🔥 构建纯文本提示词
// 🔥 修复：确保参数顺序和类型正确
function buildTextPrompt(stepGroups, finalSnapshots, attemptNumber) {
  console.log('📝 [构建提示词] 开始...')
  console.log('📊 [构建提示词] attemptNumber:', attemptNumber)

  // 🔥 格式化快照或对话
  const formatStepContent = (step, conversations, snapshot) => {
    // 优先使用最终快照
    if (snapshot) {
      console.log(`✅ Step${step} 使用最终快照（长度: ${snapshot.length}）`)
      return `【学生最终确认内容】\n${snapshot}`
    }

    // 其次使用对话历史
    if (!conversations || conversations.length === 0) {
      return `（本阶段暂无记录）`
    }

    console.log(`⚠️ Step${step} 使用对话历史（${conversations.length} 轮）`)
    return conversations
      .map(
        (conv, idx) =>
          `对话${idx + 1}:\n学生: ${conv.userInput}\nAI: ${conv.aiResponse?.substring(0, 150) || ''}...`,
      )
      .join('\n\n')
  }

  const prompt = `你是智能通风节能系统的方案整理助手。

🔴 核心要求：
1. 方案必须基于学生的实际输入
2. 总字数控制在 1800-2200字
3. 使用纯文本Markdown格式

---

## 学生各阶段输入：

**Step2 - 问题分析：**
${formatStepContent(2, stepGroups[2], finalSnapshots[2])}

**Step3 - 策略设计：**
${formatStepContent(3, stepGroups[3], finalSnapshots[3])}

**Step4 - 用户界面：**
${formatStepContent(4, stepGroups[4], finalSnapshots[4])}

**Step5 - 应急处理：**
${formatStepContent(5, stepGroups[5], finalSnapshots[5])}

**Step6 - 方案优化：**
${formatStepContent(6, stepGroups[6], null)}

---

## 输出方案结构（严格按此框架）：

### 1. 系统目标（150字）
### 2. 传感器配置（400字）
### 3. 控制策略（350字）
### 4. 用户交互（250字）
### 5. 应急方案（300字）
### 6. 成本效益（350字）
### 7. 预期效果（200字）

${attemptNumber > 0 ? '\n⚠️ 注意：请严格控制字数和相关性！' : ''}

现在请开始生成方案：`

  console.log('✅ [构建提示词] 完成，长度:', prompt.length)
  return prompt
}

// 🔥 调用 DeepSeek API
async function callDeepSeekAPI(prompt, attemptNumber) {
  console.log('🤖 [调用API] DeepSeek 开始...')

  const response = await fetch('https://api.deepseek.com/chat/completions', {
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
          content: `你是智能通风节能系统的方案整理专家。

🔴 输出约束：
1. 总字数必须控制在 1800-2200字
2. 基于学生提到的内容整理
3. 使用简洁的Markdown格式
4. 主题必须是"教室智能通风节能系统"

输出结构：
- 系统目标
- 传感器配置
- 控制策略
- 用户交互
- 应急方案
- 成本效益
- 预期效果
`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.6,
      top_p: 0.85,
      frequency_penalty: 0.3,
      presence_penalty: 0.2,
      stream: false,
    }),
  })

  console.log('📡 [调用API] 响应状态:', response.status)

  if (!response.ok) {
    const errorData = await response.json()
    console.error('❌ [调用API] 错误:', errorData)
    throw new Error(`API调用失败: ${response.status}`)
  }

  const data = await response.json()
  const solution = data.choices[0].message.content.trim()

  console.log('📊 [调用API] Token使用:', data.usage)
  console.log('📝 [调用API] 返回内容长度:', solution.length)
  console.log('📝 [调用API] 内容预览:', solution.substring(0, 150) + '...')

  return solution
}

// 🔥 验证方案内容
function validateSolutionContent(solution) {
  console.log('🔍 [内容验证] 开始...')

  // 必须包含的关键词（智能通风节能系统相关）
  const requiredKeywords = ['通风', '节能', '传感器', '温度', 'CO2']

  // 不应出现的关键词（其他领域）
  const forbiddenKeywords = ['驾驶', '汽车', '车辆', '方向盘', '刹车', '油门']

  const matchedRequired = requiredKeywords.filter((kw) => solution.includes(kw))
  const matchedForbidden = forbiddenKeywords.filter((kw) => solution.includes(kw))

  console.log('✅ [内容验证] 匹配必需关键词:', matchedRequired)
  console.log('🚫 [内容验证] 匹配禁止关键词:', matchedForbidden)

  // 验证逻辑
  const hasEnoughRequired = matchedRequired.length >= 3
  const hasNoForbidden = matchedForbidden.length === 0
  const hasMinLength = solution.length >= 500

  const isValid = hasEnoughRequired && hasNoForbidden && hasMinLength

  return {
    isValid,
    matchedKeywords: matchedRequired,
    forbiddenMatches: matchedForbidden,
    reason: !isValid
      ? `必需关键词不足(${matchedRequired.length}/3) 或 包含禁止词(${matchedForbidden.length}) 或 长度不足(${solution.length}/500)`
      : '验证通过',
  }
}

// 🔥 服务端 Markdown 清洗函数
function serverNormalize(md = '') {
  console.log('🧹 [服务端清洗] 原始内容长度:', md.length)

  let s = String(md)
    .replace(/\r\n/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // 零宽字符
    .replace(/\u0000/g, '') // NULL字符

  // 表格前后保证空行
  s = s.replace(/([^\n])\n\|/g, '$1\n\n|') // 表格前空行
  s = s.replace(/\|\n([^\n])/g, '|\n\n$1') // 表格后空行

  // 保障末尾有 2 个换行
  if (!/\n\n$/.test(s)) s += '\n\n'

  // 简单补齐未闭合 ```
  const fenceCount = (s.match(/```/g) || []).length
  if (fenceCount % 2 === 1) {
    console.warn('⚠️ [服务端清洗] 发现未闭合的代码块，已自动补齐')
    s += '\n```'
  }

  console.log('✅ [服务端清洗] 清洗后长度:', s.length)
  return s
}

// 🔥 分节切片函数（可选）
function splitSections(md) {
  console.log('✂️ [分节切片] 开始...')

  // 匹配 "### 1." 到 "### 7." 或 "## 一" 到 "## 七"
  const blocks = md.split(/\n(?=###?\s*[1-7一二三四五六七][\.\、])/g)
  const filtered = blocks.filter(Boolean)

  console.log('✅ [分节切片] 切分为', filtered.length, '个部分')

  return filtered
}

// 🔥 生成备用文本方案
function generateTextFallback() {
  const fallback = `# 智能通风节能系统方案

## 一、系统目标

本系统通过智能监测和自动控制优化室内通风，在保证舒适度前提下显著降低能耗。

**核心目标：**
- 实时监控室内环境（温度、CO2、湿度）
- 智能调节通风强度
- 最大化节能效果

---

## 二、传感器配置

### 温度传感器
- 监控范围：10°C - 40°C
- 触发规则：>26°C 启动通风，>30°C 最大风速
- 响应时间：5分钟

### CO2浓度传感器
- 监控范围：400-2000 ppm
- 触发规则：>800 ppm 启动通风，>1500 ppm 强制最大风速 + 报警
- 响应时间：3分钟

### 湿度传感器
- 监控范围：20%-90% RH
- 触发规则：>70% 启动除湿模式
- 响应时间：10分钟

### 人体感应器
- 功能：检测是否有人
- 节能逻辑：无人15分钟降低50%功率，30分钟进入待机

---

## 三、控制策略

**自适应算法：**
- 综合温度、CO2、湿度计算空气质量指数
- 根据指数动态调整风速（0-100%）

**时段模式：**
- 工作时段（8:00-18:00）：标准模式
- 夜间时段（22:00-6:00）：静音模式，风速≤50%
- 非工作日：节能模式，延长响应时间

**优先级：**
1. CO2浓度（安全）
2. 温度（舒适）
3. 湿度（健康）
4. 人员状态（节能）

---

## 四、用户交互

**提示词示例：**
- "空气质量优良，系统待机中"
- "CO2偏高【950ppm】，正在通风..."
- "已切换节能模式，预计节省40%能耗"
- "⚠️ CO2严重超标【1600ppm】，请检查门窗！"

**状态显示：**
- 实时参数数值
- 颜色标识：绿（优）、黄（警戒）、红（超标）
- 重要警报语音播报

---

## 五、应急方案

**传感器故障：**
- 单个故障：用其他传感器推算
- 关键故障：切换手动模式 + 通知管理员

**极端环境：**
- 高温>35°C：最大通风 + 每10分钟提醒
- 低温<10°C：最小通风 + 提示关窗
- CO2>1500ppm：声光报警 + 强制通风

---

## 六、成本效益

**硬件成本：**

| 项目 | 单价 |
|------|------|
| 温度传感器 | 200元 |
| CO2传感器 | 600元 |
| 湿度传感器 | 150元 |
| 人体感应器 | 100元 |
| 控制主机 | 800元 |
| 通风设备 | 1000元 |
| **总计** | **2850元** |

**预期效益：**
- 节省电费：35-45%
- 年节省：800-1200元
- 投资回收期：2-3年

---

## 七、预期效果

**空气质量：**
- CO2浓度降低30-40%
- 温度波动减少50%
- 湿度舒适占比>90%

**节能效果：**
- 相比传统运转节省40%电力
- 无人时段能耗降低70%

**用户满意度：**
- 优良率>85%
- 投诉减少60%
- 自动化率95%`

  // 🔥 备用方案也要清洗
  console.log('🔧 [备用方案] 开始服务端清洗')
  return serverNormalize(fallback)
}

// 保存方案到数据库
async function saveSolutionToDB(sessionId, solution, metadata) {
  try {
    console.log('💾 [保存方案] 开始...')

    const client = await connectToDatabase()
    const db = client.db('llm_learning')
    const collection = db.collection('generated_solutions')

    const result = await collection.insertOne({
      sessionId,
      solution,
      metadata,
      timestamp: new Date(),
    })

    console.log('✅ [保存方案] 完成, ID:', result.insertedId)

    // 同时保存到 conversations 集合
    const conversationsCollection = db.collection('conversations')
    await conversationsCollection.insertOne({
      sessionId,
      step: 6,
      stage: 1,
      userInput: '[GENERATE_COMPLETE_SOLUTION]',
      aiResponse: solution,
      timestamp: new Date(),
      context: 'solution_generation',
      metadata: {
        type: 'complete_solution',
        version: 1,
        ...metadata,
      },
    })

    console.log('✅ [保存方案] 已同步到 conversations')
  } catch (error) {
    console.error('❌ [保存方案] 失败:', error)
  }
}

// 主处理函数
export default async function handler(req, res) {
  console.log('🚀 [方案生成API] 开始执行')
  console.log('⏰ 时间:', new Date().toISOString())

  // CORS 设置
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
    const { sessionId, includeComponents = [] } = req.body

    console.log('📋 [方案生成API] SessionID:', sessionId)
    console.log('📋 [方案生成API] 包含组件:', includeComponents)

    if (!sessionId) {
      return res.status(400).json({ error: '缺少sessionId参数' })
    }

    // 🔥 核心：调用重试生成函数
    let solution
    let usedFallback = false

    try {
      solution = await generateSolutionWithRetry(sessionId, 2) // 最多重试2次
    } catch (error) {
      console.error('❌ [方案生成] 所有重试均失败，使用备用方案')
      solution = generateTextFallback()
      usedFallback = true
    }

    // 保存方案
    await saveSolutionToDB(sessionId, solution, {
      usedFallback,
      includeComponents,
      generationTime: new Date().toISOString(),
      format: 'text',
    })

    // 🔥 生成分节数据（可选）
    const sections = splitSections(solution)

    console.log('✅ [方案生成API] 成功完成')
    console.log('='.repeat(60))

    res.status(200).json({
      integratedSolution: solution,
      sections: sections,
      metadata: {
        usedFallback,
        format: 'text',
        generationTime: new Date().toISOString(),
        includeComponents,
        sectionCount: sections.length,
      },
    })
  } catch (error) {
    console.error('❌ [方案生成API] 失败:', error)

    const fallbackSolution = generateTextFallback()

    res.status(200).json({
      integratedSolution: fallbackSolution,
      fallbackSolution: fallbackSolution,
      metadata: {
        error: error.message,
        usedFallback: true,
        format: 'text',
        generationTime: new Date().toISOString(),
      },
    })
  }
}
