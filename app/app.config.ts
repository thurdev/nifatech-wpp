export default defineAppConfig({
  ui: {
    // Brand identity: map Nuxt UI accents to the neon-cyan palette (#13f2f2)
    // defined in assets/css/main.css so `secondary`/`primary` no longer fall
    // back to the default blue/green that clashed with the marketing site.
    colors: {
      primary: "neon",
      secondary: "neon",
      neutral: "neutral",
    },
  },
});
