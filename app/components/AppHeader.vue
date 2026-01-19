<script setup lang="ts">
import { useVerification } from "~/composables/verification";

const { logout, nifaAdmin } = useVerification();

const handleLogout = async () => {
  await logout();
  window.location.href = "/";
};
</script>

<template>
  <UHeader :toggle="false">
    <template #title>
      <div class="flex items-center justify-center gap-4">
        <img src="~/assets/images/nifa-logo.png" class="w-10 h-10 rounded-xl" />

        <h1 class="text-lg font-semibold dark:text-white text-logo">
          nifa tech
        </h1>
      </div>
    </template>

    <template #right>
      <p v-if="!nifaAdmin" class="text-sm text-green-600">
        Autenticado via whatsapp
      </p>
      <UTooltip :delay-duration="0" text="Trocar tema">
        <UColorModeButton class="cursor-pointer" variant="soft" />
      </UTooltip>
      <div class="relative flex gap-4 items-center justify-center">
        <UTooltip :delay-duration="0" text="Deslogar">
          <UButton
            color="error"
            variant="soft"
            class="flex items-center justify-center cursor-pointer"
            icon="i-lucide-log-out"
            @click="handleLogout"
          />
        </UTooltip>
      </div>
    </template>
  </UHeader>
</template>
