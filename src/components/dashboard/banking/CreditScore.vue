<script setup>
import { CustomCard } from '@/components/ui/custom-card';
import { Menu } from 'primevue';
import { computed, ref } from 'vue';

const maxRiskLevel = 4;
const maxRiskScore = 800;
const riskScore = ref(710);
const riskLevel = computed(() => {
    if (riskScore.value > maxRiskScore) return maxRiskLevel;
    return (riskScore.value / maxRiskScore) * maxRiskLevel;
});

const maxChartValue = ref(1500);
const chartData = ref([
    {
        title: 'Money In',
        value: 1000,
        class: 'bg-primary-active'
    },
    {
        title: 'Money Out',
        value: 500,
        class: 'bg-orange-500'
    },
    {
        title: 'Savings',
        value: 950,
        class: 'bg-yellow-400'
    },
    {
        title: 'Investments',
        value: 1200,
        class: 'bg-green-500'
    }
]);

const menu = ref();
const items = ref([
    {
        label: 'Options',
        items: [
            {
                label: 'Refresh',
                icon: 'pi pi-refresh'
            },
            {
                label: 'Export',
                icon: 'pi pi-upload'
            }
        ]
    }
]);

const toggle = (event) => {
    menu.value.toggle(event);
};
</script>
<template>
    <CustomCard class="col-span-12 xl:col-span-4 row-span-1">
        <CustomCard.Header>
            <CustomCard.Title>Credit Score</CustomCard.Title>
            <CustomCard.Action>
                <Button type="button" icon="pi pi-ellipsis-h" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" severity="secondary" text />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content class="p-4 flex flex-col">
            <div class="flex items-center gap-4">
                <div class="bg-primary-active w-12 h-12 flex items-center justify-center rounded-2xl shadow-[0px_-1px_1px_0px_rgba(0,0,0,0.04)_inset,0px_1px_1px_0px_rgba(0,0,0,0.04)_inset]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                        <g filter="url(#filter0_i_6308_222516)">
                            <path
                                d="M0 12.25C0 5.62258 5.37258 0.25 12 0.25C18.6274 0.25 24 5.62258 24 12.25C24 13.583 23.7827 14.8652 23.3815 16.0631C23.2247 15.9302 23.0216 15.85 22.8 15.85H12.5455L9.19793 9.4337C8.96801 8.99301 8.42437 8.82215 7.9837 9.05207C7.54301 9.28199 7.37215 9.82563 7.60207 10.2663L10.5154 15.85H1.2C0.978312 15.85 0.775344 15.9302 0.618492 16.0631C0.217332 14.8652 0 13.583 0 12.25Z"
                                fill="white"
                            />
                            <path d="M1.28075 17.65C3.25693 21.5651 7.31491 24.25 12 24.25C16.685 24.25 20.7431 21.5651 22.7192 17.65H1.28075Z" fill="white" />
                        </g>
                        <defs>
                            <filter id="filter0_i_6308_222516" x="0" y="0.25" width="24" height="25.2" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                <feOffset dy="1.2" />
                                <feGaussianBlur stdDeviation="0.6" />
                                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.36 0" />
                                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6308_222516" />
                            </filter>
                        </defs>
                    </svg>
                </div>
                <div class="flex-1">
                    <div class="text-xl font-medium">Your credit score is {{ riskScore }}</div>
                    <div class="mt-1 text-sm text-surface-500">Your score is in good condition.</div>
                </div>
            </div>
            <div class="mt-4">
                <div class="text-sm font-medium">Risk Level</div>
                <div class="my-2 relative h-6 w-full shadow-stroke bg-surface-50 dark:bg-surface-900 rounded-md">
                    <div
                        class="absolute rounded-[inherit] z-[1] inset-0 bg-[linear-gradient(90deg,#FF1212_0%,#FF6912_21.5%,#FFDF12_59.5%,#25E000_100%)]"
                        :style="{
                            clipPath: `polygon(0 0, ${riskLevel * 25}% 0, ${riskLevel * 25}% 100%, 0 100%)`
                        }"
                    />
                    <div
                        class="absolute top-1/2 -translate-y-1/2 -translate-x-2 z-[3] w-3 h-8 rounded bg-surface-0 dark:bg-surface-950 border shadow-[0px_9px_2px_0px_rgba(0,0,0,0.00),_0px_6px_2px_0px_rgba(0,0,0,0.01),_0px_3px_2px_0px_rgba(0,0,0,0.03),_0px_1px_1px_0px_rgba(0,0,0,0.05),_0px_0px_1px_0px_rgba(0,0,0,0.06)]"
                        :style="{
                            left: `${riskLevel * 25}%`
                        }"
                    />
                    <div class="px-1 absolute z-[2] inset-0 flex items-center justify-between">
                        <div
                            v-for="(_, i) of Array(4)"
                            :key="i"
                            class="w-4 h-4 bg-surface-0 dark:bg-surface-950 flex items-center justify-center rounded shadow-[0px_4px_1px_0px_rgba(0,0,0,0.00),_0px_3px_1px_0px_rgba(0,0,0,0.01),_0px_2px_1px_0px_rgba(0,0,0,0.02),_0px_1px_1px_0px_rgba(0,0,0,0.03),_0px_-1px_1px_0px_rgba(0,0,0,0.04)_inset,_0px_1px_1px_0px_rgba(0,0,0,0.04)_inset]"
                        >
                            <i class="pi !text-[11px] !leading-none" :class="i < riskLevel - 1 ? 'pi pi-check' : 'pi pi-minus'" />
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-between text-xs text-surface-500 [&_div]:w-4 [&_div]:relative [&_span]:absolute [&_span]:whitespace-nowrap">
                    <div>
                        <span class="left-0">Risky</span>
                    </div>
                    <div>
                        <span class="left-1/2 -translate-x-1/2">Low Risk</span>
                    </div>
                    <div>
                        <span class="left-1/2 -translate-x-1/2">Good</span>
                    </div>
                    <div>
                        <span class="right-0">Best</span>
                    </div>
                </div>
            </div>
            <div class="mt-8 flex-1">
                <div class="flex justify-between h-full">
                    <div v-for="(item, index) of chartData" :key="index" class="flex-1 flex flex-col h-full items-center">
                        <div class="min-h-32 h-full w-full max-w-10 bg-surface-50 dark:bg-surface-900 rounded-lg flex flex-col items-center justify-end">
                            <div class="group cursor-pointer relative w-full rounded-[inherit] hover:opacity-75 transition-opacity duration-150" :class="item.class" :style="{ height: `${(item.value / maxChartValue) * 100}%` }">
                                <span class="group-hover:opacity-100 opacity-0 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 -top-7 text-xs font-medium bg-surface-50 dark:bg-slate-900 border rounded-md px-1.5 py-0.5">{{
                                    item.value
                                }}</span>
                            </div>
                        </div>
                        <div class="text-xs font-medium mt-2">{{ item.title }}</div>
                    </div>
                </div>
            </div>
        </CustomCard.Content>
    </CustomCard>
</template>
