import {
    BuildServiceEntrypoint,
    EntrypointDestroyerRegistrar,
    ServiceContext,
    ServiceEntrypoint,
    ServiceEntrypointHandler
} from 'lakutata/com/entrypoint'
import {Module} from 'lakutata'
import {DevNull} from 'lakutata/helper'
import {StateManager} from '../providers/StateManager'
import {createServer, Server as HttpServer} from 'http'
import {Server as SocketServer, Socket} from 'socket.io'
import {IncomingMessage} from 'node:http'
import {FormatEntrypointResponse} from '../lib/FormatEntrypointResponse'

/**
 * Setup service entrypoint
 * @constructor
 */
export function SetupServiceEntrypoint(): ServiceEntrypoint {
    return BuildServiceEntrypoint(async (module: Module, handler: ServiceEntrypointHandler, registerDestroy: EntrypointDestroyerRegistrar): Promise<void> => {
        const stateManager: StateManager = await module.getObject('state')
        const httpServer: HttpServer = stateManager.set('httpServer', createServer())
        const socketServer: SocketServer = new SocketServer(httpServer, {
            path: '/socket.io',
            transports: ['polling', 'websocket'],
            pingInterval: 3000,
            allowRequest: (req: IncomingMessage, fn: (err: string | null | undefined, success: boolean) => void): void => {
                return fn(null, true)
            }
        })
        socketServer.on('connect', (socket: Socket): void => {
            socket.on('request', async (requestData: Record<string, any>, reply: (response: any) => void): Promise<void> => {
                try {
                    return reply(FormatEntrypointResponse(await handler(new ServiceContext({
                        data: requestData
                    }))))
                } catch (e) {
                    return reply(FormatEntrypointResponse(e))
                }
            })
        })
        registerDestroy(async (): Promise<void> => await new Promise<void>(resolve => socketServer.close((err: Error | undefined) => resolve(DevNull(err)))))
    })
}
