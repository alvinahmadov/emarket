import { Injectable }     from '@angular/core';
import {
	CanActivate,
	ActivatedRouteSnapshot,
	Router,
	RouterStateSnapshot,
}                         from '@angular/router';
import { StorageService } from '@app/@core/data/store.service';

@Injectable()
export class FakeDataModuleGuard implements CanActivate
{
	constructor(
			private readonly router: Router,
			private readonly storage: StorageService
	)
	{}
	
	canActivate(
			route: ActivatedRouteSnapshot,
			state: RouterStateSnapshot
	): boolean
	{
		const fakeDataGenerator = !!+this.storage.fakeDataGenerator;
		
		if(!fakeDataGenerator)
		{
			this.router.navigate(['/']);
			return false;
		}
		
		return true;
	}
}
