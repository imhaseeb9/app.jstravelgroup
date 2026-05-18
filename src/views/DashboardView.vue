<script setup>
import api from '@/service/api'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)

// ─── Stats State ──────────────────────────────────
const stats = ref({
    total_agents:           0,
    pending_payments:       0,
    pending_credits:        0,
    total_users:            0,
})

const recentLogs = ref([])
const logsLoading = ref(false)

// ─── User type checks ─────────────────────────────
/*
const isAgencyLevel = computed(() => authStore.isAgencyLevel)
const isAgentLevel = computed(() => authStore.isAgentLevel)
*/
const isAgencyLevel = computed(() =>
    authStore.user?.type === 'super_admin' ||
    authStore.user?.type === 'staff'
)
const isAgentLevel = computed(() =>
    authStore.user?.type === 'agent' ||
    authStore.user?.type === 'sub_agent'
)

const canViewLogs = computed(() =>
    authStore.hasPermission('user.view_activity')
)

// ─── Balance State (for agents) ───────────────────
const balance = ref(null)
const balanceLoading = ref(false)

// ─── Fetch Stats (agency level) ───────────────────
const fetchStats = async () => {
    loading.value = true
    try {
        // Only fetch agents count if has user.view permission
        if (authStore.hasPermission('user.view') || authStore.hasPermission('user.agent_management')) {
            const usersRes = await api.get('/users', {
                params: { per_page: 1, type: 'agent' }
            })
            stats.value.total_agents = usersRes.data.data.total

            const allUsersRes = await api.get('/users', { params: { per_page: 1 } })
            stats.value.total_users = allUsersRes.data.data.total
        }

        // Already permission checked
        if (authStore.hasPermission('finance.approve_payment')) {
            const paymentsRes = await api.get('/payment-requests', {
                params: { status: 'pending', per_page: 1 }
            })
            stats.value.pending_payments = paymentsRes.data.data.total
        }

        if (authStore.hasPermission('finance.set_credit_limit')) {
            const creditsRes = await api.get('/credit-requests', {
                params: { status: 'pending', per_page: 1 }
            })
            stats.value.pending_credits = creditsRes.data.data.total
        }

    } catch (error) {
        console.error('Failed to fetch stats:', error)
    } finally {
        loading.value = false
    }
}

// ─── Fetch Balance (agent level) ──────────────────
const fetchBalance = async () => {
    balanceLoading.value = true
    try {
        const res = await api.get('/profile/balance')
        balance.value = res.data.data
    } catch (error) {
        console.error('Failed to fetch balance:', error)
    } finally {
        balanceLoading.value = false
    }
}

// ─── Fetch Activity Logs ──────────────────────────
const fetchLogs = async () => {
    // Only fetch if user has view_activity permission
    // OR show own logs (no permission needed for own logs)
    logsLoading.value = true
    try {
        const res = await api.get('/activity-logs', {
            params: { per_page: 8 }
        })
        recentLogs.value = res.data.data.data || []
    } catch (error) {
        // ✅ Silently fail — don't show error if 403
        if (error.response?.status !== 403) {
            console.error('Failed to fetch logs:', error)
        }
        recentLogs.value = []
    } finally {
        logsLoading.value = false
    }
}

// ─── Format helpers ───────────────────────────────
const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-PK', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '—'
    return new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

const getActionSeverity = (action) => {
    if (action?.includes('created') || action?.includes('approved')) return 'success'
    if (action?.includes('failed') || action?.includes('rejected') || action?.includes('deactivated')) return 'danger'
    if (action?.includes('updated') || action?.includes('toggled')) return 'info'
    if (action?.includes('login') || action?.includes('logout')) return 'secondary'
    return 'secondary'
}

const getActionIcon = (action) => {
    if (action?.includes('login')) return 'pi-sign-in'
    if (action?.includes('logout')) return 'pi-sign-out'
    if (action?.includes('created')) return 'pi-plus'
    if (action?.includes('updated')) return 'pi-pencil'
    if (action?.includes('approved')) return 'pi-check'
    if (action?.includes('rejected')) return 'pi-times'
    if (action?.includes('password')) return 'pi-key'
    return 'pi-circle'
}

const userInitials = computed(() => {
    const name = authStore.user?.name || 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
})

onMounted(() => {
    if (isAgencyLevel.value) {
        fetchStats()
    }
    if (isAgentLevel.value) {  // ← removed booking.create check
        fetchBalance()
    }
    fetchLogs()
})
</script>

<template>
    <div class="flex flex-col gap-6">

        <!-- ─── Welcome Banner ───────────────────── -->
        <div class="card bg-gradient-to-r from-surface-900 to-surface-700 dark:from-surface-800 dark:to-surface-900 text-white border-0">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-surface-300 text-sm mb-1">{{ greeting }},</p>
                    <h1 class="text-2xl font-bold text-white">
                        {{ authStore.user?.name }}
                    </h1>
                    <p class="text-surface-400 text-sm mt-1 capitalize">
                        {{ authStore.user?.type?.replace('_', ' ') }}
                        <span v-if="authStore.user?.designation"> — {{ authStore.user?.designation }}</span>
                    </p>
                </div>
                <div class="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center font-bold text-xl text-white">
                    {{ userInitials }}
                </div>
            </div>
        </div>

        <!-- ─── Agency Level Stats ───────────────── -->
        <div v-if="isAgencyLevel">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-if="isAgencyLevel && (authStore.hasPermission('user.view') || authStore.hasPermission('user.agent_management'))">
                    <!-- Total Agents -->
                    <div class="card">
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-surface-500 text-sm font-medium">Total Agents</span>
                            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <i class="pi pi-users text-blue-500" />
                            </div>
                        </div>
                        <div v-if="loading" class="h-8 bg-surface-100 dark:bg-surface-700 rounded animate-pulse" />
                        <div v-else>
                            <p class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                                {{ stats.total_agents }}
                            </p>
                            <p class="text-surface-400 text-xs mt-1">Registered agents</p>
                        </div>
                    </div>
                
                    <!-- Total Users -->
                    <div class="card">
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-surface-500 text-sm font-medium">Total Users</span>
                            <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <i class="pi pi-user text-purple-500" />
                            </div>
                        </div>
                        <div v-if="loading" class="h-8 bg-surface-100 dark:bg-surface-700 rounded animate-pulse" />
                        <div v-else>
                            <p class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                                {{ stats.total_users }}
                            </p>
                            <p class="text-surface-400 text-xs mt-1">All users in system</p>
                        </div>
                    </div>
                </div>                
                <!-- Pending Payments -->
                <div v-if="authStore.hasPermission('finance.approve_payment')">
                    <div
                        class="card cursor-pointer hover:shadow-md transition-shadow"
                        @click="authStore.hasPermission('finance.approve_payment') && router.push('/payment-requests')"
                    >
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-surface-500 text-sm font-medium">Pending Payments</span>
                            <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <i class="pi pi-credit-card text-orange-500" />
                            </div>
                        </div>
                        <div v-if="loading" class="h-8 bg-surface-100 dark:bg-surface-700 rounded animate-pulse" />
                        <div v-else>
                            <p class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                                {{ stats.pending_payments }}
                            </p>
                            <p class="text-surface-400 text-xs mt-1">Awaiting approval</p>
                        </div>
                    </div>
                </div>
                
                <!-- Pending Credits -->
                <div v-if="authStore.hasPermission('finance.set_credit_limit')">
                    <div
                        class="card cursor-pointer hover:shadow-md transition-shadow"
                        @click="authStore.hasPermission('finance.set_credit_limit') && router.push('/credit-requests')"
                    >
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-surface-500 text-sm font-medium">Pending Credits</span>
                            <div class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <i class="pi pi-wallet text-green-500" />
                            </div>
                        </div>
                        <div v-if="loading" class="h-8 bg-surface-100 dark:bg-surface-700 rounded animate-pulse" />
                        <div v-else>
                            <p class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                                {{ stats.pending_credits }}
                            </p>
                            <p class="text-surface-400 text-xs mt-1">Awaiting approval</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ─── Agent Level Stats ────────────────── -->
        <div v-if="isAgentLevel">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

                <!-- Credit Balance -->
                <div class="card">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-surface-500 text-sm font-medium">Available Balance</span>
                        <div class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <i class="pi pi-dollar text-green-500" />
                        </div>
                    </div>
                    <div v-if="balanceLoading" class="h-8 bg-surface-100 dark:bg-surface-700 rounded animate-pulse" />
                    <div v-else-if="balance">
                        <p class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                            PKR {{ formatCurrency(balance.available_balance) }}
                        </p>
                        <p class="text-surface-400 text-xs mt-1">
                            Limit: PKR {{ formatCurrency(balance.credit_limit) }}
                        </p>
                        <div class="mt-3">
                            <div class="flex justify-between text-xs text-surface-400 mb-1">
                                <span>Used</span>
                                <span>{{ balance.credit_limit > 0 ? Math.round((balance.used_credit / balance.credit_limit) * 100) : 0 }}%</span>
                            </div>
                            <ProgressBar
                                :value="balance.credit_limit > 0 ? Math.round((balance.used_credit / balance.credit_limit) * 100) : 0"
                                :showValue="false"
                                style="height: 6px"
                            />
                        </div>
                    </div>
                    <div v-else>
                        <p class="text-surface-400 text-sm">No credit account</p>
                    </div>
                </div>

                <!-- Used Credit -->
                <div class="card">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-surface-500 text-sm font-medium">Used Credit</span>
                        <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <i class="pi pi-chart-line text-red-500" />
                        </div>
                    </div>
                    <div v-if="balanceLoading" class="h-8 bg-surface-100 dark:bg-surface-700 rounded animate-pulse" />
                    <div v-else-if="balance">
                        <p class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                            PKR {{ formatCurrency(balance.used_credit) }}
                        </p>
                        <p class="text-surface-400 text-xs mt-1">Outstanding balance</p>
                    </div>
                    <div v-else>
                        <p class="text-surface-400 text-sm">No credit account</p>
                    </div>
                </div>

                <!-- Credit Limit -->
                <div class="card">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-surface-500 text-sm font-medium">Credit Limit</span>
                        <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <i class="pi pi-shield text-blue-500" />
                        </div>
                    </div>
                    <div v-if="balanceLoading" class="h-8 bg-surface-100 dark:bg-surface-700 rounded animate-pulse" />
                    <div v-else-if="balance">
                        <p class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                            PKR {{ formatCurrency(balance.credit_limit) }}
                        </p>
                        <p class="text-surface-400 text-xs mt-1">Total approved limit</p>
                    </div>
                    <div v-else>
                        <p class="text-surface-400 text-sm">No credit account</p>
                    </div>
                </div>

            </div>
        </div>

        <!-- ─── Coming Soon Cards ─────────────────── -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Bookings Chart -->
            <div class="card">
                <div class="flex items-center justify-between mb-4">
                    <div class="font-semibold text-xl">Bookings Overview</div>
                    <Tag value="Coming Soon" severity="secondary" />
                </div>
                <div class="flex flex-col items-center justify-center h-48 gap-3 text-surface-300">
                    <i class="pi pi-chart-bar text-5xl" />
                    <p class="text-sm">Flight bookings chart will appear here</p>
                </div>
            </div>

            <!-- Revenue Chart -->
            <div class="card">
                <div class="flex items-center justify-between mb-4">
                    <div class="font-semibold text-xl">Revenue Overview</div>
                    <Tag value="Coming Soon" severity="secondary" />
                </div>
                <div class="flex flex-col items-center justify-center h-48 gap-3 text-surface-300">
                    <i class="pi pi-chart-line text-5xl" />
                    <p class="text-sm">Revenue chart will appear here</p>
                </div>
            </div>

        </div>

        <!-- ─── Quick Actions ────────────────────── -->
        <div class="card">
            <div class="font-semibold text-xl mb-4">Quick Actions</div>
            <div class="flex flex-wrap gap-3">

                <Button
                    v-if="authStore.hasPermission('user.create')"
                    label="Create User"
                    icon="pi pi-user-plus"
                    severity="secondary"
                    outlined
                    @click="router.push('/users/create')"
                />

                <Button
                    v-if="authStore.hasPermission('finance.approve_payment')"
                    label="Payment Requests"
                    icon="pi pi-credit-card"
                    severity="secondary"
                    outlined
                    @click="router.push('/payment-requests')"
                />

                <Button
                    v-if="authStore.hasPermission('finance.set_credit_limit')"
                    label="Credit Requests"
                    icon="pi pi-wallet"
                    severity="secondary"
                    outlined
                    @click="router.push('/credit-requests')"
                />

                <Button
                    v-if="authStore.hasPermission('flight.search')"
                    label="Search Flights"
                    icon="pi pi-search"
                    severity="secondary"
                    outlined
                    @click="router.push('/flights/search')"
                />

                <Button
                    v-if="isAgentLevel"
                    label="My Balance"
                    icon="pi pi-dollar"
                    severity="secondary"
                    outlined
                    @click="router.push('/profile/balance')"
                />

                <Button
                    label="My Profile"
                    icon="pi pi-user"
                    severity="secondary"
                    outlined
                    @click="router.push('/profile')"
                />

            </div>
        </div>

        <!-- ─── Activity Logs ────────────────────── -->
        <div class="card">
            <div class="flex items-center justify-between mb-4">
                <div class="font-semibold text-xl">
                    {{ canViewLogs ? 'Recent Activity' : 'My Recent Activity' }}
                </div>
                <Button
                    label="View All"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    text
                    size="small"
                    @click="router.push('/activity-logs')"
                />
            </div>

            <!-- Loading -->
            <div v-if="logsLoading" class="flex items-center justify-center py-8">
                <ProgressSpinner style="width: 30px; height: 30px" />
            </div>

            <!-- Empty -->
            <div
                v-else-if="recentLogs.length === 0"
                class="flex flex-col items-center justify-center py-10 gap-2 text-surface-300"
            >
                <i class="pi pi-list text-3xl" />
                <p class="text-sm">No recent activity</p>
            </div>

            <!-- Logs List -->
            <div v-else class="flex flex-col gap-2">
                <div
                    v-for="log in recentLogs"
                    :key="log.id"
                    class="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                >
                    <!-- Icon -->
                    <div class="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i :class="`pi ${getActionIcon(log.action)} text-sm text-surface-500`" />
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-medium text-sm text-surface-900 dark:text-surface-0">
                                {{ log.user?.name || 'System' }}
                            </span>
                            <Tag
                                :value="log.action?.replace(/_/g, ' ')"
                                :severity="getActionSeverity(log.action)"
                                class="text-xs"
                            />
                        </div>
                        <p class="text-surface-400 text-xs mt-0.5 truncate">
                            {{ log.description }}
                        </p>
                    </div>

                    <!-- Time -->
                    <span class="text-surface-400 text-xs flex-shrink-0">
                        {{ formatDate(log.created_at) }}
                    </span>
                </div>
            </div>
        </div>

    </div>
</template>