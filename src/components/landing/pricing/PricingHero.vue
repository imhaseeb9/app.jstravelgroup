<script setup>
import { ref } from 'vue';

const pricingButtons = ref([
    {
        label: 'Monthly',
        value: 'monthly'
    },
    {
        label: 'Yearly',
        value: 'yearly'
    }
]);
const pricingPlans = ref([
    {
        name: 'Basic',
        price: {
            monthly: '24_',
            yearly: '380'
        },
        description: 'Get started with essential tools to boost your productivity.',
        features: ['Simple Budget Management', 'Fund Transfers', 'Limited Support']
    },
    {
        name: 'Pro',
        price: {
            monthly: '64_',
            yearly: '620'
        },
        description: 'Unlock advanced features designed for growing businesses.',
        features: ['Simple Budget Management', 'Fund Transfers', 'Limited Support', 'Real-Time Alerts']
    },
    {
        name: 'Premium',
        price: {
            monthly: '96_',
            yearly: '860'
        },
        description: 'Access the full suite of features for maximum efficiency and control.',
        features: ['Simple Budget Management', 'Fund Transfers', 'All Pro Features', 'Higher Transaction Limits', 'Advanced Investment Tools', 'Rewards Program']
    }
]);
const selectedPricingButton = ref(pricingButtons.value[0]);

const getDigits = (price) => {
    return price.toString().split('');
};

const isDigit = (digit) => {
    return digit !== '_';
};
</script>
<template>
    <SurfaceLine class="top-16 -left-36 2xl:left-0 md:w-[32vw]" />
    <SurfaceLine class="top-16 -right-36 2xl:right-0 md:w-[32vw] scale-x-[-1]" />
    <SurfaceLine class="-top-14 -left-20 2xl:left-0 md:w-[44vw] scale-y-[-1]" />
    <SurfaceLine class="-top-14 -right-20 2xl:right-0 md:w-[44vw] scale-x-[-1] scale-y-[-1]" />
    <div class="landing-container pt-56 pb-24">
        <CustomersBadge />
        <h1 class="text-4xl md:text-5xl lg:text-7xl font-medium text-center mx-auto !leading-[125%]">
            Get a plan and<br />
            increase your efficiency
        </h1>
        <p class="mt-6 text-center mx-auto text-base md:text-lg text-surface-500 max-w-md md:max-w-2xl">Optimize your workflow and boost productivity by choosing the right plan tailored to your business needs.</p>
        <div class="mt-8 w-fit mx-auto flex items-center gap-3.5 p-2 rounded-full border">
            <button
                v-for="button in pricingButtons"
                :key="button.value"
                @click="selectedPricingButton = button"
                class="px-4 py-2 rounded-full font-medium transition-all min-w-24 cursor-pointer"
                :class="[selectedPricingButton.value === button.value ? 'bg-surface-0 dark:bg-surface-900 text-surface-900 dark:text-surface-0 shadow-stroke' : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-0']"
            >
                {{ button.label }}
            </button>
        </div>
        <div class="mt-16 flex flex-col lg:flex-row gap-14 lg:gap-8 xl:gap-14 max-w-xl mx-auto lg:max-w-none">
            <template v-for="plan in pricingPlans" :key="plan.name">
                <div class="lg:flex-1 md:p-6 space-y-8">
                    <div class="w-fit">
                        <h4 class="font-medium px-4 py-2">{{ plan.name }}</h4>
                        <div class="flex items-center">
                            <span class="w-1 h-1 rounded-full bg-surface-200 dark:bg-surface-800" />
                            <span class="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
                            <span class="w-1 h-1 rounded-full bg-surface-200 dark:bg-surface-800" />
                        </div>
                    </div>
                    <div class="relative h-[72px]">
                        <div class="text-6xl font-medium absolute inset-0 flex items-center">
                            <span class="mr-1">$</span>
                            <template v-for="(digit, index) in getDigits(plan.price[selectedPricingButton.value])" :key="index">
                                <Transition name="price" :style="{ transitionDelay: `${index * 50}ms` }" mode="out-in">
                                    <span v-if="isDigit(digit)" :key="`${selectedPricingButton.value}-${digit}`" class="tabular-nums">{{ digit }}</span>
                                    <span v-else :key="`${selectedPricingButton.value}-${0}`" class="opacity-0 tabular-nums">0</span>
                                </Transition>
                            </template>
                        </div>
                    </div>
                    <p class="text-surface-500 text-lg">{{ plan.description }}</p>
                    <button class="landing-button-primary w-full rounded-xl">Get Started</button>
                    <div class="w-full h-px bg-surface-200 dark:bg-surface-800" />
                    <ul class="space-y-3">
                        <li v-for="feature in plan.features" :key="feature" class="flex items-center gap-3">
                            <i class="pi pi-check" />
                            <span class="text-lg">{{ feature }}</span>
                        </li>
                    </ul>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.price-enter-active,
.price-leave-active {
    transition: all 0.25s ease;
}

.price-enter-from {
    opacity: 0;
    transform: translateY(24px);
}

.price-leave-to {
    opacity: 0;
    transform: translateY(-24px);
}
</style>
