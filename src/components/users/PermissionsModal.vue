<script setup>
import { permissionGroups as allGroups } from '@/config/permissionGroups'
import api from '@/service/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'

const props = defineProps({
    visible: { type: Boolean, default: false },
    user:    { type: Object, default: null },
})

const emit = defineEmits(['update:visible', 'saved'])

const toast = useToast()
const authStore = useAuthStore()

const loading = ref(false)
const loadingPerms = ref(false)
const selectedPermissions = ref([])
const originalPermissions = ref([])

// ─── Dynamic permission groups ────────────────────
const availablePermissionGroups = computed(() => {
    return allGroups
        .map(group => ({
            ...group,
            permissions: group.permissions.filter(p =>
                authStore.hasPermission(p.name)
            )
        }))
        .filter(group => group.permissions.length > 0)
})

// ─── Load permissions when modal opens ───────────
watch(() => props.visible, async (val) => {
    if (val && props.user) {
        loadingPerms.value = true
        try {
            const res = await api.get(`/users/${props.user.id}/permissions`)
            const perms = res.data.data.permissions || []
            selectedPermissions.value = [...perms]
            originalPermissions.value = [...perms]
        } catch {
            toast.add({
                severity: 'error',
                summary:  'Error',
                detail:   'Failed to load permissions.',
                life:     3000
            })
        } finally {
            loadingPerms.value = false
        }
    }
})

// ─── Permission helpers ───────────────────────────
const hasPermission = (permName) =>
    selectedPermissions.value.includes(permName)

const togglePermission = (permName) => {
    const idx = selectedPermissions.value.indexOf(permName)
    if (idx > -1) {
        selectedPermissions.value.splice(idx, 1)
    } else {
        selectedPermissions.value.push(permName)
    }
}

const toggleGroup = (group) => {
    const groupPerms = group.permissions.map(p => p.name)
    const allSelected = groupPerms.every(p =>
        selectedPermissions.value.includes(p)
    )
    if (allSelected) {
        selectedPermissions.value = selectedPermissions.value.filter(
            p => !groupPerms.includes(p)
        )
    } else {
        groupPerms.forEach(p => {
            if (!selectedPermissions.value.includes(p)) {
                selectedPermissions.value.push(p)
            }
        })
    }
}

const isGroupFullySelected = (group) =>
    group.permissions.every(p =>
        selectedPermissions.value.includes(p.name)
    )

const isGroupPartiallySelected = (group) => {
    const groupPerms = group.permissions.map(p => p.name)
    const selected = groupPerms.filter(p =>
        selectedPermissions.value.includes(p)
    )
    return selected.length > 0 && selected.length < groupPerms.length
}

const selectAll = () => {
    const all = []
    availablePermissionGroups.value.forEach(group => {
        group.permissions.forEach(p => {
            if (!all.includes(p.name)) all.push(p.name)
        })
    })
    selectedPermissions.value = all
}

const clearAll = () => {
    selectedPermissions.value = []
}

// ─── Save permissions ─────────────────────────────
const handleSave = async () => {
    loading.value = true
    try {
        // Find permissions to revoke
        const toRevoke = originalPermissions.value.filter(
            p => !selectedPermissions.value.includes(p)
        )

        // Find permissions to add
        const toAdd = selectedPermissions.value.filter(
            p => !originalPermissions.value.includes(p)
        )

        // Revoke removed
        if (toRevoke.length > 0) {
            await api.delete(`/users/${props.user.id}/permissions`, {
                data: { permissions: toRevoke }
            })
        }

        // Assign new
        if (toAdd.length > 0) {
            await api.post(`/users/${props.user.id}/permissions`, {
                permissions: toAdd
            })
        }

        toast.add({
            severity: 'success',
            summary:  'Permissions Updated',
            detail:   `Permissions updated for ${props.user.name}.`,
            life:     3000
        })

        emit('saved')
        emit('update:visible', false)

    } catch (error) {
        toast.add({
            severity: 'error',
            summary:  'Error',
            detail:   error.response?.data?.message || 'Failed to update permissions.',
            life:     3000
        })
    } finally {
        loading.value = false
    }
}

const closeModal = () => {
    emit('update:visible', false)
}
</script>

<template>
    <Dialog
        :visible="visible"
        @update:visible="emit('update:visible', $event)"
        :header="`Permissions — ${user?.name}`"
        :style="{ width: '800px' }"
        :maximizable="true"
        modal
        :draggable="false"
    >
        <!-- Loading -->
        <div v-if="loadingPerms" class="flex items-center justify-center py-16">
            <ProgressSpinner style="width: 40px; height: 40px" />
        </div>

        <div v-else>
            <!-- Header info -->
            <div class="flex items-center justify-between mb-4">
                <p class="text-surface-500 text-sm">
                    {{ selectedPermissions.length }} permission(s) selected.
                    You can only assign permissions you have yourself.
                </p>
                <div class="flex gap-2">
                    <Button
                        label="Select All"
                        size="small"
                        severity="secondary"
                        outlined
                        @click="selectAll"
                    />
                    <Button
                        label="Clear All"
                        size="small"
                        severity="secondary"
                        outlined
                        @click="clearAll"
                    />
                </div>
            </div>

            <Divider class="mt-0" />

            <!-- No permissions -->
            <div
                v-if="availablePermissionGroups.length === 0"
                class="flex items-center gap-3 text-surface-400 py-6"
            >
                <i class="pi pi-lock text-xl" />
                <span class="text-sm">
                    You don't have any assignable permissions.
                </span>
            </div>

            <!-- Permission Groups -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    v-for="group in availablePermissionGroups"
                    :key="group.label"
                    class="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden"
                >
                    <!-- Group Header -->
                    <div
                        class="flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-surface-800 cursor-pointer select-none"
                        @click="toggleGroup(group)"
                    >
                        <div class="flex items-center gap-2">
                            <Checkbox
                                :modelValue="isGroupFullySelected(group)"
                                :indeterminate="isGroupPartiallySelected(group)"
                                binary
                                readonly
                            />
                            <span class="font-semibold text-sm">{{ group.label }}</span>
                        </div>
                        <span class="text-xs text-surface-400">
                            {{ group.permissions.filter(p => hasPermission(p.name)).length }}/{{ group.permissions.length }}
                        </span>
                    </div>

                    <!-- Permissions List -->
                    <div class="p-3 grid grid-cols-1 gap-1">
                        <div
                            v-for="perm in group.permissions"
                            :key="perm.name"
                            class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer select-none"
                            @click="togglePermission(perm.name)"
                        >
                            <Checkbox
                                :modelValue="hasPermission(perm.name)"
                                binary
                                readonly
                            />
                            <span class="text-sm text-surface-700 dark:text-surface-300">
                                {{ perm.label }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <template #footer>
            <Button
                label="Cancel"
                severity="secondary"
                outlined
                @click="closeModal"
            />
            <Button
                label="Save Permissions"
                icon="pi pi-check"
                :loading="loading"
                @click="handleSave"
            />
        </template>
    </Dialog>
</template>