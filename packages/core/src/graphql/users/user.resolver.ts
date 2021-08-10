import {
	Mutation,
	Query,
	ResolveProperty,
	Resolver
}                           from '@nestjs/graphql';
import { UseGuards }        from '@nestjs/common';
import { first }            from 'rxjs/operators';
import { ObjectId }         from 'mongodb';
import {
	default as IUser,
	IResponseGenerateCustomers,
	IUserCreateObject
}                           from '@modules/server.common/interfaces/IUser';
import User                 from '@modules/server.common/entities/User';
import {
	AddableRegistrationInfo,
	IUserRegistrationInput
}                           from '@modules/server.common/routers/IUserAuthRouter';
import { DevicesService }   from '../../services/devices';
import {
	UsersOrdersService,
	UsersService,
	UsersAuthService
}                           from '../../services/users';
import { OrdersService }    from '../../services/orders';
import { FakeUsersService } from '../../services/fake-data';
import { FakeDataGuard }    from '../../auth/guards/fake-data.guard';

@Resolver('User')
export class UserResolver
{
	constructor(
			private readonly _usersService: UsersService,
			private readonly _usersAuthService: UsersAuthService,
			private readonly _usersOrdersService: UsersOrdersService,
			private readonly _devicesService: DevicesService,
			private readonly _ordersService: OrdersService
	)
	{}
	
	@Query()
	async isUserEmailExists(_, { email }: { email: string }): Promise<boolean>
	{
		return this._usersService.isUserEmailExists(email);
	}
	
	@Query()
	async getSocial(_, { socialId }: { socialId: string })
	{
		return this._usersService.getSocial(socialId);
	}
	
	@Query('isUserExists')
	async userExists(_, { conditions }): Promise<boolean>
	{
		const userId = conditions.exceptCustomerId;
		const memberKey = conditions.memberKey;
		const memberValue = conditions.memberValue;
		
		return (
				(await this._usersService.count({
					                                _id: { $nin: [new ObjectId(userId)] },
					                                isDeleted: { $eq: false },
					                                [memberKey]: memberValue
				                                })) > 0
		);
	}
	
	@Query('user')
	async getUser(_, { id })
	{
		return this._usersService.get(id).pipe(first()).toPromise();
	}
	
	@Query('users')
	async getUsers(_, { findInput, pagingOptions = {} })
	{
		if(!pagingOptions || (pagingOptions && !pagingOptions['sort']))
		{
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'desc' };
		}
		
		const users = await this._usersService.getUsers(
				findInput,
				pagingOptions
		);
		
		return users.map((u) => new User(u));
	}
	
	@Query('getOrders')
	async getOrders(_, { userId })
	{
		await this._usersService.throwIfNotExists(userId);
		
		return await this._usersOrdersService
		                 .get(userId)
		                 .pipe(first())
		                 .toPromise();
	}
	
	@Query()
	async getCountOfUsers()
	{
		return this._usersService.Model
		           .find({ isDeleted: { $eq: false } })
		           .countDocuments()
		           .exec();
	}
	
	@Query()
	async getCustomerMetrics(_, { id }: { id: string })
	{
		return this._usersOrdersService
		           .getCustomerMetrics(id);
	}
	
	@Query()
	@UseGuards(FakeDataGuard)
	async generate1000Customers(
			_,
			{ defaultLng, defaultLat }: { defaultLng: number; defaultLat: number }
	): Promise<IResponseGenerateCustomers>
	{
		let success = true;
		let message = null;
		
		const fakeUsersService = new FakeUsersService(this._usersService, this._usersAuthService);
		
		try
		{
			await this._ordersService.generateOrdersPerEachCustomer(
					await fakeUsersService.generateCustomers(
							1000,
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
	async updateUser(
			_,
			{ id, updateObject }: { id: string; updateObject: IUserCreateObject }
	)
	{
		return this._usersService.updateUser(id, updateObject);
	}
	
	@Mutation()
	async updateUserEmail(
			_,
			{ userId, email }: { userId: string; email: string }
	)
	{
		return this._usersService.updateEmail(userId, email);
	}
	
	@Mutation()
	async registerUser(
			_,
			{ registerInput }: { registerInput: IUserRegistrationInput }
	)
	{
		return this._usersAuthService.register(registerInput);
	}
	
	@Mutation()
	async userLogin(
			_,
			{ email, password }: { email: string; password: string }
	)
	{
		return this._usersAuthService.login(email, password);
	}
	
	@Mutation()
	async removeUsersByIds(obj, { ids }: { ids: string[] })
	{
		const users = await this._usersService
		                        .find({
			                              _id: { $in: ids },
			                              isDeleted: { $eq: false }
		                              });
		
		const usersIds = users.map((u) => u.id);
		
		return this._usersService.removeMultipleByIds(usersIds);
	}
	
	@ResolveProperty('devices')
	async getDevices(_user: IUser)
	{
		const user = new User(_user);
		let userDevices = await this._devicesService
		                            .getMultipleDevices(user.devicesIds);
		
		return userDevices
				.pipe(first())
				.toPromise();
	}
	
	@Mutation()
	async updateUserPassword(
			_,
			{
				id,
				password
			}: { id: User['id']; password: { current: string; new: string } }
	)
	{
		return this._usersAuthService.updatePassword(id, password);
	}
	
	@Mutation()
	async addUserRegistrationInfo(
			_,
			{
				id,
				registrationInfo
			}: { id: User['id']; registrationInfo: AddableRegistrationInfo }
	)
	{
		return this._usersAuthService.addRegistrationInfo(id, registrationInfo);
	}
	
	@Mutation()
	async banUser(_, { id }: { id: User['id'] })
	{
		return this._usersService.banUser(id);
	}
	
	@Mutation()
	async unbanUser(_, { id }: { id: User['id'] })
	{
		return this._usersService.unbanUser(id);
	}
}
