<script setup>
import { ref, provide } from "vue";
import { useVerification } from "~/composables/verification";

const { cPhoneNumber, isVerified } = useVerification();
// import ProductTable from "~/components/ProductTable.vue";

// Authentication state
const isAuthenticated = ref(false);
const currentStep = ref("phone"); // 'phone', 'code', 'authenticated'
const phoneNumber = ref("");

// Modal states
const showConfirmModal = ref(false);
const showSuccessModal = ref(false);
const selectedProduct = ref(null);

// Products data
const products = ref([
  {
    id: 1,
    name: 'MacBook Pro 14"',
    category: "Computadores",
    price: 2499.0,
    stock: 12,
  },
  {
    id: 2,
    name: "iPhone 15 Pro Max",
    category: "Smartphones",
    price: 1399.0,
    stock: 25,
  },
  {
    id: 3,
    name: "AirPods Pro 2",
    category: "Acessórios",
    price: 279.0,
    stock: 50,
  },
  { id: 4, name: "iPad Air M2", category: "Tablets", price: 799.0, stock: 18 },
  {
    id: 5,
    name: "Apple Watch Ultra 2",
    category: "Wearables",
    price: 899.0,
    stock: 8,
  },
  {
    id: 6,
    name: "Magic Keyboard",
    category: "Acessórios",
    price: 349.0,
    stock: 30,
  },
  {
    id: 7,
    name: "Studio Display",
    category: "Monitores",
    price: 1799.0,
    stock: 5,
  },
  {
    id: 8,
    name: "Mac Mini M2 Pro",
    category: "Computadores",
    price: 1499.0,
    stock: 15,
  },
]);

// Handle phone submission
const handlePhoneSubmit = (phone) => {
  phoneNumber.value = phone;
  currentStep.value = "code";
};

// Handle code verification
const handleCodeVerify = () => {
  isAuthenticated.value = true;
  currentStep.value = "authenticated";
};

// Handle order request
const handleOrderRequest = (product) => {
  selectedProduct.value = product;
  showConfirmModal.value = true;
};

// Handle order confirmation
const handleOrderConfirm = () => {
  products.value = products.value.filter(
    (p) => p.id !== selectedProduct.value.id,
  );
  showConfirmModal.value = false;
  showSuccessModal.value = true;
};

const handleCodeGoBack = () => {
  currentStep.value = "phone";
  cPhoneNumber.value = null;
};

// Provide products to child components
provide("products", products);

onBeforeMount(() => {
  // Check if user is already verified
  if (isVerified()) {
    isAuthenticated.value = true;
    currentStep.value = "authenticated";
  }

  // Pre-fill phone number if available
  const savedPhone = cPhoneNumber.value;
  if (savedPhone) {
    phoneNumber.value = savedPhone;
  }

  if (!isAuthenticated.value && savedPhone) {
    currentStep.value = "code";
  }
});
</script>

<template>
  <div class="min-h-screen">
    <!-- Phone Modal -->
    <PhoneModal v-if="currentStep === 'phone'" @submit="handlePhoneSubmit" />

    <!-- Code Verification Modal -->

    <CodeModal
      v-if="currentStep === 'code'"
      @verify="handleCodeVerify"
      @back="handleCodeGoBack"
    />

    <!-- Authenticated Area -->
    <template v-if="isAuthenticated">
      <AppHeader />

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h1
            v-motion
            class="text-2xl font-semibold mb-2"
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
          >
            Encomendas
          </h1>
          <p
            v-motion
            class="text-white/50 mb-8"
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 500, delay: 100 },
            }"
          >
            Faça seu pedido selecionando um dos produtos abaixo.
          </p>

          <ProductsTable />
          <!-- <ProductTable :products="products" @order="handleOrderRequest" /> -->
        </div>
      </main>
    </template>

    <!-- Confirm Order Modal -->
    <ConfirmModal
      v-model="showConfirmModal"
      :product="selectedProduct"
      @confirm="handleOrderConfirm"
      @cancel="showConfirmModal = false"
    />

    <!-- Success Modal -->
    <SuccessModal
      v-model="showSuccessModal"
      :product="selectedProduct"
      @close="showSuccessModal = false"
    />
  </div>
</template>
