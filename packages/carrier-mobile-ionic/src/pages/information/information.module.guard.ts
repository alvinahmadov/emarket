import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { StorageService }         from '../../services/storage.service';

@Injectable()
export class InformationModuleGuard implements CanLoad
{
	constructor(
			private readonly storageService: StorageService,
			private readonly router: Router
	)
	{}
	
	public canLoad(route: Route)
	{
		if(!this.storageService.deviceId)
		{
			this.router.navigate(['login']);
			return false;
		}
		
		return true;
	}
}
