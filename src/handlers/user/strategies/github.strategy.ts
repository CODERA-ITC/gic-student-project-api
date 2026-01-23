import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github2'

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(private config: ConfigService) {
        super({
            clientID: config.get<string>('GITHUB_CLIENT_ID')!,
            clientSecret: config.get<string>('GITHUB_CLIENT_SECRET')!,
            callbackURL: config.get<string>('GITHUB_CALLBACK_URL')!,
            scope: ['user:email'],
        })
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: Function,
    ): Promise<any> {
        const { emails } = profile
        const user = {
            email: emails[0].value,
            firstName: profile.username,
            lastName: profile.username,
            role: 'STUDENT',

        }
        console.log(user)
        done(null, user)
    }
}
