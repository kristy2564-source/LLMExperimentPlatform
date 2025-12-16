// api/teacher/export/batch-students.js - 批量导出学生数据
import { MongoClient } from 'mongodb'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from 'docx'
import archiver from 'archiver'

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
 * 获取单个学生的完整数据
 */
async function getStudentData(sessionId, client) {
  const db = client.db('llm_learning')
  const conversationCollection = db.collection('conversations')
  const questionnaireCollection = db.collection('questionnaires')

  const conversations = await conversationCollection
    .find({ sessionId })
    .sort({ step: 1, timestamp: 1 })
    .toArray()

  if (conversations.length === 0) {
    return null
  }

  // 过滤EVENT标记的对话
  const realConversations = conversations.filter((conv) => {
    if (typeof conv.userInput === 'string' && conv.userInput.startsWith('[EVENT:')) {
      return false
    }
    if (typeof conv.context === 'string' && conv.context.startsWith('event_')) {
      return false
    }
    return true
  })

  // 去重
  const uniqueConversations = []
  const seen = new Set()

  for (const conv of realConversations) {
    let helpType = null
    let cleanedUserInput = conv.userInput || ''

    if (typeof cleanedUserInput === 'string') {
      const helpMatch = cleanedUserInput.match(/\[HELP_TYPE:(\w+)\]/)
      if (helpMatch) {
        helpType = helpMatch[1]
        cleanedUserInput = cleanedUserInput.replace(/\[HELP_TYPE:\w+\]\s*/, '')
      }
    }

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

  // 按步骤组织
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

    if (conv.metadata?.isFinalSnapshot && conv.metadata?.finalAnswerContent) {
      finalAnswers[step] = {
        content: conv.metadata.finalAnswerContent,
        timestamp: conv.timestamp,
      }
    }

    if (step === 6 && conv.context === 'final_solution_submission') {
      finalAnswers[step] = {
        content: conv.aiResponse,
        timestamp: conv.timestamp,
      }
    }
  })

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
 * 生成单个学生的TXT内容
 */
function generateStudentTXT(studentData, includeHeader = true) {
  const {
    sessionId,
    experimentId,
    conversationsByStep,
    finalAnswers,
    questionnaire,
    totalConversations,
  } = studentData

  let text = ''

  if (includeHeader) {
    text += '='.repeat(80) + '\n'
    text += `学生ID: ${sessionId}\n`
    text += '='.repeat(80) + '\n\n'
  }

  text += `实验ID: ${experimentId}\n`
  text += `总对话数: ${totalConversations}\n`
  text += `完成状态: ${questionnaire ? '已完成' : '进行中'}\n\n`

  const stepNames = {
    2: 'Step 2 - 问题识别',
    3: 'Step 3 - 方案设计',
    4: 'Step 4 - 提示词设计',
    5: 'Step 5 - 应急调整',
    6: 'Step 6 - 方案整合',
    7: 'Step 7 - 自我反思',
  }

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

      if (finalAnswers[step]) {
        text += `\n【最终答案】\n`
        text += `时间: ${new Date(finalAnswers[step].timestamp).toLocaleString('zh-CN')}\n`
        text += `\n${finalAnswers[step].content}\n`
        text += `${'='.repeat(80)}\n\n`
      }
    })

  if (questionnaire && questionnaire.feedback_open) {
    text += '\n' + '='.repeat(80) + '\n'
    text += '问卷反馈\n'
    text += '='.repeat(80) + '\n\n'
    text += questionnaire.feedback_open + '\n\n'
  }

  return text
}

/**
 * 生成单个学生的Word段落数组
 */
function generateStudentWordSections(studentData, isFirst = true) {
  const {
    sessionId,
    experimentId,
    conversationsByStep,
    finalAnswers,
    questionnaire,
    totalConversations,
  } = studentData

  const sections = []

  // 学生标题
  if (!isFirst) {
    sections.push(
      new Paragraph({
        text: '',
        pageBreakBefore: true,
      }),
    )
  }

  sections.push(
    new Paragraph({
      text: `学生: ${sessionId}`,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '实验ID: ', bold: true }),
        new TextRun({ text: experimentId }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '总对话数: ', bold: true }),
        new TextRun({ text: String(totalConversations) }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '完成状态: ', bold: true }),
        new TextRun({ text: questionnaire ? '已完成' : '进行中' }),
      ],
      spacing: { after: 300 },
    }),
  )

  const stepNames = {
    2: 'Step 2 - 问题识别',
    3: 'Step 3 - 方案设计',
    4: 'Step 4 - 提示词设计',
    5: 'Step 5 - 应急调整',
    6: 'Step 6 - 方案整合',
    7: 'Step 7 - 自我反思',
  }

  Object.keys(conversationsByStep)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((step) => {
      const conversations = conversationsByStep[step]

      sections.push(
        new Paragraph({
          text: stepNames[step] || `Step ${step}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
      )

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

  if (questionnaire && questionnaire.feedback_open) {
    sections.push(
      new Paragraph({
        text: '问卷反馈',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: questionnaire.feedback_open,
        spacing: { after: 200 },
      }),
    )
  }

  return sections
}

/**
 * 合并导出 - 所有学生数据合并到一个文件
 */
async function exportMerged(sessionIds, format, client) {
  console.log(`📦 合并导出 ${sessionIds.length} 个学生数据，格式: ${format}`)

  const allStudentsData = []

  for (const sessionId of sessionIds) {
    const data = await getStudentData(sessionId, client)
    if (data) {
      allStudentsData.push(data)
    }
  }

  if (format === 'txt') {
    let mergedText = '='.repeat(80) + '\n'
    mergedText += '批量学生对话数据导出\n'
    mergedText += '='.repeat(80) + '\n\n'
    mergedText += `导出时间: ${new Date().toLocaleString('zh-CN')}\n`
    mergedText += `学生总数: ${allStudentsData.length}\n`
    mergedText += `学生列表: ${allStudentsData.map((d) => d.sessionId).join(', ')}\n\n`

    allStudentsData.forEach((studentData, index) => {
      if (index > 0) {
        mergedText += '\n\n' + '='.repeat(80) + '\n'
        mergedText += '='.repeat(80) + '\n\n'
      }
      mergedText += generateStudentTXT(studentData, true)
    })

    return Buffer.from(mergedText, 'utf-8')
  } else {
    // Word格式
    const allSections = []

    // 封面
    allSections.push(
      new Paragraph({
        text: '批量学生对话数据导出',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
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
          new TextRun({ text: '学生总数: ', bold: true }),
          new TextRun({ text: String(allStudentsData.length) }),
        ],
        spacing: { after: 400 },
      }),
    )

    // 每个学生的数据
    allStudentsData.forEach((studentData, index) => {
      const sections = generateStudentWordSections(studentData, index === 0)
      allSections.push(...sections)
    })

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: allSections,
        },
      ],
    })

    return await Packer.toBuffer(doc)
  }
}

/**
 * ZIP打包导出 - 每个学生一个文件
 */
async function exportAsZip(sessionIds, format, client, res) {
  console.log(`📦 ZIP打包导出 ${sessionIds.length} 个学生数据，格式: ${format}`)

  const archive = archiver('zip', {
    zlib: { level: 9 },
  })

  archive.on('error', (err) => {
    throw err
  })

  // 设置响应头
  const filename = `students_batch_${Date.now()}.zip`
  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  archive.pipe(res)

  // 为每个学生生成文件
  for (const sessionId of sessionIds) {
    const data = await getStudentData(sessionId, client)
    if (!data) continue

    if (format === 'txt') {
      const content = generateStudentTXT(data, true)
      archive.append(content, { name: `${sessionId}.txt` })
    } else {
      // Word格式
      const sections = generateStudentWordSections(data, true)
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: sections,
          },
        ],
      })
      const buffer = await Packer.toBuffer(doc)
      archive.append(buffer, { name: `${sessionId}.docx` })
    }
  }

  await archive.finalize()
}

/**
 * API处理函数
 */
export default async function handler(req, res) {
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权访问' })
    }

    const { sessionIds, format = 'txt', exportType = 'merged' } = req.body

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json({ error: '请选择至少一个学生' })
    }

    if (sessionIds.length > 100) {
      return res.status(400).json({ error: '一次最多导出100个学生' })
    }

    console.log(
      `📥 批量导出请求: ${sessionIds.length} 个学生, 格式: ${format}, 类型: ${exportType}`,
    )

    const client = await connectToDatabase()

    if (exportType === 'zip') {
      // ZIP打包导出
      await exportAsZip(sessionIds, format, client, res)
      console.log('✅ 批量导出成功 (ZIP)')
      return // ⭐ 添加return，防止继续执行
    } else {
      // 合并导出
      const buffer = await exportMerged(sessionIds, format, client)
      const ext = format === 'txt' ? 'txt' : 'docx'
      const filename = `students_batch_${Date.now()}.${ext}`

      if (format === 'txt') {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      } else {
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        )
      }

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(buffer)
      console.log('✅ 批量导出成功 (合并)')
      return // ⭐ 添加return，防止继续执行
    }

    // 这行应该永远不会被执行到
    console.log('✅ 批量导出成功')
  } catch (error) {
    console.error('❌ 批量导出失败:', error)
    res.status(500).json({
      success: false,
      error: '批量导出失败',
      details: error.message,
    })
  }
}
