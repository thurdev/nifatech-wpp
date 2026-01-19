<script setup>
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
const showErrorModal = ref(false);
const selectedProduct = ref(null);
const orderedProduct = ref(-1);

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
const handleOrderConfirm = async () => {
  try {
    const response = await $fetch(
      "https://n8n.thur.dev/webhook/nifatech/create-order",
      {
        method: "POST",
        body: {
          phoneNumber: phoneNumber.value,
          productId: selectedProduct.value.id,
        },
      },
    );

    if (response.ok) {
      showSuccessModal.value = true;
      // Remove product from the products table
      orderedProduct.value = selectedProduct.value.id;
    }
  } catch (error) {
    console.error("Error creating order:", error);
    showErrorModal.value = true;
  } finally {
    showConfirmModal.value = false;
  }
};

const handleDone = () => {
  orderedProduct.value = -1;
};

const handleCodeGoBack = () => {
  currentStep.value = "phone";
  cPhoneNumber.value = null;
};

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
            class="text-2xl font-semibold light:text-black mb-2"
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
          >
            Encomendas
          </h1>
          <p
            v-motion
            class="dark:text-white/50 mb-8"
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 500, delay: 100 },
            }"
          >
            Faça seu pedido selecionando um dos produtos abaixo.
          </p>

          <ProductsTable
            :ordered-product="orderedProduct"
            @on-order="handleOrderRequest"
            @on-done="handleDone"
          />
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

    <!-- Error Modal -->
    <ErrorModal
      v-model="showErrorModal"
      :product="selectedProduct"
      @close="showErrorModal = false"
    />
  </div>
</template>
