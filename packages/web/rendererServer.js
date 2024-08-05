
exports.createServer = async function () {
    const path = require('path')
    const {createServer} = require('vite')
    const server = await createServer({
        configFile: path.resolve(__dirname,'./vite/renderer.mts'),
        root: __dirname,
        server: {
            port: 5188
        }
    })
    await server.listen()
    return server
}
