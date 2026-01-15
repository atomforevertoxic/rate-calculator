import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";

export default defineConfig([
  js.configs.recommended,
  
  ...tseslint.configs.recommendedTypeChecked,
  
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  
  {
    files: ["**/*.tsx"],
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "19.0",
      },
    },
  },
  
  {
    rules: {
      "no-var": "error",                    // var -> let/const
      "prefer-const": "error",              
      "eqeqeq": ["error", "always"],       
      "no-unused-vars": "off",              
      "@typescript-eslint/no-unused-vars": [
        "error", 
        { 
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      
      "semi": ["error", "always"],
      "quotes": ["error", "double", { "avoidEscape": true }],
      "indent": ["error", 2],
      
      "curly": "error",
      "default-case": "error",
      "no-else-return": "warn",
    },
  },
  
  {
    settings: {
      "eslint.autoFixOnSave": true,
    },
  },
  
  {
    ignores: [
      "node_modules/",
      ".next/",
      "dist/",
      "build/",
      "coverage/",
      "*.config.*",
      "**/*.d.ts",
    ],
  },
]);
