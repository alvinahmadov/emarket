import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { StorageService }         from 'services/storage.service';

@Injectable()
export class DeliveryModuleGuard implements CanLoad
{
	constructor(
			private readonly storage: StorageService,
			private readonly router: Router
	)
	{}
	
	async canLoad(route: Route)
	{
		const orderId = this.storage.orderId;
		if(!orderId)
		{
			await this.router.navigateByUrl('/main/home');
			return false;
		}
		const driveToWarehouseFrom = this.storage.driveToWarehouseFrom;
		if(driveToWarehouseFrom === 'delivery')
		{
			await this.router.navigateByUrl('/main/drive-to-warehouse');
			return false;
		}
		return true;
	}
}
