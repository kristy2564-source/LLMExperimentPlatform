// api/teacher/login.js
// 教师登录验证API

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { teacherId, password } = req.body

    console.log('🔐 教师登录请求:', { teacherId })

    // 简单的教师验证（你可以后续改为数据库验证）
    // 这里使用环境变量或硬编码的教师账号
    const validTeachers = {
      teacher001: 'teacher123',
      admin: 'admin123',
      // 可以添加更多教师账号
    }

    if (validTeachers[teacherId] === password) {
      // 登录成功，生成简单的token（实际项目中应使用JWT）
      const token = Buffer.from(`${teacherId}:${Date.now()}`).toString('base64')

      console.log('✅ 教师登录成功:', teacherId)

      res.status(200).json({
        success: true,
        message: '登录成功',
        data: {
          teacherId,
          teacherName: teacherId === 'admin' ? '管理员' : '教师',
          token,
          role: 'teacher',
        },
      })
    } else {
      console.log('❌ 教师登录失败: 账号或密码错误')
      res.status(401).json({
        success: false,
        message: '教师ID或密码错误',
      })
    }
  } catch (error) {
    console.error('❌ 教师登录错误:', error)
    res.status(500).json({
      success: false,
      error: '登录失败',
      details: error.message,
    })
  }
}
