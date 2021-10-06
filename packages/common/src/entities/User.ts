import IUser            from '../interfaces/IUser';
import { PyroObjectId } from '@pyro/db';
import UserRole         from '../consts/role';
import uuid             from 'uuid';

/**
 * User class that's common for admin, merchant and customer
 * Allows to convert different types to one
 * */
export class User implements IUser
{
	_id: PyroObjectId;
	username: string;
	email: string;
	avatar: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	
	constructor(user: IUser)
	{
		this._id = user._id;
		this.id = this._id.toString() ?? uuid();
		this.username = user.username ?? user.email;
		this.avatar = user.avatar ?? "https://via.placeholder.com/60x60";
		this.email = user.email;
		this.role = user.role;
		this.firstName = user.firstName;
		this.lastName = user.lastName;
	}
	
	get id(): string
	{
		return this._id.toString();
	}
	
	set id(id: string)
	{
		this._id = id;
	}
}
