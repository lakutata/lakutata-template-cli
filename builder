#!/usr/bin/env node
const os = require('os')
const path = require('path')

const builderConfig = {
    linux: {
        desktop: {
            Name: '{$APP_NAME}'
        },
        executableArgs: [
            '--enable-features=UseOzonePlatform',
            '--ozone-platform=wayland',
            '--no-sandbox',
            '--ignore-connections-limit=localhost',
            '--disable-http-cache',
            '--ignore-certificate-errors'
        ]
    },
    deb: {
        afterInstall: 'scripts/after-install.sh',
        afterRemove: 'scripts/after-remove.sh'
    }
}

setImmediate(async () => {
    const {build, Platform, Arch} = require('electron-builder')
    const {Time} = require('lakutata')
    const packageJson = require('./packages/app/package.json')
    const platform = os.platform()
    let architecture
    switch (os.arch()) {
        case 'arm':
            architecture = Arch.armv7l
            break
        case 'arm64':
            architecture = Arch.arm64
            break
        case'ia32':
            architecture = Arch.ia32
            break
        case 'x64':
            architecture = Arch.x64
            break
        case 'amd64':
            architecture = Arch.x64
            break
        default:
            architecture = Arch.universal
    }
    let targets
    switch (platform) {
        case 'linux':
            targets = Platform.LINUX.createTarget(['deb'], architecture)
            break
        case 'darwin':
            targets = Platform.MAC.createTarget(['dmg'], architecture)
            break
        case 'win32':
            targets = Platform.WINDOWS.createTarget(['nsis', 'portable'], architecture)
            break
        default:
            targets = undefined
    }
    const appLogoFilename = path.resolve(__dirname, './packages/resources/logo.png')
    await build({
        projectDir: path.resolve(__dirname, './build'),
        targets: targets,
        config: {
            appId: packageJson.appId,
            productName: packageJson.appName,
            buildVersion: packageJson.version,
            copyright: `Copyright © ${new Time().format('YYYY')} ${typeof packageJson.author === 'string' ? packageJson.author : packageJson.author.name}`,
            icon: appLogoFilename,
            files: [
                'package.json',
                'app/**/*',
                'node_modules/*.js',
                'node_modules/*.cjs',
                'node_modules/*.mjs',
                'node_modules/**/*.json',
                'node_modules/**/*.node',
                'node_modules/**/*.js',
                'node_modules/**/*.wasm',
                'node_modules/**/*.data'
            ],
            removePackageScripts: true,
            removePackageKeywords: true,
            npmRebuild: true,
            nodeGypRebuild: false,
            buildDependenciesFromSource: false,
            ...builderConfig
        }
    })
})
