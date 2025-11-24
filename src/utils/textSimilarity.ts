// src/utils/textSimilarity.ts
// 文本相似度计算工具 - 用于比较学生最终方案与 AI 参考方案的相似度

/**
 * 计算两个字符串的 Jaccard 相似度（基于词汇）
 * @param text1 文本1
 * @param text2 文本2
 * @returns 0-1 之间的相似度值
 */
export function calculateJaccardSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0

  // 中文分词（简单按字符和常见词汇分割）
  const tokenize = (text: string): Set<string> => {
    // 移除 Markdown 标记
    const cleaned = text
      .replace(/[#*`>\-|]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    // 提取中文词汇（2-4字组合）和英文单词
    const tokens = new Set<string>()

    // 中文：提取2字、3字、4字组合
    const chineseChars = cleaned.match(/[\u4e00-\u9fa5]+/g) || []
    chineseChars.forEach((segment) => {
      for (let i = 0; i < segment.length; i++) {
        if (i + 2 <= segment.length) tokens.add(segment.substring(i, i + 2))
        if (i + 3 <= segment.length) tokens.add(segment.substring(i, i + 3))
        if (i + 4 <= segment.length) tokens.add(segment.substring(i, i + 4))
      }
    })

    // 英文和数字
    const englishWords = cleaned.match(/[a-zA-Z0-9]+/g) || []
    englishWords.forEach((word) => tokens.add(word.toLowerCase()))

    return tokens
  }

  const set1 = tokenize(text1)
  const set2 = tokenize(text2)

  if (set1.size === 0 || set2.size === 0) return 0

  // 计算交集
  const intersection = new Set([...set1].filter((x) => set2.has(x)))

  // 计算并集
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

/**
 * 计算编辑距离相似度（Levenshtein）
 * 适用于较短文本的精确比较
 */
export function calculateLevenshteinSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0
  if (text1 === text2) return 1

  const len1 = text1.length
  const len2 = text2.length

  // 对于长文本，使用简化版本（采样比较）
  if (len1 > 1000 || len2 > 1000) {
    const sample1 = text1.substring(0, 500) + text1.substring(len1 - 500)
    const sample2 = text2.substring(0, 500) + text2.substring(len2 - 500)
    return calculateLevenshteinSimilarity(sample1, sample2)
  }

  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = text1[i - 1] === text2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }

  const maxLen = Math.max(len1, len2)
  return 1 - matrix[len1][len2] / maxLen
}

/**
 * 计算关键词重叠度
 * 专门针对智能通风系统的领域关键词
 */
export function calculateKeywordOverlap(
  text1: string,
  text2: string,
): {
  overlap: number
  matchedKeywords: string[]
  totalKeywords: number
} {
  // 领域关键词库
  const domainKeywords = [
    // 传感器相关
    '温度传感器',
    'CO2传感器',
    '湿度传感器',
    '人体感应',
    'PM2.5',
    '传感器',
    // 控制相关
    '自动控制',
    '手动模式',
    '定时模式',
    '智能调节',
    '阈值',
    '触发',
    // 策略相关
    '节能模式',
    '舒适模式',
    '应急模式',
    '夜间模式',
    '静音模式',
    '节能',
    // 用户交互
    '提示词',
    '报警',
    '通知',
    '显示屏',
    '语音播报',
    '用户界面',
    // 应急处理
    '故障处理',
    '备用方案',
    '极端情况',
    '传感器故障',
    '应急',
    // 成本效益
    '成本',
    '效益',
    '投资回收',
    '年节省',
    '预算',
    // 技术参数
    'ppm',
    '温度',
    '湿度',
    '风速',
    '功率',
    '通风',
    // 系统目标
    '空气质量',
    '能耗',
    '舒适度',
    '健康',
    '安全',
  ]

  const findKeywords = (text: string): Set<string> => {
    const found = new Set<string>()
    domainKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        found.add(keyword)
      }
    })
    return found
  }

  const keywords1 = findKeywords(text1)
  const keywords2 = findKeywords(text2)

  const allKeywords = new Set([...keywords1, ...keywords2])
  const matchedKeywords = [...keywords1].filter((k) => keywords2.has(k))

  return {
    overlap: allKeywords.size > 0 ? matchedKeywords.length / allKeywords.size : 0,
    matchedKeywords,
    totalKeywords: allKeywords.size,
  }
}

/**
 * 计算段落结构相似度
 * 比较两个文档的章节结构
 */
export function calculateStructureSimilarity(text1: string, text2: string): number {
  const extractHeadings = (text: string): string[] => {
    const headingPattern = /^#{1,3}\s*(.+)$/gm
    const matches = text.match(headingPattern) || []
    return matches.map((h) => h.replace(/^#+\s*/, '').trim())
  }

  const headings1 = extractHeadings(text1)
  const headings2 = extractHeadings(text2)

  if (headings1.length === 0 && headings2.length === 0) return 1
  if (headings1.length === 0 || headings2.length === 0) return 0

  // 计算标题的相似匹配
  let matchCount = 0
  headings1.forEach((h1) => {
    if (
      headings2.some(
        (h2) => h1.includes(h2) || h2.includes(h1) || calculateJaccardSimilarity(h1, h2) > 0.5,
      )
    ) {
      matchCount++
    }
  })

  return matchCount / Math.max(headings1.length, headings2.length)
}

/**
 * 综合相似度分析结果接口
 */
export interface SimilarityResult {
  // 综合相似度 (0-100)
  overallSimilarity: number
  // 各维度详情
  dimensions: {
    // Jaccard 词汇相似度
    lexical: number
    // 关键词重叠度
    keyword: number
    // 结构相似度
    structure: number
  }
  // 匹配的关键词列表
  matchedKeywords: string[]
  // 分析结论
  conclusion: 'low' | 'medium' | 'high' | 'very_high'
  // 人类可读的描述
  description: string
}

/**
 * 综合相似度分析
 * 返回多维度的相似度评估
 */
export function analyzeSimilarity(studentText: string, aiText: string): SimilarityResult {
  // 计算各维度相似度
  const lexical = calculateJaccardSimilarity(studentText, aiText)
  const keywordResult = calculateKeywordOverlap(studentText, aiText)
  const structure = calculateStructureSimilarity(studentText, aiText)

  // 加权综合（词汇40%，关键词35%，结构25%）
  const overall = (lexical * 0.4 + keywordResult.overlap * 0.35 + structure * 0.25) * 100

  // 判断相似度级别
  let conclusion: SimilarityResult['conclusion']
  let description: string

  if (overall < 20) {
    conclusion = 'low'
    description = '学生方案与AI参考方案差异较大，学生进行了大量原创性思考'
  } else if (overall < 40) {
    conclusion = 'medium'
    description = '学生方案部分参考了AI内容，但有显著的个人修改和补充'
  } else if (overall < 60) {
    conclusion = 'high'
    description = '学生方案较多参考了AI内容，个人原创部分较少'
  } else {
    conclusion = 'very_high'
    description = '学生方案与AI参考方案高度相似，可能直接采用了AI方案'
  }

  return {
    overallSimilarity: Math.round(overall * 100) / 100,
    dimensions: {
      lexical: Math.round(lexical * 100) / 100,
      keyword: Math.round(keywordResult.overlap * 100) / 100,
      structure: Math.round(structure * 100) / 100,
    },
    matchedKeywords: keywordResult.matchedKeywords,
    conclusion,
    description,
  }
}

/**
 * 快速相似度检查（用于实时反馈）
 * @returns 0-100 的相似度百分比
 */
export function quickSimilarityCheck(text1: string, text2: string): number {
  return Math.round(calculateJaccardSimilarity(text1, text2) * 100)
}

/**
 * 检测是否可能是直接复制
 * 通过检测长连续匹配片段
 */
export function detectDirectCopy(
  studentText: string,
  aiText: string,
): {
  hasCopySegments: boolean
  copyPercentage: number
  longestMatch: number
} {
  if (!studentText || !aiText) {
    return { hasCopySegments: false, copyPercentage: 0, longestMatch: 0 }
  }

  // 使用滑动窗口检测连续匹配
  const windowSize = 20 // 20个字符的窗口
  let matchCount = 0
  let longestMatch = 0
  let currentMatch = 0

  for (let i = 0; i <= studentText.length - windowSize; i++) {
    const window = studentText.substring(i, i + windowSize)
    if (aiText.includes(window)) {
      matchCount++
      currentMatch += windowSize
    } else {
      longestMatch = Math.max(longestMatch, currentMatch)
      currentMatch = 0
    }
  }
  longestMatch = Math.max(longestMatch, currentMatch)

  const totalWindows = Math.max(1, studentText.length - windowSize + 1)
  const copyPercentage = (matchCount / totalWindows) * 100

  return {
    hasCopySegments: copyPercentage > 30 || longestMatch > 100,
    copyPercentage: Math.round(copyPercentage),
    longestMatch,
  }
}
