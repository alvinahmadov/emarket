import { Injectable }             from '@angular/core';
import { Router, CanLoad, Route } from '@angular/router';
import { StorageService }         from 'services/storage.service';

@Injectable()
export class InfoModuleGuard implements CanLoad
{
	constructor(
			private readonly router: Router,
			private readonly storageService: StorageService
	)
	{}
	
	canLoad(route: Route): boolean
	{
		const showInformationPage = this.storageService.showInformationPage;
		if(!showInformationPage)
		{
			this.router.navigateByUrl('');
			return false;
		}
		
		return true;
	}
}
