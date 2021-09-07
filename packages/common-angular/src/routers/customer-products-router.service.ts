import { Observable }            from 'rxjs';
import { Injectable }            from '@angular/core';
import ICustomerProductsRouter   from '@modules/server.common/routers/ICustomerProductsRouter';
import { Router, RouterFactory } from '../lib/router';

@Injectable()
export class CustomerProductsRouter implements ICustomerProductsRouter
{
	private readonly router: Router;
	
	constructor(routerFactory: RouterFactory)
	{
		this.router = routerFactory.create('user-products');
	}
	
	getPlaceholder(userId: string, deviceId: string): Observable<string>
	{
		return this.router.runAndObserve<string>(
				'getPlaceholder',
				userId,
				deviceId
		);
	}
}
