import UserRole         from '../consts/role'
import { PyroObjectId } from "@pyro/db";

interface IUser
{
	_id?: PyroObjectId;
	username?: string;
	email?: string;
	hash?: string;
	avatar?: string;
	firstName?: string;
	lastName?: string;
	role?: UserRole;
	
	readonly fullName?: string;
}

export default IUser;
