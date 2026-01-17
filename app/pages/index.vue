
<template>
  <div class="p-4 ">
    <div class="w-full flex justify-center items-center gap-4 pb-4">
      <img src="@/assets/images/nifa-logo.png" class="w-16">
      <p class="font-versatylo text-2xl font-bold">nifa tech</p>
    </div>
    <ProductsTable :data="tableData" :is-loading="isLoading"/>
  </div>
</template>
<script setup lang="ts">
import type { Product } from '~/types/product';

const isLoading = ref(true);
const tableData = ref<Product[]>([]);


onMounted(async () => {
  try {
    const data = await $fetch<Promise<Product[]>>("https://n8n.thur.dev/webhook/nifatech/products")
    tableData.value = data
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false;
  }
})


</script>
