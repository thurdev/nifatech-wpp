<script setup></script>

<template>
  <UHeader :toggle="false">
    <template #title>
      <div class="flex items-center justify-center gap-4">
        <img src="~/assets/images/nifa-logo.png" class="w-10 h-10 rounded-xl" />

        <h1 class="text-lg font-semibold text-white text-logo">nifa tech</h1>
      </div>
    </template>

    <template #right>
      <!-- <UColorModeButton /> -->
      <div class="relative flex gap-4 items-center justify-center">
        <p class="text-sm text-white/50">Autenticado via whatsapp</p>
      </div>
    </template>
  </UHeader>
</template>
