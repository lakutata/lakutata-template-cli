#!/usr/bin/env node

const os = require('os')
const path = require('path')
const {compile} = require('nexe')
const packageJson = require('app/package.json')
const {Glob, IsExists} = require('lakutata/helper')
const {cp, mkdir} = require('node:fs/promises')

async function copyModule(oldNodeModulesDir, newNodeModulesDir, moduleName) {
    if (!(await IsExists(newNodeModulesDir))) await mkdir(newNodeModulesDir, {recursive: true})
    const oldNodeModuleDir = path.resolve(oldNodeModulesDir, moduleName)
    await cp(oldNodeModuleDir, path.resolve(newNodeModulesDir, moduleName), {recursive: true, force: true})
}

setImmediate(async () => {
    const {Time} = require('lakutata')
    const packageJson = require('./packages/app/package.json')
    const projectDir = path.resolve(__dirname, './build')
    const inputFilename = path.resolve(projectDir, './app/App.js')
    const projectNodeModulesDir = path.resolve(projectDir, 'node_modules')
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
        ],
        verbose: true
    })
    const nativeAddons = await Glob(path.resolve(projectNodeModulesDir, '**/*.node'))
    const nativeAddonModuleNames = nativeAddons.map(nativeAddon => {
        let dirname = path.relative(projectNodeModulesDir, nativeAddon)
        let moduleName
        do {
            moduleName = dirname
            dirname = path.dirname(dirname)
        } while (dirname !== path.dirname(path.dirname('null')))
        if (!moduleName) return null
        return moduleName
    })
    for (const nativeAddonModuleName of nativeAddonModuleNames) {
        await copyModule(projectNodeModulesDir, path.resolve(unpackPackageDir, 'node_modules'), nativeAddonModuleName)
    }
})
