import {
	Component, ElementRef,
	OnInit, ViewChild
}                                from '@angular/core';
import { FormBuilder }           from '@angular/forms';
import { Router }                from '@angular/router';
import { MatDialog }             from '@angular/material/dialog';
import { TranslateService }      from '@ngx-translate/core';
import { Subject }               from 'rxjs';
import { first }                 from 'rxjs/operators';
import Invite                    from '@modules/server.common/entities/Invite';
import { InviteRequestRouter }   from '@modules/client.common.angular2/routers/invite-request-router.service';
import { InviteRouter }          from '@modules/client.common.angular2/routers/invite-router.service';
import { CustomerRouter }        from '@modules/client.common.angular2/routers/customer-router.service';
import { CustomerAuthRouter }    from '@modules/client.common.angular2/routers/customer-auth-router.service';
import { MessagePopUpComponent } from 'app/shared/message-pop-up/message-pop-up.component';
import { StorageService }        from 'app/services/storage';
import { styleVariables }        from 'styles/variables';
import { environment as env }    from 'environments/environment';

@Component({
	           selector:    'ea-code-confirmation',
	           styleUrls:   ['./code-confirmation.component.scss'],
	           templateUrl: './code-confirmation.component.html'
           })
export class CodeConfirmationComponent implements OnInit
{
	public readonly styleVariables: typeof styleVariables = styleVariables;
	
	public msgAllowGPS: string = 'TO_BE_INVITED_ALLOW_GPS';
	
	public confirmPopUpButton: string = 'OK';
	public commonPopUpText: string = 'WRONG_CODE_TRY_AGAIN';
	public modalTitleText: string = 'CONFIRMATION';
	
	public inviteAddress: string | null = null;
	public authLogo = env.AUTH_LOGO;
	
	public formControl = this.fb.group({
		                                   code: ['']
	                                   });
	private codeControl = this.formControl.get('code');
	
	private _ngDestroy$ = new Subject<void>();
	
	@ViewChild('codeRef', { read: ElementRef })
	private codeRef: ElementRef;
	
	constructor(
			private readonly router: Router,
			private readonly inviteRequestRouter: InviteRequestRouter,
			private readonly fb: FormBuilder,
			protected inviteRouter: InviteRouter,
			protected customerRouter: CustomerRouter,
			private translateService: TranslateService,
			private dialog: MatDialog,
			private customerAuthRouter: CustomerAuthRouter,
			private storageService: StorageService
	)
	{
		this.addressLoad();
	}
	
	public ngOnInit()
	{
		this.onCodeInputChange();
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public get code(): string
	{
		return this.codeControl.value;
	}
	
	public set code(value: string)
	{
		this.codeControl.setValue(value);
	}
	
	public get isInvited(): boolean
	{
		return (this.storageService.inviteRequestId && this.storageService.inviteRequestId.length > 0);
	}
	
	public openInvalidInviteCodeDialog(): void
	{
		this.dialog.open(MessagePopUpComponent, {
			width: '560px',
			data:  {
				modalTitle:    this.modalTitleText,
				confirmButton: this.confirmPopUpButton,
				commonText:    this.commonPopUpText,
			},
		});
	}
	
	public openMsgAllowGPSDialog(): void
	{
		this.commonPopUpText = 'TO_BE_INVITED_ALLOW_GPS';
		this.dialog.open(MessagePopUpComponent, {
			width: '560px',
			data:  {
				modalTitle:    this.modalTitleText,
				confirmButton: this.confirmPopUpButton,
				commonText:    this.commonPopUpText,
			},
		});
	}
	
	public loadByLocation()
	{
		this.router.navigate(['auth/by-location']);
	}
	
	private onCodeInputChange()
	{
		this.codeControl
		    .valueChanges
		    .subscribe((code) =>
		               {
			               if(this.code !== '')
			               {
				               if(code >= 1000 && code <= 9999)
				               {
					               this.onCodeInserted();
				               }
				               if(code > 9999)
				               {
					               this.code = `${this.codeControl.value}`.slice(4, 5);
				               }
			               }
		               });
	}
	
	private addressLoad()
	{
		if(this.storageService.inviteRequestId)
		{
			this.inviteRequestRouter
			    .get(this.storageService.inviteRequestId)
			    .subscribe((result) =>
			               {
				               const address = result['geoLocation']['streetAddress'];
				               const houseNumber = `${result['geoLocation']['house']}${
						               result['apartment'] !== '0'
						               ? '/' + result['apartment']
						               : ''
				               }`;
				               const city = result['geoLocation']['city'];
				               this.inviteAddress = `${address} ${houseNumber}, ${city}`;
			               });
		}
	}
	
	private async onCodeInserted()
	{
		this.codeRef.nativeElement.querySelector('input').readOnly = true;
		navigator.geolocation.getCurrentPosition(
				async({ coords }) =>
				{
					const [longitude, latitude] = [
						coords.longitude,
						coords.latitude,
					];
					const invite = await this.inviteRouter
					                         .getByCode({
						                                    location:   {
							                                    type:        'Point',
							                                    coordinates: [longitude, latitude],
						                                    },
						                                    inviteCode: this.codeControl.value,
					                                    })
					                         .pipe(first())
					                         .toPromise();
					this.codeRef
					    .nativeElement
					    .querySelector('input').readOnly = false;
					
					if(invite != null)
					{
						await this.register(invite);
					}
					else
					{
						this.openInvalidInviteCodeDialog();
						this.code = "";
					}
				},
				() =>
				{
					this.openMsgAllowGPSDialog();
					this.code = "";
				}
		);
	}
	
	private async register(invite: Invite)
	{
		const customerId = this.storageService.customerId;
		await this.customerRouter
		          .updateCustomer(customerId, {
			          apartment:               invite.apartment,
			          geoLocation:             invite.geoLocation,
			          isRegistrationCompleted: true
		          });
		this.storageService.customerId = customerId;
		this.storageService.inviteRequestId = null;
		await this.router.navigate(['products']);
	}
}
