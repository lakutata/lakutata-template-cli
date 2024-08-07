import {ApplicationOptions} from 'lakutata'
import * as process from 'node:process'
import {BuildEntrypoints} from 'lakutata/com/entrypoint'
import {SetupServiceEntrypoint} from './SetupServiceEntrypoint'
import packageJson from '../../package.json'
import {ExampleController} from '../controllers/ExampleController'
import {SetupHttpEntrypoint} from './SetupHttpEntrypoint'
import {BuildDatabaseOptions} from 'lakutata/com/database'
import path from 'node:path'
import {tmpdir} from 'node:os'
import {Example} from '../entities/Example'
import {SetupCLIEntrypoint} from './SetupCLIEntrypoint'
import {BootNotification} from '../lib/BootNotification'
import {ExampleProvider} from '../providers/ExampleProvider'
import {StateManager} from '../providers/StateManager'

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
                http: SetupHttpEntrypoint(process.env.MODE === 'production' ? 80 : 8080),
                cli: SetupCLIEntrypoint()
            }),
            db: BuildDatabaseOptions({
                type: 'sqlite',
                database: path.resolve(tmpdir(), 'example.db'),
                enableWAL: true,
                entities: [Example],
                synchronize: true
            })
        },
        providers: {
            state: {
                class: StateManager
            }
        },
        objects: {
            anonymous: [ExampleProvider]
        },
        bootstrap: [
            'entrypoint',
            'db',
            BootNotification
        ]
    }
}
