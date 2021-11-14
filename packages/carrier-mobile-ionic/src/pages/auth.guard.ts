import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { StorageService }         from 'services/storage.service';

@Injectable()
export class AuthGuard implements CanLoad
{
	constructor(
			private readonly storageService: StorageService,
			private readonly router: Router
	)
	{}
	
	public async canLoad(route: Route)
	{
		const isLogged = await this.storageService.isLogged();
		if(!isLogged)
		{
			this.router.navigateByUrl('/login');
			return false;
		}
		return true;
	}
}
