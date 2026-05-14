<script setup>
defineProps({
    count: {
        type: Number,
        default: 8
    }
});
</script>

<template>
    <div v-for="i in count" :key="i" class="absolute inset-0 rounded-3xl border animate-pulse-border opacity-0" :style="{ animationDelay: `${i * 0.2}s` }" />
</template>

<style scoped>
@keyframes pulse-border {
    0% {
        inset: 0px;
        opacity: 0;
        border-radius: 16px;
    }
    5% {
        opacity: 0.5;
        border-radius: 20px;
    }
    10% {
        opacity: 1;
    }
    30% {
        inset: -14px;
        opacity: 1;
        border-radius: 30px;
    }
    31% {
        inset: -14px;
        opacity: 0.8;
        border-radius: 30px;
    }
    100% {
        inset: -14px;
        opacity: 0.25;
        border-radius: 30px;
    }
}

.animate-pulse-border {
    animation: pulse-border 2.25s infinite ease-out;
}
</style>
