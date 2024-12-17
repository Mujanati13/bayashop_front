import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  preview: {
    port: 3004,        // Set preview port to 3000
    strictPort: true,  // Ensure Vite uses port 3000 only
  },
  server: {
    port: 3004,        // Set development server port to 3000
    strictPort: true,  // Prevent fallback to another port
    host: true,        // Allows access from external IPs
    origin: "http://0.0.0.0:3004", // Public URL origin
  },
});
