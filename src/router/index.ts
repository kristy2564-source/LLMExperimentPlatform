import { createRouter, createWebHistory } from 'vue-router'

// 组件导入
const UserLogin = () => import('@/views/UserLogin.vue')
const HomeView = () => import('@/views/HomeView.vue')
const ExperimentPlatform = () => import('@/views/ExperimentPlatform.vue')
const StepOne = () => import('@/views/StepOne.vue')
const StepTwo = () => import('@/views/StepTwo.vue')
const StepThree = () => import('@/views/StepThree.vue')
const StepFour = () => import('@/views/StepFour.vue')
const StepFive = () => import('@/views/StepFive.vue')
const StepSix = () => import('@/views/StepSix.vue')
const StepSeven = () => import('@/views/StepSeven.vue') // 新增：原来的StepSix变成StepSeven

// 检查用户是否已登录
const isAuthenticated = () => {
  const experimentId = localStorage.getItem('experimentId')
  const loginTime = localStorage.getItem('loginTime')

  // 检查是否有实验编号
  if (!experimentId) {
    return false
  }

  // 检查登录时间（可选：设置会话过期时间）
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

// 退出登录函数
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
      redirect: '/login', // 默认重定向到登录页
    },
    {
      path: '/login',
      name: 'login',
      component: UserLogin,
      meta: {
        requiresAuth: false,
        title: '登录 - 智能问题解决工作台',
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
          redirect: 'step1', // 默认跳转到第一步
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
            title: '提示词设计 - 实验平台', // 新增：提示词设计步骤
            stepNumber: 4,
          },
        },
        {
          path: 'step5',
          name: 'step-five',
          component: StepFive,
          meta: {
            requiresAuth: true,
            title: '应急调整 - 实验平台', // 更新：原来的StepFour标题
            stepNumber: 5,
          },
        },
        {
          path: 'step6',
          name: 'step-six',
          component: StepSix,
          meta: {
            requiresAuth: true,
            title: '方案整合 - 实验平台', // 更新：原来的StepFive标题
            stepNumber: 6,
          },
        },
        {
          path: 'step7',
          name: 'step-seven',
          component: StepSeven,
          meta: {
            requiresAuth: true,
            title: '自我评估 - 实验平台', // 更新：原来的StepSix标题
            stepNumber: 7,
          },
        },
      ],
    },
    {
      // 404页面
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

  // 添加调试信息
  console.log('当前访问路径:', to.path)
  console.log('是否需要认证:', to.meta.requiresAuth)
  console.log('是否已登录:', isAuthenticated())

  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    if (isAuthenticated()) {
      // 已登录，允许访问
      console.log('用户已登录，允许访问')
      next()
    } else {
      // 未登录，重定向到登录页
      console.log('用户未登录，重定向到登录页')
      next({
        path: '/login',
        query: { redirect: to.fullPath }, // 保存用户想要访问的页面
      })
    }
  } else {
    // 不需要认证的页面
    if (to.path === '/login' && isAuthenticated()) {
      // 已登录用户访问登录页，重定向到首页
      console.log('已登录用户访问登录页，重定向到首页')
      next('/home')
    } else {
      console.log('访问不需要认证的页面')
      next()
    }
  }
})

// 全局后置路由守卫
router.afterEach((to, from) => {
  // 记录页面访问日志（可选）
  const experimentId = localStorage.getItem('experimentId')
  if (experimentId && to.meta.stepNumber) {
    console.log(`用户 ${experimentId} 访问了步骤 ${to.meta.stepNumber}`)

    // 可以在这里调用API记录用户的学习路径
    // trackUserProgress(experimentId, to.meta.stepNumber)
  }
})

export { logout }
export default router
