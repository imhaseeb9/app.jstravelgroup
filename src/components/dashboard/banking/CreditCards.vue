<script setup>
import CopyIcon from '@/components/icons/CopyIcon.vue';
import PlaceholderStarIcon from '@/components/icons/PlaceholderStarIcon.vue';
import CreditCard from '@/components/ui/credit-card.vue';
import { CustomCard } from '@/components/ui/custom-card';
import { useLayout } from '@/layout/composables/layout';
import { formatCurrency } from '@/utils';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import SelectButton from 'primevue/selectbutton';
import { computed, ref } from 'vue';

const { isDarkTheme } = useLayout();
const spendLimit = ref(72000.0);
const spent = ref(59611.0);
const remaining = computed(() => spendLimit.value - spent.value);
const selectedTime = ref({ name: 'Daily', value: 'day' });
const options = ref([
    { name: 'Daily', value: 'day' },
    { name: 'Weekly', value: 'week' },
    { name: 'Monthly', value: 'month' }
]);
const transactions = ref([
    {
        id: 1,
        date: 'May 29th, 2024',
        amount: 15,
        spent: true,
        currency: 'USD',
        product: 'Open AI',
        productImage: '/demo/images/logo/openai-logo.png',
        darkProductImage: '/demo/images/logo/openai-logo-dark.png'
    },
    {
        id: 2,
        date: 'May 22th, 2024',
        amount: 8,
        spent: true,
        currency: 'USD',
        product: 'Adobe',
        productImage: '/demo/images/logo/adobe-logo.png'
    },
    {
        id: 3,
        date: 'May 16th, 2024',
        amount: 19,
        spent: true,
        currency: 'USD',
        product: 'Framer',
        productImage: '/demo/images/logo/framer-logo.png',
        darkProductImage: '/demo/images/logo/framer-logo-dark.png'
    },
    {
        id: 4,
        date: 'May 7th, 2024',
        amount: 24,
        spent: true,
        currency: 'USD',
        product: 'Spotify',
        productImage: '/demo/images/logo/spotify-logo.png'
    }
]);
const cards = ref([
    {
        cardNumber: '7203',
        cardHolderName: 'Robert Jonas',
        color: ['orange-500', 'orange-600']
    },
    {
        cardNumber: '5268',
        cardHolderName: 'Aaron Swartz',
        color: ['primary-500', 'primary-active']
    },
    {
        cardNumber: '4165',
        cardHolderName: 'John Doe',
        color: ['green-500', 'green-600']
    }
]);

const selectedCard = ref(1);

const cardPositions = computed(() => {
    const totalCards = cards.value.length;

    return cards.value.map((card, index) => {
        if (isStopTransition.value) {
            return {
                ...card,
                position: 'center',
                zIndex: index === selectedCard.value ? 10 : 5,
                scale: 1,
                opacity: index === selectedCard.value ? 1 : isStopOpacity.value ? 0 : 1
            };
        }

        if (index === selectedCard.value) {
            return {
                ...card,
                position: 'center',
                zIndex: 10,
                scale: 1,
                opacity: 1
            };
        } else {
            let relativePosition = index - selectedCard.value;

            if (relativePosition < 0) {
                relativePosition = totalCards + relativePosition;
            }

            const halfCount = Math.floor(totalCards / 2);
            const isRight = relativePosition <= halfCount;

            const distance = isRight ? relativePosition : totalCards - relativePosition;

            return {
                ...card,
                position: isRight ? 'right' : 'left',
                zIndex: 5 - distance,
                scale: 0.9 - distance * 0.1,
                opacity: 1
            };
        }
    });
});
const isStopTransition = ref(false);
const isStopOpacity = ref(false);
const startTransition = () => {
    isStopTransition.value = true;
    setTimeout(() => {
        isStopTransition.value = false;
        isStopOpacity.value = false;
    }, 1000);
};
const nextCard = () => {
    startTransition();
    isStopOpacity.value = false;
    setTimeout(() => {
        isStopOpacity.value = true;
        selectedCard.value = (selectedCard.value + 1) % cards.value.length;
    }, 500);
};

const previousCard = () => {
    startTransition();
    isStopOpacity.value = false;
    setTimeout(() => {
        isStopOpacity.value = true;
        selectedCard.value = (selectedCard.value - 1 + cards.value.length) % cards.value.length;
    }, 500);
};
</script>
<template>
    <CustomCard class="col-span-12 xl:col-span-4 row-span-2 over">
        <CustomCard.Header>
            <CustomCard.Title>Credit Cards</CustomCard.Title>
        </CustomCard.Header>
        <CustomCard.Content class="p-4 relative overflow-x-hidden">
            <div class="w-full max-w-[500px] mx-auto aspect-video relative flex items-center justify-center">
                <div
                    v-for="(card, index) in cardPositions"
                    :key="index"
                    :class="['absolute w-[95%] transition-all duration-500']"
                    :style="{
                        zIndex: card.zIndex,
                        transform: `translate(${card.position === 'center' ? '-50%' : card.position === 'left' ? '-70%' : '-30%'}, -50%) scale(${card.scale})`,
                        opacity: card.opacity,
                        top: '50%',
                        left: '50%'
                    }"
                >
                    <CreditCard :disabled="isStopTransition" :nextCard="nextCard" :previousCard="previousCard" :cardNumber="card.cardNumber" :cardHolderName="card.cardHolderName" :color="card.color" />
                </div>
            </div>
            <div class="space-y-4 mt-6">
                <div class="flex items-center justify-between">
                    <span class="text-surface-500">Card Number</span>
                    <div class="flex items-center gap-2">
                        <button>
                            <CopyIcon />
                        </button>
                        <span class="flex items-center gap-px">
                            <PlaceholderStarIcon v-for="i in 4" :key="i" />
                        </span>
                        <span class="font-medium">7203</span>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-surface-500">Expiry Date</span>
                    <div class="flex items-center gap-2">
                        <button>
                            <CopyIcon />
                        </button>
                        <span class="font-medium">03/33</span>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-surface-500">CVC</span>
                    <div class="flex items-center gap-2">
                        <button>
                            <CopyIcon />
                        </button>
                        <span class="flex items-center gap-px">
                            <PlaceholderStarIcon v-for="i in 4" :key="i" />
                        </span>
                    </div>
                </div>
                <div>
                    <div class="flex items-center justify-between">
                        <span class="text-surface-500">Spend Limit</span>
                        <span class="font-medium">{{ formatCurrency(72000.0, 'USD') }}</span>
                    </div>
                    <div class="flex items-center gap-px mt-2">
                        <div class="!min-w-60 flex-1">
                            <div class="bg-surface-950 dark:bg-surface-0 rounded-full h-1.5 w-full" />
                            <div class="mt-3.5">
                                <div class="text-surface-500 text-sm">Spent</div>
                                <div class="font-medium mt-1">{{ formatCurrency(spent, 'USD') }}</div>
                            </div>
                        </div>
                        <div class="!min-w-24" :style="{ width: `${(remaining / spendLimit) * 100}%` }">
                            <div class="bg-surface-200 dark:bg-surface-800 rounded-full h-1.5 w-full" />
                            <div class="mt-3.5">
                                <div class="text-surface-500 text-sm">Spent</div>
                                <div class="font-medium mt-1">{{ formatCurrency(remaining, 'USD') }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 mt-6">
                        <Button label="Card Detail" class="!border-surface-200 dark:!border-surface-800" outlined severity="contrast" fluid />
                        <Button label="Limit" class="!border-surface-200 dark:!border-surface-800" outlined severity="contrast" fluid />
                        <Button label="More" class="!border-surface-200 dark:!border-surface-800" outlined severity="contrast" fluid />
                    </div>
                    <Divider />
                    <SelectButton v-model="selectedTime" :options="options" optionLabel="name" class="!w-full !flex [&_button]:!flex-1" />
                    <div class="mt-4 flex items-center justify-between">
                        <div class="text-sm text-surface-500">Amount spent per day</div>
                        <div class="font-medium">{{ formatCurrency(1172.83, 'USD') }}</div>
                    </div>
                    <div class="mt-4 space-y-4">
                        <div v-for="transaction in transactions" :key="transaction.id" class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl border">
                                    <img :src="isDarkTheme ? (transaction?.darkProductImage ?? transaction.productImage) : transaction.productImage" class="w-full h-full object-cover" />
                                </div>
                                <div class="flex-1">
                                    <div class="font-medium">{{ transaction.product }}</div>
                                    <div class="mt-1 text-sm text-surface-500">{{ transaction.date }}</div>
                                </div>
                            </div>
                            <div class="font-medium text-surface-500 inline-flex gap-1">
                                <span class="text-red-600">
                                    <span v-if="transaction.spent">-</span>
                                    <span v-else>+</span>
                                    {{ formatCurrency(transaction.amount, 'USD') }}</span
                                >
                                <span class="text-surface-500 text-sm">{{ transaction.currency }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="h-20 flex items-center justify-center w-full absolute bottom-0 inset-x-0 backdrop-blur-[1.5px] bg-gradient-to-b from-transparent to-surface-0 dark:to-surface-950">
                    <button class="flex items-center gap-2 font-medium text-primary-active hover:opacity-80 transition-opacity">
                        <svg class="fill-primary-active" xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M1.73067 4.7H3.325C3.61495 4.7 3.85 4.93505 3.85 5.225C3.85 5.51495 3.61495 5.75 3.325 5.75H0.525C0.235053 5.75 0 5.51495 0 5.225V2.425C0 2.13505 0.235053 1.9 0.525 1.9C0.814947 1.9 1.05 2.13505 1.05 2.425V3.78284C2.28959 1.81125 4.48644 0.5 6.99048 0.5C10.861 0.5 14 3.63328 14 7.5C14 11.3667 10.861 14.5 6.99048 14.5C3.9382 14.5 1.34229 12.5518 0.380093 9.83352C0.283339 9.56017 0.426489 9.26015 0.699818 9.16341C0.973147 9.06667 1.27316 9.20982 1.36991 9.48317C2.18807 11.7946 4.39605 13.45 6.99048 13.45C10.2826 13.45 12.95 10.7854 12.95 7.5C12.95 4.21463 10.2826 1.55 6.99048 1.55C4.7135 1.55 2.73414 2.825 1.73067 4.7ZM7 4C7.28994 4 7.525 4.23505 7.525 4.525V7.28251L9.82121 9.57879C10.0262 9.78382 10.0262 10.1162 9.82121 10.3212C9.61618 10.5262 9.28382 10.5262 9.07879 10.3212L6.62879 7.87121C6.5303 7.77279 6.475 7.63923 6.475 7.5V4.525C6.475 4.23505 6.71006 4 7 4Z"
                            />
                        </svg>
                        <span>See All Transactions</span>
                    </button>
                </div>
            </div>
        </CustomCard.Content>
    </CustomCard>
</template>
