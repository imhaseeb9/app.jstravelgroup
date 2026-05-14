<script setup>
const props = defineProps({
    class: String
});
</script>

<template>
    <h3 :class="['text-lg font-medium', props.class]">
        <slot />
    </h3>
</template>
