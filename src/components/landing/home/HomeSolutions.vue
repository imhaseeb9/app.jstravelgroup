<script setup>
import Analytics from '@/components/icons/Analytics.vue';
import ArCube from '@/components/icons/ArCube.vue';
import BezierCurves from '@/components/icons/BezierCurves.vue';
import { markRaw, ref } from 'vue';

const solutions = ref([
    {
        title: 'Automation Made Easy',
        description: 'Automate repetitive tasks, allowing your team to focus on strategic, high-impact activities. Our platform simplifies complex processes, boosting productivity effortlessly.',
        icon: markRaw(BezierCurves)
    },

    {
        title: 'Real-Time Analytics',
        description: 'Access powerful data insights instantly to make smarter, data-driven decisions. Stay ahead of the competition with up-to-the-minute reports and visual dashboards.',
        icon: markRaw(Analytics)
    },

    {
        title: 'Seamless Integration',
        description: 'Easily connect with your favorite tools and platforms to streamline your workflow. Our integrations ensure smooth data flow and minimize disruptions to your operations.',
        icon: markRaw(ArCube)
    }
]);
</script>
<template>
    <div class="relative pt-16 md:pt-32">
        <SurfaceLine class="-top-16 -left-16 2xl:left-0 md:w-[44vw] scale-y-[-1]" />
        <SurfaceLine class="-top-16 -right-16 2xl:right-0 md:w-[44vw] scale-x-[-1] scale-y-[-1]" />
        <div class="landing-container">
            <h2 class="text-3xl md:text-5xl font-medium text-center mx-auto !leading-[125%]">
                Optimize Your <br />
                Business with SaaS Solutions
            </h2>
            <p class="mt-6 text-base md:text-lg text-surface-500 max-w-md md:max-w-xl mx-auto text-center">Discover how our platform transforms your business by enhancing efficiency, reducing costs, and simplifying daily tasks.</p>
            <div class="mt-12 flex flex-col md:flex-row justify-center gap-6">
                <div v-for="(item, index) of solutions" :key="index" class="p-2 flex-1 md:max-w-[20rem] rounded-3xl bg-surface-50 dark:bg-surface-950 border">
                    <div
                        class="p-4 space-y-8 rounded-2xl bg-surface-0 dark:bg-surface-900 shadow-[0px_129.205px_36.493px_0px_rgba(44,54,87,0.00),_0px_82.849px_33.534px_0px_rgba(44,54,87,0.01),_0px_46.356px_27.616px_0px_rgba(44,54,87,0.05),_0px_20.712px_20.712px_0px_rgba(44,54,87,0.09),_0px_4.932px_11.836px_0px_rgba(44,54,87,0.10)]"
                    >
                        <div class="w-[4.5rem] h-[4.5rem] rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                            <component :is="item.icon" class="translate-y-1" />
                        </div>
                        <div>
                            <h5 class="text-lg font-medium">{{ item.title }}</h5>
                            <p class="text-surface-500 mt-2 leading-6">{{ item.description }}</p>
                        </div>
                        <a href="" class="flex items-center justify-between gap-2">
                            <span class="font-medium flex-1">Learn More </span>
                            <i class="pi pi-arrow-right" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
