import {
	Mutation,
	Query,
	ResolveField,
	Resolver
}                               from '@nestjs/graphql';
import { UseGuards }            from '@nestjs/common';
import { Types }                from 'mongoose';
import { first }                from 'rxjs/operators';
import {
	default as ICustomer,
	IResponseGenerateCustomers,
	ICustomerUpdateObject
}                               from '@modules/server.common/interfaces/ICustomer';
import Customer                 from '@modules/server.common/entities/Customer';
import {
	AddableRegistrationInfo,
	ICustomerRegistrationInput
}                               from '@modules/server.common/routers/ICustomerAuthRouter';
import { DevicesService }       from '../../services/devices';
import {
	CustomersOrdersService,
	CustomersService
}                               from '../../services/customers';
import { CustomersAuthService } from '../../services/customers/CustomersAuthService';
import { OrdersService }        from '../../services/orders';
import { FakeUsersService }     from '../../services/fake-data';
import { FakeDataGuard }        from '../../auth/guards/fake-data.guard';

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
	async isCustomerEmailExists(_, { email }: { email: string }): Promise<boolean>
	{
		return this._customersService.isUserEmailExists(email);
	}
	
	@Query()
	async getSocial(_, { socialId }: { socialId: string })
	{
		return this._customersService.getSocial(socialId);
	}
	
	@Query('isCustomerExists')
	async customerExists(_, { conditions }): Promise<boolean>
	{
		const userId = conditions.exceptCustomerId;
		const memberKey = conditions.memberKey;
		const memberValue = conditions.memberValue;
		
		return (
				(await this._customersService.count({
					                                    _id:         { $nin: [new Types.ObjectId(userId)] },
					                                    isDeleted:   { $eq: false },
					                                    [memberKey]: memberValue
				                                    })) > 0
		);
	}
	
	@Query('customer')
	async getCustomer(_, { id })
	{
		return this._customersService.get(id).pipe(first()).toPromise();
	}
	
	@Query('customers')
	async getCustomers(_, { pagingOptions = {} })
	{
		return this.findCustomers(_, { findInput: {}, pagingOptions });
	}
	
	@Query('findCustomers')
	async findCustomers(_, { findInput, pagingOptions = {} })
	{
		if(!pagingOptions || (pagingOptions && !pagingOptions['sort']))
		{
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'desc' };
		}
		
		if(!findInput)
			findInput = {}
		
		const customers = await this._customersService.getCustomers(
				findInput,
				pagingOptions
		);
		
		return customers.map((u) => new Customer(u));
	}
	
	@Query('getOrders')
	async getOrders(_, { userId: customerId })
	{
		await this._customersService.throwIfNotExists(customerId);
		
		return await this._customersOrdersService
		                 .get(customerId)
		                 .pipe(first())
		                 .toPromise();
	}
	
	@Query()
	async getCountOfCustomers()
	{
		return this._customersService.Model
		           .find({ isDeleted: { $eq: false } })
		           .countDocuments()
		           .exec();
	}
	
	@Query()
	async getCustomerMetrics(_, { id }: { id: string })
	{
		return this._customersOrdersService
		           .getCustomerMetrics(id);
	}
	
	@Query()
	@UseGuards(FakeDataGuard)
	async generateCustomers(
			_,
			{ qty, defaultLng, defaultLat }: { qty?: number, defaultLng: number; defaultLat: number }
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
	async updateCustomer(
			_,
			{ id, updateObject }: { id: string; updateObject: ICustomerUpdateObject }
	)
	{
		return this._customersService.updateCustomer(id, updateObject);
	}
	
	@Mutation()
	async updateCustomerEmail(
			_,
			{ userId, email }: { userId: string; email: string }
	)
	{
		return this._customersService.updateEmail(userId, email);
	}
	
	@Mutation()
	async registerCustomer(
			_,
			{ registerInput }: { registerInput: ICustomerRegistrationInput }
	)
	{
		return this._customersAuthService.register(registerInput);
	}
	
	@Mutation()
	async customerLogin(
			_,
			{ email, password }: { email: string; password: string }
	)
	{
		return this._customersAuthService.login(email, password);
	}
	
	@Mutation()
	async removeCustomersByIds(obj, { ids }: { ids: string[] })
	{
		const users = await this._customersService
		                        .find({
			                              _id:       { $in: ids },
			                              isDeleted: { $eq: false }
		                              });
		
		const usersIds = users.map((u) => u.id);
		
		return this._customersService.removeMultipleByIds(usersIds);
	}
	
	@ResolveField('devices')
	async getDevices(_user: ICustomer)
	{
		const customer = new Customer(_user);
		let customerDevices = await this._devicesService
		                                .getMultipleDevices(customer.devicesIds);
		
		return customerDevices
				.pipe(first())
				.toPromise();
	}
	
	@Mutation()
	async updateCustomerPassword(
			_,
			{
				id,
				password
			}: { id: Customer['id']; password: { current: string; new: string } }
	)
	{
		return this._customersAuthService.updatePassword(id, password);
	}
	
	@Mutation()
	async addCustomerRegistrationInfo(
			_,
			{
				id,
				registrationInfo
			}: { id: Customer['id']; registrationInfo: AddableRegistrationInfo }
	)
	{
		return this._customersAuthService.addRegistrationInfo(id, registrationInfo);
	}
	
	@Mutation()
	async banCustomer(_, { id }: { id: Customer['id'] })
	{
		return this._customersService.banUser(id);
	}
	
	@Mutation()
	async unbanCustomer(_, { id }: { id: Customer['id'] })
	{
		return this._customersService.unbanUser(id);
	}
}
