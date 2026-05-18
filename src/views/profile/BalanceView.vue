<script setup>
import api from '@/service/api'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()

const loading = ref(false)
const balance = ref(null)

const fetchBalance = async () => {
    loading.value = true
    try {
        const res = await api.get('/profile/balance')
        balance.value = res.data.data
    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   'Failed to load balance.',
            life:     3000
        })
    } finally {
        loading.value = false
    }
}

const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'PKR 0'
    return 'PKR ' + new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

const usedPercentage = computed(() => {
    if (!balance.value?.credit_limit || balance.value.credit_limit === 0) return 0
    return Math.min(Math.round((balance.value.used_credit / balance.value.credit_limit) * 100), 100)
})

const availablePercentage = computed(() => {
    if (!balance.value?.credit_limit || balance.value.credit_limit === 0) return 0
    return Math.min(Math.round((balance.value.available_balance / balance.value.credit_limit) * 100), 100)
})

import { computed } from 'vue'

onMounted(() => fetchBalance())
</script>

<template>
    <div>
        <Toast />

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-16">
            <ProgressSpinner style="width: 40px; height: 40px" />
        </div>

        <div v-else-if="balance" class="flex flex-col gap-4">

            <!-- ─── Balance Cards ─────────────────── -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

                <!-- Available Balance -->
                <div class="card border-l-4 border-l-green-500">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-surface-500 text-sm font-medium">
                            Available Balance
                        </span>
                        <div class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <i class="pi pi-dollar text-green-500" />
                        </div>
                    </div>
                    <p class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                        {{ formatCurrency(balance.available_balance) }}
                    </p>
                    <div class="mt-3">
                        <div class="flex justify-between text-xs text-surface-400 mb-1">
                            <span>Available</span>
                            <span>{{ availablePercentage }}%</span>
                        </div>
                        <ProgressBar
                            :value="availablePercentage"
                            :showValue="false"
                            style="height: 6px"
                            class="!bg-surface-200"
                        />
                    </div>
                </div>

                <!-- Used Credit -->
                <div class="card border-l-4 border-l-red-500">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-surface-500 text-sm font-medium">
                            Used Credit
                        </span>
                        <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <i class="pi pi-chart-line text-red-500" />
                        </div>
                    </div>
                    <p class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                        {{ formatCurrency(balance.used_credit) }}
                    </p>
                    <div class="mt-3">
                        <div class="flex justify-between text-xs text-surface-400 mb-1">
                            <span>Used</span>
                            <span>{{ usedPercentage }}%</span>
                        </div>
                        <ProgressBar
                            :value="usedPercentage"
                            :showValue="false"
                            style="height: 6px"
                            pt:value:class="!bg-red-500"
                        />
                    </div>
                </div>

                <!-- Credit Limit -->
                <div class="card border-l-4 border-l-primary-500">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-surface-500 text-sm font-medium">
                            Credit Limit
                        </span>
                        <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <i class="pi pi-shield text-primary-500" />
                        </div>
                    </div>
                    <p class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                        {{ formatCurrency(balance.credit_limit) }}
                    </p>
                    <p class="text-surface-400 text-xs mt-3">
                        Total approved credit limit
                    </p>
                </div>

            </div>

            <!-- ─── Quick Actions ─────────────────── -->
            <div class="card">
                <div class="font-semibold text-xl mb-4">Quick Actions</div>
                <div class="flex flex-wrap gap-3">
                    <Button
                        label="View Ledger"
                        icon="pi pi-list"
                        severity="secondary"
                        outlined
                        @click="router.push('/profile/ledger')"
                    />
                    <Button
                        label="Payment Requests"
                        icon="pi pi-send"
                        severity="secondary"
                        outlined
                        @click="router.push('/profile/payment-requests')"
                    />
                    <Button
                        label="Credit Requests"
                        icon="pi pi-plus-circle"
                        severity="secondary"
                        outlined
                        @click="router.push('/profile/credit-requests')"
                    />
                </div>
            </div>

            <!-- ─── Recent Transactions ───────────── -->
            <div class="card">
                <div class="flex items-center justify-between mb-4">
                    <div class="font-semibold text-xl">Recent Transactions</div>
                    <Button
                        label="View All"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        text
                        size="small"
                        @click="router.push('/profile/ledger')"
                    />
                </div>

                <div
                    v-if="!balance.recent_transactions?.length"
                    class="flex flex-col items-center justify-center py-10 gap-2 text-surface-300"
                >
                    <i class="pi pi-list text-3xl" />
                    <p class="text-sm">No transactions yet</p>
                </div>

                <div v-else class="flex flex-col gap-2">
                    <div
                        v-for="tx in balance.recent_transactions"
                        :key="tx.id"
                        class="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                :class="tx.transaction_type === 'credit'
                                    ? 'bg-green-100 dark:bg-green-900/30'
                                    : 'bg-red-100 dark:bg-red-900/30'"
                            >
                                <i
                                    class="pi text-sm"
                                    :class="tx.transaction_type === 'credit'
                                        ? 'pi-arrow-down text-green-500'
                                        : 'pi-arrow-up text-red-500'"
                                />
                            </div>
                            <div>
                                <p class="text-sm font-medium text-surface-900 dark:text-surface-0">
                                    {{ tx.category?.replace(/_/g, ' ') }}
                                </p>
                                <p class="text-xs text-surface-400">
                                    {{ new Date(tx.created_at).toLocaleDateString('en-PK', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    }) }}
                                </p>
                            </div>
                        </div>
                        <span
                            class="font-semibold text-sm"
                            :class="tx.transaction_type === 'credit'
                                ? 'text-green-500'
                                : 'text-red-500'"
                        >
                            {{ tx.transaction_type === 'credit' ? '+' : '-' }}
                            {{ formatCurrency(tx.amount) }}
                        </span>
                    </div>
                </div>
            </div>

        </div>

        <!-- No credit account -->
        <div v-else class="card">
            <div class="flex flex-col items-center justify-center py-16 gap-3 text-surface-300">
                <i class="pi pi-wallet text-5xl" />
                <p class="font-medium text-lg">No Credit Account</p>
                <p class="text-sm text-center max-w-xs">
                    You don't have a credit account yet.
                    Contact your administrator to set up your credit limit.
                </p>
            </div>
        </div>

    </div>
</template>