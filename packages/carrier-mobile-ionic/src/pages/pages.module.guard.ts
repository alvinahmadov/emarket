import { Injectable }             from '@angular/core';
import { Router, CanLoad, Route } from '@angular/router';
import { StorageService }         from 'services/storage.service';

@Injectable()
export class PagesModuleGuard implements CanLoad
{
	constructor(
			private readonly router: Router,
			private readonly storageService: StorageService
	)
	{}
	
	public async canLoad(route: Route)
	{
		const showInformationPage = this.storageService.showInformationPage;
		
		if(showInformationPage)
		{
			await this.router.navigateByUrl('/info');
			return false;
		}
		
		return true;
	}
}
