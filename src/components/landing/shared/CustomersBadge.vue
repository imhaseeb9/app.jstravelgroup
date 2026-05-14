<script setup>
import { ref } from 'vue';
defineProps({
    showLabel: {
        type: Boolean,
        default: true
    }
});
const customers = ref([
    {
        avatar: '/demo/images/avatar/avatar-m-1.png'
    },
    {
        avatar: '/demo/images/avatar/avatar-f-1.png'
    },
    {
        avatar: '/demo/images/avatar/avatar-m-2.png'
    },
    {
        avatar: '/demo/images/avatar/avatar-f-2.png'
    },
    {
        avatar: '/demo/images/avatar/avatar-m-3.png'
    },
    {
        avatar: '/demo/images/avatar/avatar-f-5.png'
    },
    {
        avatar: '/demo/images/avatar/avatar-m-4.png'
    },
    {
        avatar: '/demo/images/avatar/avatar-f-4.png'
    }
]);
</script>
<template>
    <div :class="showLabel ? 'pr-3' : ''" class="p-1 mb-2 w-fit mx-auto rounded-full flex items-center gap-2 border">
        <div class="flex items-center -space-x-2">
            <template v-for="(item, index) of customers" :key="index">
                <span class="rounded-full overflow-hidden w-6 h-6 border border-surface-50 dark:border-surface-800">
                    <img :src="item.avatar" class="w-full h-full object-cover" />
                </span>
            </template>
        </div>
        <span class="w-px h-3 bg-surface-200 dark:bg-surface-800" v-if="showLabel" />
        <span class="text-sm text-surface-500" v-if="showLabel">Happy Customers</span>
    </div>
</template>
