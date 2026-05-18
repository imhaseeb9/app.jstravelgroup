<script setup>
import api from '@/service/api'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'

const toast = useToast()
const confirm = useConfirm()
const authStore = useAuthStore()

const loading = ref(false)
const requests = ref([])
const totalRecords = ref(0)
const currentPage = ref(1)
const perPage = ref(15)

// ─── Filters ──────────────────────────────────────
const filterStatus = ref(null)
const statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Pending',    value: 'pending' },
    { label: 'Approved',   value: 'approved' },
    { label: 'Rejected',   value: 'rejected' },
]

// ─── Approve Modal ────────────────────────────────
const approveModalVisible = ref(false)
const approveLoading = ref(false)
const selectedRequest = ref(null)
const approveForm = ref({
    auto_credit: true,
    notes: '',
})

// ─── Reject Modal ─────────────────────────────────
const rejectModalVisible = ref(false)
const rejectLoading = ref(false)
const rejectForm = ref({
    rejection_reason: ''
})
const rejectErrors = ref({})

// ─── Fetch ────────────────────────────────────────
const fetchRequests = async () => {
    loading.value = true
    try {
        const params = { page: currentPage.value, per_page: perPage.value }
        if (filterStatus.value) params.status = filterStatus.value

        const res = await api.get('/payment-requests', { params })
        requests.value = res.data.data.data || []
        totalRecords.value = res.data.data.total || 0
    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   'Failed to load payment requests.',
            life:     3000
        })
    } finally {
        loading.value = false
    }
}

const onPage = (event) => {
    currentPage.value = event.page + 1
    perPage.value = event.rows
    fetchRequests()
}

const onFilterChange = () => {
    currentPage.value = 1
    fetchRequests()
}

// ─── Approve ──────────────────────────────────────
const openApproveModal = (request) => {
    selectedRequest.value = request
    approveForm.value = { auto_credit: true, notes: '' }
    approveModalVisible.value = true
}

const handleApprove = async () => {
    approveLoading.value = true
    try {
        await api.post(`/payment-requests/${selectedRequest.value.id}/approve`, {
            auto_credit: approveForm.value.auto_credit,
            notes:       approveForm.value.notes || null,
        })

        toast.add({
            severity: 'success',
            summary:  'Approved',
            detail:   approveForm.value.auto_credit
                ? 'Payment approved and credit added to agent balance.'
                : 'Payment approved successfully.',
            life:     4000
        })

        approveModalVisible.value = false
        fetchRequests()

    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   error.response?.data?.message || 'Failed to approve.',
            life:     4000
        })
    } finally {
        approveLoading.value = false
    }
}

// ─── Reject ───────────────────────────────────────
const openRejectModal = (request) => {
    selectedRequest.value = request
    rejectForm.value = { rejection_reason: '' }
    rejectErrors.value = {}
    rejectModalVisible.value = true
}

const handleReject = async () => {
    rejectErrors.value = {}
    if (!rejectForm.value.rejection_reason?.trim()) {
        rejectErrors.value.rejection_reason = 'Rejection reason is required.'
        return
    }

    rejectLoading.value = true
    try {
        await api.post(`/payment-requests/${selectedRequest.value.id}/reject`, {
            rejection_reason: rejectForm.value.rejection_reason.trim()
        })

        toast.add({
            severity: 'success',
            summary:  'Rejected',
            detail:   'Payment request rejected.',
            life:     3000
        })

        rejectModalVisible.value = false
        fetchRequests()

    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   error.response?.data?.message || 'Failed to reject.',
            life:     4000
        })
    } finally {
        rejectLoading.value = false
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

const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

onMounted(() => fetchRequests())
</script>

<template>
    <div>
        <Toast />
        <ConfirmDialog />

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
                :rowsPerPageOptions="[10, 15, 25, 50]"
                showGridlines
                dataKey="id"
            >
                <!-- Header -->
                <template #header>
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div class="font-semibold text-xl">Payment Requests</div>
                        <div class="flex gap-2">
                            <Select
                                v-model="filterStatus"
                                :options="statusOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="All Status"
                                style="min-width: 140px"
                                @change="onFilterChange"
                            />
                            <Button
                                icon="pi pi-refresh"
                                severity="secondary"
                                outlined
                                v-tooltip.top="'Refresh'"
                                @click="fetchRequests"
                            />
                        </div>
                    </div>
                </template>

                <!-- Empty -->
                <template #empty>
                    <div class="flex flex-col items-center justify-center py-16 gap-3">
                        <i class="pi pi-credit-card text-5xl text-surface-300" />
                        <p class="text-surface-500 font-medium text-lg">
                            No payment requests found
                        </p>
                    </div>
                </template>

                <!-- Loading -->
                <template #loading>
                    <div class="flex items-center justify-center py-16">
                        <ProgressSpinner style="width: 40px; height: 40px" />
                    </div>
                </template>

                <!-- ─── Columns ───────────────────── -->

                <!-- Agent -->
                <Column header="Agent" style="min-width: 200px">
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-bold text-xs text-primary-700 dark:text-primary-200 flex-shrink-0">
                                {{ getInitials(data.user?.name) }}
                            </div>
                            <div>
                                <p class="font-medium text-sm text-surface-900 dark:text-surface-0">
                                    {{ data.user?.name }}
                                </p>
                                <p class="text-xs text-surface-400">
                                    {{ data.user?.email }}
                                </p>
                            </div>
                        </div>
                    </template>
                </Column>

                <!-- Amount -->
                <Column header="Amount" style="min-width: 130px">
                    <template #body="{ data }">
                        <span class="font-semibold text-surface-900 dark:text-surface-0">
                            {{ formatCurrency(data.amount) }}
                        </span>
                    </template>
                </Column>

                <!-- Payment Method -->
                <Column header="Method" style="min-width: 130px">
                    <template #body="{ data }">
                        <span class="text-sm capitalize">
                            {{ data.payment_method?.replace(/_/g, ' ') || '—' }}
                        </span>
                    </template>
                </Column>

                <!-- Payment Date -->
                <Column header="Payment Date" style="min-width: 130px">
                    <template #body="{ data }">
                        <span class="text-sm">
                            {{ formatDate(data.payment_date) }}
                        </span>
                    </template>
                </Column>

                <!-- Status -->
                <Column header="Status" style="min-width: 110px">
                    <template #body="{ data }">
                        <Tag
                            :value="data.status"
                            :severity="getStatusSeverity(data.status)"
                            class="capitalize"
                        />
                    </template>
                </Column>

                <!-- Notes -->
                <Column header="Notes" style="min-width: 160px">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-500">
                            {{ data.notes || data.rejection_reason || '—' }}
                        </span>
                    </template>
                </Column>

                <!-- Reviewed By -->
                <Column header="Reviewed By" style="min-width: 130px">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-500">
                            {{ data.reviewed_by?.name || '—' }}
                        </span>
                    </template>
                </Column>

                <!-- Submitted -->
                <Column header="Submitted" style="min-width: 120px">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-500">
                            {{ formatDate(data.created_at) }}
                        </span>
                    </template>
                </Column>

                <!-- Actions -->
                <Column header="Actions" alignFrozen="right" frozen style="min-width: 120px">
                    <template #body="{ data }">
                        <div class="flex items-center gap-1" v-if="data.status === 'pending'">
                            <Button
                                icon="pi pi-check"
                                severity="success"
                                text
                                rounded
                                v-tooltip.top="'Approve'"
                                @click="openApproveModal(data)"
                            />
                            <Button
                                icon="pi pi-times"
                                severity="danger"
                                text
                                rounded
                                v-tooltip.top="'Reject'"
                                @click="openRejectModal(data)"
                            />
                        </div>
                        <span v-else class="text-surface-300 text-xs">—</span>
                    </template>
                </Column>

            </DataTable>
        </div>

        <!-- ─── Approve Modal ─────────────────────── -->
        <Dialog
            v-model:visible="approveModalVisible"
            header="Approve Payment Request"
            :style="{ width: '460px' }"
            modal
            :draggable="false"
        >
            <div class="flex flex-col gap-4 py-2" v-if="selectedRequest">

                <!-- Request Summary -->
                <div class="p-4 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-xs text-surface-400">Agent</p>
                            <p class="font-semibold text-sm mt-1">
                                {{ selectedRequest.user?.name }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs text-surface-400">Amount</p>
                            <p class="font-semibold text-sm mt-1 text-green-600">
                                {{ formatCurrency(selectedRequest.amount) }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs text-surface-400">Method</p>
                            <p class="text-sm mt-1 capitalize">
                                {{ selectedRequest.payment_method?.replace(/_/g, ' ') }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs text-surface-400">Payment Date</p>
                            <p class="text-sm mt-1">
                                {{ formatDate(selectedRequest.payment_date) }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Auto Credit Toggle -->
                <div class="flex items-start gap-3 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                    <Checkbox
                        v-model="approveForm.auto_credit"
                        binary
                        inputId="auto_credit"
                    />
                    <div>
                        <label
                            for="auto_credit"
                            class="font-medium text-sm cursor-pointer"
                        >
                            Add to agent balance
                        </label>
                        <p class="text-xs text-surface-400 mt-1">
                            Automatically credit
                            <strong>{{ formatCurrency(selectedRequest.amount) }}</strong>
                            to the agent's available balance after approval.
                        </p>
                    </div>
                </div>

                <!-- Notes -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">Notes (optional)</label>
                    <Textarea
                        v-model="approveForm.notes"
                        placeholder="Add any notes for this approval..."
                        rows="2"
                        autoResize
                    />
                </div>

            </div>

            <template #footer>
                <Button
                    label="Cancel"
                    severity="secondary"
                    outlined
                    @click="approveModalVisible = false"
                />
                <Button
                    label="Approve"
                    icon="pi pi-check"
                    severity="success"
                    :loading="approveLoading"
                    @click="handleApprove"
                />
            </template>
        </Dialog>

        <!-- ─── Reject Modal ──────────────────────── -->
        <Dialog
            v-model:visible="rejectModalVisible"
            header="Reject Payment Request"
            :style="{ width: '420px' }"
            modal
            :draggable="false"
        >
            <div class="flex flex-col gap-4 py-2" v-if="selectedRequest">

                <!-- Request Summary -->
                <div class="p-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">
                            {{ selectedRequest.user?.name }}
                        </span>
                        <span class="font-semibold text-sm text-red-500">
                            {{ formatCurrency(selectedRequest.amount) }}
                        </span>
                    </div>
                </div>

                <!-- Rejection Reason -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        Rejection Reason <span class="text-red-500">*</span>
                    </label>
                    <Textarea
                        v-model="rejectForm.rejection_reason"
                        placeholder="Explain why this payment request is being rejected..."
                        rows="3"
                        autoResize
                        :class="{ 'p-invalid': rejectErrors.rejection_reason }"
                    />
                    <small class="text-red-500" v-if="rejectErrors.rejection_reason">
                        {{ rejectErrors.rejection_reason }}
                    </small>
                </div>

            </div>

            <template #footer>
                <Button
                    label="Cancel"
                    severity="secondary"
                    outlined
                    @click="rejectModalVisible = false"
                />
                <Button
                    label="Reject"
                    icon="pi pi-times"
                    severity="danger"
                    :loading="rejectLoading"
                    @click="handleReject"
                />
            </template>
        </Dialog>

    </div>
</template>