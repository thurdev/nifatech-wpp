<template>
    <UModal :open="isOpen" :dismissible="false" title="Modal non-dismissible">

        <template #body>
            <Placeholder class="h-48" />
            <UButton label="Confirmar" color="primary" @click="onConfirm"/>
        </template>
    </UModal>
</template>

<script lang="ts" setup>

const emit = defineEmits(['confirm'])

defineProps<{
    isOpen: boolean
}>();

const onConfirm = () => {
    emit('confirm')
} 
</script>