import { PyroObjectId } from '../@pyro/db';
import Role             from '../enums/Role'

interface IUser
{
	_id?: PyroObjectId;
	username?: string;
	email?: string;
	hash?: string;
	avatar?: string;
	firstName?: string;
	lastName?: string;
	role?: Role;
	
	readonly fullName?: string;
}

export default IUser;
