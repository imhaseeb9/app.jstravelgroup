<script setup>
import AnimatedBorder from '../shared/AnimatedBorder.vue';
import CustomersBadge from '../shared/CustomersBadge.vue';
import CustomersGrid from '../shared/CustomersGrid.vue';
</script>
<template>
    <div class="overflow-hidden">
        <SurfaceLine class="top-16 -left-36 2xl:left-0 md:w-[32vw]" />
        <SurfaceLine class="top-16 -right-36 2xl:right-0 md:w-[32vw] scale-x-[-1]" />
        <SurfaceLine class="-top-14 -left-20 2xl:left-0 md:w-[42vw] scale-y-[-1]" />
        <SurfaceLine class="-top-14 -right-20 2xl:right-0 md:w-[42vw] scale-x-[-1] scale-y-[-1]" />
        <SurfaceLine class="top-[410px] -left-36 2xl:left-0 md:w-[42vw] scale-y-[0.5]" />
        <SurfaceLine class="top-[410px] -right-36 2xl:right-0 md:w-[42vw] scale-y-[0.5] scale-x-[-1]" />
        <div class="landing-container pt-56">
            <CustomersBadge />
            <h1 class="text-4xl md:text-7xl font-medium text-center mx-auto !leading-[125%]">
                Boost Productivity<br />
                with Our Powerful Features
            </h1>
            <p class="mt-6 text-center mx-auto text-base md:text-lg text-surface-500 max-w-lg md:max-w-2xl">Discover the tools designed to streamline your workflow and boost efficiency across all your business operations.</p>

            <div class="px-2 mt-16 mb-20">
                <div class="w-full relative rounded-3xl bg-surface-50 dark:bg-surface-900">
                    <AnimatedBorder />
                    <img
                        class="block dark:hidden w-full h-full object-cover rounded-2xl shadow-[0px_129.205px_36.493px_0px_rgba(44,54,87,0.00),_0px_82.849px_33.534px_0px_rgba(44,54,87,0.01),_0px_46.356px_27.616px_0px_rgba(44,54,87,0.05),_0px_20.712px_20.712px_0px_rgba(44,54,87,0.09),_0px_4.932px_11.836px_0px_rgba(44,54,87,0.10)]"
                        src="/demo/images/landing/features-hero-dashboard.png"
                        alt="Hero Image"
                    />
                    <img
                        class="dark:block hidden w-full h-full object-cover rounded-2xl shadow-[0px_129.205px_36.493px_0px_rgba(44,54,87,0.00),_0px_82.849px_33.534px_0px_rgba(44,54,87,0.01),_0px_46.356px_27.616px_0px_rgba(44,54,87,0.05),_0px_20.712px_20.712px_0px_rgba(44,54,87,0.09),_0px_4.932px_11.836px_0px_rgba(44,54,87,0.10)]"
                        src="/demo/images/landing/features-hero-dashboard-dark.png"
                        alt="Hero Image"
                    />
                </div>
            </div>
            <CustomersGrid />
        </div>
    </div>
</template>
