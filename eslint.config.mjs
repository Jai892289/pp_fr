import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // ✅ Extend Next.js + TS configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ✅ Add your custom rules and ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "*table.tsx",

      // Custom ignored files
      "components/layout/sidebar.tsx",
      "components/layout/sidebar copy.tsx",
      "app/dashboard/panel-setup/ulb-type/ulbType-table.tsx",
      "app/dashboard/panel-setup/menu-creation/menu-table.tsx",
    ],
    rules: {
      // 🚨 Relax strict rules temporarily if needed:
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
