<script setup>
const props = defineProps({
    class: String
});
</script>

<template>
    <div :class="['flex items-center justify-between gap-4', props.class]">
        <slot />
    </div>
</template>
