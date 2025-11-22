import { BaseEntity } from "src/database/base.entity";
import { Column, Entity } from "typeorm";

@Entity('roles')
export class Role extends BaseEntity {
    @Column({ unique: true })
    name: string

    @Column()
    description: string
}