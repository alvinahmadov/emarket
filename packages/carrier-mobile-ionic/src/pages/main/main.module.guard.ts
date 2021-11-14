import { Injectable }     from '@angular/core';
import { CanLoad, Route } from '@angular/router';

@Injectable()
export class MainModuleGuard implements CanLoad
{
	public async canLoad(route: Route)
	{
		return true;
	}
}
