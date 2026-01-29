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
  (e: "onDone"): void;
}>();
const props = defineProps<{
  orderedProduct: number;
}>();

const data = ref<Product[]>([]);

// Computed que agrupa produtos e mostra sempre o mais caro disponível de cada tipo
const groupedProducts = computed(() => {
  // Agrupa produtos por nome
  const grouped = data.value.reduce(
    (acc, product) => {
      const key = product.product_name.trim().toLowerCase();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(product);
      return acc;
    },
    {} as Record<string, Product[]>,
  );

  // Para cada grupo, ordena por preço (maior primeiro) e pega o primeiro
  const products = Object.values(grouped).map((products) => {
    return products.sort((a, b) => b.price_lojista - a.price_lojista)[0];
  });

  // Ordena por categoria: APARELHO, PERFUME, DECANT
  return products.sort((a, b) => {
    const categoryOrder = { APARELHO: 1, PERFUME: 2, DECANT: 3 };
    const orderA =
      categoryOrder[a?.category as keyof typeof categoryOrder] || 999;
    const orderB =
      categoryOrder[b?.category as keyof typeof categoryOrder] || 999;
    return orderA - orderB;
  });
});
const columns: TableColumn<Product>[] = [
  // {
  //   accessorKey: "id",
  //   header: "#",
  //   cell: ({ row }) => `#${row.getValue("id")}`,
  // },

  {
    accessorKey: "action",
    header: "Ação",
    meta: {
      class: {
        th: "text-left",
        td: "text-left font-medium",
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
          default: () => "Reservar",
        },
      );
    },
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
    accessorKey: "category",
    header: "Categoria",
  },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 100,
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

watch(
  () => props.orderedProduct,
  (newVal) => {
    if (newVal !== undefined && newVal !== -1) {
      data.value = data.value.filter((product) => product.id !== newVal);
      setTimeout(() => {
        emit("onDone");
      }, 5000);
    }
  },
);
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
      :data="groupedProducts"
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
