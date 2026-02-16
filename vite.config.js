import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "node:path"

import packageJson from "./package.json"

const __dirname = import.meta.dirname

export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        force: true,
    },
    define: {
        'import.meta.env.VITE_APP_NAME': JSON.stringify(packageJson.name),
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    },
    resolve: {
        alias: {
            "@_src": path.resolve(__dirname, 'src'),
            "@_views": path.resolve(__dirname, "./src/views"),
            "@_data": path.resolve(__dirname, "./src/data"),
            "@_map": path.resolve(__dirname, "./src/map"),
            "@_resources": path.resolve(__dirname, "./src/resources"),
            "@_manager": path.resolve(__dirname, "./src/manager"),
            "@_components": path.resolve(__dirname, "./src/components"),
            "@team4am/fp-core": path.resolve(__dirname, "./src/core.jsx"),
        }
    },
    build: {
        rollupOptions: {
            external: ['pg', 'dotenv']
        }
    },
})
