import { Injectable }     from '@angular/core';
import {
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
}                         from '@angular/router';

@Injectable()
export class WarehousesModuleGuard implements CanActivate
{
	canActivate(
			route: ActivatedRouteSnapshot,
			state: RouterStateSnapshot
	): boolean
	{
		return true;
	}
}
