import {
  Entity,
  Column,
} from 'typeorm';

import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/database/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  firstname: string;
 
  @Column()
  lastname: string;

  @Column({ unique: true }) 
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  bio: string;
}
