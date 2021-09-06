import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';
import IUser                                         from '../interfaces/IUser';
import IGeoLocation, { IGeoLocationCreateObject }    from './IGeoLocation';

export interface ICustomerOrderInitializeObject extends DBCreateObject
{
	firstName?: string;
	lastName?: string;
	hash?: string;
	phone?: string;
	socialIds?: string[];
	isRegistrationCompleted?: boolean;
}

export interface ICustomerOrderCreateObject extends ICustomerOrderInitializeObject
{
	name: string;
	email: string;
	geoLocation: IGeoLocationCreateObject;
	devicesIds?: string[];
	apartment?: string;
	stripeCustomerId?: string;
}

interface ICustomerOrder
		extends ICustomerOrderCreateObject,
		        ICustomerOrderInitializeObject,
		        DBRawObject
{
	_id: PyroObjectId;
	geoLocation: IGeoLocation;
	devicesIds: string[];
	readonly fullAddress: string;
}

export default ICustomerOrder;
