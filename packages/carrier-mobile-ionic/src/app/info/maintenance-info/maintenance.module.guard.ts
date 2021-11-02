import { Injectable }      from '@angular/core';
import { Router, CanLoad } from '@angular/router';
import { StorageService }  from 'services/storage.service';

@Injectable()
export class MaintenanceModuleGuard implements CanLoad
{
	constructor(
			private readonly router: Router,
			private readonly storageService: StorageService
	)
	{}
	
	canLoad(): boolean
	{
		const maintenanceMode = this.storageService.maintenanceMode;
		if(!maintenanceMode)
		{
			this.router.navigateByUrl('info/server-down');
			return false;
		}
		
		return true;
	}
}
