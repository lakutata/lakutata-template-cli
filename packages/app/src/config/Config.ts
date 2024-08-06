import {ApplicationOptions, Time} from 'lakutata'
import * as process from 'node:process'
import {BuildEntrypoints} from 'lakutata/com/entrypoint'
import {SetupServiceEntrypoint} from './SetupServiceEntrypoint'
import packageJson from '../../package.json'
import {ExampleController} from '../controllers/ExampleController'
import {SetupHttpEntrypoint} from './SetupHttpEntrypoint'
import {BuildDatabaseOptions, Database} from 'lakutata/com/database'
import path from 'node:path'
import {tmpdir} from 'node:os'
import {Example} from '../entities/Example'
import {Repository} from 'lakutata/orm'
import {Logger} from 'lakutata/com/logger'

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
            }),
            db: BuildDatabaseOptions({
                type: 'sqlite',
                database: path.resolve(tmpdir(), 'example.db'),
                enableWAL: true,
                entities: [Example],
                synchronize: true
            })
        },
        objects: {
            anonymous: []
        },
        bootstrap: [
            'entrypoint',
            'db',
            async (app): Promise<void> => {
                const log: Logger = await app.getObject('log')
                const db: Database = await app.getObject('db')
                const exampleRepo: Repository<Example> = db.getRepository(Example)
                const example = new Example()
                example.timestamp = Time.now()
                log.info(await exampleRepo.save(example))
            }
        ]
    }
}
