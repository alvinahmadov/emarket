import { Injectable }     from '@angular/core';
import {
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
}                         from '@angular/router';
import { StorageService } from 'services/storage.service';

@Injectable()
export class PagesModuleGuard implements CanActivate
{
	constructor(
			private readonly router: Router,
			private readonly storageService: StorageService
	)
	{}
	
	canActivate(
			route: ActivatedRouteSnapshot,
			state: RouterStateSnapshot
	): boolean
	{
		const maintenanceMode = this.storageService.maintenanceMode;
		if(maintenanceMode)
		{
			this.router.navigate(['maintenance-info']);
			return false;
		}
		const serverConnection = Number(this.storageService.serverConnection);
		
		if(serverConnection === 0)
		{
			this.router.navigate(['server-down']);
			return false;
		}
		return true;
	}
}
