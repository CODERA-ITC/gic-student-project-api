import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { PaginationDto } from 'src/common/dto/pagination.dto'

@Injectable()
export class CourseClient {
    private readonly userHost: string
    constructor(
        private readonly configService: ConfigService,
        private readonly http: HttpService,
    ) {
        this.userHost = String(configService.get('USER_SERVICE_HOST'))
    }

    async getCourse(courseId: string) {
        const { data } = await firstValueFrom(
            this.http.get(`${this.userHost}/${courseId}`),
        )
        return data
    }

    async getCourses(params: PaginationDto) {
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
