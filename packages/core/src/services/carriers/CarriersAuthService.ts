import Logger                                        from 'bunyan';
import { inject, injectable }                        from 'inversify';
import { first }                                     from 'rxjs/operators';
import { asyncListener, routerName }                 from '@pyro/io';
import { DBService }                                 from '@pyro/db-server';
import ICarrierAuthRouter,
{ ICarrierLoginResponse, ICarrierRegistrationInput } from '@modules/server.common/routers/ICarrierAuthRouter';
import Carrier                                       from '@modules/server.common/entities/Carrier';
import IService                                      from '../IService';
import { AuthService, AuthServiceFactory }           from '../auth';
import { env }                                       from '../../env';
import { createLogger }                              from '../../helpers/Log';

@injectable()
@routerName('carrier')
export class CarriersAuthService extends DBService<Carrier>
		implements ICarrierAuthRouter, IService
{
	public readonly DBObject: any = Carrier;
	protected readonly log: Logger = createLogger({
		                                              name: 'carriersService'
	                                              });
	
	private readonly authService: AuthService<Carrier>;
	
	constructor(
			@inject('Factory<AuthService>')
			private readonly authServiceFactory: AuthServiceFactory
	)
	{
		super();
		this.authService = this.authServiceFactory({
			                                           role:       'carrier',
			                                           Entity:     Carrier,
			                                           saltRounds: env.CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS
		                                           });
	}
	
	@asyncListener()
	async login(
			authInfo: string,
			password: string,
			expiresIn?: string | number
	): Promise<ICarrierLoginResponse | null>
	{
		const res = await this.authService.login({
			                                         $or: [
				                                         { email: authInfo },
				                                         { username: authInfo }
			                                         ]
		                                         }, password, expiresIn);
		
		if(!res)
		{
			return null;
		}
		else if(res.entity.isDeleted)
		{
			return null;
		}
		
		return {
			carrier: res.entity,
			token:   res.token
		};
	}
	
	@asyncListener()
	async register(input: ICarrierRegistrationInput)
	{
		return await super.create({
			                          ...input.carrier,
			                          ...(input.password
			                              ? {
						                          hash: await this.authService.getPasswordHash(
								                          input.password
						                          )
					                          }
			                              : {})
		                          });
	}
	
	async updatePassword(
			id: Carrier['id'],
			password: { current: string; new: string }
	): Promise<void>
	{
		await this.throwIfNotExists(id);
		await this.authService.updatePassword(id, password);
	}
	
	async throwIfNotExists(carrierId: string)
	{
		const carrier = await super.get(carrierId).pipe(first()).toPromise();
		
		if(!carrier || carrier.isDeleted)
		{
			throw Error(`Carrier with id '${carrierId}' does not exists!`);
		}
	}
}

export default CarriersAuthService;
