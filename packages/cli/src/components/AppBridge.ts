import {Component} from 'lakutata'
import path from 'node:path'
import {Client} from 'express-ipc'
import {GeneralResponsePayload} from 'express-ipc/dist/interface'

export class AppBridge extends Component {

    protected readonly socketPath: string = path.resolve('@ipcPath')

    protected client: Client

    /**
     * Initializer
     * @protected
     */
    protected async init(): Promise<void> {
        this.client = new Client({path: this.socketPath})
        await this.handshake()
    }

    /**
     * Handshake with IPC server
     * @protected
     */
    protected async handshake(): Promise<void> {
        try {
            await this.client.get('/handshake')
        } catch (e: any) {
            if (e.code === 'ECONNREFUSED') {
                //App is not launched yet, launch it
                //TODO
            } else {
                throw e
            }
        }
    }

    /**
     * Proxy argv to App (IPC Server)
     * @param argv
     * @param from
     */
    public async proxyArgv(argv: string[], from: string): Promise<string> {
        const response: GeneralResponsePayload = await this.client.post('/argv', {body: argv, query: {from: from}})
        return response.body.output
    }

}
