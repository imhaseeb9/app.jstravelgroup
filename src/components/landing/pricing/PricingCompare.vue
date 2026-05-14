<script setup>
import { ref } from 'vue';
const features = ref(['3 Active Members', 'Up to 10 Components', 'High Request Limits', 'Unlimited Access', 'Advanced Analytics', 'Data Export', 'Prioritized Support', 'Real-time Updates', 'Batch Requests', 'Webhooks']);

const plans = ref([
    {
        name: 'Basic',
        features: ['$24', 'Unlimited', '10', '15', '__yes__', '__yes__', '__no__', '__no__', '__no__', '__no__']
    },
    {
        name: 'Pro',
        features: ['$64', 'Unlimited', '10', '15', '__yes__', '__yes__', '__yes__', '__no__', '__no__', '__no__']
    },
    {
        name: 'Premium',
        features: ['$96', 'Unlimited', '10', '15', '__yes__', '__yes__', '__yes__', '__yes__', '__yes__', '__yes__']
    }
]);
</script>
<template>
    <div class="landing-container pt-6 md:pt-24 md:pb-56">
        <div class="hidden lg:flex gap-4">
            <div class="flex-[calc(1-(0.23*3))] p-2 rounded-[1.75rem] bg-surface-50 dark:bg-surface-950 border">
                <div
                    class="flex flex-col divide-y divide-surface-200 dark:divide-surface-800 rounded-3xl bg-surface-0 dark:bg-surface-900 shadow-[0px_129.205px_36.493px_0px_rgba(44,54,87,0.00),_0px_82.849px_33.534px_0px_rgba(44,54,87,0.01),_0px_46.356px_27.616px_0px_rgba(44,54,87,0.05),_0px_20.712px_20.712px_0px_rgba(44,54,87,0.09),_0px_4.932px_11.836px_0px_rgba(44,54,87,0.10)]"
                >
                    <div class="flex-1 px-6 py-4 text-lg font-medium text-primary-active">Plan</div>
                    <div v-for="(item, index) of features" :key="index" class="flex-1 px-6 py-4">
                        <h3 class="text-lg font-medium">{{ item }}</h3>
                    </div>
                </div>
            </div>
            <div v-for="plan in plans" :key="plan.name" class="flex-[0.23] p-2 rounded-[1.75rem] bg-surface-50 dark:bg-surface-950 border">
                <div
                    class="flex flex-col h-full divide-y divide-surface-200 dark:divide-surface-800 rounded-3xl bg-surface-0 dark:bg-surface-900 shadow-[0px_129.205px_36.493px_0px_rgba(44,54,87,0.00),_0px_82.849px_33.534px_0px_rgba(44,54,87,0.01),_0px_46.356px_27.616px_0px_rgba(44,54,87,0.05),_0px_20.712px_20.712px_0px_rgba(44,54,87,0.09),_0px_4.932px_11.836px_0px_rgba(44,54,87,0.10)]"
                >
                    <div class="flex-1 px-6 py-4 text-lg font-medium text-primary-active text-center">{{ plan.name }}</div>
                    <div v-for="(item, index) of plan.features" :key="index" class="flex-1 px-6 py-4 text-center">
                        <i v-if="item === '__yes__'" class="pi pi-check" />
                        <i v-else-if="item === '__no__'" class="pi pi-minus opacity-50 !text-sm" />
                        <p v-else class="text-lg">{{ item }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="lg:hidden flex flex-col">
            <template v-for="(item, index) of features" :key="index">
                <div class="p-2 rounded-full border bg-surface-50 dark:bg-surface-900">
                    <div
                        class="px-6 py-4 bg-surface-0 dark:bg-surface-950 rounded-full shadow-[0px_129.205px_36.493px_0px_rgba(44,54,87,0.00),_0px_82.849px_33.534px_0px_rgba(44,54,87,0.01),_0px_46.356px_27.616px_0px_rgba(44,54,87,0.05),_0px_20.712px_20.712px_0px_rgba(44,54,87,0.09),_0px_4.932px_11.836px_0px_rgba(44,54,87,0.10)]"
                    >
                        <h4 class="text-lg font-medium">{{ item }}</h4>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <div v-for="plan in plans" :key="plan.name" class="flex-1 px-6 py-4 text-lg text-center">{{ plan.name }}</div>
                </div>
                <div class="h-px w-full bg-surface-200 dark:bg-surface-800" />
                <div class="flex items-center justify-between">
                    <div v-for="(_, j) in Array(plans.length).fill(null)" :key="j" class="flex-1 px-6 py-4 text-lg text-center">
                        <i v-if="plans[j].features[index] === '__yes__'" class="pi pi-check" />
                        <i v-else-if="plans[j].features[index] === '__no__'" class="pi pi-minus opacity-50 !text-sm" />
                        <p v-else class="text-lg">{{ plans[j].features[index] }}</p>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>
