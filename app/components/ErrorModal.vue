<script setup lang="ts">
import type { Product } from "~/types/product";
const model = defineModel<boolean>();

defineProps<{
  product?: Product;
}>();

const emit = defineEmits(["close"]);

const handleClose = () => {
  model.value = false;
  emit("close");
};

// Auto-close after 5 seconds
watch(model, (isOpen) => {
  if (isOpen) {
    setTimeout(() => {
      handleClose();
    }, 5000);
  }
});
</script>

<template>
  <UModal
    :open="model"
    :close="false"
    @after:leave="handleClose"
    @close="$emit('close')"
  >
    <template #body>
      <div class="p-8 text-center">
        <!-- Animated Error -->
        <div
          v-motion
          class="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6"
          :initial="{ scale: 0 }"
          :enter="{
            scale: 1,
            transition: { type: 'spring', stiffness: 200, damping: 10 },
          }"
        >
          <svg
            v-motion
            class="w-10 h-10 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            :initial="{ pathLength: 0, opacity: 0 }"
            :enter="{
              pathLength: 1,
              opacity: 1,
              transition: { delay: 200, duration: 400 },
            }"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <!-- Title -->
        <h2
          v-motion
          class="text-2xl font-semibold text-blac dark:text-white mb-2"
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
        >
          Encomenda Rejeitada!
        </h2>
        <p
          v-motion
          class="text-slate-500 mb-6"
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
        >
          O produto encontra-se indisponível no momento.
        </p>

        <!-- Product Info -->
        <div
          v-motion
          class="bg-error/10 rounded-xl p-4 mb-6 text-left"
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center shadow-sm"
            >
              <svg
                class="w-5 h-5 text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div v-if="product">
              <p class="font-medium text-error">
                {{ product.product_name }}
              </p>
              <p class="text-sm text-slate-500 dark:text-white/50">
                {{ product.category }}
              </p>
            </div>
          </div>
        </div>

        <!-- Close Button -->
        <UButton
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }"
          class="w-full flex-1 flex items-center justify-center cursor-pointer"
          color="secondary"
          variant="outline"
          size="xl"
          @click="$emit('close')"
        >
          Fechar
        </UButton>

        <!-- Auto-close indicator -->
        <p
          v-motion
          class="text-xs text-slate-500 dark:text-white/40 mt-4"
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 800 } }"
        >
          Esta janela fecha automaticamente
        </p>
      </div>
    </template>
  </UModal>
</template>
