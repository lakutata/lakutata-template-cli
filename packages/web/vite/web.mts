import {defineConfig, mergeConfig} from 'vite'
import commonConfig from './common'
import {join} from 'path'

export default mergeConfig(commonConfig, defineConfig({
    base: './',
    define: {
        SERVER_ENV: JSON.stringify('renderer')
    },
    build: {
        outDir: join(__dirname, '../dist/web'),
        emptyOutDir: true
    },
    server: {
        port: 5188
    }
}))
