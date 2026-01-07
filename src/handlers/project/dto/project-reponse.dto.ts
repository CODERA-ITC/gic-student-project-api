import { Category } from '../entities/category.entity'

export class UserResponseDto {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
}

export class ProjectResponseDto {
    id: string
    name: string
    category: Category
    images: {
        id: number
        url: string
    }[]

    startDate: string

    members: UserResponseDto[]
}
