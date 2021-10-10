import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';
import IGeoLocation, { IGeoLocationCreateObject }    from './IGeoLocation';
import IUser                                         from './IUser';
import Role                                          from '../enums/Role';

export interface ICustomerInitializeObject extends DBCreateObject, IUser
{
	username: string;
	email: string;
	phone?: string;
	role?: Role;
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

export interface ICustomerFindInput
{
	id?: string
	firstName?: string
	lastName?: string
	username?: string
	role?: Role;
	email?: string
	phone?: string
	apartment?: string
	avatar?: string
}

export interface ICustomerUpdateObject extends DBCreateObject, IUser
{
	email?: string;
	avatar?: string;
	firstName?: string;
	lastName?: string;
	role?: Role;
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
	username: string;
	email: string;
	geoLocation: IGeoLocation;
	devicesIds: string[];
	readonly fullAddress: string;
	readonly fullName: string;
}

export default ICustomer;
