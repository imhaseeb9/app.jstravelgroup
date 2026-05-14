<script setup>
import Logo from '@/components/icons/Logo.vue';
import { onMounted, onUnmounted, ref } from 'vue';

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

const buttonClass = 'px-4 py-2 text-surface-500 hover:text-surface-950 dark:hover:text-surface-0 transition-all font-medium cursor-pointer';

const isMobileMenuOpen = ref(false);
const mobileNavbarRef = ref(null);

const handleClickOutside = (event) => {
    if (mobileNavbarRef.value && !mobileNavbarRef.value.contains(event.target)) {
        isMobileMenuOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div class="lg:block hidden fixed top-6 left-1/2 -translate-x-1/2 z-50 w-fit">
        <div class="rounded-full lg:block hidden border p-2 bg-surface-50 dark:bg-surface-950">
            <nav
                class="rounded-full flex items-center gap-3.5 p-6 bg-surface-0 dark:bg-surface-900 shadow-[0px_28px_8px_0px_rgba(44,54,87,0.00),_0px_18px_7px_0px_rgba(44,54,87,0.01),_0px_10px_6px_0px_rgba(44,54,87,0.02),_0px_4px_4px_0px_rgba(44,54,87,0.03),_0px_1px_2px_0px_rgba(44,54,87,0.04)]"
            >
                <template v-for="item in leftSide" :key="item.label">
                    <RouterLink :to="item.href">
                        <button :class="buttonClass">
                            {{ item.label }}
                        </button>
                    </RouterLink>
                </template>
                <RouterLink to="/landing">
                    <Logo class="mx-8" />
                </RouterLink>
                <template v-for="item in rightSide" :key="item.label">
                    <RouterLink :to="item.href">
                        <button :class="buttonClass">
                            {{ item.label }}
                        </button>
                    </RouterLink>
                </template>
            </nav>
        </div>
    </div>
    <div ref="mobileNavbarRef" class="lg:hidden fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full transition-[max-width] duration-300" :class="isMobileMenuOpen ? 'max-w-[20rem] md:max-w-[24rem]' : 'max-w-[12rem]'">
        <div class="lg:hidden rounded-[2.5rem] border p-2 bg-surface-50 dark:bg-surface-950">
            <nav
                class="w-full rounded-[2rem] p-4 bg-surface-0 dark:bg-surface-900 shadow-[0px_28px_8px_0px_rgba(44,54,87,0.00),_0px_18px_7px_0px_rgba(44,54,87,0.01),_0px_10px_6px_0px_rgba(44,54,87,0.02),_0px_4px_4px_0px_rgba(44,54,87,0.03),_0px_1px_2px_0px_rgba(44,54,87,0.04)]"
            >
                <div class="flex items-center justify-between gap-3.5">
                    <RouterLink to="/landing">
                        <div class="flex items-center gap-2">
                            <Logo />
                            <Transition name="fade">
                                <span v-show="isMobileMenuOpen" class="font-semibold">AVALON</span>
                            </Transition>
                        </div>
                    </RouterLink>
                    <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
                        <i class="pi pi-bars !leading-none" />
                    </button>
                </div>
                <div class="transition-[max-height,opacity,margin] duration-300 overflow-hidden" :class="isMobileMenuOpen ? 'max-h-80' : 'max-h-0 opacity-40 pointer-events-none'">
                    <div class="h-80 pt-4 flex flex-col gap-4">
                        <template v-for="item in leftSide" :key="item.label">
                            <RouterLink :to="item.href">
                                <button class="py-2 text-surface-500 hover:text-surface-950 dark:hover:text-surface-0 transition-all font-medium">
                                    {{ item.label }}
                                </button>
                            </RouterLink>
                        </template>
                        <template v-for="item in rightSide" :key="item.label">
                            <RouterLink :to="item.href">
                                <button class="py-2 text-surface-500 hover:text-surface-950 dark:hover:text-surface-0 transition-all font-medium">
                                    {{ item.label }}
                                </button>
                            </RouterLink>
                        </template>
                    </div>
                </div>
            </nav>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.3s ease,
        max-width 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    max-width: 0;
}
</style>
