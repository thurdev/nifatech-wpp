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
    :ui="{
      content:
        'ring-1 ring-[#13f2f2]/20 bg-black/70 backdrop-blur-2xl shadow-[0_0_60px_-14px_rgba(19,242,242,0.45)]',
    }"
    @after:leave="handleClose"
    @close="$emit('close')"
  >
    <template #body>
      <div class="p-8 text-center">
        <!-- Animated checkmark -->
        <div
          v-motion
          class="w-16 h-16 bg-[#13f2f2]/10 border border-[#13f2f2]/25 rounded-full flex items-center justify-center mx-auto mb-6"
          :initial="{ scale: 0 }"
          :enter="{
            scale: 1,
            transition: { type: 'spring', stiffness: 220, damping: 12 },
          }"
        >
          <svg
            v-motion
            class="w-8 h-8 text-[#13f2f2]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            :initial="{ pathLength: 0, opacity: 0 }"
            :enter="{
              pathLength: 1,
              opacity: 1,
              transition: { delay: 250, duration: 350 },
            }"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <!-- Title -->
        <h2
          v-motion
          class="text-xl font-semibold mb-1"
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
        >
          Reserva Confirmada!
        </h2>
        <p
          v-motion
          class="text-sm text-[var(--ui-text-muted)] mb-6"
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 380 } }"
        >
          A sua reserva foi registada com sucesso.
        </p>

        <!-- Product card -->
        <div
          v-if="product"
          v-motion
          class="rounded-xl border border-[#13f2f2]/15 bg-[#13f2f2]/5 p-4 mb-6 text-left"
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 450 } }"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 bg-[#13f2f2]/10 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-4.5 h-4.5 text-[#13f2f2]"
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
            <div>
              <p class="font-semibold text-sm">{{ product.product_name }}</p>
              <p class="text-xs text-[var(--ui-text-muted)]">
                {{ product.category }}
              </p>
            </div>
          </div>
        </div>

        <!-- Close -->
        <UButton
          v-motion
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 550 } }"
          class="w-full cursor-pointer"
          color="secondary"
          variant="outline"
          size="lg"
          @click="$emit('close')"
        >
          Fechar
        </UButton>

        <p
          v-motion
          class="text-[11px] text-[var(--ui-text-muted)]/60 mt-4"
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 750 } }"
        >
          Esta janela fecha automaticamente
        </p>
      </div>
    </template>
  </UModal>
</template>
