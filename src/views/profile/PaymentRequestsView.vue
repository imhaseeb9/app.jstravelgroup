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
const form = ref({
    amount:       null,
    currency:     'PKR',
    payment_method: null,
    payment_date: null,
    notes:        '',
})
const errors = ref({})

const paymentMethods = [
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Cash',          value: 'cash' },
    { label: 'Cheque',        value: 'cheque' },
    { label: 'Online',        value: 'online' },
]

// ─── Fetch ────────────────────────────────────────
const fetchRequests = async () => {
    loading.value = true
    try {
        const res = await api.get('/profile/payment-requests', {
            params: { page: currentPage.value, per_page: perPage.value }
        })
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

// ─── Submit Payment Request ───────────────────────
const validate = () => {
    errors.value = {}
    if (!form.value.amount || form.value.amount <= 0)
        errors.value.amount = 'Please enter a valid amount.'
    if (!form.value.payment_method)
        errors.value.payment_method = 'Please select payment method.'
    if (!form.value.payment_date)
        errors.value.payment_date = 'Please select payment date.'
    return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
    if (!validate()) return

    submitLoading.value = true
    try {
        await api.post('/profile/payment-requests', {
            amount:         form.value.amount,
            currency:       form.value.currency,
            payment_method: form.value.payment_method,
            payment_date:   form.value.payment_date?.toISOString().split('T')[0],
            notes:          form.value.notes || null,
        })

        toast.add({
            severity: 'success',
            summary:  'Request Submitted',
            detail:   'Payment request submitted successfully.',
            life:     3000
        })

        submitModalVisible.value = false
        form.value = {
            amount: null, currency: 'PKR',
            payment_method: null, payment_date: null, notes: ''
        }
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
                        <div class="font-semibold text-xl">My Payment Requests</div>
                        <Button
                            label="New Request"
                            icon="pi pi-plus"
                            @click="submitModalVisible = true"
                        />
                    </div>
                </template>

                <!-- Empty -->
                <template #empty>
                    <div class="flex flex-col items-center justify-center py-16 gap-3">
                        <i class="pi pi-send text-5xl text-surface-300" />
                        <p class="text-surface-500 font-medium text-lg">No payment requests</p>
                        <Button
                            label="Submit First Request"
                            icon="pi pi-plus"
                            size="small"
                            @click="submitModalVisible = true"
                        />
                    </div>
                </template>

                <!-- Columns -->
                <Column header="Amount" style="min-width: 130px">
                    <template #body="{ data }">
                        <span class="font-semibold text-surface-900 dark:text-surface-0">
                            {{ formatCurrency(data.amount) }}
                        </span>
                    </template>
                </Column>

                <Column header="Payment Method" style="min-width: 140px">
                    <template #body="{ data }">
                        <span class="text-sm capitalize">
                            {{ data.payment_method?.replace(/_/g, ' ') || '—' }}
                        </span>
                    </template>
                </Column>

                <Column header="Payment Date" style="min-width: 130px">
                    <template #body="{ data }">
                        <span class="text-sm">{{ formatDate(data.payment_date) }}</span>
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

                <Column header="Notes" style="min-width: 180px">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-500">
                            {{ data.notes || '—' }}
                        </span>
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
            header="Submit Payment Request"
            :style="{ width: '480px' }"
            modal
            :draggable="false"
        >
            <div class="flex flex-col gap-4 py-2">

                <!-- Amount -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        Amount <span class="text-red-500">*</span>
                    </label>
                    <InputNumber
                        v-model="form.amount"
                        placeholder="Enter amount"
                        :min="1"
                        :useGrouping="true"
                        fluid
                        :class="{ 'p-invalid': errors.amount }"
                    />
                    <small class="text-red-500" v-if="errors.amount">
                        {{ errors.amount }}
                    </small>
                </div>

                <!-- Payment Method -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        Payment Method <span class="text-red-500">*</span>
                    </label>
                    <Select
                        v-model="form.payment_method"
                        :options="paymentMethods"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select payment method"
                        :class="{ 'p-invalid': errors.payment_method }"
                    />
                    <small class="text-red-500" v-if="errors.payment_method">
                        {{ errors.payment_method }}
                    </small>
                </div>

                <!-- Payment Date -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        Payment Date <span class="text-red-500">*</span>
                    </label>
                    <DatePicker
                        v-model="form.payment_date"
                        placeholder="Select payment date"
                        :maxDate="new Date()"
                        dateFormat="dd M yy"
                        fluid
                        :class="{ 'p-invalid': errors.payment_date }"
                    />
                    <small class="text-red-500" v-if="errors.payment_date">
                        {{ errors.payment_date }}
                    </small>
                </div>

                <!-- Notes -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">Notes</label>
                    <Textarea
                        v-model="form.notes"
                        placeholder="Optional notes for admin..."
                        rows="3"
                        autoResize
                    />
                </div>

                <!-- Info -->
                <div class="p-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                    <p class="text-xs text-surface-500">
                        <i class="pi pi-info-circle mr-1" />
                        After approval, credit will be added to your account automatically.
                    </p>
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
                    :loading="submitLoading"
                    @click="handleSubmit"
                />
            </template>
        </Dialog>

    </div>
</template>