import {DTO, Time} from 'lakutata'
import {Expect} from 'lakutata/decorator/dto'

export class TestOptions extends DTO {
    @Expect(DTO.Number().optional().default(() => Time.now()))
    public timestamp: number
}
