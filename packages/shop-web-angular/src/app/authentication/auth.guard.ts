import { Injectable }     from '@angular/core';
import {
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
}                         from '@angular/router';
import { Store }          from 'app/services/store';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';

@Injectable()
export class AuthGuard implements CanActivate
{
	constructor(
			private readonly router: Router,
			private readonly store: Store
	)
	{}
	
	async canActivate(
			route: ActivatedRouteSnapshot,
			state: RouterStateSnapshot
	): Promise<boolean>
	{
		const isLogged = await this.store.isLogged();
		const isRegistrationEnabled = this.store.registrationSystem === RegistrationSystem.Enabled;
		
		if(!isLogged && isRegistrationEnabled)
		{
			await this.router.navigate(['auth']);
			return false;
		}
		
		return true;
	}
}
