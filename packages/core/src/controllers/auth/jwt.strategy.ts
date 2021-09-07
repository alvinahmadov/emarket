import { ExtractJwt, Strategy }              from 'passport-jwt';
import { PassportStrategy }                  from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import Customer                              from '@modules/server.common/entities/Customer';
import { AuthService, JwtPayload }           from './auth.service';
import { env }                               from '../../env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy)
{
	constructor(private readonly authService: AuthService)
	{
		super({
			      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			      secretOrKey:    env.JWT_SECRET
		      });
	}
	
	async validate(
			payload: JwtPayload,
			done: (ex: any, b: Customer | boolean) => void
	)
	{
		const user = await this.authService.validateUser(payload);
		if(!user)
		{
			return done(new UnauthorizedException(), false);
		}
		done(null, user);
	}
}
