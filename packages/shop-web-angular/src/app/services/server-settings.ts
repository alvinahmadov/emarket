import { Injectable }         from '@angular/core';
import { InviteRouter }       from '@modules/client.common.angular2/routers/invite-router.service';
import { CustomerAuthRouter } from '@modules/client.common.angular2/routers/customer-auth-router.service';
import RegistrationSystem     from '@modules/server.common/enums/RegistrationSystem';
import { Store }              from './store';

@Injectable({
	            providedIn: 'root',
            })
export class ServerSettings
{
	constructor(
			private readonly inviteRouter: InviteRouter,
			private readonly userAuthRouter: CustomerAuthRouter,
			private readonly store: Store
	)
	{}
	
	load(): Promise<boolean>
	{
		return new Promise(async(resolve, reject) =>
		                   {
			                   if(
					                   !this.store.maintenanceMode &&
					                   Number(this.store.serverConnection) !== 0
			                   )
			                   {
				                   const inviteSystem = await this.inviteRouter.getInvitesSettings();
				                   const registrationSystem = await this.userAuthRouter.getRegistrationsSettings();
				
				                   this.store.inviteSystem = inviteSystem.isEnabled;
				                   this.store.registrationSystem = registrationSystem.registrationRequiredOnStart
				                                                   ? RegistrationSystem.Enabled
				                                                   : RegistrationSystem.Disabled;
			                   }
			
			                   resolve(true);
		                   });
	}
}
