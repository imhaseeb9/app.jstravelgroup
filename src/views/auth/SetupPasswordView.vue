<script setup>
import api from '@/service/api'
import { useToast } from 'primevue/usetoast'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const loading = ref(false)
const setupComplete = ref(false)

const form = ref({
    email: route.query.email || '',
    token: route.query.token || '',
    password: '',
    password_confirmation: '',
})

const errors = ref({})

// ─── Validate ─────────────────────────────────────
const validate = () => {
    errors.value = {}

    if (!form.value.email.trim())
        errors.value.email = 'Email is required.'

    if (!form.value.token.trim())
        errors.value.token = 'Invalid setup link. Please request a new one.'

    if (!form.value.password)
        errors.value.password = 'Password is required.'
    else if (form.value.password.length < 8)
        errors.value.password = 'Password must be at least 8 characters.'
    else if (!/[A-Z]/.test(form.value.password))
        errors.value.password = 'Password must contain at least one uppercase letter.'
    else if (!/[0-9]/.test(form.value.password))
        errors.value.password = 'Password must contain at least one number.'

    if (!form.value.password_confirmation)
        errors.value.password_confirmation = 'Please confirm your password.'
    else if (form.value.password !== form.value.password_confirmation)
        errors.value.password_confirmation = 'Passwords do not match.'

    return Object.keys(errors.value).length === 0
}

// ─── Submit ───────────────────────────────────────
const handleSubmit = async () => {
    if (!validate()) return

    loading.value = true
    try {
        await api.post('/auth/setup-password', {
            email:                 form.value.email,
            token:                 form.value.token,
            password:              form.value.password,
            password_confirmation: form.value.password_confirmation,
        })

        setupComplete.value = true

    } catch (error) {
        const data = error.response?.data

        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   data?.message || 'Failed to setup password.',
            life:     5000
        })

        if (data?.errors) {
            errors.value = data.errors
        }
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div>
        <Toast />

        <!-- ─── Success State ──────────────────── -->
        <div v-if="setupComplete" class="text-center">
            <div class="flex items-center justify-center mb-6">
                <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <i class="pi pi-check text-green-500 text-3xl" />
                </div>
            </div>
            <h1 class="text-4xl font-medium text-center leading-tight mb-4">
                Password Set!
            </h1>
            <p class="text-surface-500 text-lg mb-8">
                Your password has been set successfully.
                You can now login to your account.
            </p>
            <button
                class="landing-button-primary w-full max-w-xs mx-auto block"
                @click="router.push('/login')"
            >
                Go to Login
            </button>
        </div>

        <!-- ─── Setup Form ─────────────────────── -->
        <div v-else>
            <h1 class="text-4xl md:text-5xl font-medium text-center mx-auto leading-tight">
                Setup Password
            </h1>
            <p class="text-lg text-surface-500 leading-6 mt-4 text-center mx-auto">
                Create a secure password for your account.
            </p>

            <form
                class="max-w-[35rem] mx-auto"
                @submit.prevent="handleSubmit"
            >
                <div class="space-y-4 mt-10">

                    <!-- Invalid link warning -->
                    <div
                        v-if="!form.token || !form.email"
                        class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                    >
                        <i class="pi pi-exclamation-triangle mr-2" />
                        Invalid or incomplete setup link.
                        Please use the link from your email.
                    </div>

                    <!-- Email (readonly) -->
                    <div class="flex flex-col gap-2" v-if="form.email">
                        <label class="text-sm font-medium text-surface-600 dark:text-surface-300">
                            Email Address
                        </label>
                        <LandingInput
                            :modelValue="form.email"
                            type="email"
                            disabled
                        />
                    </div>

                    <!-- Password -->
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-surface-600 dark:text-surface-300">
                            New Password
                        </label>
                        <LandingPassword
                            v-model="form.password"
                            placeholder="Enter new password"
                        />
                        <small class="text-red-500" v-if="errors.password">
                            {{ errors.password }}
                        </small>
                        <ul class="text-xs text-surface-400 space-y-1 mt-1">
                            <li :class="form.password.length >= 8 ? 'text-green-500' : ''">
                                <i class="pi mr-1" :class="form.password.length >= 8 ? 'pi-check' : 'pi-circle'" />
                                At least 8 characters
                            </li>
                            <li :class="/[A-Z]/.test(form.password) ? 'text-green-500' : ''">
                                <i class="pi mr-1" :class="/[A-Z]/.test(form.password) ? 'pi-check' : 'pi-circle'" />
                                At least one uppercase letter
                            </li>
                            <li :class="/[0-9]/.test(form.password) ? 'text-green-500' : ''">
                                <i class="pi mr-1" :class="/[0-9]/.test(form.password) ? 'pi-check' : 'pi-circle'" />
                                At least one number
                            </li>
                        </ul>
                    </div>

                    <!-- Confirm Password -->
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-surface-600 dark:text-surface-300">
                            Confirm Password
                        </label>
                        <LandingPassword
                            v-model="form.password_confirmation"
                            placeholder="Confirm your password"
                        />
                        <small class="text-red-500" v-if="errors.password_confirmation">
                            {{ errors.password_confirmation }}
                        </small>
                    </div>

                </div>

                <div class="space-y-6 mt-8">
                    <button
                        type="submit"
                        class="landing-button-primary w-full"
                        :disabled="loading || !form.token || !form.email"
                    >
                        {{ loading ? 'Setting up...' : 'Set Password' }}
                    </button>

                    <div class="text-center">
                        
                        <a href="/login"
                            class="text-sm text-surface-400 hover:text-surface-600 transition-colors"
                        >
                            Back to Login
                        </a>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>