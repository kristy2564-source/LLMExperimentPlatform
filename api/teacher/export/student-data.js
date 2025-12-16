// api/teacher/export/student-data.js - 导出学生对话数据（Word和TXT格式）
import { MongoClient } from 'mongodb'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

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
 * 获取学生的完整数据（复用detail.js的逻辑）
 */
async function getStudentData(sessionId) {
  const client = await connectToDatabase()
  const db = client.db('llm_learning')
  const conversationCollection = db.collection('conversations')
  const questionnaireCollection = db.collection('questionnaires')

  // 获取所有对话记录
  const conversations = await conversationCollection
    .find({ sessionId })
    .sort({ step: 1, timestamp: 1 })
    .toArray()

  if (conversations.length === 0) {
    return null
  }

  // 过滤掉EVENT标记的对话
  const realConversations = conversations.filter((conv) => {
    if (typeof conv.userInput === 'string' && conv.userInput.startsWith('[EVENT:')) {
      return false
    }
    if (typeof conv.context === 'string' && conv.context.startsWith('event_')) {
      return false
    }
    return true
  })

  // 去重逻辑
  const uniqueConversations = []
  const seen = new Set()

  for (const conv of realConversations) {
    // 提取求助类型标记并清理userInput
    let helpType = null
    let cleanedUserInput = conv.userInput || ''

    if (typeof cleanedUserInput === 'string') {
      const helpMatch = cleanedUserInput.match(/\[HELP_TYPE:(\w+)\]/)
      if (helpMatch) {
        helpType = helpMatch[1]
        cleanedUserInput = cleanedUserInput.replace(/\[HELP_TYPE:\w+\]\s*/, '')
      }
    }

    // 创建唯一键用于去重
    const key = `${conv.step}_${conv.timestamp}_${cleanedUserInput}`

    if (!seen.has(key)) {
      seen.add(key)
      uniqueConversations.push({
        ...conv,
        userInput: cleanedUserInput,
        metadata: {
          ...conv.metadata,
          helpType: helpType || conv.metadata?.helpType,
        },
      })
    }
  }

  // 按步骤组织对话
  const conversationsByStep = {}
  const finalAnswers = {}

  uniqueConversations.forEach((conv) => {
    const step = conv.step || 'unknown'

    if (!conversationsByStep[step]) {
      conversationsByStep[step] = []
    }

    conversationsByStep[step].push({
      userInput: conv.userInput,
      aiResponse: conv.aiResponse,
      timestamp: conv.timestamp,
      stage: conv.stage,
      metadata: conv.metadata,
    })

    // 提取最终答案
    if (conv.metadata?.isFinalSnapshot && conv.metadata?.finalAnswerContent) {
      finalAnswers[step] = {
        content: conv.metadata.finalAnswerContent,
        timestamp: conv.timestamp,
      }
    }

    // Step6 特殊处理
    if (step === 6 && conv.context === 'final_solution_submission') {
      finalAnswers[step] = {
        content: conv.aiResponse,
        timestamp: conv.timestamp,
      }
    }
  })

  // 获取问卷数据
  const questionnaire = await questionnaireCollection.findOne({ sessionId })

  return {
    sessionId,
    experimentId: uniqueConversations[0].experimentId || '未知',
    conversationsByStep,
    finalAnswers,
    questionnaire,
    totalConversations: uniqueConversations.length,
  }
}

/**
 * 生成TXT格式文本
 */
function generateTXT(studentData) {
  const {
    sessionId,
    experimentId,
    conversationsByStep,
    finalAnswers,
    questionnaire,
    totalConversations,
  } = studentData

  let text = ''
  text += '='.repeat(80) + '\n'
  text += '学生对话数据导出\n'
  text += '='.repeat(80) + '\n\n'

  text += `学生ID: ${sessionId}\n`
  text += `实验ID: ${experimentId}\n`
  text += `总对话数: ${totalConversations}\n`
  text += `导出时间: ${new Date().toLocaleString('zh-CN')}\n`
  text += `完成状态: ${questionnaire ? '已完成' : '进行中'}\n\n`

  text += '='.repeat(80) + '\n'
  text += '对话记录\n'
  text += '='.repeat(80) + '\n\n'

  const stepNames = {
    2: 'Step 2 - 问题识别',
    3: 'Step 3 - 方案设计',
    4: 'Step 4 - 提示词设计',
    5: 'Step 5 - 应急调整',
    6: 'Step 6 - 方案整合',
    7: 'Step 7 - 自我反思',
  }

  // 遍历所有步骤
  Object.keys(conversationsByStep)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((step) => {
      const conversations = conversationsByStep[step]
      text += `\n${'*'.repeat(80)}\n`
      text += `${stepNames[step] || `Step ${step}`}\n`
      text += `${'*'.repeat(80)}\n\n`

      conversations.forEach((conv, index) => {
        text += `【对话 ${index + 1}】\n`
        text += `时间: ${new Date(conv.timestamp).toLocaleString('zh-CN')}\n`

        if (conv.metadata?.helpType) {
          const helpTypes = {
            refine: '优化引导',
            example: '示例参考',
            custom: '自定义提问',
          }
          text += `求助类型: ${helpTypes[conv.metadata.helpType] || conv.metadata.helpType}\n`
        }

        text += `\n学生输入:\n${conv.userInput}\n`
        text += `\nAI回复:\n${conv.aiResponse}\n`
        text += `${'-'.repeat(80)}\n\n`
      })

      // 添加最终答案
      if (finalAnswers[step]) {
        text += `\n【最终答案】\n`
        text += `时间: ${new Date(finalAnswers[step].timestamp).toLocaleString('zh-CN')}\n`
        text += `\n${finalAnswers[step].content}\n`
        text += `${'='.repeat(80)}\n\n`
      }
    })

  // 添加问卷数据
  if (questionnaire) {
    text += '\n\n' + '='.repeat(80) + '\n'
    text += '问卷调查结果\n'
    text += '='.repeat(80) + '\n\n'
    text += `提交时间: ${new Date(questionnaire.createdAt).toLocaleString('zh-CN')}\n\n`

    if (questionnaire.feedback_open) {
      text += '开放性反馈:\n'
      text += questionnaire.feedback_open + '\n\n'
    }
  }

  return text
}

/**
 * 生成Word文档
 */
async function generateWord(studentData) {
  const {
    sessionId,
    experimentId,
    conversationsByStep,
    finalAnswers,
    questionnaire,
    totalConversations,
  } = studentData

  const stepNames = {
    2: 'Step 2 - 问题识别',
    3: 'Step 3 - 方案设计',
    4: 'Step 4 - 提示词设计',
    5: 'Step 5 - 应急调整',
    6: 'Step 6 - 方案整合',
    7: 'Step 7 - 自我反思',
  }

  const sections = []

  // 标题页
  sections.push(
    new Paragraph({
      text: '学生对话数据导出',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '学生ID: ', bold: true }), new TextRun({ text: sessionId })],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '实验ID: ', bold: true }),
        new TextRun({ text: experimentId }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '总对话数: ', bold: true }),
        new TextRun({ text: String(totalConversations) }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '导出时间: ', bold: true }),
        new TextRun({ text: new Date().toLocaleString('zh-CN') }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '完成状态: ', bold: true }),
        new TextRun({ text: questionnaire ? '已完成' : '进行中' }),
      ],
      spacing: { after: 400 },
    }),
  )

  // 对话记录
  sections.push(
    new Paragraph({
      text: '对话记录',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 },
      pageBreakBefore: true,
    }),
  )

  // 遍历所有步骤
  Object.keys(conversationsByStep)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((step) => {
      const conversations = conversationsByStep[step]

      // 步骤标题
      sections.push(
        new Paragraph({
          text: stepNames[step] || `Step ${step}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 300 },
        }),
      )

      // 对话内容
      conversations.forEach((conv, index) => {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: `对话 ${index + 1}`, bold: true, size: 24 })],
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '时间: ', bold: true }),
              new TextRun({ text: new Date(conv.timestamp).toLocaleString('zh-CN'), size: 20 }),
            ],
            spacing: { after: 100 },
          }),
        )

        if (conv.metadata?.helpType) {
          const helpTypes = {
            refine: '优化引导',
            example: '示例参考',
            custom: '自定义提问',
          }
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: '求助类型: ', bold: true }),
                new TextRun({
                  text: helpTypes[conv.metadata.helpType] || conv.metadata.helpType,
                  size: 20,
                }),
              ],
              spacing: { after: 100 },
            }),
          )
        }

        sections.push(
          new Paragraph({
            children: [new TextRun({ text: '学生输入:', bold: true })],
            spacing: { before: 100, after: 100 },
          }),
          new Paragraph({
            text: conv.userInput,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'AI回复:', bold: true })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: conv.aiResponse,
            spacing: { after: 300 },
          }),
        )
      })

      // 最终答案
      if (finalAnswers[step]) {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: '最终答案', bold: true, size: 26 })],
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '时间: ', bold: true }),
              new TextRun({
                text: new Date(finalAnswers[step].timestamp).toLocaleString('zh-CN'),
                size: 20,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: finalAnswers[step].content,
            spacing: { after: 400 },
          }),
        )
      }
    })

  // 问卷数据
  if (questionnaire && questionnaire.feedback_open) {
    sections.push(
      new Paragraph({
        text: '问卷调查结果',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 },
        pageBreakBefore: true,
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '提交时间: ', bold: true }),
          new TextRun({ text: new Date(questionnaire.createdAt).toLocaleString('zh-CN') }),
        ],
        spacing: { after: 300 },
      }),
      new Paragraph({
        children: [new TextRun({ text: '开放性反馈:', bold: true })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: questionnaire.feedback_open,
        spacing: { after: 200 },
      }),
    )
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * API处理函数
 */
export default async function handler(req, res) {
  // CORS设置
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 验证教师token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权访问' })
    }

    // 获取参数
    const sessionId = req.method === 'POST' ? req.body.sessionId : req.query.sessionId
    const format = req.method === 'POST' ? req.body.format : req.query.format || 'txt'

    if (!sessionId) {
      return res.status(400).json({ error: '缺少sessionId参数' })
    }

    console.log(`📥 导出学生数据: ${sessionId}, 格式: ${format}`)

    // 获取学生数据
    const studentData = await getStudentData(sessionId)

    if (!studentData) {
      return res.status(404).json({ error: '未找到该学生的数据' })
    }

    // 根据格式生成文件
    if (format === 'word' || format === 'docx') {
      const buffer = await generateWord(studentData)
      const filename = `student_${sessionId}_${Date.now()}.docx`

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      )
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(buffer)
    } else {
      // TXT格式
      const text = generateTXT(studentData)
      const filename = `student_${sessionId}_${Date.now()}.txt`

      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(text)
    }

    console.log('✅ 导出成功')
  } catch (error) {
    console.error('❌ 导出失败:', error)
    res.status(500).json({
      success: false,
      error: '导出失败',
      details: error.message,
    })
  }
}
