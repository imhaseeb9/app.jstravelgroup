<script setup>
import PermissionsModal from '@/components/users/PermissionsModal.vue'
import api from '@/service/api'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const confirm = useConfirm()

// ─── State ────────────────────────────────────────
const users = ref([])
const loading = ref(false)
const totalRecords = ref(0)
const currentPage = ref(1)
const perPage = ref(15)
const search = ref('')
const selectedType = ref(null)
const selectedStatus = ref(null)

// ─── Permissions Modal ────────────────────────────
const permissionsModalVisible = ref(false)
const selectedUser = ref(null)

const openPermissionsModal = (user) => {
    selectedUser.value = user
    permissionsModalVisible.value = true
}

// ─── Filter Options ───────────────────────────────
const typeOptions = [
    { label: 'All Types', value: null },
    { label: 'Staff', value: 'staff' },
    { label: 'Agent', value: 'agent' },
]

const statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
]

// ─── Permissions ──────────────────────────────────
const canCreate = computed(() => authStore.hasPermission('user.create'))
const canEdit = computed(() => authStore.hasPermission('user.edit'))
const canDelete = computed(() => authStore.hasPermission('user.delete'))
const canResetPassword = computed(() => authStore.hasPermission('user.reset_password'))

// ─── Fetch Users ──────────────────────────────────
const fetchUsers = async () => {
    loading.value = true
    try {
        const params = { page: currentPage.value, per_page: perPage.value }
        if (search.value) params.search = search.value
        if (selectedType.value !== null) params.type = selectedType.value
        if (selectedStatus.value !== null) params.is_active = selectedStatus.value

        const response = await api.get('/users', { params })
        users.value = response.data.data.data
        totalRecords.value = response.data.data.total
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load users.',
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

// ─── Search debounce ──────────────────────────────
let searchTimeout = null
const onSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        currentPage.value = 1
        fetchUsers()
    }, 500)
}

const onFilterChange = () => {
    currentPage.value = 1
    fetchUsers()
}

const onPage = (event) => {
    currentPage.value = event.page + 1
    perPage.value = event.rows
    fetchUsers()
}

const clearFilters = () => {
    search.value = ''
    selectedType.value = null
    selectedStatus.value = null
    currentPage.value = 1
    fetchUsers()
}

// ─── Actions ──────────────────────────────────────
const confirmDeactivate = (user) => {
    confirm.require({
        message: `Are you sure you want to deactivate ${user.name}?`,
        header: 'Confirm Deactivation',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: { label: 'Cancel', severity: 'secondary', outlined: true },
        acceptProps: { label: 'Deactivate', severity: 'danger' },
        accept: async () => {
            try {
                await api.delete(`/users/${user.id}`)
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `${user.name} deactivated.`,
                    life: 3000
                })
                fetchUsers()
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message || 'Failed.',
                    life: 3000
                })
            }
        }
    })
}

const activateUser = async (user) => {
    try {
        await api.post(`/users/${user.id}/activate`)
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `${user.name} activated.`,
            life: 3000
        })
        fetchUsers()
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed.',
            life: 3000
        })
    }
}

const resetPassword = async (user) => {
    try {
        await api.post(`/users/${user.id}/reset-password`)
        toast.add({
            severity: 'success',
            summary: 'Email Sent',
            detail: `Setup email sent to ${user.email}`,
            life: 3000
        })
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed.',
            life: 3000
        })
    }
}

// ─── Helpers ──────────────────────────────────────
const getTypeSeverity = (type) => ({
    super_admin: 'contrast',
    staff:       'info',
    agent:       'success',
    sub_agent:   'warn',
}[type] || 'secondary')

const getTypeLabel = (type) => ({
    super_admin: 'Super Admin',
    staff:       'Staff',
    agent:       'Agent',
    sub_agent:   'Sub Agent',
}[type] || type)

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

// ─── Credit Modal ─────────────────────────────────
const creditModalVisible = ref(false)
const creditUser = ref(null)
const creditLimit = ref(0)
const creditLoading = ref(false)

const openCreditModal = async (user) => {
    creditUser.value = user
    creditLimit.value = 0
    creditModalVisible.value = true

    // Load current balance
    try {
        const res = await api.get(`/credits/${user.id}`)
        creditLimit.value = res.data.data.credit_limit || 0
    } catch {
        creditLimit.value = 0
    }
}

const saveCreditLimit = async () => {
    creditLoading.value = true
    try {
        await api.post(`/credits/${creditUser.value.id}/assign`, {
            credit_limit: creditLimit.value
        })
        toast.add({
            severity: 'success',
            summary:  'Credit Limit Updated',
            detail:   `Credit limit set to PKR ${creditLimit.value.toLocaleString()} for ${creditUser.value.name}`,
            life:     3000
        })
        creditModalVisible.value = false
    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   error.response?.data?.message || 'Failed to update credit limit.',
            life:     3000
        })
    } finally {
        creditLoading.value = false
    }
}

onMounted(() => fetchUsers())
</script>

<template>
    <div>
        <Toast />
        <ConfirmDialog />

        <!-- ─── Permissions Modal ─────────────────── -->
        <PermissionsModal
            v-model:visible="permissionsModalVisible"
            :user="selectedUser"
            @saved="fetchUsers"
        />

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
                currentPageReportTemplate="{first} to {last} of {totalRecords} users"
                :rowsPerPageOptions="[10, 15, 25, 50]"
                showGridlines
                dataKey="id"
                tableStyle="min-width: 60rem"
            >
                <!-- Header -->
                <template #header>
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div class="font-semibold text-xl">Users</div>
                        <div class="flex flex-wrap items-center gap-2">

                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText
                                    v-model="search"
                                    placeholder="Search users..."
                                    @input="onSearch"
                                />
                            </IconField>

                            <Select
                                v-model="selectedType"
                                :options="typeOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="All Types"
                                style="min-width: 130px"
                                @change="onFilterChange"
                            />

                            <Select
                                v-model="selectedStatus"
                                :options="statusOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="All Status"
                                style="min-width: 130px"
                                @change="onFilterChange"
                            />

                            <Button
                                type="button"
                                icon="pi pi-filter-slash"
                                label="Clear"
                                outlined
                                @click="clearFilters"
                            />

                            <Button
                                v-if="canCreate"
                                icon="pi pi-plus"
                                label="New User"
                                @click="router.push('/users/create')"
                            />

                        </div>
                    </div>
                </template>

                <!-- Empty -->
                <template #empty>
                    <div class="flex flex-col items-center justify-center py-16 gap-3">
                        <i class="pi pi-users text-5xl text-surface-300" />
                        <p class="text-surface-500 font-medium text-lg">No users found</p>
                        <p class="text-surface-400 text-sm">Try adjusting your search or filters</p>
                    </div>
                </template>

                <!-- Loading -->
                <template #loading>
                    <div class="flex items-center justify-center py-16">
                        <ProgressSpinner style="width:40px; height:40px" />
                    </div>
                </template>

                <!-- ─── Columns ───────────────────── -->

                <Column header="User" style="min-width: 220px">
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200">
                                {{ getInitials(data.name) }}
                            </div>
                            <div>
                                <p class="font-semibold text-surface-900 dark:text-surface-0 text-sm leading-tight">
                                    {{ data.name }}
                                </p>
                                <p class="text-surface-400 text-xs mt-0.5">{{ data.email }}</p>
                            </div>
                        </div>
                    </template>
                </Column>

                <Column header="Phone" style="min-width: 130px">
                    <template #body="{ data }">
                        <span class="text-sm">{{ data.phone || '—' }}</span>
                    </template>
                </Column>

                <Column header="Type" style="min-width: 120px">
                    <template #body="{ data }">
                        <Tag
                            :value="getTypeLabel(data.type)"
                            :severity="getTypeSeverity(data.type)"
                        />
                    </template>
                </Column>

                <Column header="Designation" style="min-width: 140px">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-600 dark:text-surface-300">
                            {{ data.designation || '—' }}
                        </span>
                    </template>
                </Column>
                
                <Column header="Credit Limit" style="min-width: 140px">
                    <template #body="{ data }">
                        <div v-if="data.type === 'agent' || data.type === 'sub_agent'">
                            <span class="text-sm font-medium text-surface-900 dark:text-surface-0">
                                PKR {{ (data.credit_limit || 0).toLocaleString() }}
                            </span>
                            <p class="text-xs text-surface-400 mt-0.5">
                                Avail: PKR {{ (data.available_balance || 0).toLocaleString() }}
                            </p>
                        </div>
                        <span v-else class="text-surface-300 text-sm">—</span>
                    </template>
                </Column>
                
                <Column header="Status" style="min-width: 100px">
                    <template #body="{ data }">
                        <Tag
                            :value="data.is_active ? 'Active' : 'Inactive'"
                            :severity="data.is_active ? 'success' : 'danger'"
                        />
                    </template>
                </Column>

                <Column header="Last Login" style="min-width: 120px">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-500">
                            {{ formatDate(data.last_login_at) }}
                        </span>
                    </template>
                </Column>

                <Column header="Created" style="min-width: 110px">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-500">
                            {{ formatDate(data.created_at) }}
                        </span>
                    </template>
                </Column>

                <!-- Actions -->
                <Column header="Actions" alignFrozen="right" frozen style="min-width: 180px">
                    <template #body="{ data }">
                        <div class="flex items-center gap-1">

                            <!-- Edit -->
                            <Button
                                v-if="canEdit"
                                icon="pi pi-pencil"
                                severity="secondary"
                                text
                                rounded
                                v-tooltip.top="'Edit User'"
                                @click="router.push(`/users/${data.id}/edit`)"
                            />
                            <!-- Credit Limit -->
                            <Button
                                v-if="authStore.hasPermission('finance.set_credit_limit') &&
                                    (data.type === 'agent' || data.type === 'sub_agent')"
                                icon="pi pi-wallet"
                                severity="success"
                                text
                                rounded
                                v-tooltip.top="'Set Credit Limit'"
                                @click="openCreditModal(data)"
                            />
                            <!-- Permissions -->
                            <Button
                                v-if="canEdit"
                                icon="pi pi-lock"
                                severity="info"
                                text
                                rounded
                                v-tooltip.top="'Manage Permissions'"
                                @click="openPermissionsModal(data)"
                            />

                            <!-- Reset Password -->
                            <Button
                                v-if="canResetPassword"
                                icon="pi pi-key"
                                severity="warn"
                                text
                                rounded
                                v-tooltip.top="'Reset Password'"
                                @click="resetPassword(data)"
                            />

                            <!-- Deactivate -->
                            <Button
                                v-if="canDelete && data.is_active"
                                icon="pi pi-ban"
                                severity="danger"
                                text
                                rounded
                                v-tooltip.top="'Deactivate'"
                                @click="confirmDeactivate(data)"
                            />

                            <!-- Activate -->
                            <Button
                                v-if="canDelete && !data.is_active"
                                icon="pi pi-check-circle"
                                severity="success"
                                text
                                rounded
                                v-tooltip.top="'Activate'"
                                @click="activateUser(data)"
                            />

                        </div>
                    </template>
                </Column>

            </DataTable>
        </div>

        <!-- ─── Credit Limit Modal ──────────────────────── -->
        <Dialog
            v-model:visible="creditModalVisible"
            :header="`Credit Limit — ${creditUser?.name}`"
            :style="{ width: '400px' }"
            modal
            :draggable="false"
        >
            <div class="flex flex-col gap-4 py-2">

                <!-- Current Info -->
                <div class="p-4 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-bold text-primary-600 dark:text-primary-300 text-sm">
                            {{ creditUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }}
                        </div>
                        <div>
                            <p class="font-semibold text-sm">{{ creditUser?.name }}</p>
                            <p class="text-surface-400 text-xs capitalize">{{ creditUser?.type?.replace('_', ' ') }}</p>
                        </div>
                    </div>
                </div>

                <!-- Credit Limit Input -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        Credit Limit
                        <span class="text-surface-400 text-xs font-normal ml-1">(PKR)</span>
                    </label>
                    <InputNumber
                        v-model="creditLimit"
                        placeholder="Enter credit limit"
                        :min="0"
                        :useGrouping="true"
                        fluid
                        autofocus
                    />
                    <small class="text-surface-400 text-xs">
                        Set to 0 to remove credit access.
                    </small>
                </div>

            </div>

            <template #footer>
                <Button
                    label="Cancel"
                    severity="secondary"
                    outlined
                    @click="creditModalVisible = false"
                />
                <Button
                    label="Save Limit"
                    icon="pi pi-check"
                    :loading="creditLoading"
                    @click="saveCreditLimit"
                />
            </template>
        </Dialog>
    </div>
</template>