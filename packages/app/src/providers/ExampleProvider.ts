import {Provider} from 'lakutata'
import {Database} from 'lakutata/com/database'
import {Inject} from 'lakutata/decorator/di'
import {Repository} from 'lakutata/orm'
import {Example} from '../entities/Example'
import {TestOptions} from '../options/TestOptions'
import {Accept} from 'lakutata/decorator/dto'

export class ExampleProvider extends Provider {

    @Inject('db', (db: Database) => db.getRepository(Example))
    protected readonly exampleRepo: Repository<Example>

    @Accept(TestOptions.required())
    public async generateExampleData(options: TestOptions): Promise<Example> {
        const example: Example = new Example()
        example.timestamp = options.timestamp
        return await this.exampleRepo.save(example)
    }
}
