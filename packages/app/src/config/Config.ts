import {ApplicationOptions} from 'lakutata'
import * as process from 'node:process'
import {BuildEntrypoints} from 'lakutata/com/entrypoint'
import {SetupServiceEntrypoint} from './SetupServiceEntrypoint'
import packageJson from '../../package.json'
import {ExampleController} from '../controllers/ExampleController'

export async function Config(): Promise<ApplicationOptions> {
    return {
        id: packageJson.appId,
        name: packageJson.appName,
        timezone: 'auto',
        mode: <'development' | 'production'>process.env.MODE,
        components: {
            entrypoint: BuildEntrypoints({
                controllers: [ExampleController],
                service: SetupServiceEntrypoint(process.env.MODE === 'development' ? 8081 : undefined)
            })
        },
        objects: {
            anonymous: []
        },
        bootstrap: [
            'entrypoint'
        ]
    }
}
