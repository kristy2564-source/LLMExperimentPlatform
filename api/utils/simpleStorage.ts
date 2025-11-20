// utils/simpleStorage.ts
interface ConversationRecord {
  sessionId: string
  step: number
  stage?: number
  userInput: string
  aiResponse: string
  conversationCount: number
  timestamp: string
  context: string
  experimentId?: string
  studentName?: string
}

// 🔥 修改：添加方案相关字段
interface MessageType {
  id: string
  type: 'ai' | 'user' | 'system'
  content: string
  timestamp: string
  stage?: number
  // 🔥 新增：方案消息相关字段（主要用于 Step6）
  isSolution?: boolean // 是否为方案消息
  solutionVersion?: number // 方案版本号
  optimizationRequest?: string // 优化说明
  systemType?: string
}

// 保留原有接口（向后兼容）
interface OptimizationRecord {
  id: string
  version: number
  request: string
  solution: string
  timestamp: string
}

interface GeneratedSolution {
  id: string
  version: number
  content: string
  timestamp: string
  isActive: boolean
  optimizationHistory?: OptimizationRecord[]
}

export interface StepData {
  stepNumber?: number
  conversationCount: number
  stageCompletionStatus: boolean[]
  messages: MessageType[]
  currentStage: number
  isCompleted: boolean
  completedAt?: string
  // 问卷相关字段
  questionnaireCompleted?: boolean
  questionnaireSubmittedAt?: string
  questionnaireId?: string
  // Step2 特有字段
  initialInstructions?: { [key: number]: string }
  // 对话记录字段
  conversationRecords?: ConversationRecord[]
  // 方案相关字段（保留用于向后兼容，但 Step6 不再使用）
  generatedSolutions?: GeneratedSolution[]
  // 🔥 新增：当前方案版本号（Step6 使用）
  currentSolutionVersion?: number
}

interface SessionData {
  currentStep: number
  steps: { [stepNumber: string]: StepData }
  sessionId: string
  lastActive: string
}

class SimpleStorage {
  private readonly STORAGE_KEY = 'experiment_session'

  // Step2 的默认系统指令
  private readonly STEP2_INSTRUCTIONS = {
    1: '根据以上数据，你认为教室在夏季面临哪些主要问题？请分析温度变化规律和现状。',
    2: '很好的分析！基于这些问题，你觉得应该从哪些方面入手来改善教室环境？',
    3: '基于你的解决思路，一个智能环境控制系统需要考虑哪些关键要素和条件？',
  }

  // 创建默认步骤数据
  private createDefaultStepData(stepNumber: number): StepData {
    const stepData: StepData = {
      stepNumber,
      messages: [],
      currentStage: 1,
      conversationCount: 0,
      stageCompletionStatus: [false, false, false],
      isCompleted: false,
      conversationRecords: [],
      generatedSolutions: [],
      currentSolutionVersion: 0, // 🔥 新增
    }

    if (stepNumber === 2) {
      stepData.initialInstructions = this.STEP2_INSTRUCTIONS
    }

    return stepData
  }

  // 获取当前会话数据
  getSessionData(): SessionData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('读取会话数据失败:', error)
      return null
    }
  }

  // 初始化会话
  initSession(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const sessionData: SessionData = {
      currentStep: 1,
      steps: {},
      sessionId,
      lastActive: new Date().toISOString(),
    }

    this.saveSession(sessionData)
    return sessionId
  }

  // 保存会话数据
  private saveSession(data: SessionData): void {
    try {
      data.lastActive = new Date().toISOString()
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('保存会话数据失败:', error)
    }
  }

  // 获取步骤数据
  getStepData(stepNumber: number): StepData | null {
    const session = this.getSessionData()
    const stepData = session?.steps[stepNumber.toString()] || null

    // 如果是Step2，确保有初始指令
    if (stepNumber === 2 && stepData && !stepData.initialInstructions) {
      stepData.initialInstructions = this.STEP2_INSTRUCTIONS
      this.saveStepData(stepNumber, stepData)
    }

    return stepData
  }

  // 保存步骤数据
  saveStepData(stepNumber: number, data: Partial<StepData>): void {
    const session = this.getSessionData()
    if (!session) return

    const defaultStepData = this.createDefaultStepData(stepNumber)
    const existingData = session.steps[stepNumber.toString()] || defaultStepData

    // 确保数组属性正确合并
    session.steps[stepNumber.toString()] = {
      ...existingData,
      ...data,
      // 确保这些属性始终是数组
      messages: data.messages || existingData.messages || [],
      conversationRecords: data.conversationRecords || existingData.conversationRecords || [],
      generatedSolutions: data.generatedSolutions || existingData.generatedSolutions || [],
    }

    this.saveSession(session)
  }

  // ==================== 🔥 新增：Step6 方案管理方法 ====================

  /**
   * 获取所有方案消息（从 messages 中筛选）
   */
  getSolutionMessages(stepNumber: number): MessageType[] {
    const stepData = this.getStepData(stepNumber)
    if (!stepData) return []

    return stepData.messages
      .filter((msg) => msg.isSolution)
      .sort((a, b) => {
        const versionA = a.solutionVersion || 0
        const versionB = b.solutionVersion || 0
        return versionA - versionB
      })
  }

  /**
   * 获取最新方案消息
   */
  getLatestSolutionMessage(stepNumber: number): MessageType | null {
    const solutions = this.getSolutionMessages(stepNumber)
    return solutions.length > 0 ? solutions[solutions.length - 1] : null
  }

  /**
   * 获取当前方案版本号
   */
  getCurrentSolutionVersion(stepNumber: number): number {
    const stepData = this.getStepData(stepNumber)
    if (!stepData) return 0

    // 优先使用显式版本号
    if (stepData.currentSolutionVersion) {
      return stepData.currentSolutionVersion
    }

    // 否则从方案消息中推断
    const solutions = this.getSolutionMessages(stepNumber)
    if (solutions.length === 0) return 0

    const maxVersion = Math.max(...solutions.map((s) => s.solutionVersion || 0))
    return maxVersion
  }

  /**
   * 添加方案消息（Step6 专用）
   */
  addSolutionMessage(
    stepNumber: number,
    content: string,
    version: number,
    optimizationRequest?: string,
  ): string {
    let stepData = this.getStepData(stepNumber)
    if (!stepData) {
      stepData = this.createDefaultStepData(stepNumber)
    }

    const messageId = `solution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const solutionMessage: MessageType = {
      id: messageId,
      type: 'ai',
      content,
      timestamp: new Date().toISOString(),
      stage: 1,
      isSolution: true,
      solutionVersion: version,
      optimizationRequest,
    }

    const updatedMessages = [...stepData.messages, solutionMessage]

    this.saveStepData(stepNumber, {
      ...stepData,
      messages: updatedMessages,
      currentSolutionVersion: version,
    })

    console.log(`✅ 方案消息已添加，版本: v${version}`)
    return messageId
  }

  // ==================== 保留的旧方法（向后兼容） ====================

  // 保留旧的方案保存方法（其他步骤可能还在使用）
  saveSolution(stepNumber: number, solutionContent: string, version: number = 1): string {
    const stepData = this.getStepData(stepNumber)
    if (!stepData) return ''

    const solutionId = `solution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newSolution: GeneratedSolution = {
      id: solutionId,
      version,
      content: solutionContent,
      timestamp: new Date().toISOString(),
      isActive: true,
      optimizationHistory: [],
    }

    const existingSolutions = stepData.generatedSolutions || []
    existingSolutions.forEach((solution) => (solution.isActive = false))

    const updatedSolutions = [...existingSolutions, newSolution]

    this.saveStepData(stepNumber, {
      ...stepData,
      generatedSolutions: updatedSolutions,
    })

    console.log(`✅ 方案已保存（旧方法），ID: ${solutionId}`)
    return solutionId
  }

  getActiveSolution(stepNumber: number): GeneratedSolution | null {
    const stepData = this.getStepData(stepNumber)
    if (!stepData || !stepData.generatedSolutions) return null

    return stepData.generatedSolutions.find((solution) => solution.isActive) || null
  }

  getAllSolutions(stepNumber: number): GeneratedSolution[] {
    const stepData = this.getStepData(stepNumber)
    if (!stepData || !stepData.generatedSolutions) return []

    return stepData.generatedSolutions.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  }

  saveOptimization(
    stepNumber: number,
    solutionId: string,
    optimizationRequest: string,
    optimizedContent: string,
  ): string {
    const stepData = this.getStepData(stepNumber)
    if (!stepData || !stepData.generatedSolutions) return ''

    const solution = stepData.generatedSolutions.find((s) => s.id === solutionId)
    if (!solution) return ''

    const optimizationId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newVersion = (solution.optimizationHistory?.length || 0) + 2

    const optimization: OptimizationRecord = {
      id: optimizationId,
      version: newVersion,
      request: optimizationRequest,
      solution: optimizedContent,
      timestamp: new Date().toISOString(),
    }

    if (!solution.optimizationHistory) {
      solution.optimizationHistory = []
    }
    solution.optimizationHistory.push(optimization)

    solution.content = optimizedContent
    solution.version = newVersion

    this.saveStepData(stepNumber, stepData)

    console.log(`✅ 方案优化已保存（旧方法），版本: v${newVersion}`)
    return optimizationId
  }

  setActiveSolution(stepNumber: number, solutionId: string): boolean {
    const stepData = this.getStepData(stepNumber)
    if (!stepData || !stepData.generatedSolutions) return false

    let found = false
    stepData.generatedSolutions.forEach((solution) => {
      solution.isActive = solution.id === solutionId
      if (solution.id === solutionId) found = true
    })

    if (found) {
      this.saveStepData(stepNumber, stepData)
    }

    return found
  }

  // ==================== 原有方法保持不变 ====================

  addSystemInstruction(stepNumber: number, stage: number): void {
    let stepData = this.getStepData(stepNumber)
    if (!stepData) {
      stepData = this.createDefaultStepData(stepNumber)
    }

    const instruction = stepData.initialInstructions?.[stage]
    if (!instruction) return

    const hasSystemMsg = stepData.messages.some(
      (msg) => msg.type === 'system' && msg.stage === stage,
    )

    if (!hasSystemMsg) {
      const systemMessage: MessageType = {
        id: `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'system',
        content: instruction,
        timestamp: new Date().toISOString(),
        stage,
      }

      const updatedMessages = [...stepData.messages, systemMessage]
      this.saveStepData(stepNumber, { ...stepData, messages: updatedMessages })
    }
  }

  addMessage(
    stepNumber: number,
    type: 'ai' | 'user' | 'system',
    content: string,
    stage?: number,
  ): void {
    let stepData = this.getStepData(stepNumber)
    if (!stepData) {
      stepData = this.createDefaultStepData(stepNumber)
    }

    const message: MessageType = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date().toISOString(),
      stage,
    }

    const updatedMessages = [...stepData.messages, message]
    this.saveStepData(stepNumber, { ...stepData, messages: updatedMessages })
  }

  addConversationPair(
    stepNumber: number,
    userInput: string,
    aiResponse: string,
    stage?: number,
    context?: string,
  ): void {
    const session = this.getSessionData()
    if (!session) return

    let stepData = this.getStepData(stepNumber)
    if (!stepData) {
      stepData = this.createDefaultStepData(stepNumber)
      stepData.currentStage = stage || 1
    }

    const newConversationCount = stepData.conversationCount + 1
    const timestamp = new Date().toISOString()

    const userMessage: MessageType = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: userInput,
      timestamp,
      stage,
    }

    const aiMessage: MessageType = {
      id: `ai_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'ai',
      content: aiResponse,
      timestamp,
      stage,
    }

    const updatedMessages = [...stepData.messages, userMessage, aiMessage]

    const conversationRecord: ConversationRecord = {
      sessionId: session.sessionId,
      step: stepNumber,
      stage,
      userInput,
      aiResponse,
      conversationCount: newConversationCount,
      timestamp,
      context: context || `step_${stepNumber}_stage_${stage || 1}`,
    }

    const updatedRecords = [...(stepData.conversationRecords || []), conversationRecord]

    this.saveStepData(stepNumber, {
      ...stepData,
      messages: updatedMessages,
      conversationRecords: updatedRecords,
      conversationCount: newConversationCount,
    })
  }

  updateStageStatus(stepNumber: number, stage: number, completed: boolean): void {
    const stepData = this.getStepData(stepNumber)
    if (!stepData) return

    if (stage >= 1 && stage <= 3) {
      const newStatus = [...stepData.stageCompletionStatus]
      newStatus[stage - 1] = completed
      this.saveStepData(stepNumber, { ...stepData, stageCompletionStatus: newStatus })
    }
  }

  updateCurrentStage(stepNumber: number, stage: number): void {
    const stepData = this.getStepData(stepNumber)
    if (!stepData) return

    this.saveStepData(stepNumber, { ...stepData, currentStage: stage })

    if (stepNumber === 2) {
      this.addSystemInstruction(stepNumber, stage)
    }
  }

  updateConversationCount(stepNumber: number, count: number): void {
    const stepData = this.getStepData(stepNumber)
    if (!stepData) return

    this.saveStepData(stepNumber, { ...stepData, conversationCount: count })
  }

  getStep2Data(): {
    sessionId: string
    currentStage: number
    conversationCount: number
    stageCompletionStatus: boolean[]
    messages: MessageType[]
    initialInstructions: { [key: number]: string }
  } | null {
    const stepData = this.getStepData(2)
    const session = this.getSessionData()

    if (!stepData || !session) return null

    return {
      sessionId: session.sessionId,
      currentStage: stepData.currentStage,
      conversationCount: stepData.conversationCount,
      stageCompletionStatus: stepData.stageCompletionStatus,
      messages: stepData.messages,
      initialInstructions: stepData.initialInstructions || this.STEP2_INSTRUCTIONS,
    }
  }

  saveStep2Data(data: {
    currentStage: number
    conversationCount: number
    stageCompletionStatus: boolean[]
    messages: MessageType[]
  }): void {
    this.saveStepData(2, {
      currentStage: data.currentStage,
      conversationCount: data.conversationCount,
      stageCompletionStatus: data.stageCompletionStatus,
      messages: data.messages,
      initialInstructions: this.STEP2_INSTRUCTIONS,
    })
  }

  updateCurrentStep(stepNumber: number): void {
    const session = this.getSessionData()
    if (!session) return

    if (session.currentStep < stepNumber) {
      const prevStepData = session.steps[session.currentStep.toString()]
      if (prevStepData) {
        prevStepData.isCompleted = true
        prevStepData.completedAt = new Date().toISOString()
      }
    }

    session.currentStep = stepNumber
    this.saveSession(session)
  }

  isStepEditable(stepNumber: number): boolean {
    const session = this.getSessionData()
    if (!session) return true

    return stepNumber >= session.currentStep
  }

  getCompletedSteps(): StepData[] {
    const session = this.getSessionData()
    if (!session) return []

    return Object.values(session.steps)
      .filter((step) => step.isCompleted)
      .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
  }

  getUnsyncedRecords(stepNumber?: number): ConversationRecord[] {
    const session = this.getSessionData()
    if (!session) return []

    if (stepNumber) {
      const stepData = this.getStepData(stepNumber)
      return stepData?.conversationRecords || []
    }

    const allRecords: ConversationRecord[] = []
    Object.values(session.steps).forEach((step) => {
      allRecords.push(...(step.conversationRecords || []))
    })

    return allRecords.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
  }

  markRecordsSynced(stepNumber: number): void {
    const stepData = this.getStepData(stepNumber)
    if (stepData) {
      this.saveStepData(stepNumber, { ...stepData, conversationRecords: [] })
    }
  }

  getExperimentInfo(): { experimentId: string; studentName: string } | null {
    const experimentId = localStorage.getItem('experimentId')
    const studentName = localStorage.getItem('studentName')

    if (!experimentId || !studentName) {
      return null
    }

    return { experimentId, studentName }
  }

  getSessionId(): string {
    const session = this.getSessionData()
    if (session) return session.sessionId

    return this.initSession()
  }

  clearSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)

      localStorage.removeItem('experimentId')
      localStorage.removeItem('studentName')

      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          (key.startsWith('step_') ||
            key.startsWith('experiment_') ||
            key.startsWith('chat_') ||
            key.includes('progress') ||
            key.includes('conversation') ||
            key.includes('solution'))
        ) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key))

      console.log('✅ 已清除所有实验数据，包括:', keysToRemove)
    } catch (error) {
      console.error('清除会话数据时发生错误:', error)
    }
  }

  getCurrentStep(): number {
    const session = this.getSessionData()
    return session?.currentStep || 1
  }

  debugPrintState(): void {
    const session = this.getSessionData()
    console.log('=== Storage Debug Info ===')
    console.log('Session:', session)
    if (session) {
      console.log('Steps:', Object.keys(session.steps))
      Object.entries(session.steps).forEach(([stepNum, stepData]) => {
        console.log(`Step ${stepNum}:`, {
          currentStage: stepData.currentStage,
          messageCount: stepData.messages.length,
          conversationCount: stepData.conversationCount,
          completed: stepData.stageCompletionStatus,
          solutionsCount: stepData.generatedSolutions?.length || 0,
          solutionMessagesCount: stepData.messages.filter((m) => m.isSolution).length,
          currentSolutionVersion: stepData.currentSolutionVersion,
        })
      })
    }
    console.log('========================')
  }

  //🔥 新增：通用的 localStorage 读写方法（用于 Step2-5 快照）
  setItem<T = Record<string, unknown>>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      console.log(`✅ localStorage 已保存: ${key}`)
    } catch (error) {
      console.error(`❌ localStorage 保存失败: ${key}`, error)
    }
  }

  getItem<T = Record<string, unknown>>(key: string): T | null {
    try {
      const data = localStorage.getItem(key)
      return data ? (JSON.parse(data) as T) : null
    } catch (error) {
      console.error(`❌ localStorage 读取失败: ${key}`, error)
      return null
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
      console.log(`✅ localStorage 已删除: ${key}`)
    } catch (error) {
      console.error(`❌ localStorage 删除失败: ${key}`, error)
    }
  }
}

// 导出单例
export const simpleStorage = new SimpleStorage()
