// 主服务器入口文件
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// 加载环境变量
dotenv.config({
 path: path.resolve(process.cwd(), '.env.local'),
})

// 创建 Express 应用
const app = express()

// 中间件配置
app.use(cors())
app.use(express.json())

// 确保 process.env.MONGODB_URI 已设置
if (!process.env.MONGODB_URI) {
 // 从 .env.local 文件读取 MongoDB URI
 const envFilePath = path.resolve(process.cwd(), '.env.local')
 if (fs.existsSync(envFilePath)) {
  const envContent = fs.readFileSync(envFilePath, 'utf8')
  const match = envContent.trim().match(/mongodb:\/\/.*/)
  if (match) {
   process.env.MONGODB_URI = match[0]
   console.log('✅ 从 .env.local 文件加载了 MongoDB URI')
  } else {
   console.error('❌ 无法从 .env.local 文件中找到有效的 MongoDB URI')
   process.exit(1)
  }
 } else {
  console.error('❌ .env.local 文件不存在')
  process.exit(1)
 }
}

// 动态加载 API 路由
const apiDir = path.resolve(process.cwd(), 'api')

// 递归遍历 API 目录并注册路由
function registerRoutes(dir, basePath = '/api') {
 if (!fs.existsSync(dir)) return

 const items = fs.readdirSync(dir)

 items.forEach((item) => {
  const fullPath = path.join(dir, item)
  console.log('fullPath:', fullPath)
  const stat = fs.statSync(fullPath)
  if (stat.isDirectory()) {
   // 递归处理子目录
   const routePath = path.join(basePath, item)
   registerRoutes(fullPath, routePath)
  } else if (item.endsWith('.js')) {
   // 注册 JavaScript 文件作为路由
   const routeName = item.replace('.js', '')
   const routePath = path.join(basePath, routeName).replace(/\\/g, '/')
   console.log('routePath:', routePath)

   // 为每个 API 端点创建路由处理
   app.all(routePath, async (req, res) => {
    try {
     console.log(`🔄 处理请求: ${routePath}`)

     // 动态导入 API 模块
     // 动态导入 API 模块
     // 在Windows系统上，需要将路径转换为有效的file://URL格式
     let importPath = fullPath;
     if (process.platform === 'win32') {
      // 将Windows路径转换为file://URL格式
      // 1. 转换反斜杠为正斜杠
      // 2. 确保磁盘驱动器后面跟着冒号和斜杠
      // 3. 添加file://协议前缀
      importPath = `file:///${importPath.replace(/\\/g, '/')}`;
     } else {
      // 在Linux/Unix系统上，直接添加file://协议前缀
      importPath = `file://${importPath}`;
     }
     const apiModule = await import(importPath);
     console.log('✅ 成功加载 API 模块:', importPath)

     // 检查模块是否有默认导出函数或处理程序
     if (typeof apiModule.default === 'function') {
      // 模拟 Vercel 的请求处理方式
      // 创建一个响应对象，模拟 Vercel 的 Response API
      const response = {
       status: (code) => {
        res.status(code)
        return response
       },
       json: (data) => {
        return res.json(data)
       },
       send: (data) => {
        return res.send(data)
       },
       // 添加 setHeader 方法以支持 CORS 头设置
       setHeader: (key, value) => {
        res.setHeader(key, value)
        return response
       },
       // 添加 end 方法
       end: () => {
        res.end()
        return response
       },
       // 添加 redirect 方法
       redirect: (status, url) => {
        if (typeof status === 'string') {
         res.redirect(status)
        } else {
         res.redirect(status, url)
        }
        return response
       },
       // 添加 write 方法
       write: (chunk) => {
        res.write(chunk)
        return response
       },
       // 添加 writeHead 方法
       writeHead: (statusCode, headers) => {
        res.writeHead(statusCode, headers)
        return response
       },
      }

      // 调用 API 函数并传递请求和响应对象
      const result = await apiModule.default(req, response)

      // 如果 API 函数返回了结果，直接发送
      if (result) {
       return res.json(result)
      }
     } else {
      console.error(`❌ API 模块 ${item} 没有默认导出函数`)
      res.status(500).json({ error: 'Internal Server Error' })
     }
    } catch (error) {
     console.error(`❌ 处理 ${routePath} 时出错:`, error)
     res.status(500).json({ error: error.message || 'Internal Server Error' })
    }
   })

   console.log(`✅ 注册路由: ${routePath} -> ${item}`)
  }
 })
}

// 启动路由注册
registerRoutes(apiDir)

// 添加API路由测试端点 - 用于调试
app.get('/api/routes', (req, res) => {
 // 获取所有已注册的路由信息
 const routes = [];
 // 这是一个简化的方法，实际上Express不直接暴露所有路由
 // 我们通过日志来帮助调试路由问题
 res.status(200).json({
  message: 'API路由测试端点',
  apiDir: apiDir,
  note: '查看服务器控制台日志以确认路由注册情况'
 });
});

// 静态文件服务（用于前端构建后的文件）
const distDir = path.resolve(process.cwd(), 'dist')
if (fs.existsSync(distDir)) {
 app.use(express.static(distDir))
 console.log(`✅ 启用静态文件服务: ${distDir}`)

 // 处理前端路由，确保 SPA 应用路由正常工作
 // 使用 app.use 来捕获所有未匹配的路由
 app.use((req, res, next) => {
  try {
   // 检查请求是否是 API 请求，如果是则让它继续处理（可能会返回 404）
   if (req.path.startsWith('/api')) {
    return next()
   }

   // 检查是否是静态资源请求（如 CSS、JS、图片等）
   const staticExtensions = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.json',
    '.txt',
   ]
   const hasStaticExtension = staticExtensions.some((ext) => req.path.endsWith(ext))

   if (hasStaticExtension) {
    // 尝试直接提供静态文件
    const filePath = path.join(distDir, req.path)
    if (fs.existsSync(filePath)) {
     return res.sendFile(filePath)
    } else {
     // 静态文件不存在，可以选择返回 404 或者继续到 SPA 路由处理
     // 这里选择继续，让 SPA 路由处理可能的动态路径
    }
   }

   // 对于非 API 和非静态资源请求，发送 index.html 文件，让前端路由处理
   const indexPath = path.join(distDir, 'index.html')
   if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
   } else {
    console.warn(`❌ index.html 文件不存在于 ${distDir}`)
    res.status(404).send('Not Found')
   }
  } catch (error) {
   console.error(`❌ 处理前端路由时出错:`, error)
   res.status(500).send('Internal Server Error')
  }
 })

 // 全局错误处理中间件
 app.use((err, req, res, next) => {
  console.error('❌ 未捕获的错误:', err)
  res.status(500).json({ error: 'Internal Server Error' })
 })
}

// 启动服务器
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
 console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
 console.log(`📁 API 服务目录: ${apiDir}`)
})

