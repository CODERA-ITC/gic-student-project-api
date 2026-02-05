import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { PaginateUserDto } from './dto/paginate-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UserClient {
    private readonly userHost: string
    constructor(
        private readonly configService: ConfigService,
        private readonly http: HttpService,
    ) {
        this.userHost = String(configService.get('USER_SERVICE_HOST'))
    }

    async getUser(userId: string): Promise<User | null> {
        const { data } = await firstValueFrom(
            this.http.get(`${this.userHost}/users/${userId}`),
        )
        return data
    }

    async getUsers(
        params: PaginateUserDto,
        user?: { access_token: string },
    ) {
        const headers = user?.access_token
            ? this.getHeaders(user)
            : undefined

        const { data } = await firstValueFrom(
            this.http.get(`${this.userHost}/users`, {
                params,
                headers,
            }),
        )

        return data
    }

    async patchUser(
        userId: string,
        dto: UpdateUserDto,
        user?: { access_token: string },
    ) {
        const headers = user?.access_token
            ? this.getHeaders(user)
            : undefined

        const { data } = await firstValueFrom(
            this.http.patch(
                `${this.userHost}/users/${userId}`,
                dto,
                { headers },
            ),
        )

        return data
    }

    private getHeaders(user: any) {
        return {
            Authorization: `Bearer ${user.access_token}`,
        }
    }
}
