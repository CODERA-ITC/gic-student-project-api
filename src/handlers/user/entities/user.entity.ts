import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Exclude } from 'class-transformer';
import { Project } from 'src/handlers/project/entities/project.entity';
import { BaseEntity } from 'src/database/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ default: false })
  is_admin: boolean;

  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];
}
