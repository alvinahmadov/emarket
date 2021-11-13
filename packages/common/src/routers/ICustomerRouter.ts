import { Observable }                                 from 'rxjs';
import { cards }                                      from 'stripe';
import { ICustomerFindObject, ICustomerUpdateObject } from '../interfaces/ICustomer';
import IPagingOptions                                 from '../interfaces/IPagingOptions';
import Customer                                       from '../entities/Customer';
import GeoLocation                                    from '../entities/GeoLocation';
import Device                                         from '../entities/Device';

export interface ICustomerIdInput
{
	id: Customer['id'];
}

export interface ICustomerEmailInput extends ICustomerIdInput
{
	email: string;
}

export interface ICustomerUpdateInput extends ICustomerIdInput
{
	updateObject: ICustomerUpdateObject;
}

export interface ICustomerFindInput
{
	findInput?: ICustomerFindObject,
	pagingOptions?: IPagingOptions
}

export interface ICustomerMemberInput
{
	exceptCustomerId?: string;
	memberKey: string;
	memberValue: string;
}

interface ICustomerRouter
{
	get(id: Customer['id']): Observable<Customer | null>;
	
	updateCustomer(id: Customer['id'], user: ICustomerUpdateObject): Promise<Customer | null>;
	
	addPaymentMethod(customerId: Customer['id'], tokenId: string): Promise<string>;
	
	getCards(customerId: Customer['id']): Promise<cards.ICard[]>;
	
	updateEmail(customerId: Customer['id'], email: string): Promise<Customer>;
	
	updateRole(customerId: Customer['id'], role: string): Promise<Customer>;
	
	updateGeoLocation(
			customerId: Customer['id'],
			geoLocation: GeoLocation
	): Promise<Customer>;
	
	getAboutUs(
			customerId: Customer['id'],
			deviceId: Device['id'],
			selectedLanguage: string
	): Observable<string>;
	
	getTermsOfUse(
			customerId: Customer['id'],
			deviceId: Device['id'],
			selectedLanguage: string
	): Observable<string>;
	
	getHelp(
			customerId: Customer['id'],
			deviceId: Device['id'],
			selectedLanguage: string
	): Observable<string>;
	
	getPrivacy(
			customerId: Customer['id'],
			deviceId: Device['id'],
			selectedLanguage: string
	): Observable<string>;
}

export default ICustomerRouter;
