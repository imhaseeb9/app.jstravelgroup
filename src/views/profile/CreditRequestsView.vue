<script setup>
import api from '@/service/api'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'

const toast = useToast()

const loading = ref(false)
const requests = ref([])
const totalRecords = ref(0)
const currentPage = ref(1)
const perPage = ref(10)

// ─── Submit Modal ──────────────────────────────────
const submitModalVisible = ref(false)
const submitLoading = ref(false)
const currentBalance = ref(null)
const form = ref({
    requested_amount: null,
    reason:           '',
})
const errors = ref({})

// ─── Fetch ────────────────────────────────────────
const fetchRequests = async () => {
    loading.value = true
    try {
        const res = await api.get('/profile/credit-requests', {
            params: { page: currentPage.value, per_page: perPage.value }
        })
        requests.value = res.data.data.data || []
        totalRecords.value = res.data.data.total || 0
    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   'Failed to load credit requests.',
            life:     3000
        })
    } finally {
        loading.value = false
    }
}

// Load current balance when modal opens
const openSubmitModal = async () => {
    submitModalVisible.value = true
    try {
        const res = await api.get('/profile/balance')
        currentBalance.value = res.data.data
    } catch {
        currentBalance.value = null
    }
}

const onPage = (event) => {
    currentPage.value = event.page + 1
    perPage.value = event.rows
    fetchRequests()
}

// ─── Submit ───────────────────────────────────────
const validate = () => {
    errors.value = {}
    if (!form.value.requested_amount || form.value.requested_amount <= 0)
        errors.value.requested_amount = 'Please enter a valid amount.'
    if (!form.value.reason?.trim())
        errors.value.reason = 'Please provide a reason for this request.'
    return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
    if (!validate()) return

    submitLoading.value = true
    try {
        await api.post('/profile/credit-requests', {
            requested_amount: form.value.requested_amount,
            reason:           form.value.reason.trim(),
        })

        toast.add({
            severity: 'success',
            summary:  'Request Submitted',
            detail:   'Credit limit request submitted successfully.',
            life:     3000
        })

        submitModalVisible.value = false
        form.value = { requested_amount: null, reason: '' }
        errors.value = {}
        fetchRequests()

    } catch (error) {
        const data = error.response?.data
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   data?.message || 'Failed to submit request.',
            life:     3000
        })
        if (data?.errors) errors.value = data.errors
    } finally {
        submitLoading.value = false
    }
}

// ─── Helpers ──────────────────────────────────────
const getStatusSeverity = (status) => ({
    pending:  'warn',
    approved: 'success',
    rejected: 'danger',
}[status] || 'secondary')

const formatCurrency = (amount) =>
    'PKR ' + new Intl.NumberFormat('en-PK').format(amount || 0)

const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-PK', {
        day: '2-digit', month: 'short', year: 'numeric'
    })
}

onMounted(() => fetchRequests())
</script>

<template>
    <div>
        <Toast />

        <div class="card">
            <DataTable
                :value="requests"
                :loading="loading"
                lazy
                :totalRecords="totalRecords"
                :rows="perPage"
                :rowHover="true"
                paginator
                @page="onPage"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="{first} to {last} of {totalRecords} requests"
                :rowsPerPageOptions="[10, 25, 50]"
                showGridlines
                dataKey="id"
            >
                <!-- Header -->
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="font-semibold text-xl">My Credit Requests</div>
                        <Button
                            label="Request Credit Increase"
                            icon="pi pi-plus"
                            @click="openSubmitModal"
                        />
                    </div>
                </template>

                <!-- Empty -->
                <template #empty>
                    <div class="flex flex-col items-center justify-center py-16 gap-3">
                        <i class="pi pi-wallet text-5xl text-surface-300" />
                        <p class="text-surface-500 font-medium text-lg">No credit requests</p>
                        <Button
                            label="Request Credit Increase"
                            icon="pi pi-plus"
                            size="small"
                            @click="openSubmitModal"
                        />
                    </div>
                </template>

                <!-- Columns -->
                <Column header="Current Limit" style="min-width: 140px">
                    <template #body="{ data }">
                        <span class="text-sm">{{ formatCurrency(data.current_limit) }}</span>
                    </template>
                </Column>

                <Column header="Requested Amount" style="min-width: 150px">
                    <template #body="{ data }">
                        <span class="font-semibold text-surface-900 dark:text-surface-0">
                            {{ formatCurrency(data.requested_amount) }}
                        </span>
                    </template>
                </Column>

                <Column header="Reason" style="min-width: 200px">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-600 dark:text-surface-300">
                            {{ data.reason || '—' }}
                        </span>
                    </template>
                </Column>

                <Column header="Status" style="min-width: 110px">
                    <template #body="{ data }">
                        <Tag
                            :value="data.status"
                            :severity="getStatusSeverity(data.status)"
                            class="capitalize"
                        />
                    </template>
                </Column>

                <Column header="Rejection Reason" style="min-width: 180px">
                    <template #body="{ data }">
                        <span class="text-sm text-red-400" v-if="data.status === 'rejected'">
                            {{ data.rejection_reason || '—' }}
                        </span>
                        <span v-else class="text-surface-300 text-sm">—</span>
                    </template>
                </Column>

                <Column header="Reviewed By" style="min-width: 130px">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-500">
                            {{ data.reviewed_by_name || '—' }}
                        </span>
                    </template>
                </Column>

                <Column header="Submitted" style="min-width: 120px">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-500">
                            {{ formatDate(data.created_at) }}
                        </span>
                    </template>
                </Column>

            </DataTable>
        </div>

        <!-- ─── Submit Modal ──────────────────────── -->
        <Dialog
            v-model:visible="submitModalVisible"
            header="Request Credit Top-up"
            :style="{ width: '480px' }"
            modal
            :draggable="false"
        >
            <div class="flex flex-col gap-4 py-2">

                <!-- Current Balance Info -->
                <div
                    v-if="currentBalance"
                    class="p-4 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700"
                >
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-xs text-surface-400">Current Limit</p>
                            <p class="font-semibold text-sm mt-1">
                                {{ formatCurrency(currentBalance.credit_limit) }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs text-surface-400">Available Balance</p>
                            <p class="font-semibold text-sm mt-1">
                                {{ formatCurrency(currentBalance.available_balance) }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Requested Amount -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        Credit Amount Needed <span class="text-red-500">*</span>
                    </label>
                    <InputNumber
                        v-model="form.requested_amount"
                        placeholder="How much credit do you need"
                        :min="1"
                        :useGrouping="true"
                        fluid
                        :class="{ 'p-invalid': errors.requested_amount }"
                    />
                    <small class="text-red-500" v-if="errors.requested_amount">
                        {{ errors.requested_amount }}
                    </small>
                </div>

                <!-- Reason -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        Reason <span class="text-red-500">*</span>
                    </label>
                    <Textarea
                        v-model="form.reason"
                        placeholder="Explain why you need this credit increase..."
                        rows="3"
                        autoResize
                        :class="{ 'p-invalid': errors.reason }"
                    />
                    <small class="text-red-500" v-if="errors.reason">
                        {{ errors.reason }}
                    </small>
                </div>

            </div>

            <template #footer>
                <Button
                    label="Cancel"
                    severity="secondary"
                    outlined
                    @click="submitModalVisible = false"
                />
                <Button
                    label="Submit Request"
                    icon="pi pi-send"
                    :loading="submitLoading"Requested New Limit
                    @click="handleSubmit"
                />
            </template>
        </Dialog>

    </div>
</template>