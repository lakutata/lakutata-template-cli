const {rollup} = require('rollup')
const path = require('path')
const {glob} = require('glob')
const resolve = require('@rollup/plugin-node-resolve')
const json = require('@rollup/plugin-json')
const copy = require('rollup-plugin-copy')
const {mkdir, writeFile, readdir} = require('node:fs/promises')
const {statSync} = require('node:fs')
const {IsExists} = require('lakutata/helper')
const normalizeString = (str) => Buffer.from(str).filter((v, i) => i ? true : v !== 0).toString()
const packagesDir = normalizeString(path.resolve(process.cwd(), './packages'))
const outNodeModulesDir = normalizeString(path.resolve(process.cwd(), './node_modules'))
const currentWorkingDir = normalizeString(path.resolve(process.cwd(), './packages/app/build'))
const outputDirname = 'build'

async function getDependencies(nodeModulesDir, packageJsonFilename, gotDependencies = []) {
    let dependencies = []
    if (!(await IsExists(packageJsonFilename))) return dependencies
    const packageJson = require(packageJsonFilename)
    if (gotDependencies.includes(packageJson.name)) return dependencies
    gotDependencies.push(packageJson.name)
    let totalSubDependencies = []
    if (packageJson.dependencies && Object.keys(packageJson.dependencies).length) {
        dependencies = Object.keys(packageJson.dependencies)
        for (const dependency of dependencies) {
            const subDevDependencies = await getDependencies(nodeModulesDir, path.resolve(nodeModulesDir, dependency, 'package.json'), gotDependencies)
            totalSubDependencies = [...totalSubDependencies, ...subDevDependencies]
        }
    }
    return [...dependencies, ...totalSubDependencies]
}

setImmediate(async () => {
    const packages = await readdir(packagesDir)
    const items = await readdir(outNodeModulesDir)
    const dependencies = new Set()
    const packageJsonFilenames = packages.map(packageName => path.resolve(packagesDir, packageName, 'package.json'))
    packageJsonFilenames.push(normalizeString(path.resolve(process.cwd(), './package.json')))
    for (const packageJsonFilename of packageJsonFilenames) {
        const packageDependencies = await getDependencies(outNodeModulesDir, packageJsonFilename)
        packageDependencies.forEach(packageDependency => dependencies.add(packageDependency))
    }
    const nodeModuleNames = items.filter(item =>
        !packages.includes(item)
        && !item.startsWith('.')
        && statSync(path.resolve(outNodeModulesDir, item)).isDirectory()
        && dependencies.has(item)
    )

    const jsBundle = await rollup({
        logLevel: 'warn',
        onwarn: function (warning, handler) {
            if (warning.code === 'THIS_IS_UNDEFINED') return
            handler(warning)
        },
        input: glob.sync('packages/app/build/**/*.js'),
        treeshake: false,
        preserveSymlinks: false,
        plugins: [
            json(),
            resolve({browser: false, preferBuiltins: true}),
            copy({
                targets: [
                    {
                        src: 'packages/app/package.json', dest: outputDirname, transform: (contents) => {
                            const rootPackageJson = require('./package.json')
                            const packageJson = JSON.parse(contents.toString())
                            packageJson.main = './app/App.js'
                            packageJson.name = packageJson.appName
                            packageJson.dependencies = {...packageJson.dependencies, ...rootPackageJson.dependencies}
                            packageJson.devDependencies = {...packageJson.devDependencies, ...rootPackageJson.devDependencies}
                            return Buffer.from(JSON.stringify(packageJson, null, 2))
                        }
                    },
                    {src: 'scripts', dest: outputDirname},
                    {src: 'packages/*', dest: path.resolve(outputDirname, 'node_modules')},
                    ...nodeModuleNames.map(item => {
                        return {src: `node_modules/${item}`, dest: path.resolve(outputDirname, 'node_modules')}
                    })
                ]
            })
        ]
    })
    const {output} = await jsBundle.generate({
        format: 'cjs',
        compact: false,
        generatedCode: 'es2015',
        entryFileNames: (chunkInfo) => {
            const facadeModuleId = normalizeString(chunkInfo.facadeModuleId)
            const relativeDir = path.relative(currentWorkingDir, path.dirname(facadeModuleId))
            return path.join('app', relativeDir, `${chunkInfo.name}.js`)
        },
        chunkFileNames: (chunkInfo) => {
            return path.join('app', 'vendors', chunkInfo.name) + '.js'
        }
    })
    const writeFilePromises = []
    for (const chunkOrAsset of output) {
        writeFilePromises.push(new Promise((writeFileResolve, writeFileReject) => {
            const filename = path.resolve(__dirname, outputDirname, chunkOrAsset.fileName)
            mkdir(path.dirname(filename), {recursive: true}).then(() => {
                if (chunkOrAsset.type === 'asset') {
                    //asset
                    return writeFile(filename, chunkOrAsset.source).then(writeFileResolve).catch(writeFileReject)
                } else {
                    return writeFile(filename, chunkOrAsset.code, {encoding: 'utf-8'}).then(writeFileResolve).catch(writeFileReject)
                }
            }).catch(writeFileReject)
        }))
    }
})
