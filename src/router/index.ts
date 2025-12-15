// src/router/index.ts - 更新版本，包含教师端路由
import { createRouter, createWebHistory } from 'vue-router'

// 学生端组件导入
const UserLogin = () => import('@/views/UserLogin.vue')
const HomeView = () => import('@/views/HomeView.vue')
const ExperimentPlatform = () => import('@/views/ExperimentPlatform.vue')
const StepOne = () => import('@/views/StepOne.vue')
const StepTwo = () => import('@/views/StepTwo.vue')
const StepThree = () => import('@/views/StepThree.vue')
const StepFour = () => import('@/views/StepFour.vue')
const StepFive = () => import('@/views/StepFive.vue')
const StepSix = () => import('@/views/StepSix.vue')
const StepSeven = () => import('@/views/StepSeven.vue')

// 教师端组件导入
const TeacherLogin = () => import('@/views/TeacherLogin.vue')
const TeacherLayout = () => import('@/views/TeacherLayout.vue')
const TeacherDashboard = () => import('@/views/TeacherDashboard.vue')
const StudentDetail = () => import('@/views/StudentDetail.vue')

// 检查学生是否已登录
const isAuthenticated = () => {
  const experimentId = localStorage.getItem('experimentId')
  const loginTime = localStorage.getItem('loginTime')

  if (!experimentId) {
    return false
  }

  if (loginTime) {
    const loginDate = new Date(loginTime)
    const now = new Date()
    const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)

    // 如果登录超过24小时，要求重新登录
    if (hoursDiff > 24) {
      localStorage.removeItem('experimentId')
      localStorage.removeItem('studentName')
      localStorage.removeItem('loginTime')
      return false
    }
  }

  return true
}

// 检查教师是否已登录
const isTeacherAuthenticated = () => {
  const token = localStorage.getItem('teacherToken')
  const loginTime = localStorage.getItem('teacherLoginTime')

  if (!token) {
    return false
  }

  if (loginTime) {
    const loginDate = new Date(loginTime)
    const now = new Date()
    const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)

    // 如果登录超过24小时，要求重新登录
    if (hoursDiff > 24) {
      localStorage.removeItem('teacherToken')
      localStorage.removeItem('teacherId')
      localStorage.removeItem('teacherName')
      localStorage.removeItem('teacherRole')
      localStorage.removeItem('teacherLoginTime')
      return false
    }
  }

  return true
}

// 学生退出登录函数
const logout = () => {
  localStorage.removeItem('experimentId')
  localStorage.removeItem('studentName')
  localStorage.removeItem('loginTime')
}

// 路由配置
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    // ==================== 学生端路由 ====================
    {
      path: '/login',
      name: 'login',
      component: UserLogin,
      meta: {
        requiresAuth: false,
        title: '学生登录 - 智能问题解决工作台',
      },
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true,
        title: '首页 - 智能问题解决工作台',
      },
    },
    {
      path: '/experiment',
      name: 'experiment',
      component: ExperimentPlatform,
      meta: {
        requiresAuth: true,
        title: '实验平台 - 智能问题解决工作台',
      },
      children: [
        {
          path: '',
          redirect: 'step1',
        },
        {
          path: 'step1',
          name: 'step-one',
          component: StepOne,
          meta: {
            requiresAuth: true,
            title: '问题理解 - 实验平台',
            stepNumber: 1,
          },
        },
        {
          path: 'step2',
          name: 'step-two',
          component: StepTwo,
          meta: {
            requiresAuth: true,
            title: '问题识别 - 实验平台',
            stepNumber: 2,
          },
        },
        {
          path: 'step3',
          name: 'step-three',
          component: StepThree,
          meta: {
            requiresAuth: true,
            title: '方案设计 - 实验平台',
            stepNumber: 3,
          },
        },
        {
          path: 'step4',
          name: 'step-four',
          component: StepFour,
          meta: {
            requiresAuth: true,
            title: '提示词设计 - 实验平台',
            stepNumber: 4,
          },
        },
        {
          path: 'step5',
          name: 'step-five',
          component: StepFive,
          meta: {
            requiresAuth: true,
            title: '应急调整 - 实验平台',
            stepNumber: 5,
          },
        },
        {
          path: 'step6',
          name: 'step-six',
          component: StepSix,
          meta: {
            requiresAuth: true,
            title: '方案整合 - 实验平台',
            stepNumber: 6,
          },
        },
        {
          path: 'step7',
          name: 'step-seven',
          component: StepSeven,
          meta: {
            requiresAuth: true,
            title: '自我评估 - 实验平台',
            stepNumber: 7,
          },
        },
      ],
    },

    // ==================== 教师端路由 ====================
    {
      path: '/teacher/login',
      name: 'teacher-login',
      component: TeacherLogin,
      meta: {
        requiresTeacherAuth: false,
        title: '教师登录 - 教师管理端',
      },
    },
    {
      path: '/teacher',
      component: TeacherLayout,
      meta: {
        requiresTeacherAuth: true,
      },
      children: [
        {
          path: '',
          redirect: '/teacher/dashboard',
        },
        {
          path: 'dashboard',
          name: 'teacher-dashboard',
          component: TeacherDashboard,
          meta: {
            requiresTeacherAuth: true,
            title: '学生数据总览 - 教师管理端',
          },
        },
        {
          path: 'student/:sessionId',
          name: 'student-detail',
          component: StudentDetail,
          meta: {
            requiresTeacherAuth: true,
            title: '学生详细数据 - 教师管理端',
          },
        },
        {
          path: 'analytics',
          name: 'teacher-analytics',
          component: () => import('@/views/TeacherAnalytics.vue'),
          meta: {
            requiresTeacherAuth: true,
            title: '数据分析 - 教师管理端',
          },
        },
        {
          path: 'export',
          name: 'teacher-export',
          component: () => import('@/views/TeacherExport.vue'),
          meta: {
            requiresTeacherAuth: true,
            title: '数据导出 - 教师管理端',
          },
        },
      ],
    },

    // ==================== 404页面 ====================
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
      meta: {
        title: '页面未找到',
      },
    },
  ],
})

// 全局前置路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = (to.meta as { title?: string }).title || '智能问题解决工作台'

  console.log('📍 当前访问路径:', to.path)

  // 教师端路由验证
  if (to.meta.requiresTeacherAuth) {
    if (isTeacherAuthenticated()) {
      console.log('✅ 教师已登录，允许访问')
      next()
    } else {
      console.log('❌ 教师未登录，重定向到教师登录页')
      next({
        path: '/teacher/login',
        query: { redirect: to.fullPath },
      })
    }
    return
  }

  // 学生端路由验证
  if (to.meta.requiresAuth) {
    if (isAuthenticated()) {
      console.log('✅ 学生已登录，允许访问')
      next()
    } else {
      console.log('❌ 学生未登录，重定向到学生登录页')
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
    }
    return
  }

  // 不需要认证的页面
  if (to.path === '/login' && isAuthenticated()) {
    console.log('✅ 已登录学生访问登录页，重定向到首页')
    next('/home')
  } else if (to.path === '/teacher/login' && isTeacherAuthenticated()) {
    console.log('✅ 已登录教师访问登录页，重定向到Dashboard')
    next('/teacher/dashboard')
  } else {
    console.log('✅ 访问不需要认证的页面')
    next()
  }
})

// 全局后置路由守卫
router.afterEach((to, from) => {
  // 记录学生页面访问日志
  const experimentId = localStorage.getItem('experimentId')
  if (experimentId && to.meta.stepNumber) {
    console.log(`📊 学生 ${experimentId} 访问了步骤 ${to.meta.stepNumber}`)
  }

  // 记录教师页面访问日志
  const teacherId = localStorage.getItem('teacherId')
  if (teacherId && to.path.startsWith('/teacher')) {
    console.log(`👨‍🏫 教师 ${teacherId} 访问了 ${to.path}`)
  }
})

export { logout }
export default router
