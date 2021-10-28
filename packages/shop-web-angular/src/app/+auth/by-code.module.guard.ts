import { Injectable }     from '@angular/core';
import {
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
}                         from '@angular/router';
import { StorageService } from 'app/services/storage';

@Injectable()
export class ByCodeModuleGuard implements CanActivate
{
	constructor(
			private readonly router: Router,
			private readonly storage: StorageService
	)
	{}
	
	canActivate(
			route: ActivatedRouteSnapshot,
			state: RouterStateSnapshot
	): boolean
	{
		if(!this.storage.inviteSystem)
		{
			this.router.navigate(['auth/by-location']);
			return false;
		}
		return true;
	}
}
