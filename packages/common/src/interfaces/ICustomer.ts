import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';
import IGeoLocation, { IGeoLocationCreateObject }    from './IGeoLocation';
import IUser                                         from './IUser';
import { UserRole }                                  from '../consts/role'

export interface ICustomerInitializeObject extends DBCreateObject, IUser
{
	
	phone?: string;
	socialIds?: string[];
	isRegistrationCompleted?: boolean;
	role?: UserRole;
	isBanned?: boolean;
}

export interface ICustomerCreateObject extends ICustomerInitializeObject
{
	// TODO: Make not required
	geoLocation: IGeoLocationCreateObject;
	devicesIds?: string[];
	apartment?: string;
	stripeCustomerId?: string;
}

export interface IResponseGenerateCustomers
{
	success: boolean;
	message: string;
}

interface ICustomer extends ICustomerCreateObject, ICustomerInitializeObject, DBRawObject
{
	_id: PyroObjectId;
	geoLocation: IGeoLocation;
	devicesIds: string[];
	readonly fullAddress: string;
	readonly fullName: string;
}

export default ICustomer;
