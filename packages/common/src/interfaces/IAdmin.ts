import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';
import IUser                                         from '../interfaces/IUser';

export interface IAdminCreateObject extends DBCreateObject, IUser
{
	/**
	 * Full name (First Name plus Last Name)
	 *
	 * @type {string}
	 * @memberof IAdminCreateObject
	 */
	username: string;
	
	email: string;
	
	/**
	 * Password Hash
	 *
	 * @type {string}
	 * @memberof IAdminCreateObject
	 */
	hash: string;
	
	avatar: string;
}

export interface IAdminUpdateObject extends DBCreateObject, IUser
{
	/**
	 * Full name (First Name plus Last Name)
	 *
	 * @type {string}
	 * @memberof IAdminCreateObject
	 */
	username?: string;
	
	email?: string;
	avatar?: string;
	firstName?: string;
	lastName?: string;
}

export interface IAdminFindInput extends IUser
{
	username?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
}

interface IAdmin extends DBRawObject, IAdminCreateObject
{
	_id: PyroObjectId;
	readonly fullName: string;
}

export default IAdmin;
