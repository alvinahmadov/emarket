import { Injectable } from '@angular/core';
import {
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
}                     from '@angular/router';
import { Storage }    from 'services/storage.service';

@Injectable()
export class MaintenanceModuleGuard implements CanActivate
{
	constructor(
			private readonly router: Router,
			private readonly store: Storage
	)
	{}
	
	canActivate(
			route: ActivatedRouteSnapshot,
			state: RouterStateSnapshot
	): boolean
	{
		const maintenanceMode = this.store.maintenanceMode;
		if(!maintenanceMode)
		{
			this.router.navigate(['']);
			return false;
		}
		return true;
	}
}
