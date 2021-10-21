import { Injectable }     from '@angular/core';
import { InviteRouter }   from '@modules/client.common.angular2/routers/invite-router.service';
import { CustomerRouter } from '@modules/client.common.angular2/routers/customer-router.service';
import Invite             from '@modules/server.common/entities/Invite';

@Injectable()
export class AuthenticationService
{
	constructor(
			private readonly customerRouter: CustomerRouter,
			private readonly inviteRouter: InviteRouter
	)
	{}
	
	login(invite: Invite): void {}
}
