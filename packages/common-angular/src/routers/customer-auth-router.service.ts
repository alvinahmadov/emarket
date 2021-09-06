import { Injectable }            from '@angular/core';
import ICustomer                 from '@modules/server.common/interfaces/ICustomer';
import Customer                  from '@modules/server.common/entities/Customer';
import ICustomerAuthRouter, {
	AddableRegistrationInfo,
	ICustomerRegistrationInput,
	ICustomerLoginResponse,
}                                from '@modules/server.common/routers/ICustomerAuthRouter';
import { Router, RouterFactory } from '../lib/router';

@Injectable()
export class CustomerAuthRouter implements ICustomerAuthRouter
{
	private readonly router: Router;
	
	constructor(routerFactory: RouterFactory)
	{
		this.router = routerFactory.create('user-auth');
	}
	
	/**
	 * Register Customer
	 * Note: if invites system is on - throws NotInvited if not invited
	 *
	 * @param {IUserRegistrationInput} input
	 * @returns {Promise<User>}
	 * @memberof UserAuthRouter
	 */
	async register(input: ICustomerRegistrationInput): Promise<Customer>
	{
		const u = await this.router.run<ICustomer>('register', input);
		return this._userFactory(u);
	}
	
	async addRegistrationInfo(
			id: Customer['id'],
			info: AddableRegistrationInfo
	): Promise<void>
	{
		await this.router.run('addRegistrationInfo', id, info);
	}
	
	async login(
			username: string,
			password: string
	): Promise<ICustomerLoginResponse | null>
	{
		const res = await this.router.run<ICustomerLoginResponse>(
				'login',
				username,
				password
		);
		
		if(res == null)
		{
			return null;
		}
		else
		{
			return {
				token: res.token,
				user:  this._userFactory(res.user),
			};
		}
	}
	
	async updatePassword(
			id: string,
			password: { current: string; new: string }
	): Promise<void>
	{
		await this.router.run('updatePassword', id, password);
	}
	
	protected _userFactory(user: ICustomer)
	{
		return user == null ? null : new Customer(user);
	}
	
	getRegistrationsSettings(): Promise<{
		registrationRequiredOnStart: boolean;
	}>
	{
		return this.router.run<{ registrationRequiredOnStart: boolean }>(
				'getRegistrationsSettings'
		);
	}
}
