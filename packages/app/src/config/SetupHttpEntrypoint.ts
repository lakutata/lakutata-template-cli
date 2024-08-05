import {
    BuildHTTPEntrypoint,
    EntrypointDestroyerRegistrar,
    HTTPEntrypoint,
    HTTPEntrypointHandler,
    HTTPRouteMap
} from 'lakutata/com/entrypoint'
import {Module} from 'lakutata'

/**
 * Setup Http entrypoint
 * @constructor
 */
export function SetupHttpEntrypoint(port: number): HTTPEntrypoint {
    return BuildHTTPEntrypoint(async (module: Module, routeMap: HTTPRouteMap, handler: HTTPEntrypointHandler, registerDestroy: EntrypointDestroyerRegistrar): Promise<void> => {
        //TODO
        registerDestroy(async (): Promise<void> => {
            //TODO
        })
    })
}
