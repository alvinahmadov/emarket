import _                         from 'lodash';
import { Observable }            from 'rxjs';
import { map }                   from 'rxjs/operators';
import { Injectable }            from '@angular/core';
import IOrder                    from '@modules/server.common/interfaces/IOrder';
import IOrderProductInfo         from '@modules/server.common/interfaces/IOrderProductInfo';
import ICustomerOrdersRouter     from '@modules/server.common/routers/ICustomerOrdersRouter';
import Order                     from '@modules/server.common/entities/Order';
import { Router, RouterFactory } from '../lib/router';

@Injectable()
export class CustomerOrdersRouter implements ICustomerOrdersRouter
{
	private readonly router: Router;
	
	constructor(routerFactory: RouterFactory)
	{
		this.router = routerFactory.create('user-orders');
	}
	
	get(userId: string): Observable<Order[]>
	{
		return this.router
		           .runAndObserve<IOrder[]>('get', userId)
		           .pipe(
				           map((orders) =>
						               _.map(orders, (order) => this._orderFactory(order))
				           )
		           );
	}
	
	getOrderedProducts(userId: string): Observable<IOrderProductInfo[]>
	{
		return this.router.runAndObserve<IOrderProductInfo[]>(
				'getOrderedProducts',
				userId
		);
	}
	
	protected _orderFactory(order: IOrder)
	{
		return order == null ? null : new Order(order);
	}
}
