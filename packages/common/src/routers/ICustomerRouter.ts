import { Observable }            from 'rxjs';
import { cards }                 from 'stripe';
import { ICustomerUpdateObject } from '../interfaces/ICustomer';
import Customer                  from '../entities/Customer';
import GeoLocation               from '../entities/GeoLocation';
import Device                    from '../entities/Device';

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