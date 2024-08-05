#!/usr/bin/env node

const os = require('os')
const path = require('path')
const {compile} = require('nexe')
const packageJson = require('app/package.json')

setImmediate(async () => {
    const {Time} = require('lakutata')
    const packageJson = require('./packages/app/package.json')
    const projectDir = path.resolve(__dirname, './build')
    const inputFilename = path.resolve(projectDir, './app/App.js')
    const unpackPackageDir = path.resolve(projectDir, './dist/unpack-package')
    await compile({
        cwd: projectDir,
        input: inputFilename,
        build: true,
        output: path.resolve(projectDir, './dist/unpack-package', packageJson.appId),
        targets: [{
            platform: os.platform(),
            arch: os.arch()
        }],
        resources: [
            'package.json',
            'app/**/*',
            'node_modules/**/*',
            '!node_modules/**/*.node',
            'node_modules/*.js',
            'node_modules/*.cjs',
            'node_modules/*.mjs',
            'node_modules/**/*.json',
            'node_modules/**/*.js',
            'node_modules/**/*.wasm',
            'node_modules/**/*.data'
        ]
    })
})
