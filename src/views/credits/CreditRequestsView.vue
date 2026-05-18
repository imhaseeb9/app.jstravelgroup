<script setup>
import api from '@/service/api'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'

const toast = useToast()

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
const approveNotes = ref('')

// ─── Reject Modal ─────────────────────────────────
const rejectModalVisible = ref(false)
const rejectLoading = ref(false)
const rejectReason = ref('')
const rejectErrors = ref({})

// ─── Fetch ────────────────────────────────────────
const fetchRequests = async () => {
    loading.value = true
    try {
        const params = { page: currentPage.value, per_page: perPage.value }
        if (filterStatus.value) params.status = filterStatus.value

        const res = await api.get('/credit-requests', { params })
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
    approveNotes.value = ''
    approveModalVisible.value = true
}

const handleApprove = async () => {
    approveLoading.value = true
    try {
        await api.post(`/credit-requests/${selectedRequest.value.id}/approve`, {
            notes: approveNotes.value || null,
        })

        toast.add({
            severity: 'success',
            summary:  'Approved',
            detail:   `Credit of ${formatCurrency(selectedRequest.value.requested_amount)} added to agent balance.`,
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
    rejectReason.value = ''
    rejectErrors.value = {}
    rejectModalVisible.value = true
}

const handleReject = async () => {
    rejectErrors.value = {}
    if (!rejectReason.value?.trim()) {
        rejectErrors.value.reason = 'Rejection reason is required.'
        return
    }

    rejectLoading.value = true
    try {
        await api.post(`/credit-requests/${selectedRequest.value.id}/reject`, {
            rejection_reason: rejectReason.value.trim()
        })

        toast.add({
            severity: 'success',
            summary:  'Rejected',
            detail:   'Credit request rejected.',
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
                        <div class="font-semibold text-xl">Credit Requests</div>
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
                        <i class="pi pi-wallet text-5xl text-surface-300" />
                        <p class="text-surface-500 font-medium text-lg">
                            No credit requests found
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

                <!-- Current Limit -->
                <Column header="Current Limit" style="min-width: 140px">
                    <template #body="{ data }">
                        <span class="text-sm">
                            {{ formatCurrency(data.current_limit) }}
                        </span>
                    </template>
                </Column>

                <!-- Requested Amount -->
                <Column header="Requested Amount" style="min-width: 150px">
                    <template #body="{ data }">
                        <span class="font-semibold text-surface-900 dark:text-surface-0">
                            {{ formatCurrency(data.requested_amount) }}
                        </span>
                    </template>
                </Column>

                <!-- Reason -->
                <Column header="Reason" style="min-width: 200px">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-600 dark:text-surface-300">
                            {{ data.reason || '—' }}
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

                <!-- Rejection Reason -->
                <Column header="Rejection Reason" style="min-width: 180px">
                    <template #body="{ data }">
                        <span
                            v-if="data.status === 'rejected'"
                            class="text-sm text-red-400"
                        >
                            {{ data.rejection_reason || '—' }}
                        </span>
                        <span v-else class="text-surface-300 text-sm">—</span>
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
            header="Approve Credit Request"
            :style="{ width: '440px' }"
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
                            <p class="text-xs text-surface-400">Requested Amount</p>
                            <p class="font-semibold text-sm mt-1 text-green-600">
                                {{ formatCurrency(selectedRequest.requested_amount) }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs text-surface-400">Current Limit</p>
                            <p class="text-sm mt-1">
                                {{ formatCurrency(selectedRequest.current_limit) }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs text-surface-400">Reason</p>
                            <p class="text-sm mt-1 text-surface-500">
                                {{ selectedRequest.reason || '—' }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Info -->
                <div class="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p class="text-xs text-green-600 dark:text-green-400">
                        <i class="pi pi-info-circle mr-1" />
                        Approving will add
                        <strong>{{ formatCurrency(selectedRequest.requested_amount) }}</strong>
                        to the agent's available balance.
                    </p>
                </div>

                <!-- Notes -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">Notes (optional)</label>
                    <Textarea
                        v-model="approveNotes"
                        placeholder="Add any notes..."
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
            header="Reject Credit Request"
            :style="{ width: '420px' }"
            modal
            :draggable="false"
        >
            <div class="flex flex-col gap-4 py-2" v-if="selectedRequest">

                <!-- Summary -->
                <div class="p-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">
                            {{ selectedRequest.user?.name }}
                        </span>
                        <span class="font-semibold text-sm text-red-500">
                            {{ formatCurrency(selectedRequest.requested_amount) }}
                        </span>
                    </div>
                    <p class="text-xs text-surface-400 mt-1">
                        {{ selectedRequest.reason }}
                    </p>
                </div>

                <!-- Rejection Reason -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        Rejection Reason <span class="text-red-500">*</span>
                    </label>
                    <Textarea
                        v-model="rejectReason"
                        placeholder="Explain why this credit request is being rejected..."
                        rows="3"
                        autoResize
                        :class="{ 'p-invalid': rejectErrors.reason }"
                    />
                    <small class="text-red-500" v-if="rejectErrors.reason">
                        {{ rejectErrors.reason }}
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