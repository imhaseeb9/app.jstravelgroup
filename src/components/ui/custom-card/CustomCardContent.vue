<script setup>
const props = defineProps({
    class: String
});
</script>

<template>
    <div :class="['flex-1 overflow-auto', props.class]">
        <slot />
    </div>
</template>
