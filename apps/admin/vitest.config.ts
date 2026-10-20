import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@favpoll/types",
        replacement: resolve(__dirname, "../../packages/types/index.ts"),
      },
      // The subpath must precede the bare name (prefix matching).
      {
        find: "@favpoll/charity-register/charity-commission",
        replacement: resolve(
          __dirname,
          "../../packages/charity-register/charity-commission.ts"
        ),
      },
      {
        find: "@favpoll/charity-register",
        replacement: resolve(
          __dirname,
          "../../packages/charity-register/index.ts"
        ),
      },
      { find: "@", replacement: resolve(__dirname, ".") },
    ],
  },
  test: {
    environment: "node",
    globals: true,
    include: ["**/__tests__/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
  },
})
