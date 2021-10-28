import { Injectable }     from '@angular/core';
import {
	Router,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	CanActivate
}                         from '@angular/router';
import { StorageService } from 'app/services/storage';

@Injectable()
export class SocieModuleGuard implements CanActivate
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
		const id = route.params['id'];
		if(id)
		{
			this.storage.customerId = id;
			this.router.navigate(['products'])
			    .catch(e => console.error(e));
			return false;
		}
		return true;
	}
}
