import { Component }          from '@angular/core';
import { ILocation }          from '@modules/server.common/interfaces/IGeoLocation';
import { InviteRouter }       from '@modules/client.common.angular2/routers/invite-router.service';
import { CustomerAuthRouter } from '@modules/client.common.angular2/routers/customer-auth-router.service';
import { ToasterService }     from 'angular2-toaster';
import { NgbActiveModal }     from '@ng-bootstrap/ng-bootstrap';
import { first }              from 'rxjs/operators';

@Component({
	           templateUrl: './by-code-modal.component.html',
           })
export class ByCodeModalComponent
{
	public code: number;
	public location: ILocation;
	
	constructor(
			private readonly inviteRouter: InviteRouter,
			private readonly customerAuthRouter: CustomerAuthRouter,
			private readonly toasterService: ToasterService,
			private readonly activeModal: NgbActiveModal
	)
	{}
	
	public closeModal()
	{
		this.activeModal.close();
	}
	
	public async login()
	{
		if(this.code > 999 && this.code < 10000 && this.location)
		{
			try
			{
				const invite = await this.inviteRouter
				                         .getByCode({
					                                    location:   this.location,
					                                    inviteCode: this.code.toString(),
				                                    })
				                         .pipe(first())
				                         .toPromise();
				
				if(invite)
				{
					const customer = await this.customerAuthRouter
					                       .register({
						                                 user: {
							                                 // TODO: Get username and email
							                                 username:    "",
							                                 email:       "",
							                                 apartment:   invite.apartment,
							                                 geoLocation: invite.geoLocation,
						                                 },
					                                 });
					this.toasterService.pop(
							'success',
							`Successful logen with code`
					);
					this.activeModal.close(customer);
				}
				else
				{
					this.invalidCodeToaster();
				}
			} catch(error)
			{
				this.toasterService.pop('error', `Error: "${error.message}"`);
			}
		}
		else
		{
			this.invalidCodeToaster();
		}
	}
	
	private invalidCodeToaster()
	{
		this.toasterService.pop('error', `Invalid code.`);
	}
}
