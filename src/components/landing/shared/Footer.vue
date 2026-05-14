<script setup>
import Logo from '@/components/icons/Logo.vue';
import { ref } from 'vue';

const leftSide = ref([
    {
        label: 'Home',
        href: '/landing'
    },
    {
        label: 'Features',
        href: '/landing/features'
    },
    {
        label: 'Pricing',
        href: '/landing/pricing'
    }
]);
const rightSide = ref([
    {
        label: 'Contact',
        href: '/landing/contact'
    },
    {
        label: 'Login',
        href: '/auth/login'
    },
    {
        label: 'Register',
        href: '/auth/register'
    }
]);
const socialLinks = ref([
    {
        icon: 'pi pi-youtube',
        href: 'https://www.youtube.com'
    },
    {
        icon: 'pi pi-twitter',
        href: 'https://www.instagram.com'
    },
    {
        icon: 'pi pi-discord',
        href: 'https://www.linkedin.com'
    }
]);
const buttonClass = 'px-4 py-2 text-surface-500 hover:text-surface-950 dark:hover:text-surface-0 transition-all font-medium cursor-pointer';
</script>

<template>
    <div class="relative py-12">
        <SurfaceLine class="top-36 -left-72 2xl:-left-40 md:w-[48vw]" />
        <SurfaceLine class="top-36 -right-72 2xl:-right-40 md:w-[48vw] scale-x-[-1]" />
        <footer class="space-y-12">
            <div class="md:hidden space-y-8">
                <div class="p-2 w-fit mx-auto rounded-full border bg-surface-50 dark:bg-surface-950">
                    <div
                        class="flex items-center justify-center w-16 h-16 bg-surface-0 dark:bg-surface-900 rounded-full shadow-[0px_28px_8px_0px_rgba(44,54,87,0.00),0px_18px_7px_0px_rgba(44,54,87,0.01),0px_10px_6px_0px_rgba(44,54,87,0.02),0px_4px_4px_0px_rgba(44,54,87,0.03),0px_1px_2px_0px_rgba(44,54,87,0.04)]"
                    >
                        <Logo />
                    </div>
                </div>
                <div class="p-2 w-fit mx-auto rounded-full border bg-surface-50 dark:bg-surface-950">
                    <div
                        class="flex p-4 items-center justify-center gap-3.5 bg-surface-0 dark:bg-surface-900 rounded-full shadow-[0px_28px_8px_0px_rgba(44,54,87,0.00),0px_18px_7px_0px_rgba(44,54,87,0.01),0px_10px_6px_0px_rgba(44,54,87,0.02),0px_4px_4px_0px_rgba(44,54,87,0.03),0px_1px_2px_0px_rgba(44,54,87,0.04)]"
                    >
                        <template v-for="item in leftSide" :key="item.label">
                            <RouterLink :to="item.href">
                                <button :class="buttonClass">
                                    {{ item.label }}
                                </button>
                            </RouterLink>
                        </template>
                    </div>
                </div>
                <div class="p-2 w-fit mx-auto rounded-full border bg-surface-50 dark:bg-surface-950">
                    <div
                        class="flex p-4 items-center justify-center gap-3.5 bg-surface-0 dark:bg-surface-900 rounded-full shadow-[0px_28px_8px_0px_rgba(44,54,87,0.00),0px_18px_7px_0px_rgba(44,54,87,0.01),0px_10px_6px_0px_rgba(44,54,87,0.02),0px_4px_4px_0px_rgba(44,54,87,0.03),0px_1px_2px_0px_rgba(44,54,87,0.04)]"
                    >
                        <template v-for="item in rightSide" :key="item.label">
                            <RouterLink :to="item.href">
                                <button :class="buttonClass">
                                    {{ item.label }}
                                </button>
                            </RouterLink>
                        </template>
                    </div>
                </div>
            </div>
            <div class="w-fit mx-auto md:block hidden">
                <div class="rounded-full border p-2 bg-surface-50 dark:bg-surface-950">
                    <div
                        class="rounded-full flex items-center gap-3.5 p-6 bg-surface-0 dark:bg-surface-900 shadow-[0px_28px_8px_0px_rgba(44,54,87,0.00),_0px_18px_7px_0px_rgba(44,54,87,0.01),_0px_10px_6px_0px_rgba(44,54,87,0.02),_0px_4px_4px_0px_rgba(44,54,87,0.03),_0px_1px_2px_0px_rgba(44,54,87,0.04)]"
                    >
                        <template v-for="item in leftSide" :key="item.label">
                            <RouterLink :to="item.href">
                                <button :class="buttonClass">
                                    {{ item.label }}
                                </button>
                            </RouterLink>
                        </template>
                        <Logo class="mx-8" />
                        <template v-for="item in rightSide" :key="item.label">
                            <RouterLink :to="item.href">
                                <button :class="buttonClass">
                                    {{ item.label }}
                                </button>
                            </RouterLink>
                        </template>
                    </div>
                </div>
            </div>
            <div class="w-fit mx-auto">
                <div class="rounded-full border p-2 bg-surface-50 dark:bg-surface-950">
                    <div
                        class="rounded-full flex items-center gap-2 p-2 bg-surface-0 dark:bg-surface-900 shadow-[0px_28px_8px_0px_rgba(44,54,87,0.00),_0px_18px_7px_0px_rgba(44,54,87,0.01),_0px_10px_6px_0px_rgba(44,54,87,0.02),_0px_4px_4px_0px_rgba(44,54,87,0.03),_0px_1px_2px_0px_rgba(44,54,87,0.04)]"
                    >
                        <template v-for="item in socialLinks" :key="item.icon">
                            <RouterLink :to="item.href">
                                <button :class="buttonClass" class="!text-surface-950 dark:!text-surface-0 hover:!opacity-50">
                                    <i :class="item.icon" class="!leading-none" />
                                </button>
                            </RouterLink>
                        </template>
                    </div>
                </div>
            </div>
            <div class="w-fit mx-auto">
                <p class="text-surface-500">© {{ new Date().getFullYear() }} PrimeTek</p>
            </div>
        </footer>
    </div>
</template>
