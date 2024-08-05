import {defineConfig} from 'vite'
import {join} from 'path'

export default defineConfig({
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@': join(__dirname, '../src')
        }
    },
    build: {
        emptyOutDir: true
    }
})
