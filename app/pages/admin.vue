<script setup>
import { useVerification } from "~/composables/verification";

const toast = useToast();
const { nifaAdmin } = useVerification();

const isLoading = ref(false);
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
        "Erro ao atualizar produtos, tente novamente ou contacte o suporte.",
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
        <div class="max-w-xl">
          <h1
            v-motion
            class="text-2xl font-semibold mb-1"
            :initial="{ opacity: 0, y: 16 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
          >
            Atualizar Produtos
          </h1>
          <p
            v-motion
            class="text-sm text-[var(--ui-text-muted)] mb-8"
            :initial="{ opacity: 0, y: 16 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 80 } }"
          >
            Carregue um ficheiro CSV para atualizar o catálogo de produtos.
          </p>

          <div
            v-motion
            :initial="{ opacity: 0, y: 16 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 180 } }"
            class="space-y-4"
          >
            <UFileUpload
              v-model="selectedFile"
              icon="i-lucide-upload-cloud"
              label="Arraste o ficheiro aqui ou clique para seleccionar"
              class="w-full min-h-44 cursor-pointer"
              description="Apenas ficheiros .CSV"
              accept=".csv"
              layout="list"
              highlight
              color="secondary"
            >
              <template #files-bottom="{ removeFile, files }">
                <UButton
                  v-if="files.length > 0"
                  label="Remover ficheiro"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-trash-2"
                  class="cursor-pointer"
                  @click="removeFile()"
                />
              </template>
            </UFileUpload>

            <UButton
              color="secondary"
              class="cursor-pointer w-full sm:w-auto"
              icon="i-lucide-upload-cloud"
              size="lg"
              :loading="isLoading"
              :disabled="isLoading || !selectedFile"
              @click="updateProducts"
            >
              {{ isLoading ? "A carregar..." : "Atualizar Produtos" }}
            </UButton>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>
