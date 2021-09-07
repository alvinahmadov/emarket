import { ObjectId }                                       from 'bson';
import { first }                                          from 'rxjs/operators';
import { Mutation, Query, Resolver }                      from '@nestjs/graphql';
import Order                                              from '@modules/server.common/entities/Order';
import { IOrderCreateInput }                              from '@modules/server.common/routers/IWarehouseOrdersRouter';
import { getStoreOrdersFingObj, WarehousesOrdersService } from '../../services/warehouses';
import { OrdersService }                                  from '../../services/orders';

export type OrdersFilterModes =
		| 'ready'
		| 'in_delivery'
		| 'not_confirmed'
		| 'cancelled'
		| 'all';

@Resolver('WarehouseOrders')
export class WarehouseOrdersResolver
{
	constructor(
			private readonly _warehousesOrdersService: WarehousesOrdersService,
			private readonly _ordersService: OrdersService
	)
	{}
	
	@Query()
	async getStoreOrders(_, { storeId }: { storeId: string })
	{
		return this._warehousesOrdersService
		           .get(storeId)
		           .pipe(first())
		           .toPromise();
	}
	
	@Query()
	async getDashboardOrdersChartOrders(_, { storeId }: { storeId: string })
	{
		return this._ordersService
		           .getStoreOrdersChartTotalOrders(storeId);
	}
	
	@Query()
	async getNextOrderNumber(_, { storeId }: { storeId: string })
	{
		return this._warehousesOrdersService.getNextOrderNumber(storeId);
	}
	
	@Query()
	async getMerchantsOrders()
	{
		return this._ordersService.Model.aggregate([
			                                           { $match: { warehouse: { $ne: null } } },
			                                           {
				                                           $group: {
					                                           _id:         '$warehouse',
					                                           ordersCount: { $sum: 1 }
				                                           }
			                                           }
		                                           ]);
	}
	
	@Query()
	async getStoreOrdersTableData(_, { storeId, pagingOptions = {}, status })
	{
		if(!pagingOptions || (pagingOptions && !pagingOptions['sort']))
		{
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'asc' };
		}
		
		const orders = await this._warehousesOrdersService.getStoreOrders(
				storeId,
				pagingOptions,
				status
		);
		
		let page = 1;
		
		if(pagingOptions)
		{
			page = Math.ceil(
					pagingOptions['skip'] / pagingOptions['limit'] + 1
			);
		}
		
		return { orders: orders.map((o) => new Order(o)), page };
	}
	
	@Query()
	async getCountOfStoreOrders(
			_,
			{ storeId, status }: { storeId: string; status: OrdersFilterModes }
	)
	{
		const findObj = getStoreOrdersFingObj(storeId, status);
		
		return this._ordersService.Model.find(findObj).countDocuments().exec();
	}
	
	@Query()
	async removeCustomerOrders(
			_,
			{ storeId, customerId }: { storeId: string; customerId: string }
	)
	{
		const res = await this._ordersService.Model.update(
				{
					'customer._id': new ObjectId(customerId),
					warehouse:      storeId,
					isDeleted:      false
				},
				{ isDeleted: true },
				{ multi: true }
		).exec();
		
		return {
			number:   res.n,
			modified: res.nModified
		};
	}
	
	@Query()
	async getOrdersInDelivery(_, { storeId }: { storeId: string })
	{
		const order = await this._ordersService.getOrdersInDelivery(storeId);
		return order || [];
	}
	
	@Mutation()
	async createOrder(
			_,
			{ createInput }: { createInput: IOrderCreateInput }
	): Promise<Order>
	{
		return this._warehousesOrdersService.create(createInput);
	}
}
