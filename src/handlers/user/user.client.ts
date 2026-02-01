import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class UserClient {
    private readonly userHostService: string
    constructor(
        private readonly configService: ConfigService,
        private readonly http: HttpService
    ) {
        this.userHostService = String(configService.get('USER_SERVICE_HOST'))
    }
    async getUser(userId: string) {
        const { data } = await firstValueFrom(
            this.http.get(`${this.userHostService}/${userId}`)
        )
        return data
    }

    async getUsers(userIds: string[]) {
        const { data } = await firstValueFrom(
            this.http.post(
                `${this.userHostService}/users/batch`,
                { userIds }
            )
        )
        return data
    }
}
