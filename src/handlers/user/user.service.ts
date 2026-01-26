import { extname } from 'node:path'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { Repository } from 'typeorm'
import { v4 as uuid } from 'uuid'
import { Department } from '../department/entitites/department.entity'
import { Role } from '../role/entities/role.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UserService {
  private s3Client: S3Client
  private bucket: string

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
  ) {
    const region = configService.get<string>('aws.region')
    const accessKeyId = configService.get<string>('aws.accessKey')
    const secretAccessKey = configService.get<string>('aws.secretAccessKey')
    const bucketName = configService.get<string>('aws.s3BucketName')

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Missing required AWS configuration')
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    this.bucket = bucketName
  }

  // =============
  // Create
  // =============
  async createUser(dto: CreateUserDto) {
    const { role: roleName, ...userData } = dto
    const user = this.userRepo.create(userData)

    const department = await this.departmentRepo.findOneOrFail({ where: { code: dto.departmentCode } })
    const role = await this.roleRepo.findOneOrFail({ where: { name: 'STUDENT' } })
    user.role = role
    user.department = department

    return this.userRepo.save(user)
  }

  // ==============================================================================
  // Read (Decision to use instanceToPlain: avoid exposing password on request)
  // ==============================================================================
  async findUserByEmail(email: string) {
    return this.userRepo.findOne(
      {
        where: {
          email,
        },
        relations: ['role'],
      },
    )
  }

  async findUserByEmailWithSecrets(email: string) {
    return this.userRepo.findOne({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        refreshToken: true,
        role: true,
      },
      relations: ['role'],
    })
  }

  async findUserById(id: string) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['role', 'department'] })
    if (!user)
      throw new NotFoundException('User not found')

    return this.getUserResponse(user)
  }

  // =============
  // Update
  // =============
  async updateUser(id: string, dto: UpdateUserDto) {
    const { role: roleName, ...userData } = dto
    const result = await this.userRepo.update(id, userData)
    if (result.affected === 0)
      throw new NotFoundException('User not found')
    return this.findUserById(id)
  }

  // ======================
  // Search query for user
  // =======================
  async searchUser(q: string) {
    if (!q || q.trim() === '')
      return []
    return this.userRepo.createQueryBuilder('user')
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.email', 'user.role'])
      .where('user.firstName ILIKE :prefix', { prefix: `${q}%` })
      .orWhere('user.lastName ILIKE :prefix', { prefix: `${q}%` })
      .orderBy('user.firstName', 'ASC')
      .limit(10)
      .getMany()
  }

  async paginate(params: PaginationDto) {
    const page = params.page ?? 1
    const limit = params.limit ?? 10
    const skip = (page - 1) * limit

    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.department', 'department')
      .leftJoinAndSelect('u.role', 'role')

    // Optional search (e.g., search by project name)
    if (params.search) {
      qb.andWhere('u.firstName ILIKE :search', { search: `%${params.search.trim().toLowerCase()}%` })
        .orWhere('u.lastName ILIKE :search', { search: `%${params.search.trim().toLowerCase()}%` })
    }

    const [users, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('u.createdAt', 'DESC')
      .getManyAndCount()

    const transformed: any[] = users.map(u => this.getUserResponse(u))

    return {
      data: transformed,
      page,
      limit,
      total,
      lastPage: Math.ceil(total / limit),
    }
  }

  // ======================
  // Upload PFP
  // =======================
  async uploadPFP(userId: string, file: Express.Multer.File) {
    const storage = this.configService.get<string>('STORAGE_URL')

    if (!file) {
      throw new BadRequestException('File not found')
    }

    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (user.avatarUrl) {
      await this.deleteFromS3(user.avatarUrl)
    }

    const fileExt = extname(file.originalname)
    const baseName = uuid()
    const originalKey = `user/${userId}/original/${baseName}${fileExt}`
    // const thumbnailKey = `user/${userId}/thumbnail/${baseName}${fileExt}`;

    // const thumbnailBuffer = await
    //   sharp(file.buffer)
    //     .jpeg({ quality: 70 })
    //     .toBuffer()

    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: originalKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private',
    }))

    await this.userRepo.update({ id: userId }, { avatarUrl: originalKey })
    return {
      avatarUrl: `${storage}/${originalKey}`,
    }
  }

  async deletePFP(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.deleteFromS3(user.avatarUrl)
    await this.userRepo.update({ id: userId }, { avatarUrl: '' })
  }

  private async deleteFromS3(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      await this.s3Client.send(command)
    }
    catch (error) {
      throw new BadRequestException(`Failed to delete image from storage`)
    }
  }

  private getUserResponse(user: User) {
    const storage = this.configService.get<string>('STORAGE_URL')
    let avatarUrl = ''
    if (user.avatarUrl) {
      avatarUrl = `${storage}/${user.avatarUrl}`
    }

    const response = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio,
      year: user.year,
      skill: user.skill,
      avatar: avatarUrl,
      department: {
        id: user.department.id,
        name: user.department.name,
        code: user.department.code,
      },
      role: user.role.name,
    }

    return response
  }
}
