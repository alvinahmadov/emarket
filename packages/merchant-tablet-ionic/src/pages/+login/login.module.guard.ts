import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Storage }                from 'services/storage.service';

@Injectable()
export class LoginModuleGuard implements CanLoad
{
	constructor(
			private readonly store: Storage,
			private readonly router: Router
	)
	{}
	
	async canLoad(route: Route)
	{
		return true;
	}
}
