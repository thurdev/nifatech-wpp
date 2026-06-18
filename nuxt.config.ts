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
        // Preload the brand fonts used above the fold so the login modal
        // paints immediately on reload instead of waiting on the .otf files.
        {
          rel: "preload",
          as: "font",
          type: "font/otf",
          href: "/assets/fonts/modica-2/PauloGoodeModicaLight.otf",
          crossorigin: "anonymous",
        },
        {
          rel: "preload",
          as: "font",
          type: "font/otf",
          href: "/assets/fonts/modica-2/PauloGoodeModicaSemiBold.otf",
          crossorigin: "anonymous",
        },
        {
          rel: "preload",
          as: "font",
          type: "font/woff",
          href: "/assets/fonts/Versatylo.woff",
          crossorigin: "anonymous",
        },
        { rel: "icon", type: "image/png", href: "/favicon.png" },
      ],
      htmlAttrs: {
        lang: "pt-BR",
      },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    },
  },
});
