import { Injectable }     from '@angular/core';
import {
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
}                         from '@angular/router';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import { StorageService } from 'app/services/storage';

@Injectable()
export class LoginModuleGuard implements CanActivate
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
		const id = route.firstChild['params'].id;
		if(
				this.storage.userId != null ||
				(this.storage.registrationSystem === RegistrationSystem.Disabled &&
				 !id)
		)
		{
			this.router
			    .navigate(['products'])
			    .catch(err => console.error(err));
			return false;
		}
		return true;
	}
}
