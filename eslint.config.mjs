import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // React Three Fiber: three.js objects (uniforms, materials) are mutated every frame by design
    files: ["src/components/three/**/*.tsx"],
    rules: { "react-hooks/immutability": "off" },
  },
  {
    // framework-free effect modules ported 1:1 from website-v2 (vanilla JS, no React inside)
    files: ["src/components/**/*.js"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    // the services' demos draw small mock-up pages: a plain <img> is part of the picture
    files: ["src/components/sections/services/panels/*.tsx"],
    rules: { "@next/next/no-img-element": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "scripts/**"]),
]);

export default eslintConfig;
