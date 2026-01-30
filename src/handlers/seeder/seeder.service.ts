import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'
import { Course } from '../course/entities/course.entity'
import { Department } from '../department/entitites/department.entity'
import { Category } from '../project/entities/category.entity'
import { Project } from '../project/entities/project.entity'
import { ProjectMember } from '../project/entities/project_members.entity'
import { Tag } from '../project/entities/tag.entity'
import { Role } from '../role/entities/role.entity'
import { User } from '../user/entities/user.entity'

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
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private pmRepo: Repository<ProjectMember>,
  ) { }

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

  async seedTeachers() {
    const courses = await this.courseRepo.find()

    const department = await this.departmentRepo.findOneBy({ id: '11111111-1111-1111-1111-111111111111' })
    const teacherRole = await this.roleRepo.findOne({ where: { name: 'TEACHER' } })
    const adminRole = await this.roleRepo.findOne({ where: { name: 'ADMIN' } })
    const hashedPassword = await bcrypt.hash('@password123', 10)

    const result = await this.userRepo.save(
      [
        {
          id: '66666666-6666-6666-6666-666666666666',
          firstName: 'Super',
          lastName: 'Teacher',
          email: 'admin@gic.com',
          phone: '0123456789',
          password: hashedPassword,
          department: department!,
          role: adminRole!,
        },
        {
          id: '77777777-7777-7777-7777-777777777777',
          firstName: 'Heng',
          lastName: 'Rathpisey',
          email: 'rathpisey@gic.com',
          phone: '0123456789',
          password: hashedPassword,
          department: department!,
          role: teacherRole!,
          courses,
        },
        {
          id: '88888888-8888-8888-8888-888888888888',
          firstName: 'Hok',
          lastName: 'Tin',
          email: 'hoktin@gic.com',
          phone: '0123456789',
          password: hashedPassword,
          department: department!,
          role: teacherRole!,
          courses,
        },
        {
          id: '99999999-9999-9999-9999-999999999999',
          firstName: 'Chun',
          lastName: 'Thavorac',
          email: 'thavorac@gic.com',
          phone: '0123456789',
          password: hashedPassword,
          department: department!,
          role: teacherRole!,
          courses,
        },
      ],
    )

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
        generation: 25,
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
        generation: 25,
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
        generation: 25,
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
        generation: 25,
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
        generation: 24,
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
        generation: 24,
      },
    ]

    const result = await this.userRepo.save(
      [
        {
          id: '11111111-1111-1111-1111-111111111111',
          firstName: 'Saren',
          lastName: 'Sokmeak',
          email: 'sarensokmeak@gmail.com',
          phone: '0123456789',
          password: hashedPassword,
          department: department!,
          role: studentRole!,
          generation: 24,
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          firstName: 'Yem',
          lastName: 'Daro',
          email: 'yemdaro@gmail.com',
          phone: '0123456789',
          password: hashedPassword,
          department: department!,
          role: studentRole!,
          avatarUrl: 'https://images.pexels.com/photos/35802448/pexels-photo-35802448.jpeg',
          generation: 24,
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          firstName: 'Sovichet',
          lastName: 'Rathanak',
          email: 'admin123@gmail.com',
          phone: '0123456789',
          password: hashedPassword,
          department: department!,
          role: adminRole!,
          generation: 24,
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
          generation: 24,
        },
        {
          id: '55555555-5555-5555-5555-555555555555',
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser@gmail.com',
          phone: '0123456789',
          password: hashedPassword,
          department: department!,
          role: studentRole!,
          generation: 24,
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
        name: 'SUPER_TEACHER',
        description: 'Teacher with administrative privileges to manage other teachers',
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

  async seedCourses() {
    const result = await this.courseRepo.upsert([
      {
        name: 'Cloud Computing',
        code: 'CC',
      },
      {
        name: 'Natural Language Processing',
        code: 'NLP',
      },
      {
        name: 'Image Processing',
        code: 'IMP',
      },
      {
        name: 'Internet Programming',
        code: 'IP',
      },
      {
        name: 'Mobile Development',
        code: 'MOB',
      },
      {
        name: 'Network',
        code: 'N',
      },
      {
        name: 'Artificial Intelligence',
        code: 'AI',
      },
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'COOLEST COURSE EVER',
        code: 'SEEDED',
      },
    ], { conflictPaths: ['code'] })

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

  async seedProjects() {
    const categories = await this.categoryRepo.find()
    const catWeb = categories[0]
    const catAI = categories[1]

    const courses = await this.courseRepo.find()
    const courseWeb = courses[3]
    const courseAI = courses[6]
    const courseSeeded = courses[courses.length - 1]

    const users = await this.userRepo.find()
    const tags = await this.tagRepo.find()
    const depts = await this.departmentRepo.find()

    const createMembers = () => this.pmRepo.create([
      {
        member: users[0],
        role: 'author',
      },
      {
        member: users[1],
        role: 'member',
      },
      {
        member: users[2],
        role: 'member',
      },
    ])

    const projects: any[] = [
      {
        name: 'My First Project',
        description: 'A small personal project',
        category: catWeb,
        course: courseWeb,
        tags: [
          tags[0],
          tags[1],
        ],
        departments: [depts[0]],
        highlighted: true,
        features: [
          {
            name: 'coolest feature ever',
            status: 'done',
            icon: 'i-lucide-brain',
            description: 'bogo sort',
          },
          {
            name: 'visualizer',
            status: 'ongoing',
            icon: 'i-lucide-globe',
            description: 'graph animation',
          },
          {
            name: 'shader',
            status: 'pending',
            icon: 'i-lucide-rocket',
            description: 'fast inverse square root',
          },
          {
            name: 'Crypto Mining',
            status: 'pending',
            icon: 'i-lucide-brain',
            description: 'jack up gpu and ram prices',
          },
        ],
        members: createMembers(),
        technologies: [
          'VueJs',
        ],
        duration: '2 years',
        academicYear: '2024-2025',
        repoUrl: 'https://github.com/CODERA-ITC/gic-student-project-web',
        demoUrl: 'https://github.com/darororo/Ecommerce/deployments/github-pages',
        status: 'pending',
      },
      {
        name: 'AI Chat Assistant',
        description: 'A small personal project',
        category: catAI,
        course: courseAI,
        tags: [
          tags[0],
          tags[1],
        ],
        departments: [depts[0]],
        features: [
          {
            name: 'GPT-3 Integration',
            description:
              'Set up GPT-3 API integration and basic chatbot framework with Python backend.',
            icon: 'i-lucide-brain',
            status: 'done',
          },
          {
            name: 'Conversation History',
            description:
              'Implemented conversation persistence and user session management with MongoDB.',
            icon: 'i-lucide-message-circle',
            status: 'ongoing',
          },
          {
            name: 'Multi-language Support',
            description:
              'Added support for multiple languages and improved response accuracy.',
            icon: 'i-lucide-globe',
            status: 'pending',
          },
          {
            name: 'Production Deployment',
            description:
              'Successfully deployed to production with monitoring and analytics dashboard.',
            icon: 'i-lucide-rocket',
            status: 'done',
          },
        ],
        duration: '5 years',
        members: createMembers(),
        technologies: ['Python', 'GPT-3', 'React', 'Node.js', 'MongoDB'],
        academicYear: '2024-2025',
        repoUrl: 'https://github.com/CODERA-ITC/gic-student-project-web',
        demoUrl: 'https://github.com/darororo/Ecommerce/deployments/github-pages',
        avatarUrl: 'https://images.pexels.com/photos/35802448/pexels-photo-35802448.jpeg',
        highlighted: true,
      },
      {
        name: 'Smart Parking System',
        description: 'IoT-based parking management system with real-time space detection, mobile app booking, and payment integration.',
        category: catAI,
        course: courseSeeded,
        tags: [
          tags[0],
          tags[1],
        ],
        departments: [depts[0]],
        features: [
          {
            name: 'Core Features',
            description:
              'Developed workout tracking, nutrition logging, and health metrics dashboard.',
            icon: 'i-lucide-activity',
            status: 'done',
          },
          {
            name: 'Social Integration',
            description:
              'Added friend connections, workout sharing, and community challenges.',
            icon: 'i-lucide-users',
            status: 'done',
          },
          {
            name: 'Wearable Sync',
            description:
              'Integrated with HealthKit and popular fitness wearables for automatic data sync.',
            icon: 'i-lucide-watch',
            status: 'ongoing',
          },
          {
            name: 'Launch',
            description:
              'Final testing, app store submission, and public launch preparation.',
            icon: 'i-lucide-rocket',
            status: 'pending',
          },
        ],
        members: createMembers(),
        duration: '4 months',
        technologies: ['React Native', 'Node.js', 'IoT Sensors', 'MongoDB', 'Stripe'],
        academicYear: '2024-2025',
        repoUrl: 'https://github.com/CODERA-ITC/gic-student-project-web',
        demoUrl: 'https://github.com/darororo/Ecommerce/deployments/github-pages',
        avatarUrl: 'https://images.pexels.com/photos/35802448/pexels-photo-35802448.jpeg',
        highlighted: true,
        status: 'pending',
      },
      {
        name: 'Concurrency visualizer',
        description: 'A small personal project',
        category: catWeb,
        course: courseWeb,
        tags: [
          tags[4],
          tags[5],
        ],
        departments: [depts[0]],
        highlighted: false,
        features: [
          {
            name: 'coolest feature ever',
            status: 'done',
            icon: 'i-lucide-brain',
            description: 'bogo sort',
          },
          {
            name: 'visualizer',
            status: 'ongoing',
            icon: 'i-lucide-globe',
            description: 'graph animation',
          },
          {
            name: 'shader',
            status: 'pending',
            icon: 'i-lucide-rocket',
            description: 'fast inverse square root',
          },
          {
            name: 'Crypto Mining',
            status: 'pending',
            icon: 'i-lucide-brain',
            description: 'jack up gpu and ram prices',
          },
        ],
        members: createMembers(),
        technologies: [
          'VueJs',
        ],
        duration: '2 years',
        academicYear: '2024-2025',
        repoUrl: 'https://github.com/CODERA-ITC/gic-student-project-web',
        demoUrl: 'https://github.com/darororo/Ecommerce/deployments/github-pages',
        avatarUrl: 'https://images.pexels.com/photos/35802448/pexels-photo-35802448.jpeg',
        status: 'rejected',
      },
      {
        name: 'Yakuzy simulator',
        description: 'Dame Dane',
        category: catWeb,
        course: courseWeb,
        tags: [
          tags[2],
          tags[3],
        ],
        departments: [depts[0]],
        highlighted: false,
        features: [
          {
            name: 'coolest feature ever',
            status: 'done',
            icon: 'i-lucide-brain',
            description: 'bogo sort',
          },
          {
            name: 'visualizer',
            status: 'ongoing',
            icon: 'i-lucide-globe',
            description: 'graph animation',
          },
          {
            name: 'shader',
            status: 'pending',
            icon: 'i-lucide-rocket',
            description: 'fast inverse square root',
          },
          {
            name: 'Crypto Mining',
            status: 'pending',
            icon: 'i-lucide-brain',
            description: 'jack up gpu and ram prices',
          },
        ],
        members: createMembers(),
        technologies: [
          'VueJs',
        ],
        duration: '2 years',
        academicYear: '2024-2025',
        repoUrl: 'https://github.com/CODERA-ITC/gic-student-project-web',
        demoUrl: 'https://github.com/darororo/Ecommerce/deployments/github-pages',
        avatarUrl: 'https://images.pexels.com/photos/35802448/pexels-photo-35802448.jpeg',
        status: 'accepted',
      },
    ]

    await this.projectRepo.save(projects)
  }
}
