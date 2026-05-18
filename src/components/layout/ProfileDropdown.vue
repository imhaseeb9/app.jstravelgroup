<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const buttonClass = 'w-full px-3 py-2 rounded-lg flex items-center gap-2 font-medium text-surface-500 hover:text-surface-950 dark:hover:text-surface-0 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150'
</script>

<template>
    <div
        class="z-30 p-2 space-y-1 rounded-2xl bg-surface-0 dark:bg-surface-950 shadow-[0px_129.205px_36.493px_0px_rgba(44,54,87,0.00),_0px_82.849px_33.534px_0px_rgba(44,54,87,0.01),_0px_46.356px_27.616px_0px_rgba(44,54,87,0.03),_0px_20.712px_20.712px_0px_rgba(44,54,87,0.05),_0px_4.932px_11.836px_0px_rgba(44,54,87,0.06)] dark:shadow-stroke"
    >
        <!-- User Info -->
        <div class="px-3 py-2 border-b border-surface-100 dark:border-surface-800 mb-1">
            <p class="font-semibold text-surface-900 dark:text-surface-0 text-sm">
                {{ authStore.user?.name }}
            </p>
            <p class="text-xs text-surface-400 capitalize">
                {{ authStore.user?.type?.replace('_', ' ') }}
            </p>
        </div>

        <!-- My Profile -->
        <button :class="buttonClass" @click="router.push('/profile')">
            <i class="pi pi-user" />
            <span>My Profile</span>
        </button>

        <!-- Log Out -->
        <button :class="buttonClass" @click="authStore.logout()">
            <i class="pi pi-sign-out text-red-500" />
            <span class="text-red-500">Log Out</span>
        </button>
    </div>
</template>