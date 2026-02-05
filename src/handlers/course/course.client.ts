import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { PaginatedResponse } from 'src/common/interface/paginated-response.interface'

export interface CourseResponse {
    id: string
    name: string
    description: string
    code: string
}

export type CoursesReponse = PaginatedResponse<CourseResponse>

@Injectable()
export class CourseClient {
    private readonly userHost: string
    constructor(
        private readonly configService: ConfigService,
        private readonly http: HttpService,
    ) {
        this.userHost = String(configService.get('USER_SERVICE_HOST'))
    }

    async findOne(courseId: string): Promise<CourseResponse> {
        const { data } = await firstValueFrom(
            this.http.get(`${this.userHost}/courses/${courseId}`),
        )
        return data
    }

    async findAll(params?: PaginationDto): Promise<CoursesReponse> {
        const { data } = await firstValueFrom(
            this.http.get(
                `${this.userHost}/courses`,
                {
                    params,
                },
            ),
        )
        return data
    }
}
