import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'
import { Department } from '../department/entitites/department.entity'
import { Category } from '../project/entities/category.entity'
import { Role } from '../role/entities/role.entity'
import { User } from '../user/entities/user.entity'
import { Tag } from '../project/entities/tag.entity'

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
  ) {}

  async seedDepartment() {
    const gic = this.departmentRepo.create()
    gic.id = '11111111-1111-1111-1111-111111111111'
    gic.name = 'Department of Information and Communication Engineering'
    gic.code = 'GIC'
    const result = await this.departmentRepo.upsert(gic, { conflictPaths: ['code'] })
    return result
  }

  async seedCategories() {
    const result = await this.categoryRepo.upsert([
      { id: '11111111-1111-1111-1111-111111111111', name: 'Web Development' },
      { id: '22222222-2222-2222-2222-222222222222', name: 'AI' },
      { id: '33333333-3333-3333-3333-333333333333', name: 'Mobile Development' },
      { id: '44444444-4444-4444-4444-444444444444', name: 'Game Development' },
    ], {
      conflictPaths: ['name'],
    })

    return result
  }

  async seedUser() {
    const department = await this.departmentRepo.findOneBy({ id: '11111111-1111-1111-1111-111111111111' })
    const teacherRole = await this.roleRepo.findOne({ where: { name: 'TEACHER' } })
    const studentRole = await this.roleRepo.findOne({ where: { name: 'STUDENT' } })
    const adminRole = await this.roleRepo.findOne({ where: { name: 'ADMIN' } })

    const hashedPassword = await bcrypt.hash('@password123', 10)

    const users = [
      {
        firstName: 'Sarah',
        lastName: 'Chen',
        skill: ['Frontend Developer'],
        avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
        password: hashedPassword,
        department: department!,
        role: studentRole!,
        email: 'sarahchen@gmail.com',
        bio: 'hello i am very sad',
        year: 4,
      },
      {
        firstName: 'Alex',
        lastName: 'Kumar',
        name: 'Alex Kumar',
        avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
        password: hashedPassword,
        department: department!,
        role: studentRole!,
        email: 'alexkumar@gmail.com',
        bio: 'hello i am very sad',
        year: 5,
      },
      {
        firstName: 'Maya',
        lastName: 'Rodriguez',
        avatarUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
        password: hashedPassword,
        department: department!,
        role: studentRole!,
        email: 'mayarodri@gmail.com',
        bio: 'Dattebayo UwU',
        year: 4,
      },
      {
        firstName: 'David',
        lastName: 'Park',
        skill: ['DevOps Engineer', 'Terrorist'],
        avatarUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
        password: hashedPassword,
        department: department!,
        role: studentRole!,
        email: 'davidpark@gmail.com',
        bio: 'hello i am very sad',
        year: 4,
      },
      {
        firstName: 'Emma',
        lastName: 'Thompson',
        skill: ['Product Manager'],
        avatarUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
        password: hashedPassword,
        department: department!,
        role: studentRole!,
        email: 'emmat@gmail.com',
        bio: 'hello i am very sad',
        year: 3,
      },
      {
        firstName: 'James',
        lastName: 'Wilson',
        skill: ['Full Stack Developer'],
        avatarUrl: 'https://randomuser.me/api/portraits/men/6.jpg',
        password: hashedPassword,
        department: department!,
        role: studentRole!,
        email: 'jameswilson@yahoo.com',
        bio: 'Ground control to major tom',
        year: 4,
      },
    ]

    const result = await this.userRepo.save(
      [
        {
          id: '11111111-1111-1111-1111-111111111111',
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser@gmail.com',
          phone: '0123456789',
          password: hashedPassword,
          department: department!,
          role: studentRole!,

        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser2@gmail.com',
          phone: '0123456789',
          password: hashedPassword,
          department: department!,
          role: studentRole!,

        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          firstName: 'John',
          lastName: 'Yakult',
          email: 'admin123@gmail.com',
          phone: '0123456789',
          password: hashedPassword,
          department: department!,
          role: adminRole!,
        },
        {
          id: '44444444-4444-4444-4444-444444444444',
          firstName: 'Cool',
          lastName: 'Teacher',
          email: 'teacher123@gmail.com',
          phone: '0123456789',
          password: hashedPassword,
          department: department!,
          role: teacherRole!,

        },

        ...users,
      ],
    )

    return result
  }

  async seedRole() {
    const result = await this.roleRepo.upsert([
      {
        name: 'ADMIN',
        description: 'Responsible for managing the system',
      },
      {
        name: 'TEACHER',
        description: 'Manage student projects',
      },
      {
        name: 'STUDENT',
        description: 'Create and propose project ideas',
      },
    ], { conflictPaths: ['name'] })

    return result
  }

  async seedTags() {
    await this.tagRepo.upsert(
      [
        { name: 'JavaScript' },
        { name: 'TypeScript' },
        { name: 'Python' },
        { name: 'Go' },
        { name: 'Rust' },
        { name: 'Java' },
        { name: 'CSharp' },
        { name: 'PHP' },

        { name: 'React' },
        { name: 'Vue' },
        { name: 'Angular' },
        { name: 'NextJS' },
        { name: 'Nuxt' },
        { name: 'Svelte' },
        { name: 'Flutter' },
        { name: 'ReactNative' },

        { name: 'NodeJS' },
        { name: 'NestJS' },
        { name: 'Express' },
        { name: 'Fastify' },
        { name: 'SpringBoot' },
        { name: 'Django' },
        { name: 'Flask' },

        { name: 'PostgreSQL' },
        { name: 'MySQL' },
        { name: 'MongoDB' },
        { name: 'Redis' },
        { name: 'SQLite' },

        { name: 'Docker' },
        { name: 'Kubernetes' },
        { name: 'CI/CD' },
        { name: 'GitHub Actions' },
        { name: 'AWS' },
        { name: 'GCP' },
        { name: 'Azure' },

        { name: 'REST' },
        { name: 'GraphQL' },
        { name: 'WebSocket' },
        { name: 'Microservices' },
        { name: 'Monorepo' },
        { name: 'Clean Architecture' },
        { name: 'TDD' },
        { name: 'Testing' },
      ],
      { conflictPaths: ['name'] },
    )
  }
}
