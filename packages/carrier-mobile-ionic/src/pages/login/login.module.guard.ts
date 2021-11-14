// noinspection ES6MissingAwait

import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { StorageService }         from 'services/storage.service';

@Injectable()
export class LoginModuleGuard implements CanLoad
{
	constructor(
			private readonly storageService: StorageService,
			private readonly router: Router
	)
	{}
	
	async canLoad(route: Route)
	{
		const isLogged = await this.storageService.isLogged();
		if(isLogged)
		{
			this.router.navigateByUrl('main');
			return false;
		}
		return true;
	}
}
