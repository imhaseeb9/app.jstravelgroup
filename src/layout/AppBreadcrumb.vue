<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
    <div class="max-h-16 py-4 pr-4 pl-6 flex items-center gap-2 border-b">
        <span><i class="pi pi-home text-surface-400 !leading-none" /></span>
        <template v-for="(item, index) in route.meta.breadcrumb" :key="item">
            <div class="flex items-center gap-2" :class="index < route.meta.breadcrumb.length - 1 ? 'text-surface-400 font-normal' : 'text-surface-950 dark:text-surface-0 font-medium'">
                <span class="leading-none">
                    {{ item }}
                </span>
                <span><i v-if="index < route.meta.breadcrumb.length - 1" class="pi pi-chevron-right !text-xs !leading-none" /></span>
            </div>
        </template>
    </div>
</template>
