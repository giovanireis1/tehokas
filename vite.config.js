import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, 'resources/js'),
        },
    },
    customLogger: (() => {
        const logger = import('vite').then(m => m.createLogger());
        return undefined; // Deixar o Vite gerenciar ou ignorar
    })(),
    server: {
        // Ignora warnings depreciados de plugins de terceiros no console
        warmup: {
            clientFiles: ['./resources/js/app.jsx'],
        },
    },
});