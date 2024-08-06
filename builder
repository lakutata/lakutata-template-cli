#!/usr/bin/env node

const os = require('os')
const path = require('path')
const {compile} = require('nexe')
const packageJson = require('app/package.json')
const {Glob, IsExists} = require('lakutata/helper')
const {finished} = require('node:stream/promises')
const {createWriteStream} = require('node:fs')
const {cp, mkdir, readFile, rm} = require('node:fs/promises')
const execa = require('execa')
const {dynamicImport} = require('@cspell/dynamic-import')
let architecture
switch (os.arch()) {
    case 'ia32': {
        architecture = 'i386'
    }
        break
    case 'x64': {
        architecture = 'amd64'
    }
        break
    case 'arm': {
        architecture = 'armhf'
    }
        break
    case 'arm64': {
        architecture = 'arm64'
    }
        break
    case 'ppc64': {
        architecture = 'ppc64el'
    }
        break
    case 's390x': {
        architecture = 's390x'
    }
        break
    default: {
        architecture = 'all'
    }
}

function getAuthorByPackageJson(packageJson) {
    const rawAuthor = packageJson.author
    let name = 'anonymous'
    let email = 'anonymous@email.com'
    if (rawAuthor) {
        if (typeof rawAuthor === 'string') {
            const regex = /<([^>]+)>/g
            const match = regex.exec(packageJson.author)
            if (match) {
                name = rawAuthor.replace(match[0], '').trim()
                email = match[1]
            }
        } else {
            name = rawAuthor.name ? rawAuthor.name : name
            email = rawAuthor.email ? rawAuthor.email : email
        }
    }
    return {
        name: name,
        email: email
    }
}

async function createDebPackage(projectDistDir, unpackPackageDir) {
    const debian = await dynamicImport('@sirherobrine23/dpkg', __dirname)
    const packageJson = require('app/package.json')
    const authorInfo = getAuthorByPackageJson(packageJson)
    const dpkg = debian.dpkg
    const postinstScriptFilename = path.resolve(__dirname, 'scripts/after-install.sh')
    const postrmScriptFilename = path.resolve(__dirname, 'scripts/after-remove.sh')
    const postinst = (await IsExists(postinstScriptFilename)) ? await readFile(postinstScriptFilename, {encoding: 'utf-8'}) : '#!/bin/bash\n'
    const postrm = (await IsExists(postrmScriptFilename)) ? await readFile(postrmScriptFilename, {encoding: 'utf-8'}) : '#!/bin/bash\n'
    const tmpDataPackageDir = path.resolve(os.tmpdir(), `createDebPackage_${Date.now()}`)
    const installDir = path.resolve(tmpDataPackageDir, './opt')
    await mkdir(installDir, {recursive: true})
    await cp(unpackPackageDir, path.resolve(installDir, packageJson.appName), {force: true, recursive: true})
    const debFilename = path.resolve(projectDistDir, `${packageJson.appName}_${architecture}_${packageJson.version}.deb`)
    await finished(dpkg.createPackage({
        dataFolder: tmpDataPackageDir,
        control: {
            Package: packageJson.appName,
            Version: packageJson.version,
            Architecture: architecture,
            Description: packageJson.description ? packageJson.description : '',
            Depends: [],
            Maintainer: {
                Name: authorInfo.name,
                Email: authorInfo.email
            }
        },
        scripts: {
            postinst: postinst,
            postrm: postrm
        },
        compress: {
            // data: 'passThrough',
            // control: 'passThrough'
            data: 'gzip',
            control: 'gzip'
        }
    }).pipe(createWriteStream(debFilename)))
    await rm(tmpDataPackageDir, {recursive: true, force: true})
}

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
    const projectDistDir = path.resolve(projectDir, './dist')
    const unpackPackageDir = path.resolve(projectDistDir, './unpack-package')
    const {stdout} = await execa('which', ['python3'])
    const pythonBinPath = stdout ? stdout : undefined
    await compile({
        cwd: projectDir,
        input: inputFilename,
        build: true,
        output: path.resolve(projectDir, './dist/unpack-package', packageJson.appName),
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
        verbose: true,
        python: pythonBinPath,
        make: [`-j${os.cpus().length}`]
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
    await createDebPackage(projectDistDir, unpackPackageDir)
})
