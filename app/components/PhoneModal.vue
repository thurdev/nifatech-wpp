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
  >
    <template #body>
      <div class="p-6">
        <!-- Icon -->
        <div
          v-if="!loggedIn"
          v-motion
          class="w-16 h-16 bg-blue-100 dark:bg-[#032340] rounded-2xl flex items-center justify-center mx-auto mb-6"
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
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div
          v-if="isAdmin && loggedIn"
          v-motion
          class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
          :initial="{ scale: 0 }"
          :enter="{
            scale: 1,
            transition: { type: 'spring', stiffness: 200, damping: 10 },
          }"
        >
          <svg
            v-motion
            class="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            :initial="{ pathLength: 0, opacity: 0 }"
            :enter="{
              pathLength: 1,
              opacity: 1,
              transition: { delay: 200, duration: 400 },
            }"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <template v-if="!loggedIn">
          <!-- Title -->
          <h2
            v-if="isAdmin"
            v-motion
            class="text-2xl font-semibold text-blac dark:text-white mb-2 text-center"
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
          >
            Login Admin
          </h2>

          <!-- Subtitle -->
          <p
            v-motion
            class="dark:text-white text-center mb-8"
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
          >
            Introduza o seu número de telefone para continuar
          </p>

          <!-- Form -->
          <form
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }"
            @submit.prevent="handleSubmit"
          >
            <div class="mb-6">
              <label class="block text-sm font-medium dark:text-white/70 mb-2">
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

              <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
            </div>

            <UButton
              type="submit"
              :disabled="isLoading"
              :loading="isLoading"
              class="w-full cursor-pointer font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              size="xl"
              color="secondary"
            >
              <template v-if="isAdmin"> Entrar </template>
              <template v-else>
                {{ isLoading ? "A enviar..." : "Enviar código via WhatsApp" }}
              </template>
            </UButton>
          </form>

          <!-- WhatsApp indicator -->
          <div
            v-if="!isAdmin"
            v-motion
            class="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500"
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 800 } }"
          >
            <svg
              class="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
              />
            </svg>
            <span>Receberá um código de 6 dígitos</span>
          </div>
        </template>
        <template v-else>
          <h2
            v-motion
            class="text-2xl font-semibold text-blac dark:text-white mb-2 text-center"
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
          >
            Bem vindo!
          </h2>
        </template>
      </div>
    </template>
  </UModal>
</template>
