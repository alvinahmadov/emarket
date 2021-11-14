import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { first }                  from 'rxjs/operators';
import OrderCarrierStatus         from '@modules/server.common/enums/OrderCarrierStatus';
import { OrderRouter }            from '@modules/client.common.angular2/routers/order-router.service';
import { StorageService }         from 'services/storage.service';

@Injectable()
export class DriveToWarehouseModuleGuard implements CanLoad
{
	constructor(
			private readonly router: Router,
			private readonly orderRouter: OrderRouter,
			private readonly storageService: StorageService
	)
	{}
	
	public async canLoad(route: Route)
	{
		const orderId = this.storageService.orderId;
		if(orderId)
		{
			const order = await this.orderRouter
			                        .get(orderId, {
				                        populateCarrier:   false,
				                        populateWarehouse: false,
			                        })
			                        .pipe(first())
			                        .toPromise();
			
			const driveToWarehouseFrom = this.storageService.driveToWarehouseFrom;
			
			if(driveToWarehouseFrom === 'delivery')
			{
				return true;
			}
			
			if(order.carrierStatus > OrderCarrierStatus.CarrierSelectedOrder)
			{
				this.router.navigateByUrl('/main/starting-delivery');
				return false;
			}
		}
		else
		{
			this.router.navigateByUrl('/main/home');
			return false;
		}
		return true;
	}
}
