import { inject, injectable }              from 'inversify';
import Logger                              from 'bunyan';
import { asyncListener, routerName }       from '@pyro/io';
import { EntityService }                   from '@pyro/db-server/entity-service';
import { ICustomerCreateObject }           from '@modules/server.common/interfaces/ICustomer';
import Customer                            from '@modules/server.common/entities/Customer';
import ICustomerAuthRouter, {
	AddableRegistrationInfo,
	ICustomerLoginResponse,
	ICustomerRegistrationInput
}                                          from '@modules/server.common/routers/ICustomerAuthRouter';
import { NotInvitedError }                 from '@modules/server.common/errors/NotInvitedError';
import IService                            from '../IService';
import { CustomersService }                from '../customers';
import { AuthService, AuthServiceFactory } from '../auth';
import { InvitesService }                  from '../invites';
import { createLogger }                    from '../../helpers/Log';
import { env }                             from '../../env';

/**
 * Customers Authentication Service
 * TODO: rename "Users" to "Customers"
 *
 * @export
 * @class CustomersAuthService
 * @extends {EntityService<User>}
 * @implements {IUserAuthRouter}
 * @implements {IService}
 */
@injectable()
@routerName('user-auth')
export class CustomersAuthService extends EntityService<Customer>
		implements ICustomerAuthRouter, IService
{
	private static IS_INVITES_SYSTEM_ON: boolean = env.SETTING_INVITES_ENABLED;
	readonly DBObject: any = Customer;
	protected readonly log: Logger = createLogger({
		                                              name: 'userAuthService'
	                                              });
	
	private readonly authService: AuthService<Customer>;
	
	constructor(
			private readonly usersService: CustomersService,
			private readonly invitesService: InvitesService,
			@inject('Factory<AuthService>')
			private readonly authServiceFactory: AuthServiceFactory
	)
	{
		super();
		
		this.authService = this.authServiceFactory({
			                                           role:       'user',
			                                           Entity:     Customer,
			                                           saltRounds: env.USER_PASSWORD_BCRYPT_SALT_ROUNDS
		                                           });
	}
	
	/**
	 * Register Customer.
	 * Throw NotInvitedError if customer not invited and invites system enabled
	 *
	 *
	 * @param {IUserRegistrationInput} input
	 * @returns {Promise<User>}
	 * @memberof UsersAuthService
	 */
	@asyncListener()
	async register(input: ICustomerRegistrationInput): Promise<Customer>
	{
		if(
				CustomersAuthService.IS_INVITES_SYSTEM_ON &&
				!(await this._isInvited(input.user))
		)
		{
			throw new NotInvitedError();
		}
		
		if(input.user.firstName === '')
		{
			delete input.user.firstName;
		}
		
		if(input.user.lastName === '')
		{
			delete input.user.lastName;
		}
		
		if(input.user.email === '')
		{
			delete input.user.email;
		}
		
		return await this.usersService.create({
			                                      ...input.user,
			                                      ...(input.password
			                                          ? {
						                                      hash: await this.authService.getPasswordHash(
								                                      input.password
						                                      )
					                                      }
			                                          : {})
		                                      });
	}
	
	/**
	 * Updates Customer password
	 *
	 * @param {User['id']} id
	 * @param {{ current: string; new: string }} password
	 * @returns {Promise<void>}
	 * @memberof UsersAuthService
	 */
	@asyncListener()
	async updatePassword(
			id: Customer['id'],
			password: { current: string; new: string }
	): Promise<void>
	{
		await this.usersService.throwIfNotExists(id);
		await this.authService.updatePassword(id, password);
	}
	
	/**
	 * Update exited Customer with given registration details (email, password, etc)
	 *
	 * @param {User['id']} id
	 * @param {AddableRegistrationInfo} {
	 * 			email,
	 * 			password,
	 * 			firstName,
	 * 			lastName,
	 * 			phone
	 * 		}
	 * @returns {Promise<void>}
	 * @memberof UsersAuthService
	 */
	@asyncListener()
	async addRegistrationInfo(
			id: Customer['id'],
			{ email, password, firstName, lastName, phone }: AddableRegistrationInfo
	): Promise<void>
	{
		await this.usersService.throwIfNotExists(id);
		
		const user = await this.usersService.getCurrent(id);
		
		if(user.email == null && email)
		{
			throw new Error('To add password user must have email');
		}
		
		await this.authService.addPassword(id, password);
		
		await this.usersService.update(id, {
			...(email ? { email } : {}),
			...(firstName ? { firstName } : {}),
			...(lastName ? { lastName } : {}),
			...(phone ? { phone } : {})
		});
	}
	
	/**
	 * Login Customer (returns user record and Auth token)
	 * TODO: Make possible to login by email or username
	 *
	 * @param {string} emailOrUsername
	 * @param {string} password
	 * @returns {(Promise<IUserLoginResponse | null>)}
	 * @memberof UsersAuthService
	 */
	@asyncListener()
	async login(
			emailOrUsername: string,
			password: string
	): Promise<ICustomerLoginResponse | null>
	{
		const res = await this.authService.login({ emailOrUsername }, password);
		
		if(!res || res.entity.isDeleted)
		{
			return null;
		}
		
		return {
			user:  res.entity,
			token: res.token
		};
	}
	
	/**
	 * Get current Registration settings (e.g. registrationRequiredOnStart)
	 *
	 * @memberof UsersAuthService
	 */
	@asyncListener()
	async getRegistrationsSettings(): Promise<{
		registrationRequiredOnStart: boolean;
	}>
	{
		return new Promise<{ registrationRequiredOnStart: boolean }>(
				(resolve, reject) =>
				{
					resolve({
						        registrationRequiredOnStart:
						        env.SETTINGS_REGISTRATIONS_REQUIRED_ON_START
					        });
				}
		);
	}
	
	private async _isInvited(
			userCreateObject: ICustomerCreateObject
	): Promise<boolean>
	{
		const inviteFindObject = {
			'geoLocation.countryId': userCreateObject.geoLocation.countryId,
			'geoLocation.city':      userCreateObject.geoLocation.city,
			'geoLocation.streetAddress':
			                         userCreateObject.geoLocation.streetAddress,
			'geoLocation.house':     userCreateObject.geoLocation.house,
			apartment:               userCreateObject.apartment
		};
		
		if(userCreateObject.geoLocation.postcode)
		{
			inviteFindObject['geoLocation.postcode'] =
					userCreateObject.geoLocation.postcode;
		}
		
		const invite = await this.invitesService.findOne(inviteFindObject);
		
		return invite != null;
	}
}
