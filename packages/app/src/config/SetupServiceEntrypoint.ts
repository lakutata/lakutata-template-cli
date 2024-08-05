import {
    BuildServiceEntrypoint,
    EntrypointDestroyerRegistrar,
    ServiceEntrypoint,
    ServiceEntrypointHandler
} from 'lakutata/com/entrypoint'
import {Module} from 'lakutata'
import {DevNull} from 'lakutata/helper'

/**
 * Setup entrypoints
 * @constructor
 */
export function SetupServiceEntrypoint(devPort?: number): ServiceEntrypoint {
    return BuildServiceEntrypoint(async (module: Module, handler: ServiceEntrypointHandler, registerDestroy: EntrypointDestroyerRegistrar): Promise<void> => {
        //TODO
        registerDestroy(async (): Promise<void> => {
            try {
                //TODO
            } catch (e: any) {
                DevNull('Destroy service entrypoint error: %s', e.message)
            }
        })
    })
}
