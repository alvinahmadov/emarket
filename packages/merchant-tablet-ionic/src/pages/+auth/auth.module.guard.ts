import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot, RouterStateSnapshot,
	CanActivate, CanLoad, Route
}                     from '@angular/router';

@Injectable()
export class AuthModuleGuard implements CanLoad, CanActivate
{
	async canLoad(route: Route)
	{
		return true;
	}
	
	public async canActivate(
			route: ActivatedRouteSnapshot,
			state: RouterStateSnapshot
	): Promise<boolean>
	{
		return true;
	}
}
