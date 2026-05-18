<script setup>
import api from '@/service/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const authStore = useAuthStore()

const loading = ref(false)
const pageLoading = ref(true)
const userId = route.params.id

const form = ref({
    name:        '',
    email:       '',
    phone:       '',
    type:        null,
    designation: '',
    meta: {
        company_name:   '',
        business_email: '',
        business_phone: '',
        mobile:         '',
        website:        '',
        ntn:            '',
        address_line1:  '',
        address_line2:  '',
        city:           '',
        district:       '',
        state:          '',
        country:        'Pakistan',
    }
})

const errors = ref({})

// ─── Type options ─────────────────────────────────
const typeOptions = computed(() => {
    const user = authStore.user
    const options = []

    if (authStore.isAgencyLevel) {
        options.push({ label: 'Agency Staff', value: 'staff' })
        if (authStore.hasPermission('user.agent_management')) {
            options.push({ label: 'Agent', value: 'agent' })
        }
    }

    if (authStore.isAgent || authStore.isAgencyStaff) {
        options.push({ label: 'Sub Agent', value: 'sub_agent' })
        options.push({ label: 'Staff', value: 'staff' })
    }

    return options
})

const isAgentType = computed(() =>
    form.value.type === 'agent'
)

// ─── Load user ────────────────────────────────────
const loadUser = async () => {
    pageLoading.value = true
    try {
        const res = await api.get(`/users/${userId}`)
        const user = res.data.data

        form.value.name        = user.name || ''
        form.value.email       = user.email || ''
        form.value.phone       = user.phone || ''
        form.value.type        = user.type || null
        form.value.designation = user.designation || ''

        if (user.meta) {
            Object.keys(form.value.meta).forEach(key => {
                if (user.meta[key]) form.value.meta[key] = user.meta[key]
            })
        }

    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   'Failed to load user data.',
            life:     4000
        })
        router.push('/users')
    } finally {
        pageLoading.value = false
    }
}

// ─── Validate ─────────────────────────────────────
const validate = () => {
    errors.value = {}

    if (!form.value.name.trim())
        errors.value.name = 'Name is required.'

    if (!form.value.email.trim())
        errors.value.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email))
        errors.value.email = 'Please enter a valid email.'

    if (!form.value.type)
        errors.value.type = 'Please select a user type.'

    return Object.keys(errors.value).length === 0
}

// ─── Submit ───────────────────────────────────────
const handleSubmit = async () => {
    if (!validate()) return

    loading.value = true
    try {
        const meta = {}
        Object.entries(form.value.meta).forEach(([key, value]) => {
            if (value?.trim()) meta[key] = value.trim()
        })

        await api.put(`/users/${userId}`, {
            name:        form.value.name.trim(),
            email:       form.value.email.trim(),
            phone:       form.value.phone.trim() || null,
            type:        form.value.type,
            designation: form.value.designation.trim() || null,
            meta,
        })

        toast.add({
            severity: 'success',
            summary:  'User Updated',
            detail:   `${form.value.name} updated successfully.`,
            life:     4000
        })

        router.push('/users')

    } catch (error) {
        const data = error.response?.data
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   data?.message || 'Failed to update user.',
            life:     4000
        })
        if (data?.errors) errors.value = data.errors
    } finally {
        loading.value = false
    }
}

onMounted(() => loadUser())
</script>

<template>
    <div>
        <Toast />

        <!-- ─── Page Loading ─────────────────────── -->
        <div v-if="pageLoading" class="flex items-center justify-center py-32">
            <ProgressSpinner style="width: 50px; height: 50px" />
        </div>

        <div v-else>

            <!-- ─── Page Header ────────────────────── -->
            <div class="flex items-center gap-3 mb-4">
                <Button
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    text
                    rounded
                    @click="router.push('/users')"
                />
                <div>
                    <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
                        Edit User
                    </h2>
                    <p class="text-surface-500 text-sm mt-1">
                        Update user details.
                    </p>
                </div>
            </div>

            <div class="flex flex-col gap-4">

                <!-- ─── Section 1: Basic Information ── -->
                <div class="card">
                    <div class="font-semibold text-xl mb-6">Basic Information</div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">
                                Full Name <span class="text-red-500">*</span>
                            </label>
                            <InputText
                                v-model="form.name"
                                placeholder="Enter full name"
                                :class="{ 'p-invalid': errors.name }"
                            />
                            <small class="text-red-500" v-if="errors.name">
                                {{ errors.name }}
                            </small>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">
                                Email Address <span class="text-red-500">*</span>
                            </label>
                            <InputText
                                v-model="form.email"
                                type="email"
                                placeholder="Enter email address"
                                :class="{ 'p-invalid': errors.email }"
                            />
                            <small class="text-red-500" v-if="errors.email">
                                {{ errors.email }}
                            </small>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">Phone Number</label>
                            <InputText
                                v-model="form.phone"
                                placeholder="e.g. 03001234567"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">
                                User Type <span class="text-red-500">*</span>
                            </label>
                            <Select
                                v-model="form.type"
                                :options="typeOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Select user type"
                                :class="{ 'p-invalid': errors.type }"
                            />
                            <small class="text-red-500" v-if="errors.type">
                                {{ errors.type }}
                            </small>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">Designation</label>
                            <InputText
                                v-model="form.designation"
                                placeholder="e.g. Sales Manager"
                            />
                        </div>

                    </div>
                </div>

                <!-- ─── Section 2: Agency Info ──────── -->
                <div class="card" v-if="isAgentType">
                    <div class="font-semibold text-xl mb-6">Agency Information</div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">Agency Name</label>
                            <InputText
                                v-model="form.meta.company_name"
                                placeholder="Enter agency name"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">Business Email</label>
                            <InputText
                                v-model="form.meta.business_email"
                                type="email"
                                placeholder="e.g. info@agency.com"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">Business Phone</label>
                            <InputText
                                v-model="form.meta.business_phone"
                                placeholder="e.g. 042-35761234"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">Mobile / WhatsApp</label>
                            <InputText
                                v-model="form.meta.mobile"
                                placeholder="e.g. 03001234567"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">Website</label>
                            <InputText
                                v-model="form.meta.website"
                                placeholder="e.g. www.agency.com"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">NTN / Tax Number</label>
                            <InputText
                                v-model="form.meta.ntn"
                                placeholder="e.g. 1234567-8"
                            />
                        </div>

                        <div class="md:col-span-3">
                            <Divider />
                            <p class="text-sm font-semibold text-surface-500">Address</p>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">Address Line 1</label>
                            <InputText
                                v-model="form.meta.address_line1"
                                placeholder="Street address, P.O. box"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">Address Line 2</label>
                            <InputText
                                v-model="form.meta.address_line2"
                                placeholder="Apartment, suite, unit"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">City</label>
                            <InputText
                                v-model="form.meta.city"
                                placeholder="e.g. Lahore"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">District</label>
                            <InputText
                                v-model="form.meta.district"
                                placeholder="e.g. Gulberg"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">State / Province</label>
                            <InputText
                                v-model="form.meta.state"
                                placeholder="e.g. Punjab"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-sm">Country</label>
                            <InputText
                                v-model="form.meta.country"
                                placeholder="e.g. Pakistan"
                            />
                        </div>

                    </div>
                </div>

                <!-- ─── Actions ──────────────────────── -->
                <div class="flex items-center justify-end gap-3">
                    <Button
                        label="Cancel"
                        severity="secondary"
                        outlined
                        @click="router.push('/users')"
                    />
                    <Button
                        label="Save Changes"
                        icon="pi pi-check"
                        :loading="loading"
                        @click="handleSubmit"
                    />
                </div>

            </div>
        </div>
    </div>
</template>