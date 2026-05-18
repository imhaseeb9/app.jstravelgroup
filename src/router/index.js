import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // ─── Auth Routes ──────────────────────────
        {
            path: '/login',
            component: () => import('@/layout/AuthLayout.vue'),
            children: [
                { path: '', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },
            ]
        },
        {
            path: '/verify-otp',
            component: () => import('@/layout/AuthLayout.vue'),
            children: [
                { path: '', name: 'verify-otp', component: () => import('@/views/auth/OtpView.vue'), meta: { guest: true } },
            ]
        },
        {
            path: '/setup-password',
            component: () => import('@/layout/AuthLayout.vue'),
            children: [
                { path: '', name: 'setup-password', component: () => import('@/views/auth/SetupPasswordView.vue'), meta: { guest: true } },
            ]
        },

        // ─── Protected Routes ─────────────────────
        {
            path: '/',
            component: () => import('@/layout/AppLayout.vue'),
            meta: { requiresAuth: true },
            children: [

                // ─── Dashboard ────────────────────
                { path: '', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },

                // ─── Users ────────────────────────
                { path: 'users', name: 'users', component: () => import('@/views/users/UsersView.vue'), meta: { permission: 'user.view' } },
                { path: 'users/create', name: 'users.create', component: () => import('@/views/users/CreateUserView.vue'), meta: { permission: 'user.create' } },
                { path: 'users/:id/edit', name: 'users.edit', component: () => import('@/views/users/EditUserView.vue'), meta: { permission: 'user.edit' } },

                // ─── Credits ──────────────────────
                { path: 'credits/:userId', name: 'credits', component: () => import('@/views/credits/CreditsView.vue'), meta: { permission: 'finance.set_credit_limit' } },
                
                // ─── Payment Requests ─────────────
                { path: 'payment-requests', name: 'payment-requests', component: () => import('@/views/payments/PaymentRequestsView.vue'), meta: { permission: 'finance.approve_payment' } },

                // ─── Credit Requests ──────────────
                { path: 'credit-requests', name: 'credit-requests', component: () => import('@/views/credits/CreditRequestsView.vue'), meta: { permission: 'finance.set_credit_limit' } },

                // ─── Flights ──────────────────────
                { path: 'flights/search', name: 'flights.search', component: () => import('@/views/flights/SearchView.vue') },

                // ─── Bookings ─────────────────────
                { path: 'bookings/flights', name: 'bookings.flights', component: () => import('@/views/bookings/FlightBookingsView.vue') },
                { path: 'bookings/hotels', name: 'bookings.hotels', component: () => import('@/views/bookings/HotelBookingsView.vue') },
                { path: 'bookings/umrah', name: 'bookings.umrah', component: () => import('@/views/bookings/UmrahBookingsView.vue') },
                { path: 'bookings/visas', name: 'bookings.visas', component: () => import('@/views/bookings/VisaApplicationsView.vue') },

                // ─── Group Tickets ────────────────
                { path: 'group-tickets', name: 'group-tickets', component: () => import('@/views/group-tickets/GroupTicketsView.vue') },

                // ─── CRM ──────────────────────────
                { path: 'crm/hotels', name: 'crm.hotels', component: () => import('@/views/crm/HotelsView.vue') },
                { path: 'crm/umrah', name: 'crm.umrah', component: () => import('@/views/crm/UmrahView.vue') },
                { path: 'crm/hajj', name: 'crm.hajj', component: () => import('@/views/crm/HajjView.vue') },
                { path: 'crm/visas', name: 'crm.visas', component: () => import('@/views/crm/VisasView.vue') },
                { path: 'crm/group-tickets', name: 'crm.group-tickets', component: () => import('@/views/crm/GroupTicketsView.vue') },

                // ─── Finance ──────────────────────
                { path: 'finance/credits', name: 'finance.credits', component: () => import('@/views/finance/CreditsView.vue'), meta: { permission: 'finance.set_credit_limit' } },
                { path: 'finance/invoices', name: 'finance.invoices', component: () => import('@/views/finance/InvoicesView.vue') },
                
                // ─── Ticketing ────────────────────
                { path: 'ticketing/issue', name: 'ticketing.issue', component: () => import('@/views/ticketing/IssueTicketView.vue') },
                { path: 'ticketing/void', name: 'ticketing.void', component: () => import('@/views/ticketing/VoidRequestsView.vue') },
                { path: 'ticketing/refund', name: 'ticketing.refund', component: () => import('@/views/ticketing/RefundRequestsView.vue') },
                { path: 'ticketing/reissue', name: 'ticketing.reissue', component: () => import('@/views/ticketing/ReissueRequestsView.vue') },

                // ─── Pricing ──────────────────────
                { path: 'pricing', name: 'pricing', component: () => import('@/views/pricing/PricingView.vue') },

                // ─── Reports ──────────────────────
                { path: 'reports/sales', name: 'reports.sales', component: () => import('@/views/reports/SalesReportView.vue') },
                { path: 'reports/bookings', name: 'reports.bookings', component: () => import('@/views/reports/BookingReportView.vue') },
                { path: 'reports/financial', name: 'reports.financial', component: () => import('@/views/reports/FinancialReportView.vue') },
                { path: 'reports/agents', name: 'reports.agents', component: () => import('@/views/reports/AgentReportView.vue') },

                // ─── Settings ─────────────────────
                { path: 'settings', name: 'settings', component: () => import('@/views/settings/SettingsView.vue') },
                { path: 'settings/gds', name: 'settings.gds', component: () => import('@/views/settings/GdsSettingsView.vue') },
                { path: 'settings/airlines', name: 'settings.airlines', component: () => import('@/views/settings/AirlineSettingsView.vue') },
                { path: 'settings/email', name: 'settings.email', component: () => import('@/views/settings/EmailSettingsView.vue') },
                { path: 'settings/payment', name: 'settings.payment', component: () => import('@/views/settings/PaymentSettingsView.vue') },

                // ─── Inquiries ────────────────────
                { path: 'inquiries', name: 'inquiries', component: () => import('@/views/inquiries/InquiriesView.vue') },
                { path: 'inquiries/create', name: 'inquiries.create', component: () => import('@/views/inquiries/CreateInquiryView.vue') },

                // ─── Profile ──────────────────────
                { path: 'profile', name: 'profile', component: () => import('@/views/ProfileView.vue') },
                { path: 'profile/balance', name: 'profile.balance', component: () => import('@/views/profile/BalanceView.vue') },
                { path: 'profile/ledger', name: 'profile.ledger', component: () => import('@/views/profile/LedgerView.vue') },
                { path: 'profile/payment-requests', name: 'profile.payment-requests', component: () => import('@/views/profile/PaymentRequestsView.vue') },
                { path: 'profile/credit-requests', name: 'profile.credit-requests', component: () => import('@/views/profile/CreditRequestsView.vue') },
                { path: 'profile/sessions', name: 'profile.sessions', component: () => import('@/views/profile/SessionsView.vue') },
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