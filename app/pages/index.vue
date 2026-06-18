<script setup>
import { useVerification } from "~/composables/verification";

const { cPhoneNumber, isVerified } = useVerification();

// Authentication state — derived during setup (not onBeforeMount) so the value
// is identical on server and client. `useCookie` is SSR-aware, so reading it
// here lets the server render the correct step and avoids a hydration mismatch.
const initialVerified = !!isVerified();
const initialPhone = cPhoneNumber.value || "";

const isAuthenticated = ref(initialVerified);
const currentStep = ref(
  // 'phone' | 'code' | 'authenticated'
  initialVerified ? "authenticated" : initialPhone ? "code" : "phone",
);
const phoneNumber = ref(initialPhone);

// Modal states
const showConfirmModal = ref(false);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const selectedProduct = ref(null);
const orderedProduct = ref(-1);

// Order in-flight state — single source of truth for loading
// Passed down to ConfirmModal (button guard) and ProductsTable (disables Reservar buttons)
const isOrderLoading = ref(false);

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

// Handle order request — guard: don't allow opening a new selection while one is in flight
const handleOrderRequest = (product) => {
  if (isOrderLoading.value) return;
  selectedProduct.value = product;
  showConfirmModal.value = true;
};

// Handle order confirmation
// isOrderLoading is the single source of truth — ConfirmModal receives it as a prop
// so its confirm button stays disabled for exactly as long as the request takes.
const handleOrderConfirm = async () => {
  if (isOrderLoading.value) return; // double-submit guard (keyboard / race)
  isOrderLoading.value = true;

  try {
    const response = await $fetch(
      "https://n8n.thur.dev/webhook/nifatech/create-order",
      {
        method: "POST",
        body: {
          phoneNumber: cPhoneNumber.value,
          productId: selectedProduct.value.id,
        },
      },
    );

    if (response.ok) {
      showSuccessModal.value = true;
      orderedProduct.value = selectedProduct.value.id;
    } else {
      // Server returned 2xx but with ok:false (e.g. product already reserved).
      // Without this branch the UI showed nothing and the product stayed in the
      // list, causing the user to attempt the same reservation again.
      showErrorModal.value = true;
    }
  } catch (error) {
    console.error("Error creating order:", error);
    showErrorModal.value = true;
  } finally {
    showConfirmModal.value = false;
    isOrderLoading.value = false;
  }
};

const handleDone = () => {
  orderedProduct.value = -1;
};

const handleCodeGoBack = () => {
  currentStep.value = "phone";
  cPhoneNumber.value = null;
};

useSeoMeta({
  title: "Lista - NifaTech",
  description:
    "Faça a sua reserva selecionando um dos produtos disponíveis na NifaTech.",
  ogTitle: "Lista - NifaTech",
  ogDescription:
    "Faça a sua reserva selecionando um dos produtos disponíveis na NifaTech.",
  themeColor: "#13f2f2",
});
</script>

<template>
  <div class="min-h-screen">
    <!-- Atmospheric backdrop behind the login flow -->
    <AuthBackground v-if="currentStep !== 'authenticated'" />

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
      <!-- Faint top glow so the authenticated view shares the brand atmosphere -->
      <div
        class="pointer-events-none fixed inset-x-0 top-0 -z-0 h-72"
        style="
          background: radial-gradient(
            60% 100% at 50% 0%,
            rgba(19, 242, 242, 0.07),
            transparent 70%
          );
        "
      />

      <AppHeader />

      <main class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div>
          <div class="mb-7 flex items-end justify-between gap-4">
            <div>
              <div
                v-motion
                class="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#13f2f2]/20 bg-[#13f2f2]/5 px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#13f2f2]"
                :initial="{ opacity: 0, y: 12 }"
                :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-[#13f2f2]" />
                Catálogo ao vivo
              </div>
              <h1
                v-motion
                class="text-2xl sm:text-3xl font-semibold tracking-tight mb-1.5"
                :initial="{ opacity: 0, y: 16 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 450, delay: 60 },
                }"
              >
                Catálogo de Produtos
              </h1>
              <p
                v-motion
                class="text-sm text-[var(--ui-text-muted)] max-w-md"
                :initial="{ opacity: 0, y: 16 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 450, delay: 140 },
                }"
              >
                Selecione um produto para efectuar a sua reserva.
              </p>
            </div>
          </div>

          <div
            v-motion
            class="rounded-2xl border border-white/[0.06] bg-[var(--ui-bg-elevated)]/40 shadow-2xl shadow-black/20 backdrop-blur-sm overflow-hidden"
            :initial="{ opacity: 0, y: 24 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 500, delay: 200 },
            }"
          >
            <ProductsTable
              :ordered-product="orderedProduct"
              :ordering="isOrderLoading"
              @on-order="handleOrderRequest"
              @on-done="handleDone"
            />
          </div>
        </div>
      </main>
    </template>

    <!-- Confirm Order Modal -->
    <ConfirmModal
      v-model="showConfirmModal"
      :product="selectedProduct"
      :loading="isOrderLoading"
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
