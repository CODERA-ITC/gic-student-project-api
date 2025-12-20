import { BaseEntity } from "src/database/base.entity";
import { User } from "src/handlers/user/entities/user.entity";
import { Column, Entity, OneToMany, OneToOne } from "typeorm";

@Entity('roles')
export class Role extends BaseEntity { 
    @Column({unique: true})
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => User, user => user.role)
    users: User[];
} 
