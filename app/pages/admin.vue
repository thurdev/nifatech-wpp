<script setup>
import { useVerification } from "~/composables/verification";

const toast = useToast();
const { nifaAdmin } = useVerification();

const isLoading = ref(false);

// Por esta
const selectedFile = ref(null);

const updateProducts = async () => {
  if (!selectedFile.value) return;

  isLoading.value = true;

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  try {
    const response = await $fetch(
      "https://n8n.thur.dev/webhook/nifatech/products",
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${nifaAdmin.value}`,
        },
      },
    );

    if (response.ok) {
      toast.add({
        title: "Produtos atualizados com sucesso",
        icon: "i-lucide-check-circle",
        color: "success",
        duration: 5000,
      });
    }
  } catch {
    toast.add({
      title:
        "Erro ao atualizar produtos, tente novamente ou contate o suporte.",
      icon: "i-lucide-x-circle",
      color: "danger",
      duration: 5000,
    });
  } finally {
    isLoading.value = false;
    selectedFile.value = null;
  }
};

useSeoMeta({
  title: "Admin - NifaTech",
  description: "Administração NifaTech, gerencie a loja.",
  themeColor: "#13f2f2",
});
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
              v-model="selectedFile"
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
                  v-if="files.length > 0"
                  label="Remove all files"
                  color="neutral"
                  @click="removeFile()"
                />
              </template>
            </UFileUpload>
            <UButton
              class="mt-4 cursor-pointer"
              color="secondary"
              variant="soft"
              icon="i-lucide-upload-cloud"
              :loading="isLoading"
              :disabled="isLoading || !selectedFile"
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
