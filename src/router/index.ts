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
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'my',
          children: [
            {
              path: 'dashboard',
              name: 'my-dashboard',
              component: () => import('@/views/my/MyDashboardView.vue'),
              meta: { permissions: ['activity.view'] },
            },
            {
              path: 'activities/:id/overview',
              name: 'my-activity-overview',
              component: () => import('@/views/my/MyActivityOverview.vue'),
              meta: { permissions: ['activity.view'] },
            },
          ]
        },
        {
          path: 'admin',
          children: [
            {
              path: 'dashboard',
              name: 'admin-dashboard',
              component: () => import('@/views/admin/AdminDashboardView.vue'),
              meta: { permissions: ['back-office.administration.dashboard'] },
            },
            {
              path: 'activities',
              name: 'admin-activities',
              component: () => import('@/views/admin/activities/ActivitiesView.vue'),
              meta: { permissions: ['back-office.administration.activities'] },
            },
            {
              path: 'activities/create',
              name: 'admin-activities-create',
              component: () => import('@/views/admin/activities/ActivityCreateView.vue'),
              meta: { permissions: ['activity.create'] },
            },
            {
              path: 'activities/:id/edit',
              name: 'admin-activities-edit',
              component: () => import('@/views/admin/activities/ActivityEditView.vue'),
              meta: { permissions: ['activity.view', 'activity.update'] },
            },
            {
              path: 'categories',
              name: 'admin-categories',
              component: () => import('@/views/admin/categories/CategoriesView.vue'),
              meta: { permissions: ['back-office.administration.categories'] },
            },
            {
              path: 'categories/create',
              name: 'admin-categories-create',
              component: () => import('@/views/admin/categories/CategoryCreateView.vue'),
              meta: { permissions: ['activity-category.create'] },
            },
            {
              path: 'categories/:id/edit',
              name: 'admin-categories-edit',
              component: () => import('@/views/admin/categories/CategoryEditView.vue'),
              meta: { permissions: ['activity-category.update'] },
            },
            {
              path: 'users',
              name: 'admin-users',
              component: () => import('@/views/admin/users/UsersView.vue'),
              meta: { permissions: ['back-office.administration.users'] },
            },
            {
              path: 'users/create',
              name: 'admin-users-create',
              component: () => import('@/views/admin/users/UserCreateView.vue'),
              meta: { permissions: ['user.create'] },
            },
            {
              path: 'users/:id/edit',
              name: 'admin-users-edit',
              component: () => import('@/views/admin/users/UserEditView.vue'),
              meta: { permissions: ['user.update'] },
            },
            {
              path: 'roles',
              name: 'admin-roles',
              component: () => import('@/views/admin/roles/RolesView.vue'),
              meta: { permissions: ['back-office.administration.roles'] },
            },
            {
              path: 'roles/create',
              name: 'admin-roles-create',
              component: () => import('@/views/admin/roles/RoleEditView.vue'),
              meta: { permissions: ['role.create'] },
            },
            {
              path: 'roles/:id/edit',
              name: 'admin-roles-edit',
              component: () => import('@/views/admin/roles/RoleEditView.vue'),
              meta: { permissions: ['role.update'] },
            },
          ]
        }
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
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
