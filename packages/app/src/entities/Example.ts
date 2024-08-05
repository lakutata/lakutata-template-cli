import {BaseEntity} from 'lakutata/orm'
import {Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'lakutata/decorator/orm'

@Entity()
export class Example extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column({type: 'integer', default: 0})
    public timestamp: number

    @UpdateDateColumn()
    public updatedAt: Date
}
