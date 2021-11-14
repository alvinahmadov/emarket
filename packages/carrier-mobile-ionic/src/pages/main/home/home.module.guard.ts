import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { StorageService }         from 'services/storage.service';

@Injectable()
export class HomeModuleGuard implements CanLoad
{
	constructor(
			private readonly storageService: StorageService,
			private readonly router: Router
	)
	{}
	
	public async canLoad(route: Route)
	{
		const orderId = this.storageService.orderId;
		if(orderId)
		{
			this.router.navigateByUrl('/main/drive-to-warehouse');
			return false;
		}
		return true;
	}
}
