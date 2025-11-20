// test-mongo.js
import { MongoClient } from 'mongodb'
import 'dotenv/config'

// 使用环境变量中的连接字符串，如果没有则使用默认值
const uri =
  'mongodb://llm_learning:JewLGGDWbZ8xTMSy@47.100.234.207:27017/llm_learning?authSource=llm_learning'
// console.log('使用的 MongoDB URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')) // 隐藏密码用于日志

const client = new MongoClient(uri, {
  // 添加一些有用的选项
  serverSelectionTimeoutMS: 5000, // 5秒超时
  socketTimeoutMS: 45000, // 45秒socket超时
})

async function testConnection() {
  try {
    console.log('正在连接 MongoDB...')

    // 连接到 MongoDB
    await client.connect()
    console.log('✅ 成功连接到 MongoDB')

    // 测试数据库连接
    await client.db('admin').command({ ping: 1 })
    console.log('✅ 数据库响应正常')

    // 获取数据库和集合
    const db = client.db('llm_learning')
    const collection = db.collection('test_collection')

    // 插入测试数据
    const testDocument = {
      test: 'hello mongo',
      time: new Date(),
      platform: 'education-experiment',
      version: '1.0.0',
    }

    console.log('正在插入测试数据...')
    const insertResult = await collection.insertOne(testDocument)
    console.log('✅ 插入成功! ID:', insertResult.insertedId)

    // 查询刚插入的数据
    console.log('正在查询数据...')
    const foundDoc = await collection.findOne({ _id: insertResult.insertedId })
    console.log('✅ 查询成功:', foundDoc)

    // 测试更新操作
    const updateResult = await collection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { updated: new Date(), status: 'tested' } },
    )
    console.log('✅ 更新成功，影响行数:', updateResult.modifiedCount)

    // 测试计数
    const count = await collection.countDocuments()
    console.log('✅ 集合中总共有', count, '个文档')

    // 清理测试数据（可选）
    const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId })
    console.log('✅ 清理测试数据，删除行数:', deleteResult.deletedCount)

    console.log('🎉 所有数据库操作测试完成!')
  } catch (err) {
    console.error('❌ 数据库操作失败:')

    if (err.name === 'MongoNetworkError') {
      console.error('网络连接错误，请检查:')
      console.error('- 网络连接是否正常')
      console.error('- MongoDB Atlas 白名单设置')
      console.error('- VPN 或防火墙设置')
    } else if (err.name === 'MongoServerSelectionError') {
      console.error('服务器选择错误，可能原因:')
      console.error('- 连接字符串不正确')
      console.error('- 用户名或密码错误')
      console.error('- 数据库服务不可用')
    } else {
      console.error('错误详情:', err.message)
    }

    process.exit(1)
  } finally {
    try {
      await client.close()
      console.log('✅ 数据库连接已关闭')
    } catch (closeErr) {
      console.error('关闭连接时出错:', closeErr.message)
    }
  }
}

// 运行测试
testConnection()
