import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class CourseClient {
    private readonly courseHostService: string
    constructor(
        private readonly configService: ConfigService,
        private readonly http: HttpService
    ) {
        this.courseHostService = String(configService.get('COURSE_SERVICE_HOST'))
    }
    async getCourse(courseId: string) {
        const { data } = await firstValueFrom(
            this.http.get(`${this.courseHostService}/${courseId}`)
        )
        return data
    }

    async getDepartments(courseIds: string[]) {
        const { data } = await firstValueFrom(
            this.http.post(
                `${this.courseHostService}/batch`,
                { courseIds }
            )
        )
        return data
    }
}
