import { Injectable }     from '@angular/core';
import {
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
}                         from '@angular/router';
import { StorageService } from '@app/@core/data/store.service';

@Injectable()
export class MaintenanceModuleGuard implements CanActivate
{
	constructor(private readonly router: Router, private storage: StorageService) {}
	
	canActivate(
			route: ActivatedRouteSnapshot,
			state: RouterStateSnapshot
	): boolean
	{
		const maintenanceMode = this.storage.maintenanceMode;
		
		if(!maintenanceMode)
		{
			this.router.navigate(['']);
			return false;
		}
		return true;
	}
}
