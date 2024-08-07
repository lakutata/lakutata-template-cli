import {Provider} from 'lakutata'
import {Singleton} from 'lakutata/decorator/di'

@Singleton()
export class StateManager extends Provider {

    protected readonly stateMap: Map<string, any> = new Map()

    /**
     * Set state
     * @param key
     * @param val
     */
    public set<T = any>(key: string, val: T): T {
        this.stateMap.set(key, val)
        return val
    }

    /**
     * Get state
     * @param key
     */
    public get<T = any>(key: string): T {
        return this.stateMap.get(key)
    }
}
