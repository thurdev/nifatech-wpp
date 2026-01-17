<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { currencyFormatter } from "~/utils/formats";
import type { Product } from "~/types/product";

const isOrderModalOpen = ref(false);
const selectedProduct = ref<string>();

defineProps<{
  data: Product[];
  isLoading: boolean;
}>();

const UButton = resolveComponent("UButton");

const columns: TableColumn<Product>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => row.getValue("category"),
  },
  {
    accessorKey: "product_name",
    header: "Produto",
    cell: ({ row }) => row.getValue("product_name"),
  },
  {
    accessorKey: "price_lojista",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Preço Lojista",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => currencyFormatter(row.getValue("price_lojista")),
  },
  {
    accessorKey: "price_clients",
    header: "Preço Clientes",
    cell: ({ row }) => currencyFormatter(row.getValue("price_clients")),
  },
  {
    accessorKey: "bought_for",
    header: "Comprado por",
    cell: ({ row }) => currencyFormatter(row.getValue("bought_for")),
  },
  {
    accessorKey: "actions",
    header: "Ações",
    cell: ({ row }) => {
      return h(UButton, {
        color: "primary",
        variant: "solid",
        label: "Encomendar",
        icon: "i-lucide-shopping-cart",
        class: "-mx-2.5 hover:cursor-pointer",
        onClick: () => {
          isOrderModalOpen.value = true;
          selectedProduct.value = row.getValue("id");
        },
      });
    },
  },
];

const sorting = ref([
  {
    id: "price_lojista",
    desc: false,
  },
]);

watch([isOrderModalOpen], (newVal) => {
  if (!newVal) {
    selectedProduct.value = "";
  }
});

const handleOnConfirm = () => {
  isOrderModalOpen.value = false;

  // If no product selected do not register
  if (!selectedProduct.value) {
    return;
  }

  // TODO Call webhook to send whatsapp message & disable product from db
  $fetch("https://n8n.thur.dev/webhook/nifatech/order", {
    method: "POST",
    body: {
      productId: selectedProduct.value,
    },
  });
  // TODO Create a product status column on table and only retrieve the ones that are available (date from last updated date)

  selectedProduct.value = "";
};
</script>

<template>
  <UTable
    v-model:sorting="sorting"
    :data="data"
    :columns="columns"
    :loading="isLoading"
    loading-color="primary"
    loading-animation="carousel"
    class="flex-1"
  />

  <ConfirmOrder :is-open="isOrderModalOpen" @confirm="handleOnConfirm" />
</template>
