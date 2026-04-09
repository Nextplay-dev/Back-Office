import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/404',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      redirect: '/admin/dashboard',
    },
    {
      path: '/admin',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
        },
        {
          path: 'activities',
          name: 'activities',
          component: () => import('@/views/admin/activities/ActivitiesView.vue'),
          meta: { permissions: ['activity.view'] },
        },
        {
          path: 'activities/create',
          name: 'activities-create',
          component: () => import('@/views/admin/activities/ActivityCreateView.vue'),
          meta: { permissions: ['activity.create'] },
        },
        {
          path: 'activities/:id/edit',
          name: 'activities-edit',
          component: () => import('@/views/admin/activities/ActivityEditView.vue'),
          meta: { permissions: ['activity.update'] },
        },
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/views/admin/categories/CategoriesView.vue'),
          meta: { permissions: ['activity-category.update'] },
        },
        {
          path: 'categories/create',
          name: 'categories-create',
          component: () => import('@/views/admin/categories/CategoryCreateView.vue'),
          meta: { permissions: ['activity-category.create'] },
        },
        {
          path: 'categories/:id/edit',
          name: 'categories-edit',
          component: () => import('@/views/admin/categories/CategoryEditView.vue'),
          meta: { permissions: ['activity-category.update'] },
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/admin/users/UsersView.vue'),
          meta: { permissions: ['user.view'] },
        },
        {
          path: 'users/create',
          name: 'users-create',
          component: () => import('@/views/admin/users/UserCreateView.vue'),
          meta: { permissions: ['user.create'] },
        },
        {
          path: 'users/:id/edit',
          name: 'users-edit',
          component: () => import('@/views/admin/users/UserEditView.vue'),
          meta: { permissions: ['user.update'] },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'not-found' },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (to.meta.public) return true

  if (!authStore.isAuthenticated) {
    return { name: 'login' }
  }

  // Ensure user data is loaded (including permissions)
  if (!authStore.user) {
    try {
      await authStore.fetchMe()
      if (!authStore.canAccess(['back-office.access']))
        throw new Error('User is not authorized to access the back-office');
    } catch {
      authStore.clearAuth()
      return { name: 'login' }
    }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  // Check permissions
  if (to.meta.permissions) {
    const permissions = to.meta.permissions as string[]
    if (!authStore.canAccess(permissions)) {
      return { name: 'not-found' }
    }
  }
})

export default router
