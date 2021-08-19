import { ExtractJwt }                               from 'passport-jwt';
import jwt                                          from 'jsonwebtoken';
import { first }                                    from 'rxjs/operators';
import { inject, injectable, LazyServiceIdentifer } from 'inversify';
import { routerName }                               from '@pyro/io';
import JwtAppType                                   from "@modules/server.common/enums/JwtAppType"
import { WarehousesService }                        from '../warehouses';
import { CarriersService }                          from '../carriers';
import { env }                                      from '../../env';

const jwtSecret = env.JWT_SECRET;
const jwtExpires = env.JWT_EXPIRES;

if(jwtSecret === 'default')
{
	console.log(
			'Warning: default JWT_SECRET used. Please add your own to config!'
	);
}

export const createJwtData = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: jwtSecret
};

export interface JwtPayload
{
	// id of carrier or warehouse
	id: string;
	// name of app, e.g. 'carrier' or 'warehouse'.
	appName: JwtAppType;
}

export function createToken(id: string, appName: JwtAppType)
{
	const user: JwtPayload = { id, appName };
	return jwt.sign(user, 'secretKey', {
		expiresIn: jwtExpires
	});
}

@injectable()
@routerName('auth')
export class AuthenticationService
{
	constructor(
			@inject(new LazyServiceIdentifer(() => WarehousesService))
			protected warehousesService: WarehousesService,
			@inject(new LazyServiceIdentifer(() => CarriersService))
			protected carriersService: CarriersService
	)
	{}
	
	async validateUser(payload: JwtPayload): Promise<any>
	{
		if(payload.appName === 'carrier')
		{
			return this.carriersService
			           .get(payload.id)
			           .pipe(first())
			           .toPromise();
		}
		else if(payload.appName === 'warehouse')
		{
			return this.warehousesService
			           .get(payload.id)
			           .pipe(first())
			           .toPromise();
		}
		else
		{
			return null;
		}
	}
}
