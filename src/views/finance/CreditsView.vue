<script setup>
import api from '@/service/api'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()

const loading = ref(false)
const users = ref([])
const totalRecords = ref(0)
const currentPage = ref(1)
const perPage = ref(15)
const search = ref('')

// ─── Credit Limit Modal ───────────────────────────
const limitModalVisible = ref(false)
const limitLoading = ref(false)
const selectedUser = ref(null)
const limitForm = ref({ credit_limit: 0, description: '' })

// ─── Add Credit Modal ─────────────────────────────
const addModalVisible = ref(false)
const addLoading = ref(false)
const addForm = ref({ amount: null, description: '' })
const addErrors = ref({})

// ─── Deduct Credit Modal ──────────────────────────
const deductModalVisible = ref(false)
const deductLoading = ref(false)
const deductForm = ref({ amount: null, description: '' })
const deductErrors = ref({})

// ─── Fetch Users with Balance ─────────────────────
const fetchUsers = async () => {
    loading.value = true
    try {
        const params = {
            page:     currentPage.value,
            per_page: perPage.value,
            type:     'agent',
        }
        if (search.value) params.search = search.value

        const res = await api.get('/users', { params })
        const usersList = res.data.data.data || []
        totalRecords.value = res.data.data.total || 0

        // Fetch balance for each agent
        const usersWithBalance = await Promise.all(
            usersList.map(async (user) => {
                try {
                    const balRes = await api.get(`/credits/${user.id}`)
                    return { ...user, balance: balRes.data.data }
                } catch {
                    return { ...user, balance: null }
                }
            })
        )
        users.value = usersWithBalance

    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   'Failed to load agents.',
            life:     3000
        })
    } finally {
        loading.value = false
    }
}

let searchTimeout = null
const onSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        currentPage.value = 1
        fetchUsers()
    }, 500)
}

const onPage = (event) => {
    currentPage.value = event.page + 1
    perPage.value = event.rows
    fetchUsers()
}

// ─── Credit Limit Modal ───────────────────────────
const openLimitModal = (user) => {
    selectedUser.value = user
    limitForm.value = {
        credit_limit: user.balance?.credit_limit || 0,
        description: ''
    }
    limitModalVisible.value = true
}

const handleSetLimit = async () => {
    limitLoading.value = true
    try {
        await api.post(`/credits/${selectedUser.value.id}/assign`, {
            credit_limit: limitForm.value.credit_limit,
            description:  limitForm.value.description || null,
        })

        toast.add({
            severity: 'success',
            summary:  'Limit Updated',
            detail:   `Credit limit set to ${formatCurrency(limitForm.value.credit_limit)} for ${selectedUser.value.name}`,
            life:     3000
        })

        limitModalVisible.value = false
        fetchUsers()

    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   error.response?.data?.message || 'Failed to set limit.',
            life:     3000
        })
    } finally {
        limitLoading.value = false
    }
}

// ─── Add Credit Modal ─────────────────────────────
const openAddModal = (user) => {
    selectedUser.value = user
    addForm.value = { amount: null, description: '' }
    addErrors.value = {}
    addModalVisible.value = true
}

const handleAddCredit = async () => {
    addErrors.value = {}
    if (!addForm.value.amount || addForm.value.amount <= 0) {
        addErrors.value.amount = 'Please enter a valid amount.'
        return
    }
    if (!addForm.value.description?.trim()) {
        addErrors.value.description = 'Description is required.'
        return
    }

    addLoading.value = true
    try {
        await api.post(`/credits/${selectedUser.value.id}/add`, {
            amount:      addForm.value.amount,
            description: addForm.value.description.trim(),
        })

        toast.add({
            severity: 'success',
            summary:  'Credit Added',
            detail:   `${formatCurrency(addForm.value.amount)} added to ${selectedUser.value.name}`,
            life:     3000
        })

        addModalVisible.value = false
        fetchUsers()

    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   error.response?.data?.message || 'Failed to add credit.',
            life:     3000
        })
    } finally {
        addLoading.value = false
    }
}

// ─── Deduct Credit Modal ──────────────────────────
const openDeductModal = (user) => {
    selectedUser.value = user
    deductForm.value = { amount: null, description: '' }
    deductErrors.value = {}
    deductModalVisible.value = true
}

const handleDeductCredit = async () => {
    deductErrors.value = {}
    if (!deductForm.value.amount || deductForm.value.amount <= 0) {
        deductErrors.value.amount = 'Please enter a valid amount.'
        return
    }
    if (!deductForm.value.description?.trim()) {
        deductErrors.value.description = 'Description is required.'
        return
    }

    deductLoading.value = true
    try {
        await api.post(`/credits/${selectedUser.value.id}/deduct`, {
            amount:      deductForm.value.amount,
            description: deductForm.value.description.trim(),
        })

        toast.add({
            severity: 'success',
            summary:  'Credit Deducted',
            detail:   `${formatCurrency(deductForm.value.amount)} deducted from ${selectedUser.value.name}`,
            life:     3000
        })

        deductModalVisible.value = false
        fetchUsers()

    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   error.response?.data?.message || 'Failed to deduct credit.',
            life:     3000
        })
    } finally {
        deductLoading.value = false
    }
}

// ─── Helpers ──────────────────────────────────────
const formatCurrency = (amount) =>
    'PKR ' + new Intl.NumberFormat('en-PK').format(amount || 0)

const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const usedPercentage = (balance) => {
    if (!balance?.credit_limit || balance.credit_limit === 0) return 0
    return Math.min(
        Math.round((balance.used_credit / balance.credit_limit) * 100),
        100
    )
}

onMounted(() => fetchUsers())
</script>

<template>
    <div>
        <Toast />

        <div class="card">
            <DataTable
                :value="users"
                :loading="loading"
                lazy
                :totalRecords="totalRecords"
                :rows="perPage"
                :rowHover="true"
                paginator
                @page="onPage"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="{first} to {last} of {totalRecords} agents"
                :rowsPerPageOptions="[10, 15, 25, 50]"
                showGridlines
                dataKey="id"
            >
                <!-- Header -->
                <template #header>
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div class="font-semibold text-xl">Credit Management</div>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText
                                v-model="search"
                                placeholder="Search agents..."
                                @input="onSearch"
                            />
                        </IconField>
                    </div>
                </template>

                <!-- Empty -->
                <template #empty>
                    <div class="flex flex-col items-center justify-center py-16 gap-3">
                        <i class="pi pi-users text-5xl text-surface-300" />
                        <p class="text-surface-500 font-medium text-lg">No agents found</p>
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
                            <div class="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-bold text-xs text-primary-700 dark:text-primary-200 flex-shrink-0">
                                {{ getInitials(data.name) }}
                            </div>
                            <div>
                                <p class="font-semibold text-sm text-surface-900 dark:text-surface-0">
                                    {{ data.name }}
                                </p>
                                <p class="text-xs text-surface-400">{{ data.email }}</p>
                            </div>
                        </div>
                    </template>
                </Column>

                <!-- Credit Limit -->
                <Column header="Credit Limit" style="min-width: 140px">
                    <template #body="{ data }">
                        <span class="font-semibold text-sm text-surface-900 dark:text-surface-0">
                            {{ formatCurrency(data.balance?.credit_limit) }}
                        </span>
                    </template>
                </Column>

                <!-- Available Balance -->
                <Column header="Available Balance" style="min-width: 150px">
                    <template #body="{ data }">
                        <span
                            class="font-semibold text-sm"
                            :class="(data.balance?.available_balance || 0) < (data.balance?.credit_limit || 0) * 0.2
                                ? 'text-red-500'
                                : 'text-green-500'"
                        >
                            {{ formatCurrency(data.balance?.available_balance) }}
                        </span>
                    </template>
                </Column>

                <!-- Used Credit -->
                <Column header="Used" style="min-width: 180px">
                    <template #body="{ data }">
                        <div v-if="data.balance?.credit_limit">
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-surface-500">
                                    {{ formatCurrency(data.balance?.used_credit) }}
                                </span>
                                <span class="text-surface-400">
                                    {{ usedPercentage(data.balance) }}%
                                </span>
                            </div>
                            <ProgressBar
                                :value="usedPercentage(data.balance)"
                                :showValue="false"
                                style="height: 5px"
                                :pt="{
                                    value: {
                                        class: usedPercentage(data.balance) > 80
                                            ? '!bg-red-500'
                                            : usedPercentage(data.balance) > 50
                                                ? '!bg-orange-500'
                                                : '!bg-green-500'
                                    }
                                }"
                            />
                        </div>
                        <span v-else class="text-surface-300 text-sm">No limit set</span>
                    </template>
                </Column>

                <!-- Last Updated -->
                <Column header="Last Updated" style="min-width: 130px">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-500">
                            {{ data.balance?.last_updated
                                ? new Date(data.balance.last_updated).toLocaleDateString('en-PK', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                })
                                : '—'
                            }}
                        </span>
                    </template>
                </Column>

                <!-- Actions -->
                <Column header="Actions" alignFrozen="right" frozen style="min-width: 180px">
                    <template #body="{ data }">
                        <div class="flex items-center gap-1">

                            <!-- Set Limit -->
                            <Button
                                icon="pi pi-shield"
                                severity="info"
                                text
                                rounded
                                v-tooltip.top="'Set Credit Limit'"
                                @click="openLimitModal(data)"
                            />

                            <!-- Add Credit -->
                            <Button
                                icon="pi pi-plus-circle"
                                severity="success"
                                text
                                rounded
                                v-tooltip.top="'Add Credit'"
                                @click="openAddModal(data)"
                            />

                            <!-- Deduct Credit -->
                            <Button
                                icon="pi pi-minus-circle"
                                severity="danger"
                                text
                                rounded
                                v-tooltip.top="'Deduct Credit'"
                                @click="openDeductModal(data)"
                            />

                            <!-- View Ledger -->
                            <Button
                                icon="pi pi-list"
                                severity="secondary"
                                text
                                rounded
                                v-tooltip.top="'View Ledger'"
                                @click="router.push(`/credits/${data.id}`)"
                            />

                        </div>
                    </template>
                </Column>

            </DataTable>
        </div>

        <!-- ─── Set Credit Limit Modal ────────────── -->
        <Dialog
            v-model:visible="limitModalVisible"
            :header="`Credit Limit — ${selectedUser?.name}`"
            :style="{ width: '420px' }"
            modal
            :draggable="false"
        >
            <div class="flex flex-col gap-4 py-2" v-if="selectedUser">

                <!-- Current Balance -->
                <div class="p-4 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-xs text-surface-400">Current Limit</p>
                            <p class="font-semibold text-sm mt-1">
                                {{ formatCurrency(selectedUser.balance?.credit_limit) }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs text-surface-400">Available Balance</p>
                            <p class="font-semibold text-sm mt-1 text-green-500">
                                {{ formatCurrency(selectedUser.balance?.available_balance) }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- New Limit -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        New Credit Limit
                        <span class="text-surface-400 text-xs font-normal ml-1">(PKR)</span>
                    </label>
                    <InputNumber
                        v-model="limitForm.credit_limit"
                        placeholder="Enter credit limit"
                        :min="0"
                        :useGrouping="true"
                        fluid
                        autofocus
                    />
                </div>

                <!-- Description -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">Notes (optional)</label>
                    <InputText
                        v-model="limitForm.description"
                        placeholder="Reason for limit change..."
                    />
                </div>

            </div>

            <template #footer>
                <Button
                    label="Cancel"
                    severity="secondary"
                    outlined
                    @click="limitModalVisible = false"
                />
                <Button
                    label="Save Limit"
                    icon="pi pi-check"
                    :loading="limitLoading"
                    @click="handleSetLimit"
                />
            </template>
        </Dialog>

        <!-- ─── Add Credit Modal ──────────────────── -->
        <Dialog
            v-model:visible="addModalVisible"
            :header="`Add Credit — ${selectedUser?.name}`"
            :style="{ width: '420px' }"
            modal
            :draggable="false"
        >
            <div class="flex flex-col gap-4 py-2" v-if="selectedUser">

                <!-- Balance Info -->
                <div class="p-4 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-xs text-surface-400">Available Balance</p>
                            <p class="font-semibold text-sm mt-1 text-green-500">
                                {{ formatCurrency(selectedUser.balance?.available_balance) }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs text-surface-400">Credit Limit</p>
                            <p class="font-semibold text-sm mt-1">
                                {{ formatCurrency(selectedUser.balance?.credit_limit) }}
                            </p>
                        </div>
                    </div>
                    <p class="text-xs text-surface-400 mt-3">
                        Maximum addable:
                        <strong class="text-surface-600 dark:text-surface-300">
                            {{ formatCurrency(
                                (selectedUser.balance?.credit_limit || 0) -
                                (selectedUser.balance?.available_balance || 0)
                            ) }}
                        </strong>
                    </p>
                </div>

                <!-- Amount -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        Amount <span class="text-red-500">*</span>
                    </label>
                    <InputNumber
                        v-model="addForm.amount"
                        placeholder="Enter amount to add"
                        :min="1"
                        :useGrouping="true"
                        fluid
                        autofocus
                        :class="{ 'p-invalid': addErrors.amount }"
                    />
                    <small class="text-red-500" v-if="addErrors.amount">
                        {{ addErrors.amount }}
                    </small>
                </div>

                <!-- Description -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        Description <span class="text-red-500">*</span>
                    </label>
                    <InputText
                        v-model="addForm.description"
                        placeholder="e.g. Manual top-up for March"
                        :class="{ 'p-invalid': addErrors.description }"
                    />
                    <small class="text-red-500" v-if="addErrors.description">
                        {{ addErrors.description }}
                    </small>
                </div>

            </div>

            <template #footer>
                <Button
                    label="Cancel"
                    severity="secondary"
                    outlined
                    @click="addModalVisible = false"
                />
                <Button
                    label="Add Credit"
                    icon="pi pi-plus"
                    severity="success"
                    :loading="addLoading"
                    @click="handleAddCredit"
                />
            </template>
        </Dialog>

        <!-- ─── Deduct Credit Modal ───────────────── -->
        <Dialog
            v-model:visible="deductModalVisible"
            :header="`Deduct Credit — ${selectedUser?.name}`"
            :style="{ width: '420px' }"
            modal
            :draggable="false"
        >
            <div class="flex flex-col gap-4 py-2" v-if="selectedUser">

                <!-- Balance Info -->
                <div class="p-4 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-xs text-surface-400">Available Balance</p>
                            <p class="font-semibold text-sm mt-1 text-green-500">
                                {{ formatCurrency(selectedUser.balance?.available_balance) }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs text-surface-400">Credit Limit</p>
                            <p class="font-semibold text-sm mt-1">
                                {{ formatCurrency(selectedUser.balance?.credit_limit) }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Amount -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        Amount <span class="text-red-500">*</span>
                    </label>
                    <InputNumber
                        v-model="deductForm.amount"
                        placeholder="Enter amount to deduct"
                        :min="1"
                        :useGrouping="true"
                        fluid
                        autofocus
                        :class="{ 'p-invalid': deductErrors.amount }"
                    />
                    <small class="text-red-500" v-if="deductErrors.amount">
                        {{ deductErrors.amount }}
                    </small>
                </div>

                <!-- Description -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        Description <span class="text-red-500">*</span>
                    </label>
                    <InputText
                        v-model="deductForm.description"
                        placeholder="e.g. Adjustment for booking error"
                        :class="{ 'p-invalid': deductErrors.description }"
                    />
                    <small class="text-red-500" v-if="deductErrors.description">
                        {{ deductErrors.description }}
                    </small>
                </div>

            </div>

            <template #footer>
                <Button
                    label="Cancel"
                    severity="secondary"
                    outlined
                    @click="deductModalVisible = false"
                />
                <Button
                    label="Deduct Credit"
                    icon="pi pi-minus"
                    severity="danger"
                    :loading="deductLoading"
                    @click="handleDeductCredit"
                />
            </template>
        </Dialog>

    </div>
</template>