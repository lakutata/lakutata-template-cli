import {
    BuildHTTPEntrypoint,
    EntrypointDestroyerRegistrar,
    HTTPContext,
    HTTPEntrypoint,
    HTTPEntrypointHandler,
    HTTPRouteMap
} from 'lakutata/com/entrypoint'
import {Module} from 'lakutata'
import {createServer, Server as HttpServer} from 'http'
import express, {
    Express as ExpressApp,
    Request as ExpressRequest,
    Response as ExpressResponse,
    NextFunction as ExpressNextFunction
} from 'express'
import {Logger} from 'lakutata/com/logger'
import path from 'node:path'
import process from 'node:process'

/**
 * Setup Http entrypoint
 * @constructor
 */
export function SetupHttpEntrypoint(port: number): HTTPEntrypoint {
    return BuildHTTPEntrypoint(async (module: Module, routeMap: HTTPRouteMap, handler: HTTPEntrypointHandler, registerDestroy: EntrypointDestroyerRegistrar): Promise<void> => {
        const log: Logger = await module.getObject('log')
        const httpServer: HttpServer = createServer()
        const expressApp: ExpressApp = express()
        httpServer.on('request', expressApp)
        if (process.env.MODE === 'production') {
            expressApp.use(express.static(path.resolve('@webroot')))
        } else {
            const {createProxyMiddleware} = require('http-proxy-middleware')
            const {createServer} = require('web/webDevServer')
            const server = await createServer()
            expressApp.use('/', createProxyMiddleware({
                target: server.resolvedUrls.local[0],
                changeOrigin: true
            }))
        }
        registerDestroy(async (): Promise<void> => await new Promise<void>((resolve, reject) => httpServer.close((err?: Error): void => err ? reject(err) : resolve())))
        await new Promise<void>((resolve, reject) => {
            try {
                httpServer.listen(port, '0.0.0.0', () => {
                    log.info('HTTP server is listening on port %s', port)
                    return resolve()
                })
            } catch (e) {
                return reject(e)
            }
        })
    })
}
