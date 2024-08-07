import {ApplicationOptions} from 'lakutata'
import * as process from 'node:process'
import packageJson from '../../package.json'
import {ProcessArgv} from '../components/ProcessArgv'
import {AppBridge} from '../components/AppBridge'

export async function Config(): Promise<ApplicationOptions> {
    return {
        id: packageJson.name,
        name: packageJson.name,
        timezone: 'auto',
        mode: <'development' | 'production'>process.env.MODE,
        components: {
            bridge: {
                class: AppBridge
            },
            processArgv: {
                class: ProcessArgv,
                stdioHosting: true
            }
        },
        objects: {
            anonymous: []
        },
        bootstrap: [
            'processArgv'
        ]
    }
}
