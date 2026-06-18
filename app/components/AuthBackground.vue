<script setup lang="ts">
// Purely decorative atmosphere layer for the login (phone/code) flow.
// Sits behind the UModal overlay: animated cyan/blue aurora + fine grain.
</script>

<template>
  <div class="fixed inset-0 -z-0 overflow-hidden bg-[var(--ui-bg)]">
    <!-- base vignette so the aurora reads as light coming from within -->
    <div
      class="absolute inset-0"
      style="
        background:
          radial-gradient(
            120% 90% at 50% 0%,
            rgba(19, 242, 242, 0.06),
            transparent 55%
          ),
          radial-gradient(80% 60% at 50% 120%, rgba(56, 130, 246, 0.06), transparent 60%);
      "
    />

    <!-- animated colour blooms -->
    <div class="nifa-aurora" />

    <!-- subtle dotted grid for depth -->
    <div
      class="absolute inset-0 opacity-[0.18]"
      style="
        background-image: radial-gradient(
          rgba(255, 255, 255, 0.08) 1px,
          transparent 1px
        );
        background-size: 26px 26px;
        mask-image: radial-gradient(70% 60% at 50% 45%, #000 40%, transparent 100%);
        -webkit-mask-image: radial-gradient(
          70% 60% at 50% 45%,
          #000 40%,
          transparent 100%
        );
      "
    />

    <!-- film grain -->
    <div class="nifa-grain" />
  </div>
</template>
