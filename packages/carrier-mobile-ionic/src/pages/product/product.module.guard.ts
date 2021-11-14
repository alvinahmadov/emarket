import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { StorageService }         from '../../services/storage.service';

@Injectable()
export class ProductModuleGuard implements CanLoad
{
	constructor(
			private readonly storageService: StorageService,
			private readonly router: Router
	)
	{}
	
	public async canLoad(route: Route)
	{
		if(!this.storageService.orderId)
		{
			this.router.navigateByUrl('/main/home');
			return false;
		}
		return true;
	}
}
