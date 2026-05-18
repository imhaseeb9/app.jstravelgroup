<script setup>
import api from '@/service/api'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'

const toast = useToast()

const loading = ref(false)
const ledger = ref([])
const balance = ref(null)
const totalRecords = ref(0)
const currentPage = ref(1)
const perPage = ref(20)

// ─── Filters ──────────────────────────────────────
const filterType = ref(null)
const filterDateFrom = ref(null)
const filterDateTo = ref(null)

const typeOptions = [
    { label: 'All Transactions', value: null },
    { label: 'Credits',          value: 'credit' },
    { label: 'Debits',           value: 'debit' },
]

// ─── Fetch ────────────────────────────────────────
const fetchLedger = async () => {
    loading.value = true
    try {
        const params = { page: currentPage.value, per_page: perPage.value }

        if (filterType.value)     params.transaction_type = filterType.value
        if (filterDateFrom.value) params.date_from = filterDateFrom.value.toISOString().split('T')[0]
        if (filterDateTo.value)   params.date_to   = filterDateTo.value.toISOString().split('T')[0]

        const res = await api.get('/profile/ledger', { params })
        ledger.value      = res.data.data.ledger.data || []
        totalRecords.value = res.data.data.ledger.total || 0
        balance.value     = res.data.data.balance
    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   'Failed to load ledger.',
            life:     3000
        })
    } finally {
        loading.value = false
    }
}

const onPage = (event) => {
    currentPage.value = event.page + 1
    perPage.value = event.rows
    fetchLedger()
}

const onFilterChange = () => {
    currentPage.value = 1
    fetchLedger()
}

const clearFilters = () => {
    filterType.value     = null
    filterDateFrom.value = null
    filterDateTo.value   = null
    currentPage.value    = 1
    fetchLedger()
}

// ─── Helpers ──────────────────────────────────────
const formatCurrency = (amount) =>
    'PKR ' + new Intl.NumberFormat('en-PK').format(amount || 0)

const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-PK', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

const getCategoryLabel = (category) => ({
    'credit_limit_assigned':  'Credit Limit Assigned',
    'credit_limit_increased': 'Credit Limit Increased',
    'credit_limit_decreased': 'Credit Limit Decreased',
    'payment_received_credit':'Payment Received',
    'credit_advance':         'Credit Advance',
    'booking_debit':          'Flight Booking',
    'ticket_debit':           'Ticket Issued',
    'refund_credit':          'Refund Received',
    'void_credit':            'Void Refund',
    'adjustment_credit':      'Manual Adjustment',
    'adjustment_debit':       'Manual Deduction',
}[category] || category?.replace(/_/g, ' '))

const getCategoryIcon = (category) => {
    if (category?.includes('limit'))    return 'pi-shield'
    if (category?.includes('payment'))  return 'pi-credit-card'
    if (category?.includes('booking'))  return 'pi-ticket'
    if (category?.includes('refund'))   return 'pi-replay'
    if (category?.includes('void'))     return 'pi-times-circle'
    if (category?.includes('advance'))  return 'pi-plus-circle'
    return 'pi-circle'
}

onMounted(() => fetchLedger())
</script>

<template>
    <div>
        <Toast />

        <div class="flex flex-col gap-4">

            <!-- ─── Balance Summary ───────────────── -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4" v-if="balance">

                <div class="card border-l-4 border-l-green-500">
                    <p class="text-surface-500 text-sm font-medium mb-2">Available Balance</p>
                    <p class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                        {{ formatCurrency(balance.available_balance) }}
                    </p>
                </div>

                <div class="card border-l-4 border-l-red-500">
                    <p class="text-surface-500 text-sm font-medium mb-2">Used Credit</p>
                    <p class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                        {{ formatCurrency(balance.used_credit) }}
                    </p>
                </div>

                <div class="card border-l-4 border-l-primary-500">
                    <p class="text-surface-500 text-sm font-medium mb-2">Credit Limit</p>
                    <p class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                        {{ formatCurrency(balance.credit_limit) }}
                    </p>
                </div>

            </div>

            <!-- ─── Ledger Table ──────────────────── -->
            <div class="card">
                <DataTable
                    :value="ledger"
                    :loading="loading"
                    lazy
                    :totalRecords="totalRecords"
                    :rows="perPage"
                    :rowHover="true"
                    paginator
                    @page="onPage"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="{first} to {last} of {totalRecords} transactions"
                    :rowsPerPageOptions="[10, 20, 50]"
                    showGridlines
                    dataKey="id"
                >
                    <!-- Header -->
                    <template #header>
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <div class="font-semibold text-xl">Transaction Ledger</div>
                            <div class="flex flex-wrap gap-2 items-center">

                                <!-- Type filter -->
                                <Select
                                    v-model="filterType"
                                    :options="typeOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="All Transactions"
                                    style="min-width: 160px"
                                    @change="onFilterChange"
                                />

                                <!-- Date from -->
                                <DatePicker
                                    v-model="filterDateFrom"
                                    placeholder="From date"
                                    dateFormat="dd M yy"
                                    style="min-width: 140px"
                                    @date-select="onFilterChange"
                                />

                                <!-- Date to -->
                                <DatePicker
                                    v-model="filterDateTo"
                                    placeholder="To date"
                                    dateFormat="dd M yy"
                                    style="min-width: 140px"
                                    @date-select="onFilterChange"
                                />

                                <!-- Clear -->
                                <Button
                                    icon="pi pi-filter-slash"
                                    label="Clear"
                                    severity="secondary"
                                    outlined
                                    @click="clearFilters"
                                />

                            </div>
                        </div>
                    </template>

                    <!-- Empty -->
                    <template #empty>
                        <div class="flex flex-col items-center justify-center py-16 gap-3">
                            <i class="pi pi-list text-5xl text-surface-300" />
                            <p class="text-surface-500 font-medium text-lg">
                                No transactions found
                            </p>
                        </div>
                    </template>

                    <!-- Loading -->
                    <template #loading>
                        <div class="flex items-center justify-center py-16">
                            <ProgressSpinner style="width: 40px; height: 40px" />
                        </div>
                    </template>

                    <!-- ─── Columns ────────────────── -->

                    <!-- Type + Category -->
                    <Column header="Transaction" style="min-width: 220px">
                        <template #body="{ data }">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                    :class="data.transaction_type === 'credit'
                                        ? 'bg-green-100 dark:bg-green-900/30'
                                        : 'bg-red-100 dark:bg-red-900/30'"
                                >
                                    <i
                                        class="pi text-sm"
                                        :class="[
                                            getCategoryIcon(data.category),
                                            data.transaction_type === 'credit'
                                                ? 'text-green-500'
                                                : 'text-red-500'
                                        ]"
                                    />
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-surface-900 dark:text-surface-0">
                                        {{ getCategoryLabel(data.category) }}
                                    </p>
                                    <p class="text-xs text-surface-400 mt-0.5 capitalize">
                                        {{ data.transaction_type }}
                                    </p>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <!-- Amount -->
                    <Column header="Amount" style="min-width: 130px">
                        <template #body="{ data }">
                            <span
                                class="font-semibold text-sm"
                                :class="data.transaction_type === 'credit'
                                    ? 'text-green-500'
                                    : 'text-red-500'"
                            >
                                {{ data.transaction_type === 'credit' ? '+' : '-' }}
                                {{ formatCurrency(data.amount) }}
                            </span>
                        </template>
                    </Column>

                    <!-- Balance Before -->
                    <Column header="Balance Before" style="min-width: 140px">
                        <template #body="{ data }">
                            <span class="text-sm text-surface-500">
                                {{ formatCurrency(data.balance_before) }}
                            </span>
                        </template>
                    </Column>

                    <!-- Balance After -->
                    <Column header="Balance After" style="min-width: 140px">
                        <template #body="{ data }">
                            <span class="text-sm font-medium text-surface-900 dark:text-surface-0">
                                {{ formatCurrency(data.balance_after) }}
                            </span>
                        </template>
                    </Column>

                    <!-- Credit Limit -->
                    <Column header="Credit Limit" style="min-width: 130px">
                        <template #body="{ data }">
                            <span class="text-sm text-surface-500">
                                {{ formatCurrency(data.credit_limit) }}
                            </span>
                        </template>
                    </Column>

                    <!-- Description -->
                    <Column header="Description" style="min-width: 200px">
                        <template #body="{ data }">
                            <span class="text-sm text-surface-500">
                                {{ data.description || '—' }}
                            </span>
                        </template>
                    </Column>

                    <!-- Done By -->
                    <Column header="Done By" style="min-width: 130px">
                        <template #body="{ data }">
                            <span class="text-sm text-surface-500">
                                {{ data.created_by?.name || 'System' }}
                            </span>
                        </template>
                    </Column>

                    <!-- Date -->
                    <Column header="Date" style="min-width: 160px">
                        <template #body="{ data }">
                            <span class="text-sm text-surface-500">
                                {{ formatDate(data.created_at) }}
                            </span>
                        </template>
                    </Column>

                </DataTable>
            </div>

        </div>
    </div>
</template>