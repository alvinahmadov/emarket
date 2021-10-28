import { Injectable }         from '@angular/core';
import RegistrationSystem     from '@modules/server.common/enums/RegistrationSystem';
import { InviteRouter }       from '@modules/client.common.angular2/routers/invite-router.service';
import { CustomerAuthRouter } from '@modules/client.common.angular2/routers/customer-auth-router.service';
import { StorageService }     from './storage';

@Injectable({
	            providedIn: 'root',
            })
export class ServerSettings
{
	constructor(
			private readonly inviteRouter: InviteRouter,
			private readonly customerAuthRouter: CustomerAuthRouter,
			private readonly storageService: StorageService
	)
	{}
	
	public load(): Promise<boolean>
	{
		return new Promise(async(resolve) =>
		                   {
			                   if(
					                   !this.storageService.maintenanceMode &&
					                   Number(this.storageService.serverConnection) !== 0
			                   )
			                   {
				                   const inviteSystem = await this.inviteRouter.getInvitesSettings();
				                   const registrationSystem = await this.customerAuthRouter.getRegistrationsSettings();
				
				                   this.storageService.inviteSystem = inviteSystem.isEnabled;
				                   this.storageService.registrationSystem = registrationSystem.registrationRequiredOnStart
				                                                            ? RegistrationSystem.Enabled
				                                                            : RegistrationSystem.Disabled;
			                   }
			
			                   resolve(true);
		                   });
	}
}
