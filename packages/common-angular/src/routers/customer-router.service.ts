import { Observable }            from 'rxjs';
import { map }                   from 'rxjs/operators';
import { cards }                 from 'stripe';
import { Injectable }            from '@angular/core';
import ICustomer,
{
	ICustomerUpdateObject,
	ICustomerFindObject
}                                from '@modules/server.common/interfaces/ICustomer';
import IPagingOptions            from '@modules/server.common/interfaces/IPagingOptions';
import Customer                  from '@modules/server.common/entities/Customer';
import GeoLocation               from '@modules/server.common/entities/GeoLocation';
import ICustomerRouter           from '@modules/server.common/routers/ICustomerRouter';
import { Router, RouterFactory } from '../lib/router';

@Injectable()
export class CustomerRouter implements ICustomerRouter
{
	private readonly router: Router;
	
	constructor(routerFactory: RouterFactory)
	{
		this.router = routerFactory.create('customer');
	}
	
	get(id: string): Observable<Customer>
	{
		return this.router
		           .runAndObserve<Customer>('get', id)
		           .pipe(map((user) => this._customerFactory(user)));
	}
	
	getCustomers(findObj: ICustomerFindObject, pagingOptions?: IPagingOptions): Observable<Customer>
	{
		return this.router.runAndObserve<Customer>(
				'getCustomers',
				findObj,
				pagingOptions
		).pipe(
				map((customer) => this._customerFactory(customer))
		)
	}
	
	async updateCustomer(
			id: string,
			customerUpdateObject: ICustomerUpdateObject
	): Promise<Customer>
	{
		const user = await this.router.run<Customer>(
				'updateCustomer',
				id,
				customerUpdateObject
		);
		return this._customerFactory(user);
	}
	
	addPaymentMethod(
			customerId: string,
			tokenId: string
	): Promise<string /*cardId*/>
	{
		return this.router.run<string>('addPaymentMethod', customerId, tokenId);
	}
	
	getCards(customerId: string): Promise<cards.ICard[]>
	{
		return this.router.run<cards.ICard[]>('getCards', customerId);
	}
	
	async updateEmail(customerId: string, email: string): Promise<Customer>
	{
		const user = await this.router.run<Customer>('updateEmail', customerId, email);
		return this._customerFactory(user);
	}
	
	async updateRole(customerId: Customer['id'], role: string): Promise<Customer>
	{
		const user = await this.router.run<Customer>('updateRole', customerId, role);
		return this._customerFactory(user);
	}
	
	async updateGeoLocation(
			customerId: string,
			geoLocation: GeoLocation
	): Promise<Customer>
	{
		const user = await this.router.run<Customer>(customerId, geoLocation);
		return this._customerFactory(user);
	}
	
	getAboutUs(
			customerId: string,
			deviceId: string,
			selectedLanguage: string
	): Observable<string>
	{
		return this.router.runAndObserve<string>(
				'getAboutUs',
				customerId,
				deviceId,
				selectedLanguage
		);
	}
	
	getTermsOfUse(
			customerId: string,
			deviceId: string,
			selectedLanguage: string
	): Observable<string>
	{
		return this.router.runAndObserve<string>(
				'getTermsOfUse',
				customerId,
				deviceId,
				selectedLanguage
		);
	}
	
	getHelp(
			customerId: string,
			deviceId: string,
			selectedLanguage: string
	): Observable<string>
	{
		return this.router.runAndObserve<string>(
				'getHelp',
				customerId,
				deviceId,
				selectedLanguage
		);
	}
	
	getPrivacy(
			customerId: string,
			deviceId: string,
			selectedLanguage: string
	): Observable<string>
	{
		return this.router.runAndObserve<string>(
				'getPrivacy',
				customerId,
				deviceId,
				selectedLanguage
		);
	}
	
	protected _customerFactory(customer: ICustomer)
	{
		return customer == null ? null : new Customer(customer);
	}
}
