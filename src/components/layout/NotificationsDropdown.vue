<script setup>
import { useNotificationsStore } from '@/stores/notifications'
import { useRouter } from 'vue-router'

const notificationsStore = useNotificationsStore()
const router = useRouter()

const getIcon = (type) => ({
    'payment_request_submitted': 'pi-credit-card',
    'payment_request_reviewed':  'pi-credit-card',
    'credit_request_submitted':  'pi-wallet',
    'credit_request_reviewed':   'pi-wallet',
    'credit_limit_changed':      'pi-shield',
    'password_changed':          'pi-lock',
    'new_device_login':          'pi-desktop',
}[type] || 'pi-bell')

const getIconColor = (type, status) => {
    if (status === 'rejected') return 'text-red-500'
    if (status === 'approved') return 'text-green-500'
    if (type === 'password_changed' || type === 'new_device_login') return 'text-orange-500'
    return 'text-primary-500'
}

const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60)   return 'just now'
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
    return Math.floor(diff / 86400) + 'd ago'
}

const handleClick = (notification) => {
    notificationsStore.markAsRead(notification.id)
    if (notification.data?.action_url) {
        router.push(notification.data.action_url)
    }
}
</script>

<template>
    <div class="bg-surface-0 dark:bg-surface-950 rounded-2xl shadow-lg border border-surface-200 dark:border-surface-800 overflow-hidden w-80">

        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-800">
            <div class="flex items-center gap-2">
                <span class="font-semibold text-sm">Notifications</span>
                <span
                    v-if="notificationsStore.unreadCount > 0"
                    class="bg-primary-500 text-black text-xs font-bold px-2 py-0.5 rounded-full"
                >
                    {{ notificationsStore.unreadCount }}
                </span>
            </div>
            <Button
                v-if="notificationsStore.unreadCount > 0"
                label="Mark all read"
                text
                size="small"
                class="text-xs"
                @click="notificationsStore.markAllRead()"
            />
        </div>

        <!-- Loading -->
        <div v-if="notificationsStore.loading" class="flex justify-center py-8">
            <ProgressSpinner style="width: 24px; height: 24px" />
        </div>

        <!-- Empty -->
        <div
            v-else-if="notificationsStore.notifications.length === 0"
            class="flex flex-col items-center justify-center py-10 gap-2 text-surface-300"
        >
            <i class="pi pi-bell text-3xl" />
            <p class="text-sm">No notifications</p>
        </div>

        <!-- List -->
        <div v-else class="overflow-y-auto max-h-96">
            <div
                v-for="notification in notificationsStore.notifications"
                :key="notification.id"
                @click="handleClick(notification)"
                class="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-surface-100 dark:border-surface-800 last:border-0"
                :class="!notification.read_at
                    ? 'bg-primary-50 dark:bg-primary-900/10'
                    : 'hover:bg-surface-50 dark:hover:bg-surface-800'"
            >
                <!-- Icon -->
                <div class="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i
                        class="pi text-sm"
                        :class="[
                            getIcon(notification.data?.type),
                            getIconColor(notification.data?.type, notification.data?.status)
                        ]"
                    />
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-surface-900 dark:text-surface-0">
                        {{ notification.data?.title }}
                    </p>
                    <p class="text-xs text-surface-500 mt-0.5 leading-relaxed">
                        {{ notification.data?.message }}
                    </p>
                    <p class="text-xs text-surface-300 mt-1">
                        {{ formatTime(notification.created_at) }}
                    </p>
                </div>

                <!-- Unread dot -->
                <div
                    v-if="!notification.read_at"
                    class="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5"
                />
            </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-2 border-t border-surface-100 dark:border-surface-800">
            <p class="text-xs text-surface-400 text-center">
                Last updated {{ formatTime(new Date()) }}
            </p>
        </div>

    </div>
</template>