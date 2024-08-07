import {Controller} from 'lakutata/com/entrypoint'
import {CLIAction, ServiceAction} from 'lakutata/decorator/ctrl'
import type {ActionPattern} from 'lakutata'
import {TestOptions} from '../options/TestOptions'

export class ExampleController extends Controller {

    /**
     * Example test action
     */
    @ServiceAction({ctrl: 'example', act: 'test'}, TestOptions)
    @CLIAction('test', TestOptions.description('this is test command'))
    public async test(inp: ActionPattern<TestOptions>): Promise<any> {
        return {
            timestamp: inp.timestamp
        }
    }
}
