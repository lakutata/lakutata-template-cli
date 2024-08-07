import {
    BuildCLIEntrypoint,
    CLIContext,
    CLIEntrypoint,
    CLIEntrypointHandler,
    CLIMap,
    EntrypointDestroyerRegistrar
} from 'lakutata/com/entrypoint'
import {Exception, JSONSchema, Module, Time} from 'lakutata'
import {As, IsExists} from 'lakutata/helper'
import path from 'node:path'
import {Server as IPCServer} from 'express-ipc'
import {Logger} from 'lakutata/com/logger'
import {mkdir} from 'node:fs/promises'
import {Command} from 'commander'

function formatResponse(data: any): string {
    let code: number | string = 0
    let message: string = ''
    if (data instanceof Exception) {
        code = data.errno
        message = data.message
    } else if (data instanceof Error) {
        code = -1
        message = data.message
    }
    return JSON.stringify({
        code: code,
        result: code ? null : data,
        message: message
    })
}

export function SetupCLIEntrypoint(): CLIEntrypoint {
    return BuildCLIEntrypoint(async (module: Module, cliMap: CLIMap, handler: CLIEntrypointHandler, registerDestroy: EntrypointDestroyerRegistrar): Promise<void> => {
        const log: Logger = await module.getObject('log')
        const socketPath: string = path.resolve('@ipcPath')
        const socketDir: string = path.dirname(socketPath)
        if (!(await IsExists(socketDir))) await mkdir(socketDir, {recursive: true})
        const ipcServer: IPCServer = new IPCServer()
        ipcServer.get('/handshake', ({res}) => res.send({ts: Time.now()}))
        ipcServer.post('/argv', ({req, res}) => {
            const argv: string[] = As<string[]>(req.body)
            if (!argv.length) return res.send({output: formatResponse('')})
            const CLIProgram: Command = new Command()
            CLIProgram.exitOverride()
            CLIProgram.configureOutput({
                writeOut(str: string): void {
                    if (!res.isSent) res.send({output: formatResponse(str)})
                },
                writeErr(str: string): void {
                    if (!res.isSent) res.send({output: formatResponse(str)})
                }
            })
            cliMap.forEach((dtoJsonSchema: JSONSchema, command: string): void => {
                const cmd: Command = new Command(command).description(dtoJsonSchema.description!)
                for (const property in dtoJsonSchema.properties) {
                    const attr: JSONSchema = dtoJsonSchema.properties[property]
                    const optionsArgs: [string, string | undefined] = [`--${property} <${attr.type}>`, attr.description]
                    if (Array.isArray(dtoJsonSchema.required) && dtoJsonSchema.required.includes(property)) {
                        optionsArgs[1] = `(required) ${optionsArgs[1]}`
                        cmd.requiredOption(...optionsArgs)
                    } else {
                        cmd.option(...optionsArgs)
                    }
                }
                cmd.action(async (args): Promise<any> => {
                    try {
                        const result: any = await handler(new CLIContext({
                            command: command,
                            data: args
                        }))
                        if (!res.isSent) res.send({output: formatResponse(result)})
                    } catch (e) {
                        if (!res.isSent) res.send({output: formatResponse(e)})
                    }

                })
                CLIProgram.addCommand(cmd)
            })
            CLIProgram.parse(argv, {from: 'user'})
        })
        registerDestroy(async (): Promise<void> => await new Promise<void>((resolve, reject) => ipcServer.close((err?: Error | null | undefined): void => err ? reject(err) : resolve())))
        await new Promise<void>((resolve, reject) => {
            try {
                ipcServer.listen({
                    path: socketPath,
                    deleteSocketBeforeListening: true,
                    callback() {
                        log.info('IPC server is listening on path %s', socketPath)
                        return resolve()
                    }
                })
            } catch (e) {
                return reject(e)
            }
        })
    })
}
