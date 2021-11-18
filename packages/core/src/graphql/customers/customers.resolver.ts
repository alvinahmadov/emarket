import {
	Mutation,
	Query,
	ResolveField,
	Resolver
}                                from '@nestjs/graphql';
import { UseGuards }             from '@nestjs/common';
import { Types }                 from 'mongoose';
import { first }                 from 'rxjs/operators';
import ICustomer, {
	IResponseGenerateCustomers
}                                from '@modules/server.common/interfaces/ICustomer';
import { ICustomerOrderMetrics } from '@modules/server.common/interfaces/ICustomerOrder';
import Device                    from '@modules/server.common/entities/Device';
import Customer                  from '@modules/server.common/entities/Customer';
import {
	ICustomerRegistrationInput,
	ICustomerRegistrationInfoInput,
	ICustomerLoginInput,
	ICustomerLoginResponse,
	ICustomerPasswordUpdateInput
}                                from '@modules/server.common/routers/ICustomerAuthRouter';
import {
	ICustomerIdInput,
	ICustomerEmailInput,
	ICustomerUpdateInput,
	ICustomerFindInput,
	ICustomerMemberInput
}                                from '@modules/server.common/routers/ICustomerRouter';
import { DevicesService }        from '../../services/devices';
import {
	CustomersOrdersService,
	CustomersService
}                                from '../../services/customers';
import { CustomersAuthService }  from '../../services/customers/CustomersAuthService';
import { OrdersService }         from '../../services/orders';
import { FakeUsersService }      from '../../services/fake-data';
import { FakeDataGuard }         from '../../auth/guards/fake-data.guard';

export interface ICustomerGenerateInput
{
	defaultLng: number;
	defaultLat: number,
	qty?: number
}

@Resolver('Customer')
export class CustomerResolver
{
	constructor(
			private readonly _customersService: CustomersService,
			private readonly _customersAuthService: CustomersAuthService,
			private readonly _customersOrdersService: CustomersOrdersService,
			private readonly _devicesService: DevicesService,
			private readonly _ordersService: OrdersService
	)
	{}
	
	@Query()
	public async isCustomerEmailExists(_, { email }: Omit<ICustomerEmailInput, 'id'>): Promise<boolean>
	{
		return this._customersService.isUserEmailExists(email);
	}
	
	@Query()
	public async getSocial(_, { socialId }: { socialId: string }): Promise<Customer>
	{
		return this._customersService.getSocial(socialId);
	}
	
	@Query('isCustomerExists')
	public async customerExists(
			_,
			{ exceptCustomerId, memberKey, memberValue }: ICustomerMemberInput
	): Promise<boolean>
	{
		return (
				(await this._customersService.count({
					                                    _id:         { $nin: [new Types.ObjectId(exceptCustomerId)] },
					                                    isDeleted:   { $eq: false },
					                                    [memberKey]: memberValue
				                                    })) > 0
		);
	}
	
	@Query('isCustomerAuthenticated')
	public async isAuthenticated(_, { token }: { token: string }): Promise<boolean>
	{
		return this._customersAuthService.isAuthenticated(token);
	}
	
	@Query('customer')
	public async getCustomer(_, { id }: ICustomerIdInput): Promise<Customer | null>
	{
		return this._customersService.get(id).pipe(first()).toPromise();
	}
	
	@Query('customers')
	public async getCustomers(_, { pagingOptions = {} }): Promise<Customer[]>
	{
		return this.searchCustomers(_, { pagingOptions });
	}
	
	@Query('findCustomers')
	public async searchCustomers(_, { findInput, pagingOptions = {} }: ICustomerFindInput)
	{
		if(!pagingOptions || (pagingOptions && !pagingOptions['sort']))
		{
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'desc' };
		}
		
		const customers = await this._customersService.getCustomers(
				findInput,
				pagingOptions
		);
		
		return customers.map((u) => new Customer(u));
	}
	
	@Query('getOrders')
	public async getOrders(_, { id }: ICustomerIdInput)
	{
		await this._customersService.throwIfNotExists(id);
		
		return await this._customersOrdersService
		                 .get(id)
		                 .pipe(first())
		                 .toPromise();
	}
	
	@Query()
	public async getCountOfCustomers(): Promise<number>
	{
		return this._customersService.Model
		           .find({ isDeleted: { $eq: false } })
		           .countDocuments()
		           .exec();
	}
	
	@Query()
	public async getCustomerMetrics(_, { id }: ICustomerIdInput): Promise<ICustomerOrderMetrics>
	{
		return this._customersOrdersService
		           .getCustomerMetrics(id);
	}
	
	@Query()
	@UseGuards(FakeDataGuard)
	public async generateCustomers(
			_,
			{ defaultLng, defaultLat, qty = 1000 }: ICustomerGenerateInput
	): Promise<IResponseGenerateCustomers>
	{
		let success = true;
		let message = null;
		
		const fakeUsersService = new FakeUsersService(
				this._customersService,
				this._customersAuthService
		);
		
		try
		{
			await this._ordersService.generateOrdersPerEachCustomer(
					await fakeUsersService.generateCustomers(
							qty,
							defaultLng,
							defaultLat
					)
			);
		} catch(err)
		{
			message = err.message;
			success = false;
		}
		
		return {
			success,
			message
		};
	}
	
	@Mutation()
	public async updateCustomer(_, { id, updateObject }: ICustomerUpdateInput): Promise<Customer>
	{
		return this._customersService.updateCustomer(id, updateObject);
	}
	
	@Mutation()
	public async updateCustomerEmail(_, { id, email }: ICustomerEmailInput): Promise<Customer>
	{
		return this._customersService.updateEmail(id, email);
	}
	
	@Mutation()
	public async registerCustomer(
			_,
			{ registerInput }: { registerInput: ICustomerRegistrationInput }
	): Promise<Customer>
	{
		return this._customersAuthService.register(registerInput);
	}
	
	@Mutation()
	public async customerLogin(_, { authInfo, password, expiresIn }: ICustomerLoginInput): Promise<ICustomerLoginResponse>
	{
		return this._customersAuthService.login(authInfo, password, expiresIn);
	}
	
	@Mutation()
	public async removeCustomersByIds(_, { ids }: { ids: string[] }): Promise<void>
	{
		const customers = await this._customersService
		                            .find({
			                                  _id:       { $in: ids },
			                                  isDeleted: { $eq: false }
		                                  });
		
		const customersIds = customers.map((u) => u.id);
		
		return this._customersService.removeMultipleByIds(customersIds);
	}
	
	@ResolveField('devices')
	public async getDevices(_customer: ICustomer): Promise<Device[]>
	{
		const customer = new Customer(_customer);
		let customerDevices = await this._devicesService
		                                .getMultipleDevices(customer.devicesIds);
		
		return customerDevices
				.pipe(first())
				.toPromise();
	}
	
	@Mutation()
	public async updateCustomerPassword(_, { id, password }: ICustomerPasswordUpdateInput): Promise<void>
	{
		return this._customersAuthService.updatePassword(id, password);
	}
	
	@Mutation()
	public async addCustomerRegistrationInfo(
			_,
			{ id, registrationInfo }: ICustomerRegistrationInfoInput
	): Promise<void>
	{
		return this._customersAuthService.addRegistrationInfo(id, registrationInfo);
	}
	
	@Mutation()
	public async banCustomer(_, { id }: ICustomerIdInput): Promise<Customer>
	{
		return this._customersService.banUser(id);
	}
	
	@Mutation()
	public async unbanCustomer(_, { id }: ICustomerIdInput): Promise<Customer>
	{
		return this._customersService.unbanUser(id);
	}
}
