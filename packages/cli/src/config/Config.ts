import {ApplicationOptions} from 'lakutata'
import * as process from 'node:process'
import {BuildEntrypoints} from 'lakutata/com/entrypoint'
import packageJson from '../../package.json'

export async function Config(): Promise<ApplicationOptions> {
    return {
        id: packageJson.name,
        name: packageJson.name,
        timezone: 'auto',
        mode: <'development' | 'production'>process.env.MODE,
        components: {
            entrypoint: BuildEntrypoints({
                controllers: []
                // cli: SetupCLIEntrypoint()
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
