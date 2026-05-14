<script setup>
import { ref } from 'vue';

const testimonials = ref([
    {
        name: 'Sarah Johnson',
        job: 'Marketing Director',
        quote: 'This platform has transformed how we handle our digital presence. The intuitive interface and powerful features have helped us increase our online engagement by 200% in just three months.',
        avatar: '/demo/images/avatar/avatar-square-f-1.jpg',
        id: 0
    },
    {
        name: 'Michael Chen',
        job: 'Tech Startup Founder',
        quote: 'As a startup founder, I needed a solution that was both cost-effective and scalable. This platform delivered exactly that, allowing us to focus on growth while maintaining a professional online presence.',
        avatar: '/demo/images/avatar/avatar-square-m-2.jpg',
        id: 1
    },
    {
        name: 'Emma Rodriguez',
        job: 'E-commerce Manager',
        quote: "The analytics and user tracking features are exceptional. We've been able to better understand our customers' behavior and optimize our website accordingly. Our conversion rate has improved significantly.",
        avatar: '/demo/images/avatar/avatar-square-f-2.jpg',
        id: 2
    }
]);

const selectedIndex = ref(0);
const isAnimating = ref(false);
const slideDirection = ref('');
const sliderPosition = ref(0);

const displayedTestimonials = ref([]);

const initializeCarousel = () => {
    const items = testimonials.value;
    const total = items.length;
    const current = selectedIndex.value;

    const prev3 = (current - 3 + total) % total;
    const prev2 = (current - 2 + total) % total;
    const prev1 = (current - 1 + total) % total;

    const next1 = (current + 1) % total;
    const next2 = (current + 2) % total;
    const next3 = (current + 3) % total;

    displayedTestimonials.value = [items[prev3], items[prev2], items[prev1], items[current], items[next1], items[next2], items[next3]];
};

initializeCarousel();

const handleTransitionEnd = () => {
    if (!isAnimating.value) return;

    initializeCarousel();

    sliderPosition.value = 0;
    isAnimating.value = false;
};

const nextTestimonial = () => {
    if (isAnimating.value) return;
    isAnimating.value = true;
    slideDirection.value = 'left';
    sliderPosition.value -= 60;

    selectedIndex.value = (selectedIndex.value + 1) % testimonials.value.length;
};

const previousTestimonial = () => {
    if (isAnimating.value) return;
    isAnimating.value = true;
    slideDirection.value = 'right';
    sliderPosition.value += 60;

    selectedIndex.value = (selectedIndex.value - 1 + testimonials.value.length) % testimonials.value.length;
};

const getTransform = (index) => {
    const baseTransform = 'translateX(-50%)';
    const offset = (index - 3) * 60;
    return `${baseTransform} translateX(${offset + sliderPosition.value}px)`;
};
</script>

<template>
    <div class="relative py-24 md:py-56">
        <SurfaceLine class="top-60 -left-60 xl:-left-32 md:w-[52vw]" />
        <SurfaceLine class="top-60 -right-60 xl:-right-32 md:w-[52vw] scale-x-[-1]" />
        <SurfaceLine class="bottom-64 -left-60 xl:-left-32 md:w-[52vw] scale-y-[-1]" />
        <SurfaceLine class="bottom-64 -right-60 xl:-right-32 md:w-[52vw] scale-x-[-1] scale-y-[-1]" />
        <div class="landing-container !max-w-[36rem]">
            <h2 class="mb-10 md:mb-24 text-3xl md:text-5xl font-medium text-center mx-auto">What Our Clients Say</h2>
            <Transition :name="'slide-' + slideDirection" mode="out-in">
                <div :key="testimonials[selectedIndex]?.id" class="relative w-full">
                    <p class="text-base md:text-xl text-surface-500 text-center mx-auto">{{ testimonials[selectedIndex]?.quote }}</p>
                    <div class="mt-6 flex flex-col items-center justify-center">
                        <div class="text-xl font-medium text-center">{{ testimonials[selectedIndex]?.name }}</div>
                        <div class="text-sm text-surface-600 text-center">{{ testimonials[selectedIndex]?.job }}</div>
                    </div>
                </div>
            </Transition>
            <div class="flex items-center justify-center mt-12 gap-4">
                <button
                    @click="previousTestimonial"
                    :disabled="isAnimating"
                    class="w-9 h-9 flex items-center justify-center rounded-full shadow-stroke bg-surface-0 dark:bg-surface-900 hover:opacity-50 transition-opacity duration-300 disabled:opacity-50 cursor-pointer"
                >
                    <i class="pi pi-chevron-left" />
                </button>
                <div class="relative w-[180px] h-20 overflow-hidden">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="relative w-full h-full flex items-center">
                            <div
                                v-for="(testimonial, index) in displayedTestimonials"
                                :key="testimonial.id + '-' + index"
                                class="absolute left-1/2 cursor-pointer transition-transform duration-500 ease-in-out"
                                :class="{ 'z-10': testimonial.id === selectedIndex }"
                                :style="{ transform: getTransform(index) }"
                                @transitionend="handleTransitionEnd()"
                                @click="testimonial.id !== selectedIndex && (index < 3 ? previousTestimonial() : nextTestimonial())"
                            >
                                <img
                                    :src="testimonial.avatar"
                                    class="w-12 h-12 rounded-full object-cover shadow-lg transition-all duration-500 ease-in-out"
                                    :class="[testimonial.id === selectedIndex ? 'scale-110 opacity-100' : 'scale-75 opacity-50']"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    @click="nextTestimonial"
                    :disabled="isAnimating"
                    class="w-9 h-9 flex items-center justify-center rounded-full shadow-stroke bg-surface-0 dark:bg-surface-900 hover:opacity-75 transition-opacity duration-300 disabled:opacity-50 cursor-pointer"
                >
                    <i class="pi pi-chevron-right" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: all 0.25s ease;
}

.slide-left-enter-from {
    opacity: 0;
    transform: translateX(40px);
}

.slide-left-leave-to {
    opacity: 0;
    transform: translateX(-40px);
}

.slide-right-enter-from {
    opacity: 0;
    transform: translateX(-40px);
}

.slide-right-leave-to {
    opacity: 0;
    transform: translateX(40px);
}
</style>
