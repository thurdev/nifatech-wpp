<script setup>
import { computed } from "vue";

const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["order"]);

const formatPrice = (price) => {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const getStockStatus = (stock) => {
  if (stock <= 5) return { label: "Baixo", class: "bg-red-100 text-red-700" };
  if (stock <= 15)
    return { label: "Médio", class: "bg-amber-100 text-amber-700" };
  return { label: "Alto", class: "bg-green-100 text-green-700" };
};
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
  >
    <!-- Table Header -->
    <div
      class="px-6 py-4 border-b border-slate-200 flex items-center justify-between"
    >
      <div>
        <h2 class="text-lg font-semibold text-slate-900">
          Produtos Disponíveis
        </h2>
        <p class="text-sm text-slate-500">
          {{ products.length }} produtos em stock
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg
            class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            class="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50">
            <th
              class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Produto
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Categoria
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Preço
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Stock
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Ação
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="product in products"
            :key="product.id"
            class="hover:bg-slate-50/50 transition-colors"
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0, transition: { duration: 300 } }"
            :leave="{ opacity: 0, x: 20, transition: { duration: 200 } }"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <span class="font-medium text-slate-900">{{
                  product.name
                }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="text-slate-600">{{ product.category }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="font-semibold text-slate-900">{{
                formatPrice(product.price)
              }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <span class="text-slate-600">{{ product.stock }} un.</span>
                <span
                  :class="[
                    getStockStatus(product.stock).class,
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                  ]"
                >
                  {{ getStockStatus(product.stock).label }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <button
                @click="$emit('order', product)"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Encomendar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="products.length === 0" class="px-6 py-16 text-center">
      <div
        class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
      >
        <svg
          class="w-8 h-8 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-slate-900 mb-1">Sem produtos</h3>
      <p class="text-slate-500">Todos os produtos foram encomendados.</p>
    </div>
  </div>
</template>
