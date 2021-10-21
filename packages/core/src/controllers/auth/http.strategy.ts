import { PassportStrategy }                  from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy }                          from 'passport-http-bearer';
import { ExtractJwt }                        from 'passport-jwt';
import { AuthService, JwtPayload }           from './auth.service';
import { env }                               from '../../env';

@Injectable()
export class HttpStrategy extends PassportStrategy(Strategy)
{
	constructor(private readonly authService: AuthService)
	{
		super({
			      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			      secretOrKey:    env.JWT_SECRET
		      });
	}
	
	async validate(payload: JwtPayload, done: Function)
	{
		const user = await this.authService.validateUser(payload);
		if(!user)
		{
			return done(new UnauthorizedException(), false);
		}
		done(null, user);
	}
}
