import {ApplicationOptions} from 'lakutata'
import * as process from 'node:process'
import {BuildEntrypoints} from 'lakutata/com/entrypoint'
import {SetupServiceEntrypoint} from './SetupServiceEntrypoint'
import packageJson from '../../package.json'
import {ExampleController} from '../controllers/ExampleController'
import {SetupHttpEntrypoint} from './SetupHttpEntrypoint'

export async function Config(): Promise<ApplicationOptions> {
    return {
        id: packageJson.appId,
        name: packageJson.appName,
        timezone: 'auto',
        mode: <'development' | 'production'>process.env.MODE,
        components: {
            entrypoint: BuildEntrypoints({
                controllers: [
                    ExampleController
                ],
                service: SetupServiceEntrypoint(),
                http: SetupHttpEntrypoint(process.env.MODE === 'production' ? 80 : 8080)
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
