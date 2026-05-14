<script setup>
const props = defineProps({
    class: String
});
</script>

<template>
    <div :class="['max-h-14 pl-5 pr-3 py-3 flex items-center justify-between gap-2 border-b', props.class]">
        <slot />
    </div>
</template>
