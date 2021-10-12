import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Storage }                from 'services/storage.service';

@Injectable()
export class InfoModuleGuard implements CanLoad
{
	constructor(
			private readonly store: Storage,
			private readonly router: Router
	)
	{}
	
	canLoad(route: Route)
	{
		if(!this.store.warehouseId || !this.store.deviceId)
		{
			this.router.navigate(['auth']);
			return false;
		}
		
		return true;
	}
}
