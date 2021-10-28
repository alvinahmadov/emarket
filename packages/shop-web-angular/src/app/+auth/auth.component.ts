import {
	Component,
	OnInit,
	OnDestroy,
}                                from '@angular/core';
import {
	FormControl,
	FormGroupDirective,
	NgForm,
	FormBuilder,
	AbstractControl,
	Validators,
}                                from '@angular/forms';
import { ErrorStateMatcher }     from '@angular/material/core';
import { MatDialog }             from '@angular/material/dialog';
import { Router }                from '@angular/router';
import { TranslateService }      from '@ngx-translate/core';
import { Subject }               from 'rxjs';
import { CustomerRouter }        from '@modules/client.common.angular2/routers/customer-router.service';
import { CustomerAuthRouter }    from '@modules/client.common.angular2/routers/customer-auth-router.service';
import { InviteRouter }          from '@modules/client.common.angular2/routers/invite-router.service';
import { InviteRequestRouter }   from '@modules/client.common.angular2/routers/invite-request-router.service';
import { ToolbarController }     from 'app/app.component';
import { StorageService }        from 'app/services/storage';
import { MessagePopUpComponent } from 'app/shared/message-pop-up/message-pop-up.component';
import { environment as env }    from 'environments/environment';
import { styleVariables }        from 'styles/variables';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher
{
	isErrorState(
			control: FormControl | null,
			form: FormGroupDirective | NgForm | null
	): boolean
	{
		const isSubmitted = form && form.submitted;
		return !!(
				control &&
				control.invalid &&
				(control.dirty || control.touched || isSubmitted)
		);
	}
}

@Component({
	           selector:    'auth',
	           styleUrls:   ['./auth.component.scss'],
	           templateUrl: './auth.component.html',
           })
export class AuthComponent implements ToolbarController, OnInit, OnDestroy
{
	public readonly endpoints = {
		http:  env.HTTP_SERVICES_ENDPOINT,
		https: env.HTTPS_SERVICES_ENDPOINT
	}
	public readonly authUrl = {
		yandex:    env.YANDEX_APP_URL,
		google:    env.GOOGLE_APP_URL,
		facebook:  env.FACEBOOK_APP_URL,
		vkontakte: env.VKONTAKTE_APP_URL
	}
	public readonly styleVariables: typeof styleVariables = styleVariables;
	
	public msgAllowGPS: string = 'TO_BE_INVITED_ALLOW_GPS';
	
	public confirmPopUpButton: string = 'OK';
	public commonPopUpText: string = 'WRONG_CODE_TRY_AGAIN';
	public modalTitleText: string = 'CONFIRMATION';
	
	public readonly toolbarDisabled = true;
	
	public formControl = this.fb.group({
		                                   email:    ['', Validators.required],
		                                   password: ['', Validators.required]
	                                   });
	
	public matcher = new MyErrorStateMatcher();
	public inviteAddress: string | null = null;
	public authLogo = env.AUTH_LOGO;
	
	private emailControl: AbstractControl = this.formControl.get('email');
	private passwordControl: AbstractControl = this.formControl.get('password');
	
	private _ngDestroy$ = new Subject<void>();
	
	public hasError: boolean = false;
	
	constructor(
			private readonly router: Router,
			private readonly inviteRequestRouter: InviteRequestRouter,
			private readonly fb: FormBuilder,
			protected inviteRouter: InviteRouter,
			protected customerRouter: CustomerRouter,
			private customerAuthRouter: CustomerAuthRouter,
			private translateService: TranslateService,
			private dialog: MatDialog,
			private storage: StorageService
	)
	{}
	
	public ngOnInit()
	{}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public get email(): string
	{
		return this.emailControl.value;
	}
	
	public set email(value: string)
	{
		this.emailControl.setValue(value);
	}
	
	public get password(): string
	{
		return this.passwordControl.value;
	}
	
	public set password(value: string)
	{
		this.passwordControl.setValue(value);
	}
	
	public get hasEmailErrors(): boolean
	{
		return (this.emailControl.errors &&
		        (this.emailControl.dirty || this.emailControl.touched));
	}
	
	public hasEmailError(code: string): boolean
	{
		return this.emailControl.hasError(code)
	}
	
	public get isInvited(): boolean
	{
		return (this.storage.inviteRequestId && this.storage.inviteRequestId.length > 0);
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
	
	public getTranslate(key: string): string
	{
		let translationResult = '';
		this.translateService.get(key).subscribe((res) => translationResult = res);
		return translationResult;
	}
	
	public async login()
	{
		const response = await this.customerAuthRouter
		                           .login(this.email,
		                                  this.password);
		
		if(!response || !!response.user)
		{
			this.hasError = true;
			setTimeout(() => this.hasError = false, 2500);
			return;
		}
		this.storage.userId = response.user.id;
		this.storage.token = response.token;
		await this.router.navigate(['products']);
	}
}
