import api from '@/service/api'
import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
    state: () => ({
        notifications: [],
        unreadCount:   0,
        loading:       false,
        pollInterval:  null,
    }),

    actions: {
        async fetchUnreadCount() {
            try {
                const res = await api.get('/notifications/unread-count')
                this.unreadCount = res.data.data.count
            } catch {
                // silent fail
            }
        },

        async fetchNotifications() {
            this.loading = true
            try {
                const res = await api.get('/notifications', {
                    params: { per_page: 20 }
                })
                this.notifications = res.data.data.data || []
                this.unreadCount = this.notifications.filter(n => !n.read_at).length
            } catch {
                // silent fail
            } finally {
                this.loading = false
            }
        },

        async markAsRead(id) {
            try {
                await api.post(`/notifications/${id}/read`)
                const notification = this.notifications.find(n => n.id === id)
                if (notification) {
                    notification.read_at = new Date().toISOString()
                    this.unreadCount = Math.max(0, this.unreadCount - 1)
                }
            } catch {
                // silent fail
            }
        },

        async markAllRead() {
            try {
                await api.post('/notifications/read-all')
                this.notifications.forEach(n => {
                    n.read_at = new Date().toISOString()
                })
                this.unreadCount = 0
            } catch {
                // silent fail
            }
        },

        startPolling() {
            this.fetchUnreadCount()
            this.pollInterval = setInterval(() => {
                this.fetchUnreadCount()
            }, 30000) // every 30 seconds
        },

        stopPolling() {
            if (this.pollInterval) {
                clearInterval(this.pollInterval)
                this.pollInterval = null
            }
        }
    }
})