<script setup>
import { CustomCard } from '@/components/ui/custom-card';
import { ref } from 'vue';

const points = ref([
    {
        label: '5',
        count: '514'
    },
    {
        label: '4',
        count: '420'
    },
    {
        label: '3',
        count: '230'
    },
    {
        label: '2',
        count: '120'
    },
    {
        label: '1',
        count: '10'
    }
]);
const data = ref({
    5: [
        {
            name: 'Brook Simmons',
            comment: 'My order arrived right on time and without any issues. The product quality is fantastic, thank you!',
            date: '2024-09-24',
            avatar: '/demo/images/avatar/avatar-m-1.png'
        },
        {
            name: 'Annette Black',
            comment: "Shopping here is so easy and fast! I'm always satisfied with my purchases",
            date: '2024-09-24',
            avatar: '/demo/images/avatar/avatar-f-1.png'
        },
        {
            name: 'Arlene McCoy',
            comment: 'Customer service is incredibly attentive and solution-oriented. I will definitely shop again',
            date: '2024-09-24',
            avatar: '/demo/images/avatar/avatar-m-2.png'
        }
    ],
    4: [
        {
            name: 'Leslie Alexander',
            comment: 'Great product overall, but shipping took a bit longer than expected. Still happy with my purchase.',
            date: '2024-09-23',
            avatar: '/demo/images/avatar/avatar-m-3.png'
        },
        {
            name: 'Jenny Wilson',
            comment: 'Product quality is excellent. Would give 5 stars but the packaging could be more eco-friendly.',
            date: '2024-09-23',
            avatar: '/demo/images/avatar/avatar-f-2.png'
        }
    ],
    3: [
        {
            name: 'Robert Fox',
            comment: "Product is okay, but there's room for improvement. Customer service was helpful though.",
            date: '2024-09-22',
            avatar: '/demo/images/avatar/avatar-m-4.png'
        },
        {
            name: 'Wade Warren',
            comment: 'Average product for the price. Expected a bit more features but it works fine.',
            date: '2024-09-22',
            avatar: '/demo/images/avatar/avatar-f-3.png'
        }
    ],
    2: [
        {
            name: 'Esther Howard',
            comment: 'Disappointed with the quality. Not what I expected based on the description.',
            date: '2024-09-21',
            avatar: '/demo/images/avatar/avatar-m-3.png'
        },
        {
            name: 'Cameron Williamson',
            comment: 'Product arrived damaged. Customer service helped but still not fully satisfied.',
            date: '2024-09-21',
            avatar: '/demo/images/avatar/avatar-m-4.png'
        }
    ],
    1: [
        {
            name: 'Guy Hawkins',
            comment: 'Very poor quality and customer service was unresponsive. Would not recommend.',
            date: '2024-09-20',
            avatar: '/demo/images/avatar/avatar-f-4.png'
        }
    ]
});
const activePoint = ref(points.value[0]);
</script>

<template>
    <CustomCard class="col-span-12 xl:col-span-4">
        <CustomCard.Header class="pr-2">
            <CustomCard.Title>Received Reviews</CustomCard.Title>
            <CustomCard.Action>
                <Button label="View All" text />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content class="flex flex-col">
            <div class="flex items-center h-8 w-full border-b divide-x divide-surface-200 dark:divide-surface-700">
                <template v-for="point in points" :key="point.label">
                    <button
                        type="button"
                        class="flex flex-1 items-center justify-center gap-1 font-medium text-sm h-full transition-colors"
                        :class="activePoint.label === point.label ? 'bg-surface-100 dark:bg-surface-800' : 'hover:bg-surface-100 dark:hover:bg-surface-800'"
                        @click="activePoint = point"
                    >
                        <i class="pi pi-star-fill text-yellow-500 !text-sm" />
                        <span>
                            {{ point.label }}
                        </span>
                        <span>({{ point.count }})</span>
                    </button>
                </template>
            </div>
            <div class="flex-1 overflow-auto">
                <div v-for="item in data[activePoint.label]" :key="item.name" class="p-4 flex items-center gap-3">
                    <Avatar :image="item.avatar" class="!w-10 !h-10" shape="circle" />
                    <div class="flex-1">
                        <div class="flex items-center justify-between">
                            <span class="font-medium line-clamp-1">{{ item.name }}</span>
                            <span class="text-sm text-surface-500">{{ item.date }}</span>
                        </div>
                        <p class="text-sm text-surface-500 line-clamp-1 mt-0.5">{{ item.comment }}</p>
                    </div>
                </div>
            </div>
        </CustomCard.Content>
    </CustomCard>
</template>
