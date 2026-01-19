<script setup>
defineProps({
  showOverlay: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["close"]);
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Overlay -->
      <div
        v-if="showOverlay"
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        @click="$emit('close')"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 300 } }"
      />

      <!-- Modal Content -->
      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        v-motion
        :initial="{ opacity: 0, scale: 0.95, y: 20 }"
        :enter="{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: 300, ease: 'easeOut' },
        }"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>
