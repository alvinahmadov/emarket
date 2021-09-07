import { Injectable }            from '@angular/core';
import { Observable }            from 'rxjs';
import IWarehouseCustomersRouter from '@modules/server.common/routers/IWarehouseCustomersRouter';
import Customer                  from '@modules/server.common/entities/Customer';
import Warehouse                 from '@modules/server.common/entities/Warehouse';
import { Router, RouterFactory } from '../lib/router';

@Injectable()
export class WarehouseCustomersService implements IWarehouseCustomersRouter
{
	private readonly router: Router;
	
	constructor(routerFactory: RouterFactory)
	{
		this.router = routerFactory.create('warehouse-users');
	}
	
	get(warehouseId: Warehouse['id']): Observable<Customer[]>
	{
		return this.router.runAndObserve('get', warehouseId);
	}
	
	getMerchant(warehouseId: Warehouse['id'], username: string): Observable<Customer>
	{
		return this.router
		           .runAndObserve<Customer>('getMerchant', username);
	}
}
