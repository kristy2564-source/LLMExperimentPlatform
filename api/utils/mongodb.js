// api/utils/mongodb.js
import { MongoClient } from 'mongodb'

let cachedClient = null
let isConnecting = false
let connectionPromise = null

/**
 * 连接到 MongoDB 数据库的通用工具函数
 * 包含重试机制、连接池和错误处理
 */
export async function connectToDatabase() {
  // 如果已有缓存的客户端连接，直接返回
  if (cachedClient) {
    return cachedClient
  }

  // 如果正在连接中，等待连接完成
  if (isConnecting && connectionPromise) {
    return connectionPromise
  }

  // 设置连接标志
  isConnecting = true

  // 创建连接承诺
  connectionPromise = (async () => {
    try {
      // 添加更健壮的连接选项
      const client = new MongoClient(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000, // 服务器选择超时
        socketTimeoutMS: 120000, // 增加socket超时时间
        connectTimeoutMS: 60000, // 增加连接超时时间
        maxPoolSize: 10, // 连接池大小
        retryWrites: true, // 启用重试写入
        retryReads: true, // 启用重试读取
        w: 'majority', // 写入确认
      })

      console.log('正在连接到 MongoDB...')
      await client.connect()
      console.log('✅ MongoDB 连接成功')

      // 测试连接
      await client.db('admin').command({ ping: 1 })
      console.log('✅ MongoDB 服务器响应正常')

      // 缓存客户端连接
      cachedClient = client
      return client
    } catch (error) {
      console.error('❌ MongoDB 连接错误:', error)

      // 如果是超时错误，尝试再次连接
      if (error.name === 'MongoNetworkTimeoutError') {
        console.log('MongoDB 连接超时，正在重试...')
        // 重置连接状态
        isConnecting = false
        connectionPromise = null
        // 延迟2秒后重试
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return connectToDatabase()
      }

      // 其他错误则抛出
      throw error
    } finally {
      // 重置连接状态
      isConnecting = false
    }
  })()

  return connectionPromise
}

/**
 * 关闭数据库连接
 */
export async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    connectionPromise = null
    isConnecting = false
    console.log('MongoDB 连接已关闭')
  }
}

/**
 * 安全执行数据库操作的包装函数
 * @param {Function} dbOperation - 数据库操作函数
 * @param {Object} fallbackValue - 操作失败时的返回值
 */
export async function safeDbOperation(dbOperation, fallbackValue = null) {
  try {
    const client = await connectToDatabase()
    return await dbOperation(client)
  } catch (error) {
    console.error('❌ MongoDB 操作错误:', error)
    return fallbackValue
  }
}
