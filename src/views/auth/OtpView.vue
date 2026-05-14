<script setup>
import LandingInput from '@/components/landing/shared/LandingInput.vue'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const otp = ref('')
const errorMessage = ref('')
const resendLoading = ref(false)
const resendSuccess = ref(false)

const handleVerify = async () => {
    errorMessage.value = ''

    if (!otp.value) {
        errorMessage.value = 'Please enter the OTP.'
        return
    }

    try {
        await authStore.verifyOtp(authStore.otpEmail, otp.value)
        router.push('/')
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Invalid OTP. Please try again.'
    }
}

const handleResend = async () => {
    resendLoading.value = true
    resendSuccess.value = false
    try {
        await authStore.resendOtp(authStore.otpEmail)
        resendSuccess.value = true
    } catch (error) {
        errorMessage.value = 'Failed to resend OTP. Please try again.'
    } finally {
        resendLoading.value = false
    }
}
</script>

<template>
    <div>
        <h1 class="text-5xl font-medium text-center mx-auto leading-[125%]">
            Verification
        </h1>
        <p class="text-lg text-surface-500 leading-6 mt-6 text-center mx-auto">
            We have sent a code to:
            <span class="font-medium text-primary-active">
                {{ authStore.otpEmail }}
            </span>
        </p>

        <form class="max-w-[35rem] mx-auto" @submit.prevent="handleVerify">
            <div class="space-y-4 mt-8">

                <!-- Error Message -->
                <div
                    v-if="errorMessage"
                    class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                >
                    {{ errorMessage }}
                </div>

                <!-- Success Message -->
                <div
                    v-if="resendSuccess"
                    class="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm"
                >
                    OTP resent successfully. Please check your email.
                </div>

                <!-- OTP Input -->
                <LandingInput
                    v-model="otp"
                    placeholder="Enter OTP"
                    type="text"
                />

            </div>

            <div class="space-y-8 mt-8">
                <div class="flex items-center gap-8">
                    <button
                        type="button"
                        class="landing-button-secondary w-full"
                        :disabled="resendLoading"
                        @click="handleResend"
                    >
                        {{ resendLoading ? 'Sending...' : 'Resend OTP' }}
                    </button>
                    <button
                        type="submit"
                        class="landing-button-primary w-full"
                        :disabled="authStore.loading"
                    >
                        {{ authStore.loading ? 'Verifying...' : 'Verify' }}
                    </button>
                </div>

                <div class="text-surface-500 text-center leading-6">
                    <a href="/login" class="text-primary-active font-medium hover:opacity-75 transition-all">
                        Back to Login
                    </a>
                </div>
            </div>
        </form>
    </div>
</template>