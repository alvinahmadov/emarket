import { Router, CanLoad } from '@angular/router';
import { Injectable }      from '@angular/core';
import { StorageService }  from 'services/storage.service';

@Injectable()
export class ServerDownModuleGuard implements CanLoad
{
	constructor(
			private readonly router: Router,
			private readonly storageService: StorageService
	)
	{}
	
	canLoad(): boolean
	{
		const serverDown = Number(this.storageService.serverConnection) === 0;
		if(!serverDown)
		{
			this.router.navigate(['']);
			return false;
		}
		return true;
	}
}
