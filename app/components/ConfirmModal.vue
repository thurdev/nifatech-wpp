<script setup lang="ts">
import { currencyFormatter } from "~/utils/formats";
import type { Product } from "~/types/product";
const model = defineModel<boolean>();

defineProps<{
  product?: Product;
}>();

const $emit = defineEmits(["confirm", "cancel"]);
const isLoading = ref(false);

const handleClose = () => {
  model.value = false;
  $emit("cancel");
};

const handleConfirm = () => {
  isLoading.value = true;
  $emit("confirm");
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
};
</script>

<template>
  <UModal :open="model" :close="false" @after:leave="handleClose">
    <template #body>
      <div class="p-8">
        <!-- Icon -->
        <div
          v-motion
          class="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
          :initial="{ scale: 0 }"
          :enter="{
            scale: 1,
            transition: { type: 'spring', stiffness: 200, damping: 10 },
          }"
        >
          <svg
            class="w-8 h-8 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <!-- Title -->
        <h2
          v-motion
          class="text-2xl font-semibold text-black dark:text-white text-center mb-2"
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
        >
          Confirmar Encomenda
        </h2>
        <p
          v-motion
          class="text-slate-500 dark:text-white/50 text-center mb-6"
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
        >
          Tem a certeza que deseja encomendar este produto?
        </p>

        <!-- Product Info -->
        <div
          v-if="product"
          v-motion
          class="bg-secondary/10 rounded-xl p-4 mb-8"
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center shadow-sm"
            >
              <svg
                class="w-6 h-6 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-secondary">
                {{ product.product_name }}
              </h3>
              <p class="text-sm text-slate-500 dark:text-white/50">
                {{ product.category }}
              </p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-secondary">
                {{ currencyFormatter(product.price_lojista) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div
          v-motion
          class="flex gap-3"
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }"
        >
          <UButton
            class="flex-1 flex items-center justify-center cursor-pointer"
            color="secondary"
            variant="outline"
            size="xl"
            :disabled="isLoading"
            @click="$emit('cancel')"
          >
            Cancelar
          </UButton>
          <UButton
            class="flex-1 flex items-center justify-center cursor-pointer"
            color="secondary"
            size="xl"
            :loading="isLoading"
            :disabled="isLoading"
            @click="handleConfirm"
          >
            Confirmar
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
