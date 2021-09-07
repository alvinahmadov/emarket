import { Injectable }       from '@nestjs/common';
import jwt                  from 'jsonwebtoken';
import { first }            from 'rxjs/operators';
import Logger               from 'bunyan';
import Customer             from '@modules/server.common/entities/Customer';
import { CustomersService } from '../../services/customers';
import { createLogger }     from '../../helpers/Log';
import { env }              from '../../env';

export interface JwtPayload
{
	id: string;
}

@Injectable()
export class AuthService
{
	public readonly DBObject = Customer;
	protected readonly log: Logger = createLogger({ name: 'authService' });
	
	constructor(private readonly _customersService: CustomersService) {}
	
	async createToken(id: string)
	{
		const user: JwtPayload = { id };
		return jwt.sign(user, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES });
	}
	
	async validateUser(payload: JwtPayload): Promise<Customer | null>
	{
		return this._customersService
		           .get(payload.id)
		           .pipe(first())
		           .toPromise();
	}
}
