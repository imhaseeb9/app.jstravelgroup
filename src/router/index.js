import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // Auth routes with AuthLayout
        {
            path: '/auth',
            component: () => import('@/layout/AuthLayout.vue'),
            children: [
                {
                    path: '/login',
                    name: 'login',
                    component: () => import('@/views/auth/LoginView.vue'),
                    meta: { guest: true }
                },
                {
                    path: '/verify-otp',
                    name: 'verify-otp',
                    component: () => import('@/views/auth/OtpView.vue'),
                    meta: { guest: true }
                },
                {
                    path: '/setup-password',
                    name: 'setup-password',
                    component: () => import('@/views/auth/SetupPasswordView.vue'),
                    meta: { guest: true }
                },
            ]
        },

        // ─── Protected Routes ─────────────────────
        {
            path: '/',
            component: () => import('@/layout/AppLayout.vue'),
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/views/DashboardView.vue')
                },
                // Users
                {
                    path: 'users',
                    name: 'users',
                    component: () => import('@/views/users/UsersView.vue'),
                    meta: { permission: 'user.view' }
                },
                {
                    path: 'users/create',
                    name: 'users.create',
                    component: () => import('@/views/users/CreateUserView.vue'),
                    meta: { permission: 'user.create' }
                },
                {
                    path: 'users/:id/edit',
                    name: 'users.edit',
                    component: () => import('@/views/users/EditUserView.vue'),
                    meta: { permission: 'user.edit' }
                },
                // Credits
                {
                    path: 'credits/:userId',
                    name: 'credits',
                    component: () => import('@/views/credits/CreditsView.vue'),
                    meta: { permission: 'finance.set_credit_limit' }
                },
                // Payment Requests
                {
                    path: 'payment-requests',
                    name: 'payment-requests',
                    component: () => import('@/views/payments/PaymentRequestsView.vue'),
                    meta: { permission: 'finance.approve_payment' }
                },
                // Credit Requests
                {
                    path: 'credit-requests',
                    name: 'credit-requests',
                    component: () => import('@/views/credits/CreditRequestsView.vue'),
                    meta: { permission: 'finance.set_credit_limit' }
                },
                // Profile
                {
                    path: 'profile',
                    name: 'profile',
                    component: () => import('@/views/ProfileView.vue')
                },
            ]
        },

        // ─── Catch All ────────────────────────────
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        }
    ]
})

// ─── Navigation Guards ────────────────────────────
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
    } else if (to.meta.guest && authStore.isAuthenticated) {
        next('/')
    } else if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
        next('/')
    } else {
        next()
    }
})

export default router