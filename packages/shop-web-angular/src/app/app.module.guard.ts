import { Injectable }     from '@angular/core';
import {
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
}                         from '@angular/router';
import { StorageService } from 'app/services/storage';

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
			this.router.navigate(['maintenance-info'])
			    .catch(console.warn);
			return false;
		}
		
		const serverConnection = Number(this.storage.serverConnection);
		
		if(serverConnection === 0)
		{
			this.router.navigate(['server-down'])
			    .catch(console.warn);
			return false;
		}
		return true;
	}
}
