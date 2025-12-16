// api/teacher/export/batch-questionnaires.js - 批量导出问卷数据
import { MongoClient } from 'mongodb'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx'
import ExcelJS from 'exceljs'

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
 * 问卷题目文本配置
 */
const QUESTIONNAIRE_CONFIG = {
  // 答案选项
  options: {
    1: '非常不同意',
    2: '不同意',
    3: '一般',
    4: '同意',
    5: '非常同意',
  },

  // 能力问卷题目
  ability: {
    title: '（一）能力问卷',
    questions: {
      ability_q1: '我能快速判断任务中哪些信息是最重要的。',
      ability_q2: '我善于从多个信息来源中整合相关内容。',
      ability_q3: '当信息分散时,我也能组织出解决思路。',
      ability_q4: '我愿意尝试不同的策略来构思哪种效果更好。',
      ability_q5: '我认为自己设计的方案是可行且易于实施的。',
      ability_q6: '如果原策略效果不好,我会立刻尝试新方法。',
      ability_q7: '我总是确保我的每一步都与问题目标一致。',
      ability_q8: '我在解决问题时会考虑所有环境条件之间的关系。',
      ability_q9: '我倾向于从整体上把握问题,而非只看细节。',
      ability_q10: '我在完成任务后会回顾哪些地方做得不够好。',
      ability_q11: '我能察觉到自己是否需要帮助。',
      ability_q12: '如果发现问题,我会重新评估并修改我的思路。',
    },
  },

  // 人机协作问卷题目
  collaboration: {
    title: '（二）人机协作模式问卷',
    questions: {
      collaboration_q1: '在确定问题时,我依赖AI来生成或解释任务说明。',
      collaboration_q2: '我觉得AI比我更擅长快速识别任务的核心问题。',
      collaboration_q3: '我认为AI在提供解决问题所需的信息上比我发挥了更大作用。',
      collaboration_q4: '我常直接采用AI生成的方案作为解决方案的一部分。',
      collaboration_q5: '我会在没有太多修改的情况下使用AI的输出。',
      collaboration_q6: '在解决问题时,我主要依靠自己的判断和知识,而不是AI。',
      collaboration_q7: '即使AI能够提供帮助,我也倾向于独立完成任务。',
      collaboration_q8: '我完成复杂问题解决任务时几乎不使用AI。',
      collaboration_q9: '我会自己提出策略,引导AI帮助我澄清问题情境。',
      collaboration_q10: '我会根据AI的反馈修改我的问题定义和策略,使之更符合目标。',
      collaboration_q11: '我会批判性地阅读AI生成的信息,而不是完全接受。',
      collaboration_q12: '当AI的建议不适合时,我会果断放弃它。',
    },
  },

  // 使用体验问卷题目
  experience: {
    title: '（三）使用体验问卷',
    questions: {
      experience_q1: '我觉得使用该智能体是容易理解和操作的。',
      experience_q2: '我在学习任务中使用该智能体时,几乎不需要额外的技术支持。',
      experience_q3: '我觉得智能体能够很好地理解我的提问意图。',
      experience_q4: '我觉得智能体给出的帮助与我的需求是匹配的。',
      experience_q5: '我觉得智能体的解释对我有用。',
      experience_q6: '我认为使用该智能体能够让我更有效地完成任务。',
      experience_q7: '我认为使用智能体能够提升我的问题解决能力。',
      experience_q8: '总体而言,我对该智能体的使用体验是满意的。',
      experience_q9: '我愿意在未来的学习中继续使用这类智能体。',
    },
  },
}

/**
 * 获取多个学生的问卷数据
 */
async function getBatchQuestionnaires(sessionIds, client) {
  const db = client.db('llm_learning')
  const questionnaireCollection = db.collection('questionnaires')
  const conversationCollection = db.collection('conversations')

  const results = []

  for (const sessionId of sessionIds) {
    const questionnaire = await questionnaireCollection.findOne({ session_id: sessionId })

    if (!questionnaire) {
      results.push({
        sessionId,
        experimentId: null,
        hasQuestionnaire: false,
      })
      continue
    }

    // 获取experimentId
    const firstConv = await conversationCollection.findOne({ sessionId })
    const experimentId = firstConv?.experimentId || '未知'

    results.push({
      sessionId,
      experimentId,
      hasQuestionnaire: true,
      completedAt: questionnaire.completed_at,
      totalTime: questionnaire.total_time_minutes,

      // 分数统计
      scores: {
        ability: {
          total: questionnaire.ability_score_total,
          average: questionnaire.ability_score_average,
        },
        collaboration: {
          total: questionnaire.collaboration_score_total,
          average: questionnaire.collaboration_score_average,
        },
        experience: {
          total: questionnaire.experience_score_total,
          average: questionnaire.experience_score_average,
        },
      },

      // 每道题的答案
      answers: {
        ability_q1: questionnaire.ability_q1,
        ability_q2: questionnaire.ability_q2,
        ability_q3: questionnaire.ability_q3,
        ability_q4: questionnaire.ability_q4,
        ability_q5: questionnaire.ability_q5,
        ability_q6: questionnaire.ability_q6,
        ability_q7: questionnaire.ability_q7,
        ability_q8: questionnaire.ability_q8,
        ability_q9: questionnaire.ability_q9,
        ability_q10: questionnaire.ability_q10,
        ability_q11: questionnaire.ability_q11,
        ability_q12: questionnaire.ability_q12,

        collaboration_q1: questionnaire.collaboration_q1,
        collaboration_q2: questionnaire.collaboration_q2,
        collaboration_q3: questionnaire.collaboration_q3,
        collaboration_q4: questionnaire.collaboration_q4,
        collaboration_q5: questionnaire.collaboration_q5,
        collaboration_q6: questionnaire.collaboration_q6,
        collaboration_q7: questionnaire.collaboration_q7,
        collaboration_q8: questionnaire.collaboration_q8,
        collaboration_q9: questionnaire.collaboration_q9,
        collaboration_q10: questionnaire.collaboration_q10,
        collaboration_q11: questionnaire.collaboration_q11,
        collaboration_q12: questionnaire.collaboration_q12,

        experience_q1: questionnaire.experience_q1,
        experience_q2: questionnaire.experience_q2,
        experience_q3: questionnaire.experience_q3,
        experience_q4: questionnaire.experience_q4,
        experience_q5: questionnaire.experience_q5,
        experience_q6: questionnaire.experience_q6,
        experience_q7: questionnaire.experience_q7,
        experience_q8: questionnaire.experience_q8,
        experience_q9: questionnaire.experience_q9,
      },

      // 开放性反馈
      feedback: questionnaire.feedback_open || '',
    })
  }

  return results
}

/**
 * 生成CSV格式
 */
function generateCSV(questionnaires) {
  // CSV标题行
  const headers = [
    'sessionId',
    'experimentId',
    'completedAt',
    'totalTime',
    'ability_total',
    'ability_average',
    'collaboration_total',
    'collaboration_average',
    'experience_total',
    'experience_average',
  ]

  // 添加所有题目列
  for (let i = 1; i <= 12; i++) {
    headers.push(`ability_q${i}`)
  }
  for (let i = 1; i <= 12; i++) {
    headers.push(`collaboration_q${i}`)
  }
  for (let i = 1; i <= 9; i++) {
    headers.push(`experience_q${i}`)
  }
  headers.push('feedback')

  let csv = headers.join(',') + '\n'

  // 数据行
  questionnaires.forEach((q) => {
    if (!q.hasQuestionnaire) {
      csv += `${q.sessionId},${q.experimentId || ''},,,,,,,,,`
      csv += ','.repeat(33) // 33道题目
      csv += '\n'
      return
    }

    const row = [
      q.sessionId,
      q.experimentId,
      q.completedAt || '',
      q.totalTime || '',
      q.scores.ability.total || '',
      q.scores.ability.average?.toFixed(2) || '',
      q.scores.collaboration.total || '',
      q.scores.collaboration.average?.toFixed(2) || '',
      q.scores.experience.total || '',
      q.scores.experience.average?.toFixed(2) || '',
    ]

    // 添加所有答案
    for (let i = 1; i <= 12; i++) {
      row.push(q.answers[`ability_q${i}`] || '')
    }
    for (let i = 1; i <= 12; i++) {
      row.push(q.answers[`collaboration_q${i}`] || '')
    }
    for (let i = 1; i <= 9; i++) {
      row.push(q.answers[`experience_q${i}`] || '')
    }

    // 开放性反馈需要转义
    const feedback = (q.feedback || '').replace(/"/g, '""')
    row.push(`"${feedback}"`)

    csv += row.join(',') + '\n'
  })

  return csv
}

/**
 * 生成Excel格式
 */
async function generateExcel(questionnaires) {
  const workbook = new ExcelJS.Workbook()

  // 工作表1：汇总数据
  const summarySheet = workbook.addWorksheet('问卷汇总')

  // 设置列宽
  summarySheet.columns = [
    { header: '学生ID', key: 'sessionId', width: 25 },
    { header: '实验组别', key: 'experimentId', width: 15 },
    { header: '完成时间', key: 'completedAt', width: 20 },
    { header: '用时(分钟)', key: 'totalTime', width: 12 },
    { header: '能力总分', key: 'ability_total', width: 12 },
    { header: '能力平均分', key: 'ability_avg', width: 12 },
    { header: '协作总分', key: 'collaboration_total', width: 12 },
    { header: '协作平均分', key: 'collaboration_avg', width: 12 },
    { header: '体验总分', key: 'experience_total', width: 12 },
    { header: '体验平均分', key: 'experience_avg', width: 12 },
  ]

  // 设置标题行样式
  summarySheet.getRow(1).font = { bold: true }
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  }
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // 添加数据
  questionnaires.forEach((q) => {
    if (!q.hasQuestionnaire) {
      summarySheet.addRow({
        sessionId: q.sessionId,
        experimentId: q.experimentId || '',
        completedAt: '未提交',
        totalTime: '',
        ability_total: '',
        ability_avg: '',
        collaboration_total: '',
        collaboration_avg: '',
        experience_total: '',
        experience_avg: '',
      })
    } else {
      summarySheet.addRow({
        sessionId: q.sessionId,
        experimentId: q.experimentId,
        completedAt: q.completedAt,
        totalTime: q.totalTime,
        ability_total: q.scores.ability.total,
        ability_avg: q.scores.ability.average?.toFixed(2),
        collaboration_total: q.scores.collaboration.total,
        collaboration_avg: q.scores.collaboration.average?.toFixed(2),
        experience_total: q.scores.experience.total,
        experience_avg: q.scores.experience.average?.toFixed(2),
      })
    }
  })

  // 工作表2：详细答案
  const detailSheet = workbook.addWorksheet('详细答案')

  // 构建详细答案的列
  const detailColumns = [
    { header: '学生ID', key: 'sessionId', width: 25 },
    { header: '实验组别', key: 'experimentId', width: 15 },
  ]

  // 添加所有题目列
  for (let i = 1; i <= 12; i++) {
    detailColumns.push({
      header: `能力Q${i}`,
      key: `ability_q${i}`,
      width: 10,
    })
  }
  for (let i = 1; i <= 12; i++) {
    detailColumns.push({
      header: `协作Q${i}`,
      key: `collaboration_q${i}`,
      width: 10,
    })
  }
  for (let i = 1; i <= 9; i++) {
    detailColumns.push({
      header: `体验Q${i}`,
      key: `experience_q${i}`,
      width: 10,
    })
  }
  detailColumns.push({ header: '开放性反馈', key: 'feedback', width: 40 })

  detailSheet.columns = detailColumns

  // 设置标题行样式
  detailSheet.getRow(1).font = { bold: true }
  detailSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' },
  }
  detailSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // 添加数据
  questionnaires.forEach((q) => {
    if (!q.hasQuestionnaire) {
      detailSheet.addRow({
        sessionId: q.sessionId,
        experimentId: q.experimentId || '',
      })
    } else {
      const row = {
        sessionId: q.sessionId,
        experimentId: q.experimentId,
        ...q.answers,
        feedback: q.feedback,
      }
      detailSheet.addRow(row)
    }
  })

  // 工作表3：题目说明
  const legendSheet = workbook.addWorksheet('题目说明')
  legendSheet.columns = [
    { header: '题目编号', key: 'id', width: 15 },
    { header: '类别', key: 'category', width: 20 },
    { header: '题目内容', key: 'question', width: 60 },
  ]

  legendSheet.getRow(1).font = { bold: true }
  legendSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' },
  }
  legendSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // 添加题目说明
  Object.entries(QUESTIONNAIRE_CONFIG.ability.questions).forEach(([id, question]) => {
    legendSheet.addRow({
      id,
      category: '能力问卷',
      question,
    })
  })

  Object.entries(QUESTIONNAIRE_CONFIG.collaboration.questions).forEach(([id, question]) => {
    legendSheet.addRow({
      id,
      category: '人机协作',
      question,
    })
  })

  Object.entries(QUESTIONNAIRE_CONFIG.experience.questions).forEach(([id, question]) => {
    legendSheet.addRow({
      id,
      category: '使用体验',
      question,
    })
  })

  // 添加答案选项说明
  legendSheet.addRow({})
  legendSheet.addRow({ id: '答案说明', category: '', question: '' })
  Object.entries(QUESTIONNAIRE_CONFIG.options).forEach(([value, text]) => {
    legendSheet.addRow({
      id: value,
      category: '',
      question: text,
    })
  })

  return await workbook.xlsx.writeBuffer()
}

/**
 * 生成Word格式
 */
async function generateWord(questionnaires) {
  const sections = []

  // 标题
  sections.push(
    new Paragraph({
      text: '批量问卷数据导出报告',
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
        new TextRun({ text: String(questionnaires.length) }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '已提交问卷: ', bold: true }),
        new TextRun({
          text: String(questionnaires.filter((q) => q.hasQuestionnaire).length),
        }),
      ],
      spacing: { after: 400 },
    }),
  )

  // 为每个学生生成报告
  questionnaires.forEach((q, index) => {
    if (index > 0) {
      sections.push(
        new Paragraph({
          text: '',
          pageBreakBefore: true,
        }),
      )
    }

    sections.push(
      new Paragraph({
        text: `学生 ${index + 1}: ${q.sessionId}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '实验组别: ', bold: true }),
          new TextRun({ text: q.experimentId || '未知' }),
        ],
        spacing: { after: 100 },
      }),
    )

    if (!q.hasQuestionnaire) {
      sections.push(
        new Paragraph({
          text: '⚠️ 该学生尚未提交问卷',
          spacing: { before: 200, after: 400 },
        }),
      )
      return
    }

    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: '完成时间: ', bold: true }),
          new TextRun({ text: q.completedAt || '' }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '用时: ', bold: true }),
          new TextRun({ text: `${q.totalTime} 分钟` }),
        ],
        spacing: { after: 300 },
      }),
    )

    // 分数统计表格
    sections.push(
      new Paragraph({
        text: '分数统计',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
    )

    const scoreTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: '类别', bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: '总分', bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: '平均分', bold: true })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('能力问卷')] }),
            new TableCell({ children: [new Paragraph(String(q.scores.ability.total))] }),
            new TableCell({
              children: [new Paragraph(q.scores.ability.average?.toFixed(2) || '')],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('协作问卷')] }),
            new TableCell({ children: [new Paragraph(String(q.scores.collaboration.total))] }),
            new TableCell({
              children: [new Paragraph(q.scores.collaboration.average?.toFixed(2) || '')],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('体验问卷')] }),
            new TableCell({ children: [new Paragraph(String(q.scores.experience.total))] }),
            new TableCell({
              children: [new Paragraph(q.scores.experience.average?.toFixed(2) || '')],
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    })

    sections.push(new Paragraph({ children: [scoreTable], spacing: { after: 300 } }))

    // 详细答案
    sections.push(
      new Paragraph({
        text: '详细答案',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
    )

    // 能力问卷
    sections.push(
      new Paragraph({
        text: QUESTIONNAIRE_CONFIG.ability.title,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 150 },
      }),
    )

    Object.entries(QUESTIONNAIRE_CONFIG.ability.questions).forEach(([id, question], idx) => {
      const answer = q.answers[id]
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Q${idx + 1}. `, bold: true }),
            new TextRun({ text: question }),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '回答: ', bold: true }),
            new TextRun({
              text: answer ? `${answer}分 (${QUESTIONNAIRE_CONFIG.options[answer]})` : '未作答',
            }),
          ],
          spacing: { after: 150 },
        }),
      )
    })

    // 人机协作问卷
    sections.push(
      new Paragraph({
        text: QUESTIONNAIRE_CONFIG.collaboration.title,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 150 },
      }),
    )

    Object.entries(QUESTIONNAIRE_CONFIG.collaboration.questions).forEach(([id, question], idx) => {
      const answer = q.answers[id]
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Q${idx + 1}. `, bold: true }),
            new TextRun({ text: question }),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '回答: ', bold: true }),
            new TextRun({
              text: answer ? `${answer}分 (${QUESTIONNAIRE_CONFIG.options[answer]})` : '未作答',
            }),
          ],
          spacing: { after: 150 },
        }),
      )
    })

    // 使用体验问卷
    sections.push(
      new Paragraph({
        text: QUESTIONNAIRE_CONFIG.experience.title,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 150 },
      }),
    )

    Object.entries(QUESTIONNAIRE_CONFIG.experience.questions).forEach(([id, question], idx) => {
      const answer = q.answers[id]
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Q${idx + 1}. `, bold: true }),
            new TextRun({ text: question }),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '回答: ', bold: true }),
            new TextRun({
              text: answer ? `${answer}分 (${QUESTIONNAIRE_CONFIG.options[answer]})` : '未作答',
            }),
          ],
          spacing: { after: 150 },
        }),
      )
    })

    // 开放性反馈
    if (q.feedback) {
      sections.push(
        new Paragraph({
          text: '开放性反馈',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 300, after: 150 },
        }),
        new Paragraph({
          text: q.feedback,
          spacing: { after: 300 },
        }),
      )
    }
  })

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

    const { sessionIds, format = 'csv' } = req.body

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json({ error: '请选择至少一个学生' })
    }

    if (sessionIds.length > 200) {
      return res.status(400).json({ error: '一次最多导出200个学生的问卷' })
    }

    console.log(`📥 批量问卷导出请求: ${sessionIds.length} 个学生, 格式: ${format}`)

    const client = await connectToDatabase()
    const questionnaires = await getBatchQuestionnaires(sessionIds, client)

    const timestamp = Date.now()

    if (format === 'csv') {
      const csvContent = generateCSV(questionnaires)
      const filename = `questionnaires_batch_${timestamp}.csv`

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      // 添加UTF-8 BOM以支持Excel正确显示中文
      res.send('\uFEFF' + csvContent)
      console.log('✅ 批量问卷导出成功 (CSV)')
      return
    } else if (format === 'excel') {
      const buffer = await generateExcel(questionnaires)
      const filename = `questionnaires_batch_${timestamp}.xlsx`

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(buffer)
      console.log('✅ 批量问卷导出成功 (Excel)')
      return
    } else if (format === 'word') {
      const buffer = await generateWord(questionnaires)
      const filename = `questionnaires_batch_${timestamp}.docx`

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      )
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(buffer)
      console.log('✅ 批量问卷导出成功 (Word)')
      return
    } else {
      return res.status(400).json({ error: '不支持的格式，请使用 csv, excel 或 word' })
    }
  } catch (error) {
    console.error('❌ 批量问卷导出失败:', error)
    res.status(500).json({
      success: false,
      error: '批量问卷导出失败',
      details: error.message,
    })
  }
}
