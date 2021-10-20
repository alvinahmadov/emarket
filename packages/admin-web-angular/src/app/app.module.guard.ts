import { Injectable }     from '@angular/core';
import {
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
}                         from '@angular/router';
import { StorageService } from './@core/data/store.service';

@Injectable()
export class AppModuleGuard implements CanActivate
{
	constructor(private readonly router: Router, private storage: StorageService) {}
	
	canActivate(
			route: ActivatedRouteSnapshot,
			state: RouterStateSnapshot
	): boolean
	{
		const maintenanceMode = this.storage.maintenanceMode;
		
		if(maintenanceMode)
		{
			this.router.navigate(['maintenance-info']);
			return false;
		}
		
		const serverConnection = Number(this.storage.serverConnection);
		
		if(serverConnection === 0)
		{
			this.router.navigate(['server-down']);
			return false;
		}
		
		return true;
	}
}
