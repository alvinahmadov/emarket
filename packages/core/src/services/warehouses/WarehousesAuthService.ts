import Logger                                                                                               from "bunyan";
import { inject, injectable }                                                                               from "inversify";
import { first }                                                                                            from "rxjs/operators";
import { asyncListener, routerName, }                                                                       from '@pyro/io';
import { DBService }                                                                                        from '@pyro/db-server';
import Warehouse                                                                                            from "@modules/server.common/entities/Warehouse";
import IWarehouseAuthRouter, { IWarehouseLoginInput, IWarehouseLoginResponse, IWarehouseRegistrationInput } from "@modules/server.common/routers/IWarehouseAuthRouter";
import { IWarehouseCreateObject }                                                                           from "@modules/server.common/interfaces/IWarehouse";
import IService                                                                                             from "../IService";
import { AuthService, AuthServiceFactory }                                                                  from "../auth";
import { createLogger }                                                                                     from "../../helpers/Log";
import { env }                                                                                              from "../../env";

@injectable()
@routerName('warehouse-auth')
export class WarehousesAuthService extends DBService<Warehouse>
		implements IWarehouseAuthRouter, IService
{
	public readonly DBObject: any = Warehouse;
	protected log: Logger = createLogger({ name: 'warehousesAuthService' });
	private readonly authService: AuthService<Warehouse>;
	
	constructor(
			@inject('Factory<AuthService>')
			private readonly authServiceFactory: AuthServiceFactory
	)
	{
		super();
		
		const authConfig = {
			role: 'warehouse',
			Entity: Warehouse,
			saltRounds: env.WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS
		};
		
		this.authService = this.authServiceFactory(authConfig);
	}
	
	/**
	 * Create new Merchant
	 *
	 * @param {IWarehouseRegistrationInput} input
	 * @returns
	 * @memberof WarehousesAuthService
	 */
	@asyncListener()
	async register(input: IWarehouseRegistrationInput)
	{
		const warehouseCreateObj: IWarehouseCreateObject = {
			...input.warehouse,
			...(input.password
			    ? {
						hash: await this.authService.getPasswordHash(
								input.password
						)
					}
			    : {})
		}
		
		return await super.create(warehouseCreateObj);
	}
	
	/**
	 * Authenticate user in the Merchant app
	 *
	 * @returns {(Promise<IWarehouseLoginResponse | null>)}
	 * @memberof WarehousesAuthService
	 * @param {IWarehouseLoginInput} loginInput Input containing username, password and token
	 */
	@asyncListener()
	async login(
			loginInput: IWarehouseLoginInput
	): Promise<IWarehouseLoginResponse | null>
	{
		const username: string = loginInput.username;
		const password: string = loginInput.password;
		const token: string = loginInput.token;
		
		try
		{
			if(token)
			{
				return await this._loginByToken(username, token);
			}
			else if(username && password)
			{
				return await this._loginByUser(username, password);
			}
			
		} catch(e)
		{
			this.log.debug(e);
		}
		
		this.log.error({
			               username: username,
			               password: password,
			               token: token
		               },
		               `Neither user nor token specified`);
		
		return {
			warehouse: undefined,
			token: ''
		};
	}
	
	@asyncListener()
	async isAuthenticated(
			token: string
	): Promise<boolean>
	{
		return await this.authService.isAuthenticated(token);
	}
	
	/**
	 * Update password for Merchant admin user
	 *
	 * @param {Warehouse['id']} id
	 * @param {{ current: string; new: string }} password
	 * @returns {Promise<void>}
	 * @memberof WarehousesAuthService
	 */
	@asyncListener()
	async updatePassword(
			id: Warehouse['id'],
			password: { current: string; new: string }
	): Promise<void>
	{
		await this.throwIfNotExists(id);
		await this.authService.updatePassword(id, password);
	}
	
	/**
	 * Check if merchant record exists and not deleted.
	 * Throws exception if not found or deleted.
	 *
	 * @param {string} storeId
	 * @memberof WarehousesService
	 */
	async throwIfNotExists(storeId: string): Promise<void>
	{
		const store = await super.get(storeId)
		                         .pipe(first())
		                         .toPromise();
		
		if(!store || store.isDeleted)
		{
			throw Error(`Store with id '${storeId}' does not exists!`);
		}
	}
	
	private async _loginByToken(username: string, token: string)
	{
		this.log.info(
				{
					username,
					token
				},
				'.loginByToken(token) called'
		);
		
		const res = await this.authService.login({ username }, null, token);
		
		if(!res || res.entity.isDeleted)
		{
			return null;
		}
		
		return {
			warehouse: res.entity,
			token: res.token
		}
	}
	
	private async _loginByUser(
			username: string,
			password: string
	)
	{
		this.log.info(
				{
					username,
					password
				},
				'.loginByUser(username, password) called'
		);
		
		const res = await this.authService.login({ username }, password, null);
		
		if(!res || res.entity.isDeleted)
		{
			return null;
		}
		
		return {
			warehouse: res.entity,
			token: res.token
		}
	}
}
