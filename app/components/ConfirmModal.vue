<script setup lang="ts">
import { currencyFormatter } from "~/utils/formats";
import type { Product } from "~/types/product";

const model = defineModel<boolean>();

// `loading` is owned by the parent (index.vue) and reflects the true async state.
// Previously ConfirmModal had its own isLoading + setTimeout(1000) which reset
// independently of the actual network request — allowing a second confirm click
// on slow connections.
defineProps<{
  product?: Product;
  loading?: boolean;
}>();

const $emit = defineEmits(["confirm", "cancel"]);

const handleClose = () => {
  model.value = false;
  $emit("cancel");
};

// No local loading state. Just emit — parent sets isOrderLoading = true immediately.
const handleConfirm = () => {
  $emit("confirm");
};
</script>

<template>
  <UModal
    :open="model"
    :close="false"
    :ui="{
      content:
        'ring-1 ring-white/10 bg-black/70 backdrop-blur-2xl shadow-[0_0_60px_-16px_rgba(19,242,242,0.35)]',
    }"
    @after:leave="handleClose"
  >
    <template #body>
      <div class="p-8">
        <!-- Icon -->
        <div
          v-motion
          class="w-14 h-14 bg-amber-400/10 border border-amber-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          :initial="{ scale: 0 }"
          :enter="{
            scale: 1,
            transition: { type: 'spring', stiffness: 220, damping: 12 },
          }"
        >
          <svg
            class="w-7 h-7 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <!-- Title -->
        <h2
          v-motion
          class="text-xl font-semibold text-center mb-1"
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
        >
          Confirmar Reserva
        </h2>
        <p
          v-motion
          class="text-sm text-[var(--ui-text-muted)] text-center mb-6"
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
        >
          Tem a certeza que deseja reservar este produto?
        </p>

        <!-- Product Info -->
        <div
          v-if="product"
          v-motion
          class="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-4 mb-7"
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 bg-[#13f2f2]/10 border border-[#13f2f2]/15 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5 text-[#13f2f2]"
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
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm truncate">
                {{ product.product_name }}
              </p>
              <p class="text-xs text-[var(--ui-text-muted)] mt-0.5">
                {{ product.category }}
              </p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-sm font-bold text-[#13f2f2]">
                {{ currencyFormatter(product.price_lojista) }}
              </p>
              <p class="text-[10px] text-[var(--ui-text-muted)] mt-0.5">
                Preço lojista
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div
          v-motion
          class="flex gap-3"
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
        >
          <UButton
            class="flex-1 cursor-pointer"
            color="neutral"
            variant="outline"
            size="lg"
            :disabled="loading"
            @click="$emit('cancel')"
          >
            Cancelar
          </UButton>
          <UButton
            class="flex-1 cursor-pointer"
            color="secondary"
            size="lg"
            :loading="loading"
            :disabled="loading"
            @click="handleConfirm"
          >
            Confirmar reserva
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
