<script setup>
import api from '@/service/api'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'

const toast = useToast()
const confirm = useConfirm()
const authStore = useAuthStore()

const sessions = ref([])
const loading = ref(false)
const revokeLoading = ref(null)

const fetchSessions = async () => {
    loading.value = true
    try {
        const res = await api.get('/auth/sessions')
        sessions.value = res.data.data || []
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load sessions.', life: 3000 })
    } finally {
        loading.value = false
    }
}

const revokeSession = async (session) => {
    revokeLoading.value = session.id
    try {
        await api.delete(`/auth/sessions/${session.id}`)
        toast.add({ severity: 'success', summary: 'Revoked', detail: 'Session revoked.', life: 3000 })
        fetchSessions()
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to revoke session.', life: 3000 })
    } finally {
        revokeLoading.value = null
    }
}

const revokeOthers = () => {
    confirm.require({
        message: 'Revoke all other active sessions?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        acceptProps: { label: 'Revoke All', severity: 'danger' },
        rejectProps: { label: 'Cancel', severity: 'secondary', outlined: true },
        accept: async () => {
            try {
                await api.post('/auth/sessions/revoke-others')
                toast.add({ severity: 'success', summary: 'Done', detail: 'All other sessions revoked.', life: 3000 })
                fetchSessions()
            } catch {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed.', life: 3000 })
            }
        }
    })
}

const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-PK', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

onMounted(() => fetchSessions())
</script>

<template>
    <div class="card mt-4">
        <ConfirmDialog />

        <div class="flex items-center justify-between mb-6">
            <div>
                <div class="font-semibold text-xl">Active Sessions</div>
                <p class="text-surface-500 text-sm mt-1">
                    Manage your active devices and sessions
                </p>
            </div>
            <Button
                label="Revoke All Others"
                icon="pi pi-sign-out"
                severity="danger"
                outlined
                size="small"
                @click="revokeOthers"
            />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-8">
            <ProgressSpinner style="width: 30px; height: 30px" />
        </div>

        <!-- Sessions List -->
        <div v-else class="flex flex-col gap-3">
            <div
                v-for="session in sessions"
                :key="session.id"
                class="flex items-center justify-between p-4 rounded-xl border"
                :class="session.is_current
                    ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-700'"
            >
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                        <i class="pi pi-desktop text-surface-500" />
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-medium text-sm text-surface-900 dark:text-surface-0">
                                {{ session.device_name || 'Unknown Device' }}
                            </span>
                            <Tag
                                v-if="session.is_current"
                                value="Current"
                                severity="success"
                                class="text-xs"
                            />
                        </div>
                        <p class="text-surface-400 text-xs mt-0.5" v-if="session.ip_address">
                            <i class="pi pi-map-marker mr-1" />
                            {{ session.ip_address }}
                        </p>
                        <p class="text-surface-400 text-xs">
                            Last used: {{ formatDate(session.last_used_at) }}
                        </p>
                        <p class="text-surface-400 text-xs">
                            Expires: {{ formatDate(session.expires_at) }}
                        </p>
                    </div>
                </div>

                <Button
                    v-if="!session.is_current"
                    icon="pi pi-times"
                    severity="danger"
                    text
                    rounded
                    v-tooltip.top="'Revoke Session'"
                    :loading="revokeLoading === session.id"
                    @click="revokeSession(session)"
                />
            </div>
        </div>
    </div>
</template>