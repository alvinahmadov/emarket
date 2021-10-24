import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { StorageService }         from 'services/storage.service';

@Injectable()
export class AuthModuleGuard implements CanLoad
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
}
