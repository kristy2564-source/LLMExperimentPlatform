// api/ai/optimize-solution.js - 完整修复版
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

// 🔥 提取方案结构
function extractSolutionStructure(solution) {
  const lines = solution.split('\n')
  const structure = []

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (trimmed.match(/^#+\s+/)) {
      structure.push(trimmed)
    } else if (trimmed.match(/^[一二三四五六七八九十\d]+[、\.．]\s*.+/) && trimmed.length < 50) {
      structure.push(`- ${trimmed}`)
    }
  })

  if (structure.length === 0) {
    return '（原方案为纯文本格式，包含传感器配置、控制策略、用户界面、应急处理等核心内容）'
  }

  return structure.slice(0, 15).join('\n') + '\n...'
}

// 🔥 构建优化提示词
// 🔥 构建优化提示词（简化版）
function buildTextOptimizationPrompt(
  originalSolution,
  optimizationRequest,
  currentVersion,
  attemptNumber,
) {
  console.log('📝 [构建优化提示词] 尝试次数:', attemptNumber + 1)

  // 计算原方案字数
  const originalCharCount = (originalSolution.match(/[\u4e00-\u9fa5]/g) || []).length
  console.log('📝 [构建优化提示词] 原方案字数:', originalCharCount)

  const prompt = `你是智能通风节能系统设计专家。请根据用户的优化需求,对现有方案进行改进。

🔴 核心要求：
1. 严格根据用户的要求修改原方案，不能超出用户的优化需求
2. 输出完整的优化后方案（不是只写改动部分）
3. 控制总字数在 1800-2200字
4. 使用纯文本Markdown格式

---

## 当前方案（v${currentVersion}）概要：

原方案字数：约 ${originalCharCount} 字

原方案主要内容：
${originalSolution.substring(0, 500)}...

---

## 用户的优化需求：

"${optimizationRequest}"

---

## 输出要求：

**必须输出完整方案，包含以下7个核心部分：**

### 1. 系统目标（150字）
- 明确系统要解决的核心问题
- 设计原则和优先级

### 2. 传感器配置（400字）
- 温度传感器：触发条件、响应动作
- CO2浓度传感器：阈值设定、控制逻辑
- 湿度传感器：监控范围、调节策略
- 人体感应器：节能逻辑

### 3. 控制策略（350字）
- 自适应调速算法
- 时段智能模式
- 多因素综合决策逻辑

### 4. 用户交互（250字）
- 关键提示词示例
- 状态反馈机制
- 用户操作指引

### 5. 应急处理（300字）
- 传感器故障应对
- 极端环境处理

### 6. 成本效益（350字）
- 硬件成本估算（简单表格）
- 预期节能效果
- 投资回收期

### 7. 预期效果（200字）
- 空气质量改善指标
- 能耗降低目标
- 舒适度提升

---

**格式规范：**
- 使用 # ## ### 标题层级
- 用列表展示要点（- 或 •）
- 关键数据用【】标注，如【26°C】【800ppm】
- 用 ✨ 标注本次优化新增的内容
- 用 🔧 标注本次优化改进的内容
- 总字数必须控制在 1800-2200字

**重要提醒：**
- 必须输出完整的7个章节，不能省略
- 在优化相关的部分用标记（✨🔧）标注改动
- 不相关的部分可以保持原方案内容
- 确保主题始终围绕"智能通风节能系统"

${attemptNumber > 0 ? '\n⚠️ 注意：上次生成可能不完整或偏题，请这次确保输出完整且符合主题！' : ''}

请开始输出完整的优化方案：`

  console.log('✅ [构建优化提示词] 完成')
  return prompt
}

// 🔥 调用 DeepSeek API 进行优化
async function callDeepSeekForOptimization(prompt, attemptNumber) {
  console.log('🤖 [调用优化API] DeepSeek 开始...')

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
          content: `你是智能通风节能系统的专业方案设计师。你必须严格围绕"教室智能通风节能"这个主题优化方案。

输出要求：
1. 纯文本格式，不使用HTML标签
2. 使用Markdown语法组织结构
3. 输出完整方案（7个核心章节）
4. 内容完整、逻辑清晰、实用可行
5. 字数控制在1500-2200字
6. 用 ✨ 和 🔧 标注优化改进的部分`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2500, // 🔥 与generate-solution一致
      temperature: 0.6, // 🔥 与generate-solution一致
      top_p: 0.85, // 🔥 与generate-solution一致
      frequency_penalty: 0.3,
      presence_penalty: 0.2,
      stream: false,
    }),
  })

  console.log('📡 [调用优化API] 响应状态:', response.status)

  if (!response.ok) {
    const errorData = await response.json()
    console.error('❌ [调用优化API] 错误:', errorData)
    throw new Error(`API调用失败: ${response.status}`)
  }

  const data = await response.json()
  const optimized = data.choices[0].message.content.trim()

  console.log('📊 [调用优化API] Token使用:', data.usage)
  console.log('📝 [调用优化API] 返回内容长度:', optimized.length)
  console.log('📝 [调用优化API] 内容预览:', optimized.substring(0, 150))

  return optimized
}

// 🔥 简化验证函数
function validateOptimizedContent(optimized, optimizationRequest) {
  console.log('🔍 [优化内容验证] 开始...')

  // 计算字数
  const chineseCharCount = (optimized.match(/[\u4e00-\u9fa5]/g) || []).length
  console.log('📊 [优化内容验证] 中文字数:', chineseCharCount)

  // 必须包含的关键词
  const requiredKeywords = ['通风', '节能', '传感器', '温度', 'CO2']
  const matchedRequired = requiredKeywords.filter((kw) => optimized.includes(kw))

  // 不应出现的关键词
  const forbiddenKeywords = ['驾驶', '汽车', '车辆', '方向盘']
  const matchedForbidden = forbiddenKeywords.filter((kw) => optimized.includes(kw))

  // 检查是否有主要章节
  const hasMainSections =
    optimized.includes('传感器') && optimized.includes('控制') && optimized.includes('成本')

  console.log('✅ [优化内容验证] 匹配必需关键词:', matchedRequired)
  console.log('🚫 [优化内容验证] 匹配禁止关键词:', matchedForbidden)
  console.log('📋 [优化内容验证] 包含主要章节:', hasMainSections)

  // 验证逻辑
  const hasEnoughRequired = matchedRequired.length >= 3
  const hasNoForbidden = matchedForbidden.length === 0
  const hasMinLength = optimized.length >= 800
  const lengthValid = chineseCharCount >= 1200 && chineseCharCount <= 2500

  const isValid =
    hasEnoughRequired && hasNoForbidden && hasMinLength && lengthValid && hasMainSections

  return {
    isValid,
    matchedKeywords: matchedRequired,
    forbiddenMatches: matchedForbidden,
    chineseCharCount,
    lengthValid,
    hasMainSections,
    reason: !isValid
      ? `必需关键词:${matchedRequired.length}/3, 禁止词:${matchedForbidden.length}, 长度:${optimized.length}/800, 字数:${chineseCharCount}(1500-2500), 章节完整:${hasMainSections}`
      : '验证通过',
  }
}

// 🔥 核心函数：优化方案（带重试）
async function optimizeSolutionWithRetry(
  originalSolution,
  optimizationRequest,
  currentVersion,
  maxRetries = 2,
) {
  console.log('🔄 [方案优化重试] 开始，最大重试次数:', maxRetries)

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n${'='.repeat(60)}`)
      console.log(`🎯 [优化尝试 ${attempt + 1}/${maxRetries + 1}] 开始...`)
      console.log('='.repeat(60))

      const prompt = buildTextOptimizationPrompt(
        originalSolution,
        optimizationRequest,
        currentVersion,
        attempt,
      )

      const optimized = await callDeepSeekForOptimization(prompt, attempt)

      const validation = validateOptimizedContent(optimized, optimizationRequest)

      if (validation.isValid) {
        console.log('✅ [方案优化] 内容验证通过')
        console.log('📊 [方案优化] 优化质量:', validation.reason)
        return optimized
      }

      console.warn(`⚠️ [优化尝试 ${attempt + 1}] 内容验证失败:`, validation.reason)

      if (attempt === maxRetries) {
        console.error('❌ [方案优化] 所有重试均失败')
        throw new Error('内容验证失败，已达最大重试次数')
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`❌ [优化尝试 ${attempt + 1}] 失败:`, error.message)

      if (attempt === maxRetries) {
        throw error
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
}

// 🔥 生成备用优化方案（纯文本）
// 🔥 生成备用优化方案（完整版）
function generateOptimizationFallback(optimizationRequest, originalSolution) {
  return `# 智能通风节能系统方案 (优化版)

📝 **优化说明：** 根据需求"${optimizationRequest.substring(0, 50)}..."进行了针对性改进。

---

## 一、系统目标

本系统通过智能监测和自动控制优化室内通风，在保证舒适度前提下显著降低能耗。

**核心目标：**
- 实时监控室内环境（温度、CO2、湿度）
- 智能调节通风强度
- 最大化节能效果

---

## 二、传感器配置

### 2.1 温度传感器
- 监控范围：10°C - 40°C
- 舒适范围：18°C - 26°C
- 触发规则：>26°C 启动通风，>30°C 最大风速
- 响应时间：5分钟

### 2.2 CO2浓度传感器
- 监控范围：400-2000 ppm
- 触发规则：
  - 400-800 ppm：正常，无需干预
  - 800-1000 ppm：启动低速通风
  - >1500 ppm：强制最大风速 + 报警
- 响应时间：3分钟

### 2.3 湿度传感器
- 监控范围：20%-90% RH
- 舒适范围：40%-60% RH
- 触发规则：>70% 启动除湿模式
- 响应时间：10分钟

### 2.4 人体感应器
- 功能：检测是否有人
- 节能逻辑：
  - 无人15分钟 → 降低50%功率
  - 无人30分钟 → 进入待机模式

---

## 三、控制策略

### 3.1 自适应调速算法
- 综合温度、CO2、湿度计算空气质量指数
- 根据指数动态调整风速（0-100%）
- 权重分配：CO2(40%) + 温度(30%) + 湿度(20%) + 人员(10%)

### 3.2 时段智能模式
- **工作时段（8:00-18:00）**：标准模式，优先舒适度
- **夜间时段（22:00-6:00）**：静音模式，风速≤50%
- **非工作日**：节能模式，延长响应时间

### 3.3 决策优先级
1. CO2浓度（安全第一）
2. 温度（舒适度）
3. 湿度（健康）
4. 人员状态（节能）

---

## 四、用户交互

### 4.1 关键提示词
- "空气质量优良，系统待机中"
- "CO2偏高【950ppm】，正在通风..."
- "已切换节能模式，预计节省40%能耗"
- "⚠️ CO2严重超标【1600ppm】，请检查门窗！"

### 4.2 状态反馈
- 实时显示环境参数数值
- 颜色标识：绿色（优）、黄色（警戒）、红色（超标）
- 重要警报语音播报

### 4.3 操作方式
- 自动模式：全自动运行
- 手动模式：临时调整（2小时后恢复）
- 紧急模式：一键最大通风

---

## 五、应急处理

### 5.1 传感器故障
- **单个故障**：用其他传感器推算
- **关键故障**：切换手动模式 + 通知管理员
- **冗余设计**：关键传感器双备份

### 5.2 极端环境
**高温（>35°C）：**
- 最大功率通风
- 每10分钟提醒检查设备

**低温（<10°C）：**
- 最小化通风量
- 提示关闭门窗

**空气质量危机（CO2>1500ppm）：**
- 声光报警
- 强制最大风速通风
- 发送紧急通知

---

## 六、成本效益

### 6.1 硬件成本
| 设备类型 | 数量 | 单价 | 小计 |
|---------|------|------|------|
| 温度传感器 | 2个 | 200元 | 400元 |
| CO2传感器 | 1个 | 600元 | 600元 |
| 湿度传感器 | 1个 | 150元 | 150元 |
| 人体感应器 | 2个 | 100元 | 200元 |
| 控制主机 | 1套 | 800元 | 800元 |
| 通风设备 | 1套 | 1000元 | 1000元 |
| **总计** | - | - | **3150元** |

### 6.2 预期效益
- 节省电费：35-45%
- 年节省：800-1200元
- 投资回收期：2.5-3年

---

## 七、预期效果

### 7.1 空气质量改善
- CO2浓度降低 30-40%
- 温度波动减少 50%
- 湿度舒适占比 >90%

### 7.2 节能效果
- 相比传统系统节省 40%电力
- 无人时段能耗降低 70%

### 7.3 用户体验
- 优良率 >85%
- 投诉减少 60%
- 自动化率 95%

---

✨ **本次优化重点：** 基于用户需求对方案进行了改进，标注处为优化内容。`
}

// 保存优化记录到数据库
async function saveOptimizationRecord(sessionId, optimizationData) {
  try {
    console.log('💾 [保存优化记录] 开始...')

    const client = await connectToDatabase()
    const db = client.db('llm_learning')
    const collection = db.collection('solution_optimizations')

    const record = {
      sessionId,
      version: optimizationData.version,
      optimizationRequest: optimizationData.request,
      originalSolution: optimizationData.originalSolution,
      optimizedSolution: optimizationData.optimizedSolution,
      timestamp: new Date(),
      metadata: {
        usedFallback: optimizationData.usedFallback,
        originalLength: optimizationData.originalSolution.length,
        optimizedLength: optimizationData.optimizedSolution.length,
        requestLength: optimizationData.request.length,
        format: 'text',
      },
    }

    const result = await collection.insertOne(record)
    console.log('✅ [保存优化记录] ID:', result.insertedId)

    const conversationsCollection = db.collection('conversations')
    await conversationsCollection.insertOne({
      sessionId,
      step: 6,
      stage: 1,
      userInput: `[OPTIMIZATION_V${optimizationData.version}] ${optimizationData.request}`,
      aiResponse: optimizationData.optimizedSolution,
      timestamp: new Date(),
      context: 'solution_optimization',
      metadata: {
        type: 'solution_optimization',
        version: optimizationData.version,
        optimizationId: result.insertedId,
        format: 'text',
      },
    })

    console.log('✅ [保存优化记录] 完成')
  } catch (error) {
    console.error('❌ [保存优化记录] 失败:', error.message)
  }
}

// 🔥 主处理函数 - 确保没有循环引用
export default async function handler(req, res) {
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
    const { sessionId, originalSolution, optimizationRequest, currentVersion = 1 } = req.body

    console.log('🔄 [方案优化] 开始:', new Date().toISOString())
    console.log('📝 [方案优化] 用户请求:', optimizationRequest.substring(0, 100))
    console.log('📋 [方案优化] 当前版本:', currentVersion)

    if (!sessionId || !originalSolution || !optimizationRequest) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['sessionId', 'originalSolution', 'optimizationRequest'],
      })
    }

    // 🔥 核心：调用优化函数（带重试）
    let optimizedSolution
    let usedFallback = false

    try {
      optimizedSolution = await optimizeSolutionWithRetry(
        originalSolution,
        optimizationRequest,
        currentVersion,
        2, // 最多重试2次
      )
    } catch (error) {
      console.error('❌ [方案优化] 所有重试均失败，使用备用方案')
      optimizedSolution = generateOptimizationFallback(optimizationRequest, originalSolution)
      usedFallback = true
    }

    // 保存记录
    try {
      await saveOptimizationRecord(sessionId, {
        version: currentVersion + 1,
        request: optimizationRequest,
        originalSolution,
        optimizedSolution,
        usedFallback,
      })
    } catch (saveError) {
      console.error('❌ [保存] 失败:', saveError.message)
    }

    console.log('✅ [方案优化] 完成')

    // 返回结果
    return res.status(200).json({
      optimizedSolution, // 🔥 完整的优化后方案
      metadata: {
        usedFallback,
        optimizationTime: new Date().toISOString(),
        version: currentVersion + 1,
        originalLength: originalSolution.length,
        optimizedLength: optimizedSolution.length,
        format: 'text',
      },
    })
  } catch (error) {
    console.error('❌ [方案优化] 错误:', error.message)

    const fallbackSolution = generateOptimizationFallback(
      req.body?.optimizationRequest || '优化请求',
      req.body?.originalSolution || '',
    )

    return res.status(200).json({
      optimizedSolution: fallbackSolution,
      metadata: {
        error: error.message,
        usedFallback: true,
        format: 'text',
      },
    })
  }
}
