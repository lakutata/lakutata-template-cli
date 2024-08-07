import {Component, DTO} from 'lakutata'
import {Configurable} from 'lakutata/decorator/di'
import {createInterface, Interface as ReadlineInterface} from 'readline'
import ipc from '@achrinza/node-ipc'
import path from 'node:path'

const {parseArgsStringToArgv} = require('string-argv')

export class ArgvInput extends Component {

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
        console.log('@ipcPath:', path.resolve('@ipcPath'))
        if (this.stdioHosting) {
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
        }
    }

    /**
     * Process argv
     * @param argv
     * @protected
     */
    protected async processArgv(argv: string[]): Promise<string> {
        //TODO
        return 'ok'
    }
}
