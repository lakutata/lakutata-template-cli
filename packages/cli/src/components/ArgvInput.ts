import {Application, Component, DTO} from 'lakutata'
import {Configurable, Inject} from 'lakutata/decorator/di'
import {createInterface, Interface as ReadlineInterface} from 'readline'
import path from 'node:path'
import {AppBridge} from './AppBridge'

export class ArgvInput extends Component {

    @Inject(Application)
    protected readonly app: Application

    @Inject('bridge')
    protected readonly bridge: AppBridge

    /**
     * Whether enable STDIO hosting mode
     * @protected
     */
    @Configurable(DTO.Boolean().optional().default(false))
    protected readonly stdioHosting: boolean

    /**
     * Initializer
     * @protected
     */
    protected async init(): Promise<void> {
        if (this.stdioHosting) {
            const {parseArgsStringToArgv} = require('string-argv')
            const readline: ReadlineInterface = createInterface({
                input: process.stdin,
                output: process.stdout
            })
            readline.on('line', async (line: string): Promise<void> => {
                const argv: string[] = parseArgsStringToArgv(line)
                readline.pause()
                await this.processArgv(argv)
                readline.resume()
            })
        } else {
            await this.processArgv(process.argv)
            this.app.exit(0)
        }
    }

    /**
     * Process argv
     * @param argv
     * @protected
     */
    protected async processArgv(argv: string[]): Promise<void> {
        const output: string = await this.bridge.proxyArgv(argv)
        process.stdout.write(output)
    }
}
