import Logger                                       from 'bunyan';
import { inject, injectable, LazyServiceIdentifer } from 'inversify';
import _                                            from 'lodash';
import { Observable, of, concat }                   from 'rxjs';
import { exhaustMap, filter, share }                from 'rxjs/operators';
import { observableListener, routerName }           from '@pyro/io';
import { ExistenceEventType, ExistenceEvent }       from '@pyro/db-server';
import OrderCarrierStatus                           from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus                         from '@modules/server.common/enums/OrderWarehouseStatus';
import Order                                        from '@modules/server.common/entities/Order';
import Customer                                     from '@modules/server.common/entities/Customer';
import ICustomerOrdersRouter                        from '@modules/server.common/routers/ICustomerOrdersRouter';
import { CustomersService }                         from './CustomersService';
import IService                                     from '../IService';
import { OrdersService }                            from '../orders';
import { createLogger }                             from '../../helpers/Log';
import mongoose = require('mongoose');

/**
 * Customers Orders Service
 * TODO: rename Users to Customers
 *
 * @export
 * @class CustomersOrdersService
 * @implements {IUserOrdersRouter}
 * @implements {IService}
 */
@injectable()
@routerName('customer-orders')
export class CustomersOrdersService implements ICustomerOrdersRouter, IService
{
	protected readonly log: Logger = createLogger({
		                                              name: 'usersOrdersService'
	                                              });
	
	constructor(
			@inject(new LazyServiceIdentifer(() => OrdersService))
			protected ordersService: OrdersService,
			@inject(new LazyServiceIdentifer(() => CustomersService))
			protected usersService: CustomersService
	)
	{}
	
	/**
	 * Get Orders for given Customers
	 * TODO: add paging
	 *
	 * @param {Customer['id']} userId
	 * @returns {Observable<Order[]>}
	 * @memberof UsersOrdersService
	 */
	@observableListener()
	get(userId: Customer['id']): Observable<Order[]>
	{
		return concat(
				of(null),
				this.ordersService
				    .existence
				    .pipe(
						    filter((e: ExistenceEvent<Order>) =>
								           CustomersOrdersService._shouldPull(userId, e)),
						    share()
				    )
		).pipe(exhaustMap(() => this.getCurrent(userId)));
	}
	
	/**
	 * Get Orders for given Customers
	 * TODO: add paging
	 *
	 * @param {string} userId
	 * @returns {Promise<Order[]>}
	 * @memberof UsersOrdersService
	 */
	async getCurrent(userId: string): Promise<Order[]>
	{
		const orders = await this.ordersService
		                         .find({
			                               'customer._id': new mongoose.Types.ObjectId(userId),
			                               isDeleted:      { $eq: false }
		                               });
		
		return _.orderBy(
				orders,
				[(order) => order.createdAt, (order) => order.orderNumber],
				['desc', 'desc']
		);
	}
	
	async getCustomerMetrics(id: string)
	{
		const completedUserOrders =
				      await this.ordersService
				                .Model
				                .find({
					                      $and: [
						                      { 'customer._id': id },
						                      {
							                      $or: [
								                      { carrierStatus: OrderCarrierStatus.DeliveryCompleted },
								                      {
									                      warehouseStatus:
									                      OrderWarehouseStatus.GivenToCustomer
								                      }
							                      ]
						                      },
						                      { isCancelled: false }
					                      ]
				                      }).select({ products: 1 });
		
		const completedOrdersTotalSum = completedUserOrders
				.map((o) => o.products
				             .map((p) => p.price * p.count)
				             .reduce((a, b) => a + b, 0))
				.reduce((a, b) => a + b, 0);
		
		const totalOrders = await this.ordersService
		                              .Model
		                              .find({
			                                    'customer._id': id
		                                    })
		                              .countDocuments()
		                              .exec();
		
		const canceledOrders = await this.ordersService
		                                 .Model
		                                 .find({
			                                       $and: [
				                                       { 'customer._id': id }, { isCancelled: true }
			                                       ]
		                                       })
		                                 .countDocuments()
		                                 .exec();
		
		return {
			totalOrders,
			canceledOrders,
			completedOrdersTotalSum
		};
	}
	
	private static _shouldPull(customerId: Customer['id'], event: ExistenceEvent<Order>)
	{
		switch(event.type as ExistenceEventType)
		{
			case ExistenceEventType.Created:
				return event.value != null && event.value.customer.id === customerId;
			
			case ExistenceEventType.Updated:
				return (
						(event.value != null && event.value.customer.id === customerId) ||
						(event.lastValue != null &&
						 event.lastValue.customer.id === customerId)
				);
			
			case ExistenceEventType.Removed:
				return (
						event.lastValue != null &&
						event.lastValue.customer.id === customerId
				);
		}
	}
}
