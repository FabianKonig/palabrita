import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // scripts/video: CommonJS und Browser-Code für das Erklärvideo, siehe scripts/video/README.md
  {
    ignores: [
      "dist",
      "node_modules",
      ".claude",
      "scripts/video",
      ".video-work",
      ".venv",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { "react-hooks": reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
);
