<script setup>
import MiniLogo from '@/components/icons/MiniLogo.vue';
import { usePrimeVue } from 'primevue';
import { ref } from 'vue';

const props = defineProps({
    open: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['toggle']);

const toggle = () => {
    emit('toggle', !props.open);
};

defineExpose({
    toggle
});

const separatorClass = 'font-medium bg-surface-100 dark:bg-surface-900 px-6 py-2 flex items-center justify-between';

const selectedPricingModel = ref();
const pricingModels = ref([
    { name: 'Free', code: 'FREE' },
    { name: 'Basic', code: 'BASIC' },
    { name: 'Pro', code: 'PRO' },
    { name: 'Enterprise', code: 'ENT' },
    { name: 'Custom', code: 'CUST' }
]);
const selectedTaxCategory = ref();
const taxCategories = ref([
    { name: 'Standard Rate', code: 'STD' },
    { name: 'Reduced Rate', code: 'RED' },
    { name: 'Zero Rate', code: 'ZERO' },
    { name: 'Exempt', code: 'EXEMPT' },
    { name: 'Out of Scope', code: 'OOS' }
]);

const $primevue = usePrimeVue();

const totalSize = ref(0);
const value1 = ref(null);
const totalSizePercent = ref(0);
const files = ref([]);

const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
    removeFileCallback(index);
    totalSize.value -= parseInt(formatSize(file.size));
    totalSizePercent.value = totalSize.value / 10;
};

const onSelectedFiles = (event) => {
    files.value = event.files;
    files.value.forEach((file) => {
        totalSize.value += parseInt(formatSize(file.size));
    });
};

const uploadEvent = (callback) => {
    totalSizePercent.value = totalSize.value / 10;
    callback();
};

const formatSize = (bytes) => {
    const k = 1024;
    const dm = 3;
    const sizes = $primevue.config.locale.fileSizeTypes;

    if (bytes === 0) {
        return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
};
</script>

<template>
    <Drawer :visible="open" @update:visible="(value) => emit('toggle', value)" header="Right Drawer" position="right" class="!w-full md:!w-80 lg:!w-[30rem]">
        <template #container="{ closeCallback }">
            <div class="h-full overflow-auto">
                <div class="px-6 py-5 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <MiniLogo />
                        <Avatar image="/demo/images/avatar/avatar-square-m-1.jpg" class="!w-8 !h-8 !rounded-md !overflow-hidden" />
                        <span class="font-medium">JS Travel Group</span>
                    </div>
                    <Button type="button" @click="closeCallback" icon="pi pi-times" text severity="secondary" />
                </div>
                <div :class="separatorClass">
                    <span>General</span>
                </div>
                <div class="p-6 space-y-8">
                    <div>
                        <InputText placeholder="Name" class="w-full" />
                        <div class="text-sm text-surface-500 mt-2">
                            <div>Give your product a short and clear name.</div>
                            <div>50-60 characters is the recommended length for search engines.</div>
                        </div>
                    </div>
                    <div>
                        <InputText placeholder="Description" class="w-full" />
                        <div class="text-sm text-surface-500 mt-2">
                            <div>Give your product a short and clear name.</div>
                            <div>140-160 characters is the recommended length for search engines.</div>
                        </div>
                    </div>
                </div>
                <div :class="separatorClass">
                    <span>Pricing</span>
                </div>
                <div class="p-6 space-y-6">
                    <Select v-model="selectedPricingModel" :options="pricingModels" optionLabel="name" placeholder="Pricing Model" class="w-full" />
                    <InputNumber v-model="value1" inputId="currency-us" mode="currency" currency="USD" locale="en-US" fluid />
                    <Select v-model="selectedTaxCategory" :options="taxCategories" optionLabel="name" placeholder="Tax Category" class="w-full" />
                </div>
                <div :class="separatorClass">
                    <span>Media</span>
                </div>
                <div class="p-6">
                    <FileUpload name="demo[]" url="/api/upload" @upload="onTemplatedUpload($event)" :multiple="true" accept="image/*" :maxFileSize="1000000" @select="onSelectedFiles">
                        <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
                            <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
                                <div class="flex gap-2">
                                    <Button @click="chooseCallback()" icon="pi pi-images" rounded outlined severity="secondary" />
                                    <Button @click="uploadEvent(uploadCallback)" icon="pi pi-cloud-upload" rounded outlined severity="success" :disabled="!files || files.length === 0" />
                                    <Button @click="clearCallback()" icon="pi pi-times" rounded outlined severity="danger" :disabled="!files || files.length === 0" />
                                </div>
                            </div>
                        </template>
                        <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback, messages }">
                            <div class="flex flex-col gap-8 pt-4">
                                <Message v-for="message of messages" :key="message" :class="{ 'mb-8': !files.length && !uploadedFiles.length }" severity="error">
                                    {{ message }}
                                </Message>

                                <div v-if="files.length > 0">
                                    <h5>Pending</h5>
                                    <div class="flex flex-wrap gap-4">
                                        <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="p-8 rounded-border flex flex-col border border-surface items-center gap-4">
                                            <div>
                                                <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
                                            </div>
                                            <span class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">{{ file.name }}</span>
                                            <div>{{ formatSize(file.size) }}</div>
                                            <Badge value="Pending" severity="warn" />
                                            <Button icon="pi pi-times" @click="onRemoveTemplatingFile(file, removeFileCallback, index)" outlined rounded severity="danger" />
                                        </div>
                                    </div>
                                </div>

                                <div v-if="uploadedFiles.length > 0">
                                    <h5>Completed</h5>
                                    <div class="flex flex-wrap gap-4">
                                        <div v-for="(file, index) of uploadedFiles" :key="file.name + file.type + file.size" class="p-8 rounded-border flex flex-col border border-surface items-center gap-4">
                                            <div>
                                                <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
                                            </div>
                                            <span class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">{{ file.name }}</span>
                                            <div>{{ formatSize(file.size) }}</div>
                                            <Badge value="Completed" class="mt-4" severity="success" />
                                            <Button icon="pi pi-times" @click="removeUploadedFileCallback(index)" outlined rounded severity="danger" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template #empty>
                            <div class="flex items-center justify-center flex-col">
                                <i class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color" />
                                <p class="mt-6 mb-0">Drag and drop files to here to upload.</p>
                            </div>
                        </template>
                    </FileUpload>
                </div>
            </div>
        </template>
    </Drawer>
</template>
