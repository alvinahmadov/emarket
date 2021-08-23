import { Injectable }             from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store }                  from '../../services/store.service';

@Injectable()
export class WarehouseModuleGuard implements CanLoad
{
	constructor(
			private readonly store: Store,
			private readonly router: Router
	)
	{}
	
	async canLoad(route: Route)
	{
		const isLogged = await this.store.isLogged();
		
		const token = this.store.token;
		
		if(!isLogged)
		{
			await this.router.navigateByUrl('/auth');
			return false;
		}
		return true;
	}
}
