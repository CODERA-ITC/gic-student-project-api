import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Exclude } from 'class-transformer';
import { Project } from 'src/handlers/project/entities/project.entity';
import { BaseEntity } from 'src/database/base.entity';
import { Department } from 'src/handlers/department/entitites/department.entity';

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

  @ManyToOne(() => Department, (department) => department.users, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dept_id' })
  department: Department;
}
