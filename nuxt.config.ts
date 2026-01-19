// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/ui", "@nuxt/hints", "@vueuse/motion/nuxt"],
  css: ["~/assets/css/main.css"],
  colorMode: {
    preference: "dark",
  },
  ui: {
    theme: {
      colors: [
        "primary",
        "secondary",
        "neutral",
        "success",
        "info",
        "warning",
        "error",
      ],
    },
  },
  app: {
    head: {
      link: [
        { rel: "icon", type: "image/png", href: "assets/images/logo.png" },
      ],
      htmlAttrs: {
        lang: "pt-BR",
      },
      charset: "utf-16",
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    },
  },
});
