<script setup lang="ts">
import { h, resolveComponent, toRaw } from "vue";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { currencyFormatter } from "~/utils/formats";
import type { TableColumn } from "@nuxt/ui";
import type { Product } from "~/types/product";

const UButton = resolveComponent("UButton");

const table = useTemplateRef("table");
const emit = defineEmits<{
  (e: "onOrder", product: Product): void;
}>();

const data = ref<Product[]>([]);
const columns: TableColumn<Product>[] = [
  // {
  //   accessorKey: "id",
  //   header: "#",
  //   cell: ({ row }) => `#${row.getValue("id")}`,
  // },
  {
    accessorKey: "category",
    header: "Categoria",
  },
  {
    accessorKey: "product_name",
    header: "Produto",
  },
  {
    accessorKey: "price_lojista",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Preço",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return currencyFormatter(
        Number.parseFloat(row.getValue("price_lojista")),
      );
    },
  },
  {
    accessorKey: "action",
    header: "Ação",
    meta: {
      class: {
        th: "text-right",
        td: "text-right font-medium",
      },
    },
    cell: ({ row }) => {
      return h(
        UButton,
        {
          color: "secondary",
          class: "cursor-pointer",
          icon: "i-lucide-shopping-cart",
          onClick: () => {
            emit("onOrder", toRaw(row.original));
          },
        },
        {
          default: () => "Encomendar",
        },
      );
    },
  },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 8,
});

const globalFilter = ref("");

const isLoading = ref(true);

onMounted(async () => {
  const products = await $fetch<Product[]>(
    "https://n8n.thur.dev/webhook/nifatech/products",
  );
  data.value = products;

  isLoading.value = false;
});
</script>

<template>
  <div
    v-motion
    class="w-full space-y-4 pb-4"
    :initial="{ opacity: 0, y: 20 }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: { duration: 500, delay: 200 },
    }"
  >
    <div class="flex px-4 py-3.5 border-b border-accented">
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filtrar..."
        color="secondary"
      />
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="data"
      :columns="columns"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
      :loading="isLoading"
      loading-color="secondary"
      loading-animation="carousel"
      class="flex-1"
    />

    <div class="flex justify-end border-t border-default pt-4 px-4">
      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        color="secondary"
        active-color="secondary"
        variant="soft"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </div>
</template>
