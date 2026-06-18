<script setup lang="ts">
import { useVerification } from "~/composables/verification";

const { logout, nifaAdmin } = useVerification();

const handleLogout = async () => {
  await logout();
  window.location.href = "/";
};
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-white/[0.07] bg-black/55 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-black/40"
  >
    <!-- neon hairline glow under the nav -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#13f2f2]/60 to-transparent"
    />
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="relative flex-shrink-0">
            <div
              class="absolute inset-0 rounded-xl bg-[#13f2f2]/25 blur-md pointer-events-none"
            />
            <img
              src="~/assets/images/nifa-logo.png"
              class="relative w-9 h-9 rounded-xl object-cover"
              alt="NifaTech"
            />
          </div>
          <span class="text-logo text-base tracking-[0.2em] text-white/90 select-none">
            nifa tech
          </span>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-2">
          <!-- Authenticated badge (non-admin only) -->
          <div
            v-if="!nifaAdmin"
            class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-500/20 bg-emerald-500/8 text-emerald-400"
          >
            <span class="relative flex h-1.5 w-1.5">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              />
              <span
                class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"
              />
            </span>
            WhatsApp
          </div>

          <UTooltip :delay-duration="0" text="Terminar sessão">
            <UButton
              color="error"
              variant="ghost"
              class="cursor-pointer"
              icon="i-lucide-log-out"
              @click="handleLogout"
            />
          </UTooltip>
        </div>
      </div>
    </div>
  </header>
</template>
