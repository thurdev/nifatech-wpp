<script setup lang="ts">
import { ref, computed } from "vue";
import { useVerification } from "~/composables/verification";
import { formatPhone } from "~/utils/formats";
const { cPhoneNumber, setVerified } = useVerification();

const phone = cPhoneNumber;

const emit = defineEmits(["verify", "back"]);

const code = ref("");
const isLoading = ref(false);
const error = ref("");

const isComplete = computed(() => code.value.length === 6);

const handleSubmit = async () => {
  if (!isComplete.value) {
    error.value = "Introduza o código completo";
    return;
  }

  isLoading.value = true;

  try {
    await $fetch("https://n8n.thur.dev/webhook/nifatech/verify-code", {
      method: "POST",
      body: { code: code.value.join(""), phoneNumber: phone.value },
    });
    setVerified(true);
    emit("verify");
  } catch (err) {
    if (err?.response?.status === 401) {
      error.value = "Código inválido. Tente novamente.";
      setTimeout(() => {
        error.value = "";
      }, 3000);
      return;
    }
  } finally {
    isLoading.value = false;
  }
};

const resendCode = async () => {
  // Simulate resend
  code.value = "";
  error.value = "";

  isLoading.value = true;
  await $fetch("https://n8n.thur.dev/webhook/nifatech/verify-phone", {
    method: "POST",
    body: { phoneNumber: phone.value },
  });
  isLoading.value = false;
};

const formattedPhone = computed(() => formatPhone(String(phone.value)));
</script>

<template>
  <UModal default-open :dismissible="false" :close="false">
    <template #body>
      <div class="p-8">
        <!-- Back button -->
        <UButton
          v-motion
          variant="ghost"
          class="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 transition-colors hover:bg-transparent cursor-pointer"
          color="secondary"
          :initial="{ scale: 0 }"
          :enter="{
            scale: 1,
            transition: { type: 'spring', stiffness: 200, damping: 10 },
          }"
          @click="$emit('back')"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </UButton>

        <!-- Icon -->
        <div
          v-motion
          class="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
          :initial="{ scale: 0 }"
          :enter="{
            scale: 1,
            transition: { type: 'spring', stiffness: 200, damping: 10 },
          }"
        >
          <svg
            class="w-8 h-8 text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <!-- Title -->
        <h2
          v-motion
          class="text-2xl font-semibold text-center mb-2"
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
        >
          Verificar Código
        </h2>
        <p
          v-motion
          class="text-slate-500 text-center mb-2"
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
        >
          Enviámos um código para
        </p>
        <p
          v-motion
          class="text-secondary text-2xl font-medium text-center mb-8"
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
        >
          +55 {{ formattedPhone }}
        </p>

        <!-- Code Input -->
        <form
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
          @submit.prevent="handleSubmit"
        >
          <div class="flex justify-center mb-6">
            <UPinInput
              v-model="code"
              otp
              :length="6"
              size="xl"
              color="secondary"
            />
          </div>

          <p
            v-if="error"
            v-motion
            class="text-center text-sm text-red-500 mb-4"
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
          >
            {{ error }}
          </p>

          <UButton
            type="submit"
            :disabled="isLoading || !isComplete"
            :loading="isLoading"
            class="w-full font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            size="xl"
            color="secondary"
          >
            <span>{{ isLoading ? "A verificar..." : "Confirmar" }}</span>
          </UButton>
        </form>

        <!-- Resend -->
        <div
          v-motion
          class="mt-6 text-center"
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }"
        >
          <p class="text-slate-500 text-sm">
            Não recebeu o código?
            <button
              class="text-secondary hover:text-secondary/80 font-medium ml-1 cursor-pointer"
              @click="resendCode"
            >
              Reenviar
            </button>
          </p>
        </div>
      </div>
    </template>
  </UModal>
</template>
