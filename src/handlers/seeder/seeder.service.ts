import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CourseClient } from '../course/course.client'
import { Category } from '../project/entities/category.entity'
import { Project } from '../project/entities/project.entity'
import { ProjectMember } from '../project/entities/project_members.entity'
import { Tag } from '../project/entities/tag.entity'
import { UserClient } from '../user/user.client'

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private pmRepo: Repository<ProjectMember>,
    private userClient: UserClient,
    private courseClient: CourseClient,
  ) {}

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
    const dptId = '11111111-1111-1111-1111-111111111111'
    const course = (await this.courseClient.findAll()).data

    const tags = await this.tagRepo.find()
    const users = (await this.userClient.getUsers()).data

    const createMembers = () => this.pmRepo.create([
      {
        userId: users[0].id,
        role: 'author',
      },
      {
        userId: users[1].id,
        role: 'member',
      },
    ])

    const projects: any[] = [
      {
        name: 'My First Project',
        description: 'A small personal project',
        category: catWeb,
        courseId: course[0].id,
        tags: [
          tags[0],
          tags[1],
        ],
        departmentId: dptId,
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
        courseId: course[0].id,
        tags: [
          tags[0],
          tags[1],
        ],
        departmentId: dptId,
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
        departmentId: dptId,
        courseId: course[0].id,
        tags: [
          tags[0],
          tags[1],
        ],
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
        courseId: course[0].id,
        departmentId: dptId,
        tags: [
          tags[4],
          tags[5],
        ],
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
        category: catAI,
        courseId: course[0].id,
        departmentId: dptId,
        tags: [
          tags[2],
          tags[3],
        ],
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
