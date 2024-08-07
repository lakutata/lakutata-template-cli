import {
    BuildHTTPEntrypoint,
    EntrypointDestroyerRegistrar,
    HTTPContext,
    HTTPEntrypoint,
    HTTPEntrypointHandler,
    HTTPRouteMap
} from 'lakutata/com/entrypoint'
import {Module} from 'lakutata'
import {Server as HttpServer} from 'http'
import express, {
    Express as ExpressApp,
    Request as ExpressRequest,
    Response as ExpressResponse
} from 'express'
import {Logger} from 'lakutata/com/logger'
import path from 'node:path'
import process from 'node:process'
import bodyParser from 'body-parser'
import {FormatEntrypointResponse} from '../lib/FormatEntrypointResponse'
import {StateManager} from '../providers/StateManager'
import {DevNull} from 'lakutata/helper'

/**
 * Setup Http entrypoint
 * @constructor
 */
export function SetupHttpEntrypoint(port: number): HTTPEntrypoint {
    return BuildHTTPEntrypoint(async (module: Module, routeMap: HTTPRouteMap, handler: HTTPEntrypointHandler, registerDestroy: EntrypointDestroyerRegistrar): Promise<void> => {
        const log: Logger = await module.getObject('log')
        const stateManager: StateManager = await module.getObject('state')
        const httpServer: HttpServer = stateManager.get('httpServer')
        const expressApp: ExpressApp = express()
        httpServer.on('request', expressApp)
        routeMap.forEach((methods: Set<string>, route: string) => {
            expressApp
                .use(bodyParser.json({limit: Infinity}))
                .use(bodyParser.urlencoded({extended: false, limit: Infinity}))
                .post(route, async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
                    try {
                        res.send(FormatEntrypointResponse(await handler(new HTTPContext({
                            data: {
                                ...req.query,
                                ...req.body
                            },
                            route: route,
                            method: req.method.toLowerCase(),
                            request: req,
                            response: res
                        }))))
                    } catch (e) {
                        res.send(FormatEntrypointResponse(e))
                    }
                })
        })
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
        registerDestroy(async (): Promise<void> => await new Promise<void>((resolve) => httpServer.close((err?: Error): void => resolve(DevNull(err)))))
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
