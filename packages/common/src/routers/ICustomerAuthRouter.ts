import { CreateObject } from '@pyro/db/db-create-object';
import Customer         from '../entities/Customer';

export interface AddableRegistrationInfo
{
	email?: string;
	password: string;
	
	firstName?: string;
	lastName?: string;
	phone?: string;
}

export interface ICustomerRegistrationInput
{
	user: CreateObject<Customer>;
	password?: string;
}

export interface ICustomerLoginResponse
{
	user: Customer;
	token: string;
}

interface ICustomerAuthRouter
{
	/**
	 * Register Customer with given details
	 * Note: if invites system is on, it throws NotInvited if customer not invited
	 *
	 * @param {ICustomerRegistrationInput} input
	 * @returns {Promise<Customer>}
	 * @memberof IUserAuthRouter
	 */
	register(input: ICustomerRegistrationInput): Promise<Customer>;
	
	login(
			username: string,
			password: string
	): Promise<ICustomerLoginResponse | null>;
	
	addRegistrationInfo(
			id: Customer['id'],
			info: AddableRegistrationInfo
	): Promise<void>;
	
	updatePassword(
			id: Customer['id'],
			password: { current: string; new: string }
	): Promise<void>;
	
	getRegistrationsSettings(): Promise<{
		registrationRequiredOnStart: boolean;
	}>;
}

export default ICustomerAuthRouter;
