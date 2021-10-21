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
export class AuthGuard implements CanActivate
{
	constructor(
			private readonly router: Router,
			private readonly storage: StorageService
	)
	{}
	
	public async canActivate(
			route: ActivatedRouteSnapshot,
			state: RouterStateSnapshot
	): Promise<boolean>
	{
		const isLogged = await this.storage.isLogged();
		const isRegistrationEnabled = this.storage.registrationSystem === RegistrationSystem.Enabled;
		
		if(!isLogged && isRegistrationEnabled)
		{
			this.router.navigate(['login'])
			    .catch(err => console.error(err));
			return false;
		}
		
		return true;
	}
}
