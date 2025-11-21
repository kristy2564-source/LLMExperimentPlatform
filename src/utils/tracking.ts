// utils/tracking.ts

export type Step2EventType =
  | 'step2_enter'
  | 'step2_answer_submit'
  | 'step2_help_request'
  | 'step2_stage_complete'
  | 'step2_stage_change'
  | 'step2_conversation_limit_reached'
  | 'step2_next_step_click'
  | 'step2_confirm_dialog_open'
  | 'step2_confirm_dialog_cancel'
  | 'step2_temp_save'
  | 'step2_content_edit_start'
  | 'step2_content_edit_change'

/**
 * 事件数据值的类型
 */
type EventDataValue = string | number | boolean | null | undefined

/**
 * 埋点事件数据接口
 */
interface TrackEventData {
  sessionId: string
  step: number
  stage?: number
  conversationCount?: number
  event_data?: Record<string, EventDataValue>
  [key: string]: EventDataValue | number | Record<string, EventDataValue> | undefined // 允许额外字段
}

/**
 * 埋点工具类
 */
class Tracker {
  /**
   * 发送埋点事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  async track(eventName: string, data: TrackEventData): Promise<void> {
    try {
      const experimentId = localStorage.getItem('experimentId') || ''
      const studentName = localStorage.getItem('studentName') || ''

      const payload = {
        sessionId: data.sessionId,
        step: data.step,
        stage: data.stage || 0,
        userInput: `[EVENT:${eventName}]`, // 标记为事件埋点
        aiResponse: '',
        conversationCount: data.conversationCount || 0,
        timestamp: new Date(),
        context: `event_${eventName}`,
        experimentId,
        studentName,
        // 埋点字段
        event_name: eventName,
        event_data: data.event_data || {},
      }

      await fetch('/api/conversations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Experiment-ID': experimentId,
        },
        body: JSON.stringify(payload),
      })

      console.log(`📊 埋点成功: ${eventName}`, data.event_data)
    } catch (error) {
      // 埋点失败不影响主流程，只记录日志
      console.error(`❌ 埋点失败: ${eventName}`, error)
    }
  }

  /**
   * Step2 专用埋点方法（预设 step=2）
   */
  async trackStep2(
    eventName: string,
    sessionId: string,
    stage: number,
    conversationCount: number,
    eventData?: Record<string, EventDataValue>,
  ): Promise<void> {
    await this.track(eventName, {
      sessionId,
      step: 2,
      stage,
      conversationCount,
      event_data: eventData,
    })
  }

  /**
   * 批量埋点（可选，用于性能优化）
   */
  private eventQueue: Array<{ eventName: string; data: TrackEventData }> = []
  private flushTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 添加事件到队列（延迟发送）
   */
  queueEvent(eventName: string, data: TrackEventData): void {
    this.eventQueue.push({ eventName, data })

    // 5秒后批量发送，或队列达到10条时立即发送
    if (this.eventQueue.length >= 10) {
      this.flush()
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), 5000)
    }
  }

  /**
   * 批量发送队列中的事件
   */
  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }

    // 批量发送（可以根据需要改为单独发送）
    for (const { eventName, data } of events) {
      await this.track(eventName, data)
    }
  }
}

// 导出单例
export const tracker = new Tracker()

/**
 * 快捷方法：Step2 埋点
 */
export function trackStep2Event(
  eventName: string,
  sessionId: string,
  stage: number,
  conversationCount: number,
  eventData?: Record<string, EventDataValue>,
): Promise<void> {
  return tracker.trackStep2(eventName, sessionId, stage, conversationCount, eventData)
}

/**
 * 快捷方法：Step3 埋点（预设 step=3, stage=1）
 */
export function trackStep3Event(
  eventName: string,
  sessionId: string,
  stage: number,
  conversationCount: number,
  eventData?: Record<string, EventDataValue>,
): Promise<void> {
  return tracker.track(eventName, {
    sessionId,
    step: 3,
    stage,
    conversationCount,
    event_data: eventData,
  })
}

/**
 * 快捷方法：Step4 埋点（预设 step=4, stage=1）
 */
export function trackStep4Event(
  eventName: string,
  sessionId: string,
  stage: number,
  conversationCount: number,
  eventData?: Record<string, EventDataValue>,
): Promise<void> {
  return tracker.track(eventName, {
    sessionId,
    step: 4,
    stage,
    conversationCount,
    event_data: eventData,
  })
}

/**
 * 快捷方法：Step5 埋点（预设 step=5, stage=1）
 * Step5 是单阶段应急策略分析，stage 固定为 1
 */
export function trackStep5Event(
  eventName: string,
  sessionId: string,
  conversationCount: number,
  eventData?: Record<string, EventDataValue>,
): Promise<void> {
  return tracker.track(eventName, {
    sessionId,
    step: 5,
    stage: 1, // Step5 固定为单阶段
    conversationCount,
    event_data: eventData,
  })
}
