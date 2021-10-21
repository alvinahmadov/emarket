import { Injectable }     from '@angular/core';
import {
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
}                         from '@angular/router';
import { StorageService } from 'app/services/storage';

@Injectable()
export class ProductsModuleGuard implements CanActivate
{
	constructor(
			private readonly router: Router,
			private readonly storage: StorageService
	)
	{}
	
	async canActivate(
			route: ActivatedRouteSnapshot,
			state: RouterStateSnapshot
	): Promise<boolean>
	{
		return true;
	}
}
