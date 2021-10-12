import Logger                                            from 'bunyan';
import { inject, injectable, LazyServiceIdentifer }      from 'inversify';
import { concat, Observable }                            from 'rxjs';
import { exhaustMap, map, first }                        from 'rxjs/operators';
import { observableListener, routerName, asyncListener } from '@pyro/io';
import Customer                                          from '@modules/server.common/entities/Customer';
import Warehouse                                         from '@modules/server.common/entities/Warehouse';
import IWarehouseCustomersRouter                         from '@modules/server.common/routers/IWarehouseCustomersRouter';
import { WarehousesOrdersService }                       from './WarehousesOrdersService';
import { WarehousesService }                             from './WarehousesService';
import IService                                          from '../IService';
import { OrdersService }                                 from '../orders';
import { createLogger }                                  from '../../helpers/Log';

/**
 * Warehouses Customers Service
 *
 * @export
 * @class WarehousesCustomersService
 * @implements {IService}
 * @implements {IWarehouseCustomersRouter}
 */
@injectable()
@routerName('warehouse-users')
export class WarehousesCustomersService implements IService, IWarehouseCustomersRouter
{
	protected log: Logger = createLogger({
		                                     name: 'warehousesUsersService'
	                                     });
	
	constructor(
			@inject(new LazyServiceIdentifer(() => WarehousesOrdersService))
			private readonly warehousesOrdersService: WarehousesOrdersService,
			@inject(new LazyServiceIdentifer(() => OrdersService))
			private readonly ordersService: OrdersService,
			@inject(new LazyServiceIdentifer(() => WarehousesService))
			private readonly _warehousesService: WarehousesService
	)
	{}
	
	/**
	 * Returns the customers who made orders from the given Store
	 * @param {String} warehouseId
	 * @returns {Observable<User[]>}
	 */
	@observableListener()
	get(warehouseId: Warehouse['id']): Observable<Customer[]>
	{
		return concat(
				null,
				this.warehousesOrdersService.getExistence(warehouseId)
		)
				.pipe(
						exhaustMap(() =>
						           {
							           return this.ordersService.Model
							                      .distinct('customer._id', {
								                      warehouse: warehouseId,
								                      isDeleted: { $eq: false }
							                      })
							                      .lean()
							                      .exec();
						           }),
						map((users: Customer[]) => users.map((u) => new Customer(u)))
				);
	}
	
	/**
	 * Returns the customers who made orders from from the given Store
	 *
	 * @param {Warehouse['id']} warehouseId
	 * @returns {Promise<User[]>}
	 * @memberof WarehousesUsersService
	 */
	@asyncListener()
	async getPromise(warehouseId: Warehouse['id']): Promise<Customer[]>
	{
		await this._warehousesService.throwIfNotExists(warehouseId);
		return this.get(warehouseId)
		           .pipe(first())
		           .toPromise();
	}
}
