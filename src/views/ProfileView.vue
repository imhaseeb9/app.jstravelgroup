<script setup>
import api from '@/service/api'
import { useAuthStore } from '@/stores/auth'
import SessionsView from '@/views/profile/SessionsView.vue'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref } from 'vue'

const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const passwordLoading = ref(false)
const activeTab = ref(0)

const form = ref({
    name:        '',
    phone:       '',
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
        country:        '',
    }
})

const passwordForm = ref({
    current_password:      '',
    password:              '',
    password_confirmation: '',
})

const errors = ref({})
const passwordErrors = ref({})

const isAgentType = computed(() =>
    authStore.user?.type === 'agent' ||
    authStore.user?.type === 'sub_agent'
)

const userInitials = computed(() => {
    const name = authStore.user?.name || 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const getUserTypeLabel = (type) => ({
    super_admin: 'Super Admin',
    staff:       'Staff',
    agent:       'Agent',
    sub_agent:   'Sub Agent',
}[type] || type)

const getUserTypeSeverity = (type) => ({
    super_admin: 'contrast',
    staff:       'info',
    agent:       'success',
    sub_agent:   'warn',
}[type] || 'secondary')

// ─── Load Profile ─────────────────────────────────
const loadProfile = async () => {
    try {
        const res = await api.get('/profile')
        const user = res.data.data

        form.value.name        = user.name || ''
        form.value.phone       = user.phone || ''
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
            detail:   'Failed to load profile.',
            life:     3000
        })
    }
}

// ─── Update Profile ───────────────────────────────
const handleUpdate = async () => {
    errors.value = {}

    if (!form.value.name.trim()) {
        errors.value.name = 'Name is required.'
        return
    }

    loading.value = true
    try {
        const meta = {}
        Object.entries(form.value.meta).forEach(([key, value]) => {
            if (value?.trim()) meta[key] = value.trim()
        })

        const res = await api.put('/profile', {
            name:        form.value.name.trim(),
            phone:       form.value.phone.trim() || null,
            meta,
        })

        // Update auth store with new user data
        authStore.user = { ...authStore.user, ...res.data.data }
        localStorage.setItem('user', JSON.stringify(authStore.user))

        toast.add({
            severity: 'success',
            summary:  'Profile Updated',
            detail:   'Your profile has been updated successfully.',
            life:     3000
        })
    } catch (error) {
        const data = error.response?.data
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   data?.message || 'Failed to update profile.',
            life:     3000
        })
        if (data?.errors) errors.value = data.errors
    } finally {
        loading.value = false
    }
}

// ─── Change Password ──────────────────────────────
const validatePassword = () => {
    passwordErrors.value = {}

    if (!passwordForm.value.current_password)
        passwordErrors.value.current_password = 'Current password is required.'

    if (!passwordForm.value.password)
        passwordErrors.value.password = 'New password is required.'
    else if (passwordForm.value.password.length < 8)
        passwordErrors.value.password = 'Password must be at least 8 characters.'
    else if (!/[A-Z]/.test(passwordForm.value.password))
        passwordErrors.value.password = 'Must contain at least one uppercase letter.'
    else if (!/[0-9]/.test(passwordForm.value.password))
        passwordErrors.value.password = 'Must contain at least one number.'

    if (!passwordForm.value.password_confirmation)
        passwordErrors.value.password_confirmation = 'Please confirm your password.'
    else if (passwordForm.value.password !== passwordForm.value.password_confirmation)
        passwordErrors.value.password_confirmation = 'Passwords do not match.'

    return Object.keys(passwordErrors.value).length === 0
}

const handlePasswordChange = async () => {
    if (!validatePassword()) return

    passwordLoading.value = true
    try {
        await api.put('/profile/password', {
            current_password:      passwordForm.value.current_password,
            password:              passwordForm.value.password,
            password_confirmation: passwordForm.value.password_confirmation,
        })

        // Reset form
        passwordForm.value = {
            current_password:      '',
            password:              '',
            password_confirmation: '',
        }

        toast.add({
            severity: 'success',
            summary:  'Password Changed',
            detail:   'Password changed successfully. Other devices logged out.',
            life:     4000
        })
    } catch (error) {
        const data = error.response?.data
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   data?.message || 'Failed to change password.',
            life:     3000
        })
        if (data?.errors) passwordErrors.value = data.errors
    } finally {
        passwordLoading.value = false
    }
}

onMounted(() => loadProfile())
</script>

<template>
    <div>
        <Toast />

        <div class="flex flex-col gap-4">

            <!-- ─── Profile Header Card ──────────── -->
            <div class="card bg-gradient-to-r from-surface-900 to-surface-700 dark:from-surface-800 dark:to-surface-900 border-0">
                <div class="flex items-center gap-5">
                    <!-- Avatar -->
                    <div class="w-20 h-20 rounded-2xl bg-primary-500 flex items-center justify-center font-bold text-2xl text-white flex-shrink-0">
                        {{ userInitials }}
                    </div>

                    <!-- Info -->
                    <div class="flex-1">
                        <h2 class="text-2xl font-bold text-white">
                            {{ authStore.user?.name }}
                        </h2>
                        <p class="text-surface-400 text-sm mt-0.5">
                            {{ authStore.user?.email }}
                        </p>
                        <div class="flex items-center gap-2 mt-2">
                            <Tag
                                :value="getUserTypeLabel(authStore.user?.type)"
                                :severity="getUserTypeSeverity(authStore.user?.type)"
                            />
                            <span
                                v-if="authStore.user?.designation"
                                class="text-surface-400 text-sm"
                            >
                                {{ authStore.user?.designation }}
                            </span>
                        </div>
                    </div>

                    <!-- Last Login -->
                    <div class="text-right hidden md:block">
                        <p class="text-surface-500 text-xs">Last Login</p>
                        <p class="text-surface-300 text-sm mt-1">
                            {{
                                authStore.user?.last_login_at
                                    ? new Date(authStore.user.last_login_at).toLocaleDateString('en-PK', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })
                                    : '—'
                            }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- ─── Tabs ──────────────────────────── -->
            <Tabs v-model:value="activeTab">
                <TabList>
                    <Tab :value="0">
                        <i class="pi pi-user mr-2" />
                        Personal Info
                    </Tab>
                    <Tab :value="1" v-if="isAgentType">
                        <i class="pi pi-building mr-2" />
                        Agency Info
                    </Tab>
                    <Tab :value="2">
                        <i class="pi pi-lock mr-2" />
                        Change Password
                    </Tab>
                    <Tab :value="3">
                        <i class="pi pi-desktop mr-2" />
                        Active Sessions
                    </Tab>
                </TabList>

                <!-- ─── Tab 0: Personal Info ──────── -->
                <TabPanel :value="0">
                    <div class="card mt-4">
                        <div class="font-semibold text-xl mb-6">Personal Information</div>
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
                                <label class="font-medium text-sm">Email Address</label>
                                <InputText
                                    :value="authStore.user?.email"
                                    disabled
                                    class="opacity-60"
                                />
                                <small class="text-surface-400 text-xs">
                                    Contact admin to change email
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
                                <label class="font-medium text-sm">User Type</label>
                                <InputText
                                    :value="getUserTypeLabel(authStore.user?.type)"
                                    disabled
                                    class="opacity-60"
                                />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">Designation</label>
                                <InputText
                                    :value="authStore.user?.designation || '—'"
                                    disabled
                                    class="opacity-60"
                                />
                                <small class="text-surface-400 text-xs">
                                    Contact admin to change designation
                                </small>
                            </div>

                        </div>

                        <div class="flex justify-end mt-6">
                            <Button
                                label="Save Changes"
                                icon="pi pi-check"
                                :loading="loading"
                                @click="handleUpdate"
                            />
                        </div>
                    </div>
                </TabPanel>

                <!-- ─── Tab 1: Agency Info ─────────── -->
                <TabPanel :value="1" v-if="isAgentType">
                    <div class="card mt-4">
                        <div class="font-semibold text-xl mb-6">Agency Information</div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">Agency Name</label>
                                <InputText v-model="form.meta.company_name" placeholder="Enter agency name" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">Business Email</label>
                                <InputText v-model="form.meta.business_email" type="email" placeholder="e.g. info@agency.com" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">Business Phone</label>
                                <InputText v-model="form.meta.business_phone" placeholder="e.g. 042-35761234" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">Mobile / WhatsApp</label>
                                <InputText v-model="form.meta.mobile" placeholder="e.g. 03001234567" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">Website</label>
                                <InputText v-model="form.meta.website" placeholder="e.g. www.agency.com" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">NTN / Tax Number</label>
                                <InputText v-model="form.meta.ntn" placeholder="e.g. 1234567-8" />
                            </div>

                            <div class="md:col-span-3">
                                <Divider />
                                <p class="text-sm font-semibold text-surface-500">Address</p>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">Address Line 1</label>
                                <InputText v-model="form.meta.address_line1" placeholder="Street address" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">Address Line 2</label>
                                <InputText v-model="form.meta.address_line2" placeholder="Apartment, suite" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">City</label>
                                <InputText v-model="form.meta.city" placeholder="e.g. Lahore" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">District</label>
                                <InputText v-model="form.meta.district" placeholder="e.g. Gulberg" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">State / Province</label>
                                <InputText v-model="form.meta.state" placeholder="e.g. Punjab" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">Country</label>
                                <InputText v-model="form.meta.country" placeholder="e.g. Pakistan" />
                            </div>

                        </div>

                        <div class="flex justify-end mt-6">
                            <Button
                                label="Save Changes"
                                icon="pi pi-check"
                                :loading="loading"
                                @click="handleUpdate"
                            />
                        </div>
                    </div>
                </TabPanel>

                <!-- ─── Tab 2: Change Password ─────── -->
                <TabPanel :value="2">
                    <div class="card mt-4 max-w-lg">
                        <div class="font-semibold text-xl mb-6">Change Password</div>
                        <div class="flex flex-col gap-5">

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">Current Password</label>
                                <Password
                                    v-model="passwordForm.current_password"
                                    placeholder="Enter current password"
                                    :feedback="false"
                                    toggleMask
                                    class="w-full"
                                    :class="{ 'p-invalid': passwordErrors.current_password }"
                                />
                                <small class="text-red-500" v-if="passwordErrors.current_password">
                                    {{ passwordErrors.current_password }}
                                </small>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">New Password</label>
                                <Password
                                    v-model="passwordForm.password"
                                    placeholder="Enter new password"
                                    toggleMask
                                    class="w-full"
                                    :class="{ 'p-invalid': passwordErrors.password }"
                                />
                                <small class="text-red-500" v-if="passwordErrors.password">
                                    {{ passwordErrors.password }}
                                </small>
                                <ul class="text-xs text-surface-400 space-y-1 mt-1">
                                    <li :class="passwordForm.password.length >= 8 ? 'text-green-500' : ''">
                                        <i class="pi mr-1" :class="passwordForm.password.length >= 8 ? 'pi-check' : 'pi-circle'" />
                                        At least 8 characters
                                    </li>
                                    <li :class="/[A-Z]/.test(passwordForm.password) ? 'text-green-500' : ''">
                                        <i class="pi mr-1" :class="/[A-Z]/.test(passwordForm.password) ? 'pi-check' : 'pi-circle'" />
                                        At least one uppercase letter
                                    </li>
                                    <li :class="/[0-9]/.test(passwordForm.password) ? 'text-green-500' : ''">
                                        <i class="pi mr-1" :class="/[0-9]/.test(passwordForm.password) ? 'pi-check' : 'pi-circle'" />
                                        At least one number
                                    </li>
                                </ul>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-medium text-sm">Confirm New Password</label>
                                <Password
                                    v-model="passwordForm.password_confirmation"
                                    placeholder="Confirm new password"
                                    :feedback="false"
                                    toggleMask
                                    class="w-full"
                                    :class="{ 'p-invalid': passwordErrors.password_confirmation }"
                                />
                                <small class="text-red-500" v-if="passwordErrors.password_confirmation">
                                    {{ passwordErrors.password_confirmation }}
                                </small>
                            </div>

                            <div class="flex justify-end">
                                <Button
                                    label="Change Password"
                                    icon="pi pi-lock"
                                    :loading="passwordLoading"
                                    @click="handlePasswordChange"
                                />
                            </div>

                        </div>
                    </div>
                </TabPanel>

                <!-- ─── Tab 3: Active Sessions ──────── -->
                <TabPanel :value="3">
                    <SessionsView />
                </TabPanel>

            </Tabs>

        </div>
    </div>
</template>