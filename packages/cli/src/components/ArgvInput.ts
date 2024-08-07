import {Component, DTO} from 'lakutata'
import {Configurable} from 'lakutata/decorator/di'
import {createInterface, Interface as ReadlineInterface} from 'readline'

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
        if (this.stdioHosting) {
            const {parseArgsStringToArgv} = await import('string-argv')
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
