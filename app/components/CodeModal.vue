<script setup lang="ts">
import { ref, computed } from "vue";
import { useVerification } from "~/composables/verification";
import { formatPhone } from "~/utils/formats";

const { cPhoneNumber, setVerified } = useVerification();
const phone = cPhoneNumber;

const emit = defineEmits(["verify", "back"]);

const code = ref([]);
const isLoading = ref(false);
const error = ref("");
const resent = ref(false);

const isComplete = computed(() => code.value.length === 6);

// UX: assim que os 6 dígitos estão preenchidos, confirma automaticamente —
// evita o passo extra de carregar no botão depois de colar/escrever o código.
watch(isComplete, (complete) => {
  if (complete && !isLoading.value) handleSubmit();
});

const handleSubmit = async () => {
  // Guard: form @submit.prevent fires on Enter even when button is :disabled.
  if (isLoading.value) return;

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
  } catch (err: unknown) {
    if ((err as { response: { status: number } })?.response?.status === 401) {
      error.value = "Código inválido. Tente novamente.";
      setTimeout(() => {
        error.value = "";
      }, 3000);
    }
  } finally {
    isLoading.value = false;
  }
};

const resendCode = async () => {
  if (isLoading.value) return; // prevent double-tap
  code.value = [];
  error.value = "";
  resent.value = false;
  isLoading.value = true;

  try {
    await $fetch("https://n8n.thur.dev/webhook/nifatech/verify-phone", {
      method: "POST",
      body: { phoneNumber: phone.value },
    });
    resent.value = true;
    setTimeout(() => {
      resent.value = false;
    }, 4000);
  } catch {
    // Previously: no catch here — a network error left isLoading = true forever,
    // permanently locking the modal (user could neither verify nor resend).
    error.value = "Erro ao reenviar. Tente novamente.";
    setTimeout(() => {
      error.value = "";
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};

const formattedPhone = computed(() => formatPhone(String(phone.value)));
</script>

<template>
  <UModal
    default-open
    :dismissible="false"
    :close="false"
    :overlay="false"
    :ui="{
      content:
        'ring-1 ring-[#13f2f2]/12 bg-black/55 backdrop-blur-2xl shadow-[0_0_50px_-18px_rgba(19,242,242,0.3)]',
    }"
  >
    <template #body>
      <div class="p-8">
        <!-- Back button -->
        <UButton
          v-motion
          variant="ghost"
          color="neutral"
          size="sm"
          class="absolute top-4 left-4 cursor-pointer"
          icon="i-lucide-arrow-left"
          :initial="{ opacity: 0, x: -8 }"
          :enter="{ opacity: 1, x: 0, transition: { delay: 100 } }"
          @click="$emit('back')"
        />

        <!-- Brand wordmark -->
        <div
          v-motion
          class="flex items-center justify-center gap-2.5 mb-7"
          :initial="{ opacity: 0, y: -6 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
        >
          <span class="relative flex-shrink-0">
            <span class="absolute inset-0 rounded-lg bg-[#13f2f2]/20 blur-md" />
            <img
              src="~/assets/images/nifa-logo.png"
              alt="NifaTech"
              class="relative w-8 h-8 rounded-lg object-cover"
            />
          </span>
          <span
            class="text-logo text-lg tracking-[0.22em] text-white select-none"
          >
            nifa tech
          </span>
        </div>

        <!-- Icon -->
        <div
          v-motion
          class="nifa-icon-halo w-14 h-14 bg-[#13f2f2]/10 border border-[#13f2f2]/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          :initial="{ scale: 0, rotate: -8 }"
          :enter="{
            scale: 1,
            rotate: 0,
            transition: { type: 'spring', stiffness: 220, damping: 12 },
          }"
        >
          <svg
            class="w-7 h-7 text-[#13f2f2]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <!-- Title -->
        <h2
          v-motion
          class="text-xl font-semibold text-center mb-1"
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 90 } }"
        >
          Verificar identidade
        </h2>
        <p
          v-motion
          class="text-sm text-[var(--ui-text-muted)] text-center mb-1"
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
        >
          Código enviado para
        </p>
        <p
          v-motion
          class="text-base font-semibold text-[#13f2f2] text-center mb-7"
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
        >
          +55 {{ formattedPhone }}
        </p>

        <!-- OTP Input & Submit -->
        <form
          v-motion
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 260 } }"
          @submit.prevent="handleSubmit"
        >
          <div class="flex justify-center mb-5">
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
            class="text-center text-xs text-red-400 mb-4"
            :initial="{ opacity: 0, y: 4 }"
            :enter="{ opacity: 1, y: 0 }"
          >
            {{ error }}
          </p>

          <UButton
            type="submit"
            :disabled="isLoading || !isComplete"
            :loading="isLoading"
            class="w-full font-semibold rounded-xl cursor-pointer justify-center transition-shadow duration-300 hover:shadow-[0_0_28px_-6px_rgba(19,242,242,0.55)]"
            size="xl"
            color="secondary"
            block
          >
            {{ isLoading ? "A verificar..." : "Confirmar código" }}
          </UButton>
        </form>

        <!-- Resend -->
        <div
          v-motion
          class="mt-5 text-center"
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 320 } }"
        >
          <p v-if="resent" class="text-xs text-emerald-400">
            Código reenviado com sucesso.
          </p>
          <p v-else class="text-xs text-[var(--ui-text-muted)]">
            Não recebeu o código?
            <button
              class="text-[#13f2f2] hover:text-[#13f2f2]/80 font-medium ml-1 cursor-pointer underline-offset-2 hover:underline"
              :disabled="isLoading"
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
