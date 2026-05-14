<script setup>
import LandingInput from '@/components/landing/shared/LandingInput.vue'
import LandingPassword from '@/components/landing/shared/LandingPassword.vue'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
    errorMessage.value = ''

    if (!email.value || !password.value) {
        errorMessage.value = 'Please enter your email and password.'
        return
    }

    try {
        const result = await authStore.login(email.value, password.value)
        if (result.requires_otp) {
            router.push('/verify-otp')
        } else {
            router.push('/')
        }
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Login failed. Please try again.'
    }
}
</script>

<template>
    <div>
        <!-- Logo -->
        <div class="flex items-center justify-center mb-8">
            <img
                src="/images/logo-login.svg"
                alt="JS Travel Group"
                class="h-32 w-auto"
            />
        </div>

        <!--<h1 class="text-4xl md:text-5xl font-medium text-center mx-auto leading-[125%]">
            Welcome Back
        </h1>-->
        <p class="text-lg text-surface-500 leading-6 mt-4 text-center mx-auto">
            B2B Travel Portal — Sign in to continue
        </p>

        <form class="max-w-[35rem] mx-auto" @submit.prevent="handleLogin">
            <div class="space-y-4 mt-10">

                <!-- Error Message -->
                <div
                    v-if="errorMessage"
                    class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                >
                    {{ errorMessage }}
                </div>

                <LandingInput
                    v-model="email"
                    placeholder="Email Address"
                    type="email"
                />

                <LandingPassword
                    v-model="password"
                    placeholder="Password"
                />
            </div>

            <div class="space-y-6 mt-8">
                <button
                    type="submit"
                    class="landing-button-primary w-full"
                    :disabled="authStore.loading"
                >
                    {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
                </button>

                <p class="text-surface-500 text-center text-sm">
                    Having trouble? Contact your administrator.
                </p>
            </div>
        </form>
    </div>
</template>