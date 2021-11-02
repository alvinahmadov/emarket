import { Router, CanLoad } from '@angular/router';
import { Injectable }      from '@angular/core';
import { StorageService }  from 'services/storage.service';

@Injectable()
export class NoInternetModuleGuard implements CanLoad
{
	constructor(
			private readonly router: Router,
			private readonly storageService: StorageService
	)
	{}
	
	canLoad(): boolean
	{
		if(!this.storageService.noInternet)
		{
			this.router.navigate(['']);
			return false;
		}
		return true;
	}
}
