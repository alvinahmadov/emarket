import { Injectable }                                                                       from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot } from '@angular/router';
import { StorageService }                                                                   from 'services/storage.service';

@Injectable()
export class AuthModuleGuard implements CanLoad, CanActivate
{
	constructor(
			private readonly storage: StorageService,
			private readonly router: Router
	)
	{}
	
	async canLoad(route: Route)
	{
		return true;
	}
	
	public async canActivate(
			route: ActivatedRouteSnapshot,
			state: RouterStateSnapshot
	): Promise<boolean>
	{
		return await this.storage.isLogged();
	}
}
