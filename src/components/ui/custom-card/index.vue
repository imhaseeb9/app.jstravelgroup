<script setup>
const props = defineProps({
    class: String
});
</script>

<template>
    <div :class="['shadow-stroke rounded-2xl flex flex-col overflow-hidden', props.class]">
        <slot />
    </div>
</template>
