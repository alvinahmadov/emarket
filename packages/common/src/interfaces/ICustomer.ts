import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';
import IGeoLocation, { IGeoLocationCreateObject }    from './IGeoLocation';
import IUser                                         from './IUser';

export interface ICustomerInitializeObject extends DBCreateObject, IUser
{
	name: string;
	email: string;
	phone?: string;
	socialIds?: string[];
	isRegistrationCompleted?: boolean;
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

export interface ICustomerUpdateObject extends DBCreateObject, IUser
{
	email?: string;
	avatar?: string;
	firstName?: string;
	lastName?: string;
	socialIds?: string[];
	isRegistrationCompleted?: boolean;
	apartment?: string;
	geoLocation?: IGeoLocationCreateObject;
}

export interface IResponseGenerateCustomers
{
	success: boolean;
	message: string;
}

interface ICustomer extends ICustomerCreateObject, ICustomerInitializeObject, DBRawObject
{
	_id: PyroObjectId;
	name: string;
	email: string;
	geoLocation: IGeoLocation;
	devicesIds: string[];
	readonly fullAddress: string;
	readonly fullName: string;
}

export default ICustomer;
