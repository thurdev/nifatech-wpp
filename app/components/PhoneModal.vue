<script setup lang="ts">
import { ref } from "vue";
import { useVerification } from "~/composables/verification";
import { formatPhone } from "~/utils/formats";

const { cPhoneNumber, nifaAdmin } = useVerification();

const emit = defineEmits(["submit", "close"]);

const props = defineProps<{
  isAdmin?: boolean;
}>();

const adminAttempts = ref(0);
const phone = ref("");
const isLoading = ref(false);
const error = ref("");
const loggedIn = ref(false);

const handlePhoneInput = (value: string) => {
  phone.value = formatPhone(String(value));
  error.value = "";
};

const handleSubmit = async () => {
  // Guard: form `@submit.prevent` fires on Enter regardless of button :disabled,
  // so we block at the function level too.
  if (isLoading.value) return;

  const digits = phone.value.replace(/\D/g, "");

  if (digits.length < 9) {
    error.value = "Introduza um número de telemóvel válido";
    return;
  }

  isLoading.value = true;

  const extraUrl = props.isAdmin ? "/admin" : "";

  try {
    const response = await $fetch<{ token: string }>(
      `https://n8n.thur.dev/webhook/nifatech/verify-phone${extraUrl}`,
      {
        method: "POST",
        body: { phoneNumber: digits },
      },
    );

    if (props.isAdmin) {
      loggedIn.value = true;
      setTimeout(() => {
        nifaAdmin.value = response.token;
        emit("close");
      }, 2000);
    }

    cPhoneNumber.value = digits;
    emit("submit", phone.value);
  } catch (err: unknown) {
    if ((err as { response: { status: number } })?.response?.status === 401) {
      if (props.isAdmin) {
        adminAttempts.value++;
        if (adminAttempts.value >= 3) {
          error.value =
            "Muitas tentativas falhadas. Tente novamente mais tarde.";
          isLoading.value = false;
          setTimeout(() => {
            adminAttempts.value = 0;
            navigateTo("/");
          }, 3000);
        } else {
          error.value = "Telefone inválido, tente novamente.";
        }
      }
    } else {
      error.value = "Ocorreu um erro. Tente novamente mais tarde.";
    }
  } finally {
    isLoading.value = false;
    setTimeout(() => {
      error.value = "";
    }, 3000);
  }
};
</script>

<template>
  <UModal
    :default-open="!isAdmin || !loggedIn"
    :dismissible="false"
    :close="false"
    :overlay="false"
    :transition="true"
    :ui="{
      content:
        'ring-1 ring-[#13f2f2]/12 bg-black/55 backdrop-blur-2xl shadow-[0_0_50px_-18px_rgba(19,242,242,0.3)]',
    }"
  >
    <template #body>
      <div class="p-8">
        <!-- Success state -->
        <template v-if="isAdmin && loggedIn">
          <div
            v-motion
            class="w-16 h-16 bg-[#13f2f2]/10 rounded-2xl flex items-center justify-center mx-auto mb-5"
            :initial="{ scale: 0 }"
            :enter="{
              scale: 1,
              transition: { type: 'spring', stiffness: 200, damping: 10 },
            }"
          >
            <svg
              class="w-8 h-8 text-[#13f2f2]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2
            v-motion
            class="text-xl font-semibold text-center"
            :initial="{ opacity: 0, y: 8 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
          >
            Bem-vindo!
          </h2>
        </template>

        <!-- Phone entry state -->
        <template v-else>
          <!-- Brand wordmark -->
          <div
            v-if="!isAdmin"
            v-motion
            class="flex items-center justify-center gap-2.5 mb-7"
            :initial="{ opacity: 0, y: -6 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
          >
            <span class="relative flex-shrink-0">
              <span
                class="absolute inset-0 rounded-lg bg-[#13f2f2]/20 blur-md"
              />
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

          <!-- Icon (admin only — the client login is branded by the wordmark above) -->
          <div
            v-if="isAdmin"
            v-motion
            class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-[var(--ui-bg-elevated)]"
            :initial="{ scale: 0, rotate: -8 }"
            :enter="{
              scale: 1,
              rotate: 0,
              transition: { type: 'spring', stiffness: 200, damping: 10 },
            }"
          >
            <svg
              class="w-7 h-7 text-[var(--ui-text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
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
            {{ isAdmin ? "Acesso Administrador" : "Entrar na plataforma" }}
          </h2>
          <p
            v-motion
            class="text-sm text-[var(--ui-text-muted)] text-center mb-7"
            :initial="{ opacity: 0, y: 8 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
          >
            {{
              isAdmin
                ? "Introduza o número autorizado para continuar"
                : "Introduza o seu número para receber o código de acesso"
            }}
          </p>

          <!-- Form -->
          <form
            v-motion
            :initial="{ opacity: 0, y: 8 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 220 } }"
            @submit.prevent="handleSubmit"
          >
            <div class="mb-5">
              <label
                class="block text-xs font-medium text-[var(--ui-text-muted)] uppercase tracking-wider mb-2"
              >
                Número de telefone
              </label>
              <UInput
                class="w-full"
                :model-value="phone"
                type="tel"
                placeholder="(19) 91234-5678"
                icon="i-heroicons-phone-20-solid"
                name="telefone"
                maxlength="15"
                size="xl"
                color="secondary"
                @update:model-value="handlePhoneInput"
              />
              <p v-if="error" class="mt-2 text-xs text-red-400">{{ error }}</p>
            </div>

            <UButton
              type="submit"
              :disabled="isLoading"
              :loading="isLoading"
              class="w-full cursor-pointer font-semibold rounded-xl justify-center transition-shadow duration-300 hover:shadow-[0_0_28px_-6px_rgba(19,242,242,0.55)]"
              size="xl"
              color="secondary"
              block
            >
              <template v-if="isAdmin">Entrar</template>
              <template v-else>
                {{ isLoading ? "A enviar..." : "Continuar via WhatsApp" }}
              </template>
            </UButton>
          </form>

          <!-- WhatsApp indicator (non-admin) -->
          <div
            v-if="!isAdmin"
            v-motion
            class="mt-5 flex items-center justify-center gap-2 text-xs text-[var(--ui-text-muted)]"
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { delay: 340 } }"
          >
            <svg
              class="w-3.5 h-3.5 text-green-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
              />
            </svg>
            Receberá um código de 6 dígitos no WhatsApp
          </div>
        </template>
      </div>
    </template>
  </UModal>
</template>
