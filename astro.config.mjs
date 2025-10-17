// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://khoinguyendes23.github.io",
  base: "/Kant_Nguyen_Astro_Blog",
  integrations: [tailwind(), react(), mdx()],
  devToolbar: {
    enabled: true,
  },
});
