import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { StorageService }         from 'services/storage.service';

@Injectable()
export class WarehouseModuleGuard implements CanLoad
{
	constructor(
			private readonly storageService: StorageService,
			private readonly router: Router
	)
	{}
	
	public async canLoad(route: Route): Promise<boolean>
	{
		const isLogged = await this.storageService.isLogged();
		if(!isLogged)
		{
			this.router.navigateByUrl('/auth');
			return false;
		}
		return true;
	}
}
