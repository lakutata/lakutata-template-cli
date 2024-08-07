import {Application, Component, DTO} from 'lakutata'
import {Configurable, Inject} from 'lakutata/decorator/di'
import {createInterface, Interface as ReadlineInterface} from 'readline'
import {AppBridge} from './AppBridge'
import {ChildProcess, fork} from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import {Delay} from 'lakutata/helper'

export class ProcessArgv extends Component {

    @Inject(Application)
    protected readonly app: Application

    /**
     * Whether enable stdio hosting mode
     * @protected
     */
    @Configurable(DTO.Boolean().optional().default(false))
    protected readonly stdioHosting: boolean

    protected bridge: AppBridge

    /**
     * Initializer
     * @protected
     */
    protected async init(): Promise<void> {
        if (this.stdioHosting) {
            this.bridge = await this.app.getObject<AppBridge>('bridge')
            const {parseArgsStringToArgv} = require('string-argv')
            const readline: ReadlineInterface = createInterface({
                input: process.stdin,
                output: process.stdout
            })
            readline.on('line', async (line: string): Promise<void> => {
                const argv: string[] = parseArgsStringToArgv(line)
                readline.pause()
                await this.process(argv)
                readline.resume()
            })
        } else {
            const modulePath: string = this.app.mode() === 'development' ? path.resolve(require.resolve('app'), '../tests/App.spec.js') : require.resolve('app')
            let appProcess: ChildProcess
            await new Promise((resolve, reject) => {
                try {
                    appProcess = fork(modulePath, {silent: true})
                    appProcess.once('message', resolve).once('error', reject)
                } catch (e) {
                    return reject(e)
                }
            })
            this.bridge = await this.app.getObject<AppBridge>('bridge')
            const origArgv: string[] = process.argv
            origArgv.shift()//shift first arg
            origArgv.shift()//shift second arg
            await this.process(origArgv)
            appProcess!.kill()
            this.app.exit(0)
        }
    }

    /**
     * Process argv
     * @param argv
     * @protected
     */
    protected async process(argv: string[]): Promise<void> {
        const output: string = await this.bridge.proxyArgv(argv)
        const responseObject: Record<string, any> = JSON.parse(output)
        if (responseObject.code) {
            console.error(responseObject.message)
        } else if (typeof responseObject.result === 'string') {
            process.stdout.write(responseObject.result)
        } else {
            console.table(responseObject.result)
        }
    }
}
