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
  ordering?: boolean; // true while a reservation request is in-flight
}>();

const data = ref<Product[]>([]);
const activeCategory = ref("TODOS");
const globalFilter = ref("");
const isLoading = ref(true);

// Category ordering & badge styles
const categoryOrder = { APARELHO: 1, PERFUME: 2, DECANT: 3 } as const;

const categoryBadgeClass: Record<string, string> = {
  APARELHO:
    "text-sky-400 bg-sky-400/10 border-sky-400/20 dark:text-sky-300 dark:bg-sky-400/10",
  PERFUME:
    "text-amber-400 bg-amber-400/10 border-amber-400/20 dark:text-amber-300",
  DECANT:
    "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 dark:text-emerald-300",
};

// Agrupa produtos por nome, mantendo o mais caro disponível de cada tipo
const groupedProducts = computed(() => {
  const grouped = data.value.reduce(
    (acc, product) => {
      const key = product.product_name.trim().toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    },
    {} as Record<string, Product[]>,
  );

  return Object.values(grouped)
    .map((products) => products.sort((a, b) => b.price_lojista - a.price_lojista)[0])
    .filter((p): p is Product => p !== undefined)
    .sort((a, b) => {
      const orderA = categoryOrder[a.category as keyof typeof categoryOrder] ?? 999;
      const orderB = categoryOrder[b.category as keyof typeof categoryOrder] ?? 999;
      return orderA - orderB;
    });
});

// Counts per category for tab badges
const categoryCounts = computed(() => {
  const counts: Record<string, number> = { TODOS: groupedProducts.value.length };
  for (const p of groupedProducts.value) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }
  return counts;
});

const availableCategories = computed(() => {
  const cats = [...new Set(groupedProducts.value.map((p) => p.category))].sort(
    (a, b) =>
      (categoryOrder[a as keyof typeof categoryOrder] ?? 999) -
      (categoryOrder[b as keyof typeof categoryOrder] ?? 999),
  );
  return ["TODOS", ...cats];
});

// Items for the category dropdown (replaces the old text-tab row)
const categorySelectItems = computed(() =>
  availableCategories.value.map((cat) => ({
    label: cat === "TODOS" ? "Todas as categorias" : cat,
    value: cat,
    count: categoryCounts.value[cat] ?? 0,
  })),
);

// Category pre-filter (UTable global-filter handles text search on top)
const filteredByCategory = computed(() => {
  if (activeCategory.value === "TODOS") return groupedProducts.value;
  return groupedProducts.value.filter((p) => p.category === activeCategory.value);
});

const columns: TableColumn<Product>[] = [
  {
    accessorKey: "action",
    header: "Ação",
    meta: {
      class: {
        th: "text-left",
        td: "text-left",
      },
    },
    cell: ({ row }) =>
      h(
        UButton,
        {
          color: "secondary",
          variant: "soft",
          size: "sm",
          // Disabled while any order is in-flight (props.ordering) so the user
          // cannot switch the selected product mid-request or trigger a second one.
          disabled: props.ordering,
          class: props.ordering
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer font-medium rounded-lg transition-all duration-200 hover:shadow-[0_0_18px_-6px_rgba(19,242,242,0.6)] hover:-translate-y-px active:translate-y-0",
          icon: "i-lucide-bookmark",
          onClick: () => {
            if (!props.ordering) emit("onOrder", toRaw(row.original));
          },
        },
        { default: () => "Reservar" },
      ),
  },
  {
    accessorKey: "product_name",
    header: "Produto",
    cell: ({ row }) =>
      h(
        "span",
        { class: "font-medium text-sm" },
        row.getValue("product_name"),
      ),
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
        class: "-mx-2.5 text-xs",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      const priceLojista = Number.parseFloat(row.getValue("price_lojista"));
      const priceNt = Number.parseFloat(
        row.original.price_nt as unknown as string,
      );

      const elements = [
        h(
          "span",
          { class: "text-xs text-[var(--ui-text-muted)]" },
          `Lojista: ${currencyFormatter(priceLojista)}`,
        ),
      ];

      if (priceNt && priceNt > 0) {
        elements.push(
          h(
            "span",
            {
              class:
                "text-xs font-semibold text-[#13f2f2]",
            },
            `Lote Promocional: ${currencyFormatter(priceNt)}`,
          ),
        );
      }

      return h("div", { class: "flex flex-col gap-0.5" }, elements);
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => {
      const cat = row.getValue("category") as string;
      const cls =
        categoryBadgeClass[cat] ??
        "text-neutral-400 bg-neutral-400/10 border-neutral-400/20";
      return h(
        "span",
        {
          class: `inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border tracking-wide ${cls}`,
        },
        cat,
      );
    },
  },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 100,
});

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

// Reset page when category or filter changes
watch([activeCategory, globalFilter], () => {
  table.value?.tableApi?.setPageIndex(0);
});
</script>

<template>
  <div class="nifa-table w-full space-y-0 pb-4">
    <!-- Filter bar: search + category dropdown (replaces the text-tab row) -->
    <div
      class="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[var(--ui-border)]"
    >
      <UInput
        v-model="globalFilter"
        class="flex-1 min-w-[12rem] max-w-xs"
        placeholder="Pesquisar produto..."
        icon="i-lucide-search"
        color="secondary"
        size="sm"
      />

      <USelect
        v-model="activeCategory"
        :items="categorySelectItems"
        value-key="value"
        color="secondary"
        size="sm"
        icon="i-lucide-layers"
        class="min-w-[12rem]"
      >
        <template #item-label="{ item }">
          <span class="flex w-full items-center justify-between gap-3">
            <span>{{ item.label }}</span>
            <span class="text-[10px] text-[var(--ui-text-muted)] tabular-nums">
              {{ item.count }}
            </span>
          </span>
        </template>
      </USelect>

      <span
        v-if="!isLoading"
        class="ml-auto text-xs text-[var(--ui-text-muted)] tabular-nums"
      >
        {{ filteredByCategory.length }} produto{{
          filteredByCategory.length !== 1 ? "s" : ""
        }}
      </span>
    </div>

    <!-- Table -->
    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="filteredByCategory"
      :columns="columns"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
      :loading="isLoading"
      loading-color="secondary"
      loading-animation="carousel"
      class="flex-1"
    >
      <template #empty>
        <div class="flex flex-col items-center justify-center py-14 text-center">
          <div
            class="w-12 h-12 rounded-2xl bg-[var(--ui-bg-elevated)] border border-white/[0.06] flex items-center justify-center mb-4"
          >
            <UIcon
              name="i-lucide-package-search"
              class="w-6 h-6 text-[var(--ui-text-muted)]"
            />
          </div>
          <p class="text-sm font-medium">Nenhum produto encontrado</p>
          <p class="text-xs text-[var(--ui-text-muted)] mt-1 max-w-[15rem]">
            Tente ajustar a pesquisa ou seleccionar outra categoria.
          </p>
          <UButton
            v-if="globalFilter || activeCategory !== 'TODOS'"
            class="mt-4 cursor-pointer"
            color="secondary"
            variant="soft"
            size="sm"
            icon="i-lucide-rotate-ccw"
            @click="
              globalFilter = '';
              activeCategory = 'TODOS';
            "
          >
            Limpar filtros
          </UButton>
        </div>
      </template>
    </UTable>

    <!-- Pagination -->
    <div
      class="flex justify-end border-t border-[var(--ui-border)] pt-4 px-4"
    >
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

<style scoped>
/* Refine the underlying Nuxt UI table: clearer header, smooth row hover with a
   faint cyan wash, and a subtle accent line that appears on the row you point at. */
.nifa-table :deep(thead th) {
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
}

.nifa-table :deep(tbody tr) {
  position: relative;
  transition:
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.nifa-table :deep(tbody tr:hover) {
  background-color: rgba(19, 242, 242, 0.04);
}

/* left accent bar on hover */
.nifa-table :deep(tbody tr td:first-child) {
  box-shadow: inset 2px 0 0 transparent;
  transition: box-shadow 0.18s ease;
}
.nifa-table :deep(tbody tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 var(--nifa-cyan);
}
</style>
