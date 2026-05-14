<script setup>
import BriteMank from '@/components/icons/customers/BriteMank.vue';
import Limerantz from '@/components/icons/customers/Limerantz.vue';
import Mistranet from '@/components/icons/customers/Mistranet.vue';
import Streamlinz from '@/components/icons/customers/Streamlinz.vue';
import Trimzales from '@/components/icons/customers/Trimzales.vue';
import Wavelength from '@/components/icons/customers/Wavelength.vue';
import ZenTrailMs from '@/components/icons/customers/ZenTrailMs.vue';

const customers = [
    {
        name: 'Mistranet',
        icon: Mistranet
    },
    {
        name: 'BriteMank',
        icon: BriteMank
    },
    {
        name: 'Limerantz',
        icon: Limerantz
    },
    {
        name: 'Streamlinz',
        icon: Streamlinz
    },
    {
        name: 'Trimzales',
        icon: Trimzales
    },
    {
        name: 'ZenTrailMs',
        icon: ZenTrailMs
    },
    {
        name: 'Wavelength',
        icon: Wavelength
    }
];

const props = defineProps({
    class: String
});
</script>

<template>
    <div :class="props.class" class="space-y-8">
        <div class="flex items-center gap-6 justify-center md:gap-12">
            <template v-for="customer in customers.slice(0, 4)" :key="customer.name">
                <div class="flex items-center justify-center gap-2 last:hidden md:last:flex">
                    <component :is="customer.icon" class="w-6 h-6 md:w-8 md:h-8" />
                    <span class="text-surface-500 text-sm md:text-xl font-medium">{{ customer.name }}</span>
                </div>
            </template>
        </div>
        <div class="hidden md:flex items-center w-full max-w-[36rem] mx-auto">
            <span class="w-1.5 h-1.5 rounded-full bg-surface-200 dark:bg-surface-800" />
            <span class="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
            <span class="w-1.5 h-1.5 rounded-full bg-surface-200 dark:bg-surface-800" />
        </div>
        <div class="flex items-center gap-6 justify-center md:gap-12">
            <template v-for="customer in customers.slice(4)" :key="customer.name">
                <div class="flex items-center justify-center gap-2 last:hidden md:last:flex">
                    <component :is="customer.icon" class="w-6 h-6 md:w-8 md:h-8" />
                    <span class="text-surface-500 text-sm md:text-xl font-medium">{{ customer.name }}</span>
                </div>
            </template>
        </div>
    </div>
</template>
