import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { StorageService }         from 'services/storage.service';

@Injectable()
export class InfoModuleGuard implements CanLoad
{
	constructor(
			private readonly router: Router,
			private readonly storageService: StorageService
	)
	{}
	
	canLoad(route: Route)
	{
		if(!this.storageService.warehouseId || !this.storageService.deviceId)
		{
			this.router.navigate(['login']);
			return false;
		}
		
		return true;
	}
}
