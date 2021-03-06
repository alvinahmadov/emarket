import { Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards }                               from '@nestjs/common';
import { first }                                   from 'rxjs/operators';
import IGeoLocation, { IGeoLocationCreateObject }  from '@modules/server.common/interfaces/IGeoLocation';
import IWarehouse                                  from '@modules/server.common/interfaces/IWarehouse';
import Customer                                    from '@modules/server.common/entities/Customer';
import GeoLocation                                 from '@modules/server.common/entities/GeoLocation';
import Order                                       from '@modules/server.common/entities/Order';
import Warehouse                                   from '@modules/server.common/entities/Warehouse';
import { IWarehouseRegistrationInput }             from '@modules/server.common/routers/IWarehouseAuthRouter';
import { GeoUtils }                                from '@modules/server.common/utilities';
import { GqlWarehouseGuard, GqlAdminGuard }        from '../../auth/guards/gql.guard';
import {
	WarehousesAuthService,
	WarehousesCarriersService,
	WarehousesOrdersService,
	WarehousesProductsService,
	WarehousesCustomersService,
	WarehousesService
}                                                  from '../../services/warehouses';
import { DevicesService }                          from '../../services/devices';
import { GeoLocationsWarehousesService }           from '../../services/geo-locations';
import { CustomersService }                        from '../../services/customers';
import { OrdersService }                           from '../../services/orders';

@Resolver('Warehouse')
export class WarehouseResolver
{
	constructor(
			private readonly _geoLocationWarehousesService: GeoLocationsWarehousesService,
			private readonly _warehousesService: WarehousesService,
			private readonly _warehousesAuthService: WarehousesAuthService,
			private readonly _warehousesOrdersService: WarehousesOrdersService,
			private readonly _warehousesCustomersService: WarehousesCustomersService,
			private readonly _warehousesCarriersService: WarehousesCarriersService,
			private readonly _warehouseProductsService: WarehousesProductsService,
			private readonly _devicesService: DevicesService,
			private readonly _ordersService: OrdersService,
			private readonly _customersService: CustomersService
	)
	{}
	
	@Query()
	async hasExistingStores(): Promise<boolean>
	{
		return (await this._warehousesService.count({})) > 0;
	}
	
	@Query()
	async getStoreProducts(
			_,
			{ storeId, fullProducts }: { storeId: string; fullProducts: boolean }
	)
	{
		return this._warehouseProductsService
		           .get(storeId, fullProducts)
		           .pipe(first())
		           .toPromise();
	}
	
	@Query()
	async getStoreAvailableProducts(_, { storeId }: { storeId: string })
	{
		return this._warehouseProductsService
		           .getAvailable(storeId)
		           .pipe(first())
		           .toPromise();
	}
	
	@Query()
	async getAllActiveStores(_, { fullProducts }: { fullProducts: boolean })
	{
		return this._warehousesService
		           .getAllActive(fullProducts)
		           .pipe(first())
		           .toPromise();
	}
	
	@Query()
	async countCustomers(_, { storeId }: { storeId: string })
	{
		const storeOrders: Order[] = await this._warehousesOrdersService
		                                       .get(storeId)
		                                       .pipe(first())
		                                       .toPromise();
		
		const storeCustomerIds = storeOrders.map((order: Order) =>
				                                         order.customer._id.toString()
		);
		
		return new Set(storeCustomerIds).size;
	}
	
	@Query()
	async getCountExistingCustomers()
	{
		const isDeletedFlag = { isDeleted: { $eq: false } };
		const customers: string[] = await this._ordersService
		                                      .Model
		                                      .find(isDeletedFlag)
		                                      .distinct('customer._id')
		                                      .lean();
		
		const storesIds: string[] = await this._ordersService.Model.find(
				                                      isDeletedFlag
		                                      )
		                                      .distinct('warehouse')
		                                      .lean();
		
		return {
			total:    customers.length,
			perStore: storesIds.map(async(storeId) =>
			                        {
				                        const customerIds: string[] =
						                              await this._ordersService
						                                        .Model
						                                        .find(
								                                        {
									                                        ...isDeletedFlag,
									                                        warehouse: storeId
								                                        }
						                                        ).distinct('customer._id');
				                        return {
					                        storeId,
					                        customersCount: customerIds.length
				                        };
			                        })
		};
	}
	
	@Query()
	async getCountExistingCustomersToday()
	{
		const isDeletedFlag = { isDeleted: { $eq: false } };
		
		const start = new Date();
		const end = new Date();
		start.setHours(0, 0, 0, 0);
		end.setHours(23, 59, 59, 999);
		
		const users = await this._ordersService
		                        .Model
		                        .find({
			                              ...isDeletedFlag,
			                              _createdAt: { $gte: start, $lt: end }
		                              })
		                        .distinct('customer._id')
		                        .lean()
		                        .exec();
		
		const storesIds: string[] = await this._ordersService
		                                      .Model
		                                      .find({
			                                            ...isDeletedFlag,
			                                            _createdAt: { $gte: start, $lt: end }
		                                            })
		                                      .distinct('warehouse')
		                                      .lean()
		                                      .exec();
		
		return {
			total:    users.length,
			perStore: storesIds.map(async(storeId) =>
			                        {
				                        const usersIds: string[] =
						                              await this._ordersService
						                                        .Model
						                                        .find(
								                                        {
									                                        ...isDeletedFlag,
									                                        'customer._id':
											                                        { $in: users.map((u) => u._id) },
									                                        warehouse: storeId
								                                        }
						                                        ).distinct('customer._id');
				                        return {
					                        storeId,
					                        customersCount: usersIds.length
				                        };
			                        })
		};
	}
	
	@Query('nearbyStores')
	async getNearbyStores(_, { geoLocation })
	{
		return this._geoLocationWarehousesService
		           .get(geoLocation)
		           .pipe(first())
		           .toPromise();
	}
	
	// @UseGuards(AuthGuard('jwt'))
	@Query('warehouse')
	async getWarehouse(_, { id }: { id: string })
	{
		return this._warehousesService
		           .get(id)
		           .pipe(first())
		           .toPromise();
	}
	
	@Query()
	async getAllStores()
	{
		return this._warehousesService.find({ isDeleted: { $eq: false } });
	}
	
	@Query('warehouses')
	async getWarehouses(_, { findInput, pagingOptions = {} })
	{
		if(!pagingOptions || (pagingOptions && !pagingOptions['sort']))
		{
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'desc' };
		}
		
		const merchants = await this._warehousesService.getMerchants(
				findInput,
				pagingOptions
		);
		
		return merchants.map((m) => new Warehouse(m));
	}
	
	@Query()
	@UseGuards(GqlAdminGuard, GqlWarehouseGuard)
	async getStoreCustomers(
			_,
			{ storeId }: { storeId: string }
	): Promise<Customer[]>
	{
		return this._warehousesCustomersService.getPromise(storeId);
	}
	
	@Query()
	async getCountOfMerchants()
	{
		return this._warehousesService
		           .Model
		           .find({ isDeleted: { $eq: false } })
		           .countDocuments()
		           .exec();
	}
	
	@Query()
	async getMerchantsByName(
			_,
			{
				searchName,
				geoLocation
			}: { searchName: string; geoLocation: IGeoLocation }
	)
	{
		const count = await this._warehousesService
		                        .Model
		                        .find({
			                              name: { $regex: searchName, $options: 'i' }
		                              })
		                        .countDocuments()
		                        .exec();
		
		let merchants = await this._warehousesService.getMerchants(
				{ name: { $regex: searchName, $options: 'i' } },
				{ skip: 0, limit: count }
		);
		
		if(geoLocation)
		{
			merchants = merchants.sort(
					(m1, m2) =>
							GeoUtils.getDistance(
									new GeoLocation(m1.geoLocation),
									new GeoLocation(geoLocation)
							) -
							GeoUtils.getDistance(
									new GeoLocation(m2.geoLocation),
									new GeoLocation(geoLocation)
							)
			);
		}
		
		return merchants.map((m) => new Warehouse(m));
	}
	
	@Mutation()
	async registerWarehouse(
			_,
			{ registerInput }: { registerInput: IWarehouseRegistrationInput }
	)
	{
		return this._warehousesAuthService.register(registerInput);
	}
	
	@Mutation()
	async warehouseLogin(
			_,
			{ username, password }: { username: string; password: string }
	)
	{
		return await this._warehousesAuthService.login(username, password);
	}
	
	@Mutation()
	async isAuthenticated(
			_,
			{ token }: { token: string }
	)
	{
		return await this._warehousesAuthService.isAuthenticated(token);
	}
	
	@Mutation()
	@UseGuards(GqlAdminGuard, GqlWarehouseGuard)
	async updateStoreGeoLocation(
			_,
			{
				storeId,
				geoLocation
			}: {
				storeId: string;
				geoLocation: IGeoLocationCreateObject;
			}
	)
	{
		return this._warehousesService.updateGeoLocation(storeId, geoLocation);
	}
	
	@Mutation()
	@UseGuards(GqlAdminGuard, GqlWarehouseGuard)
	async removeWarehousesByIds(_, { ids }: { ids: string[] })
	{
		return this._warehousesService.removeMultipleByIds(ids);
	}
	
	@ResolveField('devices')
	@UseGuards(GqlAdminGuard, GqlWarehouseGuard)
	async getDevices(_warehouse: IWarehouse)
	{
		const warehouse = new Warehouse(_warehouse);
		return this._devicesService
		           .getMultiple(warehouse.devicesIds)
		           .pipe(first())
		           .toPromise();
	}
	
	@ResolveField('orders')
	@UseGuards(GqlAdminGuard, GqlWarehouseGuard)
	async getOrders(_warehouse: IWarehouse)
	{
		const warehouse = new Warehouse(_warehouse);
		return this._warehousesOrdersService
		           .get(warehouse.id)
		           .pipe(first())
		           .toPromise();
	}
	
	@ResolveField('customers')
	@UseGuards(GqlAdminGuard, GqlWarehouseGuard)
	async getCustomers(_warehouse: IWarehouse)
	{
		const warehouse = new Warehouse(_warehouse);
		
		return this._warehousesCustomersService
		           .get(warehouse.id)
		           .pipe(first())
		           .toPromise();
	}
	
	@ResolveField('carriers')
	@UseGuards(GqlAdminGuard, GqlWarehouseGuard)
	async getCarriers(_warehouse: IWarehouse)
	{
		const warehouse = new Warehouse(_warehouse);
		
		return this._warehousesCarriersService
		           .get(warehouse.id)
		           .pipe(first())
		           .toPromise();
	}
	
	@Mutation()
	@UseGuards(GqlAdminGuard, GqlWarehouseGuard)
	async updateWarehousePassword(
			_,
			{
				id,
				password
			}: { id: Warehouse['id']; password: { current: string; new: string } }
	)
	{
		return this._warehousesAuthService.updatePassword(id, password);
	}
}
