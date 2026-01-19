<script setup lang="ts">
import { useVerification } from "~/composables/verification";

const { nifaAdmin } = useVerification();

const isLoading = ref(false);
const selectedFile = ref<File[]>([]);

const updateProducts = async () => {
  if (selectedFile.value.length === 0) return;

  isLoading.value = true;

  const formData = new FormData();
  formData.append("file", selectedFile.value[0]);

  try {
    await $fetch("https://n8n.thur.dev/webhook-test/nifatech/products", {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${nifaAdmin.value}`,
      },
    });
    selectedFile.value = [];
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen">
    <PhoneModal v-if="!nifaAdmin" is-admin />
    <template v-else>
      <AppHeader />

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h1
            v-motion
            class="text-2xl font-semibold light:text-black mb-2"
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
          >
            Atualizar produtos
          </h1>

          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 500, delay: 200 },
            }"
          >
            <UFileUpload
              icon="i-lucide-upload-cloud"
              label="Arraste seu arquivo aqui ou selecione"
              class="w-96 min-h-48 cursor-pointer"
              description="CSV"
              accept=".csv"
              layout="list"
              highlight
              color="secondary"
            >
              <template #files-bottom="{ removeFile, files }">
                <UButton
                  v-if="files || files.length > 0"
                  label="Remove all files"
                  color="neutral"
                  @click="removeFile()"
                />
              </template>
            </UFileUpload>
            <UButton
              class="mt-4"
              color="secondary"
              icon="i-lucide-refresh-cw"
              :loading="isLoading"
              :disabled="isLoading || files.length === 0"
              @click="updateProducts"
            >
              Atualizar Produtos
            </UButton>
          </div>
        </div>
      </main></template
    >
  </div>
</template>
