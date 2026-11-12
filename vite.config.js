import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true, // Tắt cảnh báo từ node_modules (Bootstrap)
                silenceDeprecations: [
                    "import",
                    "global-builtin",
                    "color-functions",
                    "if-function",
                ],
            },
        },
    },
});
