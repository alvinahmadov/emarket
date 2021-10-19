import {
	Component,
	Input,
	ViewChild,
	ElementRef,
	OnInit,
	OnDestroy,
	AfterViewInit,
}                                from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	FormControl,
	AbstractControl,
}                                from '@angular/forms';
import { ActivatedRoute }        from '@angular/router';
import { TranslateService }      from '@ngx-translate/core';
import { Subject }               from 'rxjs';
import { first, debounceTime }   from 'rxjs/operators';
import 'rxjs/add/operator/debounceTime';
import { ICustomerCreateObject } from '@modules/server.common/interfaces/ICustomer';
import { CustomersService }      from '@app/@core/data/customers.service';
import { FormHelpers }           from '../../../forms/helpers';

export type CustomerBasicInfo = Pick<ICustomerCreateObject,
		'username' | 'firstName' | 'lastName' | 'email' | 'avatar'>;

@Component({
	           selector:    'ea-user-basic-info-form',
	           styleUrls:   ['./basic-info-form.component.scss'],
	           templateUrl: 'basic-info-form.component.html',
           })
export class BasicInfoFormComponent
		implements OnInit, OnDestroy, AfterViewInit
{
	private static _customersService: CustomersService;
	private static _customerId: string;
	
	@ViewChild('logoImagePreview')
	public logoImagePreview: ElementRef;
	
	@Input()
	public readonly form: FormGroup;
	
	@Input()
	public showBasicInfoLabel: boolean = false;
	
	public uploaderPlaceholder: string;
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			private translateService: TranslateService,
			private readonly _customersService: CustomersService,
			private readonly _route: ActivatedRoute
	)
	{
		const customerId = this._route.snapshot.paramMap.get('id');
		BasicInfoFormComponent.initialize(this._customersService, customerId);
	}
	
	public ngOnInit(): void
	{
		this.getUploaderPlaceholderText();
	}
	
	public ngAfterViewInit()
	{
		this._setupUserLogoUrlValidation();
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
		BasicInfoFormComponent.destroy();
	}
	
	public get username(): AbstractControl
	{
		return this.form.get('username');
	}
	
	public get firstName(): AbstractControl
	{
		return this.form.get('firstName');
	}
	
	public get lastName(): AbstractControl
	{
		return this.form.get('lastName');
	}
	
	public get avatar(): AbstractControl
	{
		return this.form.get('avatar');
	}
	
	public get showLogoMeta(): boolean
	{
		return this.avatar && this.avatar.value !== '';
	}
	
	public get email(): AbstractControl
	{
		return this.form.get('email');
	}
	
	public get password(): AbstractControl
	{
		return this.form.get('password');
	}
	
	public static initialize(customersService: CustomersService, customerId: string)
	{
		this._customersService = customersService;
		this._customerId = customerId;
	}
	
	public static destroy()
	{
		BasicInfoFormComponent._customersService = null;
		BasicInfoFormComponent._customerId = null;
	}
	
	public static buildForm(formBuilder: FormBuilder): FormGroup
	{
		const emailSearch$ = new Subject();
		let isSearchRdy = false;
		
		return formBuilder.group({
			                         password:  [
				                         null,
				                         [
					                         Validators.required,
					                         Validators.minLength(5)
				                         ],
			                         ],
			                         email:     [
				                         '',
				                         [
					                         Validators.required,
					                         Validators.email,
				                         ],
				                         async(ctrlEmail: FormControl) =>
				                         {
					                         if(!isSearchRdy)
					                         {
						                         emailSearch$
								                         .pipe(debounceTime(500))
								                         .subscribe(async() =>
								                                    {
									                                    const hasExistedEmail = await this._customersService
									                                                                      .isCustomerExists({
										                                                                                        exceptCustomerId: this._customerId,
										                                                                                        memberKey:        'email',
										                                                                                        memberValue:      ctrlEmail.value,
									                                                                                        })
									                                                                      .toPromise();
									
									                                    if(hasExistedEmail)
									                                    {
										                                    ctrlEmail.setErrors({ emailTaken: true });
									                                    }
								                                    });
						
						                         isSearchRdy = true;
					                         }
					
					                         if(
							                         isSearchRdy &&
							                         ctrlEmail.value &&
							                         ctrlEmail.value.length > 0
					                         )
					                         {
						                         emailSearch$.next();
					                         }
				                         },
			                         ],
			                         firstName: [''],
			                         lastName:  [''],
			                         avatar:    [''],
		                         });
	}
	
	public getValue(): CustomerBasicInfo
	{
		const basicInfo = this.form.getRawValue() as {
			email: string;
			firstName: string;
			lastName: string;
			avatar: string;
		};
		
		return {
			email:     basicInfo.email,
			username:  basicInfo.email,
			firstName: basicInfo.firstName ?? "",
			lastName:  basicInfo.lastName ?? "",
			avatar:    basicInfo.avatar ?? "https://via.placeholder.com/60x60"
		};
	}
	
	public setValue<T extends CustomerBasicInfo>(basicInfo: T)
	{
		FormHelpers.deepMark(this.form, 'dirty');
		
		const formValue = {
			email:     basicInfo.email ? basicInfo.email : '',
			firstName: basicInfo.firstName ? basicInfo.firstName : '',
			lastName:  basicInfo.lastName ? basicInfo.lastName : '',
			avatar:    basicInfo.avatar ? basicInfo.avatar : '',
		};
		
		this.form.setValue(formValue);
	}
	
	public deleteImg()
	{
		this.avatar.setValue('');
	}
	
	private _setupUserLogoUrlValidation()
	{
		this.logoImagePreview.nativeElement.onload = () =>
		{
			if(this.showLogoMeta)
			{
				this.avatar.setErrors(null);
			}
		};
		
		this.logoImagePreview.nativeElement.onerror = () =>
		{
			if(this.showLogoMeta)
			{
				this.avatar.setErrors({ invalidUrl: true });
			}
		};
	}
	
	private async getUploaderPlaceholderText()
	{
		this.uploaderPlaceholder = await this.translateService
		                                     .get('SHARED.USER.FORMS.BASIC_INFO.PICTURE_URL')
		                                     .pipe(first())
		                                     .toPromise();
	}
}
